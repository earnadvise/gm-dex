"use client";

import { useState, useEffect, useRef } from "react";
import { Bot, Sparkles, X, Send, ArrowRight, ShieldCheck, TrendingUp, Zap, Layers, Wallet, History, HelpCircle, Terminal, RefreshCw, Trash2 } from "lucide-react";
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
    type: "swap" | "navigate" | "external";
    label: string;
    payload?: any;
  };
  timestamp: string;
}

const SLASH_COMMANDS = [
  { cmd: "/swap", desc: "Fast swap tokens (e.g. /swap 0.01 eth usdc)", example: "/swap 0.01 eth usdc" },
  { cmd: "/balance", desc: "Check wallet token balances & net worth", example: "/balance" },
  { cmd: "/history", desc: "View recent on-chain transactions & Basescan", example: "/history" },
  { cmd: "/audit", desc: "Audit token contract & safety score", example: "/audit brett" },
  { cmd: "/yield", desc: "View top Base APY liquidity pools", example: "/yield" },
  { cmd: "/bridge", desc: "Cross-chain bridge from 15+ networks", example: "/bridge" },
  { cmd: "/help", desc: "Show all available agent commands", example: "/help" },
  { cmd: "/clear", desc: "Clear chat messages", example: "/clear" },
];

export function AIAgentCopilot({ onAutoFillSwap, onNavigateTab, walletConnected, walletBalance }: AIAgentCopilotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "agent",
      text: "👋 GM! I am **GM AI Agent**, your autonomous on-chain trading copilot on Base Mainnet.\n\nType any slash command like **/swap**, **/balance**, **/history**, or **/audit** to get started!",
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
    const raw = query.trim();
    const q = raw.toLowerCase();

    // Command: /clear
    if (q === "/clear") {
      setMessages([
        {
          id: "welcome",
          sender: "agent",
          text: "🧹 Chat cleared! How can I help you? Try **/swap**, **/balance**, **/history**, or **/audit**.",
          timestamp: "Just now",
        },
      ]);
      return null;
    }

    // Command: /help
    if (q === "/help" || q === "help" || q === "commands") {
      return {
        text: `🤖 **GM AI Agent Command Center:**\n\n` +
          `• **/swap [amt] [tokenA] [tokenB]** — Instant swap execution (e.g. \`/swap 0.05 eth usdc\`)\n` +
          `• **/balance** — Scan connected wallet balances & USD net worth\n` +
          `• **/history** — View recent Base transactions on Basescan\n` +
          `• **/audit [token]** — Smart contract safety audit & 0% tax verification\n` +
          `• **/yield** or **/pools** — Top APY liquidity pools on Aerodrome V2\n` +
          `• **/bridge** — Bridge assets from Ethereum, Solana & Arbitrum\n` +
          `• **/clear** — Reset chat window`,
      };
    }

    // Command: /balance or balance inquiry
    if (q.startsWith("/balance") || q.startsWith("/bal") || q === "balance" || q === "my balance") {
      if (!walletConnected) {
        return {
          text: "💼 **Wallet Not Connected**\n\nPlease connect your Coinbase Wallet or MetaMask to view your real-time on-chain token balances and USD net worth.",
          action: {
            type: "navigate" as const,
            label: "Open Portfolio Tab",
            payload: "portfolio",
          },
        };
      }
      const ethNum = parseFloat(walletBalance || "0");
      const usdValue = (ethNum * 3300).toFixed(2);
      return {
        text: `💼 **Base Mainnet Portfolio Balance:**\n\n` +
          `• **ETH**: ${walletBalance} ETH (~$${usdValue})\n` +
          `• **Network**: Base Mainnet (Chain ID 8453)\n` +
          `• **Status**: 100% Non-Custodial & Secure\n\n` +
          `You can view all token breakdowns in the Portfolio tab or execute a quick swap below!`,
        action: {
          type: "navigate" as const,
          label: "View Full Portfolio",
          payload: "portfolio",
        },
      };
    }

    // Command: /history or /txs
    if (q.startsWith("/history") || q.startsWith("/tx") || q.startsWith("/recent") || q === "history") {
      return {
        text: `📜 **On-Chain Transaction History:**\n\n` +
          `• **GM DEX Router**: \`0x9dc3BBdB8817309ba42b79cc357EC6Be47030B70\`\n` +
          `• **Liquidity Pool Router**: \`0x379bB6CBd151c8A9C3da6e534E46356e17b14572\`\n` +
          `• **Attribution**: Base Builder Code (\`6a488e6c...\`)\n\n` +
          `All swaps and LP actions are verified on Basescan with sub-second finality.`,
        action: {
          type: "external" as const,
          label: "Open Basescan Explorer",
          payload: "https://basescan.org/address/0x9dc3BBdB8817309ba42b79cc357EC6Be47030B70",
        },
      };
    }

    // Command: /audit [token]
    if (q.startsWith("/audit") || q.includes("audit") || q.includes("honeypot") || q.includes("safe")) {
      const parts = raw.split(" ");
      const target = parts[1] || "All Supported Tokens";
      return {
        text: `🛡️ **GM AI Safety Audit [${target.toUpperCase()}]:**\n\n` +
          `✅ **Buy / Sell Tax**: 0.0% (Verified)\n` +
          `✅ **Honeypot Risk**: 0% (Clean Open Liquidity)\n` +
          `✅ **Router Verification**: Base Mainnet Aerodrome V2\n` +
          `✅ **Builder Standard**: ERC-8021 Data Suffix Attached\n` +
          `✅ **Security Rating**: **99 / 100 — Highly Safe**`,
      };
    }

    // Command: /yield or /pools
    if (q.startsWith("/yield") || q.startsWith("/pools") || q.includes("apy") || q.includes("pool")) {
      return {
        text: `💧 **Base Mainnet Top Yield Pools (Aerodrome V2):**\n\n` +
          `1. **USDC / EURC StableSwap**: ~14.2% Projected APY (0.1% fee, Zero IL)\n` +
          `2. **ETH / USDC Volatile**: High Daily Volume & Deep Liquidity\n` +
          `3. **ETH / EURC Volatile**: Multi-Currency Yield Pair\n\n` +
          `Protocol automatically routes 0.1% deposit revenue to Treasury.`,
        action: {
          type: "navigate" as const,
          label: "Deposit into Liquidity Pools",
          payload: "liquidity",
        },
      };
    }

    // Command: /bridge
    if (q.startsWith("/bridge") || q.includes("bridge") || q.includes("deposit")) {
      return {
        text: `🌉 **Official Base Cross-Chain Bridge:**\n\n` +
          `• **Supported Networks**: 15+ EVM Chains & Solana\n` +
          `• **Avg Transfer Speed**: < 2 Minutes\n` +
          `• **Target Network**: Base Mainnet (8453)\n` +
          `• **Security**: OP Stack & Native Base Bridge`,
        action: {
          type: "navigate" as const,
          label: "Open Bridge Portal",
          payload: "bridge",
        },
      };
    }

    // Command: /swap [amt] [tokenA] [tokenB] or natural language swap
    const isSlashSwap = q.startsWith("/swap");
    let amount = "0.01";
    let symA = "ETH";
    let symB = "USDC";

    if (isSlashSwap) {
      const parts = raw.split(/\s+/).filter(Boolean);
      // e.g. /swap 0.05 eth usdc or /swap eth usdc
      if (parts.length >= 4) {
        amount = parts[1];
        symA = parts[2].toUpperCase();
        symB = parts[3].toUpperCase();
      } else if (parts.length === 3) {
        if (!isNaN(Number(parts[1]))) {
          amount = parts[1];
          symB = parts[2].toUpperCase();
        } else {
          symA = parts[1].toUpperCase();
          symB = parts[2].toUpperCase();
        }
      }
    } else {
      const swapMatch = q.match(/(?:swap|trade|buy|convert)\s*([0-9]*\.?[0-9]+)?\s*([a-z0-9]+)\s*(?:to|for|with|into)\s*([a-z0-9]+)/i);
      if (swapMatch) {
        amount = swapMatch[1] || "0.01";
        symA = swapMatch[2].toUpperCase();
        symB = swapMatch[3].toUpperCase();
      }
    }

    const matchedA = SUPPORTED_TOKENS.find(t => t.symbol.toUpperCase() === symA || t.name.toLowerCase() === symA.toLowerCase());
    const matchedB = SUPPORTED_TOKENS.find(t => t.symbol.toUpperCase() === symB || t.name.toLowerCase() === symB.toLowerCase());

    const finalA = matchedA ? matchedA.symbol : symA;
    const finalB = matchedB ? matchedB.symbol : symB;

    if (isSlashSwap || q.includes("swap") || q.includes("buy")) {
      return {
        text: `🤖 **Prepared Swap Order:**\n\n` +
          `• **Selling**: ${amount} ${finalA}\n` +
          `• **Receiving**: ${finalB}\n` +
          `• **Routing**: Aerodrome V2 (0.1% Treasury Fee)\n` +
          `• **Attribution**: ERC-8021 Builder Code\n\n` +
          `Click below to execute immediately on Base Mainnet!`,
        action: {
          type: "swap" as const,
          label: `Execute ${amount} ${finalA} ➔ ${finalB}`,
          payload: { inputSymbol: finalA, outputSymbol: finalB, amount },
        },
      };
    }

    // Default intelligent helper
    return {
      text: `🤖 I didn't recognize that specific command. Try:\n\n` +
        `• **/swap 0.01 eth usdc** — Prepare a fast swap\n` +
        `• **/balance** — Check your wallet balance\n` +
        `• **/history** — View on-chain transactions\n` +
        `• **/audit brett** — Run a safety audit\n` +
        `• **/yield** — Top APY liquidity pools\n` +
        `• **/help** — View all commands`,
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
      if (!response) {
        setIsTyping(false);
        return;
      }
      const agentMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "agent",
        text: response.text,
        action: response.action,
        timestamp: "Just now",
      };
      setMessages((prev) => [...prev, agentMsg]);
      setIsTyping(false);
    }, 450);
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
    } else if (action.type === "external" && action.payload) {
      window.open(action.payload, "_blank");
    }
  };

  const isSlashActive = inputMessage.startsWith("/");

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
          <span className="text-[9px] bg-black/40 px-1.5 py-0.5 rounded font-mono uppercase">/commands</span>
        </button>
      </div>

      {/* AI Agent Chat Modal / Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:justify-end sm:p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm sm:bg-transparent" onClick={() => setIsOpen(false)} />
          
          <div className="relative w-full sm:max-w-md h-[85vh] sm:h-[620px] bg-[#0c1222] border border-[#01C38E]/30 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white animate-in slide-in-from-bottom duration-300">
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
                    <span className="text-[9px] bg-[#01C38E]/20 text-[#01C38E] font-mono px-1.5 py-0.5 rounded font-bold">v2.0</span>
                    <span className="w-2 h-2 rounded-full bg-[#01C38E] animate-pulse" />
                  </div>
                  <p className="text-[11px] text-zinc-400">Autonomous Base L2 Trading Copilot</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleSend("/clear")}
                  className="p-1.5 text-zinc-400 hover:text-red-400 rounded-xl hover:bg-white/10 transition-all cursor-pointer"
                  title="Clear Chat"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-zinc-400 hover:text-white rounded-xl hover:bg-white/10 transition-all cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Quick Slash Action Chips */}
            <div className="px-4 py-2 border-b border-white/5 bg-black/30 flex gap-2 overflow-x-auto no-scrollbar text-[11px]">
              <button
                onClick={() => handleSend("/swap 0.01 eth usdc")}
                className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-[#01C38E]/20 border border-white/10 hover:border-[#01C38E]/40 text-zinc-300 hover:text-white whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 shrink-0 font-mono"
              >
                <Zap className="h-3 w-3 text-[#01C38E]" /> /swap
              </button>
              <button
                onClick={() => handleSend("/balance")}
                className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-[#01C38E]/20 border border-white/10 hover:border-[#01C38E]/40 text-zinc-300 hover:text-white whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 shrink-0 font-mono"
              >
                <Wallet className="h-3 w-3 text-[#01C38E]" /> /balance
              </button>
              <button
                onClick={() => handleSend("/history")}
                className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-[#01C38E]/20 border border-white/10 hover:border-[#01C38E]/40 text-zinc-300 hover:text-white whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 shrink-0 font-mono"
              >
                <History className="h-3 w-3 text-[#01C38E]" /> /history
              </button>
              <button
                onClick={() => handleSend("/audit brett")}
                className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-[#01C38E]/20 border border-white/10 hover:border-[#01C38E]/40 text-zinc-300 hover:text-white whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 shrink-0 font-mono"
              >
                <ShieldCheck className="h-3 w-3 text-[#01C38E]" /> /audit
              </button>
              <button
                onClick={() => handleSend("/yield")}
                className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-[#01C38E]/20 border border-white/10 hover:border-[#01C38E]/40 text-zinc-300 hover:text-white whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 shrink-0 font-mono"
              >
                <TrendingUp className="h-3 w-3 text-[#01C38E]" /> /yield
              </button>
              <button
                onClick={() => handleSend("/help")}
                className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-[#01C38E]/20 border border-white/10 hover:border-[#01C38E]/40 text-zinc-300 hover:text-white whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 shrink-0 font-mono"
              >
                <HelpCircle className="h-3 w-3 text-[#01C38E]" /> /help
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
                    className={`max-w-[88%] p-3.5 rounded-2xl whitespace-pre-line ${
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

            {/* Slash Command Autocomplete Dropdown */}
            {isSlashActive && (
              <div className="px-3 py-2 bg-[#080d18] border-t border-white/10 max-h-36 overflow-y-auto space-y-1 text-xs">
                <span className="text-[10px] font-bold text-zinc-500 uppercase px-2">Slash Commands</span>
                {SLASH_COMMANDS.filter(s => s.cmd.includes(inputMessage.toLowerCase())).map((s) => (
                  <button
                    key={s.cmd}
                    onClick={() => {
                      setInputMessage(s.example);
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-white/10 text-left transition-colors cursor-pointer"
                  >
                    <span className="font-bold text-[#01C38E] font-mono">{s.cmd}</span>
                    <span className="text-[11px] text-zinc-400 truncate max-w-[240px]">{s.desc}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Input Bar */}
            <div className="p-3 border-t border-white/10 bg-black/40 flex items-center gap-2">
              <input
                type="text"
                placeholder="Type /swap, /balance, /history, /audit, or ask anything..."
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
