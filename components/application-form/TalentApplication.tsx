"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Check, Camera, ArrowRight, X, Plus } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { AGENCY_ID } from "@/lib/agency";
import { useI18n } from "@/lib/i18n/context";
import { StarMark } from "@/components/layout/StarMark";
import {
  Field,
  TextInput,
  inputStyle,
  row2,
  sectionTitle,
  goldBtn,
  ghostBtn,
  StepDots,
  ConsentRow,
} from "@/components/ui/FormPrimitives";

const CATEGORY_VALUES = ["actor", "model", "performer", "character_face", "animal_talent", "no_experience"] as const;
type CategoryValue = (typeof CATEGORY_VALUES)[number];

interface FormState {
  firstName: string;
  lastName: string;
  dob: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  categories: CategoryValue[];
  photoFiles: File[];
  photoPreviews: string[];
  video: string;
  languages: string;
  skills: string;
  availability: string;
  consent1: boolean;
  consent2: boolean;
}

const initialForm: FormState = {
  firstName: "",
  lastName: "",
  dob: "",
  email: "",
  phone: "",
  city: "",
  country: "",
  categories: [],
  photoFiles: [],
  photoPreviews: [],
  video: "",
  languages: "",
  skills: "",
  availability: "",
  consent1: false,
  consent2: false,
};

