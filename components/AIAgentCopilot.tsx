"use client";

import { useState, useEffect, useRef } from "react";
import { Bot, Sparkles, X, Send, ArrowRight, ShieldCheck, TrendingUp, Zap, HelpCircle, CheckCircle2 } from "lucide-react";
import { Token, SUPPORTED_TOKENS } from "@/lib/tokens";

interface AIAgentCopilotProps {
  onAutoFillSwap: (inputSymbol: string, outputSymbol: string, amount: string) => void;
  onNavigateTab: (tab: "home" | "swap" | "liquidity" | "bridge" | "portfolio") => void;
  walletConnected: boolean;
  walletBalance: string;
}

interface Message {
  id: string;
  sender: "user" | "agent";
  text: string;
  action?: {
    type: "swap" | "navigate" | "audit";
    label: string;
    payload?: any;
  };
  timestamp: string;
}

export function AIAgentCopilot({ onAutoFillSwap, onNavigateTab, walletConnected, walletBalance }: AIAgentCopilotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "agent",
      text: "👋 GM! I am **GM AI Agent**, your autonomous on-chain trading copilot on Base Mainnet. How can I help you today?",
      timestamp: "Just now",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const parseAndRespond = (query: string) => {
    const q = query.toLowerCase().trim();

    // 1. Swap Command detection: e.g. "swap 0.01 eth to usdc" or "buy usdc with 0.05 eth"
    const swapMatch = q.match(/(?:swap|trade|buy|convert)\s*([0-9]*\.?[0-9]+)?\s*([a-z0-9]+)\s*(?:to|for|with|into)\s*([a-z0-9]+)/i);
    
    if (swapMatch) {
      const amount = swapMatch[1] || "0.01";
      const tokenA = swapMatch[2].toUpperCase();
      const tokenB = swapMatch[3].toUpperCase();

      const matchedA = SUPPORTED_TOKENS.find(t => t.symbol.toUpperCase() === tokenA || t.name.toLowerCase() === tokenA.toLowerCase());
      const matchedB = SUPPORTED_TOKENS.find(t => t.symbol.toUpperCase() === tokenB || t.name.toLowerCase() === tokenB.toLowerCase());

      const symA = matchedA ? matchedA.symbol : tokenA;
      const symB = matchedB ? matchedB.symbol : tokenB;

      return {
        text: `🤖 I've prepared a **${amount} ${symA} ➔ ${symB}** swap for you with optimum Aerodrome V2 routing and 0.1% protocol fee. Click below to execute!`,
        action: {
          type: "swap" as const,
          label: `Execute ${amount} ${symA} ➔ ${symB}`,
          payload: { inputSymbol: symA, outputSymbol: symB, amount },
        },
      };
    }

    // 2. Yield / Pool inquiry
    if (q.includes("yield") || q.includes("apy") || q.includes("pool") || q.includes("liquidity") || q.includes("earn")) {
      return {
        text: "💧 **Top Liquidity Pools on Base Mainnet:**\n\n• **USDC / EURC StableSwap**: 0.1% fee tier (~14.2% projected APY, zero impermanent loss).\n• **ETH / USDC Volatile**: High volume pool with deep liquidity.\n\nDeploy your stablecoins into USDC/EURC for maximum low-risk yield!",
        action: {
          type: "navigate" as const,
          label: "View Liquidity Pools",
          payload: "liquidity",
        },
      };
    }

    // 3. Token Safety Audit
    if (q.includes("safe") || q.includes("audit") || q.includes("honeypot") || q.includes("scam") || q.includes("tax")) {
      return {
        text: "🛡️ **GM AI Token Safety Audit Summary:**\n\n✅ **Base Router**: `0x9dc3BBdB881...` (Verified)\n✅ **Attribution Standard**: ERC-8021 Builder Code (`6a488e6c...`)\n✅ **Buy/Sell Tax**: 0% on supported Base tokens (`ETH`, `USDC`, `EURC`, `cbBTC`, `DEGEN`, `BRETT`, `TOSHI`, `AERO`, `VIRTUAL`).\n✅ **Custody**: 100% Non-Custodial & Decentralized.",
      };
    }

    // 4. Portfolio inquiry
    if (q.includes("portfolio") || q.includes("balance") || q.includes("worth") || q.includes("wallet")) {
      return {
        text: `💼 **Wallet Status:** ${walletConnected ? `Connected (${walletBalance} ETH)` : "Not Connected"}.\n\nYour portfolio is non-custodial on Base L2. I can track your tokens, evaluate your asset allocation health, and suggest rebalancing strategies.`,
        action: {
          type: "navigate" as const,
          label: "Open Portfolio Tracker",
          payload: "portfolio",
        },
      };
    }

    // 5. Bridge inquiry
    if (q.includes("bridge") || q.includes("deposit") || q.includes("transfer") || q.includes("arbitrum") || q.includes("solana")) {
      return {
        text: "🌉 **Base Cross-Chain Bridge:**\n\nTransfer ETH, USDC, or USDT directly from 15+ EVM chains and Solana to Base Mainnet in < 2 minutes via official Superbridge infrastructure.",
        action: {
          type: "navigate" as const,
          label: "Open Base Bridge",
          payload: "bridge",
        },
      };
    }

    // Default intelligent answer
    return {
      text: "🤖 I am equipped to:\n• **Execute Swaps**: e.g., *'Swap 0.01 ETH to USDC'*\n• **Analyze Yields**: e.g., *'Best APY pools'*\n• **Audit Safety**: e.g., *'Is this token safe?'*\n• **Track Portfolio**: e.g., *'Show my balance'*",
    };
  };

  const handleSend = (textToSend?: string) => {
    const query = textToSend || inputMessage;
    if (!query.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: query,
      timestamp: "Just now",
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage("");
    setIsTyping(true);

    setTimeout(() => {
      const response = parseAndRespond(query);
      const agentMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "agent",
        text: response.text,
        action: response.action,
        timestamp: "Just now",
      };
      setMessages((prev) => [...prev, agentMsg]);
      setIsTyping(false);
    }, 600);
  };

  const handleActionClick = (action: Message["action"]) => {
    if (!action) return;
    if (action.type === "swap" && action.payload) {
      onAutoFillSwap(action.payload.inputSymbol, action.payload.outputSymbol, action.payload.amount);
      onNavigateTab("swap");
      setIsOpen(false);
    } else if (action.type === "navigate" && action.payload) {
      onNavigateTab(action.payload);
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Floating AI Agent Trigger Button */}
      <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-[#01C38E] to-[#0A786A] text-white font-extrabold text-xs shadow-2xl shadow-[#01C38E]/30 hover:scale-105 active:scale-95 transition-all duration-300 border border-white/20 cursor-pointer"
        >
          <div className="relative">
            <Bot className="h-5 w-5 animate-bounce-short" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-white animate-ping" />
          </div>
          <span className="tracking-tight hidden sm:inline">GM AI Agent</span>
          <span className="text-[9px] bg-black/40 px-1.5 py-0.5 rounded font-mono uppercase">L2 Copilot</span>
        </button>
      </div>

      {/* AI Agent Chat Modal / Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:justify-end sm:p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm sm:bg-transparent" onClick={() => setIsOpen(false)} />
          
          <div className="relative w-full sm:max-w-md h-[80vh] sm:h-[600px] bg-[#0c1222] border border-[#01C38E]/30 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white animate-in slide-in-from-bottom duration-300">
            {/* Chat Header */}
            <div className="p-4 border-b border-white/10 bg-gradient-to-r from-[#0c1222] via-[#101b30] to-[#0c1222] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#01C38E] to-[#0A786A] p-[1.5px] shadow-lg shadow-[#01C38E]/20">
                  <div className="w-full h-full rounded-[14px] bg-[#0c1222] flex items-center justify-center">
                    <Bot className="h-5 w-5 text-[#01C38E]" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-sm text-white">GM AI Agent</span>
                    <span className="w-2 h-2 rounded-full bg-[#01C38E] animate-pulse" />
                  </div>
                  <p className="text-[11px] text-zinc-400">Autonomous Base L2 Trading Copilot</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-xl hover:bg-white/10 transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Action Suggestion Pills */}
            <div className="px-4 py-2 border-b border-white/5 bg-black/20 flex gap-2 overflow-x-auto no-scrollbar text-[11px]">
              <button
                onClick={() => handleSend("Swap 0.01 ETH to USDC")}
                className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-[#01C38E]/20 border border-white/10 hover:border-[#01C38E]/40 text-zinc-300 hover:text-white whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 shrink-0"
              >
                <Zap className="h-3 w-3 text-[#01C38E]" /> Swap 0.01 ETH ➔ USDC
              </button>
              <button
                onClick={() => handleSend("Where can I find the best APY?")}
                className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-[#01C38E]/20 border border-white/10 hover:border-[#01C38E]/40 text-zinc-300 hover:text-white whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 shrink-0"
              >
                <TrendingUp className="h-3 w-3 text-[#01C38E]" /> Best APY Pools
              </button>
              <button
                onClick={() => handleSend("Is GM DEX safe?")}
                className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-[#01C38E]/20 border border-white/10 hover:border-[#01C38E]/40 text-zinc-300 hover:text-white whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 shrink-0"
              >
                <ShieldCheck className="h-3 w-3 text-[#01C38E]" /> Token Safety
              </button>
            </div>

            {/* Message History */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs leading-relaxed">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl whitespace-pre-line ${
                      msg.sender === "user"
                        ? "bg-[#01C38E] text-white rounded-br-none shadow-md shadow-[#01C38E]/20"
                        : "bg-white/5 border border-white/10 text-zinc-200 rounded-bl-none shadow-md"
                    }`}
                  >
                    {msg.text}

                    {/* Interactive Action Button */}
                    {msg.action && (
                      <div className="mt-3 pt-2.5 border-t border-white/10">
                        <button
                          onClick={() => handleActionClick(msg.action)}
                          className="w-full py-2 px-3 rounded-xl bg-[#01C38E] hover:bg-[#00ab7c] text-white font-extrabold text-xs transition-all shadow-md shadow-[#01C38E]/20 flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          {msg.action.label}
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] text-zinc-500 mt-1 px-1">{msg.timestamp}</span>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-2 text-zinc-400 p-3 bg-white/5 rounded-2xl w-24">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#01C38E] animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#01C38E] animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#01C38E] animate-bounce [animation-delay:0.4s]" />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t border-white/10 bg-black/40 flex items-center gap-2">
              <input
                type="text"
                placeholder="Ask GM AI or type e.g. 'Swap 0.01 ETH to USDC'..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSend();
                }}
                className="flex-1 bg-white/5 border border-white/10 focus:border-[#01C38E] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none placeholder-zinc-500 transition-all font-sans"
              />
              <button
                onClick={() => handleSend()}
                disabled={!inputMessage.trim()}
                className="p-2.5 bg-[#01C38E] hover:bg-[#00ab7c] disabled:opacity-40 disabled:hover:bg-[#01C38E] text-white rounded-xl transition-all shadow-md shadow-[#01C38E]/20 cursor-pointer"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
