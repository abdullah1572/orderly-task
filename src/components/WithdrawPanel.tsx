import { useState, useEffect } from "react";
import { useWithdraw } from "../hooks/useWithdraw";
import { toast } from "./Toast";

export function WithdrawPanel() {
  const [amount, setAmount] = useState("");
  const { withdraw, status, setStatus } = useWithdraw();
  const isLoading = status.type === "loading";

  useEffect(() => {
    if (status.type === "success") {
      toast.success("Withdrawal submitted", `ID: ${status.withdrawId}`);
    }
    if (status.type === "error") {
      toast.error("Withdrawal failed", status.message);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status.type]);

  const handleWithdraw = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    console.log("[Withdraw] Initiating withdrawal for amount:", amount);
    setStatus({ type: "idle" });
    await withdraw(amount);
    // Auto-clear input on success
    if (status.type === "success") setAmount("");
  };

  const handleReset = () => {
    setStatus({ type: "idle" });
    setAmount("");
  };

  return (
    <div className="card animate-fade-up" style={{ padding: "22px 24px", animationDelay: "0.1s" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: "rgba(245,159,0,0.1)",
          border: "1px solid rgba(245,159,0,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f59f00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.3 }}>Withdraw USDC</div>
        </div>
      </div>
      <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 20, lineHeight: 1.5 }}>
        Signed withdrawal — settled on-chain via Orderly.
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
        {isLoading && (
          <div className="status-info">
            <span className="spinner" style={{ marginTop: 1 }} />
            <span>{status.message}</span>
          </div>
        )}

        {status.type === "success" && (
          <div className="status-success">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <span>Withdrawal submitted (ID: {status.withdrawId})</span>
          </div>
        )}

        {/* Primary action */}
        {status.type !== "success" ? (
          <button
            onClick={handleWithdraw}
            disabled={isLoading || !amount || parseFloat(amount) <= 0}
            className="btn btn-warning btn-full"
            style={{ marginTop: 2 }}
          >
            {isLoading ? (
              <><span className="spinner" style={{ width: 13, height: 13 }} /> Processing…</>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Sign & Withdraw
              </>
            )}
          </button>
        ) : (
          <button onClick={handleReset} className="btn btn-ghost btn-full">
            New Withdrawal
          </button>
        )}

        {/* Info note */}
        <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.6 }}>
          Withdrawals require a wallet signature (no gas). Settlement takes ~1–2 minutes.
        </div>
      </div>
    </div>
  );
}
