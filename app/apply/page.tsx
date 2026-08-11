"use client";

import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { TalentApplication } from "@/components/application-form/TalentApplication";

export default function ApplyPage() {
  return (
    <>
      <Nav ctaHref="/apply" ctaLabel="submitTalent" />
      <TalentApplication />
      <Footer />
    </>
  );
}
