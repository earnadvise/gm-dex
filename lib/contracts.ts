export const GM_STREAK_ADDRESS = (process.env.NEXT_PUBLIC_GM_STREAK_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`;
export const GM_BADGE_ADDRESS = (process.env.NEXT_PUBLIC_GM_BADGE_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`;

export const GM_STREAK_ABI = [
  {
    inputs: [],
    name: "sayGM",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "getStreak",
    outputs: [
      {
        internalType: "uint256",
        name: "currentStreak",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "longestStreak",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "lastGMTime",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "totalGMs",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "xp",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getLeaderboard",
    outputs: [
      {
        internalType: "address[10]",
        name: "",
        type: "address[10]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

export const GM_BADGE_ABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "hasBadge",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
    ],
    name: "uri",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;
