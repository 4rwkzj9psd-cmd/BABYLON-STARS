"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n/context";
import { Field, TextInput, inputStyle, goldBtn, ghostBtn } from "@/components/ui/FormPrimitives";
import { ProductionRow } from "./types";

const CATEGORY_VALUES = ["actor", "model", "performer", "character_face", "animal_talent", "no_experience"] as const;

export function NewBriefForm({
  productions,
  onCreated,
  onCancel,
}: {
  productions: ProductionRow[];
  onCreated: () => void;
  onCancel: () => void;
}) {
  const { t } = useI18n();
  const [productionId, setProductionId] = useState(productions[0]?.id ?? "");
  const [newProductionName, setNewProductionName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("");
  const [deadline, setDeadline] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      let prodId = productionId;
      if (!prodId && newProductionName.trim()) {
        const { data, error: prodError } = await supabase
          .from("production")
          .insert({ company_name: newProductionName.trim() })
          .select("id")
          .single();
        if (prodError) throw prodError;
        prodId = data.id;
      }
      if (!prodId || !title.trim()) throw new Error("Manjka produkcija ali naslov briefa.");

      const { error: briefError } = await supabase.from("brief").insert({
        production_id: prodId,
        title: title.trim(),
        description: description.trim() || null,
        category: category || null,
        deadline: deadline || null,
        is_public: isPublic,
      });
      if (briefError) throw briefError;
      onCreated();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 18, marginBottom: 16 }}>
      <Field label="Produkcija">
        <select
          value={productionId}
          onChange={(e) => setProductionId(e.target.value)}
          style={{ ...inputStyle, marginBottom: 8 }}
        >
          <option value="">— nova produkcija —</option>
          {productions.map((p) => (
            <option key={p.id} value={p.id}>
              {p.company_name}
            </option>
          ))}
        </select>
        {!productionId && (
          <TextInput
            value={newProductionName}
            onChange={(e) => setNewProductionName(e.target.value)}
            placeholder="Ime nove produkcije"
          />
        )}
      </Field>
      <Field label="Naslov briefa">
        <TextInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Kratki film — glavna vloga" />
      </Field>
      <Field label="Opis">
        <TextInput value={description} onChange={(e) => setDescription(e.target.value)} />
      </Field>
      <div style={{ display: "flex", gap: 14 }}>
        <Field label="Kategorija">
          <select value={category} onChange={(e) => setCategory(e.target.value)} style={inputStyle}>
            <option value="">—</option>
            {CATEGORY_VALUES.map((c) => (
              <option key={c} value={c}>
                {t.apply.categories[c]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Rok prijave">
          <TextInput type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
        </Field>
      </div>
      <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-light)", marginBottom: 16 }}>
        <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
        Javno objavljen (viden na strani "Odprti projekti")
      </label>
      {error && (
        <div style={{ marginBottom: 12, padding: "10px 14px", background: "var(--red-bg)", borderRadius: 8, color: "var(--red)", fontSize: 13 }}>
          {error}
        </div>
      )}
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={submit} disabled={submitting} style={{ ...goldBtn, opacity: submitting ? 0.6 : 1 }}>
          {submitting ? "Ustvarjam..." : "Ustvari brief"}
        </button>
        <button onClick={onCancel} style={ghostBtn}>
          Prekliči
        </button>
      </div>
    </div>
  );
}
