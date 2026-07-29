<div align="center">

# ☀️ GM DEX
### High-Performance Decentralized Exchange & Liquidity Protocol on Base Mainnet

![Base Mainnet](https://img.shields.io/badge/Network-Base_Mainnet_(8453)-blue?style=for-the-badge&logo=coinbase)
![Next.js 16](https://img.shields.io/badge/Next.js-16_Turbopack-black?style=for-the-badge&logo=next.js)
![Wagmi v2](https://img.shields.io/badge/Wagmi-v2.19-green?style=for-the-badge)
![Aerodrome V2](https://img.shields.io/badge/Routing-Aerodrome_V2-cyan?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-purple?style=for-the-badge)

<p align="center">
  <b>Swap Any Token</b> • <b>Provide Liquidity & Earn Fees</b> • <b>Multi-Chain Asset Bridge</b>
</p>

</div>

---

## 📌 Executive Summary

**GM DEX** is a next-generation decentralized exchange built natively on **Base Mainnet**. Designed with a modern slate-blue and mint-green glassmorphism dark aesthetic, GM DEX combines direct **Aerodrome V2 liquidity routing**, automated protocol fee collection to Treasury, real-time LP position tracking, and standard **Base Builder Code attribution** (`6a488e6c2876ee6c1138a856`).

---

## 🌟 Core Features

### 🔄 1. High-Execution Token Swaps
- **Best Execution**: Direct integration with Aerodrome V2 Router (`0xcF77a...`) for optimal routing across Volatile (vAMM) and Stable (sAMM) pools.
- **Protocol Fee Collection**: Dedicated `GMDexRouter` smart contract collects a 0.1% swap fee directly to the Protocol Treasury.
- **Zero-Delay Quotes**: Real-time price estimation with minimum slippage guards.

### 💧 2. Liquidity Pools & LP Dashboard
- **All-in-One Dashboard**: Live stats for Total Value Locked (TVL), 24h Volume, and Active Pools.
- **Real-Time LP Tracking**: Automatically queries Aerodrome Pool Factory (`0x420D...`) for connected wallet LP token balances and pool share percentages every 2 seconds.
- **Fee-Collecting Deposits**: Deposits are processed through `AeroDexLiquidity`, collecting deposit fees straight to Treasury before pooling.
- **Dynamic Liquidity Calculations**: Instant paired-token ratio matching for MAX deposits and single-click LP withdrawals.

### 🌉 3. Fee-Earning Multi-Chain Bridge
- **15+ Chain Connectivity**: Embedded LI.FI / Jumper cross-chain bridge supporting transfers from Ethereum Mainnet, Arbitrum, Polygon, Optimism, and Solana directly to Base Mainnet.
- **Automatic 0.1% Treasury Revenue**: Pre-configured with custom integrator fees that automatically pay 0.1% of every cross-chain transfer into the Protocol Treasury.

### 🏷️ 4. Base Builder Code Attribution
- **ERC-8021 Suffix**: Appends standard Base Builder Code (`6a488e6c2876ee6c1138a856`) to swap and liquidity transaction payloads, ensuring maximum ecosystem builder rewards from Coinbase/Base.

---

## 📜 Smart Contract Architecture (Base Mainnet - Chain ID: 8453)

| Component | Network | Description & Role |
| :--- | :--- | :--- |
| 🛡️ **`GMDexRouter`** | Base Mainnet | **Swap Fee Router** — Collects 0.1% swap fee to Treasury and executes swap via Aerodrome Router. |
| 💧 **`AeroDexLiquidity`** | Base Mainnet | **Liquidity Fee Router** — Collects deposit fee to Treasury and deposits remaining liquidity into Aerodrome pools. |
| 🔄 **`AeroRouter`** | Base Mainnet | **Aerodrome V2 Router** — Handles price quote queries, reserve ratio calculations, and LP withdrawals. |
| 🏭 **`AeroFactory`** | Base Mainnet | **Aerodrome Pool Factory** — Fetches LP pool addresses for balance tracking and reserve queries. |

---

## 🏛️ System Architecture Diagram

```mermaid
graph TB
    subgraph Client Layer
        UI["GM DEX Web App (Next.js 16)"]
        Wagmi["Wagmi v2 / Viem Client"]
    end

    subgraph Smart Contracts on Base Mainnet
        SwapContract["GMDexRouter (0x9dc3...)"]
        LiqContract["AeroDexLiquidity (0x379b...)"]
        AeroRouter["Aerodrome Router (0xcF77...)"]
        AeroFactory["Aerodrome Factory (0x420D...)"]
    end

    subgraph Protocol Revenue
        Treasury["Protocol Treasury"]
        CoinbaseBuilder["Base Builder Rewards (6a488e6c...)"]
    end

    subgraph Cross-Chain Infrastructure
        LI FI["LI.FI / Jumper Bridge Widget"]
    end

    UI --> Wagmi
    Wagmi -->|Swap Token| SwapContract
    Wagmi -->|Add Liquidity| LiqContract
    Wagmi -->|Remove LP| AeroRouter
    Wagmi -->|Bridge Assets| LI FI

    SwapContract -->|0.1% Fee| Treasury
    SwapContract -->|Route Swap| AeroRouter
    LiqContract -->|Deposit Fee| Treasury
    LiqRouter -->|Deposit Tokens| AeroRouter
    LI FI -->|0.1% Fee Share| Treasury

    SwapContract -.->|ERC-8021 Data Suffix| CoinbaseBuilder
    LiqContract -.->|ERC-8021 Data Suffix| CoinbaseBuilder
```

---

## 🪙 Supported Tokens

| Token Symbol | Token Name | Contract Address (Base) | Decimals |
| :--- | :--- | :--- | :--- |
| **ETH** | Native Ethereum | `0x0000000000000000000000000000000000000000` | 18 |
| **WETH** | Wrapped Ether | `0x4200000000000000000000000000000000000006` | 18 |
| **USDC** | USD Coin (Circle) | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` | 6 |
| **EURC** | Euro Coin (Circle) | `0x60a3E35Cc1051386f1Df2370ca6e1B4d7583626c` | 6 |

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 16 (App Router, Turbopack), React 19, TypeScript
- **Web3 Ecosystem**: Wagmi 2.19, Viem 2.54, Coinbase OnchainKit
- **Smart Contracts**: Solidity ^0.8.20, Hardhat, OpenZeppelin 5.x
- **Liquidity Provider**: Aerodrome V2 (Base Mainnet)
- **Cross-Chain Bridge**: LI.FI / Jumper Exchange Embed
- **Styling & Design System**: Tailwind CSS v4, Lucide Icons, Glassmorphism UI

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18.x
- npm >= 9.x

### 1. Clone Repository
```bash
git clone https://github.com/earnadvise/gm-dex.git
cd gm-dex
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_RPC_URL=https://mainnet.base.org
NEXT_PUBLIC_BUILDER_CODE=6a488e6c2876ee6c1138a856
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view GM DEX in your browser.

---

## 🔒 Security & Quality Assurance

- **Flattened Verification**: Contracts have been flattened and compiled with Solc 0.8.20 with standard zero-local-variable stack optimization for gas safety.
- **Non-Custodial**: Users retain full control of their private keys and tokens at all times.
- **Direct DEX Routing**: Swaps and liquidity deposits execute atomically on Base Mainnet via verified protocol smart contracts.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for details.
