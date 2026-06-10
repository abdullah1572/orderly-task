import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { wagmiConfig } from "./lib/wagmi";
import { MultiWalletButton } from "./components/MultiWalletButton";
import { OnboardingPanel } from "./components/OnboardingPanel";
import { BalancePanel } from "./components/BalancePanel";
import { DepositPanel } from "./components/DepositPanel";
import { WithdrawPanel } from "./components/WithdrawPanel";
import { useOrderlyStore } from "./store/orderly";
import { useAccount } from "wagmi";
import "./index.css";

const queryClient = new QueryClient();


function Logo() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="9" fill="url(#logoGrad)"/>
      <circle cx="16" cy="16" r="7" stroke="rgba(255,255,255,0.9)" strokeWidth="2" fill="none"/>
      <line x1="16" y1="9" x2="16" y2="23" stroke="rgba(255,255,255,0.9)" strokeWidth="2" strokeLinecap="round"/>
      <line x1="9" y1="16" x2="23" y2="16" stroke="rgba(255,255,255,0.9)" strokeWidth="2" strokeLinecap="round"/>
      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4c6ef5"/>
          <stop offset="1" stopColor="#3b5bdb"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

function Dashboard() {
  const { isConnected } = useAccount();
  const { step } = useOrderlyStore();
  const isReady = step === "ready";

  return (
    <div style={{ minHeight: "100vh", position: "relative", zIndex: 1 }}>
      {/* Background decorations */}
      <div className="grid-bg" />
      <div className="glow-top" />

      {/* ─── Navbar ─────────────────────────────────────────────────────── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        borderBottom: "1px solid var(--border)",
        backdropFilter: "blur(16px) saturate(180%)",
        background: "rgba(8,10,16,0.85)",
      }}>
        <div style={{
          maxWidth: 1100, margin: "0 auto",
          padding: "0 24px",
          height: 64,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          {/* Left: Logo + Brand */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Logo />
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.2, letterSpacing: "-0.01em" }}>
                Orderly Perps
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                <span className="badge badge-testnet" style={{ padding: "1px 7px", fontSize: 10 }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--warning)", animation: "pulse-dot 2s ease infinite" }} />
                  Testnet
                </span>
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Arbitrum Sepolia</span>
              </div>
            </div>
          </div>

          {/* Right: Nav + Wallet */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <a
              href="https://orderly.network/docs"
              target="_blank"
              rel="noreferrer"
              style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "7px 12px",
                borderRadius: "var(--radius-sm)",
                fontSize: 12, fontWeight: 500,
                color: "var(--text-secondary)",
                textDecoration: "none",
                transition: "color 0.15s, background 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.background = "var(--bg-card)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.background = "transparent"; }}
            >
              Docs
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/>
              </svg>
            </a>
            <div style={{ width: 1, height: 22, background: "var(--border)", margin: "0 4px" }} />
            <MultiWalletButton />
          </div>
        </div>
      </header>

      {/* ─── Main content ────────────────────────────────────────────────── */}
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px 80px" }}>

        {/* Hero — when not connected */}
        {!isConnected && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", textAlign: "center" }}>
            <div style={{
              width: 72, height: 72, borderRadius: 20,
              background: "var(--brand-subtle)",
              border: "1px solid rgba(59,91,219,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 24,
              boxShadow: "0 0 40px var(--brand-glow)",
            }}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#748ffc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="16"/>
                <line x1="8" y1="12" x2="16" y2="12"/>
              </svg>
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.03em", marginBottom: 12, lineHeight: 1.2 }}>
              Orderly Perpetuals Testnet
            </h1>
            <p style={{ fontSize: 15, color: "var(--text-secondary)", maxWidth: 400, lineHeight: 1.6, marginBottom: 32 }}>
              Connect your wallet to register your Orderly account and start trading perpetual futures.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <MultiWalletButton />
              <a
                href="https://orderly.network/docs"
                target="_blank"
                rel="noreferrer"
                className="btn btn-ghost"
                style={{ textDecoration: "none" }}
              >
                Read the docs ↗
              </a>
            </div>

            {/* Feature pills */}
            <div style={{ display: "flex", gap: 8, marginTop: 48, flexWrap: "wrap", justifyContent: "center" }}>
              {[
                { icon: "⚡", text: "No gas for registration" },
                { icon: "🔐", text: "Non-custodial" },
                { icon: "🌐", text: "Arbitrum Sepolia" },
              ].map((f) => (
                <div key={f.text} style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "7px 14px", borderRadius: 99,
                  background: "var(--bg-card)", border: "1px solid var(--border)",
                  fontSize: 12, color: "var(--text-secondary)",
                }}>
                  <span style={{ fontSize: 13 }}>{f.icon}</span>
                  {f.text}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Onboarding stepper */}
        {isConnected && !isReady && (
          <div style={{ marginBottom: 32 }}>
            <OnboardingPanel />
          </div>
        )}

        {/* Dashboard grid — after onboarding */}
        {isConnected && isReady && (
          <div className="animate-fade-up">
            {/* Page header */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                  Perpetuals Dashboard
                </h1>
                <span className="badge badge-testnet">
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--warning)", animation: "pulse-dot 2s ease infinite" }} />
                  Testnet
                </span>
              </div>
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                Onboarded ✓ — deposit USDC, trade perps, withdraw anytime.
              </p>
            </div>

            {/* Cards grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 20,
            }}>
              <BalancePanel />
              <DepositPanel />
              <WithdrawPanel />
            </div>
          </div>
        )}
      </main>

      {/* ─── Footer ──────────────────────────────────────────────────────── */}
      <footer style={{
        borderTop: "1px solid var(--border)",
        textAlign: "center",
        padding: "20px 24px",
        fontSize: 11,
        color: "var(--text-muted)",
      }}>
        Orderly Network Testnet · Arbitrum Sepolia (chainId: 421614)
        {" · "}
        <a
          href="https://orderly.network/docs"
          target="_blank"
          rel="noreferrer"
          style={{ color: "var(--brand-light)", textDecoration: "none" }}
        >
          Docs ↗
        </a>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <Dashboard />
      </QueryClientProvider>
    </WagmiProvider>
  );
}
