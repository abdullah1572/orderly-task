import { useState, useRef, useEffect, useCallback } from "react";
import { useConnect, useDisconnect, useAccount, useChainId, useSwitchChain } from "wagmi";
import { arbitrumSepolia } from "wagmi/chains";

const WALLET_META: Record<string, { icon: string; color: string }> = {
  MetaMask:          { icon: "🦊", color: "#E2761B" },
  WalletConnect:     { icon: "🔗", color: "#3B99FC" },
  "Coinbase Wallet": { icon: "🟦", color: "#0052FF" },
  Trust:             { icon: "🛡️", color: "#3375BB" },
};

function clearAllStorage() {
  try { localStorage.removeItem("orderly-session"); } catch { /* ignore */ }
  try { localStorage.removeItem("orderly_ed25519_keypair"); } catch { /* ignore */ }
  try { localStorage.removeItem("wagmi.store"); } catch { /* ignore */ }
  try { localStorage.removeItem("wagmi.connected"); } catch { /* ignore */ }
  try { localStorage.removeItem("wagmi.wallet"); } catch { /* ignore */ }
  // Clear any remaining wagmi/wc keys
  try {
    const keys = Object.keys(localStorage).filter(
      k => k.startsWith("wagmi") || k.startsWith("wc@") || k.startsWith("W3M")
    );
    keys.forEach(k => localStorage.removeItem(k));
  } catch { /* ignore */ }
}

