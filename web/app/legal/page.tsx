import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "KOTS Pre-launch Legal Drafts",
  description: "Pre-launch legal and content policy drafts for King of the Screen.",
  robots: { index: false, follow: false },
};

export default function LegalPage() {
  return (
    <main className="min-h-screen bg-[#08080c] px-5 py-8 font-sans text-zinc-200 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <nav className="mb-10 flex items-center justify-between border-b border-zinc-800 pb-5 text-xs font-bold tracking-[0.16em] text-zinc-400">
          <Link href="/" className="inline-flex items-center gap-2 hover:text-yellow-300"><ArrowLeft size={15} />COMING SOON</Link>
          <span>PRE-LAUNCH DRAFTS</span>
        </nav>
        <section className="rounded-2xl border border-yellow-400/35 bg-yellow-400/5 p-6">
          <div className="flex gap-3"><ShieldCheck className="mt-1 shrink-0 text-yellow-300" /><div>
            <h1 className="text-2xl font-black text-yellow-200">Документы первого сезона</h1>
            <p className="mt-2 leading-7 text-zinc-300">Оплаты, NFT mint, KOTS claim и рыночные операции выключены. Это pre-launch черновики. Они не заменяют финальные условия с данными оператора, контактами, применимым правом и правилами возврата.</p>
          </div></div>
        </section>

        <article className="mt-10 space-y-8 leading-7 text-zinc-300">
          <section><h2 className="text-xl font-bold text-white">1. Что покупает участник</h2><p>Участник оплачивает одно публичное размещение на главном экране. Размещение включает отображаемые имя, сообщение, изображение и ссылку. Правление остается активным до подтвержденного размещения следующего участника по следующей опубликованной цене.</p><p className="mt-3">После окончательного расчета и соблюдения правил контента участнику предназначается один статусный NFT из серии 100. NFT фиксирует факт правления. Он не дает долю в выручке, право на прибыль, дивиденды, выкуп, KOTS или средства Operations Vault.</p></section>
          <section><h2 className="text-xl font-bold text-white">2. Цена и серия</h2><p>Цена следующего правления публикуется сервером до оплаты. Серия содержит максимум 100 подтвержденных правлений. Оплата проходит в SOL. USD-цена служит для отображения. Точная сумма SOL фиксируется в подписанном payment intent на ограниченный срок.</p></section>
          <section><h2 className="text-xl font-bold text-white">3. KOTS</h2><p>Первый сезон не включает KOTS claim, airdrop, liquidity, выкуп токена, торговые операции или обещание будущего KOTS. Участие в первом сезоне не создает права требовать KOTS.</p></section>
          <section><h2 className="text-xl font-bold text-white">4. Риски</h2><p>SOL-транзакции необратимы после подтверждения сети. Стоимость SOL меняется. NFT и цифровые активы не имеют гарантированной цены или ликвидности. Проект не обещает доход, охват, число просмотров, минимальный срок правления или медийный результат.</p><p className="mt-3">Solana, кошельки, RPC-провайдеры и NFT-инфраструктура являются внешними техническими системами. Участник использует собственный кошелек и никогда не передает seed phrase или приватный ключ.</p></section>
          <section><h2 className="text-xl font-bold text-white">5. Контент</h2><p>Разрешены оригинальные изображения, сообщения и ссылки, на которые у участника есть права. Запрещены сексуальная эксплуатация детей, угрозы, насилие, терроризм, ненависть, фишинг, malware, wallet drainer, незаконные товары, финансовое мошенничество и нарушения прав третьих лиц.</p><p className="mt-3">Контент проверяется до публикации. Оператор вправе снять материал при нарушении правил, требовании закона, жалобе правообладателя или угрозе безопасности. Финальная версия включит процедуру жалоб и contact point.</p></section>
          <section><h2 className="text-xl font-bold text-white">6. Перед запуском</h2><p>До включения оплат проект опубликует данные оператора, адрес для notices, email, применимое право, forum, правила возврата и ограниченные юрисдикции. Условия checkout будут требовать отдельного подтверждения участника.</p></section>
        </article>
      </div>
    </main>
  );
}
