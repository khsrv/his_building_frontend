"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { routes } from "@/shared/constants/routes";

// ─── Scroll-reveal ────────────────────────────────────────────────────────────

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e?.isIntersecting) { el.dataset["v"] = "1"; obs.disconnect(); } },
      { threshold: 0.1 },
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

// ─── Dashboard Mockup ─────────────────────────────────────────────────────────

function DashboardMockup() {
  const chessColors = [
    ["sold","sold","free","booked","free","sold","free","free"],
    ["free","booked","sold","free","sold","booked","free","sold"],
    ["booked","free","free","sold","free","free","booked","free"],
    ["sold","free","booked","free","booked","sold","free","booked"],
    ["free","sold","free","free","free","booked","sold","free"],
  ];
  const colorMap: Record<string, string> = {
    sold: "bg-red-400/80",
    booked: "bg-amber-400/80",
    free: "bg-emerald-400/30 border border-emerald-400/20",
  };

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111113] p-0 shadow-2xl">
      {/* Topbar */}
      <div className="flex h-9 items-center gap-2 border-b border-white/[0.06] px-4">
        <span className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-500/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/60" />
        <span className="ml-3 text-[10px] text-zinc-600">Hisob Building — Дашборд</span>
      </div>

      <div className="flex h-[calc(100%-36px)]">
        {/* Sidebar */}
        <div className="flex w-[52px] flex-col gap-1 border-r border-white/[0.06] p-2 pt-3">
          {["#f5b301","#71717a","#71717a","#71717a","#71717a","#71717a"].map((c, i) => (
            <div key={i} className="flex h-7 w-7 items-center justify-center rounded-md" style={{ background: i === 0 ? "rgba(245,179,1,0.12)" : "transparent" }}>
              <div className="h-3.5 w-3.5 rounded-sm" style={{ background: c, opacity: i === 0 ? 1 : 0.3 }} />
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col gap-3 overflow-hidden p-4">
          {/* KPI row */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "Объекты", val: "12", color: "text-zinc-100" },
              { label: "Сделок", val: "148", color: "text-amber-400" },
              { label: "Выручка", val: "4.2M", color: "text-emerald-400" },
              { label: "Должники", val: "23", color: "text-red-400" },
            ].map((k) => (
              <div key={k.label} className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-2">
                <div className={`text-base font-bold tabular-nums ${k.color}`}>{k.val}</div>
                <div className="text-[9px] text-zinc-600">{k.label}</div>
              </div>
            ))}
          </div>

          <div className="grid flex-1 grid-cols-5 gap-2 overflow-hidden">
            {/* Chess grid */}
            <div className="col-span-3 overflow-hidden rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
              <div className="mb-2 text-[9px] font-medium text-zinc-500">ЖК «Баракат» — Блок А</div>
              <div className="flex flex-col gap-0.5">
                {chessColors.map((row, ri) => (
                  <div key={ri} className="flex gap-0.5">
                    {row.map((cell, ci) => (
                      <div key={ci} className={`h-4 flex-1 rounded-sm ${colorMap[cell]}`} />
                    ))}
                  </div>
                ))}
              </div>
              <div className="mt-2 flex gap-3">
                {[["Свободно","bg-emerald-400/50"],["Бронь","bg-amber-400/80"],["Продано","bg-red-400/80"]].map(([l,c]) => (
                  <div key={l} className="flex items-center gap-1">
                    <div className={`h-1.5 w-1.5 rounded-full ${c}`} />
                    <span className="text-[8px] text-zinc-600">{l}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Transactions */}
            <div className="col-span-2 flex flex-col overflow-hidden rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
              <div className="mb-2 text-[9px] font-medium text-zinc-500">Последние платежи</div>
              <div className="flex flex-col gap-1.5 overflow-hidden">
                {[
                  { name: "Алиев И.", sum: "+12 500", color: "text-emerald-400" },
                  { name: "Рахимов С.", sum: "+8 000", color: "text-emerald-400" },
                  { name: "Назаров Б.", sum: "−4 200", color: "text-red-400" },
                  { name: "Юсупов А.", sum: "+21 000", color: "text-emerald-400" },
                  { name: "Каримов Д.", sum: "+6 750", color: "text-emerald-400" },
                ].map((t) => (
                  <div key={t.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="h-4 w-4 rounded-full bg-white/[0.06]" />
                      <span className="text-[9px] text-zinc-400">{t.name}</span>
                    </div>
                    <span className={`text-[9px] font-medium tabular-nums ${t.color}`}>{t.sum}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bar chart */}
          <div className="h-16 overflow-hidden rounded-lg border border-white/[0.06] bg-white/[0.02] p-2">
            <div className="mb-1.5 text-[9px] text-zinc-600">Продажи по месяцам</div>
            <div className="flex h-8 items-end gap-1">
              {[30, 55, 40, 70, 60, 85, 50, 90, 65, 75, 45, 80].map((h, i) => (
                <div key={i} className="flex-1 rounded-t-sm"
                  style={{ height: `${h}%`, background: i === 7 ? "rgba(245,179,1,0.8)" : "rgba(255,255,255,0.1)" }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Feature row ──────────────────────────────────────────────────────────────

function FeatureItem({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="group flex gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 transition-all duration-200 hover:border-white/[0.1] hover:bg-white/[0.04]">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-base">
        {icon}
      </div>
      <div>
        <div className="mb-0.5 text-sm font-medium text-zinc-200">{title}</div>
        <div className="text-xs leading-relaxed text-zinc-500">{desc}</div>
      </div>
    </div>
  );
}

// ─── Slide Mockups ────────────────────────────────────────────────────────────

function MockupChess() {
  const grid = [
    ["s","s","f","b","f","s","f","f","s","f"],
    ["f","b","s","f","s","b","f","s","b","f"],
    ["b","f","f","s","f","f","b","f","f","s"],
    ["s","f","b","f","b","s","f","b","f","f"],
    ["f","s","f","f","f","b","s","f","s","b"],
    ["b","f","s","b","f","f","f","s","f","f"],
  ];
  const c: Record<string, string> = {
    s: "bg-red-400/75",
    b: "bg-amber-400/80",
    f: "bg-emerald-400/25 border border-emerald-400/15",
  };
  return (
    <div className="flex h-full flex-col rounded-xl border border-white/[0.08] bg-[#111113] p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[11px] font-medium text-zinc-300">ЖК «Баракат» · Блок А</span>
        <span className="rounded-full bg-amber-400/10 px-2 py-0.5 text-[9px] text-amber-400">40 кв.</span>
      </div>
      <div className="mb-1 flex gap-1 text-[9px] text-zinc-600">
        {["1эт","2эт","3эт","4эт","5эт","6эт"].map(e => (
          <div key={e} className="w-full text-center">{e}</div>
        ))}
      </div>
      <div className="flex flex-1 gap-1">
        {Array.from({length:6},(_,col) => (
          <div key={col} className="flex flex-1 flex-col gap-1">
            {grid.map((row,ri) => (
              <div key={ri} className={`flex-1 rounded-sm ${c[row[col] ?? "f"]}`} />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-4 border-t border-white/[0.06] pt-3">
        {[["bg-emerald-400/50","Свободно","18"],["bg-amber-400/80","Бронь","8"],["bg-red-400/75","Продано","14"]].map(([bg,l,n]) => (
          <div key={l} className="flex items-center gap-1.5">
            <div className={`h-2 w-2 rounded-sm ${bg}`} />
            <span className="text-[9px] text-zinc-500">{l}</span>
            <span className="text-[9px] font-semibold text-zinc-300">{n}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MockupCRM() {
  const stages = [
    { name: "Новый", color: "bg-zinc-700", cards: ["Алиев И.", "Петров С."] },
    { name: "Переговоры", color: "bg-blue-500/40", cards: ["Рахимов Б.", "Юсупов А.", "Каримова Н."] },
    { name: "Бронь", color: "bg-amber-400/40", cards: ["Назаров Д."] },
    { name: "Сделка", color: "bg-emerald-500/40", cards: ["Мирзоев Р.", "Ходжаев В."] },
  ];
  return (
    <div className="flex h-full flex-col rounded-xl border border-white/[0.08] bg-[#111113] p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[11px] font-medium text-zinc-300">Воронка продаж</span>
        <span className="text-[9px] text-zinc-600">8 клиентов</span>
      </div>
      <div className="flex flex-1 gap-2 overflow-hidden">
        {stages.map(st => (
          <div key={st.name} className="flex flex-1 flex-col gap-1.5">
            <div className={`mb-1 flex items-center gap-1.5 rounded-md px-2 py-1 ${st.color}`}>
              <span className="text-[9px] font-medium text-zinc-200">{st.name}</span>
              <span className="ml-auto text-[8px] text-zinc-400">{st.cards.length}</span>
            </div>
            {st.cards.map(name => (
              <div key={name} className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-2">
                <div className="mb-1 flex items-center gap-1.5">
                  <div className="h-4 w-4 rounded-full bg-white/[0.1]" />
                  <span className="text-[9px] font-medium text-zinc-300">{name}</span>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full bg-white/[0.05]">
                  <div className="h-full rounded-full bg-amber-400/60" style={{width:`${50+Math.random()*40}%`}} />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function MockupFinance() {
  const bars = [28,45,35,60,52,78,48,85,62,70,42,90];
  return (
    <div className="flex h-full flex-col gap-2 rounded-xl border border-white/[0.08] bg-[#111113] p-4">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[11px] font-medium text-zinc-300">Финансовый дашборд</span>
        <span className="text-[9px] text-zinc-600">Март 2025</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[["Доходы","4 240 000","text-emerald-400"],["Расходы","1 830 000","text-red-400"],["Прибыль","2 410 000","text-amber-400"]].map(([l,v,c]) => (
          <div key={l} className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-2.5">
            <div className={`text-sm font-bold tabular-nums ${c}`}>{v}</div>
            <div className="text-[9px] text-zinc-600">{l}</div>
          </div>
        ))}
      </div>
      <div className="flex-1 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
        <div className="mb-2 text-[9px] text-zinc-600">Поступления по месяцам, TJS</div>
        <div className="flex h-20 items-end gap-1">
          {bars.map((h,i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-0.5">
              <div className="w-full rounded-t-sm transition-all"
                style={{height:`${h}%`, background: i===11 ? "rgba(245,179,1,0.85)" : i===7 ? "rgba(245,179,1,0.5)" : "rgba(255,255,255,0.1)"}} />
            </div>
          ))}
        </div>
        <div className="mt-1 flex justify-between text-[8px] text-zinc-700">
          {["Апр","Май","Июн","Июл","Авг","Сен","Окт","Ноя","Дек","Янв","Фев","Мар"].map(m=><span key={m}>{m}</span>)}
        </div>
      </div>
      <div className="space-y-1.5">
        {[["Рахимов С.","+ 12 500 TJS","text-emerald-400"],["Юсупов А.","+ 8 000 TJS","text-emerald-400"],["Каримов Д.","− 4 200 TJS","text-red-400"]].map(([n,v,c])=>(
          <div key={n} className="flex items-center justify-between rounded-md border border-white/[0.05] bg-white/[0.02] px-2.5 py-1.5">
            <span className="text-[9px] text-zinc-400">{n}</span>
            <span className={`text-[9px] font-semibold tabular-nums ${c}`}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MockupPayments() {
  const items = [
    { n:"Взнос 1", date:"01.02.25", sum:"12 500", status:"paid" },
    { n:"Взнос 2", date:"01.03.25", sum:"12 500", status:"paid" },
    { n:"Взнос 3", date:"01.04.25", sum:"12 500", status:"overdue" },
    { n:"Взнос 4", date:"01.05.25", sum:"12 500", status:"today" },
    { n:"Взнос 5", date:"01.06.25", sum:"12 500", status:"upcoming" },
    { n:"Взнос 6", date:"01.07.25", sum:"12 500", status:"upcoming" },
  ];
  const badge: Record<string,string> = {
    paid: "bg-emerald-400/15 text-emerald-400",
    overdue: "bg-red-400/15 text-red-400",
    today: "bg-amber-400/15 text-amber-400",
    upcoming: "bg-zinc-700/50 text-zinc-400",
  };
  const label: Record<string,string> = { paid:"Оплачен", overdue:"Просрочен", today:"Сегодня", upcoming:"Предстоит" };
  return (
    <div className="flex h-full flex-col rounded-xl border border-white/[0.08] bg-[#111113] p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[11px] font-medium text-zinc-300">График платежей</span>
        <span className="rounded-full bg-red-400/10 px-2 py-0.5 text-[9px] text-red-400">1 просрочен</span>
      </div>
      <div className="mb-3 flex gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
        <div className="flex-1 text-center">
          <div className="text-base font-bold text-zinc-100">75 000</div>
          <div className="text-[9px] text-zinc-600">Сумма TJS</div>
        </div>
        <div className="w-px bg-white/[0.06]" />
        <div className="flex-1 text-center">
          <div className="text-base font-bold text-emerald-400">2/6</div>
          <div className="text-[9px] text-zinc-600">Оплачено</div>
        </div>
        <div className="w-px bg-white/[0.06]" />
        <div className="flex-1 text-center">
          <div className="text-base font-bold text-amber-400">33%</div>
          <div className="text-[9px] text-zinc-600">Прогресс</div>
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        {items.map(it => (
          <div key={it.n} className="flex items-center gap-3 rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2">
            <div className={`h-2 w-2 shrink-0 rounded-full ${it.status==="paid"?"bg-emerald-400":it.status==="overdue"?"bg-red-400":it.status==="today"?"bg-amber-400":"bg-zinc-600"}`} />
            <span className="flex-1 text-[9px] text-zinc-400">{it.n} · {it.date}</span>
            <span className="text-[9px] font-semibold tabular-nums text-zinc-300">{it.sum} TJS</span>
            <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-medium ${badge[it.status]}`}>{label[it.status]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MockupAnalytics() {
  return (
    <div className="flex h-full flex-col gap-2 rounded-xl border border-white/[0.08] bg-[#111113] p-4">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[11px] font-medium text-zinc-300">Аналитика и KPI</span>
        <span className="text-[9px] text-zinc-600">Q1 2025</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[
          { label:"Конверсия", val:"34%", sub:"+5% к прошлому кварталу", color:"text-amber-400" },
          { label:"Ср. сделка", val:"87 500", sub:"TJS", color:"text-zinc-100" },
          { label:"Активных сделок", val:"23", sub:"в работе сейчас", color:"text-blue-400" },
          { label:"Просрочено", val:"4", sub:"платежа требуют внимания", color:"text-red-400" },
        ].map(k => (
          <div key={k.label} className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-3">
            <div className={`mb-0.5 text-lg font-bold tabular-nums ${k.color}`}>{k.val}</div>
            <div className="text-[9px] font-medium text-zinc-400">{k.label}</div>
            <div className="text-[8px] text-zinc-600">{k.sub}</div>
          </div>
        ))}
      </div>
      <div className="flex-1 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
        <div className="mb-2 text-[9px] text-zinc-600">Объекты по статусу продаж</div>
        <div className="flex flex-col gap-2">
          {[["ЖК «Баракат»",72,"bg-emerald-400"],["ЖК «Нур»",45,"bg-amber-400"],["ЖК «Садбарг»",89,"bg-blue-400"]].map(([name,pct,color])=>(
            <div key={String(name)}>
              <div className="mb-1 flex justify-between text-[9px]">
                <span className="text-zinc-400">{String(name)}</span>
                <span className="text-zinc-500">{String(pct)}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
                <div className={`h-full rounded-full ${String(color)}`} style={{width:`${String(pct)}%`,opacity:0.7}} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
        <div className="mb-2 text-[9px] text-zinc-600">Топ менеджеры этого месяца</div>
        <div className="flex gap-2">
          {[["А.Ю","12","text-amber-400"],["Р.М","9","text-zinc-300"],["Б.К","7","text-zinc-400"]].map(([init,n,c])=>(
            <div key={init} className="flex flex-1 flex-col items-center gap-1">
              <div className="flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.05] text-[9px] font-medium text-zinc-300">{init}</div>
              <span className={`text-xs font-bold tabular-nums ${c}`}>{n}</span>
              <span className="text-[8px] text-zinc-700">сделок</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Feature Slider ───────────────────────────────────────────────────────────

const SLIDES = [
  {
    tag: "Объекты",
    title: "Шахматка квартир",
    desc: "Визуальная карта всего объекта. Каждая ячейка — квартира со статусом, площадью и ценой. Свободно/бронь/продано/резерв — одним взглядом по всему ЖК.",
    points: ["Фильтр по блоку, этажу, статусу", "Быстрое бронирование кликом", "Экспорт в PDF и Excel"],
    mockup: <MockupChess />,
  },
  {
    tag: "CRM",
    title: "Воронка продаж",
    desc: "Kanban-доска с полным путём клиента: от первого звонка до подписания договора. Каждая карточка — сделка с историей, задачами и документами.",
    points: ["Drag-and-drop между стадиями", "История взаимодействий", "Назначение менеджеров"],
    mockup: <MockupCRM />,
  },
  {
    tag: "Финансы",
    title: "Финансовый учёт",
    desc: "Кассы, банковские счета, транзакции и журнал в одном месте. Курсы НБТ обновляются автоматически для мультивалютных расчётов.",
    points: ["Мультивалютность TJS/USD/RUB", "Курсы НБТ в реальном времени", "Отчёты доходов и расходов"],
    mockup: <MockupFinance />,
  },
  {
    tag: "Платежи",
    title: "График рассрочки",
    desc: "Автоматический контроль графика платежей по каждому договору. Просроченные взносы подсвечиваются, SMS-напоминания уходят автоматически.",
    points: ["Визуальный таймлайн взносов", "SMS при просрочке", "Подтверждение оплаты"],
    mockup: <MockupPayments />,
  },
  {
    tag: "Аналитика",
    title: "KPI и отчёты",
    desc: "Дашборды с ключевыми метриками по всем объектам и сотрудникам. Конверсия, динамика продаж, загрузка менеджеров — всё в цифрах.",
    points: ["Отчёты по объектам и периодам", "Рейтинг менеджеров", "Экспорт в Excel"],
    mockup: <MockupAnalytics />,
  },
] as const;

function FeatureSlider() {
  const [active, setActive] = useState(0);
  const [animating, setAnimating] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goTo = (i: number) => {
    if (i === active || animating) return;
    setAnimating(true);
    setTimeout(() => {
      setActive(i);
      setAnimating(false);
    }, 200);
  };

  useEffect(() => {
    timerRef.current = setTimeout(() => goTo((active + 1) % SLIDES.length), 4500);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const slide = SLIDES[active]!;

  return (
    <div>
      {/* Tabs */}
      <div className="mb-8 flex gap-1 overflow-x-auto rounded-xl border border-white/[0.06] bg-white/[0.02] p-1">
        {SLIDES.map((s, i) => (
          <button key={s.tag} onClick={() => goTo(i)}
            className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium whitespace-nowrap transition-all duration-200 ${
              i === active
                ? "bg-white/[0.08] text-zinc-100"
                : "text-zinc-500 hover:text-zinc-300"
            }`}>
            {s.tag}
          </button>
        ))}
      </div>

      {/* Slide content */}
      <div className={`grid items-center gap-8 transition-opacity duration-200 lg:grid-cols-2 ${animating ? "opacity-0" : "opacity-100"}`}>
        {/* Text */}
        <div>
          <p className="mb-2 text-[11px] font-medium uppercase tracking-widest text-amber-400/60">{slide.tag}</p>
          <h3 className="mb-3 text-2xl font-semibold tracking-tight text-zinc-100">{slide.title}</h3>
          <p className="mb-5 text-sm leading-relaxed text-zinc-500">{slide.desc}</p>
          <ul className="space-y-2">
            {slide.points.map(p => (
              <li key={p} className="flex items-center gap-2.5 text-sm text-zinc-400">
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber-400/10 text-[9px] text-amber-400">✓</span>
                {p}
              </li>
            ))}
          </ul>
        </div>

        {/* Mockup */}
        <div className="h-[340px]">{slide.mockup}</div>
      </div>

      {/* Dots */}
      <div className="mt-6 flex justify-center gap-1.5">
        {SLIDES.map((_, i) => (
          <button key={i} onClick={() => goTo(i)}
            className={`h-1 rounded-full transition-all duration-300 ${i === active ? "w-6 bg-amber-400" : "w-1.5 bg-zinc-700 hover:bg-zinc-500"}`} />
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100">

      {/* ── Nav ── */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.06] bg-[#09090b]/90 backdrop-blur-md">
        <div className="mx-auto flex h-13 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-amber-400 text-xs font-bold text-zinc-900">H</span>
            <span className="text-sm font-semibold text-zinc-100">Hisob Building</span>
            <span className="hidden rounded-full border border-amber-400/20 bg-amber-400/10 px-2 py-0.5 text-[10px] text-amber-400/80 sm:inline">CRM для застройщиков</span>
          </div>
          <Link href={routes.login}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-amber-400 px-4 text-xs font-semibold text-zinc-900 transition-colors hover:bg-amber-300">
            Войти →
          </Link>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="mx-auto max-w-6xl px-6 pb-16 pt-28">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Left */}
          <div className="animate-[fadeUp_0.6s_ease_forwards]">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-[11px] text-zinc-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              Версия MVP · Готово к работе
            </div>
            <h1 className="mb-4 text-4xl font-semibold leading-[1.1] tracking-tight text-zinc-50 xl:text-5xl">
              Управление стройкой<br />
              <span className="text-zinc-500">без хаоса в таблицах</span>
            </h1>
            <p className="mb-7 text-sm leading-relaxed text-zinc-500">
              Единая система для застройщиков: шахматка квартир, CRM-воронка, финансовый учёт, склад и аналитика. Все данные на одном экране.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href={routes.login}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-amber-400 px-6 text-sm font-semibold text-zinc-900 transition-all hover:bg-amber-300">
                Войти в систему
                <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth="2">
                  <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <a href="#features"
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/[0.08] px-6 text-sm text-zinc-400 transition-colors hover:border-white/[0.15] hover:text-zinc-200">
                Смотреть возможности
              </a>
            </div>

            {/* Quick stats */}
            <div className="mt-8 flex gap-6 border-t border-white/[0.06] pt-6">
              {[["10", "модулей"], ["9", "ролей"], ["4", "языка"], ["40+", "компонентов"]].map(([v, l]) => (
                <div key={l}>
                  <div className="text-xl font-bold tabular-nums text-zinc-100">{v}</div>
                  <div className="text-[11px] text-zinc-600">{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Dashboard mockup */}
          <div className="animate-[fadeUp_0.6s_0.15s_ease_both] lg:h-[420px]">
            <DashboardMockup />
          </div>
        </div>
      </section>

      {/* ── Ticker ── */}
      <div className="border-y border-white/[0.06] bg-white/[0.02] py-3 overflow-hidden">
        <div className="flex animate-[ticker_20s_linear_infinite] gap-12 whitespace-nowrap">
          {["Шахматка объектов","Сделки и рассрочка","Финансовый журнал","Склад материалов","Подрядчики","Аналитика KPI","SMS-уведомления","PDF договора","Курсы НБТ","Мультиязычность",
            "Шахматка объектов","Сделки и рассрочка","Финансовый журнал","Склад материалов","Подрядчики","Аналитика KPI","SMS-уведомления","PDF договора","Курсы НБТ","Мультиязычность",
          ].map((item, i) => (
            <span key={i} className="text-xs text-zinc-600">
              <span className="mr-12 text-amber-400/40">✦</span>{item}
            </span>
          ))}
        </div>
      </div>

      {/* ── Features ── */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-20">
        <Reveal>
          <div className="mb-10">
            <p className="mb-2 text-[11px] font-medium uppercase tracking-widest text-amber-400/60">Возможности</p>
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-100">Всё что нужно застройщику</h2>
          </div>
        </Reveal>

        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: "⬛", title: "Шахматка квартир", desc: "Визуальная сетка по блокам и этажам. Свободно/бронь/продано/резерв — одним взглядом." },
            { icon: "👥", title: "CRM и воронка", desc: "Клиенты, сделки, этапы продаж. Kanban-доска с drag-and-drop по стадиям." },
            { icon: "💰", title: "Финансы и счета", desc: "Кассы, банковские счета, транзакции, журнал. Отчёты по доходам и расходам." },
            { icon: "📋", title: "Договоры и рассрочка", desc: "График платежей, контроль просрочки, PDF-генерация, подтверждение оплат." },
            { icon: "📦", title: "Склад", desc: "Материалы, движение товара, поставщики, история остатков на объекте." },
            { icon: "🔧", title: "Подрядчики", desc: "База исполнителей, наряды, учёт выполненных работ и финансовых расчётов." },
            { icon: "📊", title: "Аналитика и KPI", desc: "Дашборды, отчёты по объектам, динамика продаж, контроль ключевых метрик." },
            { icon: "📱", title: "SMS и шаблоны", desc: "Уведомления клиентам, массовые рассылки, редактор SMS-шаблонов." },
            { icon: "🌐", title: "4 языка", desc: "Русский, английский, узбекский, таджикский. Переключение без перезагрузки." },
          ].map((f, i) => (
            <Reveal key={f.title} delay={i * 50}>
              <FeatureItem {...f} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="border-t border-white/[0.06]">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <Reveal>
            <div className="mb-10">
              <p className="mb-2 text-[11px] font-medium uppercase tracking-widest text-amber-400/60">Как работает</p>
              <h2 className="text-2xl font-semibold tracking-tight text-zinc-100">Три шага до контроля над стройкой</h2>
            </div>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { n: "01", title: "Настройте объект", body: "Добавьте ЖК, создайте блоки и квартиры. Система автоматически построит шахматку и начнёт отслеживать статусы.", accent: "border-amber-400/20 bg-amber-400/[0.04]" },
              { n: "02", title: "Работайте с клиентами", body: "Бронируйте квартиры, оформляйте сделки, задавайте графики платежей. CRM показывает весь путь клиента.", accent: "border-white/[0.07] bg-white/[0.02]" },
              { n: "03", title: "Контролируйте всё", body: "Финансы, склад, подрядчики, аналитика — в реальном времени. Каждый отдел видит только своё.", accent: "border-white/[0.07] bg-white/[0.02]" },
            ].map((s, i) => (
              <Reveal key={s.n} delay={i * 80}>
                <div className={`h-full rounded-xl border p-6 ${s.accent}`}>
                  <span className="mb-4 block text-3xl font-bold tabular-nums text-white/[0.07]">{s.n}</span>
                  <h3 className="mb-2 text-sm font-semibold text-zinc-200">{s.title}</h3>
                  <p className="text-xs leading-relaxed text-zinc-500">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature Slider ── */}
      <section className="border-t border-white/[0.06]">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <Reveal>
            <div className="mb-10">
              <p className="mb-2 text-[11px] font-medium uppercase tracking-widest text-amber-400/60">Подробнее</p>
              <h2 className="text-2xl font-semibold tracking-tight text-zinc-100">Ключевые функции системы</h2>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <FeatureSlider />
          </Reveal>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="border-t border-white/[0.06]">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <Reveal>
            <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02] p-10 text-center">
              <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/25 to-transparent" />
              <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-32 w-64 -translate-x-1/2 rounded-full bg-amber-400/[0.05] blur-2xl" />
              <p className="relative mb-2 text-[11px] font-medium uppercase tracking-widest text-amber-400/60">Начните прямо сейчас</p>
              <h2 className="relative mb-3 text-2xl font-semibold tracking-tight text-zinc-100">Ваши данные уже ждут</h2>
              <p className="relative mb-7 text-sm text-zinc-500">Войдите в систему и начните управлять объектами.</p>
              <Link href={routes.login}
                className="relative inline-flex h-11 items-center gap-2 rounded-xl bg-amber-400 px-8 text-sm font-semibold text-zinc-900 transition-all hover:bg-amber-300">
                Войти в Hisob Building
                <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth="2">
                  <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/[0.06] py-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-amber-400 text-[10px] font-bold text-zinc-900">H</span>
            <span className="text-xs font-medium text-zinc-500">Hisob Building</span>
          </div>
          <p className="text-xs text-zinc-700">CRM-система для управления строительными объектами · Таджикистан</p>
        </div>
      </footer>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ticker {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
