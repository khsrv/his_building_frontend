"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { routes } from "@/shared/constants/routes";

// ─── Translations ─────────────────────────────────────────────────────────────

const DICT = {
  ru: {
    nav_badge: "CRM для застройщиков", nav_login: "Войти",
    hero_badge: "MVP · Готово к работе",
    hero_h1: "Управление стройкой", hero_h1b: "без хаоса в таблицах",
    hero_desc: "Единая система для застройщиков: шахматка квартир, CRM‑воронка, финансовый учёт, склад и аналитика. Все данные на одном экране.",
    hero_cta: "Войти в систему", hero_more: "Смотреть возможности",
    stats: [["10","модулей"],["9","ролей"],["4","языка"],["40+","компонентов"]],
    feat_tag: "Возможности", feat_title: "Всё что нужно застройщику",
    feat: [
      ["⬛","Шахматка квартир","Визуальная сетка по блокам и этажам. Свободно/бронь/продано — одним взглядом."],
      ["👥","CRM и воронка","Клиенты, сделки, этапы продаж. Kanban с drag-and-drop по стадиям."],
      ["💰","Финансы и счета","Кассы, счета, транзакции, журнал. Отчёты по доходам и расходам."],
      ["📋","Договоры и рассрочка","График платежей, контроль просрочки, PDF-генерация."],
      ["📦","Склад","Материалы, движение товара, поставщики, история остатков."],
      ["🔧","Подрядчики","База исполнителей, наряды, учёт работ и расчётов."],
      ["📊","Аналитика и KPI","Дашборды, отчёты по объектам, динамика продаж."],
      ["📱","SMS и шаблоны","Уведомления клиентам, массовые рассылки, редактор шаблонов."],
      ["🌐","4 языка","Русский, английский, узбекский, таджикский без перезагрузки."],
    ],
    how_tag: "Как работает", how_title: "Три шага до контроля над стройкой",
    how_steps: [
      ["01","Настройте объект","Добавьте ЖК, создайте блоки и квартиры. Система автоматически построит шахматку."],
      ["02","Работайте с клиентами","Бронируйте квартиры, оформляйте сделки, задавайте графики платежей."],
      ["03","Контролируйте всё","Финансы, склад, подрядчики и аналитика — в реальном времени."],
    ],
    sl_tag: "Подробнее", sl_title: "Ключевые функции",
    sl_tabs: ["Объекты","CRM","Финансы","Платежи","Аналитика"],
    sl_data: [
      { title:"Шахматка квартир", desc:"Визуальная карта всего объекта. Каждая ячейка — квартира со статусом, площадью и ценой.", pts:["Фильтр по блоку, этажу, статусу","Быстрое бронирование кликом","Экспорт в PDF и Excel"] },
      { title:"Воронка продаж",   desc:"Kanban-доска с полным путём клиента: от первого звонка до подписания договора.",           pts:["Drag-and-drop между стадиями","История взаимодействий","Назначение менеджеров"] },
      { title:"Финансовый учёт",  desc:"Кассы, банковские счета, транзакции и журнал. Курсы НБТ обновляются автоматически.",       pts:["Мультивалютность TJS/USD/RUB","Курсы НБТ в реальном времени","Отчёты доходов и расходов"] },
      { title:"График рассрочки", desc:"Автоматический контроль графика платежей. Просроченные взносы подсвечиваются.",            pts:["Визуальный таймлайн взносов","SMS при просрочке","Подтверждение оплаты"] },
      { title:"KPI и отчёты",     desc:"Дашборды с ключевыми метриками по всем объектам и сотрудникам.",                          pts:["Отчёты по объектам и периодам","Рейтинг менеджеров","Экспорт в Excel"] },
    ],
    ct_tag: "Контакты", ct_title: "Подключить систему",
    ct_desc: "Напишите нам, чтобы получить доступ или узнать подробнее о возможностях платформы.",
    ct_tg: "Telegram", ct_phone: "Телефон / WhatsApp", ct_email: "Почта",
    cta_tag: "Начните прямо сейчас", cta_title: "Ваши данные уже ждут",
    cta_desc: "Войдите в систему и начните управлять объектами.",
    cta_btn: "Войти в Hisob Building",
    footer: "CRM-система для управления строительными объектами · Таджикистан",
    footer_copy: "© 2025 Hisob Building. Все права защищены.",
    footer_privacy: "Политика конфиденциальности",
    footer_terms: "Условия использования",
  },
  en: {
    nav_badge: "CRM for developers", nav_login: "Sign In",
    hero_badge: "MVP · Ready to use",
    hero_h1: "Construction management", hero_h1b: "without spreadsheet chaos",
    hero_desc: "All-in-one platform for real estate developers: apartment grid, sales CRM, finance, warehouse and analytics — all on one screen.",
    hero_cta: "Sign In", hero_more: "See features",
    stats: [["10","modules"],["9","roles"],["4","languages"],["40+","components"]],
    feat_tag: "Features", feat_title: "Everything a developer needs",
    feat: [
      ["⬛","Apartment Grid","Visual map by block and floor. Free/booked/sold — at a glance."],
      ["👥","CRM & Pipeline","Clients, deals, sales stages. Kanban with drag-and-drop."],
      ["💰","Finance & Accounts","Cash desks, accounts, transactions, ledger. Income and expense reports."],
      ["📋","Contracts & Installments","Payment schedule, overdue tracking, PDF generation."],
      ["📦","Warehouse","Materials, stock movements, suppliers, inventory history."],
      ["🔧","Contractors","Contractor base, work orders, job tracking and settlements."],
      ["📊","Analytics & KPI","Dashboards, property reports, sales dynamics."],
      ["📱","SMS & Templates","Client notifications, bulk sends, template editor."],
      ["🌐","4 Languages","Russian, English, Uzbek, Tajik — switch without reload."],
    ],
    how_tag: "How it works", how_title: "Three steps to full control",
    how_steps: [
      ["01","Set up your property","Add a complex, create blocks and apartments. The system builds the grid automatically."],
      ["02","Work with clients","Book apartments, close deals, set payment schedules."],
      ["03","Control everything","Finance, warehouse, contractors and analytics — in real time."],
    ],
    sl_tag: "Details", sl_title: "Key features",
    sl_tabs: ["Grid","CRM","Finance","Payments","Analytics"],
    sl_data: [
      { title:"Apartment Grid",      desc:"A visual map of the entire property. Each cell is an apartment with status, area and price.", pts:["Filter by block, floor, status","Quick booking by click","Export to PDF and Excel"] },
      { title:"Sales Pipeline",      desc:"Kanban board with the full client journey: from first call to signed contract.",               pts:["Drag-and-drop between stages","Interaction history","Manager assignment"] },
      { title:"Financial Accounting",desc:"Cash desks, bank accounts, transactions and ledger. NBT rates updated automatically.",         pts:["Multi-currency TJS/USD/RUB","Live NBT exchange rates","Income and expense reports"] },
      { title:"Installment Schedule",desc:"Automatic payment schedule control. Overdue installments are highlighted.",                    pts:["Visual payment timeline","SMS on overdue","Payment confirmation"] },
      { title:"KPI & Reports",       desc:"Dashboards with key metrics for all properties and staff.",                                    pts:["Reports by property and period","Manager rankings","Excel export"] },
    ],
    ct_tag: "Contact", ct_title: "Connect the system",
    ct_desc: "Reach out to get access or learn more about the platform's capabilities.",
    ct_tg: "Telegram", ct_phone: "Phone / WhatsApp", ct_email: "Email",
    cta_tag: "Get started", cta_title: "Your data is waiting",
    cta_desc: "Sign in and start managing your properties.",
    cta_btn: "Sign in to Hisob Building",
    footer: "CRM system for construction management · Tajikistan",
    footer_copy: "© 2025 Hisob Building. All rights reserved.",
    footer_privacy: "Privacy Policy",
    footer_terms: "Terms of Use",
  },
  uz: {
    nav_badge: "Quruvchilar uchun CRM", nav_login: "Kirish",
    hero_badge: "MVP · Ishga tayyor",
    hero_h1: "Qurilishni boshqarish", hero_h1b: "jadvallarsiz va tartibli",
    hero_desc: "Quruvchilar uchun yagona tizim: shaxmatka, CRM-voronka, moliya, ombor va tahlil. Barcha ma'lumot bir ekranda.",
    hero_cta: "Tizimga kirish", hero_more: "Imkoniyatlarni ko'rish",
    stats: [["10","modul"],["9","rol"],["4","til"],["40+","komponent"]],
    feat_tag: "Imkoniyatlar", feat_title: "Quruvchiga kerak bo'lgan hamma narsa",
    feat: [
      ["⬛","Xonadonlar shaxmatkasi","Blok va qavatlar bo'yicha vizual xarita. Bepul/bron/sotilgan — bir qarashda."],
      ["👥","CRM va voronka","Mijozlar, bitimlar, savdo bosqichlari. Drag-and-drop Kanban."],
      ["💰","Moliya va hisoblar","Kassalar, hisoblar, tranzaktsiyalar. Daromad va xarajat hisobotlari."],
      ["📋","Shartnomalar va bo'lib to'lash","To'lov jadvali, muddati o'tganlarni nazorat, PDF generatsiya."],
      ["📦","Ombor","Materiallar, tovar harakati, yetkazib beruvchilar."],
      ["🔧","Pudratchilar","Ijrochilar bazasi, ish buyurtmalari, hisob-kitob."],
      ["📊","Tahlil va KPI","Dashboardlar, ob'ektlar bo'yicha hisobotlar."],
      ["📱","SMS va shablonlar","Mijozlarga bildirishnomalar, ommaviy yuborish."],
      ["🌐","4 til","Rus, ingliz, o'zbek, tojik — qayta yuklamasdan."],
    ],
    how_tag: "Qanday ishlaydi", how_title: "Nazoratga uch qadam",
    how_steps: [
      ["01","Ob'ektni sozlang","JK qo'shing, blok va xonadonlar yarating. Tizim shaxmatkani avtomatik quradi."],
      ["02","Mijozlar bilan ishlang","Xonadonlarni broning, bitimlar tuzing, to'lov jadvallari belgilang."],
      ["03","Hammasini nazorat qiling","Moliya, ombor, pudratchilar va tahlil — real vaqtda."],
    ],
    sl_tag: "Batafsil", sl_title: "Asosiy funksiyalar",
    sl_tabs: ["Shaxmatka","CRM","Moliya","To'lovlar","Tahlil"],
    sl_data: [
      { title:"Xonadonlar shaxmatkasi",  desc:"Butun ob'ektning vizual xaritasi. Har bir katak — holat, maydon va narxli xonadon.", pts:["Blok, qavat, holat bo'yicha filtr","Tezkor bron bosish bilan","PDF va Excel eksport"] },
      { title:"Savdo voronkasi",         desc:"To'liq mijoz yo'li: birinchi qo'ng'iroqdan shartnoma imzolashgacha Kanban.",        pts:["Bosqichlar orasida drag-and-drop","Muloqot tarixi","Menejerlarni tayinlash"] },
      { title:"Moliyaviy hisobdorlik",   desc:"Kassalar, bank hisoblar, tranzaktsiyalar. NBT kurslari avtomatik yangilanadi.",      pts:["Ko'p valyutalilik TJS/USD/RUB","NBT kurslari jonli","Daromad va xarajat hisobotlari"] },
      { title:"Bo'lib to'lash jadvali",  desc:"To'lov jadvalini avtomatik nazorat. Muddati o'tganlar ajratib ko'rsatiladi.",       pts:["Vizual to'lov jadvali","Muddati o'tganda SMS","To'lovni tasdiqlash"] },
      { title:"KPI va hisobotlar",       desc:"Barcha ob'ektlar va xodimlar bo'yicha asosiy ko'rsatkichlar dashboardi.",           pts:["Ob'ekt va davr bo'yicha hisobotlar","Menejerlar reytingi","Excel eksport"] },
    ],
    ct_tag: "Aloqa", ct_title: "Tizimga ulaning",
    ct_desc: "Kirish huquqini olish yoki platforma imkoniyatlari haqida ko'proq bilish uchun yozing.",
    ct_tg: "Telegram", ct_phone: "Telefon / WhatsApp", ct_email: "Pochta",
    cta_tag: "Hoziroq boshlang", cta_title: "Ma'lumotlaringiz kutmoqda",
    cta_desc: "Tizimga kiring va ob'ektlarni boshqarishni boshlang.",
    cta_btn: "Hisob Building'ga kirish",
    footer: "Qurilish loyihalarini boshqarish uchun CRM · Tojikiston",
    footer_copy: "© 2025 Hisob Building. Barcha huquqlar himoyalangan.",
    footer_privacy: "Maxfiylik siyosati",
    footer_terms: "Foydalanish shartlari",
  },
  tg: {
    nav_badge: "CRM барои созандагон", nav_login: "Ворид шудан",
    hero_badge: "MVP · Омода аст",
    hero_h1: "Идоракунии сохтмон", hero_h1b: "бидуни ҳуҷҷатбозӣ",
    hero_desc: "Низоми ягона барои созандагон: шатранҷ, воронкаи CRM, молия, анбор ва таҳлил. Ҳама маълумот дар як экран.",
    hero_cta: "Ворид шудан", hero_more: "Имкониятҳоро бинед",
    stats: [["10","модул"],["9","нақш"],["4","забон"],["40+","компонент"]],
    feat_tag: "Имкониятҳо", feat_title: "Ҳама чизе ки созанда ниёз дорад",
    feat: [
      ["⬛","Шатранҷи хонаҳо","Харитаи визуалӣ аз рӯи блок ва ошёна. Озод/банд/фурӯхта — бо як нигоҳ."],
      ["👥","CRM ва воронка","Муштариён, муомилаҳо, марҳилаҳои фурӯш. Kanban бо drag-and-drop."],
      ["💰","Молия ва ҳисобҳо","Кассаҳо, ҳисобҳо, муомилаҳо, дафтар. Ҳисоботи даромад ва хароҷот."],
      ["📋","Шартномаҳо ва қарздорӣ","Ҷадвали пардохт, назорати мӯҳлатгузашта, PDF-тавлид."],
      ["📦","Анбор","Маводҳо, ҳаракати мол, таъминкунандагон."],
      ["🔧","Пудратчиён","Бонки иҷрокунандагон, фармоишҳои кор, ҳисоббаробаркунӣ."],
      ["📊","Таҳлил ва KPI","Дашбордҳо, ҳисоботҳо аз рӯи объектҳо."],
      ["📱","SMS ва шаблонҳо","Огоҳиномаҳо, фиристодани оммавӣ."],
      ["🌐","4 забон","Русӣ, англисӣ, ӯзбекӣ, тоҷикӣ — бидуни бозсозӣ."],
    ],
    how_tag: "Чӣ тавр кор мекунад", how_title: "Се қадам то назорати пурра",
    how_steps: [
      ["01","Объектро танзим кунед","МҲ илова кунед, блокҳо ва хонаҳо созед. Система шатранҷро мекашад."],
      ["02","Бо муштариён кор кунед","Хонаҳоро банд кунед, муомилаҳо баркунед, ҷадвалҳои пардохт гузоред."],
      ["03","Ҳамаро назорат кунед","Молия, анбор, пудратчиён ва таҳлил — дар вақти воқеӣ."],
    ],
    sl_tag: "Муфассал", sl_title: "Функсияҳои асосӣ",
    sl_tabs: ["Шатранҷ","CRM","Молия","Пардохтҳо","Таҳлил"],
    sl_data: [
      { title:"Шатранҷи хонаҳо",    desc:"Харитаи визуалии тамоми объект. Ҳар хона — бо статус, масоҳат ва нарх.",       pts:["Филтр аз рӯи блок, ошёна, статус","Банди зуд бо клик","Экспорт ба PDF ва Excel"] },
      { title:"Воронкаи фурӯш",      desc:"Kanban-доска аз аввалин занг то имзои шартнома.",                               pts:["Drag-and-drop байни марҳилаҳо","Таърихи муошират","Таъини менеҷерон"] },
      { title:"Баҳисобгирии молиявӣ",desc:"Кассаҳо, ҳисобҳо, муомилаҳо. Нархҳои НБТ худкор навсозӣ мешаванд.",          pts:["Бисёрасъорӣ TJS/USD/RUB","Нархҳои НБТ дар вақти воқеӣ","Ҳисоботи даромад ва хароҷот"] },
      { title:"Ҷадвали қарздорӣ",    desc:"Назорати худкори ҷадвали пардохт. Пардохтҳои мӯҳлатгузашта ҷудо нишон дода мешаванд.", pts:["Ҷадвали визуалии пардохтҳо","SMS ҳангоми мӯҳлатгузашта","Тасдиқи пардохт"] },
      { title:"KPI ва ҳисоботҳо",    desc:"Дашбордҳо бо нишондиҳандаҳои асосии ҳамаи объектҳо.",                         pts:["Ҳисоботҳо аз рӯи объект ва давра","Рейтинги менеҷерон","Экспорт ба Excel"] },
    ],
    ct_tag: "Тамос", ct_title: "Системаро пайваст кунед",
    ct_desc: "Барои дастрасӣ ё маълумоти бештар дар бораи имкониятҳои платформа нависед.",
    ct_tg: "Telegram", ct_phone: "Телефон / WhatsApp", ct_email: "Почта",
    cta_tag: "Ҳозир оғоз кунед", cta_title: "Маълумоти шумо интизор аст",
    cta_desc: "Ворид шавед ва идоракунии объектҳоро оғоз кунед.",
    cta_btn: "Ворид шудан ба Hisob Building",
    footer: "Низоми CRM барои идоракунии лоиҳаҳои сохтмон · Тоҷикистон",
    footer_copy: "© 2025 Hisob Building. Ҳамаи ҳуқуқҳо ҳифз шудаанд.",
    footer_privacy: "Сиёсати махфият",
    footer_terms: "Шартҳои истифода",
  },
} as const;

