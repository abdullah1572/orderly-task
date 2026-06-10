import { useState, useEffect } from "react";
import { useWithdraw } from "../hooks/useWithdraw";
import { toast } from "./Toast";

const MIN_WITHDRAW = 1.1;

export function WithdrawPanel() {
  const [amount, setAmount] = useState("");
  const { withdraw, status, setStatus } = useWithdraw();
  const isLoading = status.type === "loading";

  const amountNum = parseFloat(amount);
  const isBelowMin = amount !== "" && amountNum < MIN_WITHDRAW;
  const isValid = amount !== "" && amountNum >= MIN_WITHDRAW;

  useEffect(() => {
    if (status.type === "success") {
      toast.success("Withdrawal submitted", `ID: ${status.withdrawId}`);
    }
    if (status.type === "error") {
      toast.error("Withdrawal failed", status.message);
    }
  }, [status.type]);

  const handleWithdraw = async () => {
    if (!isValid) return;
    setStatus({ type: "idle" });
    await withdraw(amount);
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
            <line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" />
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
            style={{
              paddingRight: 56,
              borderColor: isBelowMin ? "var(--danger)" : undefined,
              background: isBelowMin ? "rgba(240,62,62,0.06)" : undefined,
              outline: isBelowMin ? "none" : undefined,
              transition: "border-color 0.2s, background 0.2s",
            }}
            disabled={isLoading}
            min={MIN_WITHDRAW}
            step="0.01"
          />
          <span className="font-mono" style={{
            position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
            fontSize: 12, fontWeight: 600, color: "var(--text-muted)", pointerEvents: "none",
          }}>
            USDC
          </span>
        </div>

        {/* Below minimum error */}
        {isBelowMin && (
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            fontSize: 12, color: "var(--danger)", lineHeight: 1.4,
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            Minimum is 1.1 USDC means greater than 1 USDC (Orderly deducts fee)
          </div>
        )}

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
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>Withdrawal submitted (ID: {status.withdrawId})</span>
          </div>
        )}

        {/* Primary action */}
        {status.type !== "success" ? (
          <button
            onClick={handleWithdraw}
            disabled={isLoading || !isValid}
            className="btn btn-warning btn-full"
            style={{ marginTop: 2 }}
          >
            {isLoading ? (
              <><span className="spinner" style={{ width: 13, height: 13 }} /> Processing…</>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
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
          Minimum withdrawal: <strong style={{ color: "var(--text-secondary)" }}>1.1 USDC</strong>.
        </div>
      </div>
    </div>
  );
}