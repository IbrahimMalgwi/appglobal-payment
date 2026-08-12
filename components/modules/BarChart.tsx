"use client";

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export interface BarChartDatum {
  label: string;
  value: number;
  displayValue: string;
}

// Actual brand-500 hex from tailwind.config.ts — recharts needs a real color, not a class.
const BRAND_500 = "#1BA2FF";

function truncate(name: string, max = 12): string {
  return name.length > max ? `${name.slice(0, max - 1)}…` : name;
}

// Compact axis tick: currency metrics get a ₦ prefix + k/M abbreviation, counts stay plain.
function formatYTick(value: number, currency: boolean): string {
  if (!currency) return value.toLocaleString("en-NG");
  if (value >= 1_000_000) return `₦${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `₦${Math.round(value / 1_000)}k`;
  return `₦${value}`;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: { payload: BarChartDatum }[];
}

function ChartTooltip({ active, payload }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  const datum = payload[0].payload;
  return (
    <div className="rounded-lg border border-surface-border bg-surface-card px-3 py-2 shadow-panel">
      <p className="text-xs font-medium text-ink-500">{datum.label}</p>
      <p className="text-sm font-bold text-ink-900">{datum.displayValue}</p>
    </div>
  );
}

export function BarChart({ data }: { data: BarChartDatum[] }) {
  // Infer currency formatting from the pre-formatted displayValue the caller passes in,
  // so the component keeps its exact { data } prop shape and no caller needs to change.
  const currency = data.length > 0 && data.every((d) => d.displayValue.trim().startsWith("₦"));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsBarChart data={data} margin={{ top: 8, right: 8, bottom: 24, left: 0 }} barCategoryGap="25%">
        <CartesianGrid strokeDasharray="3 3" stroke="#E6EAF0" vertical={false} />
        <XAxis
          dataKey="label"
          tickFormatter={(name: string) => truncate(name)}
          angle={-20}
          textAnchor="end"
          height={56}
          interval={0}
          tick={{ fill: "#717E95", fontSize: 11 }}
          tickLine={false}
          axisLine={{ stroke: "#E6EAF0" }}
        />
        <YAxis
          width={56}
          tickFormatter={(value: number) => formatYTick(value, currency)}
          tick={{ fill: "#717E95", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(27, 162, 255, 0.08)" }} />
        <Bar dataKey="value" fill={BRAND_500} radius={[6, 6, 0, 0]} maxBarSize={56} />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
