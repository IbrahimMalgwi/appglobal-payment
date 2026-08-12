import { ReactNode } from "react";
import { clsx } from "clsx";
import { InteractiveTable } from "./InteractiveTable";

export interface Column<T> {
  header: string;
  align?: "left" | "right";
  hideOnMobile?: boolean; // hides this column below the sm breakpoint
  sortable?: boolean; // enables header-click sorting (requires sortValue to take effect)
  sortValue?: (row: T) => string | number; // comparable value used when sorting this column
  render: (row: T) => ReactNode;
}

export interface TableProps<T> {
  columns: Column<T>[];
  rows: T[];
  emptyMessage?: ReactNode;
  pageSize?: number; // undefined = no pagination (default, static behavior)
  onRowClick?: (row: T) => void;
}

/**
 * Shared table. Callers that opt into sorting, pagination, or row clicks are handed off
 * to the client-only <InteractiveTable> (which manages its own sort/page state). Plain
 * callers render the original static markup here, so <Table> stays usable from server
 * components — no function props ever cross a server→client boundary on that path.
 */
export function Table<T extends { id: string }>(props: TableProps<T>) {
  const { columns, rows, emptyMessage = "No records yet", pageSize, onRowClick } = props;

  const isInteractive =
    pageSize != null || !!onRowClick || columns.some((c) => c.sortable && c.sortValue);
  if (isInteractive) {
    return <InteractiveTable {...props} />;
  }

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
      <table className="w-full min-w-[560px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-surface-border text-left">
            {columns.map((col) => (
              <th
                key={col.header}
                className={clsx(
                  "whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-400",
                  col.align === "right" ? "text-right" : "text-left",
                  col.hideOnMobile && "hidden sm:table-cell"
                )}
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
                  className={clsx(
                    "whitespace-nowrap px-4 py-3.5 tabular",
                    col.align === "right" ? "text-right" : "text-left",
                    col.hideOnMobile && "hidden sm:table-cell"
                  )}
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
