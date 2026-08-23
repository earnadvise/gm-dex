import { useState, useEffect, useCallback } from "react";

export const DEFAULT_TOKEN_PRICES: Record<string, number> = {
  ETH: 1885.0,
  WETH: 1885.0,
  USDC: 1.0,
  USDT: 1.0,
  EURC: 1.15,
  CBBTC: 64150.0,
  DEGEN: 0.00123,
  BRETT: 0.045,
  TOSHI: 0.000103,
  AERO: 0.42,
  VIRTUAL: 0.55,
};

const COIN_LLAMA_IDS = [
  "coingecko:ethereum",
  "coingecko:usd-coin",
  "coingecko:tether",
  "coingecko:euro-coin",
  "coingecko:coinbase-wrapped-btc",
  "coingecko:degen-base",
  "coingecko:brett",
  "coingecko:toshi",
  "coingecko:aerodrome-finance",
  "coingecko:virtual-protocol",
].join(",");

export function useTokenPrices() {
  const [prices, setPrices] = useState<Record<string, number>>(DEFAULT_TOKEN_PRICES);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPrices = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`https://coins.llama.fi/prices/current/${COIN_LLAMA_IDS}`);
      if (!res.ok) throw new Error("Price fetch failed");
      const data = await res.json();
      if (data && data.coins) {
        setPrices((prev) => {
          const newPrices = { ...prev };
          Object.values(data.coins).forEach((coin: any) => {
            if (coin.symbol && typeof coin.price === "number") {
              const sym = coin.symbol.toUpperCase();
              newPrices[sym] = coin.price;
              if (sym === "ETH") newPrices["WETH"] = coin.price;
            }
          });
          return newPrices;
        });
      }
    } catch (err) {
      console.warn("Using fallback token prices:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCustomTokenPrice = useCallback(async (tokenAddress: string): Promise<number | null> => {
    if (!tokenAddress || !tokenAddress.startsWith("0x")) return null;
    const cleanAddr = tokenAddress.toLowerCase();
    try {
      const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${cleanAddr}`);
      if (!res.ok) return null;
      const data = await res.json();
      if (data && data.pairs && data.pairs.length > 0) {
        // Find highest liquidity pair or first pair with priceUsd
        const validPair = data.pairs.find((p: any) => p.priceUsd && Number(p.priceUsd) > 0) || data.pairs[0];
        if (validPair && validPair.priceUsd) {
          const numPrice = parseFloat(validPair.priceUsd);
          if (!isNaN(numPrice) && numPrice > 0) {
            const sym = validPair.baseToken?.symbol?.toUpperCase();
            setPrices((prev) => {
              const updated = { ...prev };
              updated[cleanAddr] = numPrice;
              if (sym) updated[sym] = numPrice;
              return updated;
            });
            return numPrice;
          }
        }
      }
    } catch (e) {
      console.warn(`DexScreener price fetch failed for ${tokenAddress}:`, e);
    }
    return null;
  }, []);

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, []);

  return { prices, isLoading, refetchPrices: fetchPrices, fetchCustomTokenPrice };
}

