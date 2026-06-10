import { useState, useEffect } from "react";
import { useDeposit } from "../hooks/useDeposit";
import { useBalance } from "../hooks/useBalance";
import { Arbitrum_SEPOLIA } from "../lib/constants";
import { toast } from "./Toast";

export function DepositPanel() {
  const [amount, setAmount] = useState("");
  const { deposit, status, setStatus } = useDeposit();
  const { refetchAfterDeposit } = useBalance();
  const [autoRefreshing, setAutoRefreshing] = useState(false);

  const isLoading =
    status.type === "approving" ||
    status.type === "approve_pending" ||
    status.type === "depositing" ||
    status.type === "deposit_pending";

  // Show toasts on state change
  useEffect(() => {
    if (status.type === "success") {
      toast.success("Deposit confirmed!", `Tx: ${status.hash.slice(0, 14)}…`);
      if (!autoRefreshing) {
        setAutoRefreshing(true);
        refetchAfterDeposit().finally(() => setAutoRefreshing(false));
      }
    }
    if (status.type === "error") {
      toast.error("Deposit failed", status.message);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status.type]);

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    console.log("[Deposit] Initiating deposit for amount:", amount);
    await deposit(amount);
  };

  const handleReset = () => {
    setStatus({ type: "idle" });
    setAmount("");
  };

  const statusText = {
    approving:       "Approving USDC spend…",
    approve_pending: `Approval tx: ${(status as { hash?: string }).hash?.slice(0, 14)}… confirming`,
    depositing:      "Sending to Vault…",
    deposit_pending: `Deposit tx: ${(status as { hash?: string }).hash?.slice(0, 14)}… confirming`,
  }[status.type as string];

  return (
    <div className="card animate-fade-up" style={{ padding: "22px 24px", animationDelay: "0.05s" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: "rgba(32,201,151,0.1)",
          border: "1px solid rgba(32,201,151,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#20c997" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.3 }}>Deposit USDC</div>
        </div>
      </div>
      <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 20, lineHeight: 1.5 }}>
        Approve + deposit to your Orderly account.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Amount input */}
        <div style={{ position: "relative" }}>
          <input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="input-field font-mono"
            style={{ paddingRight: 56 }}
            disabled={isLoading}
          />
          <span className="font-mono" style={{
            position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
            fontSize: 12, fontWeight: 600, color: "var(--text-muted)", pointerEvents: "none",
          }}>
            USDC
          </span>
        </div>

        {/* Status */}
        {isLoading && statusText && (
          <div className="status-info">
            <span className="spinner" style={{ marginTop: 1 }} />
            <span>{statusText}</span>
          </div>
        )}

        {status.type === "success" && (
          <div className="status-success">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <span>
              {autoRefreshing
                ? "Confirmed! Syncing Orderly balance (~15s)…"
                : `Confirmed! Tx: ${status.hash.slice(0, 16)}…`}
            </span>
          </div>
        )}

        {/* Primary action */}
        {status.type !== "success" ? (
          <button
            onClick={handleDeposit}
            disabled={isLoading || !amount || parseFloat(amount) <= 0}
            className="btn btn-primary btn-full"
            style={{ marginTop: 2 }}
          >
            {isLoading ? (
              <><span className="spinner" style={{ width: 13, height: 13 }} /> Processing…</>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                Approve & Deposit
              </>
            )}
          </button>
        ) : (
          <button onClick={handleReset} className="btn btn-ghost btn-full">
            New Deposit
          </button>
        )}

        {/* Footer links */}
        <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.8, marginTop: 2 }}>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center" }}>
            <span>USDC:</span>
            <a
              href={`${Arbitrum_SEPOLIA.explorer}/address/${Arbitrum_SEPOLIA.contracts.USDC}`}
              target="_blank" rel="noreferrer"
              style={{ color: "var(--brand-light)", textDecoration: "none", fontFamily: "JetBrains Mono, monospace" }}
            >
              {Arbitrum_SEPOLIA.contracts.USDC.slice(0, 8)}…
            </a>
            <span style={{ opacity: 0.4 }}>·</span>
            <a
              href="https://faucet.circle.com"
              target="_blank" rel="noreferrer"
              style={{ color: "var(--brand-light)", textDecoration: "none" }}
            >
              Get testnet USDC ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
