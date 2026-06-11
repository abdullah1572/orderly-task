# Project Network 

ALL Project built on arbitrum Sepolia test network so you need usdc of arbitrum Sepolia also need arbitrum Sepolia

# Orderly Perpetuals Dashboard — Testnet

Frontend assessment: perpetuals trading dashboard on **Orderly Network testnet**.

## Stack
TypeScript · React 18 · Redux · Tailwind · wagmi v2 · viem

---

## Setup
1 ENV file also on github just for testing purpose other wise need to send you seprately
2 Need to add arbitrum sepolia into your metask manually
```bash
npm install
npm run dev
```

---

## Required Config (Before Running)

### 1. Get your brokerId
Register at https://orderly.network/docs/build-on-evm/building-on-evm
Then update src/lib/constants.ts:
```ts
export const BROKER_ID = "your_broker_id";
```

### 2. WalletConnect Project ID
Get free at https://cloud.walletconnect.com, then update src/lib/wagmi.ts:
```ts
const WC_PROJECT_ID = "your_project_id";
```

### 3. Get testnet USDC
Faucet: https://faucet.circle.com (select Arbitrum Sepolia)

### 4. Get testnet ETH (for gas)
https://faucets.chain.link/arbitrum-sepolia

---

## Features

| # | Feature | Status |
|---|---------|--------|
| 1 | Orderly Onboarding — account registration + access-key via EIP-712, no SDK | Done |
| 2 | Deposit — USDC approve + vault deposit (viem) | Done |
| 3 | Withdraw — signed EIP-712 withdrawal, settled on-chain | Done |
| 4 | Balance — wallet USDC + Orderly account balance | Done |
| 5 | Multi-wallet — MetaMask, WalletConnect v2, Coinbase, Trust — no RainbowKit | Done |

---

## Onboarding Flow (Point 1)

```
Connect Wallet
-> GET /v1/get_account  (check existing)
-> GET /v1/registration_nonce
-> signTypedData EIP-712 Registration (off-chain, no gas)
-> POST /v1/register_account
-> Generate ed25519 keypair (client-side, @noble/ed25519)
-> signTypedData EIP-712 AddOrderlyKey (off-chain, no gas)
-> POST /v1/orderly_key
-> Store keypair -> ready to sign all API requests
```

## Testnet Contracts (Arbitrum Sepolia, chainId: 421614)

USDC:  0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d
Vault: 0x0EaC556c0C2321BA25b9DC01e4e3c95aD5CDCd2f
API:   https://testnet-api.orderly.org

## Trade-offs

- No RainbowKit: connectors wired manually with wagmi per spec
- Redux TooleKit
- ed25519 via @noble/ed25519: pure TS, audited, no native deps
- Keypair in localStorage: fine for testnet; production needs encrypted keystore
- Arbitrum Sepolia: Goerli deprecated Jan 2024; Sepolia is current testnet


# Special Note Orderly Network is slow 

You can see you transaction here https://testnet.layerzeroscan.com/address if orderly balance not updating becuase its of slow network but you can see transaction here

# Chain Switching

On mobile chain switching also working also please connect metamask through walletconnect becuase if directly click on metamask it will connect account also signature give but provider responce not comes 