# ☀️ GM DEX

> Daily GM streaks, soulbound milestone badges, and premium token swaps on Base.

A Progressive Web App (PWA) built on Base using Next.js 16, Coinbase OnchainKit, Wagmi, and Hardhat.

---

## Features

- **Daily GM Streak** — Say GM once every 23 hours to maintain your streak and earn XP
- **Soulbound Milestone Badges** — Auto-minted ERC-1155 badges at 7, 30, 100, and 365-day streaks with fully on-chain SVG metadata
- **Token Swap** — Swap ETH, USDC, cbBTC, EURC, and DEGEN on Base via Coinbase OnchainKit
- **On-chain Leaderboard** — Top 10 GM'ers tracked directly on-chain
- **PWA Push Notifications** — Daily GM reminders via Web Push (VAPID)
- **Multi-chain EVM** — Supports Base Mainnet, Base Sepolia, and local Hardhat node
- **Demo Mode** — Fully functional simulation using LocalStorage when contracts aren't deployed

---

## Smart Contracts

| Contract | Description |
|---|---|
| `GMStreak.sol` | Tracks daily GMs, streaks, XP, and leaderboard |
| `GMBadge.sol` | Soulbound ERC-1155 milestone badges with on-chain SVG metadata |

### Deploy contracts

```bash
# Deploy to Base Mainnet
npx hardhat run scripts/deploy.ts --network base

# Run tests on local Hardhat node
npx hardhat test
```

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Generate VAPID keys & init environment

```bash
node scripts/generate-vapid.js
```

This creates `.env.local` with VAPID keys. Add your other keys:

```env
NEXT_PUBLIC_CDP_API_KEY=your_coinbase_developer_platform_key
NEXT_PUBLIC_RPC_URL=https://mainnet.base.org
NEXT_PUBLIC_BUILDER_CODE=your_builder_code

# Set after deploying contracts:
NEXT_PUBLIC_GM_STREAK_ADDRESS=0x...
NEXT_PUBLIC_GM_BADGE_ADDRESS=0x...
```

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> **Note:** If contract addresses are not set, the app runs in **Demo Mode** — all streak, XP, and badge features work locally via `localStorage`.

---

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org) (App Router, Turbopack)
- **Web3**: [Wagmi v2](https://wagmi.sh) + [Viem](https://viem.sh)
- **Wallet & Swap**: [Coinbase OnchainKit](https://onchainkit.xyz)
- **Smart Contracts**: [Hardhat](https://hardhat.org) + [OpenZeppelin](https://openzeppelin.com)
- **Styling**: Tailwind CSS v4 with glassmorphism dark theme
- **Push Notifications**: [web-push](https://github.com/web-push-libs/web-push) (VAPID)
- **Chain**: [Base](https://base.org) (mainnet + Sepolia)

---

## Builder Code Attribution

Transaction attribution for OnchainKit swaps and GM calls is appended via `lib/builderCode.ts` using the `NEXT_PUBLIC_BUILDER_CODE` env variable (ERC-8021 standard).

---

## License

MIT
