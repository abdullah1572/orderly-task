

export const BROKER_ID: string =
  import.meta.env.VITE_BROKER_ID ?? "demo";

export const ORDERLY_TESTNET_API: string =
  import.meta.env.VITE_ORDERLY_TESTNET_API ?? "https://testnet-api.orderly.org";

// Arbitrum Sepolia (chainId: 421614)
export const Arbitrum_SEPOLIA = {
  id: Number(import.meta.env.VITE_CHAIN_ID ?? 421614),
  name: import.meta.env.VITE_CHAIN_NAME ?? "Arbitrum Sepolia",
  rpc: import.meta.env.VITE_RPC_URL_PRIMARY ?? "https://sepolia-rollup.arbitrum.io/rpc",
  explorer: import.meta.env.VITE_EXPLORER_URL ?? "https://sepolia.arbiscan.io",
  contracts: {
    USDC: (import.meta.env.VITE_USDC_ADDRESS ?? "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d") as `0x${string}`,
    Vault: (import.meta.env.VITE_VAULT_ADDRESS ?? "0x0EaC556c0C2321BA25b9DC01e4e3c95aD5CDCd2f") as `0x${string}`,
  },
};

// EIP-712 off-chain domain for signing messages that will be verified on Orderly's backend (not on-chain)
export const EIP712_DOMAIN_OFFCHAIN = (chainId: number) => ({
  name: "Orderly",
  version: "1",
  chainId,
  verifyingContract: (import.meta.env.VITE_EIP712_VERIFYING_CONTRACT ?? "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC") as `0x${string}`,
});

// EIP-712 types
export const REGISTRATION_TYPES = {
  EIP712Domain: [
    { name: "name", type: "string" },
    { name: "version", type: "string" },
    { name: "chainId", type: "uint256" },
    { name: "verifyingContract", type: "address" },
  ],
  Registration: [
    { name: "brokerId", type: "string" },
    { name: "chainId", type: "uint256" },
    { name: "timestamp", type: "uint64" },
    { name: "registrationNonce", type: "uint256" },
  ],
} as const;

export const ADD_ORDERLY_KEY_TYPES = {
  EIP712Domain: [
    { name: "name", type: "string" },
    { name: "version", type: "string" },
    { name: "chainId", type: "uint256" },
    { name: "verifyingContract", type: "address" },
  ],
  AddOrderlyKey: [
    { name: "brokerId", type: "string" },
    { name: "chainId", type: "uint256" },
    { name: "orderlyKey", type: "string" },
    { name: "scope", type: "string" },
    { name: "timestamp", type: "uint64" },
    { name: "expiration", type: "uint64" },
  ],
} as const;

// vault abi for deposits
export const VAULT_ABI = [
  {
    name: "deposit",
    type: "function",
    stateMutability: "payable",
    inputs: [
      {
        name: "data",
        type: "tuple",
        components: [
          { name: "accountId",   type: "bytes32" },
          { name: "brokerHash",  type: "bytes32" },
          { name: "tokenHash",   type: "bytes32" },
          { name: "tokenAmount", type: "uint128" },
        ],
      },
    ],
    outputs: [],
  },
] as const;

export const ERC20_ABI = [
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "decimals",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint8" }],
  },
] as const;
