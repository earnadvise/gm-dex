"use client";

import { ReactNode, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import { useChainId } from "wagmi";
import { base, baseSepolia, localhost } from "wagmi/chains";
import { wagmiConfig } from "@/lib/wagmi";
import "@coinbase/onchainkit/styles.css";

function OnchainKitWrapper({ children }: { children: ReactNode }) {
  const chainId = useChainId();

  // Resolve chain based on active wallet chainId — cast needed since OnchainKitProvider
  // types its chain prop narrowly to typeof base
  const activeChain =
    chainId === baseSepolia.id ? baseSepolia :
    chainId === localhost.id ? localhost :
    base;

  return (
    <OnchainKitProvider
      apiKey={process.env.NEXT_PUBLIC_CDP_API_KEY || ""}
      chain={activeChain as any}
      config={{
        appearance: {
          name: "GM DEX",
          theme: "dark",
          mode: "dark",
        },
      }}
    >
      {children}
    </OnchainKitProvider>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  }));

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitWrapper>{children}</OnchainKitWrapper>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
