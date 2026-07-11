"use client";

import { useAccount, useReadContract } from "wagmi";
import { GM_STREAK_ADDRESS, GM_STREAK_ABI } from "@/lib/contracts";
import { appendBuilderCode } from "@/lib/builderCode";
import { encodeFunctionData, Hex } from "viem";
import { useState, useEffect } from "react";

export function useGMStreak() {
  const { address } = useAccount();
  const [cooldownTimeLeft, setCooldownTimeLeft] = useState<string>("");
  const [isGMCooldown, setIsGMCooldown] = useState<boolean>(false);

  // Read user streak data
  const { data: streakData, refetch } = useReadContract({
    address: GM_STREAK_ADDRESS,
    abi: GM_STREAK_ABI,
    functionName: "getStreak",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  const [currentStreak, longestStreak, lastGMTime, totalGMs, xp] = streakData || [
    0n,
    0n,
    0n,
    0n,
    0n,
  ];

  // Calculate cooldown timer
  useEffect(() => {
    if (!lastGMTime || lastGMTime === 0n) {
      setIsGMCooldown(false);
      setCooldownTimeLeft("");
      return;
    }

    const lastGMSeconds = Number(lastGMTime);
    const cooldownPeriod = 23 * 60 * 60; // 23 hours in seconds
    const nextGMTime = lastGMSeconds + cooldownPeriod;

    const updateTimer = () => {
      const currentSeconds = Math.floor(Date.now() / 1000);
      const diff = nextGMTime - currentSeconds;

      if (diff <= 0) {
        setIsGMCooldown(false);
        setCooldownTimeLeft("");
      } else {
        setIsGMCooldown(true);
        const hours = Math.floor(diff / 3600);
        const minutes = Math.floor((diff % 3600) / 60);
        const seconds = diff % 60;
        setCooldownTimeLeft(
          `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
        );
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [lastGMTime]);

  // Encode the transaction calldata with Builder Code attribution suffix
  let sayGMCall = null;
  if (GM_STREAK_ADDRESS !== "0x0000000000000000000000000000000000000000") {
    try {
      const rawData = encodeFunctionData({
        abi: GM_STREAK_ABI,
        functionName: "sayGM",
      });
      const dataWithAttribution = appendBuilderCode(rawData);
      sayGMCall = {
        to: GM_STREAK_ADDRESS,
        data: dataWithAttribution as Hex,
      };
    } catch (e) {
      console.error("Failed to encode sayGM calldata:", e);
    }
  }

  return {
    currentStreak: Number(currentStreak),
    longestStreak: Number(longestStreak),
    lastGMTime: Number(lastGMTime),
    totalGMs: Number(totalGMs),
    xp: Number(xp),
    isGMCooldown,
    cooldownTimeLeft,
    sayGMCall: sayGMCall ? [sayGMCall] : [],
    refetch,
  };
}
