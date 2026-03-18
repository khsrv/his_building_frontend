import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Политика конфиденциальности — Hisob Building",
  description: "Политика обработки персональных данных пользователей CRM-системы Hisob Building.",
};

const sections = [
  {
    title: "1. Общие положения",
    body: "Настоящая Политика конфиденциальности определяет порядок сбора, хранения и обработки персональных данных пользователей CRM-системы Hisob Building. Используя платформу, вы соглашаетесь с условиями данной политики.",
  },
  {
    title: "2. Какие данные мы собираем",
    body: "В ходе работы с платформой мы можем собирать следующие данные: имя и фамилия пользователя; адрес электронной почты; контактный номер телефона; данные о сессии и действиях в системе (журнал событий); IP-адрес и информация об устройстве и браузере.",
  },
  {
    title: "3. Цели обработки данных",
    body: "Собранные данные используются исключительно для: предоставления доступа к функциям платформы и идентификации пользователей; управления правами доступа и ролями; обеспечения безопасности системы и предотвращения мошенничества; улучшения качества и функциональности сервиса; связи с пользователями по вопросам работы системы.",
  },
  {
    title: "4. Хранение и защита данных",
    body: "Данные хранятся на защищённых серверах. Мы применяем шифрование при передаче данных (TLS/HTTPS), ограничиваем доступ к данным только авторизованным сотрудникам и не передаём персональные данные третьим лицам без явного согласия пользователя, за исключением случаев, прямо предусмотренных законодательством Республики Таджикистан.",
  },
  {
    title: "5. Файлы cookie",
    body: "Платформа использует httpOnly cookie-файлы для поддержания сессии пользователя и обеспечения безопасности аутентификации. Эти файлы не доступны из JavaScript и не передаются третьим лицам. Отключение cookie в браузере приведёт к невозможности авторизации в системе.",
  },
  {
    title: "6. Права пользователей",
    body: "Вы имеете право: запросить доступ к своим персональным данным, хранящимся в системе; потребовать исправления неточных или устаревших данных; запросить удаление своих персональных данных (при условии отсутствия законных оснований для их хранения); отозвать согласие на обработку данных. Для реализации любого из указанных прав обратитесь к нам по контактным данным ниже.",
  },
  {
    title: "7. Изменения политики",
    body: "Мы оставляем за собой право вносить изменения в настоящую Политику конфиденциальности. Актуальная версия всегда доступна по данному адресу. При существенных изменениях, затрагивающих права пользователей, мы уведомим об этом дополнительно.",
  },
  {
    title: "8. Контакты",
    body: "По вопросам, связанным с обработкой персональных данных, обращайтесь:",
    contacts: true,
  },
];

export default function PrivacyPage() {
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
            Политика конфиденциальности
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
            <Link href="/privacy" className="text-xs text-amber-400/80 hover:text-amber-400">
              Политика конфиденциальности
            </Link>
            <span className="text-zinc-700">·</span>
            <Link href="/terms" className="text-xs text-zinc-500 hover:text-zinc-300">
              Условия использования
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
