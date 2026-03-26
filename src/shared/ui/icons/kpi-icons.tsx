/**
 * KPI card icons — inline SVGs from /icons/ folder.
 * All icons use currentColor and are 24x24 by default.
 */

interface IconProps {
  size?: number;
  className?: string;
}

function Svg({ size = 24, className, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {children}
    </svg>
  );
}

/** Income / Revenue */
export function IconIncome(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0-6 0" />
      <path d="M18 12h.01" />
      <path d="M6 12h.01" />
    </Svg>
  );
}

/** Expense / Outgoing */
export function IconExpense(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M15 11v.01" />
      <path d="M5.173 8.378a3 3 0 1 1 4.656-1.377" />
      <path d="M16 4v3.803A6.019 6.019 0 0 1 18.658 11h1.341A1 1 0 0 1 21 12v2a1 1 0 0 1-1 1h-1.342c-.336.95-.907 1.8-1.658 2.473V19.5a1.5 1.5 0 0 1-3 0v-.583a6.04 6.04 0 0 1-1 .083h-4a6.04 6.04 0 0 1-1-.083v.583a1.5 1.5 0 0 1-3 0v-1.527A6.028 6.028 0 0 1 3 13a6 6 0 0 1 6-6h2" />
      <path d="M16 4l2 2l-2 2" />
    </Svg>
  );
}

/** Profit / Net */
export function IconProfit(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 17l6-6l4 4l6-6" />
      <path d="M14 9h6v6" />
    </Svg>
  );
}

/** Debt / Receivables */
export function IconDebt(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 6v12" />
      <path d="M6 12h12" />
      <circle cx="12" cy="12" r="10" />
    </Svg>
  );
}

/** Building / Units */
export function IconBuilding(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3 21h18" />
      <path d="M9 8h1" />
      <path d="M9 12h1" />
      <path d="M9 16h1" />
      <path d="M14 8h1" />
      <path d="M14 12h1" />
      <path d="M14 16h1" />
      <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
    </Svg>
  );
}

/** Available / Free */
export function IconAvailable(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M5 12l5 5L20 7" />
    </Svg>
  );
}

/** Active deals / Handshake */
export function IconDeals(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M11 17a2.5 2.5 0 0 0 2 0" />
      <path d="M12 2v1" />
      <path d="M4.6 5.3l.7.7" />
      <path d="M19.4 5.3l-.7.7" />
      <path d="M17 12a5 5 0 1 0-10 0 5 5 0 0 0 10 0z" />
      <path d="M12 17v5" />
    </Svg>
  );
}

/** Overdue / Warning */
export function IconOverdue(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
      <path d="M10.363 3.591L2.257 17.125a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636-2.87L13.637 3.59a1.914 1.914 0 0 0-3.274 0z" />
    </Svg>
  );
}

/** Calendar / Schedule */
export function IconCalendar(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M16 3v2" />
      <path d="M8 3v2" />
      <path d="M4 7h16" />
      <rect x="4" y="5" width="16" height="16" rx="2" />
      <path d="M8 11h.01" />
      <path d="M12 11h.01" />
      <path d="M16 11h.01" />
      <path d="M8 15h.01" />
      <path d="M12 15h.01" />
      <path d="M16 15h.01" />
    </Svg>
  );
}

/** Wallet / Account */
export function IconWallet(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M17 8V5a1 1 0 0 0-1-1H6a2 2 0 0 0 0 4h12a1 1 0 0 1 1 1v3m0 4v3a1 1 0 0 1-1 1H6a2 2 0 0 1-2-2V6" />
      <path d="M20 12v4h-4a2 2 0 0 1 0-4h4" />
    </Svg>
  );
}

/** Coins / Money */
export function IconCoins(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M9 14c0 1.657 2.686 3 6 3s6-1.343 6-3-2.686-3-6-3-6 1.343-6 3z" />
      <path d="M9 14v4c0 1.656 2.686 3 6 3s6-1.344 6-3v-4" />
      <path d="M3 6c0 1.072 1.144 2.062 3 2.598s4.144.536 6 0c1.856-.536 3-1.526 3-2.598 0-1.072-1.144-2.062-3-2.598s-4.144-.536-6 0C4.144 3.938 3 4.928 3 6z" />
      <path d="M3 6v10c0 .888.585 1.715 1.543 2.306" />
      <path d="M3 11c0 .888.585 1.715 1.543 2.306" />
    </Svg>
  );
}

/** Users / Clients */
export function IconClients(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M9 7a4 4 0 1 0 6 0a4 4 0 0 0-6 0" />
      <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
    </Svg>
  );
}

/** Bell / Reminder */
export function IconBell(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M10 5a2 2 0 1 1 4 0a7 7 0 0 1 4 6v3a4 4 0 0 0 2 3H4a4 4 0 0 0 2-3v-3a7 7 0 0 1 4-6" />
      <path d="M9 17v1a3 3 0 0 0 6 0v-1" />
    </Svg>
  );
}

/** Category / Grid */
export function IconCategory(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="4" y="4" width="6" height="6" rx="1" />
      <rect x="14" y="4" width="6" height="6" rx="1" />
      <rect x="4" y="14" width="6" height="6" rx="1" />
      <rect x="14" y="14" width="6" height="6" rx="1" />
    </Svg>
  );
}

/** Home / Property */
export function IconHome(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M5 12l-2 0l9-9l9 9l-2 0" />
      <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
      <path d="M9 21v-6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6" />
    </Svg>
  );
}
