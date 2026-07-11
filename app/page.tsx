"use client";

import { useState, useEffect, useRef } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useGMStreak } from "@/hooks/useGMStreak";
import { useGMBadge } from "@/hooks/useGMBadge";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { GM_STREAK_ADDRESS } from "@/lib/contracts";
import { SUPPORTED_TOKENS } from "@/lib/tokens";
import { 
  Flame, 
  Award, 
  Trophy, 
  Bell, 
  Sun, 
  Zap, 
  Sparkles, 
  Clock, 
  Lock, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRightLeft,
  ChevronRight,
  Info,
  User
} from "lucide-react";

// ─── Custom Wallet Button (works with MetaMask, Coinbase, Rabby, etc.) ───────
function WalletButton() {
  const { address, isConnected } = useAccount();
  const { connectors, connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [showModal, setShowModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const short = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "";

  if (isConnected) {
    return (
      <div className="relative" ref={dropRef}>
        <button
          onClick={() => setShowDropdown(v => !v)}
          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-full px-4 py-2 transition-all duration-200"
        >
          <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-[#0052ff] to-[#ffd700] flex items-center justify-center">
            <User className="h-3 w-3 text-white" />
          </div>
          <span className="text-sm">{short}</span>
        </button>
        {showDropdown && (
          <div className="absolute right-0 mt-2 w-48 bg-[#0c0d12] border border-white/10 rounded-2xl shadow-xl z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10">
              <p className="text-xs text-zinc-500">Connected</p>
              <p className="text-sm text-white font-mono mt-0.5">{short}</p>
            </div>
            <button
              onClick={() => { disconnect(); setShowDropdown(false); }}
              className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-white/5 transition-colors"
            >
              Disconnect
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="bg-[#0052ff] hover:bg-[#0045d8] text-white font-semibold rounded-full px-5 py-2.5 transition-all duration-200 shadow-lg shadow-[#0052ff]/30"
      >
        Connect Wallet
      </button>

      {/* Wallet Picker Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="relative bg-[#0c0d12] border border-white/10 rounded-3xl shadow-2xl w-full max-w-sm p-6">
            <h2 className="text-lg font-bold text-white mb-1">Connect Wallet</h2>
            <p className="text-sm text-zinc-500 mb-5">Choose your wallet to get started</p>
            <div className="flex flex-col gap-3">
              {connectors.map((connector) => (
                <button
                  key={connector.uid}
                  disabled={isPending}
                  onClick={() => {
                    connect({ connector });
                    setShowModal(false);
                  }}
                  className="flex items-center gap-4 w-full p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-2xl transition-all duration-200 group"
                >
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#0052ff]/20 to-[#ffd700]/20 border border-white/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">
                      {connector.name.toLowerCase().includes("coinbase") ? "🔵" :
                       connector.name.toLowerCase().includes("metamask") ? "🦊" :
                       connector.name.toLowerCase().includes("brave") ? "🦁" :
                       "🔗"}
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="text-white font-semibold text-sm">{connector.name}</p>
                    <p className="text-zinc-500 text-xs">
                      {connector.name.toLowerCase().includes("coinbase") ? "Smart Wallet or EOA" :
                       connector.name.toLowerCase().includes("metamask") ? "Browser extension" :
                       "Browser extension"}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-zinc-400 ml-auto transition-colors" />
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="mt-4 w-full text-sm text-zinc-500 hover:text-zinc-300 transition-colors py-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// Mock badges SVG generator for Demo Mode
function getMockBadgeSVG(name: string, days: number, color: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
    <defs>
      <radialGradient id="glow-${days}" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${color}" stop-opacity="0.4"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="metal-${days}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.6"/>
        <stop offset="50%" stop-color="${color}"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="0.8"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="#0A0B10" rx="20"/>
    <circle cx="200" cy="200" r="150" fill="url(#glow-${days})"/>
    <circle cx="200" cy="200" r="110" fill="none" stroke="url(#metal-${days})" stroke-width="8"/>
    <text x="200" y="170" font-family="system-ui, sans-serif" font-size="56" font-weight="900" fill="${color}" text-anchor="middle">GM</text>
    <text x="200" y="220" font-family="system-ui, sans-serif" font-size="16" font-weight="bold" fill="#A0A5B5" text-anchor="middle">STREAK</text>
    <text x="200" y="260" font-family="system-ui, sans-serif" font-size="28" font-weight="900" fill="#FFFFFF" text-anchor="middle">${days} DAYS</text>
    <circle cx="200" cy="200" r="125" fill="none" stroke="#252835" stroke-dasharray="8 12" stroke-width="2"/>
  </svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

const BADGES_CONFIG = [
  { id: 0, requiredStreak: 7, name: "GM Bronze Streak", color: "#CD7F32", desc: "Awarded for keeping a 7-day GM streak." },
  { id: 1, requiredStreak: 30, name: "GM Silver Streak", color: "#C0C0C0", desc: "Awarded for keeping a 30-day GM streak." },
  { id: 2, requiredStreak: 100, name: "GM Gold Streak", color: "#FFD700", desc: "Awarded for keeping a 100-day GM streak." },
  { id: 3, requiredStreak: 365, name: "GM Diamond Streak", color: "#E0F7FA", desc: "Awarded for keeping a 365-day GM streak." },
];

export default function Home() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<"gm" | "swap">("gm");
  
  // Real contract hooks
  const isRealContract = GM_STREAK_ADDRESS !== "0x0000000000000000000000000000000000000000";
  const contractStreak = useGMStreak();
  const contractBadges = useGMBadge();
  
  // Push Notifications hook
  const {
    isSupported: isPushSupported,
    isSubscribed,
    isLoading: isPushLoading,
    subscribe: subscribePush,
    unsubscribe: unsubscribePush,
    sendTestNotification
  } = usePushNotifications();

  // Local/Demo Mode state (activated if not connected or isRealContract is false)
  const [demoStreak, setDemoStreak] = useState({
    currentStreak: 0,
    longestStreak: 0,
    lastGMTime: 0,
    totalGMs: 0,
    xp: 0
  });
  const [demoCooldownTimeLeft, setDemoCooldownTimeLeft] = useState("");
  const [isDemoCooldown, setIsDemoCooldown] = useState(false);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([]);
  const [showNotificationBadge, setShowNotificationBadge] = useState(false);

  // Custom Uniswap Swap state
  const [swapAmount, setSwapAmount] = useState<string>("");
  const [swapInputToken, setSwapInputToken] = useState(SUPPORTED_TOKENS[0]); // ETH
  const [swapOutputToken, setSwapOutputToken] = useState(SUPPORTED_TOKENS[1]); // USDC
  const [showInputDropdown, setShowInputDropdown] = useState(false);
  const [showOutputDropdown, setShowOutputDropdown] = useState(false);

  // Initialize and load demo state from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(`gm_demo_streak_${address || "anonymous"}`);
      if (stored) {
        setDemoStreak(JSON.parse(stored));
      } else {
        setDemoStreak({
          currentStreak: 0,
          longestStreak: 0,
          lastGMTime: 0,
          totalGMs: 0,
          xp: 0
        });
      }
    }
  }, [address]);

  // Demo Cooldown Timer
  useEffect(() => {
    if (demoStreak.lastGMTime === 0) {
      setIsDemoCooldown(false);
      setDemoCooldownTimeLeft("");
      return;
    }

    const cooldownPeriod = 23 * 60 * 60; // 23 hours in seconds
    const nextGMTime = demoStreak.lastGMTime + cooldownPeriod;

    const updateTimer = () => {
      const currentSeconds = Math.floor(Date.now() / 1000);
      const diff = nextGMTime - currentSeconds;

      if (diff <= 0) {
        setIsDemoCooldown(false);
        setDemoCooldownTimeLeft("");
      } else {
        setIsDemoCooldown(true);
        const hours = Math.floor(diff / 3600);
        const minutes = Math.floor((diff % 3600) / 60);
        const seconds = diff % 60;
        setDemoCooldownTimeLeft(
          `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
        );
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [demoStreak.lastGMTime]);

  // Handle Say GM in Demo Mode
  const handleSayGMDemo = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isDemoCooldown) return;

    // Trigger button explosion particles
    const newParticles = [];
    const rect = e.currentTarget.getBoundingClientRect();
    for (let i = 0; i < 15; i++) {
      newParticles.push({
        id: Date.now() + i,
        x: Math.random() * rect.width - rect.width / 2,
        y: Math.random() * rect.height - rect.height / 2
      });
    }
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 800);

    const currentTime = Math.floor(Date.now() / 1000);
    let newStreakCount = 1;

    // Keep streak if within 48 hours
    if (demoStreak.lastGMTime > 0 && currentTime <= demoStreak.lastGMTime + 48 * 3600) {
      newStreakCount = demoStreak.currentStreak + 1;
    }

    const streakBonus = (newStreakCount * 5) > 100 ? 100 : (newStreakCount * 5);
    const xpAwarded = 10 + streakBonus;

    const updated = {
      currentStreak: newStreakCount,
      longestStreak: Math.max(demoStreak.longestStreak, newStreakCount),
      lastGMTime: currentTime,
      totalGMs: demoStreak.totalGMs + 1,
      xp: demoStreak.xp + xpAwarded
    };

    setDemoStreak(updated);
    localStorage.setItem(`gm_demo_streak_${address || "anonymous"}`, JSON.stringify(updated));
    setShowNotificationBadge(true);
  };

  // Reset/Skip cooldown for easy local testing
  const handleSkipCooldown = () => {
    const updated = { ...demoStreak, lastGMTime: 0 };
    setDemoStreak(updated);
    localStorage.setItem(`gm_demo_streak_${address || "anonymous"}`, JSON.stringify(updated));
  };

  // Determine current active stats
  const activeStats = isRealContract && isConnected
    ? {
        currentStreak: contractStreak.currentStreak,
        longestStreak: contractStreak.longestStreak,
        totalGMs: contractStreak.totalGMs,
        xp: contractStreak.xp,
        isCooldown: contractStreak.isGMCooldown,
        cooldownText: contractStreak.cooldownTimeLeft,
        sayGM: () => {}, // Handled by OnchainKit transaction components, or writeTransaction
        refetch: contractStreak.refetch
      }
    : {
        currentStreak: demoStreak.currentStreak,
        longestStreak: demoStreak.longestStreak,
        totalGMs: demoStreak.totalGMs,
        xp: demoStreak.xp,
        isCooldown: isDemoCooldown,
        cooldownText: demoCooldownTimeLeft,
        sayGM: handleSayGMDemo,
        refetch: () => {}
      };

  // Determine badges state
  const badges = BADGES_CONFIG.map(config => {
    let owned = false;
    let image = "";

    if (isRealContract && isConnected) {
      const realBadge = contractBadges.badges.find(b => b.id === config.id);
      owned = !!realBadge?.owned;
      image = realBadge?.image || "";
    } else {
      owned = activeStats.currentStreak >= config.requiredStreak;
      image = getMockBadgeSVG(config.name, config.requiredStreak, config.color);
    }

    return {
      ...config,
      owned,
      image
    };
  });

  interface LeaderboardItem {
    address: string;
    currentStreak: number;
    xp: number;
    isUser?: boolean;
  }

  // Mock Leaderboard users
  const baseLeaderboard: LeaderboardItem[] = [
    { address: "0x4386...7f89", currentStreak: 124, xp: 6840 },
    { address: "0x91da...f232", currentStreak: 89, xp: 4890 },
    { address: "0x3e18...1b0a", currentStreak: 45, xp: 2475 },
    { address: "0xa6f0...8cd2", currentStreak: 32, xp: 1760 },
    { address: "0x78ab...e0e1", currentStreak: 21, xp: 1155 },
    { address: "0xc831...f903", currentStreak: 18, xp: 990 },
    { address: "0x2da8...9a0e", currentStreak: 12, xp: 660 },
    { address: "0x510f...7b1a", currentStreak: 8, xp: 440 },
    { address: "0xb772...d54c", currentStreak: 6, xp: 330 },
  ];

  // Insert current user into leaderboard
  const userAddressText = address 
    ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}` 
    : "You (Demo)";
  const userRankItem: LeaderboardItem = { 
    address: userAddressText, 
    currentStreak: activeStats.currentStreak, 
    xp: activeStats.xp,
    isUser: true 
  };
  
  const leaderboard = [...baseLeaderboard, userRankItem]
    .sort((a, b) => b.xp - a.xp)
    .slice(0, 10);

  return (
    <div className="flex flex-col min-h-screen bg-[#06070a] text-[#f4f6fa] relative overflow-hidden font-sans">
      {/* Background glowing rings */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />

      {/* Header navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#06070a]/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#0052ff] to-[#ffd700] p-[2px] shadow-lg shadow-[#0052ff]/20">
              <div className="h-full w-full rounded-[10px] bg-[#06070a] flex items-center justify-center">
                <Sun className="h-5 w-5 text-[#ffd700] animate-pulse" />
              </div>
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-[#f4f6fa] to-zinc-400 bg-clip-text text-transparent">
                GM <span className="text-[#0052ff]">DEX</span>
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-medium bg-white/5 border border-white/10 rounded-full text-zinc-400">
                Base
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Wallet Button — works with MetaMask, Coinbase, Rabby, etc. */}
            <WalletButton />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        


        {/* Tab Selector */}
        <div className="flex bg-white/5 p-1 rounded-xl w-fit self-center border border-white/5">
          <button
            onClick={() => setActiveTab("gm")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeTab === "gm"
                ? "bg-[#0052ff] text-white shadow-lg shadow-[#0052ff]/20"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Sun className="h-4 w-4" />
            Daily GM Streak
          </button>
          <button
            onClick={() => setActiveTab("swap")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeTab === "swap"
                ? "bg-[#0052ff] text-white shadow-lg shadow-[#0052ff]/20"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <ArrowRightLeft className="h-4 w-4" />
            Token Swap
          </button>
        </div>

        {/* TAB CONTENT: GM STREAK */}
        {activeTab === "gm" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left: GM Button & Stats */}
            <div className="lg:col-span-2 flex flex-col gap-8">
              {/* GM Action Card */}
              <div className="glassmorphism rounded-3xl p-8 relative overflow-hidden flex flex-col items-center text-center glow-card">
                <div className="absolute top-0 right-0 p-6 flex gap-2">
                  {!isRealContract && activeStats.isCooldown && (
                    <button 
                      onClick={handleSkipCooldown}
                      className="text-xs px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                    >
                      Skip Cooldown (Debug)
                    </button>
                  )}
                </div>

                <h2 className="text-2xl font-bold mb-2">Claim Your Daily GM</h2>
                <p className="text-zinc-400 text-sm max-w-sm mb-8">
                  Say GM once every 24 hours to grow your streak, earn XP, and unlock exclusive onchain badges.
                </p>

                {/* Sun Button / Cooldown Circle */}
                <div className="relative mb-8 select-none">
                  {/* Glowing Particle Effects */}
                  {particles.map(p => (
                    <div
                      key={p.id}
                      className="absolute w-2 h-2 rounded-full bg-gradient-to-r from-[#ffd700] to-orange-500 animate-ping"
                      style={{
                        transform: `translate(${p.x}px, ${p.y}px)`,
                        transition: "all 0.8s ease-out",
                        opacity: 0,
                        top: "50%",
                        left: "50%"
                      }}
                    />
                  ))}
                  
                  {activeStats.isCooldown ? (
                    <div className="w-48 h-48 rounded-full border-4 border-white/5 flex flex-col items-center justify-center bg-[#0d0e15] shadow-inner relative">
                      <Clock className="h-10 w-10 text-[#0052ff] mb-2 animate-pulse" />
                      <span className="text-sm font-medium text-zinc-500">Cooldown Active</span>
                      <span className="text-xl font-bold font-mono text-[#f4f6fa] mt-1">
                        {activeStats.cooldownText}
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={activeStats.sayGM}
                      disabled={isRealContract} // Real contract requires onchain Tx
                      className="group w-48 h-48 rounded-full bg-gradient-to-tr from-[#0052ff] to-[#ffd700] p-1 flex items-center justify-center cursor-pointer active:scale-95 transition-all duration-300 relative shadow-2xl shadow-[#0052ff]/20 hover:shadow-[#0052ff]/40"
                    >
                      <div className="w-full h-full rounded-full bg-[#0d0e15] group-hover:bg-[#0d0e15]/40 flex flex-col items-center justify-center transition-colors">
                        <Sun className="h-16 w-16 text-[#ffd700] group-hover:scale-110 transition-transform duration-300" />
                        <span className="text-lg font-black tracking-widest text-[#ffd700] mt-2 group-hover:text-white">
                          SAY GM
                        </span>
                      </div>
                    </button>
                  )}
                </div>

                {isRealContract && !activeStats.isCooldown && (
                  <div className="w-full max-w-sm mb-6">
                    <p className="text-xs text-zinc-400 mb-2">Contracts are configured. Say GM onchain:</p>
                    {/* Add Transaction flow here if needed, or point to write contract */}
                    <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-xs text-[#0052ff]">
                      Please use your wallet client to invoke <code className="bg-black/50 px-1 py-0.5 rounded">sayGM()</code> on the GMStreak contract.
                    </div>
                  </div>
                )}

                {/* Streak and XP Indicators */}
                <div className="grid grid-cols-2 gap-4 w-full max-w-md mt-4">
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col items-center">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Flame className="h-5 w-5 text-orange-500 animate-bounce" />
                      <span className="text-xs font-semibold text-zinc-400">Current Streak</span>
                    </div>
                    <span className="text-2xl font-black">{activeStats.currentStreak} Days</span>
                  </div>
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col items-center">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Sparkles className="h-5 w-5 text-[#ffd700]" />
                      <span className="text-xs font-semibold text-zinc-400">Total XP</span>
                    </div>
                    <span className="text-2xl font-black text-[#ffd700]">{activeStats.xp} XP</span>
                  </div>
                </div>
              </div>

              {/* Badges Showcase */}
              <div>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Award className="h-5 w-5 text-[#0052ff]" />
                  Soulbound Milestone Badges
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {badges.map(badge => (
                    <div 
                      key={badge.id}
                      className={`glassmorphism rounded-2xl p-4 flex flex-col items-center text-center relative overflow-hidden transition-all duration-300 ${
                        badge.owned 
                          ? "border-[#0052ff]/30 shadow-md shadow-[#0052ff]/5 hover:scale-105" 
                          : "opacity-40 grayscale"
                      }`}
                    >
                      {!badge.owned && (
                        <div className="absolute top-2 right-2 p-1 bg-black/40 border border-white/10 rounded-full">
                          <Lock className="h-3.5 w-3.5 text-zinc-400" />
                        </div>
                      )}
                      
                      <div className="w-24 h-24 mb-3">
                        {badge.owned && badge.image ? (
                          <img 
                            src={badge.image} 
                            alt={badge.name} 
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          // Fallback placeholder circular SVG
                          <div className="w-full h-full rounded-full border border-dashed border-white/20 flex items-center justify-center bg-black/20 text-zinc-500 font-bold text-xs">
                            {badge.requiredStreak} DAYS
                          </div>
                        )}
                      </div>
                      
                      <h4 className="font-bold text-xs text-white mb-1 line-clamp-1">{badge.name}</h4>
                      <span className="text-[10px] text-zinc-400 font-semibold">{badge.requiredStreak} Days Required</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Stats, Leaderboard & Notifications */}
            <div className="flex flex-col gap-8">
              {/* Profile Overview Card */}
              <div className="glassmorphism rounded-3xl p-6">
                <h3 className="font-bold text-base mb-4 flex items-center gap-2">
                  <User className="h-5 w-5 text-[#0052ff]" />
                  Your Stats
                </h3>
                <div className="flex flex-col gap-3.5">
                  <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2.5">
                    <span className="text-zinc-400">Longest Streak</span>
                    <span className="font-bold text-white flex items-center gap-1">
                      <Flame className="h-4 w-4 text-orange-500" />
                      {activeStats.longestStreak} days
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2.5">
                    <span className="text-zinc-400">Total GMs Said</span>
                    <span className="font-bold text-white">{activeStats.totalGMs} times</span>
                  </div>
                  <div className="flex justify-between items-center text-sm pb-1">
                    <span className="text-zinc-400">Badges Unlocked</span>
                    <span className="font-bold text-white">
                      {badges.filter(b => b.owned).length} / 4
                    </span>
                  </div>
                </div>
              </div>

              {/* Leaderboard Card */}
              <div className="glassmorphism rounded-3xl p-6 flex-1 flex flex-col">
                <h3 className="font-bold text-base mb-4 flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-[#ffd700]" />
                  Streak Leaderboard
                </h3>
                
                <div className="flex flex-col gap-2.5 flex-1">
                  {leaderboard.map((user, idx) => (
                    <div 
                      key={idx}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition-colors ${
                        user.isUser 
                          ? "bg-[#0052ff]/10 border-[#0052ff]/30 text-white font-medium" 
                          : "bg-white/5 border-white/5 text-zinc-300"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`w-5 text-center text-xs font-bold ${
                          idx === 0 ? "text-[#ffd700]" : idx === 1 ? "text-[#c0c0c0]" : idx === 2 ? "text-[#cd7f32]" : "text-zinc-500"
                        }`}>
                          {idx + 1}
                        </span>
                        <span className="text-xs font-mono">{user.address}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-zinc-400">{user.xp} XP</span>
                        <span className="text-xs font-bold text-orange-400 flex items-center gap-0.5">
                          <Flame className="h-3.5 w-3.5" />
                          {user.currentStreak}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* PWA & Reminders Settings */}
              <div className="glassmorphism rounded-3xl p-6">
                <h3 className="font-bold text-base mb-2 flex items-center gap-2">
                  <Bell className="h-4 w-4 text-[#0052ff]" />
                  GM Reminders
                </h3>
                <p className="text-zinc-400 text-xs mb-4">
                  Enable push notifications so we can nudge you when your streak is about to break.
                </p>

                {isPushSupported ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-zinc-400">Push Notifications</span>
                      <button
                        onClick={isSubscribed ? unsubscribePush : subscribePush}
                        disabled={isPushLoading}
                        className={`text-xs px-3.5 py-1.5 rounded-full font-bold transition-all ${
                          isSubscribed 
                            ? "bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20" 
                            : "bg-[#0052ff] hover:bg-[#0045d8] text-white"
                        }`}
                      >
                        {isPushLoading ? "Syncing..." : isSubscribed ? "Disable" : "Enable"}
                      </button>
                    </div>

                    {isSubscribed && (
                      <button
                        onClick={sendTestNotification}
                        className="w-full text-center text-xs mt-1 p-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-zinc-300 hover:text-white transition-all flex items-center justify-center gap-1.5"
                      >
                        <Zap className="h-3.5 w-3.5 text-[#ffd700]" />
                        Send Test Reminder
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="p-3 bg-white/5 border border-white/15 rounded-xl flex items-start gap-2">
                    <Info className="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" />
                    <span className="text-[11px] text-zinc-400 leading-tight">
                      Push notifications are not supported in your browser or require HTTPS. If on mobile, install the app via your browser's "Add to Home Screen" first.
                    </span>
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* TAB CONTENT: SWAP */}
        {activeTab === "swap" && (
          <div className="max-w-md mx-auto w-full flex flex-col gap-6">
            
            {/* Uniswap Swap Interface Card */}
            <div className="glassmorphism rounded-3xl p-6 glow-card border-[#0052ff]/10">
              <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                <ArrowRightLeft className="h-5 w-5 text-[#0052ff]" />
                Token Swap
              </h2>
              <p className="text-zinc-400 text-xs mb-6">
                Swap premium tokens directly on Base with optimized Uniswap routing.
              </p>

              {/* Swap Form */}
              <div className="flex flex-col gap-4 relative">
                {/* Input Card */}
                <div className="bg-black/40 border border-white/5 rounded-2xl p-4 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs text-zinc-500 font-semibold">You Sell</label>
                  </div>
                  <div className="flex justify-between items-center gap-3">
                    <input
                      type="number"
                      placeholder="0.0"
                      value={swapAmount}
                      onChange={(e) => setSwapAmount(e.target.value)}
                      className="bg-transparent text-2xl font-bold text-white outline-none w-full placeholder-zinc-700"
                    />
                    {/* Input Token Select Dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => {
                          setShowInputDropdown(!showInputDropdown);
                          setShowOutputDropdown(false);
                        }}
                        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/15 px-3 py-1.5 rounded-full transition-colors shrink-0"
                      >
                        {swapInputToken.image && (
                          <img src={swapInputToken.image} alt={swapInputToken.symbol} className="w-5 h-5 rounded-full" />
                        )}
                        <span className="font-bold text-sm text-white">{swapInputToken.symbol}</span>
                      </button>
                      
                      {showInputDropdown && (
                        <div className="absolute right-0 mt-2 w-48 bg-[#0c0d12] border border-white/10 rounded-2xl shadow-xl z-50 overflow-hidden">
                          {SUPPORTED_TOKENS.map((token) => (
                            <button
                              key={`in-${token.symbol}`}
                              onClick={() => {
                                setSwapInputToken(token);
                                setShowInputDropdown(false);
                                // Swap output if same
                                if (token.symbol === swapOutputToken.symbol) {
                                  setSwapOutputToken(swapInputToken);
                                }
                              }}
                              className="flex items-center gap-2.5 w-full px-4 py-3 hover:bg-white/5 text-left text-sm"
                            >
                              {token.image && <img src={token.image} alt={token.symbol} className="w-5 h-5 rounded-full" />}
                              <span className="font-semibold text-white">{token.symbol}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Flip Button */}
                <button
                  onClick={() => {
                    const temp = swapInputToken;
                    setSwapInputToken(swapOutputToken);
                    setSwapOutputToken(temp);
                  }}
                  className="w-10 h-10 rounded-full bg-[#0052ff] hover:bg-[#0045d8] border-4 border-[#06070a] flex items-center justify-center absolute left-1/2 top-[84px] -translate-x-1/2 z-10 transition-all active:scale-90"
                >
                  <ArrowRightLeft className="h-4 w-4 text-white rotate-90" />
                </button>

                {/* Output Card */}
                <div className="bg-black/40 border border-white/5 rounded-2xl p-4 flex flex-col gap-2 mt-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs text-zinc-500 font-semibold">You Buy</label>
                  </div>
                  <div className="flex justify-between items-center gap-3">
                    <div className="text-2xl font-bold text-zinc-600">
                      {swapAmount ? (Number(swapAmount) > 0 ? "~" : "0.0") : "0.0"}
                    </div>
                    {/* Output Token Select Dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => {
                          setShowOutputDropdown(!showOutputDropdown);
                          setShowInputDropdown(false);
                        }}
                        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/15 px-3 py-1.5 rounded-full transition-colors shrink-0"
                      >
                        {swapOutputToken.image && (
                          <img src={swapOutputToken.image} alt={swapOutputToken.symbol} className="w-5 h-5 rounded-full" />
                        )}
                        <span className="font-bold text-sm text-white">{swapOutputToken.symbol}</span>
                      </button>
                      
                      {showOutputDropdown && (
                        <div className="absolute right-0 mt-2 w-48 bg-[#0c0d12] border border-white/10 rounded-2xl shadow-xl z-50 overflow-hidden">
                          {SUPPORTED_TOKENS.map((token) => (
                            <button
                              key={`out-${token.symbol}`}
                              onClick={() => {
                                setSwapOutputToken(token);
                                setShowOutputDropdown(false);
                                // Swap input if same
                                if (token.symbol === swapInputToken.symbol) {
                                  setSwapInputToken(swapOutputToken);
                                }
                              }}
                              className="flex items-center gap-2.5 w-full px-4 py-3 hover:bg-white/5 text-left text-sm"
                            >
                              {token.image && <img src={token.image} alt={token.symbol} className="w-5 h-5 rounded-full" />}
                              <span className="font-semibold text-white">{token.symbol}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Submit Action Button */}
                <button
                  onClick={() => {
                    const fromAddress = swapInputToken.address || "NATIVE";
                    const toAddress = swapOutputToken.address || "NATIVE";
                    const amountParam = swapAmount ? `&exactAmount=${swapAmount}` : "";
                    const url = `https://app.uniswap.org/#/swap?chain=base&inputCurrency=${fromAddress}&outputCurrency=${toAddress}${amountParam}&exactField=input`;
                    window.open(url, "_blank");
                  }}
                  className="w-full bg-[#0052ff] hover:bg-[#0045d8] text-white font-bold py-4 px-6 rounded-2xl mt-4 transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-[#0052ff]/30 active:scale-95"
                >
                  Swap via Uniswap ↗
                </button>
              </div>
            </div>

            {/* DEX Info Info Card */}
            <div className="bg-white/5 border border-white/5 rounded-2xl p-5 text-sm text-zinc-400 flex flex-col gap-3">
              <div className="flex gap-2 text-white font-bold items-center text-xs">
                <CheckCircle2 className="h-4 w-4 text-[#00c853]" />
                Attribution & Support
              </div>
              <p className="text-xs leading-relaxed">
                Swapping tokens supports the GM DEX platform. Transactions are executed securely and directly on Uniswap's protocol on the Base blockchain.
              </p>
            </div>

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 mt-12 bg-black/40">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-zinc-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 GM DEX. All rights reserved. Powered by Base & Coinbase OnchainKit.</p>
          <div className="flex gap-4">
            <a href="https://base.org" className="hover:text-white transition-colors">Base Chain</a>
            <a href="https://onchainkit.xyz" className="hover:text-white transition-colors">OnchainKit</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
