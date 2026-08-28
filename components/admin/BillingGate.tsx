"use client";

import { useState } from "react";
import { CreditCard } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { goldBtn, ghostBtn } from "@/components/ui/FormPrimitives";

const REASON_COPY: Record<string, string> = {
  trial_expired: "Preizkusna doba je potekla.",
  past_due: "Zadnje plačilo ni uspelo.",
  canceled: "Naročnina je bila preklicana.",
};

export function BillingGate({ reason, onLogout }: { reason: "trial_expired" | "past_due" | "canceled"; onLogout: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upgrade = async () => {
    setLoading(true);
    setError(null);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const body = await res.json();
      if (body.url) {
        window.location.href = body.url;
      } else {
        setError(body.error ?? "Napaka pri povezavi s plačilnim sistemom.");
        setLoading(false);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "120px auto", padding: "0 24px", textAlign: "center" }}>
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          background: "var(--gold-dark-bg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 20px",
        }}
      >
        <CreditCard size={20} color="var(--gold)" />
      </div>
      <h2 style={{ fontFamily: "var(--font-fraunces), serif", fontSize: 20, color: "var(--text)", marginBottom: 10, fontWeight: 500 }}>
        {REASON_COPY[reason]}
      </h2>
      <p style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
        Dodaj plačilno kartico, da obdržiš dostop do admin panela.
      </p>
      {error && <div style={{ fontSize: 13, color: "var(--red)", marginBottom: 16 }}>{error}</div>}
      <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
        <button onClick={upgrade} disabled={loading} style={{ ...goldBtn, opacity: loading ? 0.6 : 1 }}>
          {loading ? "Povezujem..." : "Dodaj plačilno kartico"}
        </button>
        <button onClick={onLogout} style={ghostBtn}>
          Odjava
        </button>
      </div>
    </div>
  );
}