export function MultiWalletButton() {
  const { connectors, connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { address, isConnected, connector } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const isWrongChain = isConnected && chainId !== arbitrumSepolia.id;

  // Close on outside click or touch
  const closeHandler = useCallback((e: MouseEvent | TouchEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) {
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", closeHandler);
    document.addEventListener("touchstart", closeHandler, { passive: true });
    return () => {
      document.removeEventListener("mousedown", closeHandler);
      document.removeEventListener("touchstart", closeHandler);
    };
  }, [closeHandler]);

  const handleDisconnect = useCallback(() => {
    setOpen(false);
    disconnect();
    clearAllStorage();
    // Small delay so wagmi can finish its own cleanup before reload
    setTimeout(() => window.location.reload(), 150);
  }, [disconnect]);

  // wrong chain
  if (isWrongChain) {
    return (
      <button
        onClick={() => switchChain({ chainId: arbitrumSepolia.id })}
        disabled={isSwitching}
        className="btn"
        style={{
          background: "rgba(240,62,62,0.12)",
          border: "1px solid rgba(240,62,62,0.4)",
          color: "#f03e3e",
          gap: 6,
          fontSize: 12,
          padding: "0 10px",
          height: 36,
          whiteSpace: "nowrap",
        }}
      >
        {isSwitching ? (
          <>
            <span className="spinner" style={{ width: 11, height: 11, borderColor: "#f03e3e40", borderTopColor: "#f03e3e" }} />
            <span className="hide-xs">Switching…</span>
          </>
        ) : (
          <>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span className="hide-xs">Wrong Network</span>
            <span className="show-xs">⚠️</span>
          </>
        )}
      </button>
    );
  }

  // connected
  if (isConnected && address) {
    return (
      <div ref={ref} style={{ position: "relative" }}>
        <button
          onClick={() => setOpen((v) => !v)}
          className="btn btn-ghost"
          style={{ gap: 7, paddingLeft: 10, paddingRight: 10, height: 36, maxWidth: "100%" }}
        >
          <span style={{
            width: 7, height: 7, borderRadius: "50%",
            background: "#20c997",
            boxShadow: "0 0 6px #20c99766",
            flexShrink: 0,
            animation: "pulse-dot 2s ease infinite",
          }} />
          <span className="font-mono" style={{ fontSize: 12, color: "var(--text-primary)" }}>
            {/* Show shorter address on very small screens */}
            <span className="hide-xs">{address.slice(0, 6)}…{address.slice(-4)}</span>
            <span className="show-xs">{address.slice(0, 4)}…{address.slice(-3)}</span>
          </span>
          <svg width="9" height="5" viewBox="0 0 10 6" fill="none" style={{ opacity: 0.5, flexShrink: 0 }}>
            <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {open && (
          <div
            className="animate-fade-in"
            style={{
              position: "absolute",
              right: 0,
              top: "calc(100% + 8px)",
              background: "var(--bg-card)",
              border: "1px solid var(--border-bright)",
              borderRadius: "var(--radius-lg)",
              padding: "6px",
              minWidth: 200,
              maxWidth: "calc(100vw - 32px)",
              zIndex: 200,
              boxShadow: "0 16px 48px rgba(0,0,0,0.7)",
            }}
          >
            <div style={{ padding: "10px 14px 12px", borderBottom: "1px solid var(--border)" }}>
              <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
                Connected via {connector?.name}
              </div>
              <div className="font-mono" style={{ fontSize: 12, color: "var(--text-secondary)", wordBreak: "break-all" }}>
                {address.slice(0, 10)}…{address.slice(-8)}
              </div>
            </div>
            <button
              onClick={handleDisconnect}
              style={{
                display: "flex", alignItems: "center", gap: 9,
                width: "100%", padding: "10px 14px", marginTop: 4,
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
              Disconnect & Reset
            </button>
          </div>
        )}
      </div>
    );
  }

  // not connected
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={isPending}
        className="btn btn-primary"
        style={{ gap: 7, height: 36, fontSize: 13, padding: "0 14px" }}
      >
        {isPending ? (
          <>
            <span className="spinner" style={{ width: 12, height: 12 }} />
            <span className="hide-xs">Connecting…</span>
          </>
        ) : (
          <>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
              <line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
            <span className="hide-xs">Connect Wallet</span>
            <span className="show-xs">Connect</span>
          </>
        )}
      </button>

      {open && !isPending && (
        <div
          className="animate-fade-in"
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 8px)",
            background: "var(--bg-card)",
            border: "1px solid var(--border-bright)",
            borderRadius: "var(--radius-lg)",
            padding: "6px",
            minWidth: 230,
            maxWidth: "calc(100vw - 32px)",
            zIndex: 200,
            boxShadow: "0 16px 48px rgba(0,0,0,0.7)",
          }}
        >
          <div style={{ padding: "10px 14px 10px 14px", borderBottom: "1px solid var(--border)" }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
              Choose wallet
            </div>
          </div>
          <div style={{ padding: "6px 0 0" }}>
            {connectors.map((c) => {
              const meta = WALLET_META[c.name] ?? WALLET_META["MetaMask"];
              return (
                <button
                  key={c.id}
                  onClick={() => { connect({ connector: c }); setOpen(false); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    width: "100%", padding: "10px 14px",
                    background: "transparent", border: "none", cursor: "pointer",
                    color: "var(--text-primary)", fontSize: 13, fontWeight: 500,
                    borderRadius: "var(--radius-sm)", transition: "background 0.1s",
                    fontFamily: "inherit",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-card-hover)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <span style={{
                    width: 32, height: 32, borderRadius: 9,
                    background: `${meta.color}18`,
                    border: `1px solid ${meta.color}30`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 17, flexShrink: 0,
                  }}>
                    {meta.icon}
                  </span>
                  <span>{c.name}</span>
                </button>
              );
            })}
          </div>

          <div style={{
            padding: "10px 14px 10px",
            borderTop: "1px solid var(--border)",
            marginTop: 4,
            fontSize: 11,
            color: "var(--text-muted)",
            lineHeight: 1.5,
          }}>
            📱 On mobile? Use <strong style={{ color: "var(--text-secondary)" }}>WalletConnect</strong> for Trust Wallet, MetaMask mobile, or any WC wallet.
          </div>
        </div>
      )}
    </div>
  );
}
