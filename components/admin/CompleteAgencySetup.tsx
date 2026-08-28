"use client";

import { useState } from "react";
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

// Shown when a logged-in account isn't staff of any agency yet -- either they confirmed their
// email after /signup (so agency creation was deferred), or the RPC failed transiently the
// first time. Lets them finish (or retry) the same create_agency_and_become_owner() step.
export function CompleteAgencySetup({ onDone }: { onDone: () => void }) {
  const [agencyName, setAgencyName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    const { error: rpcError } = await supabase.rpc("create_agency_and_become_owner", {
      p_name: agencyName.trim(),
      p_slug: slugify(agencyName),
    });
    if (rpcError) {
      setError(rpcError.message.includes("duplicate") ? "Agencija s tem imenom že obstaja — poskusi drugo ime." : rpcError.message);
      setSubmitting(false);
      return;
    }
    await supabase.auth.refreshSession();
    setSubmitting(false);
    onDone();
  };

  return (
    <div style={{ maxWidth: 360, margin: "100px auto", padding: "0 24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, justifyContent: "center" }}>
        <StarMark size={16} />
        <span style={{ fontFamily: "var(--font-fraunces), serif", fontSize: 15, color: "var(--text)" }}>Dokončaj registracijo</span>
      </div>
      <p style={{ color: "var(--text-muted)", fontSize: 13, textAlign: "center", marginBottom: 24, lineHeight: 1.5 }}>
        Račun je potrjen — samo še ime agencije, pa lahko začneš.
      </p>
      <Field label="Ime agencije">
        <TextInput
          value={agencyName}
          onChange={(e) => setAgencyName(e.target.value)}
          placeholder="Moja Casting Agencija"
          onKeyDown={(e) => e.key === "Enter" && agencyName.trim().length > 1 && submit()}
        />
      </Field>
      {error && <div style={{ fontSize: 13, color: "var(--red)", marginBottom: 12 }}>{error}</div>}
      <button
        onClick={submit}
        disabled={submitting || agencyName.trim().length < 2}
        style={{ ...goldBtn, width: "100%", justifyContent: "center", opacity: submitting || agencyName.trim().length < 2 ? 0.6 : 1 }}
      >
        {submitting ? "Ustvarjam..." : "Ustvari agencijo"}
      </button>
    </div>
  );
}
