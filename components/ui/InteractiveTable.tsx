"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from "lucide-react";
import { clsx } from "clsx";
import type { Column, TableProps } from "./Table";

type SortDir = "asc" | "desc";
interface SortState {
  header: string;
  dir: SortDir;
}

/**
 * Client-side sortable/paginated table. Rendered by <Table> only when a caller opts
 * into sorting, pagination, or row clicks — so its interactive/function props never
 * cross a server→client boundary (server callers hit the static path in <Table>).
 */
export function InteractiveTable<T extends { id: string }>({
  columns,
  rows,
  emptyMessage = "No records yet",
  pageSize,
  onRowClick,
}: TableProps<T>) {
  const [sort, setSort] = useState<SortState | null>(null);
  const [page, setPage] = useState(0);

  const sortedRows = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.header === sort.header);
    if (!col?.sortValue) return rows;
    const getValue = col.sortValue;
    return [...rows].sort((a, b) => {
      const av = getValue(a);
      const bv = getValue(b);
      let cmp: number;
      if (typeof av === "number" && typeof bv === "number") cmp = av - bv;
      else cmp = String(av).localeCompare(String(bv));
      return sort.dir === "asc" ? cmp : -cmp;
    });
  }, [rows, sort, columns]);

  const totalPages = pageSize ? Math.max(1, Math.ceil(sortedRows.length / pageSize)) : 1;
  const currentPage = Math.min(page, totalPages - 1);
  const visibleRows = pageSize
    ? sortedRows.slice(currentPage * pageSize, currentPage * pageSize + pageSize)
    : sortedRows;

  function toggleSort(col: Column<T>) {
    if (!col.sortable || !col.sortValue) return;
    setPage(0);
    setSort((prev) => {
      if (!prev || prev.header !== col.header) return { header: col.header, dir: "asc" };
      if (prev.dir === "asc") return { header: col.header, dir: "desc" };
      return null; // third click clears sorting back to insertion order
    });
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
    <div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-surface-border text-left">
              {columns.map((col) => {
                const isSortable = !!col.sortable && !!col.sortValue;
                const isActive = sort?.header === col.header;
                return (
                  <th
                    key={col.header}
                    className={clsx(
                      "whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-400",
                      col.align === "right" ? "text-right" : "text-left",
                      col.hideOnMobile && "hidden sm:table-cell"
                    )}
                  >
                    {isSortable ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(col)}
                        className={clsx(
                          "inline-flex items-center gap-1 uppercase tracking-wide hover:text-ink-700",
                          col.align === "right" && "flex-row-reverse",
                          isActive && "text-ink-700"
                        )}
                      >
                        {col.header}
                        {isActive && sort?.dir === "asc" ? (
                          <ChevronUp size={13} />
                        ) : isActive && sort?.dir === "desc" ? (
                          <ChevronDown size={13} />
                        ) : (
                          <ChevronDown size={13} className="text-ink-300" />
                        )}
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => (
              <tr
                key={row.id}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={clsx(
                  "border-b border-surface-border/70 last:border-0 hover:bg-surface/60",
                  onRowClick && "cursor-pointer"
                )}
              >
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

      {pageSize && totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-surface-border px-4 py-3">
          <p className="text-xs text-ink-400">
            Page {currentPage + 1} of {totalPages}
          </p>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="flex items-center gap-1 rounded-lg border border-surface-border px-2.5 py-1.5 text-xs font-semibold text-ink-700 hover:bg-surface disabled:opacity-40"
            >
              <ChevronLeft size={14} /> Prev
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setPage(i)}
                className={clsx(
                  "h-8 w-8 rounded-lg border text-xs font-semibold",
                  i === currentPage
                    ? "border-brand-500 bg-brand-500 text-white"
                    : "border-surface-border text-ink-700 hover:bg-surface"
                )}
              >
                {i + 1}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage === totalPages - 1}
              className="flex items-center gap-1 rounded-lg border border-surface-border px-2.5 py-1.5 text-xs font-semibold text-ink-700 hover:bg-surface disabled:opacity-40"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
