import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Условия использования — Hisob Building",
  description: "Условия использования CRM-системы Hisob Building для управления строительными объектами.",
};

const sections = [
  {
    title: "1. Принятие условий",
    body: "Использование платформы Hisob Building означает полное и безусловное принятие настоящих Условий использования. Если вы не согласны с какими-либо положениями, пожалуйста, прекратите использование сервиса.",
  },
  {
    title: "2. Описание сервиса",
    body: "Hisob Building — CRM-система для управления строительными объектами, предоставляемая в режиме SaaS. Платформа включает модули: визуальная шахматка квартир, воронка продаж и CRM, финансовый учёт и кассы, управление складом и материалами, база подрядчиков и наряды, аналитика и KPI-отчёты, SMS-уведомления.",
  },
  {
    title: "3. Регистрация и учётные записи",
    body: "Доступ к платформе предоставляется авторизованным пользователям организации-клиента. Вы несёте полную ответственность за сохранность своих учётных данных и за все действия, совершённые под вашей учётной записью. При подозрении на несанкционированный доступ немедленно уведомьте администратора системы.",
  },
  {
    title: "4. Обязательства пользователя",
    body: "При использовании платформы вы обязуетесь: использовать сервис только в законных целях; не передавать учётные данные третьим лицам; не предпринимать попыток несанкционированного доступа к системе или данным других пользователей; не размещать в системе незаконный, вредоносный или вводящий в заблуждение контент; соблюдать законодательство Республики Таджикистан при работе с персональными данными клиентов.",
  },
  {
    title: "5. Интеллектуальная собственность",
    body: "Все права на программное обеспечение, дизайн, логотипы, торговые марки, базы данных и материалы платформы принадлежат Hisob Building. Несанкционированное копирование, воспроизведение, распространение или создание производных продуктов на основе платформы строго запрещено без письменного согласия правообладателя.",
  },
  {
    title: "6. Доступность сервиса",
    body: "Мы прилагаем все разумные усилия для поддержания бесперебойной работы системы. Тем не менее мы не гарантируем 100% доступность и вправе проводить плановые технические работы с предварительным уведомлением пользователей. Нарушения в работе, вызванные обстоятельствами непреодолимой силы или действиями третьих лиц, не являются нарушением настоящих Условий.",
  },
  {
    title: "7. Ограничение ответственности",
    body: "Платформа предоставляется «как есть». Hisob Building не несёт ответственности за косвенные, случайные или последовательные убытки, возникшие в результате использования или невозможности использования сервиса, включая потерю данных, упущенную выгоду или деловую репутацию. Максимальная ответственность ограничена суммой, фактически уплаченной пользователем за использование сервиса.",
  },
  {
    title: "8. Изменение условий",
    body: "Hisob Building вправе в любое время изменять настоящие Условия использования. Изменения вступают в силу с момента публикации обновлённой версии по данному адресу. Продолжение использования сервиса после публикации изменений означает безусловное принятие новых условий.",
  },
  {
    title: "9. Применимое право",
    body: "Настоящие Условия регулируются законодательством Республики Таджикистан. Все споры, возникающие из настоящих Условий, подлежат разрешению в судебном порядке по месту нахождения Hisob Building.",
  },
  {
    title: "10. Контакты",
    body: "По вопросам, связанным с Условиями использования, обращайтесь:",
    contacts: true,
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center border-b border-white/[0.06] bg-[#09090b]/90 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-3">
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-70">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-amber-400 text-[10px] font-bold text-zinc-900">H</span>
            <span className="text-sm font-medium text-zinc-400">Hisob Building</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:border-white/[0.15] hover:text-zinc-200"
          >
            ← Назад
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-3xl px-6 pb-20 pt-12">
        {/* Title block */}
        <div className="mb-10 border-b border-white/[0.06] pb-8">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-widest text-amber-400/60">
            Юридическая информация
          </p>
          <h1 className="mb-3 text-3xl font-semibold tracking-tight">
            Условия использования
          </h1>
          <p className="text-sm text-zinc-500">
            Последнее обновление: март 2025 г.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {sections.map((s) => (
            <section key={s.title}>
              <h2 className="mb-3 text-base font-semibold text-zinc-100">{s.title}</h2>
              <p className="text-sm leading-relaxed text-zinc-400">{s.body}</p>
              {s.contacts && (
                <ul className="mt-3 space-y-2 text-sm text-zinc-400">
                  <li>
                    <span className="text-zinc-600">Telegram: </span>
                    <a
                      href="https://t.me/yakubiam"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-400 hover:underline"
                    >
                      @yakubiam
                    </a>
                  </li>
                  <li>
                    <span className="text-zinc-600">Телефон / WhatsApp: </span>
                    <a href="tel:+992712056006" className="text-amber-400 hover:underline">
                      +992 71 205-60-06
                    </a>
                  </li>
                  <li>
                    <span className="text-zinc-600">E-mail: </span>
                    <a
                      href="mailto:yakubiabduqahhor@gmail.com"
                      className="text-amber-400 hover:underline"
                    >
                      yakubiabduqahhor@gmail.com
                    </a>
                  </li>
                </ul>
              )}
            </section>
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-12 rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 text-center">
          <p className="text-xs text-zinc-600">
            © 2025 Hisob Building. Все права защищены.
          </p>
          <div className="mt-2 flex items-center justify-center gap-4">
            <Link href="/privacy" className="text-xs text-zinc-500 hover:text-zinc-300">
              Политика конфиденциальности
            </Link>
            <span className="text-zinc-700">·</span>
            <Link href="/terms" className="text-xs text-amber-400/80 hover:text-amber-400">
              Условия использования
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
