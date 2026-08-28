"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { StarMark } from "@/components/layout/StarMark";
import { Field, TextInput, goldBtn } from "@/components/ui/FormPrimitives";

const COMBINING_DIACRITICS = new RegExp("[\\u0300-\\u036f]", "g");

function slugify(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(COMBINING_DIACRITICS, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function AgencySignup() {
  const router = useRouter();
  const [agencyName, setAgencyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  const createAgency = async () => {
    const slug = slugify(agencyName);
    const { error: rpcError } = await supabase.rpc("create_agency_and_become_owner", {
      p_name: agencyName.trim(),
      p_slug: slug,
    });
    if (rpcError) {
      setError(
        rpcError.message.includes("duplicate")
          ? "Agencija s tem imenom že obstaja — poskusi drugo ime."
          : rpcError.message
      );
      return;
    }
    await supabase.auth.refreshSession();
    router.push("/admin");
  };

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
    if (signUpError) {
      setError(signUpError.message);
      setSubmitting(false);
      return;
    }
    if (!data.session) {
      // Project requires email confirmation before a session is issued.
      setNeedsConfirmation(true);
      setSubmitting(false);
      return;
    }
    await createAgency();
    setSubmitting(false);
  };

  if (needsConfirmation) {
    return (
      <div style={{ maxWidth: 380, margin: "100px auto", padding: "0 24px", textAlign: "center" }}>
        <p style={{ color: "var(--text-light)", fontSize: 15, lineHeight: 1.6 }}>
          Preveri e-pošto in potrdi račun, nato se prijavi na <code>/admin</code> — registracijo agencije
          bomo takrat samodejno dokončali.
        </p>
      </div>
    );
  }

  const canSubmit = agencyName.trim().length > 1 && email && password.length >= 6;

  return (
    <div style={{ maxWidth: 380, margin: "80px auto", padding: "0 24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, justifyContent: "center" }}>
        <StarMark size={16} />
        <span style={{ fontFamily: "var(--font-fraunces), serif", fontSize: 15, color: "var(--text)" }}>
          Registracija agencije
        </span>
      </div>
      <p style={{ color: "var(--text-muted)", fontSize: 13, textAlign: "center", marginBottom: 24, lineHeight: 1.5 }}>
        14 dni brezplačno, brez kartice. Po prijavi upravljaš svoje talente, briefe in castinge.
      </p>
      <Field label="Ime agencije">
        <TextInput value={agencyName} onChange={(e) => setAgencyName(e.target.value)} placeholder="Moja Casting Agencija" />
      </Field>
      <Field label="Email">
        <TextInput value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ti@agencija.si" />
      </Field>
      <Field label="Geslo">
        <TextInput
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="vsaj 6 znakov"
          onKeyDown={(e) => e.key === "Enter" && canSubmit && submit()}
        />
      </Field>
      {error && <div style={{ fontSize: 13, color: "var(--red)", marginBottom: 12 }}>{error}</div>}
      <button
        onClick={submit}
        disabled={submitting || !canSubmit}
        style={{ ...goldBtn, width: "100%", justifyContent: "center", opacity: submitting || !canSubmit ? 0.6 : 1 }}
      >
        <LogIn size={15} /> {submitting ? "Ustvarjam..." : "Ustvari agencijo"}
      </button>
    </div>
  );
}
