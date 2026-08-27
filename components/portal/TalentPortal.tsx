"use client";

import { useEffect, useState, useCallback } from "react";
import type { Session } from "@supabase/supabase-js";
import Link from "next/link";
import { ChevronRight, MapPin, FileText, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n/context";
import { Badge, Field, TextInput, goldBtn, ghostBtn } from "@/components/ui/FormPrimitives";
import { StarMark } from "@/components/layout/StarMark";
import { SelfTape } from "@/components/ui/SelfTape";
import { STATUS_META, PROPOSAL_STATUS_META, one } from "@/components/admin/types";

interface TalentRow {
  id: string;
  first_name: string;
  last_name: string;
  city: string;
  country: string | null;
  categories: string[];
  status: "submitted" | "in_review" | "represented" | "not_pursued" | "archived";
  photo_url: string | null;
  video_url: string | null;
  email: string | null;
  created_at: string;
}

interface BriefInfo {
  title: string;
  deadline: string | null;
  production: { company_name: string } | { company_name: string }[] | null;
}

interface ProposalRow {
  id: string;
  talent_id: string;
  status: "proposed" | "sent_to_production" | "selected" | "rejected";
  notified_at: string | null;
  brief: BriefInfo | BriefInfo[] | null;
}

interface DocumentRow {
  id: string;
  type: "representation_agreement" | "project_contract" | "consent_form" | "guardian_consent" | "other";
  status: "draft" | "sent" | "signed" | "declined" | "expired";
  signed_file_url: string | null;
  created_at: string;
}

function LoginForm() {
  const { t } = useI18n();
  const p = t.portal;
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = async () => {
    setSending(true);
    setError(null);
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}/portal` : undefined },
    });
    setSending(false);
    if (otpError) {
      setError(otpError.message);
      return;
    }
    setSent(true);
  };

  if (sent) {
    return (
      <div style={{ maxWidth: 380, margin: "100px auto", padding: "0 24px", textAlign: "center" }}>
        <p style={{ color: "var(--text-light)", fontSize: 15, lineHeight: 1.6 }}>{p.linkSent}</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 340, margin: "100px auto", padding: "0 24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, justifyContent: "center" }}>
        <StarMark size={16} />
        <span style={{ fontFamily: "var(--font-fraunces), serif", fontSize: 15, color: "var(--text)" }}>{p.loginTitle}</span>
      </div>
      <p style={{ color: "var(--text-muted)", fontSize: 13, textAlign: "center", marginBottom: 24, lineHeight: 1.5 }}>{p.loginSub}</p>
      <Field label="Email">
        <TextInput
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={p.emailPlaceholder}
          onKeyDown={(e) => e.key === "Enter" && email && send()}
        />
      </Field>
      {error && <div style={{ fontSize: 13, color: "var(--red)", marginBottom: 12 }}>{error}</div>}
      <button onClick={send} disabled={sending || !email} style={{ ...goldBtn, width: "100%", justifyContent: "center", opacity: sending || !email ? 0.6 : 1 }}>
        {sending ? p.sending : p.sendLink}
      </button>
    </div>
  );
}

function ProfileView({ session }: { session: Session }) {
  const { t } = useI18n();
  const p = t.portal;
  const ad = t.admin;
  const [loading, setLoading] = useState(true);
  const [talents, setTalents] = useState<TalentRow[]>([]);
  const [proposals, setProposals] = useState<ProposalRow[]>([]);
  const [documents, setDocuments] = useState<DocumentRow[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    let { data: ownTalents } = await supabase
      .from("talent")
      .select("id,first_name,last_name,city,country,categories,status,photo_url,video_url,email,created_at")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (!ownTalents || ownTalents.length === 0) {
      // First login after applying: try a one-time claim by verified email.
      await supabase.from("talent").update({ user_id: session.user.id }).is("user_id", null).eq("email", session.user.email);
      const retry = await supabase
        .from("talent")
        .select("id,first_name,last_name,city,country,categories,status,photo_url,video_url,email,created_at")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });
      ownTalents = retry.data;
    }

    setTalents((ownTalents as TalentRow[]) ?? []);

    const ids = (ownTalents ?? []).map((t) => t.id);
    if (ids.length > 0) {
      const [{ data: proposalData }, { data: documentData }] = await Promise.all([
        supabase
          .from("proposal")
          .select("id,talent_id,status,notified_at,brief(title,deadline,production(company_name))")
          .in("talent_id", ids)
          .order("proposed_at", { ascending: false }),
        supabase.from("document").select("id,type,status,signed_file_url,created_at").in("talent_id", ids).order("created_at", { ascending: false }),
      ]);
      setProposals((proposalData as ProposalRow[]) ?? []);
      setDocuments((documentData as DocumentRow[]) ?? []);
    }
    setLoading(false);
  }, [session]);

  useEffect(() => {
    load();
  }, [load]);

  const logout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "120px 0" }}>
        <Loader2 className="spin" size={22} color="var(--gold)" />
        <span style={{ color: "var(--text-dim)", fontSize: 13 }}>{p.claiming}</span>
      </div>
    );
  }

  const primary = talents[0];

  if (!primary) {
    return (
      <div style={{ maxWidth: 420, margin: "100px auto", padding: "0 24px", textAlign: "center" }}>
        <p style={{ color: "var(--text-muted)", fontSize: 14.5, lineHeight: 1.6, marginBottom: 20 }}>{p.noProfileFound}</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <Link href="/apply" className="btn btn-gold">
            {p.goApply}
          </Link>
          <button onClick={logout} style={ghostBtn}>
            {p.logout}
          </button>
        </div>
      </div>
    );
  }

  const st = STATUS_META[primary.status];

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "48px 24px 90px" }}>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <button onClick={logout} style={{ ...ghostBtn, fontSize: 11 }}>
          {p.logout}
        </button>
      </div>

      <div style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 32, flexWrap: "wrap" }}>
        {primary.photo_url ? (
          <img src={primary.photo_url} alt="" style={{ width: 84, height: 84, borderRadius: 12, objectFit: "cover" }} />
        ) : (
          <div style={{ width: 84, height: 84, borderRadius: 12, background: "var(--chip-bg)" }} />
        )}
        <div>
          <h1 style={{ fontFamily: "var(--font-fraunces), serif", fontSize: 24, fontWeight: 500, color: "var(--text)", marginBottom: 6 }}>
            {p.welcomeBack(primary.first_name)}
          </h1>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: "var(--text-muted)" }}>
              <MapPin size={13} />
              {primary.city}
              {primary.country ? `, ${primary.country}` : ""}
            </span>
            <Badge color={st.color} bg={st.bg}>
              {ad.status[primary.status]}
            </Badge>
          </div>
        </div>
      </div>

      {primary.video_url && (
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontFamily: "var(--font-fraunces), serif", fontSize: 17, fontWeight: 500, color: "var(--text)", marginBottom: 14 }}>
            {p.myVideo}
          </h2>
          <SelfTape url={primary.video_url} label={p.watchVideo} />
        </section>
      )}

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontFamily: "var(--font-fraunces), serif", fontSize: 17, fontWeight: 500, color: "var(--text)", marginBottom: 14 }}>
          {p.myApplications}
        </h2>
        {proposals.length === 0 ? (
          <div style={{ fontSize: 13.5, color: "var(--text-dim)" }}>
            {p.noApplications}{" "}
            <Link href="/projects" style={{ color: "var(--gold)" }}>
              {p.browseProjects}
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {proposals.map((prop) => {
              const brief = one(prop.brief);
              const production = brief ? one(brief.production) : null;
              const pst = PROPOSAL_STATUS_META[prop.status];
              return (
                <div
                  key={prop.id}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: "var(--bg-card)", borderRadius: 8, flexWrap: "wrap" }}
                >
                  <div style={{ flex: 1, minWidth: 160 }}>
                    <div style={{ fontSize: 14, color: "var(--text)" }}>{brief?.title ?? "—"}</div>
                    <div style={{ fontSize: 12, color: "var(--text-dim)" }}>{production?.company_name}</div>
                  </div>
                  <Badge color={pst.color} bg={pst.bg}>
                    {ad.proposalStatus[prop.status]}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <h2 style={{ fontFamily: "var(--font-fraunces), serif", fontSize: 17, fontWeight: 500, color: "var(--text)", marginBottom: 14 }}>
          {p.myDocuments}
        </h2>
        {documents.length === 0 ? (
          <div style={{ fontSize: 13.5, color: "var(--text-dim)" }}>{p.noDocuments}</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {documents.map((doc) => (
              <div
                key={doc.id}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: "var(--bg-card)", borderRadius: 8, flexWrap: "wrap" }}
              >
                <FileText size={16} color="var(--text-dim)" />
                <div style={{ flex: 1, minWidth: 160, fontSize: 14, color: "var(--text)" }}>{p.documentTypes[doc.type]}</div>
                <Badge color={doc.status === "signed" ? "var(--teal)" : "var(--text-muted)"} bg={doc.status === "signed" ? "var(--teal-bg)" : "var(--chip-bg)"}>
                  {p.documentStatus[doc.status]}
                </Badge>
                {doc.status === "signed" && doc.signed_file_url && (
                  <a href={doc.signed_file_url} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "var(--gold)" }}>
                    {p.viewSigned} <ChevronRight size={12} style={{ display: "inline", verticalAlign: -2 }} />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export function TalentPortal() {
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecking(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  if (checking) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "120px 0" }}>
        <StarMark size={28} />
      </div>
    );
  }

  return session ? <ProfileView session={session} /> : <LoginForm />;
}
