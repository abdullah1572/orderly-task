import { useState, useCallback } from "react";
import { useAccount, useSignTypedData, useChainId } from "wagmi";
import axios from "axios";
import {
  BROKER_ID,
  ORDERLY_TESTNET_API,
  EIP712_DOMAIN_OFFCHAIN,
  REGISTRATION_TYPES,
  ADD_ORDERLY_KEY_TYPES,
} from "../lib/constants";
import {
  generateKeypair,
  storeKeypair,
  clearKeypair,
} from "../lib/orderly";
import { useOrderlyStore } from "../store/orderly";

export type OnboardingStatus =
  | { type: "idle" }
  | { type: "loading"; message: string }
  | { type: "success"; message: string }
  | { type: "error"; message: string };

export function useOnboarding() {
  const { address } = useAccount();
  const chainId = useChainId();
  const { signTypedDataAsync } = useSignTypedData();
  const { setAccountId, setKeypair, setStep } = useOrderlyStore();

  const [status, setStatus] = useState<OnboardingStatus>({ type: "idle" });

  // ── Step 1: Check if account already exists ──────────────────────────────
  const checkAccount = useCallback(async (): Promise<string | null> => {
    if (!address) return null;
    try {
      const { data } = await axios.get(
        `${ORDERLY_TESTNET_API}/v1/get_account?address=${address}&broker_id=${BROKER_ID}`
      );
      return data.success && data.data?.account_id
        ? (data.data.account_id as string)
        : null;
    } catch {
      return null;
    }
  }, [address]);

  // register account
  const registerAccount = useCallback(async (): Promise<string> => {
    if (!address || !chainId) throw new Error("Wallet not connected");

    setStatus({ type: "loading", message: "Fetching registration nonce…" });

    const nonceRes = await axios.get(`${ORDERLY_TESTNET_API}/v1/registration_nonce`);
    const registrationNonce: number = nonceRes.data.data.registration_nonce;
    const timestamp = Date.now();

    const message = {
      brokerId: BROKER_ID,
      chainId: BigInt(chainId),
      timestamp: BigInt(timestamp),
      registrationNonce: BigInt(registrationNonce),
    };

    setStatus({ type: "loading", message: "Sign the registration message in your wallet…" });

    const signature = await signTypedDataAsync({
      domain: EIP712_DOMAIN_OFFCHAIN(chainId),
      types: {
        Registration: REGISTRATION_TYPES.Registration as unknown as {
          name: string;
          type: string;
        }[],
      },
      primaryType: "Registration",
      message,
    });

    setStatus({ type: "loading", message: "Registering account on Orderly…" });

    const regRes = await axios.post(`${ORDERLY_TESTNET_API}/v1/register_account`, {
      message: {
        brokerId: BROKER_ID,
        chainId,
        timestamp,
        registrationNonce,
      },
      signature,
      userAddress: address,
    });

    if (!regRes.data.success)
      throw new Error("Registration failed: " + JSON.stringify(regRes.data));

    return regRes.data.data.account_id as string;
  }, [address, chainId, signTypedDataAsync]);

  // add orderly key
  const addOrderlyKey = useCallback(async (_accountId: string) => {
    if (!address || !chainId) throw new Error("Wallet not connected");

    setStatus({ type: "loading", message: "Generating ed25519 keypair…" });
    const keypair = await generateKeypair();

    const timestamp = Date.now();
    const expiration = timestamp + 365 * 24 * 60 * 60 * 1000;

    const message = {
      brokerId: BROKER_ID,
      chainId: BigInt(chainId),
      orderlyKey: keypair.publicKey,
      scope: "read,trading",         
      timestamp: BigInt(timestamp),
      expiration: BigInt(expiration),
    };

    setStatus({ type: "loading", message: "Sign the key delegation in your wallet…" });

    const signature = await signTypedDataAsync({
      domain: EIP712_DOMAIN_OFFCHAIN(chainId),
      types: {
        AddOrderlyKey: ADD_ORDERLY_KEY_TYPES.AddOrderlyKey as unknown as {
          name: string;
          type: string;
        }[],
      },
      primaryType: "AddOrderlyKey",
      message,
    });

    setStatus({ type: "loading", message: "Adding Orderly key to your account…" });

    const keyRes = await axios.post(`${ORDERLY_TESTNET_API}/v1/orderly_key`, {
      message: {
        brokerId: BROKER_ID,
        chainId,
        orderlyKey: keypair.publicKey,
        scope: "read,trading",       
        timestamp,
        expiration,
      },
      signature,
      userAddress: address,
    });

    if (!keyRes.data.success)
      throw new Error("Key registration failed: " + JSON.stringify(keyRes.data));

    storeKeypair(keypair);
    return keypair;
  }, [address, chainId, signTypedDataAsync]);

  // run onboarding
  const runOnboarding = useCallback(async () => {
    try {
      setStatus({ type: "loading", message: "Checking existing account…" });
      setStep("registering");

      let accountId = await checkAccount();

      if (!accountId) {
        accountId = await registerAccount();
      } else {
        setStatus({ type: "loading", message: "Account found — re-registering key…" });
      }

      setAccountId(accountId);

    
      clearKeypair();
      const keypair = await addOrderlyKey(accountId);

      setKeypair(keypair);
      setStep("ready");
      setStatus({ type: "success", message: "Onboarding complete! You can now trade." });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setStatus({ type: "error", message: msg });
      setStep("connected");
    }
  }, [checkAccount, registerAccount, addOrderlyKey, setAccountId, setKeypair, setStep]);

  return { runOnboarding, status, setStatus };
}