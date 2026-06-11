import { useEffect } from "react";
import { useAccount, useChainId } from "wagmi";
import { arbitrumSepolia } from "wagmi/chains";
import { useOnboarding } from "../hooks/useOnboarding";
import { useOrderlyStore } from "../store/orderly";
import { toast } from "./Toast";

const STEPS = [
  { id: "wallet",   label: "Connect Wallet",    desc: "Link your Web3 wallet" },
  { id: "register", label: "Register Account",  desc: "Create Orderly account" },
  { id: "key",      label: "Create Access Key", desc: "Delegate trading key" },
  { id: "ready",    label: "Ready to Trade",    desc: "You're all set!" },
];

function stepIndex(step: string): number {
  switch (step) {
    case "not_connected": return 0;
    case "connected":     return 1;
    case "registering":   return 1;
    case "registered":    return 2;
    case "adding_key":    return 2;
    case "ready":         return 4;
    default:              return 0;
  }
}

export function OnboardingPanel() {
  const { isConnected, address, chain } = useAccount();
  const chainId = useChainId();
  const { step, setStep, setWallet } = useOrderlyStore();
  const { runOnboarding, status, setStatus } = useOnboarding();

  // Both sources must disagree before we show a wrong-chain warning.
  // useChainId() can be stale over WalletConnect; account.chain is more accurate.
  const isWrongChain =
    isConnected &&
    chainId !== arbitrumSepolia.id &&
    chain?.id !== arbitrumSepolia.id;

  useEffect(() => {
    if (isConnected && address) {
      if (step === "not_connected") {
        setWallet(address, chainId);
      }
    }
    if (!isConnected && step !== "not_connected") {
      setStep("not_connected");
    }
  }, [isConnected, address, chainId, step, setWallet, setStep]);

  useEffect(() => {
    if (status.type === "success") {
      toast.success("Onboarding complete!", "You can now deposit and trade.");
    }
    if (status.type === "error") {
      toast.error("Onboarding failed", status.message);
    }
  }, [status.type]);

  const currentStep = stepIndex(step);
  if (step === "ready") return null;

  return (
    <div className="card animate-fade-up" style={{ padding: "28px 32px", maxWidth: 640, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "var(--brand-subtle)",
            border: "1px solid rgba(59,91,219,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#748ffc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1 }}>Account Setup</h2>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3 }}>Orderly Network Testnet</p>
          </div>
        </div>
      </div>

      {/* Step progress */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 0, marginBottom: 28 }}>
        {STEPS.map((s, i) => {
          const done   = i < currentStep;
          const active = i === currentStep;
          return (
            <div key={s.id} style={{ flex: 1, display: "flex", alignItems: "flex-start", position: "relative" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 700,
                  transition: "all 0.3s",
                  background: done ? "var(--success)" : active ? "var(--brand)" : "var(--bg-input)",
                  border: `2px solid ${done ? "var(--success)" : active ? "var(--brand)" : "var(--border)"}`,
                  color: done || active ? "#fff" : "var(--text-muted)",
                  boxShadow: active ? "0 0 20px var(--brand-glow)" : done ? "0 0 12px var(--success-glow)" : "none",
                  zIndex: 1, position: "relative",
                }}>
                  {done ? (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  ) : i + 1}
                </div>
                <div style={{ textAlign: "center", marginTop: 8 }}>
                  <div style={{
                    fontSize: 11, fontWeight: 600, lineHeight: 1.3,
                    color: active ? "var(--text-primary)" : done ? "var(--success)" : "var(--text-muted)",
                  }}>
                    {s.label}
                  </div>
                </div>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{
                  position: "absolute", top: 15, left: "50%", right: "-50%",
                  height: 2, zIndex: 0,
                  background: i < currentStep ? "var(--success)" : "var(--border)",
                  transition: "background 0.4s",
                }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Wrong chain warning */}
      {isWrongChain && (
        <div className="status-error" style={{ marginBottom: 16 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>
            Wrong network detected. Please switch to <strong>Arbitrum Sepolia</strong> — the button above will do it automatically when you click Register.
          </span>
        </div>
      )}

      {/* Status messages */}
      {status.type === "loading" && (
        <div className="status-info" style={{ marginBottom: 16 }}>
          <span className="spinner" style={{ marginTop: 1 }} />
          <span>{status.message}</span>
        </div>
      )}

      {status.type === "error" && (
        <div className="status-error" style={{ marginBottom: 16 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>{status.message}</span>
        </div>
      )}

      {/* Actions */}
      {step === "not_connected" && (
        <div style={{
          padding: "16px 20px",
          background: "var(--bg-input)",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border)",
          color: "var(--text-secondary)",
          fontSize: 13,
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
          </svg>
          Use the <strong style={{ color: "var(--text-primary)" }}>Connect Wallet</strong> button in the top-right to get started.
        </div>
      )}

      {step === "connected" && (
        <div>
          <div style={{
            padding: "14px 18px", marginBottom: 16,
            background: "var(--bg-input)", borderRadius: "var(--radius-md)",
            border: "1px solid var(--border)", fontSize: 13, color: "var(--text-secondary)",
            lineHeight: 1.6,
          }}>
            Wallet connected as{" "}
            <code className="font-mono" style={{
              padding: "2px 7px", borderRadius: 5,
              background: "var(--brand-subtle)", color: "#748ffc", fontSize: 12,
            }}>
              {address?.slice(0, 12)}…
            </code>
            . Click below to register your Orderly account and create a trading key.
            You'll sign{" "}
            <strong style={{ color: "var(--text-primary)" }}>2 off-chain EIP-712 messages</strong>
            {" "}— no gas required.
          </div>
          <button
            onClick={() => { setStatus({ type: "idle" }); runOnboarding(); }}
            className="btn btn-primary"
            style={{ gap: 8 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
            Register & Create Access Key
          </button>
        </div>
      )}

      {(step === "registering" || step === "adding_key") && (
        <div style={{
          padding: "14px 18px",
          background: "var(--bg-input)", borderRadius: "var(--radius-md)",
          border: "1px solid var(--border)", fontSize: 13, color: "var(--text-secondary)",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <span className="spinner" style={{ width: 13, height: 13 }} />
          Check your wallet for signature requests…
        </div>
      )}
    </div>
  );
}