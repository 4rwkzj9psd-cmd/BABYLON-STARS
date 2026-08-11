"use client";

import { ReactNode, InputHTMLAttributes } from "react";
import { Check } from "lucide-react";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: 16, flex: 1 }}>
      <label style={{ display: "block", fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} style={{ ...inputStyle, ...props.style }} />;
}

export const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 6,
  border: "1px solid var(--input-border)",
  background: "var(--bg-card)",
  color: "var(--text)",
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
};

export const row2: React.CSSProperties = { display: "flex", gap: 14 };

export const sectionTitle: React.CSSProperties = {
  fontFamily: "var(--font-fraunces), serif",
  fontSize: 22,
  color: "var(--text)",
  fontWeight: 500,
  marginBottom: 6,
};

export const goldBtn: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: "12px 22px",
  borderRadius: 3,
  background: "var(--gold)",
  color: "#14131a",
  border: "none",
  fontSize: 12.5,
  fontWeight: 600,
  letterSpacing: "0.05em",
  textTransform: "uppercase",
  cursor: "pointer",
};

export const ghostBtn: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: "12px 18px",
  borderRadius: 3,
  background: "transparent",
  color: "var(--text)",
  border: "1px solid var(--border-light)",
  fontSize: 12.5,
  fontWeight: 600,
  letterSpacing: "0.05em",
  textTransform: "uppercase",
  cursor: "pointer",
};

export function StepDots({ step, total }: { step: number; total: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 28 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: i <= step ? "var(--gold)" : "var(--input-border)",
              transition: "background 0.2s",
            }}
          />
          {i < total - 1 && (
            <div style={{ width: 24, height: 1, background: i < step ? "var(--gold)" : "var(--input-border)" }} />
          )}
        </div>
      ))}
    </div>
  );
}

export function ConsentRow({ checked, onChange, text }: { checked: boolean; onChange: () => void; text: string }) {
  return (
    <label style={{ display: "flex", gap: 12, alignItems: "flex-start", cursor: "pointer", marginBottom: 14 }}>
      <div
        onClick={onChange}
        style={{
          width: 20,
          height: 20,
          borderRadius: 5,
          flexShrink: 0,
          marginTop: 1,
          border: checked ? "none" : "1px solid var(--border-light)",
          background: checked ? "var(--gold)" : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {checked && <Check size={13} color="#1c1b24" />}
      </div>
      <span style={{ fontSize: 14, color: "var(--text-light)", lineHeight: 1.5 }}>{text}</span>
    </label>
  );
}

export function Badge({ children, color, bg }: { children: ReactNode; color: string; bg: string }) {
  return (
    <span
      style={{
        fontSize: 12,
        fontWeight: 500,
        color,
        background: bg,
        padding: "3px 9px",
        borderRadius: 20,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}
