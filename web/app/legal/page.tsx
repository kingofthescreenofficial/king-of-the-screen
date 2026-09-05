import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FileText, LockKeyhole, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "KOTS Pre-Launch Notice",
  description: "Current pre-launch status and public policies for King of the Screen.",
  robots: { index: false, follow: false },
};

const noFinancialFeatures = [
  "Оплаты в SOL",
  "Подключение и подписи кошелька",
  "Загрузка публичного контента",
  "Чеканка или доставка NFT",
  "KOTS, airdrop, claim и рыночные операции",
];

export default function LegalPage() {
  return (
    <main className="min-h-screen bg-[#08080c] px-5 py-8 font-sans text-zinc-200 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <nav className="mb-10 flex items-center justify-between border-b border-zinc-800 pb-5 text-xs font-bold tracking-[0.16em] text-zinc-400">
          <Link href="/" className="inline-flex items-center gap-2 hover:text-yellow-300"><ArrowLeft size={15} />PRE-LAUNCH</Link>
          <span>PUBLIC NOTICE</span>
        </nav>

        <section className="rounded-2xl border border-yellow-400/35 bg-yellow-400/5 p-6">
          <div className="flex gap-3">
            <ShieldCheck className="mt-1 shrink-0 text-yellow-300" />
            <div>
              <h1 className="text-2xl font-black text-yellow-200">King of the Screen находится в pre-launch</h1>
              <p className="mt-2 leading-7 text-zinc-300">Сайт показывает будущий творческий проект. Сейчас он не принимает деньги и не создаёт цифровые активы для посетителей.</p>
            </div>
          </div>
        </section>

        <article className="mt-10 space-y-9 leading-7 text-zinc-300">
          <section>
            <h2 className="flex items-center gap-2 text-xl font-bold text-white"><LockKeyhole size={19} className="text-yellow-300" />Что выключено</h2>
            <ul className="mt-3 space-y-2 text-zinc-300">
              {noFinancialFeatures.map((feature) => <li key={feature}>• {feature}</li>)}
            </ul>
            <p className="mt-4">Посещение сайта не создаёт право на трон, NFT, KOTS, airdrop, whitelist, возврат, ликвидность, доход или будущий доступ.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">Нет финансового предложения</h2>
            <p className="mt-3">Сайт не предлагает инвестиции, ценные бумаги, токены, торговые услуги, финансовый продукт или участие в будущей прибыли. Любой будущий платный сервис потребует отдельных условий, точного описания продукта и явного подтверждения на checkout.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">Приватность</h2>
            <p className="mt-3">Текущая версия хранит только техническую телеметрию посещений: путь страницы и время. Она не запрашивает имя, email, адрес кошелька, платежные данные, изображение, seed phrase или приватный ключ. Хостинг и защитные сервисы обрабатывают стандартные серверные журналы.</p>
            <p className="mt-3">Проект не обещает анонимность посетителям, участникам или операторам. Блокчейн, провайдеры, суды, регуляторы и закон могут раскрывать или требовать данные.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">Контент и безопасность</h2>
            <p className="mt-3">Публичная загрузка контента закрыта. Будущий продукт не будет принимать незаконный контент, фишинг, wallet drainer, malware, финансовое мошенничество, угрозы или материалы с нарушением прав третьих лиц.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">KOTS</h2>
            <p className="mt-3">KOTS не входит в текущий сайт и первый pre-launch этап. Сайт не создаёт, не раздаёт, не продвигает, не выкупает и не обеспечивает ликвидность KOTS. Старый Pump.fun mint не относится к текущему продукту.</p>
          </section>

          <section className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-5">
            <h2 className="flex items-center gap-2 text-lg font-bold text-white"><FileText size={18} className="text-yellow-300" />Перед платным запуском</h2>
            <p className="mt-2">Будут опубликованы финальные условия сервиса, правила возвратов, контакт для обращений, правила контента, порядок жалоб, privacy notice и список обслуживаемых юрисдикций. До этого момента платёжный поток останется выключенным.</p>
          </section>
        </article>
      </div>
    </main>
  );
}
