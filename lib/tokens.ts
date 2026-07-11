export interface Token {
  address: string;
  chainId: number;
  decimals: number;
  name: string;
  symbol: string;
  image?: string;
}

export const ETH: Token = {
  address: "", // Native ETH represented by empty string in OnchainKit
  chainId: 8453,
  decimals: 18,
  name: "Ethereum",
  symbol: "ETH",
  image: "https://wallet-api-production.s3.amazonaws.com/uploads/tokens/eth_288.png",
};

export const USDC: Token = {
  address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  chainId: 8453,
  decimals: 6,
  name: "USD Coin",
  symbol: "USDC",
  image: "https://dynamic-assets.coinbase.com/3c15df5e473412589f52e4b97b7eb1b/metadata/images/1455e9c0-13ce-4b9d-b3e3-c5e2d4e6c8b3.png",
};

export const cbBTC: Token = {
  address: "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf",
  chainId: 8453,
  decimals: 8,
  name: "Coinbase Wrapped BTC",
  symbol: "cbBTC",
  image: "https://dynamic-assets.coinbase.com/5b1ab19d4546522c0691e843b09de23a26dbfeaa2377fa1cc9f68e0d6e685aa92d24495af445cbf92b0c1630c904faab7c8e96bb9f1a070f3f6c8d7de077b949/metadata/images/40960d70-bf21-4f9e-a6cf-87adff7c5936.png",
};

export const EURC: Token = {
  address: "0x60a3E35Cc302bFA44Cb288Bc5a4F316Fdb1adb42",
  chainId: 8453,
  decimals: 6,
  name: "Euro Coin",
  symbol: "EURC",
  image: "https://dynamic-assets.coinbase.com/978ab46d843ab7f415c1b6973ba52427a19999059e6edc6e4be3cb9761e0f0cc836c2ef16b08e58319f390029b359f1fb9d1b1137c4c1a5f6e3c8d7de077b949/metadata/images/1fc6fcdb-226e-44c1-9fbd-d1bf1e6fdbcd.png",
};

export const DEGEN: Token = {
  address: "0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed",
  chainId: 8453,
  decimals: 18,
  name: "Degen",
  symbol: "DEGEN",
  image: "https://wallet-api-production.s3.amazonaws.com/uploads/tokens/degen_288.png",
};

export const SUPPORTED_TOKENS = [ETH, USDC, cbBTC, EURC, DEGEN];
