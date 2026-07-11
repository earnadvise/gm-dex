"use client";

import { useState, useEffect } from "react";

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window
    ) {
      setIsSupported(true);
      setPermission(Notification.permission);

      navigator.serviceWorker.ready.then((registration) => {
        registration.pushManager.getSubscription().then((sub) => {
          setSubscription(sub);
          setIsLoading(false);
        });
      });
    } else {
      setIsLoading(false);
    }
  }, []);

  const subscribe = async () => {
    if (!isSupported) return;

    try {
      setIsLoading(true);
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm !== "granted") {
        setIsLoading(false);
        throw new Error("Notification permission denied");
      }

      const registration = await navigator.serviceWorker.ready;
      
      // Get VAPID public key from env
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        throw new Error("VAPID public key not found in env configuration");
      }

      // Convert VAPID key to UInt8Array
      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey,
      });

      setSubscription(sub);

      // Save subscription in API backend database
      await fetch("/api/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "subscribe", subscription: sub }),
      });

      setIsLoading(false);
      return sub;
    } catch (e) {
      console.error("Failed to subscribe to push notifications:", e);
      setIsLoading(false);
      throw e;
    }
  };

  const unsubscribe = async () => {
    if (!subscription) return;

    try {
      setIsLoading(true);
      await subscription.unsubscribe();
      
      // Remove subscription from API backend
      await fetch("/api/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "unsubscribe", subscription }),
      });

      setSubscription(null);
      setIsLoading(false);
    } catch (e) {
      console.error("Failed to unsubscribe:", e);
      setIsLoading(false);
    }
  };

  const sendTestNotification = async () => {
    if (!subscription) return;
    try {
      await fetch("/api/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "trigger", subscription }),
      });
    } catch (e) {
      console.error("Failed to trigger test notification:", e);
    }
  };

  return {
    isSupported,
    isSubscribed: !!subscription,
    permission,
    isLoading,
    subscribe,
    unsubscribe,
    sendTestNotification,
  };
}

// Utility function to convert base64 VAPID key
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
