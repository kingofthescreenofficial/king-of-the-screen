"use client";

import Link from "next/link";
import { ArrowLeft, Crown, Orbit, Sparkles } from "lucide-react";
import { useState } from "react";
import styles from "./page.module.css";

export default function DesignBPage() {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  return <main className={styles.page} onPointerMove={(event) => setTilt({ x: (event.clientY / window.innerHeight - .5) * -8, y: (event.clientX / window.innerWidth - .5) * 9 })} onPointerLeave={() => setTilt({ x: 0, y: 0 })}>
    <nav className={styles.nav}><Link href="/"><ArrowLeft size={16} /> PREVIEW B</Link><span>KOTS / ZERO-GRAVITY</span><Link href="/design-a">EDITORIAL VERSION</Link></nav>
    <div className={styles.stars} aria-hidden="true" />
    <section className={styles.hero}><div className={styles.intro}><p><Sparkles size={14} /> PRE-LAUNCH INTERFACE</p><h1>RULE<br /><i>THE SIGNAL.</i></h1><span>100 public Crowns.<br />One screen at a time.</span><div className={styles.pill}>NO PAYMENTS LIVE</div></div>
      <div className={styles.scene} style={{ transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}><div className={styles.ring}><Orbit /></div><div className={styles.backplate} /><div className={styles.throne}><div className={styles.throneHeader}>CROWN // 001 <span>READY</span></div><Crown /><h2>THE<br />SCREEN</h2><div className={styles.throneFooter}><span>PUBLIC SIGNAL</span><span>2026</span></div></div><div className={styles.shadow} /></div>
    </section>
    <section className={styles.metrics}><div><b>01</b><span>single active<br />screen</span></div><div><b>100</b><span>status NFT<br />limit</span></div><div><b>80/20</b><span>verified payment<br />split</span></div><div><b>0</b><span>KOTS claims<br />this season</span></div></section>
    <footer className={styles.footer}><span>DESIGN STUDY B · 3D THRONE</span><span>Motion responds to pointer. Reduced motion stays still.</span></footer>
  </main>;
}
