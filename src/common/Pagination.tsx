import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationTable {
  getState: () => { pagination: { pageIndex: number; pageSize: number } };
  setPageIndex: (index: number) => void;
  setPageSize: (size: number) => void;
  previousPage: () => void;
  nextPage: () => void;
  getCanPreviousPage: () => boolean;
  getCanNextPage: () => boolean;
}

interface PaginationProps {
  table: PaginationTable;
  totalCount: number;
  pageSizeOptions?: number[];
}

const Pagination: React.FC<PaginationProps> = ({
  table,
  totalCount,
  pageSizeOptions = [5, 10, 20, 50, 100],
}) => {
  if (!table) return null;

  const { pageIndex, pageSize } = table.getState().pagination;
  const currentPage = pageIndex + 1;
  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  if (totalCount === 0) return null;

  const start = Math.min(pageIndex * pageSize + 1, totalCount);
  const end = Math.min((pageIndex + 1) * pageSize, totalCount);

  const getVisiblePages = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    if (currentPage <= 3) {
      pages.push(1, 2, "...", totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1, "...", totalPages - 1, totalPages);
    } else {
      pages.push(1, "...", currentPage, "...", totalPages);
    }

    return pages;
  };

  const pages = getVisiblePages();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
      {/* LEFT: Records Count & Records Per Page Dropdown */}
      <div className="flex items-center gap-3 flex-wrap">
        <div>
          Showing <span className="font-bold text-slate-900 dark:text-white">{start}</span> to{" "}
          <span className="font-bold text-slate-900 dark:text-white">{end}</span> of{" "}
          <span className="font-bold text-slate-900 dark:text-white">{totalCount}</span> records
        </div>

        <div className="flex items-center gap-1.5">
          <span>Per page:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              const newSize = Number(e.target.value);
              table.setPageSize(newSize);
              table.setPageIndex(0);
            }}
            className="h-7 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* RIGHT: Page Navigation Buttons */}
      <div className="flex items-center gap-1">
        {/* Previous */}
        <button
          type="button"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="h-7 w-7 flex items-center justify-center rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:text-slate-900 disabled:opacity-30 cursor-pointer transition-colors"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>

        {/* Page Numbers */}
        {pages.map((p, index) => {
          if (p === "...") {
            return (
              <span key={`ellip-${index}`} className="px-1 text-slate-400 font-medium select-none">
                ...
              </span>
            );
          }

          return (
            <button
              key={`pg-${p}`}
              type="button"
              onClick={() => table.setPageIndex(Number(p) - 1)}
              className={`h-7 min-w-[28px] px-2 rounded border text-xs font-semibold transition-all cursor-pointer ${
                p === currentPage
                  ? "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-900 font-bold"
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              {p}
            </button>
          );
        })}

        {/* Next */}
        <button
          type="button"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="h-7 w-7 flex items-center justify-center rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:text-slate-900 disabled:opacity-30 cursor-pointer transition-colors"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
