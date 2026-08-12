"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Sparkles, ShieldCheck, Zap, Layers, TrendingUp, ExternalLink, ArrowRightLeft, Droplet, Printer } from "lucide-react";

export default function PitchDeck() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "☀️ GM DEX — Next-Gen DEX on Base L2",
      tagline: "Sub-Second Swaps • Automated Treasury Revenue • Base Builder Attributed",
      content: (
        <div className="flex flex-col gap-6 text-center items-center py-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#01C38E]/10 border border-[#01C38E]/20 text-[#01C38E] text-xs font-extrabold shadow-lg shadow-[#01C38E]/10 animate-pulse">
            <Sparkles className="h-4 w-4" /> Deployed & Live on Base Mainnet (Chain ID: 8453)
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            High-Performance DEX & Liquidity Protocol
          </h1>
          <p className="text-zinc-400 text-sm max-w-xl leading-relaxed">
            Powered by Aerodrome V2 liquidity routing, automated 0.1% protocol fee collection to Treasury, and standard Base Builder Code attribution.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mt-4">
            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 text-center">
              <div className="text-xl font-bold text-[#01C38E]">Sub-Second</div>
              <div className="text-xs text-zinc-500 mt-1">L2 Execution Finality</div>
            </div>
            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 text-center">
              <div className="text-xl font-bold text-white">0.1% Fee</div>
              <div className="text-xs text-zinc-500 mt-1">Automated Treasury Share</div>
            </div>
            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 text-center">
              <div className="text-xl font-bold text-white font-mono">6a488e6c...</div>
              <div className="text-xs text-zinc-500 mt-1">Base Builder Code</div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "🛑 The Problem in DeFi Today",
      tagline: "High L1 Friction, Inflationary Tokenomics, and Uncaptured Rewards",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6">
          <div className="p-6 rounded-2xl bg-black/30 border border-white/10 flex flex-col gap-3">
            <div className="text-red-400 font-bold text-lg">1. High L1 Friction</div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Trading and liquidity provision on Ethereum L1 suffers from slow confirmations, high gas costs, and poor mobile UX.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-black/30 border border-white/10 flex flex-col gap-3">
            <div className="text-red-400 font-bold text-lg">2. Unfunded Treasury Growth</div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Many DEXs rely on inflationary token emissions rather than automated cash-flow revenue generated on every transaction.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-black/30 border border-white/10 flex flex-col gap-3">
            <div className="text-red-400 font-bold text-lg">3. Missed Builder Rewards</div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Traditional DEX front-ends fail to attribute transaction volume to underlying builder codes, losing ecosystem incentives.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "💡 The Solution: GM DEX Protocol",
      tagline: "Native L2 Performance, Organic Cash Flow, and On-Chain Builder Code",
      content: (
        <div className="flex flex-col gap-4 py-4">
          <div className="p-5 rounded-2xl bg-gradient-to-r from-[#01C38E]/10 to-transparent border border-[#01C38E]/20 flex items-start gap-4">
            <Zap className="h-6 w-6 text-[#01C38E] shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-white text-base">Sub-Second Execution on Base L2</h4>
              <p className="text-xs text-zinc-400 mt-1">
                Built natively on Base Mainnet for sub-second confirmation times and micro-cent gas fees.
              </p>
            </div>
          </div>
          <div className="p-5 rounded-2xl bg-gradient-to-r from-[#01C38E]/10 to-transparent border border-[#01C38E]/20 flex items-start gap-4">
            <TrendingUp className="h-6 w-6 text-[#01C38E] shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-white text-base">Automated Treasury Revenue (0.1%)</h4>
              <p className="text-xs text-zinc-400 mt-1">
                Dedicated smart contracts automatically collect a 0.1% fee on swaps and deposits directly to the Protocol Treasury.
              </p>
            </div>
          </div>
          <div className="p-5 rounded-2xl bg-gradient-to-r from-[#01C38E]/10 to-transparent border border-[#01C38E]/20 flex items-start gap-4">
            <Sparkles className="h-6 w-6 text-[#01C38E] shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-white text-base">ERC-8021 Base Builder Alignment</h4>
              <p className="text-xs text-zinc-400 mt-1">
                Every transaction appends standard Base Builder Code (<span className="font-mono text-[#01C38E]">6a488e6c...</span>) for Coinbase builder rewards.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "⚡ Core Product Ecosystem",
      tagline: "Swaps, Liquidity Pools, and Cross-Chain Asset Bridging",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6">
          <div className="p-6 rounded-2xl bg-black/40 border border-white/10 flex flex-col gap-3">
            <ArrowRightLeft className="h-8 w-8 text-[#01C38E]" />
            <h4 className="font-bold text-white text-base">Token Swaps</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Curve-optimized routing across Aerodrome V2 volatile and stable pools for ETH, USDC, EURC, and WETH.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-black/40 border border-white/10 flex flex-col gap-3">
            <Droplet className="h-8 w-8 text-[#01C38E]" />
            <h4 className="font-bold text-white text-base">Liquidity Pools</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Automated paired asset deposits with instant ratio matching and 2-second real-time LP position tracking.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-black/40 border border-white/10 flex flex-col gap-3">
            <Layers className="h-8 w-8 text-[#01C38E]" />
            <h4 className="font-bold text-white text-base">Cross-Chain Bridge</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Integrated Superbridge hub for seamless L1-to-L2 asset migration from Ethereum to Base Mainnet.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "💰 Business Model & Cash Flow",
      tagline: "Multi-Stream Sustainable Protocol Revenues",
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-6">
          <div className="p-5 rounded-2xl bg-black/30 border border-white/10">
            <div className="text-xs text-zinc-500 font-semibold">0.1% Swap Protocol Fee</div>
            <div className="text-xl font-bold text-[#01C38E] mt-1">GMDexRouter.sol</div>
            <p className="text-xs text-zinc-400 mt-2">Deducted automatically on-chain and routed directly to Treasury.</p>
          </div>
          <div className="p-5 rounded-2xl bg-black/30 border border-white/10">
            <div className="text-xs text-zinc-500 font-semibold">0.1% Deposit Protocol Fee</div>
            <div className="text-xl font-bold text-[#01C38E] mt-1">AeroDexLiquidity.sol</div>
            <p className="text-xs text-zinc-400 mt-2">Collected on LP deposits before pooling into Aerodrome.</p>
          </div>
          <div className="p-5 rounded-2xl bg-black/30 border border-white/10">
            <div className="text-xs text-zinc-500 font-semibold">Coinbase Builder Rewards</div>
            <div className="text-xl font-bold text-white mt-1">ERC-8021 Data Suffix</div>
            <p className="text-xs text-zinc-400 mt-2">Appended to all transaction payloads for Base builder incentives.</p>
          </div>
          <div className="p-5 rounded-2xl bg-black/30 border border-white/10">
            <div className="text-xs text-zinc-500 font-semibold">Cross-Chain Integrator Revenue</div>
            <div className="text-xl font-bold text-white mt-1">Bridge Revenue Share</div>
            <p className="text-xs text-zinc-400 mt-2">Custom integrator fee share on cross-chain transfers.</p>
          </div>
        </div>
      ),
    },
    {
      title: "📜 Smart Contract Security & Architecture",
      tagline: "Deploys & Verified on Base Mainnet (Solc 0.8.20)",
      content: (
        <div className="flex flex-col gap-4 py-4">
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex justify-between items-center text-xs">
            <div>
              <div className="font-bold text-white">Swap Fee Router Contract (GMDexRouter)</div>
              <div className="font-mono text-zinc-400 mt-0.5">0x9dc3BBdB8817309ba42b79cc357EC6Be47030B70</div>
            </div>
            <span className="px-2 py-1 bg-[#01C38E]/20 text-[#01C38E] font-bold rounded">Verified</span>
          </div>
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex justify-between items-center text-xs">
            <div>
              <div className="font-bold text-white">Liquidity Deposit Fee Contract (AeroDexLiquidity)</div>
              <div className="font-mono text-zinc-400 mt-0.5">0x379bB6CBd151c8A9C3da6e534E46356e17b14572</div>
            </div>
            <span className="px-2 py-1 bg-[#01C38E]/20 text-[#01C38E] font-bold rounded">Verified</span>
          </div>
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex justify-between items-center text-xs">
            <div>
              <div className="font-bold text-white">Aerodrome V2 Liquidity Router</div>
              <div className="font-mono text-zinc-400 mt-0.5">0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43</div>
            </div>
            <span className="px-2 py-1 bg-white/10 text-white font-bold rounded">Aerodrome Native</span>
          </div>
        </div>
      ),
    },
    {
      title: "📈 Market Opportunity & Traction",
      tagline: "Riding the Massive Base L2 Growth Wave",
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6">
          <div className="p-6 rounded-2xl bg-black/30 border border-white/10 flex flex-col gap-2">
            <div className="text-3xl font-black text-[#01C38E]">$1.24M+</div>
            <div className="text-sm font-bold text-white">Aerodrome V2 TVL Pool Access</div>
            <p className="text-xs text-zinc-400 mt-1">Direct routing across standard volatile and stable liquidity pairs on Base.</p>
          </div>
          <div className="p-6 rounded-2xl bg-black/30 border border-white/10 flex flex-col gap-2">
            <div className="text-3xl font-black text-white">Mobile PWA</div>
            <div className="text-sm font-bold text-white">Add-to-Home-Screen Ready</div>
            <p className="text-xs text-zinc-400 mt-1">Progressive Web App architecture for seamless iOS & Android mobile trading.</p>
          </div>
        </div>
      ),
    },
    {
      title: "🚀 Growth & Roadmap",
      tagline: "Phase 1 Complete → Phase 2 Scaling",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-6">
          <div className="p-5 rounded-2xl bg-[#01C38E]/10 border border-[#01C38E]/30">
            <div className="text-xs font-bold text-[#01C38E] uppercase">Phase 1 (Completed)</div>
            <h4 className="font-bold text-white text-sm mt-1">Base Mainnet Core</h4>
            <ul className="text-[11px] text-zinc-300 mt-2 space-y-1">
              <li>• Router Deployment & Verification</li>
              <li>• Aerodrome V2 Swap Engine</li>
              <li>• 0.1% Treasury Fee Router</li>
              <li>• Superbridge Integration</li>
            </ul>
          </div>
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-xs font-bold text-zinc-400 uppercase">Phase 2 (Current)</div>
            <h4 className="font-bold text-white text-sm mt-1">Ecosystem Scaling</h4>
            <ul className="text-[11px] text-zinc-300 mt-2 space-y-1">
              <li>• Base Grant Application</li>
              <li>• Mobile PWA Optimizations</li>
              <li>• Builder Code Attribution (ERC-8021)</li>
            </ul>
          </div>
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-xs font-bold text-zinc-400 uppercase">Phase 3 (Upcoming)</div>
            <h4 className="font-bold text-white text-sm mt-1">Community Growth</h4>
            <ul className="text-[11px] text-zinc-300 mt-2 space-y-1">
              <li>• Daily GM Streaks (GMStreak.sol)</li>
              <li>• Soulbound Badges (GMBadge.sol)</li>
              <li>• Custom Token Contract Search</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      title: "🤝 Ecosystem & Coinbase CDP Alignment",
      tagline: "Deep Integration with Coinbase Developer Platform & Base Standards",
      content: (
        <div className="flex flex-col gap-4 py-4">
          <div className="p-5 rounded-2xl bg-black/30 border border-white/10 flex items-center justify-between">
            <div>
              <div className="font-bold text-white text-sm">Coinbase App ID / Metadata</div>
              <div className="text-xs text-zinc-400 mt-0.5">Configured in app layout for Coinbase Developer Platform app verification.</div>
            </div>
            <div className="font-mono text-xs text-[#01C38E] bg-[#01C38E]/10 px-3 py-1.5 rounded-lg border border-[#01C38E]/20">6a488e6c...</div>
          </div>
          <div className="p-5 rounded-2xl bg-black/30 border border-white/10 flex items-center justify-between">
            <div>
              <div className="font-bold text-white text-sm">Non-Custodial & Transparent</div>
              <div className="text-xs text-zinc-400 mt-0.5">Users retain full control of private keys; all transactions execute atomically on-chain.</div>
            </div>
            <ShieldCheck className="h-6 w-6 text-[#01C38E]" />
          </div>
        </div>
      ),
    },
    {
      title: "🎯 Grant Allocation & Milestones",
      tagline: "Funding Objectives for Scale",
      content: (
        <div className="flex flex-col gap-6 py-6 text-center items-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            <div className="p-5 rounded-2xl bg-black/40 border border-white/10 text-left">
              <div className="text-sm font-bold text-[#01C38E]">Milestone 1: Liquidity Scale</div>
              <p className="text-xs text-zinc-400 mt-1">$500K+ Monthly Volume & Pool Incentives on Base Mainnet.</p>
            </div>
            <div className="p-5 rounded-2xl bg-black/40 border border-white/10 text-left">
              <div className="text-sm font-bold text-[#01C38E]">Milestone 2: Security & Audits</div>
              <p className="text-xs text-zinc-400 mt-1">Complete formal third-party smart contract security audit.</p>
            </div>
          </div>

          <a
            href="https://gm-dex.vercel.app"
            target="_blank"
            rel="noreferrer"
            className="px-8 py-4 rounded-2xl bg-[#01C38E] hover:bg-[#00ab7c] text-white font-extrabold text-sm transition-all shadow-xl shadow-[#01C38E]/30 flex items-center gap-2 mt-2"
          >
            Launch GM DEX Live <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#090d16] text-white flex flex-col justify-between p-4 sm:p-8 font-sans">
      {/* Top Header Bar */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-xl bg-gradient-to-r from-white to-[#01C38E] bg-clip-text text-transparent">
            GM DEX <span className="text-[#01C38E] text-xs font-semibold px-2 py-0.5 rounded bg-[#01C38E]/10 border border-[#01C38E]/20">Pitch Deck</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Printer className="h-3.5 w-3.5 text-[#01C38E]" /> Save as PDF
          </button>
          <div className="text-xs text-zinc-400 font-semibold">
            Slide {currentSlide + 1} of {slides.length}
          </div>
        </div>
      </header>

      {/* Main Slide Card */}
      <main className="max-w-4xl mx-auto w-full flex-1 flex flex-col justify-center my-6">
        <div className="bg-[#0f172a]/90 border border-white/[0.08] rounded-3xl p-6 sm:p-10 backdrop-blur-2xl shadow-2xl relative min-h-[460px] flex flex-col justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {slides[currentSlide].title}
            </h2>
            <p className="text-xs sm:text-sm text-[#01C38E] font-semibold mt-1">
              {slides[currentSlide].tagline}
            </p>
            <div className="mt-4 border-t border-white/5 pt-4">
              {slides[currentSlide].content}
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <footer className="max-w-4xl mx-auto w-full flex items-center justify-between border-t border-white/10 pt-4">
        <button
          onClick={() => setCurrentSlide((prev) => Math.max(0, prev - 1))}
          disabled={currentSlide === 0}
          className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-xs flex items-center gap-1.5 transition-all"
        >
          <ChevronLeft className="h-4 w-4" /> Previous
        </button>

        {/* Slide Indicator Dots */}
        <div className="flex items-center gap-1.5">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2.5 rounded-full transition-all ${
                currentSlide === idx ? "w-8 bg-[#01C38E]" : "w-2.5 bg-white/20 hover:bg-white/40"
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => setCurrentSlide((prev) => Math.min(slides.length - 1, prev + 1))}
          disabled={currentSlide === slides.length - 1}
          className="px-5 py-2.5 rounded-xl bg-[#01C38E] hover:bg-[#00ab7c] disabled:opacity-40 disabled:cursor-not-allowed font-bold text-xs text-white flex items-center gap-1.5 transition-all shadow-md shadow-[#01C38E]/20"
        >
          Next <ChevronRight className="h-4 w-4" />
        </button>
      </footer>
    </div>
  );
}
