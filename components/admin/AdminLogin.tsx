"use client";

import { useState } from "react";
import { LogIn } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n/context";
import { Field, TextInput, goldBtn } from "@/components/ui/FormPrimitives";

export function AdminLogin({ onLoggedIn }: { onLoggedIn: () => void }) {
  const { t } = useI18n();
  const ad = t.admin;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const login = async () => {
    setLoading(true);
    setError(null);
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (authError) {
      setError(authError.message);
      return;
    }
    onLoggedIn();
  };

  return (
    <div style={{ maxWidth: 340, margin: "100px auto", padding: "0 24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28, justifyContent: "center" }}>
        <LogIn size={16} color="var(--gold)" />
        <span style={{ fontFamily: "var(--font-fraunces), serif", fontSize: 15, color: "var(--text)" }}>{ad.loginTitle}</span>
      </div>
      <Field label="Email">
        <TextInput value={email} onChange={(e) => setEmail(e.target.value)} />
      </Field>
      <Field label={ad.password}>
        <TextInput
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && login()}
        />
      </Field>
      {error && <div style={{ fontSize: 13, color: "var(--red)", marginBottom: 12 }}>{error}</div>}
      <button onClick={login} disabled={loading} style={{ ...goldBtn, width: "100%", justifyContent: "center" }}>
        {loading ? ad.loggingIn : ad.loginBtn}
      </button>
      <div style={{ fontSize: 11.5, color: "var(--placeholder)", marginTop: 16, textAlign: "center" }}>{ad.loginHint}</div>
    </div>
  );
}
