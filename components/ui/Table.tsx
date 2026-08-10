import { ReactNode } from "react";

export interface Column<T> {
  header: string;
  align?: "left" | "right";
  render: (row: T) => ReactNode;
}

export function Table<T extends { id: string }>({
  columns,
  rows,
  emptyMessage = "No records yet",
}: {
  columns: Column<T>[];
  rows: T[];
  emptyMessage?: string;
}) {
  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-1 py-16 text-center">
        <p className="font-display text-sm font-semibold text-ink-700">Nothing here yet</p>
        <p className="text-sm text-ink-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-surface-border text-left">
            {columns.map((col) => (
              <th
                key={col.header}
                className={`whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-400 ${
                  col.align === "right" ? "text-right" : "text-left"
                }`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-surface-border/70 last:border-0 hover:bg-surface/60">
              {columns.map((col) => (
                <td
                  key={col.header}
                  className={`whitespace-nowrap px-4 py-3.5 tabular ${
                    col.align === "right" ? "text-right" : "text-left"
                  }`}
                >
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
