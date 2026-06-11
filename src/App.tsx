import { WagmiProvider, useAccount, useSwitchChain } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { arbitrumSepolia } from "wagmi/chains";
import { useEffect } from "react";
import { wagmiConfig } from "./lib/wagmi";
import { MultiWalletButton } from "./components/MultiWalletButton";
import { OnboardingPanel } from "./components/OnboardingPanel";
import { BalancePanel } from "./components/BalancePanel";
import { DepositPanel } from "./components/DepositPanel";
import { WithdrawPanel } from "./components/WithdrawPanel";
import { useOrderlyStore } from "./store/orderly";
// import { useAccount } from "wagmi";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 2, staleTime: 10_000 } },
});

function Logo() {
  return (
    <svg width="30" height="30" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
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
      <div className="grid-bg" />
      <div className="glow-top" />

      
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        borderBottom: "1px solid var(--border)",
        backdropFilter: "blur(16px) saturate(180%)",
        background: "rgba(8,10,16,0.88)",
      }}>
        <div className="navbar-inner">
          <div className="navbar-brand">
            <Logo />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.2, letterSpacing: "-0.01em", whiteSpace: "nowrap" }}>
                Orderly Perps
              </div>
              <div className="navbar-meta">
                <span className="badge badge-testnet" style={{ padding: "1px 6px", fontSize: 9 }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--warning)", animation: "pulse-dot 2s ease infinite", flexShrink: 0 }} />
                  Testnet
                </span>
                <span className="navbar-chain-label">Arbitrum Sepolia</span>
              </div>
            </div>
          </div>

          <div className="navbar-actions">
            <a
              href="https://orderly.network/docs"
              target="_blank"
              rel="noreferrer"
              className="navbar-docs-link"
            >
              <span className="hide-xs">Docs</span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/>
              </svg>
            </a>
            <div className="navbar-divider" />
            <MultiWalletButton />
          </div>
        </div>
      </header>

     
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 16px 80px" }}>

        {!isConnected && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", textAlign: "center", padding: "0 8px" }}>
            <div style={{
              width: 68, height: 68, borderRadius: 18,
              background: "var(--brand-subtle)",
              border: "1px solid rgba(59,91,219,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 24,
              boxShadow: "0 0 40px var(--brand-glow)",
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#748ffc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="16"/>
                <line x1="8" y1="12" x2="16" y2="12"/>
              </svg>
            </div>
            <h1 style={{ fontSize: "clamp(20px, 5vw, 28px)", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.03em", marginBottom: 12, lineHeight: 1.2 }}>
              Orderly Perpetuals Testnet
            </h1>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", maxWidth: 380, lineHeight: 1.6, marginBottom: 32 }}>
              Connect your wallet to register your Orderly account and start trading perpetual futures.
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
              <MultiWalletButton />
              <a href="https://orderly.network/docs" target="_blank" rel="noreferrer" className="btn btn-ghost" style={{ textDecoration: "none", fontSize: 13 }}>
                Read the docs ↗
              </a>
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 44, flexWrap: "wrap", justifyContent: "center" }}>
              {[
                { icon: "⚡", text: "No gas for registration" },
                { icon: "🔐", text: "Non-custodial" },
                { icon: "🌐", text: "Arbitrum Sepolia" },
              ].map((f) => (
                <div key={f.text} style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "6px 13px", borderRadius: 99,
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

        {isConnected && !isReady && (
          <div style={{ marginBottom: 32 }}>
            <OnboardingPanel />
          </div>
        )}

        {isConnected && isReady && (
          <div className="animate-fade-up">
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
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

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 16,
            }}>
              <BalancePanel />
              <DepositPanel />
              <WithdrawPanel />
            </div>
          </div>
        )}
      </main>

      <footer style={{
        borderTop: "1px solid var(--border)",
        textAlign: "center",
        padding: "18px 24px",
        fontSize: 11,
        color: "var(--text-muted)",
      }}>
        Orderly Network Testnet · Arbitrum Sepolia (chainId: 421614)
        {" · "}
        <a href="https://orderly.network/docs" target="_blank" rel="noreferrer" style={{ color: "var(--brand-light)", textDecoration: "none" }}>
          Docs ↗
        </a>
      </footer>
    </div>
  );
}

function NetworkValidator() {
  const { isConnected, chainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();

  useEffect(() => {
    if (!isConnected || !chainId || !switchChainAsync) return;
    if (chainId === arbitrumSepolia.id) return; 

    switchChainAsync({ chainId: arbitrumSepolia.id }).catch((error) => {
      if (error?.code !== 4001) {
        console.log("Failed to switch network:", error);
      }
    });
  }, [isConnected, chainId, switchChainAsync]);

  return null;
}

export default function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <NetworkValidator />
        <Dashboard />
      </QueryClientProvider>
    </WagmiProvider>
  );
}
