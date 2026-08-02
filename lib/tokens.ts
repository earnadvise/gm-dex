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
  image: "/tokens/eth.svg",
};

export const USDC: Token = {
  address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  chainId: 8453,
  decimals: 6,
  name: "USD Coin",
  symbol: "USDC",
  image: "/tokens/usdc.svg",
};

export const cbBTC: Token = {
  address: "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf",
  chainId: 8453,
  decimals: 8,
  name: "Coinbase Wrapped BTC",
  symbol: "cbBTC",
  image: "/tokens/cbbtc.svg",
};

export const EURC: Token = {
  address: "0x60a3E35Cc302bFA44Cb288Bc5a4F316Fdb1adb42",
  chainId: 8453,
  decimals: 6,
  name: "Euro Coin",
  symbol: "EURC",
  image: "/tokens/eurc.svg",
};

export const DEGEN: Token = {
  address: "0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed",
  chainId: 8453,
  decimals: 18,
  name: "Degen",
  symbol: "DEGEN",
  image: "/tokens/degen.svg",
};

export const BRETT: Token = {
  address: "0x532f27101965dd16442E59d40670FaF5ebb142E4",
  chainId: 8453,
  decimals: 18,
  name: "Brett",
  symbol: "BRETT",
  image: "/tokens/brett.svg",
};

export const TOSHI: Token = {
  address: "0xAC1Bd2447a101b0089A7696256B111c8389E5A0B",
  chainId: 8453,
  decimals: 18,
  name: "Toshi",
  symbol: "TOSHI",
  image: "/tokens/toshi.svg",
};

export const AERO: Token = {
  address: "0x940181a94A35A4569E4529A3CDfB74e38FD98631",
  chainId: 8453,
  decimals: 18,
  name: "Aerodrome",
  symbol: "AERO",
  image: "/tokens/aero.svg",
};

export const VIRTUAL: Token = {
  address: "0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b",
  chainId: 8453,
  decimals: 18,
  name: "Virtual Protocol",
  symbol: "VIRTUAL",
  image: "/tokens/virtual.svg",
};

export const SUPPORTED_TOKENS = [ETH, USDC, cbBTC, EURC, DEGEN, BRETT, TOSHI, AERO, VIRTUAL];
