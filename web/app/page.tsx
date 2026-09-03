import { Crown, Mail } from "lucide-react";

export default function HomePage() {
  return (
    <main className="coming-soon-shell">
      <div className="coming-soon-grid" aria-hidden="true" />
      <div className="coming-soon-orbit coming-soon-orbit-one" aria-hidden="true" />
      <div className="coming-soon-orbit coming-soon-orbit-two" aria-hidden="true" />

      <section className="coming-soon-content" aria-labelledby="coming-soon-title">
        <header className="coming-soon-brand">
          <span className="coming-soon-brand-mark" aria-hidden="true"><Crown size={18} strokeWidth={1.7} /></span>
          <span>KING OF THE SCREEN</span>
        </header>
        <div className="coming-soon-sigil" aria-hidden="true">
          <div className="coming-soon-sigil-glow" />
          <Crown size={72} strokeWidth={1.15} />
        </div>
        <p className="coming-soon-eyebrow">THE THRONE IS BEING PREPARED</p>
        <h1 id="coming-soon-title">KING OF THE SCREEN</h1>
        <p className="coming-soon-copy">One screen. One ruler. A public experiment in status, art, and competition.</p>
        <div className="coming-soon-status" role="status">
          <span className="coming-soon-status-dot" aria-hidden="true" />
          <span>LAUNCHING SOON</span>
        </div>
        <a className="coming-soon-contact" href="mailto:kingofthescreen.official@gmail.com">
          <Mail size={15} aria-hidden="true" />
          <span>CONTACT THE COURT</span>
        </a>
        <p className="coming-soon-note">Public launch details will appear here. Payments, token activity, and NFT activity are not available.</p>
      </section>

      <footer className="coming-soon-footer">
        <span>© 2026 KING OF THE SCREEN</span>
        <span>PRE-LAUNCH BROADCAST</span>
      </footer>
    </main>
  );
}
