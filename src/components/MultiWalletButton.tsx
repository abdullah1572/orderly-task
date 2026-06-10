import { useState, useRef, useEffect } from "react";
import { useConnect, useDisconnect, useAccount } from "wagmi";

const WALLET_META: Record<string, { icon: string; color: string }> = {
  MetaMask:         { icon: "🦊", color: "#E2761B" },
  WalletConnect:    { icon: "🔗", color: "#3B99FC" },
  "Coinbase Wallet": { icon: "🟦", color: "#0052FF" },
  Trust:            { icon: "🛡️", color: "#3375BB" },
  Injected:         { icon: "💼", color: "#8892aa" },
};

export function MultiWalletButton() {
  const { connectors, connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { address, isConnected, connector } = useAccount();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (isConnected && address) {
    return (
      <div ref={ref} style={{ position: "relative" }}>
        <button
          onClick={() => setOpen((v) => !v)}
          className="btn btn-ghost"
          style={{ gap: 8, paddingLeft: 10, paddingRight: 10 }}
        >
          <span style={{
            width: 8, height: 8, borderRadius: "50%",
            background: "#20c997",
            boxShadow: "0 0 6px #20c99766",
            flexShrink: 0,
            animation: "pulse-dot 2s ease infinite",
          }} />
          <span className="font-mono" style={{ fontSize: 13, color: "var(--text-primary)" }}>
            {address.slice(0, 6)}…{address.slice(-4)}
          </span>
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ opacity: 0.5 }}>
            <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {open && (
          <div
            className="animate-fade-in"
            style={{
              position: "absolute", right: 0, top: "calc(100% + 8px)",
              background: "var(--bg-card)",
              border: "1px solid var(--border-bright)",
              borderRadius: "var(--radius-lg)",
              padding: "6px",
              minWidth: 190,
              zIndex: 100,
              boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
            }}
          >
            <div style={{ padding: "8px 12px 10px", borderBottom: "1px solid var(--border)" }}>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Connected via
              </div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>
                {connector?.name}
              </div>
            </div>
            <button
              onClick={() => { disconnect(); setOpen(false); }}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                width: "100%", padding: "9px 12px", marginTop: 6,
                background: "transparent", border: "none", cursor: "pointer",
                color: "var(--danger)", fontSize: 13, fontWeight: 500,
                borderRadius: "var(--radius-sm)", transition: "background 0.1s",
                fontFamily: "inherit",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(240,62,62,0.08)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Disconnect
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={isPending}
        className="btn btn-primary"
        style={{ gap: 8 }}
      >
        {isPending ? (
          <>
            <span className="spinner" style={{ width: 13, height: 13 }} />
            Connecting…
          </>
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
              <line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
            Connect Wallet
          </>
        )}
      </button>

      {open && !isPending && (
        <div
          className="animate-fade-in"
          style={{
            position: "absolute", right: 0, top: "calc(100% + 8px)",
            background: "var(--bg-card)",
            border: "1px solid var(--border-bright)",
            borderRadius: "var(--radius-lg)",
            padding: "6px",
            minWidth: 220,
            zIndex: 100,
            boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
          }}
        >
          <div style={{ padding: "8px 12px 10px 12px", borderBottom: "1px solid var(--border)" }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>
              Choose wallet
            </div>
          </div>
          <div style={{ padding: "6px 0 0" }}>
            {connectors.map((c) => {
              const meta = WALLET_META[c.name] ?? WALLET_META["Injected"];
              return (
                <button
                  key={c.id}
                  onClick={() => { connect({ connector: c }); setOpen(false); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    width: "100%", padding: "10px 12px",
                    background: "transparent", border: "none", cursor: "pointer",
                    color: "var(--text-primary)", fontSize: 13, fontWeight: 500,
                    borderRadius: "var(--radius-sm)", transition: "background 0.1s",
                    fontFamily: "inherit",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-card-hover)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <span style={{
                    width: 30, height: 30, borderRadius: 8,
                    background: `${meta.color}18`,
                    border: `1px solid ${meta.color}30`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 16, flexShrink: 0,
                  }}>
                    {meta.icon}
                  </span>
                  <span>{c.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