type Lang = keyof typeof DICT;

// ─── Scroll-reveal ────────────────────────────────────────────────────────────

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e?.isIntersecting) { el.dataset["v"] = "1"; obs.disconnect(); } },
      { threshold: 0.08 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useReveal();
  return (
    <div ref={ref} style={{ transitionDelay: `${delay}ms` }}
      className={`translate-y-4 opacity-0 transition-all duration-700 ease-out data-[v=1]:translate-y-0 data-[v=1]:opacity-100 ${className}`}>
      {children}
    </div>
  );
}

// ─── Theme helper ─────────────────────────────────────────────────────────────

function th(dark: boolean, d: string, l: string) { return dark ? d : l; }

// ─── Mockup: Chess ────────────────────────────────────────────────────────────

function MockupChess({ dark }: { dark: boolean }) {
  const grid = [
    ["s","s","f","b","f","s","f","f","s","f"],
    ["f","b","s","f","s","b","f","s","b","f"],
    ["b","f","f","s","f","f","b","f","f","s"],
    ["s","f","b","f","b","s","f","b","f","f"],
    ["f","s","f","f","f","b","s","f","s","b"],
    ["b","f","s","b","f","f","f","s","f","f"],
  ];
  const c: Record<string,string> = { s:"bg-red-400/75", b:"bg-amber-400/80", f:th(dark,"bg-emerald-400/20 border border-emerald-400/15","bg-emerald-500/15 border border-emerald-500/20") };
  return (
    <div className={`flex h-full flex-col rounded-xl border p-4 ${th(dark,"border-white/[0.08] bg-[#111113]","border-black/[0.08] bg-white shadow-sm")}`}>
      <div className="mb-3 flex items-center justify-between">
        <span className={`text-[11px] font-medium ${th(dark,"text-zinc-300","text-zinc-700")}`}>ЖК «Баракат» · Блок А</span>
        <span className="rounded-full bg-amber-400/10 px-2 py-0.5 text-[9px] text-amber-500">40 кв.</span>
      </div>
      <div className="flex flex-1 gap-1">
        {Array.from({length:6},(_,col)=>(
          <div key={col} className="flex flex-1 flex-col gap-1">
            {grid.map((row,ri)=>(
              <div key={ri} className={`flex-1 rounded-sm ${c[row[col]??"f"]}`}/>
            ))}
          </div>
        ))}
      </div>
      <div className={`mt-3 flex gap-4 border-t pt-3 ${th(dark,"border-white/[0.06]","border-black/[0.06]")}`}>
        {[["bg-emerald-400/50","Свободно","18"],["bg-amber-400/80","Бронь","8"],["bg-red-400/75","Продано","14"]].map(([bg,l,n])=>(
          <div key={l} className="flex items-center gap-1.5">
            <div className={`h-2 w-2 rounded-sm ${bg}`}/>
            <span className={`text-[9px] ${th(dark,"text-zinc-500","text-zinc-400")}`}>{l}</span>
            <span className={`text-[9px] font-semibold ${th(dark,"text-zinc-300","text-zinc-700")}`}>{n}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Mockup: CRM ──────────────────────────────────────────────────────────────

function MockupCRM({ dark }: { dark: boolean }) {
  const stages = [
    { name:"Новый",       color:th(dark,"bg-zinc-700","bg-zinc-200 text-zinc-700"),       cards:["Алиев И.","Петров С."] },
    { name:"Переговоры",  color:th(dark,"bg-blue-500/40","bg-blue-100 text-blue-700"),    cards:["Рахимов Б.","Юсупов А.","Каримова Н."] },
    { name:"Бронь",       color:th(dark,"bg-amber-400/40","bg-amber-100 text-amber-700"), cards:["Назаров Д."] },
    { name:"Сделка",      color:th(dark,"bg-emerald-500/40","bg-emerald-100 text-emerald-700"), cards:["Мирзоев Р.","Ходжаев В."] },
  ];
  return (
    <div className={`flex h-full flex-col rounded-xl border p-4 ${th(dark,"border-white/[0.08] bg-[#111113]","border-black/[0.08] bg-white shadow-sm")}`}>
      <div className={`mb-3 flex items-center justify-between`}>
        <span className={`text-[11px] font-medium ${th(dark,"text-zinc-300","text-zinc-700")}`}>Воронка продаж</span>
        <span className={`text-[9px] ${th(dark,"text-zinc-600","text-zinc-400")}`}>8 клиентов</span>
      </div>
      <div className="flex flex-1 gap-2 overflow-hidden">
        {stages.map(st=>(
          <div key={st.name} className="flex flex-1 flex-col gap-1.5">
            <div className={`mb-1 rounded-md px-2 py-1 ${st.color}`}>
              <span className="text-[9px] font-medium">{st.name}</span>
            </div>
            {st.cards.map(name=>(
              <div key={name} className={`rounded-lg border p-2 ${th(dark,"border-white/[0.06] bg-white/[0.03]","border-black/[0.06] bg-zinc-50")}`}>
                <div className="mb-1 flex items-center gap-1.5">
                  <div className={`h-4 w-4 rounded-full ${th(dark,"bg-white/[0.1]","bg-zinc-200")}`}/>
                  <span className={`text-[9px] font-medium ${th(dark,"text-zinc-300","text-zinc-700")}`}>{name}</span>
                </div>
                <div className={`h-1 w-full overflow-hidden rounded-full ${th(dark,"bg-white/[0.05]","bg-zinc-200")}`}>
                  <div className="h-full rounded-full bg-amber-400/70" style={{width:`${55+Math.random()*35}%`}}/>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Mockup: Finance ──────────────────────────────────────────────────────────

function MockupFinance({ dark }: { dark: boolean }) {
  const bars = [28,45,35,60,52,78,48,85,62,70,42,90];
  return (
    <div className={`flex h-full flex-col gap-2 rounded-xl border p-4 ${th(dark,"border-white/[0.08] bg-[#111113]","border-black/[0.08] bg-white shadow-sm")}`}>
      <div className="grid grid-cols-3 gap-2">
        {[["Доходы","4 240 000","text-emerald-500"],["Расходы","1 830 000","text-red-500"],["Прибыль","2 410 000","text-amber-500"]].map(([l,v,c])=>(
          <div key={l} className={`rounded-lg border p-2.5 ${th(dark,"border-white/[0.06] bg-white/[0.03]","border-black/[0.06] bg-zinc-50")}`}>
            <div className={`text-sm font-bold tabular-nums ${c}`}>{v}</div>
            <div className={`text-[9px] ${th(dark,"text-zinc-600","text-zinc-400")}`}>{l}</div>
          </div>
        ))}
      </div>
      <div className={`flex-1 rounded-lg border p-3 ${th(dark,"border-white/[0.06] bg-white/[0.02]","border-black/[0.06] bg-zinc-50")}`}>
        <div className={`mb-2 text-[9px] ${th(dark,"text-zinc-600","text-zinc-400")}`}>Поступления по месяцам, TJS</div>
        <div className="flex h-20 items-end gap-0.5">
          {bars.map((h,i)=>(
            <div key={i} className="flex-1 rounded-t-sm" style={{height:`${h}%`,background:i===11?"rgba(245,179,1,0.85)":i===7?"rgba(245,179,1,0.5)":dark?"rgba(255,255,255,0.1)":"rgba(0,0,0,0.08)"}}/>
          ))}
        </div>
      </div>
      <div className="space-y-1.5">
        {[["Рахимов С.","+ 12 500","text-emerald-500"],["Юсупов А.","+ 8 000","text-emerald-500"],["Каримов Д.","− 4 200","text-red-500"]].map(([n,v,c])=>(
          <div key={n} className={`flex items-center justify-between rounded-md border px-2.5 py-1.5 ${th(dark,"border-white/[0.05] bg-white/[0.02]","border-black/[0.05] bg-zinc-50")}`}>
            <span className={`text-[9px] ${th(dark,"text-zinc-400","text-zinc-500")}`}>{n}</span>
            <span className={`text-[9px] font-semibold tabular-nums ${c}`}>{v} TJS</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Mockup: Payments ─────────────────────────────────────────────────────────

function MockupPayments({ dark }: { dark: boolean }) {
  const items = [
    {n:"Взнос 1",date:"01.02.25",sum:"12 500",s:"paid"},
    {n:"Взнос 2",date:"01.03.25",sum:"12 500",s:"paid"},
    {n:"Взнос 3",date:"01.04.25",sum:"12 500",s:"overdue"},
    {n:"Взнос 4",date:"01.05.25",sum:"12 500",s:"today"},
    {n:"Взнос 5",date:"01.06.25",sum:"12 500",s:"upcoming"},
    {n:"Взнос 6",date:"01.07.25",sum:"12 500",s:"upcoming"},
  ];
  const badge: Record<string,string> = { paid:"bg-emerald-400/15 text-emerald-500", overdue:"bg-red-400/15 text-red-500", today:"bg-amber-400/15 text-amber-500", upcoming:th(dark,"bg-zinc-700/50 text-zinc-400","bg-zinc-100 text-zinc-500") };
  const label: Record<string,string> = { paid:"Оплачен", overdue:"Просрочен", today:"Сегодня", upcoming:"Предстоит" };
  const dot: Record<string,string> = { paid:"bg-emerald-400", overdue:"bg-red-400", today:"bg-amber-400", upcoming:th(dark,"bg-zinc-600","bg-zinc-300") };
  return (
    <div className={`flex h-full flex-col rounded-xl border p-4 ${th(dark,"border-white/[0.08] bg-[#111113]","border-black/[0.08] bg-white shadow-sm")}`}>
      <div className="mb-3 flex items-center justify-between">
        <span className={`text-[11px] font-medium ${th(dark,"text-zinc-300","text-zinc-700")}`}>График платежей</span>
        <span className="rounded-full bg-red-400/10 px-2 py-0.5 text-[9px] text-red-500">1 просрочен</span>
      </div>
      <div className={`mb-3 flex gap-2 rounded-lg border p-3 ${th(dark,"border-white/[0.06] bg-white/[0.02]","border-black/[0.06] bg-zinc-50")}`}>
        {[["75 000","Сумма TJS","text-zinc-100"],["2/6","Оплачено","text-emerald-500"],["33%","Прогресс","text-amber-500"]].map(([v,l,c])=>(
          <div key={l} className="flex-1 text-center">
            <div className={`text-sm font-bold ${dark&&c==="text-zinc-100"?"text-zinc-100":"text-zinc-800"} ${c!=="text-zinc-100"?c:""}`}>{v}</div>
            <div className={`text-[9px] ${th(dark,"text-zinc-600","text-zinc-400")}`}>{l}</div>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-1.5">
        {items.map(it=>(
          <div key={it.n} className={`flex items-center gap-2.5 rounded-lg border px-3 py-2 ${th(dark,"border-white/[0.05] bg-white/[0.02]","border-black/[0.05] bg-zinc-50")}`}>
            <div className={`h-2 w-2 shrink-0 rounded-full ${dot[it.s]}`}/>
            <span className={`flex-1 text-[9px] ${th(dark,"text-zinc-400","text-zinc-500")}`}>{it.n} · {it.date}</span>
            <span className={`text-[9px] font-semibold tabular-nums ${th(dark,"text-zinc-300","text-zinc-700")}`}>{it.sum} TJS</span>
            <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-medium ${badge[it.s]}`}>{label[it.s]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Mockup: Analytics ────────────────────────────────────────────────────────

function MockupAnalytics({ dark }: { dark: boolean }) {
  return (
    <div className={`flex h-full flex-col gap-2 rounded-xl border p-4 ${th(dark,"border-white/[0.08] bg-[#111113]","border-black/[0.08] bg-white shadow-sm")}`}>
      <div className="grid grid-cols-2 gap-2">
        {[
          {label:"Конверсия",val:"34%",sub:"+5% к прошлому кварталу",c:"text-amber-500"},
          {label:"Ср. сделка",val:"87 500",sub:"TJS",c:th(dark,"text-zinc-100","text-zinc-800")},
          {label:"Активных",val:"23",sub:"сделок в работе",c:"text-blue-500"},
          {label:"Просрочено",val:"4",sub:"требуют внимания",c:"text-red-500"},
        ].map(k=>(
          <div key={k.label} className={`rounded-lg border p-3 ${th(dark,"border-white/[0.06] bg-white/[0.03]","border-black/[0.06] bg-zinc-50")}`}>
            <div className={`mb-0.5 text-lg font-bold tabular-nums ${k.c}`}>{k.val}</div>
            <div className={`text-[9px] font-medium ${th(dark,"text-zinc-400","text-zinc-600")}`}>{k.label}</div>
            <div className={`text-[8px] ${th(dark,"text-zinc-600","text-zinc-400")}`}>{k.sub}</div>
          </div>
        ))}
      </div>
      <div className={`flex-1 rounded-lg border p-3 ${th(dark,"border-white/[0.06] bg-white/[0.02]","border-black/[0.06] bg-zinc-50")}`}>
        <div className={`mb-2 text-[9px] ${th(dark,"text-zinc-600","text-zinc-400")}`}>Объекты по статусу продаж</div>
        <div className="flex flex-col gap-2">
          {[["ЖК «Баракат»",72,"bg-emerald-400"],["ЖК «Нур»",45,"bg-amber-400"],["ЖК «Садбарг»",89,"bg-blue-400"]].map(([n,p,c])=>(
            <div key={String(n)}>
              <div className="mb-1 flex justify-between text-[9px]">
                <span className={th(dark,"text-zinc-400","text-zinc-500")}>{String(n)}</span>
                <span className={th(dark,"text-zinc-500","text-zinc-400")}>{String(p)}%</span>
              </div>
              <div className={`h-1.5 overflow-hidden rounded-full ${th(dark,"bg-white/[0.05]","bg-zinc-200")}`}>
                <div className={`h-full rounded-full ${String(c)}`} style={{width:`${String(p)}%`,opacity:0.7}}/>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className={`rounded-lg border p-3 ${th(dark,"border-white/[0.06] bg-white/[0.02]","border-black/[0.06] bg-zinc-50")}`}>
        <div className={`mb-2 text-[9px] ${th(dark,"text-zinc-600","text-zinc-400")}`}>Топ менеджеры</div>
        <div className="flex gap-2">
          {[["А.Ю","12","text-amber-500"],["Р.М","9",th(dark,"text-zinc-300","text-zinc-700")],["Б.К","7",th(dark,"text-zinc-400","text-zinc-500")]].map(([i,n,c])=>(
            <div key={i} className="flex flex-1 flex-col items-center gap-1">
              <div className={`flex h-7 w-7 items-center justify-center rounded-full border text-[9px] font-medium ${th(dark,"border-white/[0.08] bg-white/[0.05] text-zinc-300","border-black/[0.08] bg-zinc-100 text-zinc-600")}`}>{i}</div>
              <span className={`text-xs font-bold tabular-nums ${c}`}>{n}</span>
              <span className={`text-[8px] ${th(dark,"text-zinc-700","text-zinc-400")}`}>сделок</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard Hero Mockup ────────────────────────────────────────────────────

function DashboardMockup({ dark }: { dark: boolean }) {
  const chessColors = [
    ["s","s","f","b","f","s","f","f"],
    ["f","b","s","f","s","b","f","s"],
    ["b","f","f","s","f","f","b","f"],
    ["s","f","b","f","b","s","f","b"],
    ["f","s","f","f","f","b","s","f"],
  ];
  const colorMap: Record<string,string> = { s:"bg-red-400/80", b:"bg-amber-400/80", f:th(dark,"bg-emerald-400/25 border border-emerald-400/15","bg-emerald-500/20 border border-emerald-500/20") };

  return (
    <div className={`relative h-full w-full overflow-hidden rounded-2xl border shadow-2xl ${th(dark,"border-white/[0.08] bg-[#111113]","border-black/[0.08] bg-white")}`}>
      <div className={`flex h-9 items-center gap-2 border-b px-4 ${th(dark,"border-white/[0.06]","border-black/[0.06]")}`}>
        <span className="h-2.5 w-2.5 rounded-full bg-red-500/60"/>
        <span className="h-2.5 w-2.5 rounded-full bg-amber-500/60"/>
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/60"/>
        <span className={`ml-3 text-[10px] ${th(dark,"text-zinc-600","text-zinc-400")}`}>Hisob Building — Дашборд</span>
      </div>
      <div className="flex h-[calc(100%-36px)]">
        <div className={`flex w-[52px] flex-col gap-1 border-r p-2 pt-3 ${th(dark,"border-white/[0.06]","border-black/[0.06]")}`}>
          {[true,false,false,false,false,false].map((a,i)=>(
            <div key={i} className={`flex h-7 w-7 items-center justify-center rounded-md`} style={{background:a?"rgba(245,179,1,0.12)":"transparent"}}>
              <div className="h-3.5 w-3.5 rounded-sm bg-amber-400" style={{opacity:a?1:0.2}}/>
            </div>
          ))}
        </div>
        <div className="flex flex-1 flex-col gap-3 overflow-hidden p-4">
          <div className="grid grid-cols-4 gap-2">
            {[{l:"Объекты",v:"12",c:"text-zinc-100"},{l:"Сделок",v:"148",c:"text-amber-500"},{l:"Выручка",v:"4.2M",c:"text-emerald-500"},{l:"Должники",v:"23",c:"text-red-500"}].map(k=>(
              <div key={k.l} className={`rounded-lg border p-2 ${th(dark,"border-white/[0.06] bg-white/[0.03]","border-black/[0.06] bg-zinc-50")}`}>
                <div className={`text-base font-bold tabular-nums ${k.c==="text-zinc-100"&&!dark?"text-zinc-800":k.c}`}>{k.v}</div>
                <div className={`text-[9px] ${th(dark,"text-zinc-600","text-zinc-400")}`}>{k.l}</div>
              </div>
            ))}
          </div>
          <div className="grid flex-1 grid-cols-5 gap-2 overflow-hidden">
            <div className={`col-span-3 overflow-hidden rounded-lg border p-3 ${th(dark,"border-white/[0.06] bg-white/[0.02]","border-black/[0.06] bg-zinc-50")}`}>
              <div className={`mb-2 text-[9px] font-medium ${th(dark,"text-zinc-500","text-zinc-400")}`}>ЖК «Баракат» — Блок А</div>
              <div className="flex flex-col gap-0.5">
                {chessColors.map((row,ri)=>(
                  <div key={ri} className="flex gap-0.5">
                    {row.map((cell,ci)=>(
                      <div key={ci} className={`h-4 flex-1 rounded-sm ${colorMap[cell]}`}/>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div className={`col-span-2 flex flex-col overflow-hidden rounded-lg border p-3 ${th(dark,"border-white/[0.06] bg-white/[0.02]","border-black/[0.06] bg-zinc-50")}`}>
              <div className={`mb-2 text-[9px] font-medium ${th(dark,"text-zinc-500","text-zinc-400")}`}>Последние платежи</div>
              <div className="flex flex-col gap-1.5">
                {[{name:"Алиев И.",sum:"+12 500",c:"text-emerald-500"},{name:"Рахимов С.",sum:"+8 000",c:"text-emerald-500"},{name:"Назаров Б.",sum:"−4 200",c:"text-red-500"},{name:"Юсупов А.",sum:"+21 000",c:"text-emerald-500"},{name:"Каримов Д.",sum:"+6 750",c:"text-emerald-500"}].map(t=>(
                  <div key={t.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className={`h-4 w-4 rounded-full ${th(dark,"bg-white/[0.06]","bg-zinc-200")}`}/>
                      <span className={`text-[9px] ${th(dark,"text-zinc-400","text-zinc-500")}`}>{t.name}</span>
                    </div>
                    <span className={`text-[9px] font-medium tabular-nums ${t.c}`}>{t.sum}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className={`h-16 overflow-hidden rounded-lg border p-2 ${th(dark,"border-white/[0.06] bg-white/[0.02]","border-black/[0.06] bg-zinc-50")}`}>
            <div className={`mb-1.5 text-[9px] ${th(dark,"text-zinc-600","text-zinc-400")}`}>Продажи по месяцам</div>
            <div className="flex h-8 items-end gap-1">
              {[30,55,40,70,60,85,50,90,65,75,45,80].map((h,i)=>(
                <div key={i} className="flex-1 rounded-t-sm" style={{height:`${h}%`,background:i===7?"rgba(245,179,1,0.8)":dark?"rgba(255,255,255,0.1)":"rgba(0,0,0,0.08)"}}/>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Feature Slider ───────────────────────────────────────────────────────────

function FeatureSlider({ dark, d }: { dark: boolean; d: (typeof DICT)[Lang] }) {
  const [active, setActive] = useState(0);
  const [fading, setFading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>|null>(null);

  const goTo = (i: number) => {
    if (i === active || fading) return;
    setFading(true);
    setTimeout(() => { setActive(i); setFading(false); }, 180);
  };

  useEffect(() => {
    timer.current = setTimeout(()=>goTo((active+1)%5), 5000);
    return ()=>{ if(timer.current) clearTimeout(timer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const mockups = [
    <MockupChess key="chess" dark={dark}/>,
    <MockupCRM key="crm" dark={dark}/>,
    <MockupFinance key="fin" dark={dark}/>,
    <MockupPayments key="pay" dark={dark}/>,
    <MockupAnalytics key="ana" dark={dark}/>,
  ];

  const slide = d.sl_data[active]!;

  return (
    <div>
      <div className={`mb-8 flex gap-1 overflow-x-auto rounded-xl border p-1 ${th(dark,"border-white/[0.06] bg-white/[0.02]","border-black/[0.06] bg-black/[0.03]")}`}>
        {d.sl_tabs.map((tab,i)=>(
          <button key={tab} onClick={()=>goTo(i)}
            className={`flex-1 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200 ${i===active ? th(dark,"bg-white/[0.08] text-zinc-100","bg-white text-zinc-900 shadow-sm") : th(dark,"text-zinc-500 hover:text-zinc-300","text-zinc-400 hover:text-zinc-600")}`}>
            {tab}
          </button>
        ))}
      </div>

      <div className={`grid items-center gap-8 transition-opacity duration-200 lg:grid-cols-2 ${fading?"opacity-0":"opacity-100"}`}>
        <div>
          <p className="mb-2 text-[11px] font-medium uppercase tracking-widest text-amber-400/70">{d.sl_tabs[active]}</p>
          <h3 className={`mb-3 text-2xl font-semibold tracking-tight ${th(dark,"text-zinc-100","text-zinc-900")}`}>{slide.title}</h3>
          <p className={`mb-5 text-sm leading-relaxed ${th(dark,"text-zinc-500","text-zinc-500")}`}>{slide.desc}</p>
          <ul className="space-y-2">
            {slide.pts.map(p=>(
              <li key={p} className={`flex items-center gap-2.5 text-sm ${th(dark,"text-zinc-400","text-zinc-600")}`}>
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber-400/10 text-[9px] text-amber-500">✓</span>
                {p}
              </li>
            ))}
          </ul>
        </div>
        <div className="h-[340px]">{mockups[active]}</div>
      </div>

      <div className="mt-6 flex justify-center gap-1.5">
        {Array.from({length:5},(_,i)=>(
          <button key={i} onClick={()=>goTo(i)}
            className={`h-1 rounded-full transition-all duration-300 ${i===active?"w-6 bg-amber-400":"w-1.5 hover:w-3 "+th(dark,"bg-zinc-700 hover:bg-zinc-500","bg-zinc-300 hover:bg-zinc-400")}`}/>
        ))}
      </div>
    </div>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const IcoTg = () => <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>;
const IcoPhone = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"/></svg>;
const IcoMail = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"/></svg>;
const IcoSun = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"/></svg>;
const IcoMoon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"/></svg>;

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [dark, setDark] = useState(true);
  const [lang, setLang] = useState<Lang>("ru");
  const d = DICT[lang];

  const bg = th(dark,"bg-[#09090b]","bg-[#f4f5f7]");
  const navBg = th(dark,"bg-[#09090b]/90","bg-[#f4f5f7]/90");
  const text = th(dark,"text-zinc-100","text-zinc-900");
  const muted = th(dark,"text-zinc-500","text-zinc-500");
  const border = th(dark,"border-white/[0.06]","border-black/[0.06]");
  const card = th(dark,"border-white/[0.07] bg-white/[0.03]","border-black/[0.07] bg-white");
  const cardHover = th(dark,"hover:border-white/[0.12] hover:bg-white/[0.05]","hover:border-black/[0.12] hover:bg-zinc-50");
  const tag = th(dark,"border-white/[0.08] bg-white/[0.04]","border-black/[0.08] bg-black/[0.04]");

  const LANGS: {key: Lang; label: string}[] = [
    {key:"ru",label:"RU"},{key:"en",label:"EN"},{key:"uz",label:"UZ"},{key:"tg",label:"TG"},
  ];

  return (
    <div className={`min-h-screen ${bg} ${text} transition-colors duration-300`}>

      {/* ── Nav ── */}
      <header className={`fixed inset-x-0 top-0 z-50 flex items-center border-b ${border} ${navBg} backdrop-blur-md transition-colors duration-300`}>
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-amber-400 text-xs font-bold text-zinc-900">H</span>
            <span className="text-sm font-semibold">Hisob Building</span>
            <span className={`hidden rounded-full border px-2 py-0.5 text-[10px] text-amber-500 sm:inline ${tag}`}>{d.nav_badge}</span>
          </div>
          <div className="flex items-center gap-1.5">
            {/* Lang switcher */}
            <div className={`flex h-8 items-center gap-0.5 rounded-lg border px-0.5 ${tag}`}>
              {LANGS.map(l=>(
                <button key={l.key} onClick={()=>setLang(l.key)}
                  className={`flex h-6 items-center rounded-md px-2 text-[11px] font-medium transition-all duration-150 ${lang===l.key ? "bg-amber-400 text-zinc-900" : th(dark,"text-zinc-400 hover:text-zinc-200","text-zinc-500 hover:text-zinc-700")}`}>
                  {l.label}
                </button>
              ))}
            </div>
            {/* Theme toggle */}
            <button onClick={()=>setDark(!dark)}
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors duration-200 ${th(dark,"border-white/[0.08] bg-white/[0.04] text-zinc-400 hover:text-zinc-100","border-black/[0.08] bg-black/[0.04] text-zinc-500 hover:text-zinc-800")}`}>
              {dark ? <IcoSun/> : <IcoMoon/>}
            </button>
            <Link href={routes.login}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-amber-400 px-4 text-xs font-semibold text-zinc-900 transition-colors hover:bg-amber-300">
              {d.nav_login} →
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="mx-auto max-w-6xl px-6 pb-16 pt-28">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="animate-[fadeUp_0.6s_ease_forwards]">
            <div className={`mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] ${muted} ${tag}`}>
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400"/>
              {d.hero_badge}
            </div>
            <h1 className="mb-4 text-4xl font-semibold leading-[1.1] tracking-tight xl:text-5xl">
              {d.hero_h1}<br/>
              <span className={muted}>{d.hero_h1b}</span>
            </h1>
            <p className={`mb-7 text-sm leading-relaxed ${muted}`}>{d.hero_desc}</p>
            <div className="flex flex-wrap gap-3">
              <Link href={routes.login}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-amber-400 px-6 text-sm font-semibold text-zinc-900 transition-all hover:bg-amber-300">
                {d.hero_cta}
                <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth="2"><path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </Link>
              <a href="#features"
                className={`inline-flex h-10 items-center gap-2 rounded-xl border px-6 text-sm transition-colors ${th(dark,"border-white/[0.08] text-zinc-400 hover:border-white/[0.15] hover:text-zinc-200","border-black/[0.08] text-zinc-500 hover:border-black/[0.15] hover:text-zinc-700")}`}>
                {d.hero_more}
              </a>
            </div>
            <div className={`mt-8 flex gap-6 border-t pt-6 ${border}`}>
              {d.stats.map(([v,l])=>(
                <div key={l}>
                  <div className="text-xl font-bold tabular-nums">{v}</div>
                  <div className={`text-[11px] ${th(dark,"text-zinc-600","text-zinc-400")}`}>{l}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="animate-[fadeUp_0.6s_0.15s_ease_both] lg:h-[420px]">
            <DashboardMockup dark={dark}/>
          </div>
        </div>
      </section>

      {/* ── Ticker ── */}
      <div className={`overflow-hidden border-y py-3 ${border} ${th(dark,"bg-white/[0.02]","bg-black/[0.02]")}`}>
        <div className="flex animate-[ticker_22s_linear_infinite] gap-10 whitespace-nowrap">
          {[...Array(2)].flatMap(()=>["Шахматка","CRM-воронка","Финансы","Склад","Подрядчики","Аналитика","SMS","PDF","Курсы НБТ","Мультиязычность"]).map((item,i)=>(
            <span key={i} className={`text-xs ${th(dark,"text-zinc-600","text-zinc-400")}`}>
              <span className="mr-8 text-amber-400/30">✦</span>{item}
            </span>
          ))}
        </div>
      </div>

      {/* ── Features ── */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-20">
        <Reveal>
          <div className="mb-10">
            <p className="mb-2 text-[11px] font-medium uppercase tracking-widest text-amber-400/60">{d.feat_tag}</p>
            <h2 className="text-2xl font-semibold tracking-tight">{d.feat_title}</h2>
          </div>
        </Reveal>
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {d.feat.map(([icon,title,desc],i)=>(
            <Reveal key={String(title)} delay={i*45}>
              <div className={`group flex gap-4 rounded-xl border p-4 transition-all duration-200 ${card} ${cardHover}`}>
                <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-base ${th(dark,"border-white/[0.08] bg-white/[0.04]","border-black/[0.08] bg-black/[0.03]")}`}>{String(icon)}</div>
                <div>
                  <div className="mb-0.5 text-sm font-medium">{String(title)}</div>
                  <div className={`text-xs leading-relaxed ${muted}`}>{String(desc)}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className={`border-t ${border}`}>
        <div className="mx-auto max-w-6xl px-6 py-20">
          <Reveal>
            <div className="mb-10">
              <p className="mb-2 text-[11px] font-medium uppercase tracking-widest text-amber-400/60">{d.how_tag}</p>
              <h2 className="text-2xl font-semibold tracking-tight">{d.how_title}</h2>
            </div>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-3">
            {d.how_steps.map(([n,title,body],i)=>(
              <Reveal key={String(n)} delay={i*80}>
                <div className={`h-full rounded-xl border p-6 transition-colors duration-200 ${i===0?th(dark,"border-amber-400/20 bg-amber-400/[0.04]","border-amber-400/20 bg-amber-400/[0.03]"):card} ${cardHover}`}>
                  <span className={`mb-4 block text-3xl font-bold tabular-nums ${th(dark,"text-white/[0.07]","text-black/[0.06]")}`}>{String(n)}</span>
                  <h3 className="mb-2 text-sm font-semibold">{String(title)}</h3>
                  <p className={`text-xs leading-relaxed ${muted}`}>{String(body)}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Slider ── */}
      <section className={`border-t ${border}`}>
        <div className="mx-auto max-w-6xl px-6 py-20">
          <Reveal>
            <div className="mb-10">
              <p className="mb-2 text-[11px] font-medium uppercase tracking-widest text-amber-400/60">{d.sl_tag}</p>
              <h2 className="text-2xl font-semibold tracking-tight">{d.sl_title}</h2>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <FeatureSlider dark={dark} d={d}/>
          </Reveal>
        </div>
      </section>

      {/* ── Contacts ── */}
      <section className={`border-t ${border}`}>
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid items-start gap-10 lg:grid-cols-2">
            <Reveal>
              <p className="mb-2 text-[11px] font-medium uppercase tracking-widest text-amber-400/60">{d.ct_tag}</p>
              <h2 className="mb-3 text-2xl font-semibold tracking-tight">{d.ct_title}</h2>
              <p className={`text-sm leading-relaxed ${muted}`}>{d.ct_desc}</p>
            </Reveal>
            <Reveal delay={80}>
              <div className="flex flex-col gap-3">
                {[
                  { icon:<IcoTg/>, label:d.ct_tg, value:"@yakubiam", href:"https://t.me/yakubiam", color:"text-sky-400 bg-sky-400/10 border-sky-400/15" },
                  { icon:<IcoPhone/>, label:d.ct_phone, value:"+992 71 205 6006", href:"https://wa.me/992712056006", color:"text-emerald-400 bg-emerald-400/10 border-emerald-400/15" },
                  { icon:<IcoMail/>, label:d.ct_email, value:"yakubiabduqahhor@gmail.com", href:"mailto:yakubiabduqahhor@gmail.com", color:"text-amber-400 bg-amber-400/10 border-amber-400/15" },
                ].map(ct=>(
                  <a key={ct.label} href={ct.href} target="_blank" rel="noopener noreferrer"
                    className={`group flex items-center gap-4 rounded-xl border p-4 transition-all duration-200 ${card} ${cardHover}`}>
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${ct.color}`}>
                      {ct.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`mb-0.5 text-[10px] font-medium uppercase tracking-wider ${th(dark,"text-zinc-500","text-zinc-400")}`}>{ct.label}</div>
                      <div className="truncate text-sm font-medium">{ct.value}</div>
                    </div>
                    <svg viewBox="0 0 16 16" fill="none" className={`h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 ${th(dark,"text-zinc-600 group-hover:text-zinc-400","text-zinc-300 group-hover:text-zinc-600")}`} stroke="currentColor" strokeWidth="1.5">
                      <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </a>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={`border-t ${border}`}>
        <div className="mx-auto max-w-6xl px-6 py-20">
          <Reveal>
            <div className={`relative overflow-hidden rounded-2xl border p-10 text-center ${card}`}>
              <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/25 to-transparent"/>
              <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-32 w-64 -translate-x-1/2 rounded-full bg-amber-400/[0.04] blur-2xl"/>
              <p className="relative mb-2 text-[11px] font-medium uppercase tracking-widest text-amber-400/60">{d.cta_tag}</p>
              <h2 className="relative mb-3 text-2xl font-semibold tracking-tight">{d.cta_title}</h2>
              <p className={`relative mb-7 text-sm ${muted}`}>{d.cta_desc}</p>
              <Link href={routes.login}
                className="relative inline-flex h-11 items-center gap-2 rounded-xl bg-amber-400 px-8 text-sm font-semibold text-zinc-900 transition-all hover:bg-amber-300">
                {d.cta_btn}
                <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth="2"><path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className={`border-t pt-8 pb-6 ${border}`}>
        <div className="mx-auto max-w-6xl px-6">
          {/* Top row */}
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-amber-400 text-[10px] font-bold text-zinc-900">H</span>
              <span className={`text-xs font-medium ${th(dark,"text-zinc-400","text-zinc-600")}`}>Hisob Building</span>
            </div>
            <p className={`text-xs ${th(dark,"text-zinc-600","text-zinc-400")}`}>{d.footer}</p>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className={`text-xs transition-colors ${th(dark,"text-zinc-500 hover:text-zinc-300","text-zinc-400 hover:text-zinc-700")}`}>
                {d.footer_privacy}
              </Link>
              <span className={`text-xs ${th(dark,"text-zinc-700","text-zinc-300")}`}>·</span>
              <Link href="/terms" className={`text-xs transition-colors ${th(dark,"text-zinc-500 hover:text-zinc-300","text-zinc-400 hover:text-zinc-700")}`}>
                {d.footer_terms}
              </Link>
            </div>
          </div>
          {/* Bottom row */}
          <div className={`mt-5 border-t pt-5 text-center text-[11px] ${border} ${th(dark,"text-zinc-700","text-zinc-400")}`}>
            {d.footer_copy}
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes ticker { from { transform:translateX(0); } to { transform:translateX(-50%); } }
      `}</style>
    </div>
  );
}
