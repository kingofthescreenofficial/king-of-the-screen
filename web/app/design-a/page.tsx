import Link from "next/link";
import { ArrowLeft, Crown, ShieldCheck } from "lucide-react";
import styles from "./page.module.css";

export default function DesignAPage() {
  return <main className={styles.page}>
    <nav className={styles.nav}><Link href="/" aria-label="Back to coming soon"><ArrowLeft size={16} /> PREVIEW A</Link><span>KING OF THE SCREEN</span><span>01 / 100</span></nav>
    <section className={styles.hero}>
      <p className={styles.kicker}>A PUBLIC STATUS EXPERIMENT</p>
      <h1>THE SCREEN<br /><em>HAS A RULER.</em></h1>
      <p className={styles.copy}>One public screen holds one name, one image and one message. The next verified Crown replaces the last.</p>
      <div className={styles.screen}><div className={styles.screenTop}><span>LIVE CROWN</span><span>SEASON I</span></div><div className={styles.crown}><Crown /></div><p>THE THRONE IS<br />BEING PREPARED</p><div className={styles.screenBottom}><span>PUBLIC RECORD</span><span>100 CROWNS</span></div></div>
    </section>
    <section className={styles.ledger} aria-label="The Crown record"><p>THE CROWN LEDGER</p><div><strong>100</strong><span>status records<br />in one closed series</span></div><div><strong>80 / 20</strong><span>treasury / operations<br />in each verified payment</span></div><div><strong>0</strong><span>KOTS claims in<br />the first season</span></div></section>
    <section className={styles.statement}><ShieldCheck size={19} /><p>Preview only. Payments, NFT mint and token operations stay disabled until the public launch checklist is complete.</p></section>
    <footer className={styles.footer}>DESIGN STUDY A · EDITORIAL THRONE <Link href="/design-b">VIEW 3D VERSION</Link></footer>
  </main>;
}
