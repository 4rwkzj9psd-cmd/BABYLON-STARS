"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

interface PhotoRow {
  id: string;
  url: string;
}

export function PhotoGallery({
  talentId,
  fallbackUrl,
  size = 100,
}: {
  talentId: string;
  fallbackUrl: string | null;
  size?: number;
}) {
  const [photos, setPhotos] = useState<PhotoRow[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("talent_photo")
      .select("id,url")
      .eq("talent_id", talentId)
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        if (!cancelled) setPhotos((data as PhotoRow[] | null) ?? []);
      });
    return () => {
      cancelled = true;
    };
  }, [talentId]);

  const items = photos && photos.length > 0 ? photos.map((p) => p.url) : fallbackUrl ? [fallbackUrl] : [];

  if (items.length === 0) {
    return <div style={{ width: size, height: size, borderRadius: 12, background: "var(--chip-bg)", flexShrink: 0 }} />;
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {items.map((url, i) => (
        <a key={url + i} href={url} target="_blank" rel="noreferrer" style={{ flexShrink: 0 }}>
          <img
            src={url}
            alt=""
            style={{ width: size, height: size, borderRadius: 12, objectFit: "cover", display: "block" }}
          />
        </a>
      ))}
    </div>
  );
}
