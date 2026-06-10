import { useBalance } from "../hooks/useBalance";
import { useOrderlyStore } from "../store/orderly";

export function BalancePanel() {
  const { walletUSDC, orderlyUSDC, loading, error, refetch } = useBalance();
  const { accountId } = useOrderlyStore();

  return (
    <div className="card animate-fade-up" style={{ padding: "22px 24px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "rgba(59,91,219,0.12)",
            border: "1px solid rgba(59,91,219,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#748ffc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>Balances</span>
        </div>
        <button
          onClick={refetch}
          className="btn btn-ghost btn-sm"
          style={{ gap: 5, fontSize: 12 }}
          title="Refresh balances"
        >
          {loading ? (
            <span className="spinner" style={{ width: 11, height: 11 }} />
          ) : (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1 4 1 10 7 10"/>
              <path d="M3.51 15a9 9 0 1 0 .49-3.5"/>
            </svg>
          )}
          Refresh
        </button>
      </div>

      {/* Balance rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <BalanceRow
          label="Wallet"
          sub="Arbitrum Sepolia"
          value={loading ? "—" : walletUSDC}
          icon={
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8892aa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2"/>
              <line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
          }
        />
        <BalanceRow
          label="Orderly Account"
          sub="Available to trade"
          value={loading ? "—" : orderlyUSDC}
          highlight
          icon={
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#748ffc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          }
        />
      </div>

      {/* Error */}
      {error && (
        <div className="status-error" style={{ marginTop: 14, fontSize: 11 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </div>
      )}

      {/* Account ID */}
      {accountId && (
        <div style={{
          marginTop: 16, paddingTop: 16,
          borderTop: "1px solid var(--border)",
        }}>
          <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 5, fontWeight: 600 }}>
            Account ID
          </div>
          <div className="font-mono" style={{
            fontSize: 10, color: "var(--text-secondary)",
            wordBreak: "break-all", lineHeight: 1.6,
            padding: "6px 10px",
            background: "var(--bg-input)",
            borderRadius: 6,
            border: "1px solid var(--border)",
          }}>
            {accountId}
          </div>
        </div>
      )}
    </div>
  );
}

function BalanceRow({
  label, sub, value, icon, highlight,
}: {
  label: string;
  sub: string;
  value: string;
  icon: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "13px 14px",
      background: highlight ? "rgba(59,91,219,0.06)" : "var(--bg-input)",
      borderRadius: "var(--radius-md)",
      border: `1px solid ${highlight ? "rgba(59,91,219,0.15)" : "var(--border)"}`,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 26, height: 26, borderRadius: 6,
          background: highlight ? "rgba(59,91,219,0.12)" : "rgba(255,255,255,0.04)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          {icon}
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 500, color: "var(--text-primary)", lineHeight: 1.3 }}>{label}</div>
          <div style={{ fontSize: 10, color: "var(--text-muted)", lineHeight: 1.3 }}>{sub}</div>
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <span className="font-mono" style={{
          fontSize: 15, fontWeight: 600,
          color: highlight ? "#748ffc" : "var(--text-primary)",
        }}>
          {value}
        </span>
        <span style={{ marginLeft: 4, fontSize: 10, color: "var(--text-muted)", fontWeight: 500 }}>USDC</span>
      </div>
    </div>
  );
}
