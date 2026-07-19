export interface Token {
  address: string;
  chainId: number;
  decimals: number;
  name: string;
  symbol: string;
  image?: string;
}

export const ETH: Token = {
  address: "", // Native ETH represented by empty string
  chainId: 8453,
  decimals: 18,
  name: "Ethereum",
  symbol: "ETH",
  image: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
};

export const USDC: Token = {
  address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  chainId: 8453,
  decimals: 6,
  name: "USD Coin",
  symbol: "USDC",
  image: "https://assets.coingecko.com/coins/images/6319/small/usdc.png",
};

export const cbBTC: Token = {
  address: "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf",
  chainId: 8453,
  decimals: 8,
  name: "Coinbase Wrapped BTC",
  symbol: "cbBTC",
  image: "https://assets.coingecko.com/coins/images/40143/small/cbbtc.webp",
};

export const EURC: Token = {
  address: "0x60a3E35Cc302bFA44Cb288Bc5a4F316Fdb1adb42",
  chainId: 8453,
  decimals: 6,
  name: "Euro Coin",
  symbol: "EURC",
  image: "https://assets.coingecko.com/coins/images/26045/small/euro-coin.png",
};

export const DEGEN: Token = {
  address: "0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed",
  chainId: 8453,
  decimals: 18,
  name: "Degen",
  symbol: "DEGEN",
  image: "https://assets.coingecko.com/coins/images/34515/small/android-chrome-512x512.png",
};

export const SUPPORTED_TOKENS = [ETH, USDC, cbBTC, EURC, DEGEN];
