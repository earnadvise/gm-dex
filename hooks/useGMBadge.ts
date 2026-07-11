"use client";

import { useAccount, useReadContracts } from "wagmi";
import { GM_BADGE_ADDRESS, GM_BADGE_ABI } from "@/lib/contracts";
import { useState, useEffect } from "react";

export interface BadgeInfo {
  id: number;
  name: string;
  description: string;
  image: string;
  owned: boolean;
}

const BADGES_CONFIG = [
  { id: 0, requiredStreak: 7, defaultName: "GM Bronze Streak" },
  { id: 1, requiredStreak: 30, defaultName: "GM Silver Streak" },
  { id: 2, requiredStreak: 100, defaultName: "GM Gold Streak" },
  { id: 3, requiredStreak: 365, defaultName: "GM Diamond Streak" },
];

export function useGMBadge() {
  const { address } = useAccount();
  const [badges, setBadges] = useState<BadgeInfo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Set up contract calls for balanceOf and uri for all 4 badges
  const contracts = address
    ? BADGES_CONFIG.flatMap((badge) => [
        {
          address: GM_BADGE_ADDRESS,
          abi: GM_BADGE_ABI,
          functionName: "balanceOf",
          args: [address, BigInt(badge.id)],
        },
        {
          address: GM_BADGE_ADDRESS,
          abi: GM_BADGE_ABI,
          functionName: "uri",
          args: [BigInt(badge.id)],
        },
      ])
    : [];

  const { data: readResults, refetch } = useReadContracts({
    contracts,
    query: {
      enabled: !!address && GM_BADGE_ADDRESS !== "0x0000000000000000000000000000000000000000",
    },
  });

  useEffect(() => {
    if (!address || GM_BADGE_ADDRESS === "0x0000000000000000000000000000000000000000") {
      setBadges([]);
      setIsLoading(false);
      return;
    }

    if (!readResults || readResults.length === 0) {
      setIsLoading(false);
      return;
    }

    const fetchedBadges: BadgeInfo[] = [];

    for (let i = 0; i < BADGES_CONFIG.length; i++) {
      const config = BADGES_CONFIG[i];
      const balanceResult = readResults[i * 2];
      const uriResult = readResults[i * 2 + 1];

      const balance = balanceResult?.status === "success" ? (balanceResult.result as bigint) : 0n;
      const uriStr = uriResult?.status === "success" ? (uriResult.result as string) : "";

      let name = config.defaultName;
      let description = `Awarded for maintaining a ${config.requiredStreak}-day daily GM streak.`;
      let image = "";

      // Decode Base64 Metadata URI if present
      if (uriStr.startsWith("data:application/json;base64,")) {
        try {
          const base64Data = uriStr.replace("data:application/json;base64,", "");
          const jsonStr = atob(base64Data);
          const metadata = JSON.parse(jsonStr);
          name = metadata.name || name;
          description = metadata.description || description;
          image = metadata.image || "";
        } catch (e) {
          console.error("Error decoding badge metadata:", e);
        }
      }

      fetchedBadges.push({
        id: config.id,
        name,
        description,
        image,
        owned: balance > 0n,
      });
    }

    setBadges(fetchedBadges);
    setIsLoading(false);
  }, [readResults, address]);

  return {
    badges,
    isLoading,
    refetch,
  };
}
