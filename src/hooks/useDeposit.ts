import { useState, useCallback } from "react";
import { useWriteContract, useAccount, useChainId, useSwitchChain } from "wagmi";
import { waitForTransactionReceipt } from "@wagmi/core";
import { parseUnits, parseEther, keccak256, toBytes, parseGwei } from "viem";
import { arbitrumSepolia } from "wagmi/chains";
import { Arbitrum_SEPOLIA, ERC20_ABI, VAULT_ABI, BROKER_ID } from "../lib/constants";
import { useOrderlyStore } from "../store/orderly";
import { wagmiConfig } from "../lib/wagmi";

export type TxStatus =
  | { type: "idle" }
  | { type: "approving" }
  | { type: "approve_pending"; hash: string }
  | { type: "depositing" }
  | { type: "deposit_pending"; hash: string }
  | { type: "success"; hash: string }
  | { type: "error"; message: string };

// ── Gas override — prevents "max fee < base fee" on Arbitrum Sepolia testnet ──
const GAS_OVERRIDE = {
  maxFeePerGas: parseGwei("0.15"),
  maxPriorityFeePerGas: parseGwei("0.01"),
} as const;

export function useDeposit() {
  const { address } = useAccount();
  const { accountId } = useOrderlyStore();
  const { writeContractAsync } = useWriteContract();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const [status, setStatus] = useState<TxStatus>({ type: "idle" });

  const deposit = useCallback(
    async (amount: string) => {
      if (!address || !accountId) throw new Error("Not onboarded");

      try {
        // ensure user is on Arbitrum Sepolia before proceeding
        if (chainId !== arbitrumSepolia.id) {
          await switchChainAsync({ chainId: arbitrumSepolia.id });
        }

        const tokenAmount = parseUnits(amount, 6); // USDC = 6 decimals

        // approve Vault to spend USDC on behalf of user
        setStatus({ type: "approving" });
        const approveHash = await writeContractAsync({
          address: Arbitrum_SEPOLIA.contracts.USDC as `0x${string}`,
          abi: ERC20_ABI,
          functionName: "approve",
          args: [
            Arbitrum_SEPOLIA.contracts.Vault as `0x${string}`,
            tokenAmount,
          ],
          ...GAS_OVERRIDE,
        });
        setStatus({ type: "approve_pending", hash: approveHash });

        // wait for approval tx to be mined before sending deposit tx
        await waitForTransactionReceipt(wagmiConfig, {
          hash: approveHash,
          confirmations: 1,
        });

        // build deposit data
        const brokerHash = keccak256(toBytes(BROKER_ID)) as `0x${string}`;
        const tokenHash = keccak256(toBytes("USDC")) as `0x${string}`;

      
        const rawStored = accountId.replace(/^0x/i, "");
        const accountIdBytes32 = `0x${rawStored.padStart(64, "0")}` as `0x${string}`;

        // console.log("accountId being sent to Vault:", accountIdBytes32);
        // console.log("brokerHash                   :", brokerHash);
        // console.log("tokenHash                    :", tokenHash);
        // console.log("tokenAmount                  :", tokenAmount.toString());

        // call deposit function on Vault
        setStatus({ type: "depositing" });
        const depHash = await writeContractAsync({
          address: Arbitrum_SEPOLIA.contracts.Vault as `0x${string}`,
          abi: VAULT_ABI,
          functionName: "deposit",
          args: [
            {
              accountId: accountIdBytes32,
              brokerHash: brokerHash,
              tokenHash: tokenHash,
              tokenAmount: tokenAmount,
            },
          ],
          value: parseEther("0.001"), 
          ...GAS_OVERRIDE,
        });
        setStatus({ type: "deposit_pending", hash: depHash });

        // wait for deposit tx to be mined
        await waitForTransactionReceipt(wagmiConfig, {
          hash: depHash,
          confirmations: 1,
        });

        setStatus({ type: "success", hash: depHash });

      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setStatus({ type: "error", message: msg });
      }
    },
    [address, accountId, chainId, switchChainAsync, writeContractAsync]
  );

  return { deposit, status, setStatus };
}