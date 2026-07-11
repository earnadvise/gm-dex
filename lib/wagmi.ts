import { createConfig, http, cookieStorage, createStorage } from "wagmi";
import { base, baseSepolia, localhost } from "wagmi/chains";
import { coinbaseWallet, injected } from "wagmi/connectors";

export const wagmiConfig = createConfig({
  chains: [base, baseSepolia, localhost],
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
  connectors: [
    coinbaseWallet({
      appName: "GM DEX",
      preference: "smartWalletOnly",
    }),
    injected(),
  ],
  transports: {
    [base.id]: http(process.env.NEXT_PUBLIC_RPC_URL || "https://mainnet.base.org"),
    [baseSepolia.id]: http("https://sepolia.base.org"),
    [localhost.id]: http("http://127.0.0.1:8545"),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
