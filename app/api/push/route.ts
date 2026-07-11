import { NextResponse } from "next/server";
import webpush from "web-push";
import fs from "fs";
import path from "path";

const cacheDir = path.resolve(process.cwd(), "cache");
const subscriptionsPath = path.join(cacheDir, "push_subscriptions.json");

// Ensure VAPID is configured
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(
    "mailto:admin@gmdex.xyz",
    vapidPublicKey,
    vapidPrivateKey
  );
} else {
  console.warn("VAPID keys not configured. Push notifications will not function.");
}

function getSubscriptions(): any[] {
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }
  
  if (!fs.existsSync(subscriptionsPath)) {
    fs.writeFileSync(subscriptionsPath, "[]", "utf8");
    return [];
  }
  
  try {
    const data = fs.readFileSync(subscriptionsPath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading subscriptions:", error);
    return [];
  }
}

function saveSubscriptions(subscriptions: any[]) {
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }
  fs.writeFileSync(subscriptionsPath, JSON.stringify(subscriptions, null, 2), "utf8");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, subscription } = body;

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json({ error: "Invalid subscription data" }, { status: 400 });
    }

    const subscriptions = getSubscriptions();

    if (action === "subscribe") {
      // Check if already subscribed
      const exists = subscriptions.some(sub => sub.endpoint === subscription.endpoint);
      if (!exists) {
        subscriptions.push(subscription);
        saveSubscriptions(subscriptions);
      }
      return NextResponse.json({ success: true, message: "Subscribed successfully" });
    } 
    
    if (action === "unsubscribe") {
      const filtered = subscriptions.filter(sub => sub.endpoint !== subscription.endpoint);
      saveSubscriptions(filtered);
      return NextResponse.json({ success: true, message: "Unsubscribed successfully" });
    }

    if (action === "trigger") {
      if (!vapidPublicKey || !vapidPrivateKey) {
        return NextResponse.json({ error: "Push notifications not configured on server" }, { status: 500 });
      }

      const payload = JSON.stringify({
        title: "Daily GM Reminder ☀️",
        body: "It's time to say GM and keep your streak alive on GM DEX!"
      });

      await webpush.sendNotification(subscription, payload);
      return NextResponse.json({ success: true, message: "Push notification triggered" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("API error in push notification route:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
