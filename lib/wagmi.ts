import { createConfig, http, fallback, cookieStorage, createStorage } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { coinbaseWallet, injected, metaMask } from "wagmi/connectors";

const isProd = process.env.NODE_ENV === "production";

export const wagmiConfig = createConfig({
  chains: isProd ? [base] : [base, baseSepolia],
  ssr: true,
  storage: createStorage({
    storage: typeof window !== "undefined" ? window.localStorage : cookieStorage,
  }),
  multiInjectedProviderDiscovery: true,
  connectors: [
    injected({ shimDisconnect: true }),
    coinbaseWallet({
      appName: "GMDEXAI",
      preference: "all",
    }),
    metaMask({
      dappMetadata: {
        name: "GMDEXAI",
        url: "https://www.gmdexai.xyz",
      },
    }),
  ],
  transports: {
    [base.id]: fallback([
      http(process.env.NEXT_PUBLIC_RPC_URL || "https://mainnet.base.org"),
      http("https://base.llamarpc.com"),
      http("https://1rpc.io/base"),
    ]),
    [baseSepolia.id]: http("https://sepolia.base.org"),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
