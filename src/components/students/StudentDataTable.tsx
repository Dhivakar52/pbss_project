import { useState, useMemo } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type RowSelectionState,
} from '@tanstack/react-table'
import Pagination from '@/common/Pagination'
import {
  Search,
  Calendar as CalendarIcon,
  SlidersHorizontal,
  Plus,
  ArrowUpDown,
  UserCheck,
  CheckCircle2,
  Clock,
  Menu,
  Eye,
  Edit3,
  Trash2,
  Filter,
  FileSpreadsheet,
  Printer,
  FileText,
  Layers,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { StudentRecord } from '@/data/mockStudents'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { toast } from '@/components/ui/toast'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'

export interface StudentDataTableProps {
  title?: string
  subtitle?: string
  data: StudentRecord[]
  searchTerm?: string
  onSearchChange?: (val: string) => void
  searchPlaceholder?: string
  onView?: (record: StudentRecord) => void
  onEdit?: (record: StudentRecord) => void
  onDelete?: (record: StudentRecord) => void
  onAddNew?: () => void
  onBulkUpdate?: () => void
  onSelectId?: (record: StudentRecord) => void
  showCheckmarkCols?: boolean
  onExportExcel?: () => void
  onPrint?: () => void
  onToggleFilterPanel?: () => void
  onPrintTrackSheet?: (record: StudentRecord) => void
  onPrintTrackSheet2?: (record: StudentRecord) => void
  onPrintRegistrationForm?: (record: StudentRecord) => void
  onPrintRegistrationForm4?: (record: StudentRecord) => void
  onPrintRegistrationForm5?: (record: StudentRecord) => void
}

export function StudentDataTable({
  title = "Student Applications Master List",
  subtitle = "Manage registered pre-kg applicants. Click any Reg Number or ID to view complete application details.",
  data,
  searchTerm: controlledSearchTerm,
  onSearchChange: controlledOnSearchChange,
  searchPlaceholder,
  onView,
  onEdit,
  onDelete,
  onAddNew,
  onBulkUpdate,
  onSelectId,
  showCheckmarkCols = true,
  onExportExcel,
  onPrint,
  onToggleFilterPanel,
  onPrintTrackSheet,
  onPrintTrackSheet2,
  onPrintRegistrationForm,
  onPrintRegistrationForm4,
  onPrintRegistrationForm5,
}: StudentDataTableProps) {
  // Search & Filter States
  const [internalSearchTerm, setInternalSearchTerm] = useState('')
  const searchTerm = controlledSearchTerm !== undefined ? controlledSearchTerm : internalSearchTerm
  const handleSearchChange = (val: string) => {
    if (controlledOnSearchChange) {
      controlledOnSearchChange(val)
    } else {
      setInternalSearchTerm(val)
    }
  }

  const [fromDate, setFromDate] = useState<Date | undefined>(undefined)
  const [toDate, setToDate] = useState<Date | undefined>(undefined)
  const [isFilterPanelVisible, setIsFilterPanelVisible] = useState(false)

  // Sorting State for TanStack Table
  const [sorting, setSorting] = useState<SortingState>([])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  // Filter Data locally by Search & Date Range
  const filteredData = useMemo(() => {
    return data.filter((s: StudentRecord) => {
      // Global Search Filter
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase()
        const matchesName = s.studentName?.toLowerCase().includes(q)
        const matchesReg = s.registrationNumber?.toLowerCase().includes(q)
        const matchesFather = s.fatherName?.toLowerCase().includes(q)
        const matchesBranch = s.schoolBranch?.toLowerCase().includes(q)
        const matchesMobile = s.mobile?.includes(q)
        const matchesCity = s.city?.toLowerCase().includes(q)
        const matchesId = s.id?.toString().includes(q)
        if (
          !matchesName &&
          !matchesReg &&
          !matchesFather &&
          !matchesBranch &&
          !matchesMobile &&
          !matchesCity &&
          !matchesId
        ) {
          return false
        }
      }

      // Date Range Filter
      const dateVal = s.date || (s as Record<string, any>).date_of_submission || (s as Record<string, any>).dob
      if (dateVal && (fromDate || toDate)) {
        const itemDate = new Date(dateVal)
        if (!isNaN(itemDate.getTime())) {
          if (fromDate && itemDate < fromDate) return false
          if (toDate && itemDate > toDate) return false
        }
      }

      return true
    })
  }, [data, searchTerm, fromDate, toDate])

  // Column Definitions for TanStack Table
  const columns = useMemo<ColumnDef<StudentRecord>[]>(() => {
    const cols: ColumnDef<StudentRecord>[] = [
      {
        id: 'select',
        header: ({ table }) => (
          <div className="text-center">
            <Checkbox
              checked={table.getIsAllPageRowsSelected()}
              indeterminate={table.getIsSomePageRowsSelected()}
              onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
              aria-label="Select all"
              className="border-white/60 data-checked:border-transparent data-checked:text-white"
              style={{ background: table.getIsAllPageRowsSelected() || table.getIsSomePageRowsSelected() ? 'var(--app-gradient)' : undefined }}
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="text-center">
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="Select row"
              className="data-checked:border-transparent data-checked:text-white"
              style={{ background: row.getIsSelected() ? 'var(--app-gradient)' : undefined }}
            />
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: 'slNo',
        header: () => <span className="font-semibold text-white">SL No</span>,
        cell: ({ row, table }) => {
          const { pageIndex, pageSize } = table.getState().pagination
          return (
            <div className="text-center font-mono text-slate-500 whitespace-nowrap">
              {pageIndex * pageSize + row.index + 1}
            </div>
          )
        },
      },
      {
        accessorKey: 'registrationNumber',
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1.5 cursor-pointer hover:bg-white/10 p-1 rounded transition-colors select-none font-semibold text-white"
          >
            <span>Reg Number</span>
            <ArrowUpDown className="h-3 w-3 opacity-70" />
          </button>
        ),
        cell: ({ row }) => {
          const record = row.original
          return (
            <button
              type="button"
              onClick={() => {
                if (onSelectId) onSelectId(record)
                else if (onView) onView(record)
              }}
              className="hover:underline text-[#1677FF] dark:text-blue-400 font-mono font-bold cursor-pointer text-left inline-flex items-center gap-1.5 group"
              title={`Click to view application details for ID ${record.id}`}
            >
              <span className="group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                {record.registrationNumber}
              </span>
              {record.id && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900 font-mono font-semibold">
                  {record.id}
                </span>
              )}
            </button>
          )
        },
      },
      {
        accessorKey: 'studentName',
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1.5 cursor-pointer hover:bg-white/10 p-1 rounded transition-colors select-none font-semibold text-white"
          >
            <span>Student Name</span>
            <ArrowUpDown className="h-3 w-3 opacity-70" />
          </button>
        ),
        cell: ({ row }) => (
          <span className="font-bold text-slate-900 dark:text-white whitespace-nowrap">
            {row.original.studentName}
          </span>
        ),
      },
      {
        accessorKey: 'fatherName',
        header: () => <span className="font-semibold text-white">Parent / Guardian</span>,
        cell: ({ row }) => (
          <span className="text-slate-600 dark:text-slate-400 whitespace-nowrap">
            {row.original.fatherName}
          </span>
        ),
      },
      {
        accessorKey: 'schoolBranch',
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1.5 cursor-pointer hover:bg-white/10 p-1 rounded transition-colors select-none font-semibold text-white"
          >
            <span>School Branch</span>
            <ArrowUpDown className="h-3 w-3 opacity-70" />
          </button>
        ),
        cell: ({ row }) => (
          <span className="whitespace-nowrap">{row.original.schoolBranch}</span>
        ),
      },
      {
        id: 'areaCity',
        header: () => <span className="font-semibold text-white">Area / City</span>,
        cell: ({ row }) => (
          <span className="text-slate-500 whitespace-nowrap">
            {row.original.area}, {row.original.city}
          </span>
        ),
      },
      {
        accessorKey: 'applicationStatus',
        header: () => <span className="font-semibold text-white">Status</span>,
        cell: ({ row }) => {
          const val = row.original.applicationStatus
          return (
            <div className="text-center whitespace-nowrap">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${val === 'Declared'
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200'
                  : val === 'Approved'
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 border border-blue-200'
                    : val === 'Pending'
                      ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
              >
                {val === 'Declared' && <CheckCircle2 className="h-3 w-3" />}
                {val === 'Pending' && <Clock className="h-3 w-3" />}
                {val}
              </span>
            </div>
          )
        },
      },
    ]

    if (showCheckmarkCols) {
      cols.push(
        {
          id: 'trackSheet',
          accessorFn: (row) => row.trackSheet ?? row.status1,
          header: () => <span title="TrackSheet">✔</span>,
          cell: ({ row }) => {
            const isChecked = Boolean(row.original.trackSheet ?? row.original.status1)
            return (
              <div className="text-center whitespace-nowrap">
                {isChecked ? (
                  <span className="inline-block p-1 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">
                    ✔
                  </span>
                ) : (
                  <span className="text-slate-300">-</span>
                )}
              </div>
            )
          },
        },
        {
          id: 'registrationForm',
          accessorFn: (row) => row.registrationForm ?? row.status2,
          header: () => <span title="Registration Form">✔</span>,
          cell: ({ row }) => {
            const isChecked = Boolean(row.original.registrationForm ?? row.original.status2)
            return (
              <div className="text-center whitespace-nowrap">
                {isChecked ? (
                  <span className="inline-block p-1 rounded-md bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300">
                    ✔
                  </span>
                ) : (
                  <span className="text-slate-300">-</span>
                )}
              </div>
            )
          },
        }
      )
    }

    cols.push({
      id: 'actions',
      header: () => <span className="font-semibold text-white">Actions</span>,
      cell: ({ row }) => {
        const record = row.original
        return (
          <div className="text-center whitespace-nowrap">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button
                    type="button"
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                    aria-label="Actions Menu"
                  >
                    <Menu className="h-4 w-4" />
                  </button>
                }
              />
              <DropdownMenuContent
                align="end"
                className="w-56 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-xl text-xs z-50"
              >
                {onView && (
                  <DropdownMenuItem
                    onClick={() => onView(record)}
                    className="cursor-pointer py-2 px-2.5 rounded-lg flex items-center gap-2 font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Eye className="h-3.5 w-3.5 text-blue-600" /> View
                  </DropdownMenuItem>
                )}
                {onEdit && (
                  <DropdownMenuItem
                    onClick={() => onEdit(record)}
                    className="cursor-pointer py-2 px-2.5 rounded-lg flex items-center gap-2 font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Edit3 className="h-3.5 w-3.5 text-emerald-600" /> Edit
                  </DropdownMenuItem>
                )}
                {onPrintTrackSheet && (
                  <DropdownMenuItem
                    onClick={() => onPrintTrackSheet(record)}
                    className="cursor-pointer py-2 px-2.5 rounded-lg flex items-center gap-2 font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <FileText className="h-3.5 w-3.5 text-indigo-600" /> Print Track Sheet 1
                  </DropdownMenuItem>
                )}
                {onPrintTrackSheet2 && (
                  <DropdownMenuItem
                    onClick={() => onPrintTrackSheet2(record)}
                    className="cursor-pointer py-2 px-2.5 rounded-lg flex items-center gap-2 font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <FileText className="h-3.5 w-3.5 text-cyan-600" /> Print Track Sheet 2
                  </DropdownMenuItem>
                )}
                {onPrintRegistrationForm && (
                  <DropdownMenuItem
                    onClick={() => onPrintRegistrationForm(record)}
                    className="cursor-pointer py-2 px-2.5 rounded-lg flex items-center gap-2 font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Printer className="h-3.5 w-3.5 text-amber-600" /> Print Registration Form 1
                  </DropdownMenuItem>
                )}
                {onPrintRegistrationForm4 && (
                  <DropdownMenuItem
                    onClick={() => onPrintRegistrationForm4(record)}
                    className="cursor-pointer py-2 px-2.5 rounded-lg flex items-center gap-2 font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Printer className="h-3.5 w-3.5 text-purple-600" /> Print Registration Form 2
                  </DropdownMenuItem>
                )}
                {onPrintRegistrationForm5 && (
                  <DropdownMenuItem
                    onClick={() => onPrintRegistrationForm5(record)}
                    className="cursor-pointer py-2 px-2.5 rounded-lg flex items-center gap-2 font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Printer className="h-3.5 w-3.5 text-teal-600" /> Print Registration Form 3
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem
                    onClick={() => onDelete(record)}
                    className="cursor-pointer py-2 px-2.5 rounded-lg flex items-center gap-2 font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-rose-600" /> Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    })

    return cols
  }, [
    showCheckmarkCols,
    onSelectId,
    onView,
    onEdit,
    onPrintTrackSheet,
    onPrintTrackSheet2,
    onPrintRegistrationForm,
    onPrintRegistrationForm4,
    onPrintRegistrationForm5,
    onDelete,
  ])

  // Initialize TanStack React Table Instance
  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      rowSelection,
    },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 10,
      },
    },
  })

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-slate-200/90 dark:border-slate-800 p-5 space-y-4">
      {/* ================= CARD HEADER & SEARCH/FILTER BAR ================= */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-slate-100 dark:border-slate-800">
        {/* Left: Title & Badge */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#1677FF] dark:text-blue-400">
            <UserCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
              {title}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{subtitle}</p>
          </div>
        </div>

        {/* Right Controls: Search, Date Range, Filter, Add */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Input */}
          <div className="relative flex items-center min-w-[200px] sm:min-w-[220px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={searchPlaceholder || "Search Student / Reg No / Mobile"}
              className="h-9 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 pl-9 pr-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all"
            />
          </div>

          {/* Date Range Selector: From Date -> To Date */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-1 text-xs">
            <Popover>
              <PopoverTrigger
                render={
                  <button
                    type="button"
                    className="flex items-center gap-1.5 px-2 py-1 text-slate-700 dark:text-slate-300 hover:text-blue-600 font-medium cursor-pointer"
                  >
                    <CalendarIcon className="h-3.5 w-3.5 text-slate-400" />
                    <span>{fromDate ? format(fromDate, 'dd/MM/yyyy') : 'From Date'}</span>
                  </button>
                }
              />
              <PopoverContent align="start" className="w-auto p-0 shadow-lg border rounded-xl">
                <Calendar mode="single" selected={fromDate} onSelect={setFromDate} />
              </PopoverContent>
            </Popover>

            <span className="text-slate-400 font-bold">→</span>

            <Popover>
              <PopoverTrigger
                render={
                  <button
                    type="button"
                    className="flex items-center gap-1.5 px-2 py-1 text-slate-700 dark:text-slate-300 hover:text-blue-600 font-medium cursor-pointer"
                  >
                    <CalendarIcon className="h-3.5 w-3.5 text-slate-400" />
                    <span>{toDate ? format(toDate, 'dd/MM/yyyy') : 'To Date'}</span>
                  </button>
                }
              />
              <PopoverContent align="end" className="w-auto p-0 shadow-lg border rounded-xl">
                <Calendar mode="single" selected={toDate} onSelect={setToDate} />
              </PopoverContent>
            </Popover>
          </div>

          {/* Filter Popover Button */}
          <Popover>
            <PopoverTrigger
              render={
                <button
                  type="button"
                  title="Filter & Export Options"
                  className={`h-9 w-9 flex items-center justify-center rounded-lg border transition-colors cursor-pointer ${isFilterPanelVisible
                    ? 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                </button>
              }
            />
            <PopoverContent
              align="end"
              className="w-auto p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-2xl"
            >
              <div className="flex items-center gap-1">
                {/* 1. Filter Icon (Funnel) */}
                <button
                  type="button"
                  onClick={() => {
                    if (onToggleFilterPanel) {
                      onToggleFilterPanel()
                    } else {
                      setIsFilterPanelVisible(!isFilterPanelVisible)
                    }
                  }}
                  title="Toggle Custom Filters"
                  className={`p-2 rounded-xl transition-all cursor-pointer ${isFilterPanelVisible
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-bold'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                >
                  <Filter className="h-4 w-4" />
                </button>

                {/* 2. Export Excel Icon */}
                <button
                  type="button"
                  onClick={() => {
                    if (onExportExcel) onExportExcel()
                    else toast.success("Exported to Excel")
                  }}
                  title="Export to Excel"
                  className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
                >
                  <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                </button>

                {/* 3. Print Icon */}
                <button
                  type="button"
                  onClick={() => {
                    if (onPrint) onPrint()
                    else window.print()
                  }}
                  title="Print Report"
                  className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
                >
                  <Printer className="h-4 w-4 text-purple-600" />
                </button>
              </div>
            </PopoverContent>
          </Popover>

          {/* Bulk Update Button */}
          {onBulkUpdate && (
            <button
              type="button"
              onClick={onBulkUpdate}
              className="h-9 px-3.5 bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/70 dark:hover:bg-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Open Bulk Update Panel"
            >
              <Layers className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span>Bulk Update</span>
            </button>
          )}

          {/* Action / Add Button (+) */}
          {onAddNew && (
            <button
              type="button"
              onClick={onAddNew}
              className="h-9 px-3 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              style={{ background: "var(--app-gradient)" }}
            >
              <Plus className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* ================= DATA TABLE CONTAINER & SHADCN TABLE ================= */}
      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <div className="overflow-x-auto max-w-full">
          <Table className="w-full text-left text-xs border-collapse">
            {/* Header Row */}
            <TableHeader
              className="text-white font-semibold uppercase tracking-wider select-none"
              style={{ background: "var(--table-header-bg, #13729d)" }}
            >
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="border-b-0 hover:bg-transparent">
                  {headerGroup.headers.map((header) => {
                    const isSelect = header.column.id === 'select'
                    const isStatus1 = header.column.id === 'trackSheet' || header.column.id === 'status1'
                    const isStatus2 = header.column.id === 'registrationForm' || header.column.id === 'status2'
                    const isSlNo = header.column.id === 'slNo'
                    const isActions = header.column.id === 'actions'
                    const isStatus = header.column.id === 'applicationStatus'

                    return (
                      <TableHead
                        key={header.id}
                        className={`py-3 px-4 border-white/20 text-white font-semibold uppercase tracking-wider whitespace-nowrap h-auto ${isSelect ? 'text-center w-10 px-2' : ''
                          } ${isStatus1 ? 'bg-red-900/60 text-center w-12 px-2' : ''
                          } ${isStatus2 ? 'bg-purple-900/60 text-center w-12 px-2' : ''} ${isSlNo || isStatus || isActions ? 'text-center' : ''
                          }`}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-medium">
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className={`group hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800/60 ${row.getIsSelected() ? 'bg-blue-50/70 dark:bg-blue-950/30' : ''}`}
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
                      <UserCheck className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                      <span className="font-semibold text-sm">
                        No records matching search or filter criteria.
                      </span>
                      <span className="text-xs text-slate-400">
                        Try adjusting your filters or search keywords.
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
      <Pagination table={table} totalCount={filteredData.length} pageSizeOptions={[5, 10, 20, 50]} />
    </div>
  )
}

export default StudentDataTable
