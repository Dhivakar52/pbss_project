import { useState, useMemo } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import Pagination from '@/common/Pagination'
import { Search, School } from 'lucide-react'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'

export interface SeatAvailabilityTableProps<T extends Record<string, any>> {
  title: string
  subtitle?: string
  data: T[]
  columns: ColumnDef<T>[]
  searchPlaceholder?: string
  iconColorClass?: string
  badgeLabel?: string
}

export function SeatAvailabilityTable<T extends Record<string, any>>({
  title,
  subtitle = 'Seat availability breakdown by date and time slot',
  data,
  columns,
  searchPlaceholder = 'Search Date / Slot',
  iconColorClass = 'bg-blue-50 dark:bg-blue-950/60 text-[#1677FF] dark:text-blue-400',
  badgeLabel,
}: SeatAvailabilityTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sorting, setSorting] = useState<SortingState>([])

  // Global search filtering
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data
    const q = searchTerm.toLowerCase()
    return data.filter((item) =>
      Object.values(item).some((val) =>
        String(val).toLowerCase().includes(q)
      )
    )
  }, [data, searchTerm])

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 5,
      },
    },
  })

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-slate-200/90 dark:border-slate-800 p-5 space-y-4">
      {/* ================= CARD HEADER & SEARCH BAR ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100 dark:border-slate-800">
        {/* Left: Title & Subtitle */}
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${iconColorClass}`}>
            <School className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                {title}
              </h2>
              {badgeLabel && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {badgeLabel}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{subtitle}</p>
          </div>
        </div>

        {/* Right: Search Input */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative flex items-center min-w-[180px] sm:min-w-[200px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={searchPlaceholder}
              className="h-9 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 pl-9 pr-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* ================= DATA TABLE CONTAINER & SHADCN TABLE ================= */}
      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <div className="overflow-x-auto max-w-full">
          <Table className="w-full text-left text-xs border-collapse">
            {/* Header Row */}
            <TableHeader
              className="text-white font-semibold uppercase tracking-wider select-none"
              style={{ background: 'var(--table-header-bg, #13729d)' }}
            >
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="border-b-0 hover:bg-transparent">
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="py-3 px-4 border-white/20 text-white font-semibold uppercase tracking-wider whitespace-nowrap h-auto"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-medium">
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800/60"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-3 px-4 whitespace-nowrap">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="py-12 text-center text-slate-400"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <School className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                      <span className="font-semibold text-sm">
                        No records found.
                      </span>
                      <span className="text-xs text-slate-400">
                        Try adjusting your search keyword.
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* ================= PAGINATION FOOTER ================= */}
      <Pagination table={table} totalCount={filteredData.length} pageSizeOptions={[5, 10, 20]} />
    </div>
  )
}

export default SeatAvailabilityTable
