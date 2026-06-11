import { useState, useCallback } from "react";
import { useAccount } from "wagmi";
import { useSignTypedData } from "wagmi";
import { parseUnits, isAddress, getAddress } from "viem";
import { BROKER_ID } from "../lib/constants";
import { useOrderlyStore } from "../store/orderly";
import { orderlyGet, orderlyPost } from "../lib/orderly";

const LEDGER_CONTRACT = "0x1826B75e2ef249173FC735149AE4B8e9ea10abff" as `0x${string}`;
const CHAIN_ID = 421614; 

const WITHDRAW_TYPES = {
  Withdraw: [
    { name: "brokerId",      type: "string"  },
    { name: "chainId",       type: "uint256" },
    { name: "receiver",      type: "address" },
    { name: "token",         type: "string"  },
    { name: "amount",        type: "uint256" },
    { name: "withdrawNonce", type: "uint64"  },
    { name: "timestamp",     type: "uint64"  },
  ],
} as const;

export type WithdrawStatus =
  | { type: "idle" }
  | { type: "loading"; message: string }
  | { type: "success"; withdrawId: string }
  | { type: "error"; message: string };

export function useWithdraw() {
  const { address } = useAccount();
  const { signTypedDataAsync } = useSignTypedData();
  const { accountId, keypair } = useOrderlyStore();
  const [status, setStatus] = useState<WithdrawStatus>({ type: "idle" });

  const withdraw = useCallback(
    async (amount: string) => {
      // console.log("BROKER_ID:", BROKER_ID);
      // console.log("address:", address);
      // console.log("accountId:", accountId);
      // console.log("amount requested:", amount);

      if (!address || !accountId || !keypair) {
        setStatus({ type: "error", message: "Not onboarded. Please connect and onboard first." });
        return;
      }
      if (!isAddress(address)) {
        setStatus({ type: "error", message: "Invalid wallet address." });
        return;
      }

      const receiver = getAddress(address);

      try {
        // check Orderly balance and nonce before signing
        setStatus({ type: "loading", message: "Checking Orderly balance…" });

        const [nonceData, holdingData] = await Promise.all([
          orderlyGet<{ withdraw_nonce: number }>("/v1/withdraw_nonce", accountId, keypair),
          orderlyGet<{ holding: { token: string; holding: number }[] }>("/v1/client/holding", accountId, keypair),
        ]);

        // console.log("Nonce:", nonceData);
        // console.log("Holding:", holdingData);

        const usdcHolding = holdingData.holding?.find((h) => h.token === "USDC");
        const available = usdcHolding?.holding ?? 0;
        // console.log("Available:", available);

        if (available <= 0) {
          setStatus({ type: "error", message: "No USDC in Orderly account. Deposit first." });
          return;
        }
        if (parseFloat(amount) > available) {
          setStatus({ type: "error", message: `Amount exceeds balance. Available: ${available.toFixed(6)} USDC` });
          return;
        }

        const withdrawNonce = nonceData.withdraw_nonce;

        // one timestamp for both signing and submission to ensure validity of signature on-chain
        const timestamp = Date.now();

        const tokenAmountRaw = parseUnits(amount, 6); 

        // console.log("withdrawNonce:", withdrawNonce);
        // console.log("timestamp:", timestamp);
        // console.log("tokenAmountRaw:", tokenAmountRaw.toString());

        // sign the withdrawal message
        setStatus({ type: "loading", message: "Sign the withdrawal in your wallet…" });

        const signature = await signTypedDataAsync({
          domain: {
            name: "Orderly",
            version: "1",
            chainId: CHAIN_ID,
            verifyingContract: LEDGER_CONTRACT,
          },
          types: WITHDRAW_TYPES,
          primaryType: "Withdraw",
          message: {
            brokerId:      BROKER_ID,
            chainId:       BigInt(CHAIN_ID),
            receiver,
            token:         "USDC",
            amount:        tokenAmountRaw,        
            withdrawNonce: BigInt(withdrawNonce),
            timestamp:     BigInt(timestamp),
          },
        });

        // console.log("Signature:", signature);

        // submit the withdrawal request to Orderly
        setStatus({ type: "loading", message: "Submitting withdrawal to Orderly…" });

        const requestBody = {
          message: {
            brokerId:      BROKER_ID,
            chainId:       CHAIN_ID,                    
            receiver,
            token:         "USDC",
            amount:        tokenAmountRaw.toString(),   
            withdrawNonce: String(withdrawNonce),        
            timestamp:     String(timestamp),            
          },
          signature,
          userAddress:       receiver,
          verifyingContract: LEDGER_CONTRACT,
        };

        // console.log("Request body:", JSON.stringify(requestBody, null, 2));

        const res = await orderlyPost<{ id: string }>(
          "/v1/withdraw_request",
          requestBody,
          accountId,
          keypair
        );

        // console.log("Response:", res);
        setStatus({ type: "success", withdrawId: res.id ?? "submitted" });

      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error("Withdraw error:", err);
        setStatus({ type: "error", message: msg });
      }
    },
    [address, accountId, keypair, signTypedDataAsync]
  );

  return { withdraw, status, setStatus };
}