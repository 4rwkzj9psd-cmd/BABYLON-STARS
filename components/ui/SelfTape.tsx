"use client";

import { PlayCircle } from "lucide-react";

const DIRECT_VIDEO_RE = /\.(mp4|webm|mov|ogg)(\?.*)?$/i;

export function SelfTape({ url, label }: { url: string; label: string }) {
  if (DIRECT_VIDEO_RE.test(url)) {
    return (
      <video
        controls
        preload="metadata"
        src={url}
        style={{ width: "100%", maxHeight: 360, borderRadius: 10, background: "#000", display: "block" }}
      />
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "12px 14px",
        background: "var(--bg-card)",
        borderRadius: 8,
        color: "var(--gold)",
        fontSize: 13.5,
        textDecoration: "none",
        wordBreak: "break-all",
      }}
    >
      <PlayCircle size={18} style={{ flexShrink: 0 }} />
      {label}
    </a>
  );
}
