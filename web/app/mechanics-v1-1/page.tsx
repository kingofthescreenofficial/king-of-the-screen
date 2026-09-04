import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, ArrowLeft, Check, CircleDollarSign, Crown, Eye, Gem, LockKeyhole, Orbit, ShieldCheck, Sparkles, WalletCards } from "lucide-react";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "KOTS Mechanics v1.1 | Draft",
  description: "A discussion draft explaining the King of the Screen mechanics.",
  robots: { index: false, follow: false },
};

const priceMilestones = [
  { number: "01", price: "$2", label: "Старт" },
  { number: "26", price: "$95", label: "Первые 26 правлений" },
  { number: "50", price: "$921", label: "Середина пути" },
  { number: "75", price: "$10,295", label: "Зона статуса" },
  { number: "100", price: "$115,040", label: "Финальный трон" },
];

export default function MechanicsV11Page() {
  return (
    <main className={styles.page}>
      <div className={styles.noise} aria-hidden="true" />
      <div className={styles.orbit} aria-hidden="true"><Orbit /></div>

      <nav className={styles.nav} aria-label="Навигация">
        <Link href="/" className={styles.backLink}>
          <ArrowLeft size={15} aria-hidden="true" />
          <span>COMING SOON</span>
        </Link>
        <span className={styles.version}>MECHANICS V1.1</span>
      </nav>

      <section className={styles.hero} aria-labelledby="mechanics-title">
        <div className={styles.draftMark}><span /> DRAFT FOR DISCUSSION</div>
        <p className={styles.kicker}>KING OF THE SCREEN</p>
        <h1 id="mechanics-title">100 KINGS. ONE EXPERIMENT.</h1>
        <p className={styles.lead}>
          Мы проверяем, способен ли публичный аукцион статуса, контента и редких цифровых артефактов
          собрать $1,000,000 без внешнего инвестора.
        </p>
        <div className={styles.heroFacts}>
          <div><strong>100</strong><span>правлений</span></div>
          <div><strong>100</strong><span>статусных NFT</span></div>
          <div><strong>$1M</strong><span>цель cold wallet</span></div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="premise-title">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionNumber}>01</span>
          <div>
            <p className={styles.eyebrow}>ИДЕЯ</p>
            <h2 id="premise-title">Один экран, один Король</h2>
          </div>
        </div>
        <div className={styles.premiseGrid}>
          <article className={styles.featureCard}>
            <span className={styles.iconFrame}><Crown size={22} /></span>
            <h3>Правление</h3>
            <p>Король получает экран для своего изображения, сообщения или проекта. Следующий участник занимает экран по следующей цене.</p>
          </article>
          <article className={styles.featureCard}>
            <span className={styles.iconFrame}><Gem size={22} /></span>
            <h3>Запись в архиве</h3>
            <p>После окончательного расчёта правление получает номер и один из 100 цифровых статусных NFT.</p>
          </article>
          <article className={styles.featureCard}>
            <span className={styles.iconFrame}><Eye size={22} /></span>
            <h3>Публичная история</h3>
            <p>Каждое правление становится частью видимой истории эксперимента. Номера NFT не повторяются.</p>
          </article>
        </div>
      </section>

      <section className={`${styles.section} ${styles.priceSection}`} aria-labelledby="price-title">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionNumber}>02</span>
          <div>
            <p className={styles.eyebrow}>ЛЕСТНИЦА</p>
            <h2 id="price-title">Цена растёт вместе с историей</h2>
          </div>
        </div>
        <p className={styles.sectionIntro}>Старт доступен. Финальные места становятся редкими и дорогими. Таблица цен фиксирована заранее.</p>
        <div className={styles.milestoneRail}>
          {priceMilestones.map((milestone, index) => (
            <div className={styles.milestone} key={milestone.number}>
              <span className={styles.milestoneDot}>{index + 1}</span>
              <span className={styles.milestoneNumber}>KING {milestone.number}</span>
              <strong>{milestone.price}</strong>
              <span>{milestone.label}</span>
            </div>
          ))}
        </div>
        <div className={styles.totalCard}>
          <div>
            <p>Весь путь из 100 правлений</p>
            <strong>$1,250,000</strong>
          </div>
          <p>Это валовой оборот модели. Он построен так, чтобы 80% составили $1,000,000 для cold wallet.</p>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="flow-title">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionNumber}>03</span>
          <div>
            <p className={styles.eyebrow}>ДВИЖЕНИЕ СРЕДСТВ</p>
            <h2 id="flow-title">Что происходит после подтверждённой оплаты</h2>
          </div>
        </div>
        <div className={styles.flow}>
          <div className={styles.flowOrigin}>
            <span className={styles.iconFrame}><WalletCards size={23} /></span>
            <strong>Оплата трона</strong>
            <span>Сумма в SOL соответствует опубликованной USD-цене</span>
          </div>
          <ArrowDown className={styles.flowArrow} aria-hidden="true" />
          <div className={styles.splitGrid}>
            <article className={styles.treasuryCard}>
              <span>80%</span>
              <CircleDollarSign size={23} aria-hidden="true" />
              <h3>Cold wallet</h3>
              <p>Движение к цели эксперимента. Цель, $1,000,000.</p>
            </article>
            <article className={styles.vaultCard}>
              <span>20%</span>
              <LockKeyhole size={23} aria-hidden="true" />
              <h3>KOTS Vault</h3>
              <p>Публичный резерв для будущих операций с ликвидностью и KOTS.</p>
            </article>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.kotsSection}`} aria-labelledby="kots-title">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionNumber}>04</span>
          <div>
            <p className={styles.eyebrow}>KOTS VAULT</p>
            <h2 id="kots-title">Ликвидность, а не обещание цены</h2>
          </div>
        </div>
        <div className={styles.kotsGrid}>
          <div className={styles.kotsStatement}>
            <Sparkles size={28} aria-hidden="true" />
            <p>В версии 1.1 покупка трона не начисляет KOTS покупателю. Она даёт правление и NFT.</p>
            <p>20% оплаты накапливаются в Vault. После юридической и технической готовности Vault работает по публичной политике.</p>
          </div>
          <div className={styles.operations}>
            <div><span>12%</span><p>Покупка KOTS на DEX по фактической рыночной цене.</p></div>
            <div><span>8%</span><p>SOL-сторона пула KOTS/SOL для торговли.</p></div>
            <div><span><LockKeyhole size={15} /></span><p>Остаток KOTS хранится в публичном timelock-резерве.</p></div>
          </div>
        </div>
        <div className={styles.ruleBox}>
          <ShieldCheck size={20} aria-hidden="true" />
          <p><strong>Честное правило:</strong> No price, profit, or liquidity is guaranteed. Операции Vault видны публично, но результат зависит от рынка.</p>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="nft-title">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionNumber}>05</span>
          <div>
            <p className={styles.eyebrow}>КОЛЛЕКЦИЯ</p>
            <h2 id="nft-title">100 NFT, без повторов</h2>
          </div>
        </div>
        <div className={styles.nftPanel}>
          <div className={styles.nftSeal}><Crown size={42} aria-hidden="true" /><span>1 / 100</span></div>
          <div>
            <h3>NFT подтверждает правление</h3>
            <p>Он хранит номер Короля, время правления, визуальный след и ссылку на подтверждённую транзакцию. NFT не даёт доход, KOTS или долю в Vault.</p>
          </div>
          <ul>
            <li><Check size={16} aria-hidden="true" /> Один номер на одно подтверждённое правление</li>
            <li><Check size={16} aria-hidden="true" /> Чеканка только после расчёта</li>
            <li><Check size={16} aria-hidden="true" /> Серия закрывается после NFT №100</li>
          </ul>
        </div>
      </section>

      <section className={styles.disclosure} aria-label="Статус запуска">
        <p>СТАТУС ПРОЕКТА</p>
        <h2>Это черновик для обсуждения.</h2>
        <span>Оплаты, NFT и операции KOTS выключены. Эта страница не является предложением инвестировать, купить токен или ждать доход.</span>
      </section>

      <footer className={styles.footer}>
        <span>KING OF THE SCREEN · MECHANICS V1.1</span>
        <span>TEMPORARY DISCUSSION PAGE</span>
      </footer>
    </main>
  );
}
