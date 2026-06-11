import { useEffect, useState, useCallback } from "react";
import { useReadContract, useAccount } from "wagmi";
import { formatUnits } from "viem";
import { Arbitrum_SEPOLIA, ERC20_ABI } from "../lib/constants";
import { orderlyGet } from "../lib/orderly";
import { useOrderlyStore } from "../store/orderly";

export interface BalanceState {
  walletUSDC: string;
  orderlyUSDC: string;
  loading: boolean;
  error: string | null;
}

export function useBalance() {
  const { address } = useAccount();
  const { accountId, keypair } = useOrderlyStore();
  const [orderlyBalance, setOrderlyBalance] = useState("0.000000");
  const [orderlyError, setOrderlyError] = useState<string | null>(null);
  const [orderlyLoading, setOrderlyLoading] = useState(false);

  // On-chain USDC balance (Arbitrum Sepolia)
  const { data: rawBalance, isLoading: walletLoading } = useReadContract({
    address: Arbitrum_SEPOLIA.contracts.USDC as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 10_000 },
  });

  const walletUSDC = rawBalance ? formatUnits(rawBalance as bigint, 6) : "0.000000";

  // Orderly account balance via /v1/client/holding
  const fetchOrderlyBalance = useCallback(async () => {
    if (!accountId || !keypair) {
      console.warn("fetchOrderlyBalance: missing accountId or keypair", {
        accountId,
        hasKeypair: !!keypair,
      });
      return;
    }

    // console.log("Fetching Orderly balance for accountId:", accountId);
    setOrderlyLoading(true);
    setOrderlyError(null);

    try {
      const data = await orderlyGet<{
        holding: { token: string; holding: number }[];
      }>("/v1/client/holding", accountId, keypair);

      // console.log("Orderly holding response:", data);

      const usdc = data.holding?.find((h) => h.token === "USDC");
      setOrderlyBalance(usdc?.holding?.toFixed(6) ?? "0.000000");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to fetch";
      console.error("Orderly balance error:", msg);
      setOrderlyError(msg);
    } finally {
      setOrderlyLoading(false);
    }
  }, [accountId, keypair]);

  useEffect(() => {
    fetchOrderlyBalance();
    const interval = setInterval(fetchOrderlyBalance, 15_000);
    return () => clearInterval(interval);
  }, [fetchOrderlyBalance]);


  const refetchAfterDeposit = useCallback(async () => {
    // console.log("Deposit confirmed — waiting 10s for Orderly indexing…");
    await new Promise((r) => setTimeout(r, 10_000));
    for (let i = 0; i < 3; i++) {
      await fetchOrderlyBalance();
      if (i < 2) await new Promise((r) => setTimeout(r, 5_000));
    }
  }, [fetchOrderlyBalance]);

  return {
    walletUSDC: parseFloat(walletUSDC).toFixed(6),
    orderlyUSDC: orderlyBalance,
    loading: walletLoading || orderlyLoading,
    error: orderlyError,
    refetch: fetchOrderlyBalance,
    refetchAfterDeposit,
  };
}
