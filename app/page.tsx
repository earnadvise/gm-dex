"use client";

import { useState, useEffect, useRef } from "react";
import { useAccount, useConnect, useDisconnect, useSendTransaction, useReadContract, useWriteContract } from "wagmi";
import { encodeFunctionData, Hex } from "viem";
import { appendBuilderCode, BUILDER_CODE } from "@/lib/builderCode";
import { SUPPORTED_TOKENS } from "@/lib/tokens";
import {
  ArrowRightLeft,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Sun,
  User,
  Wallet,
  X,
  Check,
  AlertCircle,
  Loader2,
} from "lucide-react";

// ─── Wallet Button ───────────────────────────────────────────────────────────
// Only show these wallet names
const ALLOWED_WALLETS = ["coinbase", "metamask", "rabby", "injected"];

function WalletButton() {
  const { address, isConnected } = useAccount();
  const { connectors, connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [showModal, setShowModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  // Filter to only Coinbase, MetaMask, Rabby/Injected
  const filteredConnectors = connectors.filter((c) => {
    const id = c.id.toLowerCase();
    const name = c.name.toLowerCase();
    return ALLOWED_WALLETS.some((w) => id.includes(w) || name.includes(w));
  });

  // Dedupe by normalized name or id
  const seen = new Set<string>();
  const uniqueConnectors = filteredConnectors.filter((c) => {
    const key = c.name.toLowerCase().includes("coinbase") ? "coinbase" : 
                c.name.toLowerCase().includes("metamask") ? "metamask" : c.id;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const short = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "";

  if (isConnected) {
    return (
      <div className="relative" ref={dropRef}>
        <button
          onClick={() => setShowDropdown((v) => !v)}
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
        className="flex items-center gap-2 bg-[#0052ff] hover:bg-[#0045d8] text-white font-semibold rounded-full px-5 py-2.5 transition-all duration-200 shadow-lg shadow-[#0052ff]/30"
      >
        <Wallet className="h-4 w-4" />
        Connect Wallet
      </button>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-[#0c0d12] border border-white/10 rounded-3xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-white">Connect Wallet</h2>
                <p className="text-sm text-zinc-500">Choose your wallet</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                <X className="h-5 w-5 text-zinc-400" />
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {uniqueConnectors.map((connector) => {
                const id = connector.id.toLowerCase();
                const name = connector.name.toLowerCase();
                const isCoinbase = id.includes("coinbase") || name.includes("coinbase");
                const isMetaMask = id.includes("metamask") || name.includes("metamask");

                const icon = isCoinbase ? "🔵" : isMetaMask ? "🦊" : "🐰";
                const label = isCoinbase ? "Coinbase Wallet" : isMetaMask ? "MetaMask" : "Rabby / Browser Wallet";
                const desc = isCoinbase ? "Smart Wallet or EOA" : isMetaMask ? "Browser extension" : "Injected browser wallet";
                return (
                  <button
                    key={connector.uid}
                    disabled={isPending}
                    onClick={() => { connect({ connector }); setShowModal(false); }}
                    className="flex items-center gap-4 w-full p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-2xl transition-all duration-200 group"
                  >
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#0052ff]/20 to-[#ffd700]/20 border border-white/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">{icon}</span>
                    </div>
                    <div className="text-left">
                      <p className="text-white font-semibold text-sm">{label}</p>
                      <p className="text-zinc-500 text-xs">{desc}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-zinc-400 ml-auto transition-colors" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Constants ────────────────────────────────────────────────────────────────
const WETH = "0x4200000000000000000000000000000000000006";
const UNISWAP_V2_ROUTER = "0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24" as `0x${string}`;

const ERC20_ABI = [
  {
    inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "owner", type: "address" }, { name: "spender", type: "address" }],
    name: "allowance",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

const ROUTER_ABI = [
  {
    inputs: [{ name: "amountIn", type: "uint256" }, { name: "path", type: "address[]" }],
    name: "getAmountsOut",
    outputs: [{ name: "amounts", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "amountOutMin", type: "uint256" },
      { name: "path", type: "address[]" },
      { name: "to", type: "address" },
      { name: "deadline", type: "uint256" },
    ],
    name: "swapExactETHForTokens",
    outputs: [{ name: "amounts", type: "uint256[]" }],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { name: "amountIn", type: "uint256" },
      { name: "amountOutMin", type: "uint256" },
      { name: "path", type: "address[]" },
      { name: "to", type: "address" },
      { name: "deadline", type: "uint256" },
    ],
    name: "swapExactTokensForETH",
    outputs: [{ name: "amounts", type: "uint256[]" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "amountIn", type: "uint256" },
      { name: "amountOutMin", type: "uint256" },
      { name: "path", type: "address[]" },
      { name: "to", type: "address" },
      { name: "deadline", type: "uint256" },
    ],
    name: "swapExactTokensForTokens",
    outputs: [{ name: "amounts", type: "uint256[]" }],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function parseAmt(amount: string, decimals: number): bigint {
  if (!amount || isNaN(Number(amount))) return 0n;
  try {
    const [integer, frac = ""] = amount.split(".");
    const trimmed = frac.length > decimals ? frac.slice(0, decimals) : frac.padEnd(decimals, "0");
    return BigInt(integer + trimmed);
  } catch {
    return 0n;
  }
}

function fmtAmt(amount: bigint, decimals: number): string {
  try {
    const s = amount.toString().padStart(decimals + 1, "0");
    const integer = s.slice(0, -decimals);
    const fraction = s.slice(-decimals).replace(/0+$/, "");
    return fraction ? `${integer}.${fraction}` : integer;
  } catch {
    return "0";
  }
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Home() {
  const { address, isConnected } = useAccount();

  // Swap state
  const [amount, setAmount] = useState("");
  const [inputToken, setInputToken] = useState(SUPPORTED_TOKENS[0]); // ETH
  const [outputToken, setOutputToken] = useState(SUPPORTED_TOKENS[1]); // USDC
  const [showInputDD, setShowInputDD] = useState(false);
  const [showOutputDD, setShowOutputDD] = useState(false);
  const [error, setError] = useState("");
  const [txHash, setTxHash] = useState("");

  // Close dropdowns on outside click
  const inputDDRef = useRef<HTMLDivElement>(null);
  const outputDDRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (inputDDRef.current && !inputDDRef.current.contains(e.target as Node)) setShowInputDD(false);
      if (outputDDRef.current && !outputDDRef.current.contains(e.target as Node)) setShowOutputDD(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const amountWei = parseAmt(amount, inputToken.decimals);

  // Build swap path — Token→Token routes through WETH for liquidity
  const buildPath = (): `0x${string}`[] => {
    const inAddr = (inputToken.address || WETH) as `0x${string}`;
    const outAddr = (outputToken.address || WETH) as `0x${string}`;
    // If either side is ETH/WETH, direct path
    if (!inputToken.address || !outputToken.address) return [inAddr, outAddr];
    // Token→Token: route through WETH
    return [inAddr, WETH as `0x${string}`, outAddr];
  };
  const path = buildPath();

  // Quote
  const { data: amountsOut } = useReadContract({
    address: UNISWAP_V2_ROUTER,
    abi: ROUTER_ABI,
    functionName: "getAmountsOut",
    args: amountWei > 0n ? [amountWei, path] : undefined,
    query: { enabled: isConnected && amountWei > 0n },
  });

  const outWei = amountsOut ? (amountsOut as bigint[])[amountsOut.length - 1] : 0n;
  const displayOut = outWei > 0n ? fmtAmt(outWei, outputToken.decimals) : "";

  // Allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: inputToken.address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address && inputToken.address ? [address, UNISWAP_V2_ROUTER] : undefined,
    query: { enabled: isConnected && !!address && !!inputToken.address },
  });

  const isApproved = !inputToken.address || (allowance !== undefined && allowance >= amountWei);

  const { writeContractAsync: approveToken, isPending: isApproving } = useWriteContract();
  const { sendTransactionAsync: sendSwap, isPending: isSwapping } = useSendTransaction();

  const handleApprove = async () => {
    try {
      setError("");
      setTxHash("");
      if (!address || !inputToken.address) return;
      await approveToken({
        address: inputToken.address as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [UNISWAP_V2_ROUTER, amountWei],
      });
      setTimeout(() => refetchAllowance(), 3000);
    } catch (e: any) {
      setError(e?.shortMessage || e?.message || "Approval failed.");
    }
  };

  const handleSwap = async () => {
    try {
      setError("");
      setTxHash("");
      if (!address) return;

      const amountIn = amountWei;
      const amountOutMin = outWei * 95n / 100n; // 5% slippage
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 1200);

      let rawData: Hex;
      let value = 0n;

      if (!inputToken.address) {
        // ETH -> Token
        rawData = encodeFunctionData({
          abi: ROUTER_ABI,
          functionName: "swapExactETHForTokens",
          args: [amountOutMin, path, address, deadline],
        });
        value = amountIn;
      } else if (!outputToken.address) {
        // Token -> ETH
        rawData = encodeFunctionData({
          abi: ROUTER_ABI,
          functionName: "swapExactTokensForETH",
          args: [amountIn, amountOutMin, path, address, deadline],
        });
      } else {
        // Token -> Token
        rawData = encodeFunctionData({
          abi: ROUTER_ABI,
          functionName: "swapExactTokensForTokens",
          args: [amountIn, amountOutMin, path, address, deadline],
        });
      }

      // ✅ Append Builder Code for attribution tracking!
      const dataWithBuilder = appendBuilderCode(rawData);

      const tx = await sendSwap({
        to: UNISWAP_V2_ROUTER,
        data: dataWithBuilder as Hex,
        value,
      });

      setTxHash(tx);
      setAmount("");
    } catch (e: any) {
      setError(e?.shortMessage || e?.message || "Swap failed.");
    }
  };

  const flipTokens = () => {
    setInputToken(outputToken);
    setOutputToken(inputToken);
    setError("");
    setTxHash("");
  };

  const selectInput = (t: typeof SUPPORTED_TOKENS[0]) => {
    setInputToken(t);
    setShowInputDD(false);
    setError("");
    setTxHash("");
    if (t.symbol === outputToken.symbol) setOutputToken(inputToken);
  };

  const selectOutput = (t: typeof SUPPORTED_TOKENS[0]) => {
    setOutputToken(t);
    setShowOutputDD(false);
    setError("");
    setTxHash("");
    if (t.symbol === inputToken.symbol) setInputToken(outputToken);
  };

  const isBusy = isApproving || isSwapping;

  return (
    <div className="flex flex-col min-h-screen bg-[#06070a] text-[#f4f6fa] relative overflow-hidden font-sans">
      {/* Background Glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#0052ff]/8 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-[#ffd700]/5 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#06070a]/60 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#0052ff] to-[#ffd700] p-[2px] shadow-lg shadow-[#0052ff]/20">
              <div className="h-full w-full rounded-[10px] bg-[#06070a] flex items-center justify-center">
                <Sun className="h-5 w-5 text-[#ffd700]" />
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
          <WalletButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[440px] flex flex-col gap-5">

          {/* Swap Card */}
          <div className="bg-[#0c0d14]/80 border border-white/[0.06] rounded-3xl p-5 backdrop-blur-xl shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h1 className="text-lg font-bold flex items-center gap-2">
                <ArrowRightLeft className="h-5 w-5 text-[#0052ff]" />
                Swap
              </h1>
            </div>

            {/* Input */}
            <div className="bg-black/30 border border-white/[0.04] rounded-2xl p-4">
              <label className="text-xs text-zinc-500 font-medium mb-2 block">You sell</label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => { setAmount(e.target.value); setError(""); setTxHash(""); }}
                  className="bg-transparent text-[28px] font-bold text-white outline-none w-full placeholder-zinc-700 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <div className="relative" ref={inputDDRef}>
                  <button
                    onClick={() => { setShowInputDD(!showInputDD); setShowOutputDD(false); }}
                    className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 pl-2 pr-2.5 py-1.5 rounded-full transition-colors shrink-0"
                  >
                    {inputToken.image && <img src={inputToken.image} alt="" className="w-5 h-5 rounded-full" />}
                    <span className="font-bold text-sm">{inputToken.symbol}</span>
                    <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
                  </button>
                  {showInputDD && (
                    <div className="absolute right-0 mt-2 w-44 bg-[#0c0d12] border border-white/10 rounded-2xl shadow-xl z-50 overflow-hidden py-1">
                      {SUPPORTED_TOKENS.map((t) => (
                        <button key={`i-${t.symbol}`} onClick={() => selectInput(t)}
                          className="flex items-center gap-2.5 w-full px-3 py-2.5 hover:bg-white/5 text-left text-sm">
                          {t.image && <img src={t.image} alt="" className="w-5 h-5 rounded-full" />}
                          <span className="font-semibold">{t.symbol}</span>
                          {t.symbol === inputToken.symbol && <Check className="h-3.5 w-3.5 text-[#0052ff] ml-auto" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Flip */}
            <div className="flex justify-center -my-3 relative z-10">
              <button
                onClick={flipTokens}
                className="w-9 h-9 rounded-full bg-[#13141c] border-[3px] border-[#06070a] hover:bg-[#1a1b25] flex items-center justify-center transition-all active:scale-90"
              >
                <ArrowRightLeft className="h-3.5 w-3.5 text-zinc-400 rotate-90" />
              </button>
            </div>

            {/* Output */}
            <div className="bg-black/30 border border-white/[0.04] rounded-2xl p-4">
              <label className="text-xs text-zinc-500 font-medium mb-2 block">You buy</label>
              <div className="flex items-center gap-3">
                <div className="text-[28px] font-bold text-white flex-1 min-h-[42px] flex items-center">
                  {displayOut || <span className="text-zinc-700">0</span>}
                </div>
                <div className="relative" ref={outputDDRef}>
                  <button
                    onClick={() => { setShowOutputDD(!showOutputDD); setShowInputDD(false); }}
                    className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 pl-2 pr-2.5 py-1.5 rounded-full transition-colors shrink-0"
                  >
                    {outputToken.image && <img src={outputToken.image} alt="" className="w-5 h-5 rounded-full" />}
                    <span className="font-bold text-sm">{outputToken.symbol}</span>
                    <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
                  </button>
                  {showOutputDD && (
                    <div className="absolute right-0 mt-2 w-44 bg-[#0c0d12] border border-white/10 rounded-2xl shadow-xl z-50 overflow-hidden py-1">
                      {SUPPORTED_TOKENS.map((t) => (
                        <button key={`o-${t.symbol}`} onClick={() => selectOutput(t)}
                          className="flex items-center gap-2.5 w-full px-3 py-2.5 hover:bg-white/5 text-left text-sm">
                          {t.image && <img src={t.image} alt="" className="w-5 h-5 rounded-full" />}
                          <span className="font-semibold">{t.symbol}</span>
                          {t.symbol === outputToken.symbol && <Check className="h-3.5 w-3.5 text-[#0052ff] ml-auto" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mt-3 flex items-start gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/15 p-3 rounded-xl">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span className="break-words">{error.length > 200 ? error.slice(0, 200) + "..." : error}</span>
              </div>
            )}

            {/* Success */}
            {txHash && (
              <div className="mt-3 flex items-start gap-2 text-xs text-green-400 bg-green-500/10 border border-green-500/15 p-3 rounded-xl">
                <Check className="h-4 w-4 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <span className="font-bold">Swap Submitted!</span>
                  <a
                    href={`https://basescan.org/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 underline hover:text-green-300"
                  >
                    View on Basescan <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            )}

            {/* Action Button */}
            <div className="mt-4">
              {!isConnected ? (
                <WalletButton />
              ) : !amount || Number(amount) <= 0 ? (
                <button disabled className="w-full bg-white/5 border border-white/10 text-zinc-500 font-bold py-4 rounded-2xl cursor-not-allowed text-sm">
                  Enter an amount
                </button>
              ) : !isApproved ? (
                <button
                  onClick={handleApprove}
                  disabled={isApproving}
                  className="w-full bg-[#0052ff] hover:bg-[#0045d8] text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-[#0052ff]/30 active:scale-[0.98] disabled:opacity-60"
                >
                  {isApproving ? <><Loader2 className="h-4 w-4 animate-spin" /> Approving...</> : `Approve ${inputToken.symbol}`}
                </button>
              ) : (
                <button
                  onClick={handleSwap}
                  disabled={isSwapping}
                  className="w-full bg-[#0052ff] hover:bg-[#0045d8] text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-[#0052ff]/30 active:scale-[0.98] disabled:opacity-60"
                >
                  {isSwapping ? <><Loader2 className="h-4 w-4 animate-spin" /> Swapping...</> : "Swap"}
                </button>
              )}
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-5 bg-black/30">
        <div className="max-w-5xl mx-auto px-4 text-center text-xs text-zinc-600">
          © 2026 GM DEX · Powered by Base & Uniswap
        </div>
      </footer>
    </div>
  );
}
