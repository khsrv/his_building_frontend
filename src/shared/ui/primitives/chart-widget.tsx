"use client";

import { useMemo } from "react";
import { Box, Paper, Typography, Skeleton } from "@mui/material";
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
  "#2563eb",
  "#16a34a",
  "#dc2626",
  "#d97706",
  "#7c3aed",
  "#0891b2",
  "#be185d",
  "#65a30d",
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
      <Paper className={className} sx={{ p: 2 }} variant="outlined">
        {title ? <Skeleton height={24} sx={{ mb: 1.5 }} width={180} /> : null}
        <Skeleton height={height} variant="rectangular" />
      </Paper>
    );
  }

  const renderCartesian = () => {
    const commonProps = {
      data: data as AppChartDataPoint[],
      margin: { top: 4, right: 8, left: 0, bottom: 4 },
    };

    const xAxis = formatLabel ? (
      <XAxis
        dataKey="label"
        tick={{ fontSize: 11 }}
        tickFormatter={formatLabel}
        tickLine={false}
      />
    ) : (
      <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} />
    );
    const yAxis = formatValue ? (
      <YAxis
        tick={{ fontSize: 11 }}
        tickFormatter={formatValue}
        tickLine={false}
        width={64}
      />
    ) : (
      <YAxis tick={{ fontSize: 11 }} tickLine={false} width={40} />
    );
    const grid = showGrid ? (
      <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" vertical={false} />
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
              <Bar
                dataKey={s.key}
                fill={s.color}
                key={s.key}
                name={s.label}
                radius={[3, 3, 0, 0]}
                stackId="stack"
              />
            ) : (
              <Bar
                dataKey={s.key}
                fill={s.color}
                key={s.key}
                name={s.label}
                radius={[3, 3, 0, 0]}
              />
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
            <Line
              activeDot={{ r: 5 }}
              dataKey={s.key}
              dot={false}
              key={s.key}
              name={s.label}
              stroke={s.color}
              strokeWidth={2}
              type="monotone"
            />
          ))}
        </LineChart>
      );
    }

    // area
    return (
      <AreaChart {...commonProps}>
        {grid}
        {xAxis}
        {yAxis}
        {tooltip}
        {legend}
        {coloredSeries.map((s) =>
          stacked ? (
            <Area
              dataKey={s.key}
              fill={s.color}
              fillOpacity={0.15}
              key={s.key}
              name={s.label}
              stackId="stack"
              stroke={s.color}
              strokeWidth={2}
              type="monotone"
            />
          ) : (
            <Area
              dataKey={s.key}
              fill={s.color}
              fillOpacity={0.15}
              key={s.key}
              name={s.label}
              stroke={s.color}
              strokeWidth={2}
              type="monotone"
            />
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
            <Cell
              fill={DEFAULT_COLORS[i % DEFAULT_COLORS.length] ?? "#2563eb"}
              key={`cell-${i}`}
            />
          ))}
        </Pie>
        {formatValue ? (
          <Tooltip formatter={(v) => [formatValue(v as number), ""]} />
        ) : (
          <Tooltip />
        )}
        {showLegend ? (
          <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
        ) : null}
      </PieChart>
    );
  };

  const isPie = type === "pie" || type === "doughnut";

  return (
    <Paper className={className} sx={{ p: 2 }} variant="outlined">
      {title ? (
        <Typography sx={{ mb: 1.5, fontWeight: 600 }} variant="subtitle2">
          {title}
        </Typography>
      ) : null}
      <Box sx={{ width: "100%", height }}>
        <ResponsiveContainer height="100%" width="100%">
          {isPie ? renderPie() : renderCartesian()}
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
}
