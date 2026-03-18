"use client";

import { useMemo } from "react";
import { cn } from "@/shared/lib/ui/cn";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export type AppChartType = "bar" | "line" | "area" | "pie" | "doughnut";

export interface AppChartSeries {
  key: string;
  label: string;
  color?: string;
}

export interface AppChartDataPoint {
  label: string;
  [key: string]: string | number;
}

interface AppChartWidgetProps {
  type: AppChartType;
  data: readonly AppChartDataPoint[];
  series: readonly AppChartSeries[];
  title?: string;
  height?: number;
  loading?: boolean;
  stacked?: boolean;
  showLegend?: boolean;
  showGrid?: boolean;
  className?: string;
  formatValue?: (value: number) => string;
  formatLabel?: (label: string) => string;
}

const DEFAULT_COLORS = [
  "#F59E0B", // amber — primary brand
  "#10B981", // emerald — success
  "#EF4444", // red — danger
  "#3B82F6", // blue — info
  "#8B5CF6", // violet — accent
  "#F97316", // orange — secondary
  "#EC4899", // pink
  "#14B8A6", // teal
  "#6366F1", // indigo
  "#84CC16", // lime
];

export function AppChartWidget({
  type,
  data,
  series,
  title,
  height = 300,
  loading = false,
  stacked = false,
  showLegend = true,
  showGrid = true,
  className,
  formatValue,
  formatLabel,
}: AppChartWidgetProps) {
  const coloredSeries = useMemo(
    () =>
      series.map((s, i) => ({
        ...s,
        color: s.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length]!,
      })),
    [series],
  );

  if (loading) {
    return (
      <div className={cn("rounded-xl border border-border bg-card p-4 shadow-sm", className)}>
        {title ? <div className="mb-3 h-5 w-40 animate-pulse rounded bg-muted" /> : null}
        <div className="animate-pulse rounded-lg bg-muted" style={{ height }} />
      </div>
    );
  }

  const renderCartesian = () => {
    const commonProps = {
      data: data as AppChartDataPoint[],
      margin: { top: 4, right: 8, left: 0, bottom: 4 },
    };

    const xAxis = formatLabel ? (
      <XAxis dataKey="label" tick={{ fontSize: 11 }} tickFormatter={formatLabel} tickLine={false} />
    ) : (
      <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} />
    );
    const yAxis = formatValue ? (
      <YAxis tick={{ fontSize: 11 }} tickFormatter={formatValue} tickLine={false} width={64} />
    ) : (
      <YAxis tick={{ fontSize: 11 }} tickLine={false} width={40} />
    );
    const grid = showGrid ? (
      <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
    ) : null;
    const legend = showLegend ? (
      <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
    ) : null;
    const tooltip = formatValue ? (
      <Tooltip formatter={(v) => [formatValue(v as number), ""]} />
    ) : (
      <Tooltip />
    );

    if (type === "bar") {
      return (
        <BarChart {...commonProps}>
          {grid}
          {xAxis}
          {yAxis}
          {tooltip}
          {legend}
          {coloredSeries.map((s) =>
            stacked ? (
              <Bar dataKey={s.key} fill={s.color} key={s.key} name={s.label} radius={[3, 3, 0, 0]} stackId="stack" />
            ) : (
              <Bar dataKey={s.key} fill={s.color} key={s.key} name={s.label} radius={[3, 3, 0, 0]} />
            ),
          )}
        </BarChart>
      );
    }

    if (type === "line") {
      return (
        <LineChart {...commonProps}>
          {grid}
          {xAxis}
          {yAxis}
          {tooltip}
          {legend}
          {coloredSeries.map((s) => (
            <Line activeDot={{ r: 5 }} dataKey={s.key} dot={false} key={s.key} name={s.label} stroke={s.color} strokeWidth={2} type="monotone" />
          ))}
        </LineChart>
      );
    }

    return (
      <AreaChart {...commonProps}>
        {grid}
        {xAxis}
        {yAxis}
        {tooltip}
        {legend}
        {coloredSeries.map((s) =>
          stacked ? (
            <Area dataKey={s.key} fill={s.color} fillOpacity={0.15} key={s.key} name={s.label} stackId="stack" stroke={s.color} strokeWidth={2} type="monotone" />
          ) : (
            <Area dataKey={s.key} fill={s.color} fillOpacity={0.15} key={s.key} name={s.label} stroke={s.color} strokeWidth={2} type="monotone" />
          ),
        )}
      </AreaChart>
    );
  };

  const renderPie = () => {
    const isDoughnut = type === "doughnut";
    const pieData = data.map((d) => ({
      name: d.label,
      value: typeof d.value === "number" ? d.value : 0,
    }));
    return (
      <PieChart>
        <Pie
          cx="50%"
          cy="50%"
          data={pieData}
          dataKey="value"
          innerRadius={isDoughnut ? "55%" : 0}
          outerRadius="80%"
          paddingAngle={isDoughnut ? 3 : 0}
        >
          {pieData.map((_, i) => (
            <Cell fill={DEFAULT_COLORS[i % DEFAULT_COLORS.length] ?? "var(--color-primary)"} key={`cell-${i}`} />
          ))}
        </Pie>
        {formatValue ? (
          <Tooltip formatter={(v) => [formatValue(v as number), ""]} />
        ) : (
          <Tooltip />
        )}
        {showLegend ? <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} /> : null}
      </PieChart>
    );
  };

  const isPie = type === "pie" || type === "doughnut";

  return (
    <div className={cn("rounded-xl border border-border bg-card p-4 shadow-sm", className)}>
      {title ? (
        <p className="mb-3 text-sm font-semibold text-foreground">{title}</p>
      ) : null}
      <div style={{ width: "100%", height }}>
        <ResponsiveContainer height="100%" width="100%">
          {isPie ? renderPie() : renderCartesian()}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
