import { createConfig, http, cookieStorage, createStorage } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { coinbaseWallet, injected, metaMask } from "wagmi/connectors";

const isProd = process.env.NODE_ENV === "production";

export const wagmiConfig = createConfig({
  chains: isProd ? [base] : [base, baseSepolia],
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
  connectors: [
    coinbaseWallet({
      appName: "GM DEX",
      preference: "smartWalletOnly",
    }),
    // MetaMask
    metaMask({
      dappMetadata: {
        name: "GM DEX",
        url: "https://gm-dex.vercel.app",
      },
    }),
    // Any other injected wallet (Rabby, Brave, etc.)
    injected({ shimDisconnect: true }),
  ],
  transports: {
    [base.id]: http(
      process.env.NEXT_PUBLIC_RPC_URL || "https://mainnet.base.org"
    ),
    [baseSepolia.id]: http("https://sepolia.base.org"),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
