"use client";

import Link from "next/link";
import { ArrowLeft, Crown, Orbit, Sparkles } from "lucide-react";
import { useState } from "react";
import styles from "./page.module.css";

export default function HybridDesignPage() {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const updateTilt = (event: React.PointerEvent<HTMLElement>) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setTilt({
      x: (event.clientY / window.innerHeight - 0.5) * -8,
      y: (event.clientX / window.innerWidth - 0.5) * 9,
    });
  };

  return (
    <main className={styles.page} onPointerMove={updateTilt} onPointerLeave={() => setTilt({ x: 0, y: 0 })}>
      <nav className={styles.nav}>
        <Link href="/"><ArrowLeft size={16} /> PREVIEW D</Link>
        <span>KOTS / ORIGINAL SIGNAL</span>
        <Link href="/design-b">3D VERSION</Link>
      </nav>
      <div className={styles.grid} aria-hidden="true" />
      <section className={styles.hero}>
        <div className={styles.intro}>
          <p><Sparkles size={14} /> ORIGINAL NEON. NEW DIMENSION.</p>
          <h1>RULE<br /><i>THE SCREEN.</i></h1>
          <span>The original KOTS visual language,<br />built around one monumental screen.</span>
          <div className={styles.pill}>PRE-LAUNCH · NO PAYMENTS LIVE</div>
        </div>
        <div className={styles.scene} style={{ transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}>
          <div className={styles.ring}><Orbit /></div>
          <div className={styles.backplate} />
          <div className={styles.throne}>
            <div className={styles.throneHeader}><span>CROWN // 001</span><span>PAUSED</span></div>
            <Crown />
            <h2>KING<br />OF THE<br />SCREEN</h2>
            <div className={styles.throneFooter}><span>GLOBAL BROADCAST</span><span>2026</span></div>
          </div>
          <div className={styles.shadow} />
        </div>
      </section>
      <section className={styles.metrics}>
        <div><b>01</b><span>active screen<br />at a time</span></div>
        <div><b>100</b><span>archival crown<br />limit</span></div>
        <div><b>$1M</b><span>public monument<br />target</span></div>
        <div><b>0</b><span>payments live<br />today</span></div>
      </section>
      <footer className={styles.footer}>
        <span>DESIGN STUDY D · NEON MONUMENT</span>
        <span>Original palette. 3D screen composition. Reduced motion stays still.</span>
      </footer>
    </main>
  );
}
