import { useEffect, useState, useCallback } from "react";

type ToastType = "success" | "error" | "info" | "warning";

interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

// Global event bus
const listeners: ((t: ToastItem) => void)[] = [];

function _toast(type: ToastType, title: string, message?: string, duration = 5000) {
  const item: ToastItem = { id: `${Date.now()}-${Math.random()}`, type, title, message, duration };
  listeners.forEach((fn) => fn(item));
}

export const toast = Object.assign(_toast, {
  success: (title: string, message?: string) => _toast("success", title, message),
  error:   (title: string, message?: string) => _toast("error",   title, message),
  info:    (title: string, message?: string) => _toast("info",    title, message),
  warning: (title: string, message?: string) => _toast("warning", title, message),
});

const ICONS: Record<ToastType, React.ReactNode> = {
  success: <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  error:   <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  info:    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  warning: <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>,
};

const COLORS: Record<ToastType, { bg: string; border: string; icon: string }> = {
  success: { bg: "rgba(32,201,151,0.08)",  border: "rgba(32,201,151,0.3)",  icon: "#20c997" },
  error:   { bg: "rgba(240,62,62,0.1)",    border: "rgba(240,62,62,0.35)",  icon: "#f03e3e" },
  info:    { bg: "rgba(59,91,219,0.08)",   border: "rgba(59,91,219,0.3)",   icon: "#748ffc" },
  warning: { bg: "rgba(245,159,0,0.08)",   border: "rgba(245,159,0,0.3)",   icon: "#f59f00" },
};

function ToastEntry({ item, onRemove }: { item: ToastItem; onRemove: () => void }) {
  const [exiting, setExiting] = useState(false);
  const c = COLORS[item.type];

  const dismiss = useCallback(() => {
    setExiting(true);
    setTimeout(onRemove, 280);
  }, [onRemove]);

  useEffect(() => {
    const t = setTimeout(dismiss, item.duration ?? 5000);
    return () => clearTimeout(t);
  }, [dismiss, item.duration]);

  return (
    <div
      onClick={dismiss}
      style={{
        display: "flex", alignItems: "flex-start", gap: 12,
        padding: "14px 16px",
        borderRadius: 12,
        background: "rgba(13,17,23,0.96)",
        border: `1px solid ${c.border}`,
        backdropFilter: "blur(16px)",
        cursor: "pointer",
        pointerEvents: "auto",
        minWidth: 280,
        maxWidth: 360,
        boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03) inset",
        animation: exiting
          ? "toastOut 0.28s cubic-bezier(0.4,0,1,1) forwards"
          : "toastIn 0.32s cubic-bezier(0.16,1,0.3,1) forwards",
      }}
    >
      <span style={{
        width: 22, height: 22, borderRadius: "50%",
        background: `${c.icon}20`,
        border: `1px solid ${c.icon}40`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: c.icon, flexShrink: 0, marginTop: 1,
      }}>
        {ICONS[item.type]}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: "#e8ecf4", fontWeight: 600, fontSize: 13, lineHeight: 1.4 }}>
          {item.title}
        </div>
        {item.message && (
          <div style={{ color: "#8892aa", fontSize: 12, marginTop: 3, lineHeight: 1.5, wordBreak: "break-word" }}>
            {item.message}
          </div>
        )}
      </div>
    </div>
  );
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handler = (t: ToastItem) => setToasts((prev) => [...prev, t]);
    listeners.push(handler);
    return () => {
      const i = listeners.indexOf(handler);
      if (i > -1) listeners.splice(i, 1);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 9999,
      display: "flex", flexDirection: "column", gap: 10,
      pointerEvents: "none",
    }}>
      {toasts.map((t) => (
        <ToastEntry
          key={t.id}
          item={t}
          onRemove={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
        />
      ))}
    </div>
  );
}
