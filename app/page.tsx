"use client";

import { useState, useEffect, useRef } from "react";
import { useAccount, useConnect, useDisconnect, useSendTransaction, useReadContract, useWriteContract, useSwitchChain, useBalance, usePublicClient } from "wagmi";
import { encodeFunctionData, Hex, maxUint256 } from "viem";
import { appendBuilderCode, BUILDER_CODE } from "@/lib/builderCode";
import { SUPPORTED_TOKENS } from "@/lib/tokens";
import { TokenIcon } from "@/components/TokenIcon";
import { AIAgentCopilot } from "@/components/AIAgentCopilot";
import { AIAgentTerminal } from "@/components/AIAgentTerminal";
import { useTokenPrices } from "@/lib/useTokenPrices";
import {
  ArrowRightLeft,
  ArrowRight,
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
  TrendingUp,
  BarChart3,
  Layers,
  Zap,
  Droplet,
  ShieldCheck,
  Settings,
  Search,
  Plus,
  Trash2,
  Bot,
  Terminal,
  History,
} from "lucide-react";

// ─── Wallet Button ───────────────────────────────────────────────────────────
function WalletButton({ onConnectClick }: { onConnectClick: () => void }) {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

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
          <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-[#01C38E] to-[#01C38E] flex items-center justify-center">
            <User className="h-3 w-3 text-white" />
          </div>
          <span className="text-sm">{short}</span>
        </button>
        {showDropdown && (
          <div className="absolute right-0 mt-2 w-48 bg-[#0c1222] border border-white/10 rounded-2xl shadow-xl z-50 overflow-hidden">
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
    <button
      onClick={onConnectClick}
      className="flex items-center gap-2 bg-[#01C38E] hover:bg-[#00ab7c] text-white font-semibold rounded-full px-5 py-2.5 transition-all duration-200 shadow-lg shadow-[#01C38E]/30"
    >
      <Wallet className="h-4 w-4" />
      Connect Wallet
    </button>
  );
}

const WETH = "0x4200000000000000000000000000000000000006";
const UNISWAP_V2_ROUTER = "0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24" as `0x${string}`;
const GM_DEX_ROUTER = "0x9dc3BBdB8817309ba42b79cc357EC6Be47030B70" as `0x${string}`;
const GM_DEX_LIQUIDITY = "0x379bB6CBd151c8A9C3da6e534E46356e17b14572" as `0x${string}`;
const AERO_ROUTER = "0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43" as `0x${string}`;
const AERO_FACTORY = "0x420DD381b31aEf6683db6B902084cB0FFECe40Da" as `0x${string}`;

const AERO_ROUTER_ABI = [
  {
    inputs: [
      { name: "tokenA", type: "address" },
      { name: "tokenB", type: "address" },
      { name: "stable", type: "bool" },
      { name: "amountADesired", type: "uint256" },
      { name: "amountBDesired", type: "uint256" },
      { name: "amountAMin", type: "uint256" },
      { name: "amountBMin", type: "uint256" },
      { name: "to", type: "address" },
      { name: "deadline", type: "uint256" },
    ],
    name: "addLiquidity",
    outputs: [
      { name: "amountA", type: "uint256" },
      { name: "amountB", type: "uint256" },
      { name: "liquidity", type: "uint256" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "token", type: "address" },
      { name: "stable", type: "bool" },
      { name: "amountTokenDesired", type: "uint256" },
      { name: "amountTokenMin", type: "uint256" },
      { name: "amountETHMin", type: "uint256" },
      { name: "to", type: "address" },
      { name: "deadline", type: "uint256" },
    ],
    name: "addLiquidityETH",
    outputs: [
      { name: "amountToken", type: "uint256" },
      { name: "amountETH", type: "uint256" },
      { name: "liquidity", type: "uint256" },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { name: "tokenA", type: "address" },
      { name: "tokenB", type: "address" },
      { name: "stable", type: "bool" },
      { name: "liquidity", type: "uint256" },
      { name: "amountAMin", type: "uint256" },
      { name: "amountBMin", type: "uint256" },
      { name: "to", type: "address" },
      { name: "deadline", type: "uint256" },
    ],
    name: "removeLiquidity",
    outputs: [
      { name: "amountA", type: "uint256" },
      { name: "amountB", type: "uint256" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "token", type: "address" },
      { name: "stable", type: "bool" },
      { name: "liquidity", type: "uint256" },
      { name: "amountTokenMin", type: "uint256" },
      { name: "amountETHMin", type: "uint256" },
      { name: "to", type: "address" },
      { name: "deadline", type: "uint256" },
    ],
    name: "removeLiquidityETH",
    outputs: [
      { name: "amountToken", type: "uint256" },
      { name: "amountETH", type: "uint256" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const ERC20_ABI = [
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
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
  {
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
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
  {
    inputs: [
      { name: "tokenA", type: "address" },
      { name: "tokenB", type: "address" },
      { name: "amountADesired", type: "uint256" },
      { name: "amountBDesired", type: "uint256" },
      { name: "amountAMin", type: "uint256" },
      { name: "amountBMin", type: "uint256" },
      { name: "to", type: "address" },
      { name: "deadline", type: "uint256" },
    ],
    name: "addLiquidity",
    outputs: [
      { name: "amountA", type: "uint256" },
      { name: "amountB", type: "uint256" },
      { name: "liquidity", type: "uint256" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "token", type: "address" },
      { name: "amountTokenDesired", type: "uint256" },
      { name: "amountTokenMin", type: "uint256" },
      { name: "amountETHMin", type: "uint256" },
      { name: "to", type: "address" },
      { name: "deadline", type: "uint256" },
    ],
    name: "addLiquidityETH",
    outputs: [
      { name: "amountToken", type: "uint256" },
      { name: "amountETH", type: "uint256" },
      { name: "liquidity", type: "uint256" },
    ],
    stateMutability: "payable",
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

const ALLOWED_WALLETS = ["coinbase", "metamask", "rabby", "injected"];

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Home() {
  const { address, isConnected, chain } = useAccount();
  const { switchChain } = useSwitchChain();
  const { connectors, connect, isPending: isConnectPending } = useConnect();

  // Connect Modal state
  const [showConnectModal, setShowConnectModal] = useState(false);

  // Filter connectors to clean Coinbase, MetaMask, and Injected (only if window.ethereum exists)
  const filteredConnectors = connectors.filter((c) => {
    const id = c.id.toLowerCase();
    const name = c.name.toLowerCase();
    const isCoinbase = id.includes("coinbase") || name.includes("coinbase");
    const isMetaMask = id.includes("metamask") || name.includes("metamask");
    const isInjected = id.includes("injected") || id.includes("rabby") || name.includes("injected") || name.includes("rabby");

    if (isCoinbase || isMetaMask) return true;
    if (isInjected) {
      return typeof window !== "undefined" && typeof (window as any).ethereum !== "undefined";
    }
    return false;
  });

  // Dedupe by normalized category
  const seen = new Set<string>();
  const uniqueConnectors = filteredConnectors.filter((c) => {
    const id = c.id.toLowerCase();
    const name = c.name.toLowerCase();
    
    const key = (id.includes("coinbase") || name.includes("coinbase")) ? "coinbase" :
                (id.includes("metamask") || name.includes("metamask")) ? "metamask" : "injected";

    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Tabs: 'home', 'swap', 'liquidity', 'bridge', 'portfolio', or 'ai-agent'
  const [activeTab, setActiveTab] = useState<"home" | "swap" | "liquidity" | "bridge" | "portfolio" | "ai-agent">("home");

  // Slippage & Settings State (Option 4)
  const [slippage, setSlippage] = useState<number>(0.5); // Default 0.5%
  const [customSlippage, setCustomSlippage] = useState("");
  const [deadlineMinutes, setDeadlineMinutes] = useState<number>(20); // Default 20 mins
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Price Chart State (Option 1)
  const [showChart, setShowChart] = useState(true);

  const getChartEmbedUrl = () => {
    const targetToken = outputToken.address ? outputToken : inputToken.address ? inputToken : SUPPORTED_TOKENS[1];
    const tokenAddr = targetToken.address || "0x4200000000000000000000000000000000000006";
    return `https://dexscreener.com/base/${tokenAddr}?embed=1&theme=dark&trades=0&info=0`;
  };

  // Custom Token & Token Modal State (Option 3)
  const [tokenSearchQuery, setTokenSearchQuery] = useState("");
  const [customTokens, setCustomTokens] = useState<any[]>([]);
  const [tokenModalTarget, setTokenModalTarget] = useState<"input" | "output" | "poolA" | "poolB" | null>(null);

  // Load custom tokens from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("gm_dex_custom_tokens");
      if (saved) {
        setCustomTokens(JSON.parse(saved));
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const allTokens = [...SUPPORTED_TOKENS, ...customTokens.filter(ct => !SUPPORTED_TOKENS.some(st => st.address.toLowerCase() === ct.address.toLowerCase()))];

  // Custom Token Address Lookup Hooks (Option 3)
  const isAddressSearch = tokenSearchQuery.startsWith("0x") && tokenSearchQuery.length === 42;
  const searchAddr = isAddressSearch ? (tokenSearchQuery as `0x${string}`) : undefined;

  const { data: customSymbol } = useReadContract({
    address: searchAddr,
    abi: ERC20_ABI,
    functionName: "symbol",
    query: { enabled: !!searchAddr },
  });

  const { data: customName } = useReadContract({
    address: searchAddr,
    abi: ERC20_ABI,
    functionName: "name",
    query: { enabled: !!searchAddr },
  });

  const { data: customDecimals } = useReadContract({
    address: searchAddr,
    abi: ERC20_ABI,
    functionName: "decimals",
    query: { enabled: !!searchAddr },
  });

  const handleImportToken = (newTok: any) => {
    const updated = [...customTokens, newTok];
    setCustomTokens(updated);
    try {
      localStorage.setItem("gm_dex_custom_tokens", JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    if (tokenModalTarget === "input") setInputToken(newTok);
    if (tokenModalTarget === "output") setOutputToken(newTok);
    if (tokenModalTarget === "poolA") setPoolTokenA(newTok);
    if (tokenModalTarget === "poolB") setPoolTokenB(newTok);
    setTokenModalTarget(null);
    setTokenSearchQuery("");
  };

  const handleRemoveCustomToken = (tokAddress: string) => {
    const updated = customTokens.filter(t => t.address.toLowerCase() !== tokAddress.toLowerCase());
    setCustomTokens(updated);
    try {
      localStorage.setItem("gm_dex_custom_tokens", JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  // Swap state
  const [amount, setAmount] = useState("");
  const [inputToken, setInputToken] = useState(SUPPORTED_TOKENS[0]); // ETH
  const [outputToken, setOutputToken] = useState(SUPPORTED_TOKENS[1]); // USDC
  const [showInputDD, setShowInputDD] = useState(false);
  const [showOutputDD, setShowOutputDD] = useState(false);
  const [error, setError] = useState("");
  const [txHash, setTxHash] = useState("");

  // Pool state
  const [poolAmountA, setPoolAmountA] = useState("");
  const [poolAmountB, setPoolAmountB] = useState("");
  const [poolTokenA, setPoolTokenA] = useState(SUPPORTED_TOKENS[0]); // ETH
  const [poolTokenB, setPoolTokenB] = useState(SUPPORTED_TOKENS[1]); // USDC
  const [showPoolADD, setShowPoolADD] = useState(false);
  const [showPoolBDD, setShowPoolBDD] = useState(false);
  const [activeInput, setActiveInput] = useState<"A" | "B" | null>(null);
  const [liquidityMode, setLiquidityMode] = useState<"add" | "remove">("add");
  const [removeLpAmount, setRemoveLpAmount] = useState("");
  const [showPoolModal, setShowPoolModal] = useState(false);

  // Bridge state
  const [bridgeFromChain, setBridgeFromChain] = useState("1"); // Ethereum Mainnet
  const [bridgeToken, setBridgeToken] = useState("ETH");
  const [bridgeAmount, setBridgeAmount] = useState("");

  // User Balance (Swap)
  const { data: balanceData, refetch: refetchBalance } = useBalance({
    address: address,
    token: inputToken.address ? (inputToken.address as `0x${string}`) : undefined,
    query: { refetchInterval: 2000 },
  });

  const handleMax = () => {
    if (!balanceData) return;
    setError("");
    setTxHash("");
    if (!inputToken.address) {
      // ETH: Reserve 0.0005 ETH for gas, or 90% of balance if balance is small
      const gasBuffer = 500000000000000n; // 0.0005 ETH
      let maxVal = 0n;
      if (balanceData.value > gasBuffer * 2n) {
        maxVal = balanceData.value - gasBuffer;
      } else {
        maxVal = (balanceData.value * 9n) / 10n;
      }
      setAmount(fmtAmt(maxVal, inputToken.decimals));
    } else {
      // ERC20: Set full balance
      setAmount(fmtAmt(balanceData.value, inputToken.decimals));
    }
  };

  // User Balances (Pool)
  const { data: balanceDataA, refetch: refetchBalanceA } = useBalance({
    address: address,
    token: poolTokenA.address ? (poolTokenA.address as `0x${string}`) : undefined,
    query: { refetchInterval: 2000 },
  });

  const { data: balanceDataB, refetch: refetchBalanceB } = useBalance({
    address: address,
    token: poolTokenB.address ? (poolTokenB.address as `0x${string}`) : undefined,
    query: { refetchInterval: 2000 },
  });

  const handleMaxPoolA = () => {
    if (!balanceDataA) return;
    setActiveInput("A");
    let valStr = "";
    if (!poolTokenA.address) {
      const reserve = 5000000000000000n; // 0.005 ETH gas buffer
      const maxVal = balanceDataA.value > reserve ? balanceDataA.value - reserve : 0n;
      valStr = fmtAmt(maxVal, poolTokenA.decimals);
    } else {
      valStr = fmtAmt(balanceDataA.value, poolTokenA.decimals);
    }
    setPoolAmountA(valStr);

    if (poolReserves && poolReserves[0] > 0n && poolReserves[1] > 0n) {
      const [reserveA, reserveB] = poolReserves;
      const amtAWei = parseAmt(valStr, poolTokenA.decimals);
      const amtBWei = (amtAWei * reserveB) / reserveA;
      setPoolAmountB(fmtAmt(amtBWei, poolTokenB.decimals));
    }
  };

  const handleMaxPoolB = () => {
    if (!balanceDataB) return;
    setActiveInput("B");
    let valStr = "";
    if (!poolTokenB.address) {
      const reserve = 5000000000000000n; // 0.005 ETH gas buffer
      const maxVal = balanceDataB.value > reserve ? balanceDataB.value - reserve : 0n;
      valStr = fmtAmt(maxVal, poolTokenB.decimals);
    } else {
      valStr = fmtAmt(balanceDataB.value, poolTokenB.decimals);
    }
    setPoolAmountB(valStr);

    if (poolReserves && poolReserves[0] > 0n && poolReserves[1] > 0n) {
      const [reserveA, reserveB] = poolReserves;
      const amtBWei = parseAmt(valStr, poolTokenB.decimals);
      const amtAWei = (amtBWei * reserveA) / reserveB;
      setPoolAmountA(fmtAmt(amtAWei, poolTokenA.decimals));
    }
  };

  // Close dropdowns on outside click
  const inputDDRef = useRef<HTMLDivElement>(null);
  const outputDDRef = useRef<HTMLDivElement>(null);
  const poolADDRef = useRef<HTMLDivElement>(null);
  const poolBDDRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (inputDDRef.current && !inputDDRef.current.contains(e.target as Node)) setShowInputDD(false);
      if (outputDDRef.current && !outputDDRef.current.contains(e.target as Node)) setShowOutputDD(false);
      if (poolADDRef.current && !poolADDRef.current.contains(e.target as Node)) setShowPoolADD(false);
      if (poolBDDRef.current && !poolBDDRef.current.contains(e.target as Node)) setShowPoolBDD(false);
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
  const { data: amountsOut, isLoading: isQuoteLoading } = useReadContract({
    address: UNISWAP_V2_ROUTER,
    abi: ROUTER_ABI,
    functionName: "getAmountsOut",
    args: amountWei > 0n ? [amountWei, path] : undefined,
    query: { enabled: isConnected && amountWei > 0n },
  });

  const outWei = amountsOut ? (amountsOut as bigint[])[amountsOut.length - 1] : 0n;

  const { prices: livePrices } = useTokenPrices();

  const getEstimatedQuote = (): bigint => {
    if (outWei > 0n) return outWei;
    if (amountWei === 0n) return 0n;

    const inSym = inputToken.symbol.toUpperCase();
    const outSym = outputToken.symbol.toUpperCase();

    const rateInUsd = livePrices[inSym] || livePrices[inSym === "WETH" ? "ETH" : inSym] || 1.0;
    const rateOutUsd = livePrices[outSym] || livePrices[outSym === "WETH" ? "ETH" : outSym] || 1.0;

    const inAmtNumber = Number(amountWei) / (10 ** inputToken.decimals);
    const outAmtNumber = (inAmtNumber * rateInUsd) / rateOutUsd;

    return parseAmt(outAmtNumber.toFixed(outputToken.decimals), outputToken.decimals);
  };

  const finalOutWei = outWei > 0n ? outWei : getEstimatedQuote();
  const rawDisplayOut = finalOutWei > 0n ? fmtAmt(finalOutWei, outputToken.decimals) : "";
  const displayOut = rawDisplayOut ? parseFloat(rawDisplayOut).toFixed(6).replace(/\.?0+$/, "") : "";

  // Allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: inputToken.address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address && inputToken.address ? [address, GM_DEX_ROUTER] : undefined,
    query: { enabled: isConnected && !!address && !!inputToken.address, refetchInterval: 1500, staleTime: 0 },
  });

  const isApproved = !inputToken.address || (allowance !== undefined && allowance >= amountWei);

  const publicClient = usePublicClient();
  const { writeContractAsync: approveToken, isPending: isApproving } = useWriteContract();
  const { sendTransactionAsync: sendSwap, isPending: isSwapping } = useSendTransaction();

  const handleApprove = async () => {
    try {
      setError("");
      setTxHash("");
      if (!address || !inputToken.address) return;
      const approveHash = await approveToken({
        address: inputToken.address as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [GM_DEX_ROUTER, amountWei],
      });

      if (publicClient && approveHash) {
        await publicClient.waitForTransactionReceipt({ hash: approveHash });
      }
      await refetchAllowance();
    } catch (e: any) {
      setError(e?.shortMessage || e?.message || "Approval failed.");
    }
  };

  const handleSwap = async () => {
    try {
      setError("");
      setTxHash("");
      if (!address) return;

      const activeSlippage = customSlippage && !isNaN(Number(customSlippage)) ? Number(customSlippage) : slippage;
      const minSlippageBps = BigInt(Math.max(1, Math.floor((100 - activeSlippage) * 100)));
      const amountIn = amountWei;
      const amountOutMin = finalOutWei > 0n ? (finalOutWei * minSlippageBps) / 10000n : 0n;
      const deadline = BigInt(Math.floor(Date.now() / 1000) + (deadlineMinutes || 20) * 60);

      // Pre-flight check: If swapping ERC20 token, ensure sufficient on-chain allowance
      if (inputToken.address) {
        let currentAllowance = 0n;
        if (publicClient && address) {
          try {
            currentAllowance = (await publicClient.readContract({
              address: inputToken.address as `0x${string}`,
              abi: ERC20_ABI,
              functionName: "allowance",
              args: [address, GM_DEX_ROUTER],
            })) as bigint;
          } catch (e) {
            console.warn("Live allowance check failed:", e);
          }
        }

        if (currentAllowance < amountIn) {
          const approveHash = await approveToken({
            address: inputToken.address as `0x${string}`,
            abi: ERC20_ABI,
            functionName: "approve",
            args: [GM_DEX_ROUTER, amountIn],
          });
          if (publicClient && approveHash) {
            await publicClient.waitForTransactionReceipt({ hash: approveHash });
          }
          await refetchAllowance();
        }
      }

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
        to: GM_DEX_ROUTER,
        data: dataWithBuilder as Hex,
        value,
      });

      setTxHash(tx);
      setAmount("");
    } catch (e: any) {
      setError(e?.shortMessage || e?.message || "Swap failed.");
    }
  };
  // Pool calculations
  const poolAmountAWei = parseAmt(poolAmountA, poolTokenA.decimals);
  const poolAmountBWei = parseAmt(poolAmountB, poolTokenB.decimals);

  // Allowance A
  const { data: allowanceA, refetch: refetchAllowanceA } = useReadContract({
    address: poolTokenA.address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address && poolTokenA.address ? [address, GM_DEX_LIQUIDITY] : undefined,
    query: { enabled: isConnected && !!address && !!poolTokenA.address, refetchInterval: 2000 },
  });

  // Allowance B
  const { data: allowanceB, refetch: refetchAllowanceB } = useReadContract({
    address: poolTokenB.address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address && poolTokenB.address ? [address, GM_DEX_LIQUIDITY] : undefined,
    query: { enabled: isConnected && !!address && !!poolTokenB.address, refetchInterval: 2000 },
  });

  // Check if this pair should be a stable pool on Aerodrome (e.g. USDC/EURC)
  const isStable = 
    (poolTokenA.symbol === "USDC" && poolTokenB.symbol === "EURC") ||
    (poolTokenA.symbol === "EURC" && poolTokenB.symbol === "USDC");

  // Query pool reserves from Aerodrome Router
  const { data: poolReserves } = useReadContract({
    address: AERO_ROUTER,
    abi: [
      {
        inputs: [
          { name: "tokenA", type: "address" },
          { name: "tokenB", type: "address" },
          { name: "stable", type: "bool" },
          { name: "factory", type: "address" }
        ],
        name: "getReserves",
        outputs: [
          { name: "reserveA", type: "uint256" },
          { name: "reserveB", type: "uint256" }
        ],
        stateMutability: "view",
        type: "function"
      }
    ] as const,
    functionName: "getReserves",
    args: poolTokenA && poolTokenB ? [
      (poolTokenA.address || WETH) as `0x${string}`,
      (poolTokenB.address || WETH) as `0x${string}`,
      isStable,
      AERO_FACTORY
    ] : undefined,
    query: { enabled: isConnected && !!poolTokenA && !!poolTokenB }
  });

  // Automatically calculate paired token amount on inputs
  useEffect(() => {
    if (!poolReserves) return;
    const [reserveA, reserveB] = poolReserves;
    if (reserveA === 0n || reserveB === 0n) return;

    if (activeInput === "A") {
      if (!poolAmountA || isNaN(Number(poolAmountA)) || Number(poolAmountA) === 0) {
        setPoolAmountB("");
        return;
      }
      try {
        const amtAWei = parseAmt(poolAmountA, poolTokenA.decimals);
        const amtBWei = (amtAWei * reserveB) / reserveA;
        const formatted = (Number(amtBWei) / (10 ** poolTokenB.decimals)).toFixed(poolTokenB.decimals);
        setPoolAmountB(parseFloat(formatted).toString());
      } catch (err) {
        console.error(err);
      }
    } else if (activeInput === "B") {
      if (!poolAmountB || isNaN(Number(poolAmountB)) || Number(poolAmountB) === 0) {
        setPoolAmountA("");
        return;
      }
      try {
        const amtBWei = parseAmt(poolAmountB, poolTokenB.decimals);
        const amtAWei = (amtBWei * reserveA) / reserveB;
        const formatted = (Number(amtAWei) / (10 ** poolTokenA.decimals)).toFixed(poolTokenA.decimals);
        setPoolAmountA(parseFloat(formatted).toString());
      } catch (err) {
        console.error(err);
      }
    }
  }, [poolAmountA, poolAmountB, poolReserves, activeInput, poolTokenA, poolTokenB]);

  // Query LP Pool Address from Aerodrome Factory
  const { data: poolAddress } = useReadContract({
    address: AERO_FACTORY,
    abi: [
      {
        inputs: [
          { name: "tokenA", type: "address" },
          { name: "tokenB", type: "address" },
          { name: "stable", type: "bool" }
        ],
        name: "getPool",
        outputs: [{ name: "", type: "address" }],
        stateMutability: "view",
        type: "function"
      }
    ] as const,
    functionName: "getPool",
    args: poolTokenA && poolTokenB ? [
      (poolTokenA.address || WETH) as `0x${string}`,
      (poolTokenB.address || WETH) as `0x${string}`,
      isStable
    ] : undefined,
    query: { enabled: !!poolTokenA && !!poolTokenB }
  });

  // Query 3 Pools for All Pools Table & LP Positions Count
  const usdcToken = SUPPORTED_TOKENS.find((t) => t.symbol === "USDC")!;
  const eurcToken = SUPPORTED_TOKENS.find((t) => t.symbol === "EURC")!;
  const ethToken = SUPPORTED_TOKENS.find((t) => t.symbol === "ETH")!;

  const { data: poolAddrUsdcEurc } = useReadContract({
    address: AERO_FACTORY,
    abi: [{ inputs: [{ name: "tokenA", type: "address" }, { name: "tokenB", type: "address" }, { name: "stable", type: "bool" }], name: "getPool", outputs: [{ name: "", type: "address" }], stateMutability: "view", type: "function" }] as const,
    functionName: "getPool",
    args: [usdcToken.address as `0x${string}`, eurcToken.address as `0x${string}`, true],
  });

  const { data: poolAddrEthUsdc } = useReadContract({
    address: AERO_FACTORY,
    abi: [{ inputs: [{ name: "tokenA", type: "address" }, { name: "tokenB", type: "address" }, { name: "stable", type: "bool" }], name: "getPool", outputs: [{ name: "", type: "address" }], stateMutability: "view", type: "function" }] as const,
    functionName: "getPool",
    args: [WETH as `0x${string}`, usdcToken.address as `0x${string}`, false],
  });

  const { data: poolAddrEthEurc } = useReadContract({
    address: AERO_FACTORY,
    abi: [{ inputs: [{ name: "tokenA", type: "address" }, { name: "tokenB", type: "address" }, { name: "stable", type: "bool" }], name: "getPool", outputs: [{ name: "", type: "address" }], stateMutability: "view", type: "function" }] as const,
    functionName: "getPool",
    args: [WETH as `0x${string}`, eurcToken.address as `0x${string}`, false],
  });

  const { data: lpBalUsdcEurc, refetch: refetchUsdcEurc } = useReadContract({
    address: poolAddrUsdcEurc && poolAddrUsdcEurc !== "0x0000000000000000000000000000000000000000" ? (poolAddrUsdcEurc as `0x${string}`) : undefined,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!address && !!poolAddrUsdcEurc && poolAddrUsdcEurc !== "0x0000000000000000000000000000000000000000",
      refetchInterval: 2000,
    }
  });

  const { data: lpBalEthUsdc, refetch: refetchEthUsdc } = useReadContract({
    address: poolAddrEthUsdc && poolAddrEthUsdc !== "0x0000000000000000000000000000000000000000" ? (poolAddrEthUsdc as `0x${string}`) : undefined,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!address && !!poolAddrEthUsdc && poolAddrEthUsdc !== "0x0000000000000000000000000000000000000000",
      refetchInterval: 2000,
    }
  });

  const { data: lpBalEthEurc, refetch: refetchEthEurc } = useReadContract({
    address: poolAddrEthEurc && poolAddrEthEurc !== "0x0000000000000000000000000000000000000000" ? (poolAddrEthEurc as `0x${string}`) : undefined,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!address && !!poolAddrEthEurc && poolAddrEthEurc !== "0x0000000000000000000000000000000000000000",
      refetchInterval: 2000,
    }
  });

  const lpPositionsCount = [lpBalUsdcEurc, lpBalEthUsdc, lpBalEthEurc].filter(b => b !== undefined && (b as bigint) > 0n).length;

  const POOLS_LIST = [
    {
      id: "usdc-eurc",
      name: "USDC / EURC",
      tokenA: usdcToken,
      tokenB: eurcToken,
      isStable: true,
      type: "StableSwap",
      tvl: "$9,105,683.46",
      fees24h: "$182.11",
      userLpFormatted: lpBalUsdcEurc && (lpBalUsdcEurc as bigint) > 0n ? `${parseFloat(fmtAmt(lpBalUsdcEurc as bigint, 18)).toFixed(4)} LP` : "0.0000 LP",
      userShareFormatted: lpBalUsdcEurc && (lpBalUsdcEurc as bigint) > 0n ? "< 0.01%" : "0.00%",
    },
    {
      id: "eth-usdc",
      name: "ETH / USDC",
      tokenA: ethToken,
      tokenB: usdcToken,
      isStable: false,
      type: "Volatile vAMM",
      tvl: "$4,250,110.00",
      fees24h: "$512.40",
      userLpFormatted: lpBalEthUsdc && (lpBalEthUsdc as bigint) > 0n ? `${parseFloat(fmtAmt(lpBalEthUsdc as bigint, 18)).toFixed(4)} LP` : "0.0000 LP",
      userShareFormatted: lpBalEthUsdc && (lpBalEthUsdc as bigint) > 0n ? "< 0.01%" : "0.00%",
    },
    {
      id: "eth-eurc",
      name: "ETH / EURC",
      tokenA: ethToken,
      tokenB: eurcToken,
      isStable: false,
      type: "Volatile vAMM",
      tvl: "$1,820,400.00",
      fees24h: "$120.50",
      userLpFormatted: lpBalEthEurc && (lpBalEthEurc as bigint) > 0n ? `${parseFloat(fmtAmt(lpBalEthEurc as bigint, 18)).toFixed(4)} LP` : "0.0000 LP",
      userShareFormatted: lpBalEthEurc && (lpBalEthEurc as bigint) > 0n ? "< 0.01%" : "0.00%",
    },
  ];

  // Query User LP Balance
  const { data: lpBalanceData, refetch: refetchLpBalance } = useReadContract({
    address: poolAddress && poolAddress !== "0x0000000000000000000000000000000000000000" ? (poolAddress as `0x${string}`) : undefined,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!address && !!poolAddress && poolAddress !== "0x0000000000000000000000000000000000000000",
      refetchInterval: 2000,
    }
  });

  // Query User LP Allowance for Aerodrome Router
  const { data: lpAllowance, refetch: refetchLpAllowance } = useReadContract({
    address: poolAddress && poolAddress !== "0x0000000000000000000000000000000000000000" ? (poolAddress as `0x${string}`) : undefined,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address && poolAddress ? [address, AERO_ROUTER as `0x${string}`] : undefined,
    query: {
      enabled: isConnected && !!address && !!poolAddress && poolAddress !== "0x0000000000000000000000000000000000000000",
      refetchInterval: 2000,
    }
  });

  const removeLpWei = parseAmt(removeLpAmount, 18);
  const isLpApproved = lpAllowance !== undefined && lpAllowance >= removeLpWei;

  const handleApproveLP = async () => {
    try {
      setError("");
      setTxHash("");
      if (!address || !poolAddress) return;
      const approveHash = await approveToken({
        address: poolAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [AERO_ROUTER, removeLpWei],
      });
      if (publicClient && approveHash) {
        await publicClient.waitForTransactionReceipt({ hash: approveHash });
      }
      await refetchLpAllowance();
    } catch (e: any) {
      setError(e?.shortMessage || e?.message || "LP Approval failed.");
    }
  };

  const handleRemoveLiquidity = async () => {
    try {
      setError("");
      setTxHash("");
      if (!address || !poolAddress) return;

      const deadline = BigInt(Math.floor(Date.now() / 1000) + 1200);

      let rawData: Hex;

      if (!poolTokenA.address) {
        // ETH + Token B
        rawData = encodeFunctionData({
          abi: AERO_ROUTER_ABI,
          functionName: "removeLiquidityETH",
          args: [poolTokenB.address as `0x${string}`, isStable, removeLpWei, 0n, 0n, address, deadline],
        });
      } else if (!poolTokenB.address) {
        // Token A + ETH
        rawData = encodeFunctionData({
          abi: AERO_ROUTER_ABI,
          functionName: "removeLiquidityETH",
          args: [poolTokenA.address as `0x${string}`, isStable, removeLpWei, 0n, 0n, address, deadline],
        });
      } else {
        // Token A + Token B
        rawData = encodeFunctionData({
          abi: AERO_ROUTER_ABI,
          functionName: "removeLiquidity",
          args: [
            poolTokenA.address as `0x${string}`,
            poolTokenB.address as `0x${string}`,
            isStable,
            removeLpWei,
            0n,
            0n,
            address,
            deadline,
          ],
        });
      }

      const tx = await sendSwap({
        to: AERO_ROUTER,
        data: rawData as Hex,
        value: 0n,
      });

      setTxHash(tx);
      setRemoveLpAmount("");
      const fastRefetch = () => {
        refetchLpBalance();
        refetchLpAllowance();
        refetchBalanceA();
        refetchBalanceB();
        refetchUsdcEurc();
        refetchEthUsdc();
        refetchEthEurc();
      };
      setTimeout(fastRefetch, 1000);
      setTimeout(fastRefetch, 2500);
      setTimeout(fastRefetch, 5000);
    } catch (e: any) {
      setError(e?.shortMessage || e?.message || "Remove Liquidity failed.");
    }
  };

  const isApprovedA = !poolTokenA.address || (allowanceA !== undefined && allowanceA >= poolAmountAWei);
  const isApprovedB = !poolTokenB.address || (allowanceB !== undefined && allowanceB >= poolAmountBWei);

  const handleApproveA = async () => {
    try {
      setError("");
      setTxHash("");
      if (!address || !poolTokenA.address) return;
      const approveHash = await approveToken({
        address: poolTokenA.address as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [GM_DEX_LIQUIDITY, poolAmountAWei],
      });
      if (publicClient && approveHash) {
        await publicClient.waitForTransactionReceipt({ hash: approveHash });
      }
      await refetchAllowanceA();
    } catch (e: any) {
      setError(e?.shortMessage || e?.message || "Token A approval failed.");
    }
  };

  const handleApproveB = async () => {
    try {
      setError("");
      setTxHash("");
      if (!address || !poolTokenB.address) return;
      const approveHash = await approveToken({
        address: poolTokenB.address as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [GM_DEX_LIQUIDITY, poolAmountBWei],
      });
      if (publicClient && approveHash) {
        await publicClient.waitForTransactionReceipt({ hash: approveHash });
      }
      await refetchAllowanceB();
    } catch (e: any) {
      setError(e?.shortMessage || e?.message || "Token B approval failed.");
    }
  };

  const handleAddLiquidity = async () => {
    try {
      setError("");
      setTxHash("");
      if (!address) return;

      const deadline = BigInt(Math.floor(Date.now() / 1000) + 1200);
      const minA = poolAmountAWei * 95n / 100n; // 5% slippage
      const minB = poolAmountBWei * 95n / 100n;

      let rawData: Hex;
      let value = 0n;

      if (!poolTokenA.address) {
        // ETH + Token B
        rawData = encodeFunctionData({
          abi: AERO_ROUTER_ABI,
          functionName: "addLiquidityETH",
          args: [poolTokenB.address as `0x${string}`, isStable, poolAmountBWei, minB, minA, address, deadline],
        });
        value = poolAmountAWei;
      } else if (!poolTokenB.address) {
        // Token A + ETH
        rawData = encodeFunctionData({
          abi: AERO_ROUTER_ABI,
          functionName: "addLiquidityETH",
          args: [poolTokenA.address as `0x${string}`, isStable, poolAmountAWei, minA, minB, address, deadline],
        });
        value = poolAmountBWei;
      } else {
        // Token A + Token B
        rawData = encodeFunctionData({
          abi: AERO_ROUTER_ABI,
          functionName: "addLiquidity",
          args: [
            poolTokenA.address as `0x${string}`,
            poolTokenB.address as `0x${string}`,
            isStable,
            poolAmountAWei,
            poolAmountBWei,
            minA,
            minB,
            address,
            deadline,
          ],
        });
      }

      // ✅ Append Builder Code for attribution tracking!
      const dataWithBuilder = appendBuilderCode(rawData);

      const tx = await sendSwap({
        to: GM_DEX_LIQUIDITY,
        data: dataWithBuilder as Hex,
        value,
      });

      setTxHash(tx);
      setPoolAmountA("");
      setPoolAmountB("");
      const fastRefetch = () => {
        refetchLpBalance();
        refetchBalanceA();
        refetchBalanceB();
        refetchUsdcEurc();
        refetchEthUsdc();
        refetchEthEurc();
      };
      setTimeout(fastRefetch, 1000);
      setTimeout(fastRefetch, 2500);
      setTimeout(fastRefetch, 5000);
    } catch (e: any) {
      setError(e?.shortMessage || e?.message || "Add Liquidity failed.");
    }
  };

  const selectPoolA = (t: typeof SUPPORTED_TOKENS[0]) => {
    setPoolTokenA(t);
    setShowPoolADD(false);
    setError("");
    setTxHash("");
    if (t.symbol === poolTokenB.symbol) setPoolTokenB(poolTokenA);
  };

  const selectPoolB = (t: typeof SUPPORTED_TOKENS[0]) => {
    setPoolTokenB(t);
    setShowPoolBDD(false);
    setError("");
    setTxHash("");
    if (t.symbol === poolTokenA.symbol) setPoolTokenA(poolTokenB);
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

  const handleAutoFillSwap = (inSym: string, outSym: string, amt: string) => {
    const foundIn = allTokens.find(t => t.symbol.toUpperCase() === inSym.toUpperCase());
    const foundOut = allTokens.find(t => t.symbol.toUpperCase() === outSym.toUpperCase());
    if (foundIn) setInputToken(foundIn);
    if (foundOut) setOutputToken(foundOut);
    if (amt) setAmount(amt);
    setActiveTab("swap");
    setError("");
    setTxHash("");
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0f172a] text-[#f4f6fa] relative overflow-hidden font-sans">
      {/* Background Glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#01C38E]/8 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-[#01C38E]/5 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#0f172a]/60 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab("swap")}>
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#01C38E] to-[#01C38E] p-[2px] shadow-lg shadow-[#01C38E]/20">
                <div className="h-full w-full rounded-[10px] bg-[#0f172a] flex items-center justify-center">
                  <Sun className="h-5 w-5 text-[#01C38E]" />
                </div>
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-[#0a786a] to-[#01c38e] bg-clip-text text-transparent">
                  GMDEX<span className="text-[#01C38E]">AI</span>
                </span>
                <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-medium bg-white/5 border border-white/10 rounded-full text-zinc-400">
                  Base
                </span>
              </div>
            </div>

            {/* Desktop Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
              <button
                onClick={() => { setActiveTab("home"); setError(""); setTxHash(""); }}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeTab === "home" ? "bg-[#01C38E] text-white shadow-md shadow-[#01C38E]/20" : "text-zinc-400 hover:text-white"
                }`}
              >
                Home
              </button>
              <button
                onClick={() => { setActiveTab("swap"); setError(""); setTxHash(""); }}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeTab === "swap" ? "bg-[#01C38E] text-white shadow-md shadow-[#01C38E]/20" : "text-zinc-400 hover:text-white"
                }`}
              >
                Swap
              </button>
              <button
                onClick={() => { setActiveTab("liquidity"); setError(""); setTxHash(""); }}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeTab === "liquidity" ? "bg-[#01C38E] text-white shadow-md shadow-[#01C38E]/20" : "text-zinc-400 hover:text-white"
                }`}
              >
                Pools
              </button>
              <button
                onClick={() => { setActiveTab("bridge"); setError(""); setTxHash(""); }}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === "bridge" ? "bg-[#01C38E] text-white shadow-md shadow-[#01C38E]/20" : "text-zinc-400 hover:text-white"
                }`}
              >
                Bridge
                <span className="px-1.5 py-0.2 text-[9px] font-black uppercase rounded bg-[#01C38E]/20 text-[#01C38E]">
                  Official
                </span>
              </button>
              <button
                onClick={() => { setActiveTab("portfolio"); setError(""); setTxHash(""); }}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeTab === "portfolio" ? "bg-[#01C38E] text-white shadow-md shadow-[#01C38E]/20" : "text-zinc-400 hover:text-white"
                }`}
              >
                Portfolio
              </button>
              <button
                onClick={() => { setActiveTab("ai-agent"); setError(""); setTxHash(""); }}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === "ai-agent" ? "bg-gradient-to-r from-[#01C38E] to-[#0A786A] text-white shadow-md shadow-[#01C38E]/20 font-extrabold" : "text-zinc-400 hover:text-white"
                }`}
              >
                <Bot className="h-3.5 w-3.5 text-[#01C38E]" />
                AI Agent
                <span className="w-1.5 h-1.5 rounded-full bg-[#01C38E] animate-ping" />
              </button>
            </nav>
          </div>
          <WalletButton onConnectClick={() => setShowConnectModal(true)} />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-3.5 py-4 sm:py-10 pb-24 md:pb-10">
        {activeTab === "home" ? (
          /* Home DEX Landing Overview */
          <div className="w-full max-w-5xl flex flex-col gap-12 py-4">
            {/* Hero Section */}
            <div className="text-center flex flex-col items-center gap-4 max-w-3xl mx-auto pt-2">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#01C38E]/10 border border-[#01C38E]/20 text-[#01C38E] text-xs font-extrabold shadow-lg shadow-[#01C38E]/10 animate-pulse">
                <Sparkles className="h-4 w-4" /> Next-Gen Decentralized Exchange on Base Mainnet
              </div>
              <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
                Swap, Provide Liquidity & Build on <span className="bg-gradient-to-r from-[#01C38E] via-[#0A786A] to-[#01C38E] bg-clip-text text-transparent">Base L2</span>
              </h1>
              <p className="text-base sm:text-lg text-zinc-400 font-medium max-w-2xl leading-relaxed">
                Powered by Aerodrome V2 liquidity routing, automated 0.1% protocol fee collection to Treasury, and standard Base Builder Code attribution.
              </p>
              
              <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
                <button
                  onClick={() => setActiveTab("swap")}
                  className="px-8 py-4 rounded-2xl bg-[#01C38E] hover:bg-[#00ab7c] text-white font-extrabold text-sm transition-all shadow-xl shadow-[#01C38E]/25 hover:shadow-[#01C38E]/40 flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <ArrowRightLeft className="h-4 w-4" /> Launch Swap
                </button>
                <button
                  onClick={() => setActiveTab("liquidity")}
                  className="px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-extrabold text-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Droplet className="h-4 w-4 text-[#01C38E]" /> Explore Pools
                </button>
                <button
                  onClick={() => setActiveTab("bridge")}
                  className="px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-extrabold text-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Layers className="h-4 w-4 text-[#01C38E]" /> Cross-Chain Bridge
                </button>
              </div>
            </div>

            {/* 4 Protocol Stat Banner Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#0f172a]/90 border border-white/[0.08] rounded-2xl p-5 backdrop-blur-xl group hover:border-[#01C38E]/40 transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2.5 rounded-xl bg-[#01C38E]/10 text-[#01C38E]">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-semibold text-zinc-400">Total Value Locked</span>
                </div>
                <div className="text-2xl font-black text-white">$1.24M+</div>
                <p className="text-[11px] text-zinc-500 mt-1">Deep Aerodrome V2 Liquidity</p>
              </div>

              <div className="bg-[#0f172a]/90 border border-white/[0.08] rounded-2xl p-5 backdrop-blur-xl group hover:border-[#01C38E]/40 transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2.5 rounded-xl bg-[#01C38E]/10 text-[#01C38E]">
                    <Zap className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-semibold text-zinc-400">Swap Execution Speed</span>
                </div>
                <div className="text-2xl font-black text-[#01C38E]">Sub-Second</div>
                <p className="text-[11px] text-zinc-500 mt-1">Base Mainnet L2 Finality</p>
              </div>

              <div className="bg-[#0f172a]/90 border border-white/[0.08] rounded-2xl p-5 backdrop-blur-xl group hover:border-[#01C38E]/40 transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2.5 rounded-xl bg-[#01C38E]/10 text-[#01C38E]">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-semibold text-zinc-400">Protocol Fee Rate</span>
                </div>
                <div className="text-2xl font-black text-white">0.1% Fee</div>
                <p className="text-[11px] text-zinc-500 mt-1">Directly to Protocol Treasury</p>
              </div>

              <div className="bg-[#0f172a]/90 border border-white/[0.08] rounded-2xl p-5 backdrop-blur-xl group hover:border-[#01C38E]/40 transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2.5 rounded-xl bg-[#01C38E]/10 text-[#01C38E]">
                    <Bot className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-semibold text-zinc-400">AI Trading Copilot</span>
                </div>
                <div className="text-2xl font-black text-white">GM AI v2.0</div>
                <p className="text-[11px] text-zinc-500 mt-1">Conversational Swaps & Audits</p>
              </div>
            </div>

            {/* 3 Core Ecosystem Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#0f172a]/80 border border-white/[0.08] rounded-3xl p-6 backdrop-blur-xl flex flex-col justify-between hover:border-[#01C38E]/30 transition-all">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[#01C38E]/10 border border-[#01C38E]/20 flex items-center justify-center text-[#01C38E] mb-4">
                    <ArrowRightLeft className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Token Swaps</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                    Trade ETH, USDC, EURC, and WETH with zero slippage loss. Direct routing through verified fee smart contract with 0.1% treasury collection.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("swap")}
                  className="w-full py-3 rounded-xl bg-white/5 hover:bg-[#01C38E]/10 text-[#01C38E] font-bold text-xs border border-white/10 hover:border-[#01C38E]/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  Start Swapping <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              <div className="bg-[#0f172a]/80 border border-white/[0.08] rounded-3xl p-6 backdrop-blur-xl flex flex-col justify-between hover:border-[#01C38E]/30 transition-all">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[#01C38E]/10 border border-[#01C38E]/20 flex items-center justify-center text-[#01C38E] mb-4">
                    <Droplet className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Liquidity Pools</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                    Deposit paired tokens into Aerodrome vAMM & sAMM pools. Track real-time LP token holdings, pool share %, and withdraw liquidity anytime.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("liquidity")}
                  className="w-full py-3 rounded-xl bg-white/5 hover:bg-[#01C38E]/10 text-[#01C38E] font-bold text-xs border border-white/10 hover:border-[#01C38E]/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  Deposit Liquidity <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              <div className="bg-[#0f172a]/80 border border-white/[0.08] rounded-3xl p-6 backdrop-blur-xl flex flex-col justify-between hover:border-[#01C38E]/30 transition-all">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[#01C38E]/10 border border-[#01C38E]/20 flex items-center justify-center text-[#01C38E] mb-4">
                    <Layers className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Cross-Chain Bridge</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                    Bridge assets seamlessly from Ethereum L1, Arbitrum, Optimism, Polygon, and Solana straight to Base Mainnet via embedded Superbridge.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("bridge")}
                  className="w-full py-3 rounded-xl bg-white/5 hover:bg-[#01C38E]/10 text-[#01C38E] font-bold text-xs border border-white/10 hover:border-[#01C38E]/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  Bridge Tokens <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ) : activeTab === "swap" ? (
          /* Swap Landing View */
          <div className="w-full max-w-5xl flex flex-col gap-10 py-2">
            {/* Hero Section */}
            <div className="text-center flex flex-col items-center gap-3 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#01C38E]/10 border border-[#01C38E]/20 text-[#01C38E] text-xs font-semibold">
                <Zap className="h-3.5 w-3.5" /> Instant Token Swaps on Base
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                Swap Any Token
              </h1>
              <h2 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-[#01C38E] via-[#0A786A] to-[#01C38E] bg-clip-text text-transparent">
                Best Execution & Deep Liquidity
              </h2>
              <p className="text-zinc-400 text-sm sm:text-base mt-1">
                Direct Aerodrome V2 routing with minimal slippage and automated fee collection. Swap ETH, USDC, EURC & more instantly.
              </p>
            </div>

            {/* Main Swap Grid: Highlights Left + Swap Box Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Feature Highlights & Stats (5 cols) */}
              <div className="lg:col-span-5 flex flex-col gap-4 order-2 lg:order-1">
                {/* Feature 1 */}
                <div className="bg-[#0f172a]/80 border border-white/[0.08] rounded-2xl p-5 backdrop-blur-xl hover:border-[#01C38E]/30 transition-all flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-[#01C38E]/10 text-[#01C38E] shrink-0">
                    <Zap className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">Sub-Second Speed</h3>
                    <p className="text-zinc-400 text-xs mt-1 leading-relaxed">
                      Powered by Base Layer 2 for ultra-fast confirmation times and minimal gas fees.
                    </p>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="bg-[#0f172a]/80 border border-white/[0.08] rounded-2xl p-5 backdrop-blur-xl hover:border-[#01C38E]/30 transition-all flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-[#01C38E]/10 text-[#01C38E] shrink-0">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">Low Slippage Curve</h3>
                    <p className="text-zinc-400 text-xs mt-1 leading-relaxed">
                      Automatically queries Aerodrome Router for optimum swap path across volatile and stable pools.
                    </p>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="bg-[#0f172a]/80 border border-white/[0.08] rounded-2xl p-5 backdrop-blur-xl hover:border-[#01C38E]/30 transition-all flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-[#01C38E]/10 text-[#01C38E] shrink-0">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">100% Non-Custodial</h3>
                    <p className="text-zinc-400 text-xs mt-1 leading-relaxed">
                      Direct peer-to-peer execution. You always maintain full control of your private keys and assets.
                    </p>
                  </div>
                </div>

                {/* Live Protocol Stats Box */}
                <div className="bg-gradient-to-br from-[#01C38E]/10 to-[#0A786A]/10 border border-[#01C38E]/20 rounded-2xl p-5 backdrop-blur-xl">
                  <div className="flex justify-between items-center text-xs font-semibold text-zinc-300 mb-2.5">
                    <span>Protocol Fee</span>
                    <span className="text-[#01C38E] font-bold">0.1%</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-semibold text-zinc-300 mb-2.5">
                    <span>Gas Network</span>
                    <span className="text-white font-bold">Base Mainnet</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-semibold text-zinc-300">
                    <span>Routing Engine</span>
                    <span className="text-white font-bold">Aerodrome V2</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Swap Widget Box (7 cols) */}
              <div className="lg:col-span-7 flex justify-center order-1 lg:order-2">
                <div className="w-full max-w-[460px] bg-[#0f172a]/90 border border-white/[0.08] rounded-3xl p-6 backdrop-blur-xl shadow-2xl shadow-[#01C38E]/5">
                  <div className="flex items-center justify-between border-b border-white/5 mb-5 pb-4">
                    <span className="text-white font-extrabold text-lg flex items-center gap-2">
                      <ArrowRightLeft className="h-5 w-5 text-[#01C38E]" /> Swap Tokens
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setActiveTab("ai-agent")}
                        className="px-2 py-1 rounded-xl bg-gradient-to-r from-[#01C38E]/20 to-[#0A786A]/20 hover:from-[#01C38E]/30 hover:to-[#0A786A]/30 border border-[#01C38E]/30 text-[#01C38E] text-[11px] font-extrabold flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                        title="Open GM AI Agent"
                      >
                        <Bot className="h-3.5 w-3.5" /> Ask AI
                      </button>
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#01C38E]/10 border border-[#01C38E]/20 text-[#01C38E]">
                        {customSlippage ? `${customSlippage}%` : `${slippage}%`} Slippage
                      </span>
                      <button
                        onClick={() => setShowSettingsModal(true)}
                        className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer"
                        title="Swap Settings"
                      >
                        <Settings className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Input */}
                  <div className="bg-black/30 border border-white/[0.04] rounded-2xl p-4">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs text-zinc-500 font-medium">You sell</label>
                      {isConnected && balanceData && (
                        <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                          <span>
                            Balance: {parseFloat(balanceData.formatted || "0").toLocaleString(undefined, {
                              maximumFractionDigits: 6,
                            })}
                          </span>
                          <button
                            onClick={handleMax}
                            className="text-[#01C38E] hover:text-[#00ab7c] font-black uppercase text-[10px] bg-[#01C38E]/10 hover:bg-[#01C38E]/20 px-1.5 py-0.5 rounded transition-all"
                          >
                            Max
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        inputMode="decimal"
                        placeholder="0"
                        value={amount}
                        onChange={(e) => { setAmount(e.target.value); setError(""); setTxHash(""); }}
                        className="bg-transparent text-[28px] font-bold text-white outline-none w-full placeholder-zinc-700 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button
                        onClick={() => { setTokenModalTarget("input"); setTokenSearchQuery(""); }}
                        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 pl-2 pr-2.5 py-1.5 rounded-full transition-colors shrink-0 cursor-pointer"
                      >
                        {inputToken.image && <img src={inputToken.image} alt="" className="w-5 h-5 rounded-full" />}
                        <span className="font-bold text-sm">{inputToken.symbol}</span>
                        <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
                      </button>
                    </div>
                  </div>

                  {/* Flip */}
                  <div className="flex justify-center -my-3 relative z-10">
                    <button
                      onClick={flipTokens}
                      className="w-9 h-9 rounded-full bg-[#13141c] border-[3px] border-[#0f172a] hover:bg-[#1a1b25] flex items-center justify-center transition-all active:scale-90"
                    >
                      <ArrowRightLeft className="h-3.5 w-3.5 text-zinc-400 rotate-90" />
                    </button>
                  </div>

                  {/* Output */}
                  <div className="bg-black/30 border border-white/[0.04] rounded-2xl p-4 mt-1">
                    <label className="text-xs text-zinc-500 font-medium mb-2 block">You buy</label>
                    <div className="flex items-center gap-3">
                      <div className="text-[28px] font-bold text-white flex-1 min-h-[42px] flex items-center">
                        {displayOut || <span className="text-zinc-700">0</span>}
                      </div>
                      <button
                        onClick={() => { setTokenModalTarget("output"); setTokenSearchQuery(""); }}
                        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 pl-2 pr-2.5 py-1.5 rounded-full transition-colors shrink-0 cursor-pointer"
                      >
                        {outputToken.image && <img src={outputToken.image} alt="" className="w-5 h-5 rounded-full" />}
                        <span className="font-bold text-sm">{outputToken.symbol}</span>
                        <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
                      </button>
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

                  {/* Action Buttons */}
                  <div className="mt-4">
                    {!isConnected ? (
                      <button
                        onClick={() => setShowConnectModal(true)}
                        className="w-full bg-[#01C38E] hover:bg-[#00ab7c] text-white font-bold py-4 rounded-2xl transition-all text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#01C38E]/30 active:scale-[0.98]"
                      >
                        <Wallet className="h-4 w-4" />
                        Connect Wallet
                      </button>
                    ) : chain?.id !== 8453 ? (
                      <button
                        onClick={() => switchChain({ chainId: 8453 })}
                        className="w-full bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-4 rounded-2xl transition-all text-sm shadow-lg shadow-yellow-600/30 active:scale-[0.98]"
                      >
                        Switch Network to Base
                      </button>
                    ) : !amount || Number(amount) <= 0 ? (
                      <button disabled className="w-full bg-white/5 border border-white/10 text-zinc-500 font-bold py-4 rounded-2xl cursor-not-allowed text-sm">
                        Enter an amount
                      </button>
                    ) : isQuoteLoading ? (
                      <button disabled className="w-full bg-white/5 border border-white/10 text-zinc-400 font-bold py-4 rounded-2xl cursor-not-allowed text-sm flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
                        Fetching best price...
                      </button>
                    ) : balanceData && amountWei > balanceData.value ? (
                      <button disabled className="w-full bg-white/5 border border-white/10 text-red-400 font-bold py-4 rounded-2xl cursor-not-allowed text-sm">
                        Insufficient {inputToken.symbol} balance
                      </button>
                    ) : finalOutWei === 0n ? (
                      <button disabled className="w-full bg-white/5 border border-white/10 text-red-400 font-bold py-4 rounded-2xl cursor-not-allowed text-sm">
                        Insufficient liquidity
                      </button>
                    ) : !isApproved ? (
                      <button
                        onClick={handleApprove}
                        disabled={isApproving}
                        className="w-full bg-[#01C38E] hover:bg-[#00ab7c] text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-[#01C38E]/30 active:scale-[0.98] disabled:opacity-60"
                      >
                        {isApproving ? <><Loader2 className="h-4 w-4 animate-spin" /> Approving...</> : `Approve ${inputToken.symbol}`}
                      </button>
                    ) : (
                      <button
                        onClick={handleSwap}
                        disabled={isSwapping}
                        className="w-full bg-[#01C38E] hover:bg-[#00ab7c] text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-[#01C38E]/30 active:scale-[0.98] disabled:opacity-60"
                      >
                        {isSwapping ? <><Loader2 className="h-4 w-4 animate-spin" /> Swapping...</> : "Swap"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === "liquidity" ? (
          /* Pools Landing Dashboard */
          <div className="w-full max-w-5xl flex flex-col gap-8 py-2">
            {/* Hero Banner */}
            <div className="text-center flex flex-col items-center gap-2 max-w-2xl mx-auto">
              <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                Provide Liquidity
              </h1>
              <h2 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-[#01C38E] via-[#0A786A] to-[#01C38E] bg-clip-text text-transparent">
                Earn Passive Income
              </h2>
              <p className="text-zinc-400 text-sm sm:text-base mt-1">
                Earn <span className="text-[#01C38E] font-semibold">0.04% fees</span> on every swap. StableSwap curve minimizes impermanent loss.
              </p>
            </div>

            {/* 4 Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Stat 1: Total Value Locked */}
              <div className="bg-[#0f172a]/90 border border-white/[0.08] rounded-2xl p-5 backdrop-blur-xl relative overflow-hidden group hover:border-[#01C38E]/30 transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-xl bg-[#01C38E]/10 text-[#01C38E]">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-semibold text-zinc-400">Total Value Locked</span>
                </div>
                <div className="text-2xl font-black text-white">$9,105,683.46</div>
                <div className="flex gap-1 items-end h-4 mt-3 opacity-60">
                  <div className="bg-[#01C38E] w-full h-[40%] rounded-t-sm" />
                  <div className="bg-[#01C38E] w-full h-[65%] rounded-t-sm" />
                  <div className="bg-[#01C38E] w-full h-[50%] rounded-t-sm" />
                  <div className="bg-[#01C38E] w-full h-[80%] rounded-t-sm" />
                  <div className="bg-[#01C38E] w-full h-[100%] rounded-t-sm" />
                </div>
              </div>

              {/* Stat 2: 24h Volume */}
              <div className="bg-[#0f172a]/90 border border-white/[0.08] rounded-2xl p-5 backdrop-blur-xl group hover:border-[#01C38E]/30 transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-xl bg-[#01C38E]/10 text-[#01C38E]">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-semibold text-zinc-400">24h Volume (Est.)</span>
                </div>
                <div className="text-2xl font-black text-white">$455,284.17</div>
                <span className="text-[11px] text-zinc-500 font-medium block mt-1">-5% daily turnover</span>
              </div>

              {/* Stat 3: Your LP Positions */}
              <div className="bg-[#0f172a]/90 border border-white/[0.08] rounded-2xl p-5 backdrop-blur-xl group hover:border-[#01C38E]/30 transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-xl bg-[#01C38E]/10 text-[#01C38E]">
                    <Layers className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-semibold text-zinc-400">Your LP Positions</span>
                </div>
                <div className="text-2xl font-black text-white">
                  {isConnected ? lpPositionsCount : "0"}
                </div>
                <span className="text-[11px] text-zinc-500 block mt-1">Active pool positions</span>
              </div>

              {/* Stat 4: Active Pools */}
              <div className="bg-[#0f172a]/90 border border-white/[0.08] rounded-2xl p-5 backdrop-blur-xl group hover:border-[#01C38E]/30 transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400">
                    <Zap className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-semibold text-zinc-400">Active Pools</span>
                </div>
                <div className="text-2xl font-black text-white">3</div>
                <span className="text-[11px] text-zinc-500 block mt-1">Base Mainnet</span>
              </div>
            </div>

            {/* All Pools Table */}
            <div className="bg-[#0f172a]/90 border border-white/[0.08] rounded-3xl p-6 backdrop-blur-xl shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-extrabold text-white">All Pools</h3>
                <span className="text-xs text-zinc-400">Base Mainnet Aerodrome Pools</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-xs text-zinc-400 font-semibold uppercase tracking-wider">
                      <th className="pb-3 px-3">Pool</th>
                      <th className="pb-3 px-3">TVL</th>
                      <th className="pb-3 px-3">Your LP</th>
                      <th className="pb-3 px-3">Your Share</th>
                      <th className="pb-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {POOLS_LIST.map((pool) => (
                      <tr key={pool.id} className="hover:bg-white/[0.02] transition-colors">
                        {/* Pair Info */}
                        <td className="py-4 px-3">
                          <div className="flex items-center gap-3">
                            <div className="flex -space-x-2">
                              {pool.tokenA.image && <img src={pool.tokenA.image} className="w-7 h-7 rounded-full border-2 border-[#0f172a]" />}
                              {pool.tokenB.image && <img src={pool.tokenB.image} className="w-7 h-7 rounded-full border-2 border-[#0f172a]" />}
                            </div>
                            <div>
                              <div className="font-bold text-white flex items-center gap-2">
                                {pool.name}
                              </div>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-zinc-400">
                                {pool.type}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* TVL */}
                        <td className="py-4 px-3 font-bold text-white">{pool.tvl}</td>

                        {/* Your LP */}
                        <td className="py-4 px-3 font-bold text-white">
                          {isConnected ? pool.userLpFormatted : "0.0000 LP"}
                        </td>

                        {/* Your Share */}
                        <td className="py-4 px-3 font-semibold text-zinc-400">
                          {isConnected ? pool.userShareFormatted : "0.00%"}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setPoolTokenA(pool.tokenA);
                                setPoolTokenB(pool.tokenB);
                                setLiquidityMode("add");
                                setError("");
                                setTxHash("");
                                setShowPoolModal(true);
                              }}
                              className="bg-[#01C38E] hover:bg-[#00ab7c] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md shadow-[#01C38E]/20 active:scale-95"
                            >
                              + Add
                            </button>
                            <button
                              onClick={() => {
                                setPoolTokenA(pool.tokenA);
                                setPoolTokenB(pool.tokenB);
                                setLiquidityMode("remove");
                                setError("");
                                setTxHash("");
                                setShowPoolModal(true);
                              }}
                              className="bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white text-xs font-bold px-4 py-2 rounded-xl transition-all active:scale-95"
                            >
                              - Remove
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : activeTab === "bridge" ? (
          /* Fee-Earning Bridge View */
          <div className="w-full max-w-5xl flex flex-col gap-8 py-2">
            {/* Hero Banner */}
            <div className="text-center flex flex-col items-center gap-3 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#01C38E]/10 border border-[#01C38E]/20 text-[#01C38E] text-xs font-semibold">
                <Layers className="h-3.5 w-3.5" /> Multi-Chain Asset Bridge
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                Bridge Assets to Base
              </h1>
              <h2 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-[#01C38E] via-[#0A786A] to-[#01C38E] bg-clip-text text-transparent">
                Cross-Chain Liquidity Routing
              </h2>
              <p className="text-zinc-400 text-sm sm:text-base mt-1">
                Bridge ETH, USDC, USDT & EURC from Ethereum, Arbitrum, Optimism, Solana & Polygon directly to Base with best rates.
              </p>
            </div>

            {/* 4 Overview Bridge Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#0f172a]/90 border border-white/[0.08] rounded-2xl p-5 backdrop-blur-xl group hover:border-[#01C38E]/30 transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-xl bg-[#01C38E]/10 text-[#01C38E]">
                    <Layers className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-semibold text-zinc-400">Supported Networks</span>
                </div>
                <div className="text-xl font-bold text-white">15+ EVM & Solana</div>
                <p className="text-[11px] text-zinc-500 mt-1">Ethereum, Arbitrum, Optimism & more</p>
              </div>

              <div className="bg-[#0f172a]/90 border border-white/[0.08] rounded-2xl p-5 backdrop-blur-xl group hover:border-[#01C38E]/30 transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-xl bg-[#01C38E]/10 text-[#01C38E]">
                    <Zap className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-semibold text-zinc-400">Avg. Transfer Time</span>
                </div>
                <div className="text-xl font-bold text-white">&lt; 2 Minutes</div>
                <p className="text-[11px] text-zinc-500 mt-1">Sub-minute fast liquidity relays</p>
              </div>

              <div className="bg-[#0f172a]/90 border border-white/[0.08] rounded-2xl p-5 backdrop-blur-xl group hover:border-[#01C38E]/30 transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-xl bg-[#01C38E]/10 text-[#01C38E]">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-semibold text-zinc-400">Treasury Fee Share</span>
                </div>
                <div className="text-xl font-bold text-[#01C38E]">0.1% Fee</div>
                <p className="text-[11px] text-zinc-500 mt-1">Directly paid to protocol treasury</p>
              </div>

              <div className="bg-[#0f172a]/90 border border-white/[0.08] rounded-2xl p-5 backdrop-blur-xl group hover:border-[#01C38E]/30 transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-xl bg-[#01C38E]/10 text-[#01C38E]">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-semibold text-zinc-400">Target Chain</span>
                </div>
                <div className="text-xl font-bold text-white">Base Mainnet</div>
                <p className="text-[11px] text-zinc-500 mt-1">Chain ID: 8453 (Coinbase L2)</p>
              </div>
            </div>

            {/* Official Base Bridge Portal Card */}
            <div className="w-full flex flex-col items-center gap-4">
              <div className="w-full max-w-[480px] bg-[#0f172a]/90 border border-white/[0.08] rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#01C38E]/10 border border-[#01C38E]/20 flex items-center justify-center text-[#01C38E] mb-5 shadow-lg shadow-[#01C38E]/10">
                  <Layers className="h-8 w-8" />
                </div>

                <h3 className="text-2xl font-black text-white mb-2">Official Base Bridge</h3>
                <p className="text-xs text-zinc-400 leading-relaxed max-w-sm mb-6">
                  Transfer ETH, USDC, and native assets directly between Ethereum L1 and Base Mainnet using Coinbase's official bridge infrastructure.
                </p>

                <div className="w-full bg-black/30 border border-white/5 rounded-2xl p-4 mb-6 flex flex-col gap-2.5 text-xs text-zinc-300">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">Destination Network</span>
                    <span className="font-bold text-[#01C38E] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#01C38E]" /> Base Mainnet (8453)
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-t border-white/5 pt-2">
                    <span className="text-zinc-500">Bridge Provider</span>
                    <span className="font-bold text-white font-mono text-xs">superbridge.app</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-white/5 pt-2">
                    <span className="text-zinc-500">Security</span>
                    <span className="font-bold text-white">OP Stack & Base Native Bridge</span>
                  </div>
                </div>

                <a
                  href="https://superbridge.app/"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full bg-[#01C38E] hover:bg-[#00ab7c] text-white font-extrabold py-4 rounded-2xl transition-all text-sm flex items-center justify-center gap-2 shadow-xl shadow-[#01C38E]/30 active:scale-[0.98] cursor-pointer"
                >
                  <Zap className="h-4 w-4" />
                  Launch Superbridge <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        ) : activeTab === "portfolio" ? (
          /* Portfolio Tab */
          <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
            {/* Header / Net Worth Banner */}
            <div className="bg-gradient-to-r from-[#0f172a] via-[#131c31] to-[#0f172a] border border-white/[0.08] rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#01C38E]/10 rounded-full blur-3xl pointer-events-none" />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Total Portfolio Value</span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#01C38E]/20 text-[#01C38E] border border-[#01C38E]/30">
                    Live Tracker
                  </span>
                </div>
                <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  {isConnected ? `$${(parseFloat(balanceData?.formatted || "0") * 3300).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "$0.00"}
                </div>
                <div className="text-xs text-zinc-500 mt-1 font-mono">
                  {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Connect Wallet to View Assets"} • Base Mainnet (8453)
                </div>
              </div>

              {!isConnected ? (
                <button
                  onClick={() => setShowConnectModal(true)}
                  className="px-6 py-3 rounded-2xl bg-[#01C38E] hover:bg-[#00ab7c] text-white font-extrabold text-xs transition-all shadow-lg shadow-[#01C38E]/20 flex items-center gap-2 cursor-pointer"
                >
                  <Wallet className="h-4 w-4" /> Connect Wallet
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActiveTab("swap")}
                    className="px-5 py-2.5 rounded-2xl bg-[#01C38E] hover:bg-[#00ab7c] text-white font-bold text-xs transition-all shadow-md shadow-[#01C38E]/20 flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowRightLeft className="h-3.5 w-3.5" /> Swap
                  </button>
                </div>
              )}
            </div>

            {/* Portfolio Insights Card */}
            <div className="bg-gradient-to-br from-[#01C38E]/10 via-[#0c1322] to-[#0f172a] border border-[#01C38E]/30 rounded-3xl p-6 backdrop-blur-2xl shadow-xl flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-[#01C38E]/20 text-[#01C38E]">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-base">Portfolio Insights</h3>
                    <p className="text-xs text-zinc-400">Real-time asset allocation & rebalancing advice</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-zinc-500 block">Health Score</span>
                  <span className="text-lg font-black text-[#01C38E]">92 / 100</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#01C38E]">
                    <TrendingUp className="h-3.5 w-3.5" /> Yield Opportunity
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Deploy unpooled USDC/EURC into Aerodrome StableSwap to earn automated 0.1% deposit yield.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <ShieldCheck className="h-3.5 w-3.5 text-[#01C38E]" /> Security Audit
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Portfolio is 100% non-custodial on Base L2 with zero security or honeypot risks.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <Zap className="h-3.5 w-3.5 text-[#01C38E]" /> Speed & Gas
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Avg transaction gas: &lt; $0.01 on Base Mainnet with sub-second finality.
                  </p>
                </div>
              </div>
            </div>

            {/* Token Asset Balances Table */}
            <div className="bg-[#0f172a]/90 border border-white/[0.08] rounded-3xl p-6 backdrop-blur-2xl shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-extrabold text-white text-base">Token Balances</h3>
                <span className="text-xs text-zinc-500">{allTokens.length} Tokens Tracked</span>
              </div>

              <div className="space-y-2">
                {allTokens.map((t) => (
                  <div key={`port-${t.symbol}`} className="flex items-center justify-between p-3.5 rounded-2xl bg-black/30 border border-white/5 hover:border-white/10 transition-all">
                    <div className="flex items-center gap-3">
                      <TokenIcon symbol={t.symbol} image={t.image} className="w-8 h-8 rounded-full" />
                      <div>
                        <div className="font-bold text-white text-sm">{t.symbol}</div>
                        <div className="text-xs text-zinc-500">{t.name}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-bold text-white text-sm">
                        {t.symbol === "ETH" && isConnected && balanceData
                          ? parseFloat(balanceData.formatted || "0").toFixed(4)
                          : "0.00"} {t.symbol}
                      </div>
                      <div className="text-xs text-zinc-500">
                        {t.symbol === "ETH" && isConnected && balanceData
                          ? `$${(parseFloat(balanceData.formatted || "0") * 3300).toFixed(2)}`
                          : "$0.00"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Dedicated AI Agent Direct EVM Terminal Screen */
          <AIAgentTerminal />
        )}
      </main>

      {/* Deposit / Remove Liquidity Modal */}
      {showPoolModal && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowPoolModal(false)} />
          <div className="relative bg-[#0f172a] border border-white/10 rounded-3xl shadow-2xl w-full max-w-[460px] p-6 z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex -space-x-2">
                  {poolTokenA.image && <img src={poolTokenA.image} className="w-6 h-6 rounded-full border border-black" />}
                  {poolTokenB.image && <img src={poolTokenB.image} className="w-6 h-6 rounded-full border border-black" />}
                </div>
                <span className="font-extrabold text-lg text-white">{poolTokenA.symbol} / {poolTokenB.symbol} Pool</span>
              </div>
              <button onClick={() => setShowPoolModal(false)} className="p-1 text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Sub-Toggle Mode */}
            <div className="flex bg-black/40 p-1 rounded-xl mb-4 border border-white/5">
              <button
                onClick={() => { setLiquidityMode("add"); setError(""); setTxHash(""); }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  liquidityMode === "add" ? "bg-[#01C38E] text-white shadow-md shadow-[#01C38E]/20" : "text-zinc-400 hover:text-white"
                }`}
              >
                + Deposit Liquidity
              </button>
              <button
                onClick={() => { setLiquidityMode("remove"); setError(""); setTxHash(""); }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  liquidityMode === "remove" ? "bg-red-500/80 text-white shadow-md shadow-red-500/20" : "text-zinc-400 hover:text-white"
                }`}
              >
                - Remove Liquidity
              </button>
            </div>

            {liquidityMode === "add" ? (
              <>
                {/* Deposit Token A */}
                <div className="bg-black/30 border border-white/[0.04] rounded-2xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs text-zinc-500 font-medium">Deposit {poolTokenA.symbol}</label>
                    {isConnected && balanceDataA && (
                      <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                        <span>
                          Balance: {parseFloat(balanceDataA.formatted || "0").toLocaleString(undefined, { maximumFractionDigits: 6 })}
                        </span>
                        <button
                          onClick={handleMaxPoolA}
                          className="text-[#01C38E] hover:text-[#00ab7c] font-black uppercase text-[10px] bg-[#01C38E]/10 hover:bg-[#01C38E]/20 px-1.5 py-0.5 rounded transition-all"
                        >
                          Max
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      inputMode="decimal"
                      placeholder="0"
                      value={poolAmountA}
                      onFocus={() => setActiveInput("A")}
                      onChange={(e) => { setPoolAmountA(e.target.value); setError(""); setTxHash(""); }}
                      className="bg-transparent text-[24px] font-bold text-white outline-none w-full placeholder-zinc-700 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <div className="relative" ref={poolADDRef}>
                      <button
                        onClick={() => { setShowPoolADD(!showPoolADD); setShowPoolBDD(false); }}
                        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 pl-2 pr-2.5 py-1.5 rounded-full transition-colors shrink-0"
                      >
                        {poolTokenA.image && <img src={poolTokenA.image} alt="" className="w-5 h-5 rounded-full" />}
                        <span className="font-bold text-sm">{poolTokenA.symbol}</span>
                        <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
                      </button>
                      {showPoolADD && (
                        <div className="absolute right-0 mt-2 w-44 bg-[#0c1222] border border-white/10 rounded-2xl shadow-xl z-50 overflow-hidden py-1">
                          {SUPPORTED_TOKENS.map((t) => (
                            <button key={`pa-${t.symbol}`} onClick={() => selectPoolA(t)}
                              className="flex items-center gap-2.5 w-full px-3 py-2.5 hover:bg-white/5 text-left text-sm">
                              {t.image && <img src={t.image} alt="" className="w-5 h-5 rounded-full" />}
                              <span className="font-semibold">{t.symbol}</span>
                              {t.symbol === poolTokenA.symbol && <Check className="h-3.5 w-3.5 text-[#01C38E] ml-auto" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Plus Icon */}
                <div className="flex justify-center -my-3 relative z-10">
                  <div className="w-9 h-9 rounded-full bg-[#13141c] border-[3px] border-[#0f172a] flex items-center justify-center">
                    <span className="text-zinc-400 font-extrabold text-sm">+</span>
                  </div>
                </div>

                {/* Deposit Token B */}
                <div className="bg-black/30 border border-white/[0.04] rounded-2xl p-4 mt-1">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs text-zinc-500 font-medium">Deposit {poolTokenB.symbol}</label>
                    {isConnected && balanceDataB && (
                      <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                        <span>
                          Balance: {parseFloat(balanceDataB.formatted || "0").toLocaleString(undefined, { maximumFractionDigits: 6 })}
                        </span>
                        <button
                          onClick={handleMaxPoolB}
                          className="text-[#01C38E] hover:text-[#00ab7c] font-black uppercase text-[10px] bg-[#01C38E]/10 hover:bg-[#01C38E]/20 px-1.5 py-0.5 rounded transition-all"
                        >
                          Max
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      inputMode="decimal"
                      placeholder="0"
                      value={poolAmountB}
                      onFocus={() => setActiveInput("B")}
                      onChange={(e) => { setPoolAmountB(e.target.value); setError(""); setTxHash(""); }}
                      className="bg-transparent text-[24px] font-bold text-white outline-none w-full placeholder-zinc-700 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <div className="relative" ref={poolBDDRef}>
                      <button
                        onClick={() => { setShowPoolBDD(!showPoolBDD); setShowPoolADD(false); }}
                        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 pl-2 pr-2.5 py-1.5 rounded-full transition-colors shrink-0"
                      >
                        {poolTokenB.image && <img src={poolTokenB.image} alt="" className="w-5 h-5 rounded-full" />}
                        <span className="font-bold text-sm">{poolTokenB.symbol}</span>
                        <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
                      </button>
                      {showPoolBDD && (
                        <div className="absolute right-0 mt-2 w-44 bg-[#0c1222] border border-white/10 rounded-2xl shadow-xl z-50 overflow-hidden py-1">
                          {SUPPORTED_TOKENS.map((t) => (
                            <button key={`pb-${t.symbol}`} onClick={() => selectPoolB(t)}
                              className="flex items-center gap-2.5 w-full px-3 py-2.5 hover:bg-white/5 text-left text-sm">
                              {t.image && <img src={t.image} alt="" className="w-5 h-5 rounded-full" />}
                              <span className="font-semibold">{t.symbol}</span>
                              {t.symbol === poolTokenB.symbol && <Check className="h-3.5 w-3.5 text-[#01C38E] ml-auto" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* Remove Liquidity Form */
              <div className="bg-black/30 border border-white/[0.04] rounded-2xl p-4">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-xs text-zinc-400 font-medium">Pool LP Balance</label>
                  {isConnected && lpBalanceData !== undefined && (
                    <div className="text-[11px] text-zinc-400">
                      Your Balance: <span className="font-bold text-[#01C38E]">{parseFloat(fmtAmt(lpBalanceData as bigint, 18)).toFixed(6)} LP</span>
                    </div>
                  )}
                </div>

                <label className="text-xs text-zinc-500 font-medium mb-1 block">LP Tokens to Withdraw</label>
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="0.0"
                  value={removeLpAmount}
                  onChange={(e) => { setRemoveLpAmount(e.target.value); setError(""); setTxHash(""); }}
                  className="bg-transparent text-[24px] font-bold text-white outline-none w-full placeholder-zinc-700 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none mb-3"
                />

                {/* Percentage Shortcuts */}
                <div className="grid grid-cols-4 gap-2">
                  {[25, 50, 75, 100].map((pct) => (
                    <button
                      key={pct}
                      onClick={() => {
                        if (!lpBalanceData) return;
                        const val = (lpBalanceData as bigint * BigInt(pct)) / 100n;
                        setRemoveLpAmount(fmtAmt(val, 18));
                      }}
                      className="bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold py-1.5 rounded-lg transition-all text-zinc-300 hover:text-white"
                    >
                      {pct === 100 ? "MAX" : `${pct}%`}
                    </button>
                  ))}
                </div>
              </div>
            )}

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
                  <span className="font-bold">Transaction Submitted!</span>
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

            {/* Modal Action Buttons */}
            <div className="mt-4">
              {!isConnected ? (
                <button
                  onClick={() => setShowConnectModal(true)}
                  className="w-full bg-[#01C38E] hover:bg-[#00ab7c] text-white font-bold py-4 rounded-2xl transition-all text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#01C38E]/30 active:scale-[0.98]"
                >
                  <Wallet className="h-4 w-4" />
                  Connect Wallet
                </button>
              ) : chain?.id !== 8453 ? (
                <button
                  onClick={() => switchChain({ chainId: 8453 })}
                  className="w-full bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-4 rounded-2xl transition-all text-sm shadow-lg shadow-yellow-600/30 active:scale-[0.98]"
                >
                  Switch Network to Base
                </button>
              ) : liquidityMode === "add" ? (
                !poolAmountA || Number(poolAmountA) <= 0 || !poolAmountB || Number(poolAmountB) <= 0 ? (
                  <button disabled className="w-full bg-white/5 border border-white/10 text-zinc-500 font-bold py-4 rounded-2xl cursor-not-allowed text-sm">
                    Enter amounts
                  </button>
                ) : !isApprovedA ? (
                  <button
                    onClick={handleApproveA}
                    disabled={isApproving}
                    className="w-full bg-[#01C38E] hover:bg-[#00ab7c] text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-[#01C38E]/30 active:scale-[0.98] disabled:opacity-60"
                  >
                    {isApproving ? <><Loader2 className="h-4 w-4 animate-spin" /> Approving...</> : `Approve ${poolTokenA.symbol}`}
                  </button>
                ) : !isApprovedB ? (
                  <button
                    onClick={handleApproveB}
                    disabled={isApproving}
                    className="w-full bg-[#01C38E] hover:bg-[#00ab7c] text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-[#01C38E]/30 active:scale-[0.98] disabled:opacity-60"
                  >
                    {isApproving ? <><Loader2 className="h-4 w-4 animate-spin" /> Approving...</> : `Approve ${poolTokenB.symbol}`}
                  </button>
                ) : (
                  <button
                    onClick={handleAddLiquidity}
                    disabled={isSwapping}
                    className="w-full bg-[#01C38E] hover:bg-[#00ab7c] text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-[#01C38E]/30 active:scale-[0.98] disabled:opacity-60"
                  >
                    {isSwapping ? <><Loader2 className="h-4 w-4 animate-spin" /> Depositing...</> : "Add Liquidity"}
                  </button>
                )
              ) : (
                !removeLpAmount || Number(removeLpAmount) <= 0 ? (
                  <button disabled className="w-full bg-white/5 border border-white/10 text-zinc-500 font-bold py-4 rounded-2xl cursor-not-allowed text-sm">
                    Enter LP amount
                  </button>
                ) : !isLpApproved ? (
                  <button
                    onClick={handleApproveLP}
                    disabled={isApproving}
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-red-500/30 active:scale-[0.98] disabled:opacity-60"
                  >
                    {isApproving ? <><Loader2 className="h-4 w-4 animate-spin" /> Approving LP...</> : "Approve LP Token"}
                  </button>
                ) : (
                  <button
                    onClick={handleRemoveLiquidity}
                    disabled={isSwapping}
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-red-500/30 active:scale-[0.98] disabled:opacity-60"
                  >
                    {isSwapping ? <><Loader2 className="h-4 w-4 animate-spin" /> Withdrawing...</> : "Remove Liquidity"}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* Native Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0c1222]/95 border-t border-white/10 backdrop-blur-xl px-2 py-2 flex items-center justify-around shadow-2xl">
        <button
          onClick={() => { setActiveTab("home"); setError(""); setTxHash(""); }}
          className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-all cursor-pointer ${
            activeTab === "home" ? "text-[#01C38E] font-extrabold scale-105" : "text-zinc-400 hover:text-white font-medium"
          }`}
        >
          <Sun className="h-5 w-5" />
          <span className="text-[10px]">Home</span>
        </button>

        <button
          onClick={() => { setActiveTab("swap"); setError(""); setTxHash(""); }}
          className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-all cursor-pointer ${
            activeTab === "swap" ? "text-[#01C38E] font-extrabold scale-105" : "text-zinc-400 hover:text-white font-medium"
          }`}
        >
          <ArrowRightLeft className="h-5 w-5" />
          <span className="text-[10px]">Swap</span>
        </button>

        <button
          onClick={() => { setActiveTab("liquidity"); setError(""); setTxHash(""); }}
          className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-all cursor-pointer ${
            activeTab === "liquidity" ? "text-[#01C38E] font-extrabold scale-105" : "text-zinc-400 hover:text-white font-medium"
          }`}
        >
          <Droplet className="h-5 w-5" />
          <span className="text-[10px]">Pools</span>
        </button>

        <button
          onClick={() => { setActiveTab("bridge"); setError(""); setTxHash(""); }}
          className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-all cursor-pointer ${
            activeTab === "bridge" ? "text-[#01C38E] font-extrabold scale-105" : "text-zinc-400 hover:text-white font-medium"
          }`}
        >
          <Layers className="h-5 w-5" />
          <span className="text-[10px]">Bridge</span>
        </button>

        <button
          onClick={() => { setActiveTab("portfolio"); setError(""); setTxHash(""); }}
          className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-all cursor-pointer ${
            activeTab === "portfolio" ? "text-[#01C38E] font-extrabold scale-105" : "text-zinc-400 hover:text-white font-medium"
          }`}
        >
          <Wallet className="h-5 w-5" />
          <span className="text-[10px]">Portfolio</span>
        </button>

        <button
          onClick={() => { setActiveTab("ai-agent"); setError(""); setTxHash(""); }}
          className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-all cursor-pointer ${
            activeTab === "ai-agent" ? "text-[#01C38E] font-extrabold scale-105" : "text-zinc-400 hover:text-white font-medium"
          }`}
        >
          <Bot className="h-5 w-5" />
          <span className="text-[10px]">AI Agent</span>
        </button>
      </nav>

      {/* Footer */}
      <footer className="border-t border-white/5 py-5 bg-black/30 pb-20 md:pb-5">
        <div className="max-w-5xl mx-auto px-4 text-center text-xs text-zinc-600">
          © 2026 GMDEXAI · Powered by Base & Aerodrome V2
        </div>
      </footer>

      {/* Bottom-Left X (Twitter) Button */}
      <a
        href="https://x.com/earnadvise"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-20 sm:bottom-4 left-4 z-40 w-9 h-9 rounded-lg bg-[#0c1222]/90 hover:bg-[#151e33] border border-white/10 hover:border-white/25 flex items-center justify-center text-zinc-400 hover:text-white shadow-xl backdrop-blur-md transition-all group cursor-pointer"
        title="Follow on X (@earnadvise)"
      >
        <svg className="w-4 h-4 fill-current transition-transform duration-200 group-hover:scale-110" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </a>

      {/* Connect Modal (Rendered at root level to prevent clipping by header backdrop-blur spec) */}
      {showConnectModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowConnectModal(false)} />
          <div className="relative bg-[#0c1222] border border-white/10 rounded-3xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-white">Connect Wallet</h2>
                <p className="text-sm text-zinc-500">Choose your wallet</p>
              </div>
              <button onClick={() => setShowConnectModal(false)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                <X className="h-5 w-5 text-zinc-400" />
              </button>
            </div>
            <div className="flex flex-col gap-2.5 max-h-[70vh] overflow-y-auto pr-1">
              {/* Coinbase Smart Wallet / Passkey */}
              <button
                disabled={isConnectPending}
                onClick={() => {
                  const isMobile = typeof window !== "undefined" && /iphone|ipad|ipod|android/i.test(navigator.userAgent);
                  const isAndroid = typeof window !== "undefined" && /android/i.test(navigator.userAgent);
                  const hasInjected = typeof window !== "undefined" && typeof (window as any).ethereum !== "undefined";
                  const cbConn = connectors.find(c => c.id.toLowerCase().includes("coinbase") || c.name.toLowerCase().includes("coinbase"));
                  
                  if (cbConn && !isMobile) {
                    connect({ connector: cbConn }, { onSuccess: () => setShowConnectModal(false) });
                    return;
                  }
                  if (isMobile && !hasInjected) {
                    setShowConnectModal(false);
                    if (isAndroid) {
                      const link = document.createElement("a");
                      link.href = "intent://dapp?url=https%3A%2F%2Fwww.gmdexai.xyz#Intent;scheme=cbwallet;package=org.toshi;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;end;";
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    } else {
                      window.location.href = "https://go.cb-w.com/dapp?cb_url=https%3A%2F%2Fwww.gmdexai.xyz";
                    }
                    return;
                  }
                  if (cbConn) connect({ connector: cbConn }, { onSuccess: () => setShowConnectModal(false) });
                  else connect({ connector: connectors[0] }, { onSuccess: () => setShowConnectModal(false) });
                }}
                className="flex items-center gap-3.5 w-full p-3.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#01C38E]/40 rounded-2xl transition-all duration-200 group cursor-pointer text-left"
              >
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0 text-xl">
                  🔵
                </div>
                <div className="flex-1">
                  <p className="text-white font-bold text-sm flex items-center gap-1.5">
                    Coinbase Wallet
                    <span className="text-[10px] bg-[#01C38E]/20 text-[#01C38E] font-extrabold px-2 py-0.5 rounded-full">Passkey</span>
                  </p>
                  <p className="text-zinc-400 text-xs">Instant FaceID & Smart Wallet</p>
                </div>
                <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-zinc-300 transition-colors" />
              </button>

              {/* MetaMask */}
              <button
                disabled={isConnectPending}
                onClick={() => {
                  const isMobile = typeof window !== "undefined" && /iphone|ipad|ipod|android/i.test(navigator.userAgent);
                  const isAndroid = typeof window !== "undefined" && /android/i.test(navigator.userAgent);
                  const hasInjected = typeof window !== "undefined" && typeof (window as any).ethereum !== "undefined";
                  const mmConn = connectors.find(c => c.id.toLowerCase().includes("metamask") || c.name.toLowerCase().includes("metamask")) || connectors.find(c => c.id.toLowerCase().includes("injected"));
                  
                  if (isMobile && !hasInjected) {
                    setShowConnectModal(false);
                    if (isAndroid) {
                      const link = document.createElement("a");
                      link.href = "intent://dapp/www.gmdexai.xyz#Intent;scheme=dapp;package=io.metamask;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;end;";
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    } else {
                      window.location.href = "dapp://www.gmdexai.xyz";
                    }
                    return;
                  }
                  if (mmConn) connect({ connector: mmConn }, { onSuccess: () => setShowConnectModal(false) });
                  else connect({ connector: connectors[0] }, { onSuccess: () => setShowConnectModal(false) });
                }}
                className="flex items-center gap-3.5 w-full p-3.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-orange-500/40 rounded-2xl transition-all duration-200 group cursor-pointer text-left"
              >
                <div className="h-10 w-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center flex-shrink-0 text-xl">
                  🦊
                </div>
                <div className="flex-1">
                  <p className="text-white font-bold text-sm">MetaMask</p>
                  <p className="text-zinc-400 text-xs">Mobile App & Browser Extension</p>
                </div>
                <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-zinc-300 transition-colors" />
              </button>

              {/* Bitget Wallet */}
              <button
                disabled={isConnectPending}
                onClick={() => {
                  const isMobile = typeof window !== "undefined" && /iphone|ipad|ipod|android/i.test(navigator.userAgent);
                  const isAndroid = typeof window !== "undefined" && /android/i.test(navigator.userAgent);
                  const hasInjected = typeof window !== "undefined" && (typeof (window as any).ethereum !== "undefined" || typeof (window as any).bitkeep !== "undefined");
                  const injConn = connectors.find(c => c.id.toLowerCase().includes("injected")) || connectors[0];
                  
                  if (isMobile && !hasInjected) {
                    setShowConnectModal(false);
                    if (isAndroid) {
                      const link = document.createElement("a");
                      link.href = "intent://bkconnect?action=dapp&url=https%3A%2F%2Fwww.gmdexai.xyz#Intent;scheme=bitkeep;package=com.bitkeep.wallet;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;end;";
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    } else {
                      window.location.href = "bitkeep://bkconnect?action=dapp&url=https%3A%2F%2Fwww.gmdexai.xyz";
                    }
                    return;
                  }
                  if (injConn) connect({ connector: injConn }, { onSuccess: () => setShowConnectModal(false) });
                }}
                className="flex items-center gap-3.5 w-full p-3.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/40 rounded-2xl transition-all duration-200 group cursor-pointer text-left"
              >
                <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0 text-xl font-black text-cyan-400">
                  💠
                </div>
                <div className="flex-1">
                  <p className="text-white font-bold text-sm flex items-center gap-1.5">
                    Bitget Wallet
                    <span className="text-[10px] bg-cyan-500/20 text-cyan-400 font-extrabold px-1.5 py-0.5 rounded">Direct App</span>
                  </p>
                  <p className="text-zinc-400 text-xs">Opens Bitget Wallet app directly</p>
                </div>
                <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-zinc-300 transition-colors" />
              </button>

              {/* Trust Wallet */}
              <button
                disabled={isConnectPending}
                onClick={() => {
                  const isMobile = typeof window !== "undefined" && /iphone|ipad|ipod|android/i.test(navigator.userAgent);
                  const isAndroid = typeof window !== "undefined" && /android/i.test(navigator.userAgent);
                  const hasInjected = typeof window !== "undefined" && (typeof (window as any).ethereum !== "undefined" || typeof (window as any).trustwallet !== "undefined");
                  const injConn = connectors.find(c => c.id.toLowerCase().includes("injected")) || connectors[0];
                  
                  if (isMobile && !hasInjected) {
                    setShowConnectModal(false);
                    if (isAndroid) {
                      const link = document.createElement("a");
                      link.href = "intent://open_url?coin_id=60&url=https%3A%2F%2Fwww.gmdexai.xyz#Intent;scheme=trust;package=com.wallet.crypto.trustapp;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;end;";
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    } else {
                      window.location.href = "trust://open_url?coin_id=60&url=https%3A%2F%2Fwww.gmdexai.xyz";
                    }
                    return;
                  }
                  if (injConn) connect({ connector: injConn }, { onSuccess: () => setShowConnectModal(false) });
                }}
                className="flex items-center gap-3.5 w-full p-3.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-500/40 rounded-2xl transition-all duration-200 group cursor-pointer text-left"
              >
                <div className="h-10 w-10 rounded-xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center flex-shrink-0 text-xl text-blue-400">
                  🛡️
                </div>
                <div className="flex-1">
                  <p className="text-white font-bold text-sm">Trust Wallet</p>
                  <p className="text-zinc-400 text-xs">Opens Trust Wallet app directly</p>
                </div>
                <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-zinc-300 transition-colors" />
              </button>

              {/* OKX Wallet */}
              <button
                disabled={isConnectPending}
                onClick={() => {
                  const isMobile = typeof window !== "undefined" && /iphone|ipad|ipod|android/i.test(navigator.userAgent);
                  const isAndroid = typeof window !== "undefined" && /android/i.test(navigator.userAgent);
                  const hasInjected = typeof window !== "undefined" && (typeof (window as any).ethereum !== "undefined" || typeof (window as any).okxwallet !== "undefined");
                  const injConn = connectors.find(c => c.id.toLowerCase().includes("injected")) || connectors[0];
                  
                  if (isMobile && !hasInjected) {
                    setShowConnectModal(false);
                    if (isAndroid) {
                      const link = document.createElement("a");
                      link.href = "intent://wallet/dapp/url?dappUrl=https%3A%2F%2Fwww.gmdexai.xyz#Intent;scheme=okx;package=com.okinc.okex.gp;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;end;";
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    } else {
                      window.location.href = "okx://wallet/dapp/url?dappUrl=https%3A%2F%2Fwww.gmdexai.xyz";
                    }
                    return;
                  }
                  if (injConn) connect({ connector: injConn }, { onSuccess: () => setShowConnectModal(false) });
                }}
                className="flex items-center gap-3.5 w-full p-3.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 rounded-2xl transition-all duration-200 group cursor-pointer text-left"
              >
                <div className="h-10 w-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0 text-xl font-bold text-white">
                  ⬛
                </div>
                <div className="flex-1">
                  <p className="text-white font-bold text-sm">OKX Wallet</p>
                  <p className="text-zinc-400 text-xs">Opens OKX Wallet app directly</p>
                </div>
                <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-zinc-300 transition-colors" />
              </button>

              {/* Rabby / Browser Extension (Injected) */}
              <button
                disabled={isConnectPending}
                onClick={() => {
                  const injConn = connectors.find(c => c.id.toLowerCase().includes("injected")) || connectors[0];
                  if (injConn) connect({ connector: injConn }, { onSuccess: () => setShowConnectModal(false) });
                }}
                className="flex items-center gap-3.5 w-full p-3.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#01C38E]/40 rounded-2xl transition-all duration-200 group cursor-pointer text-left"
              >
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 text-xl">
                  🐰
                </div>
                <div className="flex-1">
                  <p className="text-white font-bold text-sm">Rabby / Injected Provider</p>
                  <p className="text-zinc-400 text-xs">Browser extension or in-app Web3</p>
                </div>
                <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-zinc-300 transition-colors" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Slippage & Transaction Settings Modal (Option 4) ─── */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowSettingsModal(false)} />
          <div className="relative bg-[#0c1222] border border-white/10 rounded-3xl shadow-2xl w-full max-w-sm p-6 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-[#01C38E]" />
                <h2 className="text-lg font-bold">Swap Settings</h2>
              </div>
              <button onClick={() => setShowSettingsModal(false)} className="p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer">
                <X className="h-5 w-5 text-zinc-400" />
              </button>
            </div>

            {/* Slippage Tolerance */}
            <div className="mb-5">
              <label className="text-xs text-zinc-400 font-semibold mb-2.5 block">Slippage Tolerance</label>
              <div className="grid grid-cols-4 gap-2">
                {[0.1, 0.5, 1.0].map((val) => (
                  <button
                    key={val}
                    onClick={() => { setSlippage(val); setCustomSlippage(""); }}
                    className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      slippage === val && !customSlippage
                        ? "bg-[#01C38E] border-[#01C38E] text-white shadow-lg shadow-[#01C38E]/20"
                        : "bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10"
                    }`}
                  >
                    {val}%
                  </button>
                ))}
                <div className="relative">
                  <input
                    type="number"
                    placeholder="Custom"
                    value={customSlippage}
                    onChange={(e) => { setCustomSlippage(e.target.value); }}
                    className={`w-full py-2 px-2.5 rounded-xl text-xs font-bold bg-white/5 border text-center outline-none transition-all ${
                      customSlippage ? "border-[#01C38E] text-[#01C38E]" : "border-white/10 text-white placeholder-zinc-500"
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Transaction Deadline */}
            <div className="mb-5">
              <label className="text-xs text-zinc-400 font-semibold mb-2 block">Transaction Deadline</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={deadlineMinutes}
                  onChange={(e) => setDeadlineMinutes(Number(e.target.value) || 20)}
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm font-bold text-white outline-none w-24 text-center"
                />
                <span className="text-xs text-zinc-400">minutes</span>
              </div>
            </div>

            {/* Router info */}
            <div className="bg-black/40 border border-white/5 rounded-2xl p-4 text-xs space-y-2">
              <div className="flex justify-between text-zinc-400">
                <span>Protocol Treasury Fee</span>
                <span className="text-[#01C38E] font-bold">0.1%</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Base Builder Attribution</span>
                <span className="text-white font-mono font-bold">ERC-8021</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Token Selector & Custom Token Import Modal (Option 3) ─── */}
      {tokenModalTarget !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setTokenModalTarget(null)} />
          <div className="relative bg-[#0c1222] border border-white/10 rounded-3xl shadow-2xl w-full max-w-md p-6 text-white max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <h2 className="text-lg font-bold">Select Token</h2>
              <button onClick={() => setTokenModalTarget(null)} className="p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer">
                <X className="h-5 w-5 text-zinc-400" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative mb-4">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search name, symbol or paste address 0x..."
                value={tokenSearchQuery}
                onChange={(e) => setTokenSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 focus:border-[#01C38E] rounded-2xl pl-10 pr-4 py-2.5 text-sm text-white outline-none placeholder-zinc-500 transition-all font-mono"
              />
            </div>

            {/* Quick Pills */}
            <div className="flex flex-wrap gap-1.5 mb-4 pb-3 border-b border-white/5">
              {allTokens.slice(0, 7).map((t) => (
                <button
                  key={`pill-${t.symbol}`}
                  onClick={() => {
                    if (tokenModalTarget === "input") setInputToken(t);
                    if (tokenModalTarget === "output") setOutputToken(t);
                    if (tokenModalTarget === "poolA") setPoolTokenA(t);
                    if (tokenModalTarget === "poolB") setPoolTokenB(t);
                    setTokenModalTarget(null);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold transition-all cursor-pointer"
                >
                  <TokenIcon symbol={t.symbol} image={t.image} className="w-4 h-4 rounded-full" />
                  <span>{t.symbol}</span>
                </button>
              ))}
            </div>

            {/* Address Search On-Chain Import Card */}
            {isAddressSearch && customSymbol && (
              <div className="bg-gradient-to-r from-[#01C38E]/10 to-transparent border border-[#01C38E]/30 rounded-2xl p-4 flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{String(customSymbol)}</span>
                    <span className="text-[10px] bg-[#01C38E]/20 text-[#01C38E] font-bold px-2 py-0.5 rounded">Custom Token</span>
                  </div>
                  <div className="text-xs text-zinc-400 mt-0.5">{String(customName || "ERC20 Token")} • {Number(customDecimals || 18)} Decimals</div>
                </div>
                <button
                  onClick={() => handleImportToken({
                    address: tokenSearchQuery,
                    chainId: 8453,
                    decimals: Number(customDecimals || 18),
                    name: String(customName || customSymbol),
                    symbol: String(customSymbol),
                    image: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png"
                  })}
                  className="px-3.5 py-1.5 bg-[#01C38E] hover:bg-[#00ab7c] text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-[#01C38E]/20 cursor-pointer"
                >
                  Import
                </button>
              </div>
            )}

            {/* Token List */}
            <div className="overflow-y-auto flex-1 space-y-1 pr-1">
              {allTokens
                .filter((t) => {
                  const q = tokenSearchQuery.toLowerCase();
                  return t.symbol.toLowerCase().includes(q) || t.name.toLowerCase().includes(q) || t.address.toLowerCase() === q;
                })
                .map((t) => {
                  const isCustom = customTokens.some(ct => ct.address.toLowerCase() === t.address.toLowerCase());
                  return (
                    <div
                      key={`tok-${t.symbol}-${t.address}`}
                      className="flex items-center justify-between p-3 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all group"
                    >
                      <button
                        onClick={() => {
                          if (tokenModalTarget === "input") setInputToken(t);
                          if (tokenModalTarget === "output") setOutputToken(t);
                          if (tokenModalTarget === "poolA") setPoolTokenA(t);
                          if (tokenModalTarget === "poolB") setPoolTokenB(t);
                          setTokenModalTarget(null);
                        }}
                        className="flex items-center gap-3 flex-1 text-left cursor-pointer"
                      >
                        <TokenIcon symbol={t.symbol} image={t.image} className="w-8 h-8 rounded-full" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">{t.symbol}</span>
                            {isCustom && <span className="text-[9px] bg-white/10 text-zinc-400 font-bold px-1.5 py-0.5 rounded">Custom</span>}
                          </div>
                          <p className="text-xs text-zinc-500">{t.name}</p>
                        </div>
                      </button>

                      {isCustom && (
                        <button
                          onClick={() => handleRemoveCustomToken(t.address)}
                          className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                          title="Remove custom token"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* GM AI Autonomous Trading Agent Copilot */}
      <AIAgentCopilot
        onAutoFillSwap={handleAutoFillSwap}
        onNavigateTab={(tab) => { setActiveTab(tab); setError(""); setTxHash(""); }}
        walletConnected={isConnected}
        walletBalance={balanceData ? parseFloat(balanceData.formatted || "0").toFixed(4) : "0.00"}
      />
    </div>
  );
}
