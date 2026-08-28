"use client";

import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { AgencySignup } from "@/components/signup/AgencySignup";

export default function SignupPage() {
  return (
    <>
      <Nav ctaHref="/apply" ctaLabel="submitTalent" />
      <AgencySignup />
      <Footer />
    </>
  );
}
