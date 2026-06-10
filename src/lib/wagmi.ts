import { createConfig, http, fallback } from "wagmi";
import { arbitrumSepolia } from "wagmi/chains";
import { metaMask, walletConnect, coinbaseWallet, injected } from "wagmi/connectors";

const WC_PROJECT_ID: string =
  import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ?? "";

const COINBASE_APP_NAME: string =
  import.meta.env.VITE_COINBASE_APP_NAME ?? "Orderly Perpetuals Dashboard";

const RPC_PRIMARY: string =
  import.meta.env.VITE_RPC_URL_PRIMARY ?? "https://sepolia-rollup.arbitrum.io/rpc";

const RPC_FALLBACK_1: string =
  import.meta.env.VITE_RPC_URL_FALLBACK_1 ?? "https://arbitrum-sepolia.drpc.org";

const RPC_FALLBACK_2: string =
  import.meta.env.VITE_RPC_URL_FALLBACK_2 ?? "https://arbitrum-sepolia-rpc.publicnode.com";

export const wagmiConfig = createConfig({
  chains: [arbitrumSepolia],

  connectors: [
    metaMask(),
    walletConnect({
      projectId: WC_PROJECT_ID,
    }),
    coinbaseWallet({
      appName: COINBASE_APP_NAME,
    }),
    injected(),
  ],

  transports: {
    [arbitrumSepolia.id]: fallback([
      http(RPC_PRIMARY),
      http(RPC_FALLBACK_1),
      http(RPC_FALLBACK_2),
    ]),
  },
});
