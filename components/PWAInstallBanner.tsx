"use client";

import { useState, useEffect } from "react";
import { Download, X, Share, PlusSquare, Sparkles } from "lucide-react";

export function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    // Check if user previously dismissed
    const dismissed = localStorage.getItem("gm_dex_pwa_dismissed");
    if (dismissed === "true") return;

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const iosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone;

    if (iosDevice && !isStandalone) {
      setIsIOS(true);
      setIsDismissed(false);
    }

    // Detect Android / Chrome Install Prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsDismissed(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsDismissed(true);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIOSModal(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem("gm_dex_pwa_dismissed", "true");
  };

  if (isDismissed) return null;

  return (
    <>
      {/* Floating PWA Install Banner */}
      <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-[90] bg-[#0c1222]/95 border border-[#01C38E]/30 rounded-3xl p-4 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-3 text-white animate-bounce-short">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#01C38E]/20 border border-[#01C38E]/40 flex items-center justify-center shrink-0">
            <img src="/logo.png" alt="GM DEX" className="w-8 h-8 rounded-xl object-cover" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
            <Sparkles className="h-6 w-6 text-[#01C38E]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm">Install GM DEX App</span>
              <span className="text-[9px] bg-[#01C38E] text-black font-black px-1.5 py-0.5 rounded">PWA</span>
            </div>
            <p className="text-xs text-zinc-400">Fast, full-screen mobile trading on Base</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleInstallClick}
            className="px-3.5 py-2 bg-[#01C38E] hover:bg-[#00ab7c] text-white font-extrabold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-lg shadow-[#01C38E]/20 shrink-0 cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" /> Install
          </button>
          <button
            onClick={handleDismiss}
            className="p-1.5 text-zinc-500 hover:text-white rounded-lg transition-colors cursor-pointer"
            title="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* iOS Installation Instructions Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowIOSModal(false)} />
          <div className="relative bg-[#0c1222] border border-white/10 rounded-3xl p-6 max-w-xs w-full text-white shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-base">Install on iPhone / iPad</h3>
              <button onClick={() => setShowIOSModal(false)} className="p-1 hover:bg-white/10 rounded-lg">
                <X className="h-4 w-4 text-zinc-400" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-zinc-300">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
                <Share className="h-5 w-5 text-[#01C38E] shrink-0" />
                <span>1. Tap the <strong>Share</strong> button in Safari toolbar.</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
                <PlusSquare className="h-5 w-5 text-[#01C38E] shrink-0" />
                <span>2. Scroll down and tap <strong>Add to Home Screen</strong>.</span>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full mt-5 py-2.5 bg-[#01C38E] text-white font-bold text-xs rounded-xl"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
