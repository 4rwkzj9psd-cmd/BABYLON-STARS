"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import styles from "./page.module.css";

export default function ForProductionsPage() {
  const { t } = useI18n();
  const fp = t.forProductions;

  return (
    <>
      <Nav ctaHref="/for-productions#brief" ctaLabel="submitBrief" />

      <section className={styles.hero}>
        <img src="https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1400&h=900&fit=crop" alt="" />
        <div className={styles.heroInner}>
          <div className={styles.eyebrow}>{fp.eyebrow}</div>
          <h1>{fp.h1}</h1>
          <p>{fp.sub}</p>
          <div className={styles.heroCtas}>
            <a href="#brief" className="btn btn-gold">
              {fp.cta1}
            </a>
            <Link href="/#talents" className="btn btn-line">
              {fp.cta2}
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.services}>
        <div className="wrap">
          <h2>{fp.servicesTitle}</h2>
          <div className={styles.servicesGrid}>
            <div className={styles.serviceCard}>
              <div className="ic">🎬</div>
              <h4>{fp.s1t}</h4>
              <p>{fp.s1d}</p>
            </div>
            <div className={styles.serviceCard}>
              <div className="ic">🔍</div>
              <h4>{fp.s2t}</h4>
              <p>{fp.s2d}</p>
            </div>
            <div className={styles.serviceCard}>
              <div className="ic">🤝</div>
              <h4>{fp.s3t}</h4>
              <p>{fp.s3d}</p>
            </div>
            <div className={styles.serviceCard}>
              <div className="ic">🌐</div>
              <h4>{fp.s4t}</h4>
              <p>{fp.s4d}</p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.briefFlow} id="brief">
        <div className="wrap">
          <h2>{fp.flowTitle}</h2>
          <div className={styles.flowRow}>
            <div className={styles.flowCard}>
              <div className="n">01</div>
              <h4>{fp.f1t}</h4>
              <p>{fp.f1d}</p>
            </div>
            <div className={styles.flowCard}>
              <div className="n">02</div>
              <h4>{fp.f2t}</h4>
              <p>{fp.f2d}</p>
            </div>
            <div className={styles.flowCard}>
              <div className="n">03</div>
              <h4>{fp.f3t}</h4>
              <p>{fp.f3d}</p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.ctaBand}>
        <h3>{fp.ctaBandTitle}</h3>
        <p>{fp.ctaBandSub}</p>
        <a href="mailto:info@raw-flat.si" className="btn btn-gold">
          {fp.ctaBandBtn}
        </a>
      </section>

      <Footer />
    </>
  );
}
