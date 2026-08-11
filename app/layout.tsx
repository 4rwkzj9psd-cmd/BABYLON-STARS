import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Fraunces, Inter } from "next/font/google";
import { I18nProvider } from "@/lib/i18n/context";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["500"],
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Babylon Stars — Discovering stars everywhere",
  description: "Global talent discovery & casting agency. Discover. Develop. Represent. Cast.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="sl" className={`${fraunces.variable} ${inter.variable}`}>
      <body>
        <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
          <defs>
            <symbol id="babylon-star" viewBox="0 0 100 100">
              <path fill="#D4A843" d="M50 2 L58 42 L98 50 L58 58 L50 98 L42 58 L2 50 L42 42 Z" />
              <path
                fill="#D4A843"
                opacity="0.75"
                d="M50 18 L54 46 L82 50 L54 54 L50 82 L46 54 L18 50 L46 46 Z"
              />
            </symbol>
          </defs>
        </svg>
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
