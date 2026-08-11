export interface BarChartDatum {
  label: string;
  value: number;
  displayValue: string;
}

export function BarChart({ data }: { data: BarChartDatum[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="space-y-4">
      {data.map((d) => (
        <div key={d.label}>
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="font-medium text-ink-700">{d.label}</span>
            <span className="font-semibold text-ink-900">{d.displayValue}</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface">
            <div
              className="h-full rounded-full bg-brand-500"
              style={{ width: `${Math.max((d.value / max) * 100, 3)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
