import { useState, useEffect } from "react";

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
        const newPrices = { ...DEFAULT_TOKEN_PRICES };
        Object.values(data.coins).forEach((coin: any) => {
          if (coin.symbol && typeof coin.price === "number") {
            const sym = coin.symbol.toUpperCase();
            newPrices[sym] = coin.price;
            if (sym === "ETH") newPrices["WETH"] = coin.price;
          }
        });
        setPrices(newPrices);
      }
    } catch (err) {
      console.warn("Using fallback token prices:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, []);

  return { prices, isLoading, refetchPrices: fetchPrices };
}
