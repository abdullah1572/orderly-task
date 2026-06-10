import axios from "axios";
import * as ed from "@noble/ed25519";
import { base58 } from "@scure/base";
import { ORDERLY_TESTNET_API } from "./constants";

// ─── Key storage helpers ──────────────────────────────────────────────────────
const KEY_STORE_KEY = "orderly_ed25519_keypair";

export interface OrderlyKeypair {
  publicKey: string;    // "ed25519:<base58>"
  privateKeyHex: string; // raw 32-byte hex
}

export function getStoredKeypair(): OrderlyKeypair | null {
  try {
    const raw = localStorage.getItem(KEY_STORE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function storeKeypair(kp: OrderlyKeypair) {
  localStorage.setItem(KEY_STORE_KEY, JSON.stringify(kp));
}

export function clearKeypair() {
  localStorage.removeItem(KEY_STORE_KEY);
}

// ─── Generate a fresh ed25519 keypair ────────────────────────────────────────
export async function generateKeypair(): Promise<OrderlyKeypair> {
  const privBytes = crypto.getRandomValues(new Uint8Array(32));
  const pubBytes = await ed.getPublicKeyAsync(privBytes);
  const pubBase58 = base58.encode(pubBytes);
  return {
    publicKey: `ed25519:${pubBase58}`,
    privateKeyHex: Array.from(privBytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join(""),
  };
}

// ─── Sign a message with ed25519 ─────────────────────────────────────────────
async function signMessage(message: string, privateKeyHex: string): Promise<string> {
  const privBytes = Uint8Array.from(
    privateKeyHex.match(/.{1,2}/g)!.map((b) => parseInt(b, 16))
  );
  const msgBytes = new TextEncoder().encode(message);
  const sig = await ed.signAsync(msgBytes, privBytes);

  const base64 = btoa(String.fromCharCode(...sig));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// ─── Timestamp helper ─────────────────────────────────────────────────────────
function buildTimestamp() {
  return Date.now().toString();
}

// ─── GET ──────────────────────────────────────────────────────────────────────
export async function orderlyGet<T>(
  path: string,
  accountId: string,
  keypair: OrderlyKeypair
): Promise<T> {
  const ts = buildTimestamp();
  const message = `${ts}GET${path}`;
  const signature = await signMessage(message, keypair.privateKeyHex);

  const { data } = await axios.get<{ success: boolean; data: T }>(
    `${ORDERLY_TESTNET_API}${path}`,
    {
      headers: {
        "Content-Type": "application/json",      // ✅ added
        "orderly-timestamp": ts,
        "orderly-account-id": accountId,
        "orderly-key": keypair.publicKey,
        "orderly-signature": signature,
      },
    }
  );
  if (!data.success) throw new Error(JSON.stringify(data));
  return data.data;
}

// ─── POST ─────────────────────────────────────────────────────────────────────
export async function orderlyPost<T>(
  path: string,
  body: Record<string, unknown>,
  accountId: string,
  keypair: OrderlyKeypair
): Promise<T> {
  const ts = buildTimestamp();
  const bodyStr = JSON.stringify(body);
  const message = `${ts}POST${path}${bodyStr}`;
  const signature = await signMessage(message, keypair.privateKeyHex);

  const { data } = await axios.post<{ success: boolean; data: T }>(
    `${ORDERLY_TESTNET_API}${path}`,
    body,
    {
      headers: {
        "Content-Type": "application/json",
        "orderly-timestamp": ts,
        "orderly-account-id": accountId,
        "orderly-key": keypair.publicKey,
        "orderly-signature": signature,
      },
    }
  );
  if (!data.success) throw new Error(JSON.stringify(data));
  return data.data;
}

// ─── DELETE ───────────────────────────────────────────────────────────────────
export async function orderlyDelete<T>(
  path: string,
  body: Record<string, unknown>,
  accountId: string,
  keypair: OrderlyKeypair
): Promise<T> {
  const ts = buildTimestamp();
  const bodyStr = JSON.stringify(body);
  const message = `${ts}DELETE${path}${bodyStr}`;
  const signature = await signMessage(message, keypair.privateKeyHex);

  const { data } = await axios.delete<{ success: boolean; data: T }>(
    `${ORDERLY_TESTNET_API}${path}`,
    {
      data: body,
      headers: {
        "Content-Type": "application/json",
        "orderly-timestamp": ts,
        "orderly-account-id": accountId,
        "orderly-key": keypair.publicKey,
        "orderly-signature": signature,
      },
    }
  );
  if (!data.success) throw new Error(JSON.stringify(data));
  return data.data;
}

// ─── Derive accountId (placeholder — always use the one returned by Orderly) ──
export function deriveAccountId(walletAddress: string, brokerId: string): string {
  return `${walletAddress.toLowerCase()}_${brokerId}`;
}