export function TalentApplication() {
  const { t } = useI18n();
  const a = t.apply;
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(initialForm);
  const [talentId, setTalentId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const totalSteps = 5;

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));

  const toggleCategory = (c: CategoryValue) =>
    setForm((f) => ({
      ...f,
      categories: f.categories.includes(c) ? f.categories.filter((x) => x !== c) : [...f.categories, c],
    }));

  const isMinor = (() => {
    if (!form.dob) return false;
    const age = (Date.now() - new Date(form.dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    return age < 18;
  })();

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
  const emailTouched = form.email.length > 0;

  const canProceed = () => {
    if (step === 0) return form.firstName && form.lastName && form.dob && form.email && isValidEmail && form.city;
    if (step === 1) return form.categories.length > 0;
    if (step === 2) return form.photoFiles.length > 0;
    if (step === 4) return form.consent1 && form.consent2;
    return true;
  };

  const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
  const MAX_PHOTOS = 6;

  const handlePhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;

    const room = MAX_PHOTOS - form.photoFiles.length;
    if (room <= 0) {
      setPhotoError(a.photoMaxError);
      return;
    }
    const toAdd = files.slice(0, room);

    for (const file of toAdd) {
      if (!file.type.startsWith("image/")) {
        setPhotoError(a.photoTypeError);
        return;
      }
      if (file.size > MAX_PHOTO_BYTES) {
        setPhotoError(a.photoSizeError);
        return;
      }
    }
    setPhotoError(null);

    Promise.all(
      toAdd.map(
        (file) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          })
      )
    ).then((previews) => {
      setForm((f) => ({
        ...f,
        photoFiles: [...f.photoFiles, ...toAdd],
        photoPreviews: [...f.photoPreviews, ...previews],
      }));
    });
  };

  const removePhoto = (index: number) => {
    setForm((f) => ({
      ...f,
      photoFiles: f.photoFiles.filter((_, i) => i !== index),
      photoPreviews: f.photoPreviews.filter((_, i) => i !== index),
    }));
    setPhotoError(null);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const photoUrls: string[] = [];
      for (const file of form.photoFiles) {
        const ext = file.name.split(".").pop();
        const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadError } = await supabase.storage.from("talent-photos").upload(path, file);
        if (uploadError) throw uploadError;
        const { data: publicUrlData } = supabase.storage.from("talent-photos").getPublicUrl(path);
        photoUrls.push(publicUrlData.publicUrl);
      }

      const { data: newTalentId, error: rpcError } = await supabase.rpc("apply_as_talent", {
        p_agency_id: AGENCY_ID,
        p_first_name: form.firstName,
        p_last_name: form.lastName,
        p_date_of_birth: form.dob,
        p_email: form.email,
        p_phone: form.phone,
        p_city: form.city,
        p_country: form.country,
        p_categories: form.categories,
        p_video_url: form.video || null,
        p_languages: form.languages ? form.languages.split(",").map((s) => s.trim()) : [],
        p_skills: form.skills ? form.skills.split(",").map((s) => s.trim()) : [],
        p_availability: form.availability || null,
        p_consent_general: form.consent1,
        p_consent_photo_video: form.consent2,
        p_photo_urls: photoUrls,
      });
      if (rpcError) throw rpcError;

      setTalentId(newTalentId as string);
      setSubmitted(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ maxWidth: 480, margin: "80px auto", textAlign: "center", padding: "0 24px" }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "var(--teal-bg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
          }}
        >
          <Check size={24} color="var(--teal)" />
        </div>
        <h2 style={{ fontFamily: "var(--font-fraunces), serif", fontSize: 26, color: "var(--text)", marginBottom: 12, fontWeight: 500 }}>
          {a.thanksTitle(form.firstName)}
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: 15, lineHeight: 1.6, marginBottom: 24 }}>{a.thanksBody}</p>
        {talentId && (
          <div style={{ background: "var(--bg-card)", borderRadius: 10, padding: 18, textAlign: "left" }}>
            <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 6 }}>{a.talentIdLabel}</div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <code style={{ flex: 1, fontSize: 12.5, color: "var(--text)", wordBreak: "break-all" }}>{talentId}</code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(talentId);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
                style={{ ...ghostBtn, padding: "6px 12px", fontSize: 11, flexShrink: 0 }}
              >
                {copied ? a.copied : a.copyId}
              </button>
            </div>
            <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 10, lineHeight: 1.5 }}>{a.talentIdNotice}</p>
          </div>
        )}
        <p style={{ fontSize: 12.5, color: "var(--text-dim)", marginTop: 20, lineHeight: 1.5 }}>{a.goToPortal}</p>
        <Link href="/portal" className="btn btn-line" style={{ marginTop: 12, display: "inline-flex" }}>
          {a.goToPortalBtn}
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: "48px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24, justifyContent: "center" }}>
        <StarMark size={18} />
        <span style={{ fontFamily: "var(--font-fraunces), serif", fontSize: 15, letterSpacing: "0.06em", color: "var(--text)", textTransform: "uppercase" }}>
          Babylon Stars
        </span>
      </div>

      <StepDots step={step} total={totalSteps} />

      {step === 0 && (
        <div>
          <h2 style={sectionTitle}>{a.step0Title}</h2>
          <div style={row2}>
            <Field label={a.firstName}>
              <TextInput value={form.firstName} onChange={(e) => update("firstName", e.target.value)} placeholder="Nika" />
            </Field>
            <Field label={a.lastName}>
              <TextInput value={form.lastName} onChange={(e) => update("lastName", e.target.value)} placeholder="Kovač" />
            </Field>
          </div>
          <Field label={a.dob}>
            <TextInput type="date" value={form.dob} onChange={(e) => update("dob", e.target.value)} />
          </Field>
          {isMinor && (
            <div
              style={{
                fontSize: 13,
                color: "var(--gold)",
                background: "var(--gold-dark-bg)",
                padding: "10px 14px",
                borderRadius: 8,
                marginBottom: 16,
              }}
            >
              {a.minorNotice}
            </div>
          )}
          <div style={row2}>
            <Field label={a.email}>
              <TextInput
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="ime@email.com"
                style={emailTouched && !isValidEmail ? { borderColor: "var(--red)" } : undefined}
              />
              {emailTouched && !isValidEmail && (
                <div style={{ fontSize: 11.5, color: "var(--red)", marginTop: 5 }}>{a.invalidEmail}</div>
              )}
            </Field>
            <Field label={a.phone}>
              <TextInput value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+386 ..." />
            </Field>
          </div>
          <div style={row2}>
            <Field label={a.city}>
              <TextInput value={form.city} onChange={(e) => update("city", e.target.value)} placeholder="Ljubljana" />
            </Field>
            <Field label={a.country}>
              <TextInput value={form.country} onChange={(e) => update("country", e.target.value)} placeholder="Slovenija" />
            </Field>
          </div>
        </div>
      )}

      {step === 1 && (
        <div>
          <h2 style={sectionTitle}>{a.step1Title}</h2>
          <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 20 }}>{a.step1Sub}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {CATEGORY_VALUES.map((c) => (
              <button
                key={c}
                onClick={() => toggleCategory(c)}
                style={{
                  padding: "10px 16px",
                  borderRadius: 24,
                  fontSize: 14,
                  cursor: "pointer",
                  border: form.categories.includes(c) ? "1px solid var(--gold)" : "1px solid var(--input-border)",
                  background: form.categories.includes(c) ? "var(--gold-dark-bg)" : "transparent",
                  color: form.categories.includes(c) ? "var(--gold)" : "var(--text-light)",
                }}
              >
                {a.categories[c]}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2 style={sectionTitle}>{a.step2Title}</h2>
          <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 20 }}>{a.step2Sub}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {form.photoPreviews.map((src, i) => (
              <div key={i} style={{ position: "relative", aspectRatio: "1", borderRadius: 10, overflow: "hidden" }}>
                <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                {i === 0 && (
                  <span
                    style={{
                      position: "absolute",
                      bottom: 6,
                      left: 6,
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                      color: "#14131a",
                      background: "var(--gold)",
                      padding: "2px 7px",
                      borderRadius: 4,
                    }}
                  >
                    {a.mainPhoto}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  aria-label={a.removePhoto}
                  style={{
                    position: "absolute",
                    top: 6,
                    right: 6,
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    border: "none",
                    background: "rgba(15,14,19,0.75)",
                    color: "var(--text)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            {form.photoFiles.length < MAX_PHOTOS && (
              <label
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  aspectRatio: "1",
                  border: "1px dashed var(--border-light)",
                  borderRadius: 10,
                  cursor: "pointer",
                  background: "var(--bg-hover)",
                }}
              >
                {form.photoFiles.length === 0 ? (
                  <Camera size={22} color="var(--text-dim)" />
                ) : (
                  <Plus size={20} color="var(--text-dim)" />
                )}
                <span style={{ color: "var(--text-dim)", fontSize: 11.5, textAlign: "center", padding: "0 6px" }}>{a.uploadPhoto}</span>
                <input type="file" accept="image/*" multiple onChange={handlePhotos} style={{ display: "none" }} />
              </label>
            )}
          </div>
          <p style={{ fontSize: 11.5, color: "var(--text-dim)", marginTop: 10 }}>{a.photoHint}</p>
          {photoError && <div style={{ fontSize: 12.5, color: "var(--red)", marginTop: 8 }}>{photoError}</div>}
          <div style={{ marginTop: 20 }}>
            <Field label={a.video}>
              <TextInput value={form.video} onChange={(e) => update("video", e.target.value)} placeholder="https://..." />
            </Field>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <h2 style={sectionTitle}>{a.step3Title}</h2>
          <Field label={a.languages}>
            <TextInput value={form.languages} onChange={(e) => update("languages", e.target.value)} placeholder="Slovenščina, angleščina" />
          </Field>
          <Field label={a.skills}>
            <TextInput value={form.skills} onChange={(e) => update("skills", e.target.value)} placeholder="Ples, petje" />
          </Field>
          <Field label={a.availability}>
            <TextInput value={form.availability} onChange={(e) => update("availability", e.target.value)} />
          </Field>
        </div>
      )}

      {step === 4 && (
        <div>
          <h2 style={sectionTitle}>{a.step4Title}</h2>
          <ConsentRow checked={form.consent1} onChange={() => update("consent1", !form.consent1)} text={a.consent1} />
          <ConsentRow checked={form.consent2} onChange={() => update("consent2", !form.consent2)} text={a.consent2} />
          {error && (
            <div style={{ marginTop: 16, padding: "10px 14px", background: "var(--red-bg)", borderRadius: 8, color: "var(--red)", fontSize: 13 }}>
              {a.errorPrefix} {error}
            </div>
          )}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 36 }}>
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          style={{ ...ghostBtn, visibility: step === 0 ? "hidden" : "visible" }}
        >
          <ChevronLeft size={16} /> {a.back}
        </button>
        {step < totalSteps - 1 ? (
          <button disabled={!canProceed()} onClick={() => setStep((s) => s + 1)} style={{ ...goldBtn, opacity: canProceed() ? 1 : 0.4 }}>
            {a.next} <ChevronRight size={16} />
          </button>
        ) : (
          <button
            disabled={!canProceed() || submitting}
            onClick={handleSubmit}
            style={{ ...goldBtn, opacity: canProceed() && !submitting ? 1 : 0.4 }}
          >
            {submitting ? a.submitting : a.submit} <ArrowRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
