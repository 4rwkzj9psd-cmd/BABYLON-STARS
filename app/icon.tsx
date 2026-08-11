import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0F0E13",
        }}
      >
        <svg width="24" height="24" viewBox="0 0 100 100">
          <path fill="#D4A843" d="M50 2 L58 42 L98 50 L58 58 L50 98 L42 58 L2 50 L42 42 Z" />
          <path fill="#D4A843" opacity="0.75" d="M50 18 L54 46 L82 50 L54 54 L50 82 L46 54 L18 50 L46 46 Z" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
