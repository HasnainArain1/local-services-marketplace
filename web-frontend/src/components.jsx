import React from "react";
import { C, disp, mono, sans, inputStyle, STATUS_TONE, STATUS_LABEL } from "./theme.js";

// ── Stamp (status badge) ──
export function Stamp({ children, tone = "amber" }) {
  const map = {
    amber: { bg: C.amberBg, fg: C.amberDeep },
    teal: { bg: C.tealBg, fg: C.tealDeep },
    success: { bg: C.successBg, fg: C.success },
    danger: { bg: C.dangerBg, fg: C.danger },
    gray: { bg: "#EDECE6", fg: C.muted },
  }[tone] || { bg: C.amberBg, fg: C.amberDeep };
  return (
    <span style={{
      ...mono, fontSize: 11, letterSpacing: 0.4, textTransform: "uppercase",
      padding: "3px 8px", borderRadius: 4, background: map.bg, color: map.fg,
      fontWeight: 500, whiteSpace: "nowrap",
    }}>{children}</span>
  );
}

// ── Card ──
export function Card({ children, style, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: C.card, border: `1px solid ${C.border}`, borderRadius: 10,
      padding: "20px 22px", cursor: onClick ? "pointer" : "default",
      transition: "box-shadow 0.15s, transform 0.15s",
      ...style,
    }}
    onMouseEnter={onClick ? (e) => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.07)"; e.currentTarget.style.transform = "translateY(-2px)"; } : undefined}
    onMouseLeave={onClick ? (e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; } : undefined}
    >{children}</div>
  );
}

// ── Button ──
export function Button({ children, onClick, variant = "primary", style, type = "button", disabled = false }) {
  const base = {
    fontFamily: "'Inter', sans-serif", fontSize: 13.5, fontWeight: 600,
    padding: "9px 16px", borderRadius: 7, cursor: disabled ? "not-allowed" : "pointer",
    border: "1px solid transparent", transition: "opacity 0.15s", opacity: disabled ? 0.6 : 1,
  };
  const variants = {
    primary: { background: C.ink, color: "#fff" },
    amber: { background: C.amber, color: "#fff" },
    ghost: { background: "transparent", color: C.ink, border: `1px solid ${C.border}` },
    danger: { background: "transparent", color: C.danger, border: `1px solid ${C.dangerBg}` },
    teal: { background: C.teal, color: "#fff" },
  };
  return (
    <button type={type} onClick={disabled ? null : onClick} disabled={disabled}
      onMouseDown={(e) => !disabled && (e.currentTarget.style.opacity = "0.85")}
      onMouseUp={(e) => !disabled && (e.currentTarget.style.opacity = "1")}
      style={{ ...base, ...variants[variant], ...style }}
    >{children}</button>
  );
}

// ── Field (form label wrapper) ──
export function Field({ label, children, hint }) {
  return (
    <label style={{ display: "block", marginBottom: 16 }}>
      <div style={{ ...sans, fontSize: 12.5, fontWeight: 600, color: C.inkSoft, marginBottom: 6 }}>{label}</div>
      {children}
      {hint && <div style={{ ...sans, fontSize: 11.5, color: C.muted, marginTop: 4 }}>{hint}</div>}
    </label>
  );
}

// ── PageHeader ──
export function PageHeader({ eyebrow, title, action }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22, flexWrap: "wrap", gap: 12 }}>
      <div>
        <div style={{ ...mono, fontSize: 11, color: C.muted, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 6 }}>{eyebrow}</div>
        <h1 style={{ ...disp, fontSize: 24, fontWeight: 600, color: C.ink, margin: 0 }}>{title}</h1>
      </div>
      {action}
    </div>
  );
}

// ── Stars display ──
export function Stars({ rating, size = 14 }) {
  const r = rating || 5;
  const full = Math.floor(r);
  const half = r - full >= 0.5;
  return (
    <span style={{ ...mono, fontSize: size, color: C.amberDeep }}>
      {"★".repeat(full)}{half ? "½" : ""}{"☆".repeat(Math.max(0, 5 - full - (half ? 1 : 0)))}
    </span>
  );
}

// ── Table ──
export function Table({ columns, children }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#FAF9F5" }}>
            {columns.map((c) => (
              <th key={c} style={{ ...sans, textAlign: "left", fontSize: 11.5, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: 0.4, padding: "10px 16px", borderBottom: `1px solid ${C.border}` }}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
export const tdStyle = { ...sans, fontSize: 13.5, color: C.ink, padding: "12px 16px", borderBottom: `1px solid ${C.border}` };

// ── Empty state ──
export function Empty({ icon = "📭", message }) {
  return (
    <Card style={{ textAlign: "center", padding: "48px 24px" }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>{icon}</div>
      <div style={{ ...sans, fontSize: 14, color: C.muted }}>{message}</div>
    </Card>
  );
}

export { STATUS_TONE, STATUS_LABEL, inputStyle };
