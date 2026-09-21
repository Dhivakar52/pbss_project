import React, { useState, useMemo } from 'react'
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
  FileText
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

export interface TableColumn<T = any> {
  key: string
  label: string
  sortable?: boolean
  className?: string
  headerClassName?: string
  render?: (row: T, index: number) => React.ReactNode
}

export interface AdminDataTableProps<T = any> {
  title?: string
  subtitle?: string
  data: T[]
  columns?: TableColumn<T>[]
  searchTerm?: string
  onSearchChange?: (val: string) => void
  searchExtra?: React.ReactNode
  searchPlaceholder?: string
  onModify?: (record: T) => void
  onView?: (record: T) => void
  onEdit?: (record: T) => void
  onDelete?: (record: T) => void
  onAddNew?: () => void
  onSelectId?: (record: T) => void
  showCheckmarkCols?: boolean
  customFilterPanel?: React.ReactNode
  onExportExcel?: () => void
  onPrint?: () => void
  onToggleFilterPanel?: () => void
  onPrintTrackSheet?: (record: T) => void
  onPrintRegistrationForm?: (record: T) => void
}

// Width constants for frozen left and right columns
const SNO_WIDTH = 70
const APP_NO_WIDTH = 180
const STUDENT_NAME_WIDTH = 200
const ACTIONS_WIDTH = 96

const SNO_LEFT = 0
const APP_NO_LEFT = SNO_WIDTH
const STUDENT_NAME_LEFT = SNO_WIDTH + APP_NO_WIDTH

export function AdminDataTable<T extends Record<string, any>>({
  title = "Registered Students",
  subtitle = "View and manage registered student application records",
  data,
  columns,
  searchTerm: controlledSearchTerm,
  onSearchChange: controlledOnSearchChange,
  searchExtra,
  searchPlaceholder,
  onModify,
  onView,
  onEdit,
  onDelete,
  onAddNew,
  onSelectId,
  showCheckmarkCols = true,
  customFilterPanel,
  onExportExcel,
  onPrint,
  onToggleFilterPanel,
  onPrintTrackSheet,
  onPrintRegistrationForm,
}: AdminDataTableProps<T>) {
  // Search & Filter States
  const [internalSearchTerm, setInternalSearchTerm] = useState('')
  const searchTerm = controlledSearchTerm !== undefined ? controlledSearchTerm : internalSearchTerm
  const handleSearchChange = (val: string) => {
    if (controlledOnSearchChange) {
      controlledOnSearchChange(val)
    } else {
      setInternalSearchTerm(val)
    }
    setCurrentPage(1)
  }

  const [fromDate, setFromDate] = useState<Date | undefined>(undefined)
  const [toDate, setToDate] = useState<Date | undefined>(undefined)
  const [isFilterPanelVisible, setIsFilterPanelVisible] = useState(false)

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Sorting States
  const [sortField, setSortField] = useState<string>('slNo')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  // De-duplicate columns: remove application_number and student_name from middle scrollable area
  const scrollableColumns = useMemo(() => {
    if (!columns) return []
    return columns.filter((col) => {
      const lower = col.key.toLowerCase()
      return (
        lower !== 'application_number' &&
        lower !== 'student_name' &&
        lower !== 'slno' &&
        lower !== 'id'
      )
    })
  }, [columns])

  // Keys used for sorting frozen columns across lowercase and uppercase schemas
  const appNumberSortKey = useMemo(() => {
    if (!columns || columns.length === 0) return 'registrationNumber'
    const found = columns.find(
      (c) =>
        c.key.toLowerCase() === 'application_number' ||
        c.key.toLowerCase() === 'registrationnumber'
    )
    return found ? found.key : 'application_number'
  }, [columns])

  const studentNameSortKey = useMemo(() => {
    if (!columns || columns.length === 0) return 'studentName'
    const found = columns.find(
      (c) =>
        c.key.toLowerCase() === 'student_name' ||
        c.key.toLowerCase() === 'studentname'
    )
    return found ? found.key : 'student_name'
  }, [columns])

  // Filtered and Sorted Data
  const filteredData = useMemo(() => {
    return data.filter((item: any) => {
      // Global text search
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase()
        if (columns && columns.length > 0) {
          // Check application number and student name
          const appNo = item.application_number || item.APPLICATION_NUMBER || item.registrationNumber || ''
          const name = item.student_name || item.STUDENT_NAME || item.name || ''
          if (String(appNo).toLowerCase().includes(q) || String(name).toLowerCase().includes(q)) {
            return true
          }

          // Check all remaining columns
          const matchesCol = scrollableColumns.some((col) => {
            const val = item[col.key]
            if (val === undefined || val === null) return false
            return String(val).toLowerCase().includes(q)
          })
          if (!matchesCol) return false
        } else {
          // Fallback legacy search for default StudentRecord
          const s = item as StudentRecord
          const matchesName = s.studentName?.toLowerCase().includes(q)
          const matchesReg = s.registrationNumber?.toLowerCase().includes(q)
          const matchesFather = s.fatherName?.toLowerCase().includes(q)
          const matchesBranch = s.schoolBranch?.toLowerCase().includes(q)
          const matchesMobile = s.mobile?.includes(q)
          const matchesCity = s.city?.toLowerCase().includes(q)
          if (!matchesName && !matchesReg && !matchesFather && !matchesBranch && !matchesMobile && !matchesCity) {
            return false
          }
        }
      }

      // Date Range filter
      const dateVal =
        item.date ||
        item.date_of_submission ||
        item.DATE_OF_SUBMISSION ||
        item.dob ||
        item.DOB

      if (dateVal && (fromDate || toDate)) {
        const itemDate = new Date(dateVal)
        if (!isNaN(itemDate.getTime())) {
          if (fromDate && itemDate < fromDate) return false
          if (toDate && itemDate > toDate) return false
        }
      }

      return true
    }).sort((a: any, b: any) => {
      let valA = a[sortField]
      let valB = b[sortField]

      // Fallback aliases for sorting
      if (valA === undefined && sortField.toLowerCase() === 'application_number') {
        valA = a.application_number || a.APPLICATION_NUMBER || a.registrationNumber
      }
      if (valB === undefined && sortField.toLowerCase() === 'application_number') {
        valB = b.application_number || b.APPLICATION_NUMBER || b.registrationNumber
      }
      if (valA === undefined && sortField.toLowerCase() === 'student_name') {
        valA = a.student_name || a.STUDENT_NAME || a.studentName
      }
      if (valB === undefined && sortField.toLowerCase() === 'student_name') {
        valB = b.student_name || b.STUDENT_NAME || b.studentName
      }

      if (valA === undefined || valA === null) return 1
      if (valB === undefined || valB === null) return -1

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortOrder === 'asc' ? valA - valB : valB - valA
      }

      const strA = String(valA).toLowerCase()
      const strB = String(valB).toLowerCase()
      if (strA < strB) return sortOrder === 'asc' ? -1 : 1
      if (strA > strB) return sortOrder === 'asc' ? 1 : -1
      return 0
    })
  }, [data, searchTerm, fromDate, toDate, sortField, sortOrder, columns, scrollableColumns])

  // Pagination calculation
  const totalRecords = filteredData.length
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize))
  const safePage = Math.min(currentPage, totalPages)
  const startIndex = (safePage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, totalRecords)
  const paginatedData = filteredData.slice(startIndex, endIndex)

  const tableObject = useMemo(
    () => ({
      getState: () => ({ pagination: { pageIndex: safePage - 1, pageSize } }),
      setPageIndex: (index: number) => setCurrentPage(index + 1),
      setPageSize: (size: number) => {
        setPageSize(size)
        setCurrentPage(1)
      },
      previousPage: () => setCurrentPage((prev) => Math.max(prev - 1, 1)),
      nextPage: () => setCurrentPage((prev) => Math.min(prev + 1, totalPages)),
      getCanPreviousPage: () => safePage > 1,
      getCanNextPage: () => safePage < totalPages,
    }),
    [safePage, pageSize, totalPages]
  )

  // Cell formatting helper
  const renderCellContent = (row: any, key: string) => {
    const val = row[key]
    if (val === undefined || val === null || val === '') return '-'

    const lowerKey = key.toLowerCase()

    // Flag badges (Yes / No)
    if (
      lowerKey.includes('_flag') ||
      lowerKey.includes('playschool_going') ||
      lowerKey.includes('physically_challenged')
    ) {
      if (val === 'Yes' || val === true) {
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200">
            Yes
          </span>
        )
      }
      if (val === 'No' || val === false) {
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            No
          </span>
        )
      }
    }

    // Application status badge
    if (lowerKey === 'applicationstatus' || lowerKey === 'application_status') {
      return (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
            val === 'Declared'
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
          {String(val)}
        </span>
      )
    }

    return String(val)
  }

  const isDynamicMode = !!(columns && columns.length > 0)

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
            <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">{title}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{subtitle}</p>
          </div>
        </div>

        {/* Right Controls: Search, Report Type Select, Date Range, Filter, Add */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Input */}
          <div className="relative flex items-center min-w-[200px] sm:min-w-[220px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={searchPlaceholder || (isDynamicMode ? "Search in records..." : "Search Student / Reg No / Mobile")}
              className="h-9 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 pl-9 pr-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all"
            />
          </div>

          {/* Report Type Dropdown next to the Search field */}
          {searchExtra}

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
                <Calendar
                  mode="single"
                  selected={fromDate}
                  onSelect={setFromDate}
                />
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
                <Calendar
                  mode="single"
                  selected={toDate}
                  onSelect={setToDate}
                />
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
                  className={`h-9 w-9 flex items-center justify-center rounded-lg border transition-colors cursor-pointer ${
                    isFilterPanelVisible
                      ? 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                </button>
              }
            />
            <PopoverContent align="end" className="w-auto p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-2xl">
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
                  className={`p-2 rounded-xl transition-all cursor-pointer ${
                    isFilterPanelVisible
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

      {/* ================= CUSTOM FILTER PANEL (TOGGLED VIA FILTER ICON) ================= */}
      {isFilterPanelVisible && customFilterPanel && (
        <div className="pt-2 pb-1 border-t border-slate-100 dark:border-slate-800 animate-in fade-in duration-200">
          {customFilterPanel}
        </div>
      )}

      {/* ================= DATA TABLE CONTAINER & SCROLL WRAPPER ================= */}
      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <div className="overflow-x-auto max-w-full">
          <table className="w-full text-left text-xs border-collapse">
            {/* Header Row */}
            <thead
              className="text-white font-semibold uppercase tracking-wider select-none"
              style={{ background: "var(--table-header-bg, #13729d)" }}
            >
              <tr>
                {isDynamicMode ? (
                  <>
                    {/* FROZEN LEFT 1: S.No */}
                    <th
                      className="py-3 px-3 text-center border-r border-white/20 select-none sticky left-0 z-30"
                      style={{
                        minWidth: `${SNO_WIDTH}px`,
                        maxWidth: `${SNO_WIDTH}px`,
                        width: `${SNO_WIDTH}px`,
                        left: `${SNO_LEFT}px`,
                        background: "var(--table-header-bg, #13729d)",
                      }}
                    >
                      S.No
                    </th>

                    {/* FROZEN LEFT 2: Application Number */}
                    <th
                      onClick={() => handleSort(appNumberSortKey)}
                      className="py-3 px-4 border-r border-white/20 cursor-pointer hover:bg-white/10 transition-colors select-none sticky z-30"
                      style={{
                        minWidth: `${APP_NO_WIDTH}px`,
                        maxWidth: `${APP_NO_WIDTH}px`,
                        width: `${APP_NO_WIDTH}px`,
                        left: `${APP_NO_LEFT}px`,
                        background: "var(--table-header-bg, #13729d)",
                      }}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Application No</span>
                        <ArrowUpDown className="h-3 w-3 opacity-70" />
                      </div>
                    </th>

                    {/* FROZEN LEFT 3: Student Name */}
                    <th
                      onClick={() => handleSort(studentNameSortKey)}
                      className="py-3 px-4 border-r border-white/30 cursor-pointer hover:bg-white/10 transition-colors select-none sticky z-30 shadow-[4px_0_6px_-2px_rgba(0,0,0,0.18)]"
                      style={{
                        minWidth: `${STUDENT_NAME_WIDTH}px`,
                        maxWidth: `${STUDENT_NAME_WIDTH}px`,
                        width: `${STUDENT_NAME_WIDTH}px`,
                        left: `${STUDENT_NAME_LEFT}px`,
                        background: "var(--table-header-bg, #13729d)",
                      }}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Student Name</span>
                        <ArrowUpDown className="h-3 w-3 opacity-70" />
                      </div>
                    </th>

                    {/* MIDDLE SCROLLABLE COLUMNS */}
                    {scrollableColumns.map((col) => (
                      <th
                        key={col.key}
                        onClick={() => col.sortable !== false && handleSort(col.key)}
                        className={`py-3 px-4 ${
                          col.sortable !== false ? 'cursor-pointer hover:bg-white/10' : ''
                        } transition-colors border-r border-white/10 whitespace-nowrap ${col.headerClassName || ''}`}
                        style={{ minWidth: '150px' }}
                      >
                        <div className="flex items-center gap-1.5">
                          <span>{col.label}</span>
                          {col.sortable !== false && <ArrowUpDown className="h-3 w-3 opacity-70" />}
                        </div>
                      </th>
                    ))}

                    {/* FROZEN RIGHT: Actions */}
                    <th
                      className="py-3 px-4 text-center border-l border-white/30 sticky right-0 z-30 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.18)] select-none"
                      style={{
                        minWidth: `${ACTIONS_WIDTH}px`,
                        maxWidth: `${ACTIONS_WIDTH}px`,
                        width: `${ACTIONS_WIDTH}px`,
                        right: 0,
                        background: "var(--table-header-bg, #13729d)",
                      }}
                    >
                      Actions
                    </th>
                  </>
                ) : (
                  /* Legacy non-dynamic fallback columns for AdminStudents */
                  <>
                    <th className="py-3 px-3.5 text-center border-white/20 whitespace-nowrap">SL No</th>
                    <th
                      onClick={() => handleSort('registrationNumber')}
                      className="py-3 px-4 cursor-pointer hover:bg-white/10 transition-colors border-white/20 whitespace-nowrap"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Reg Number</span>
                        <ArrowUpDown className="h-3 w-3 opacity-70" />
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('studentName')}
                      className="py-3 px-4 cursor-pointer hover:bg-white/10 transition-colors border-white/20 whitespace-nowrap"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Student Name</span>
                        <ArrowUpDown className="h-3 w-3 opacity-70" />
                      </div>
                    </th>
                    <th className="py-3 px-4 border-white/20 whitespace-nowrap">Parent / Guardian</th>
                    <th
                      onClick={() => handleSort('schoolBranch')}
                      className="py-3 px-4 cursor-pointer hover:bg-white/10 transition-colors border-white/20 whitespace-nowrap"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>School Branch</span>
                        <ArrowUpDown className="h-3 w-3 opacity-70" />
                      </div>
                    </th>
                    <th className="py-3 px-4 border-white/20 whitespace-nowrap">Area / City</th>
                    <th className="py-3 px-4 text-center border-white/20 whitespace-nowrap">Status</th>
                    {showCheckmarkCols && (
                      <>
                        <th className="py-3 px-2 text-center w-12 bg-red-900/60 border-white/20 whitespace-nowrap" title="Checkmark 1">✔</th>
                        <th className="py-3 px-2 text-center w-12 bg-purple-900/60 border-white/20 whitespace-nowrap" title="Checkmark 2">✔</th>
                      </>
                    )}
                    <th className="py-3 px-4 text-center w-24 whitespace-nowrap">Actions</th>
                  </>
                )}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-medium">
              {paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={
                      isDynamicMode
                        ? scrollableColumns.length + 4
                        : showCheckmarkCols
                          ? 9
                          : 7
                    }
                    className="py-12 text-center text-slate-400"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <UserCheck className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                      <span className="font-semibold text-sm">No records matching search or filter criteria.</span>
                      <span className="text-xs text-slate-400">Try adjusting your filters or search keywords.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((row: any, idx: number) => {
                  const rowKey =
                    row.id ||
                    row.application_number ||
                    row.APPLICATION_NUMBER ||
                    row.registrationNumber ||
                    `row-${startIndex + idx}`

                  const appNo =
                    row.application_number ||
                    row.APPLICATION_NUMBER ||
                    row.registrationNumber ||
                    row.id ||
                    '-'

                  const studentName =
                    row.student_name ||
                    row.STUDENT_NAME ||
                    row.studentName ||
                    '-'

                  return (
                    <tr
                      key={rowKey}
                      className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800/60"
                    >
                      {isDynamicMode ? (
                        <>
                          {/* FROZEN LEFT 1: S.No */}
                          <td
                            className="py-3 px-3 text-center font-mono text-slate-500 whitespace-nowrap sticky left-0 z-20 bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800 transition-colors border-r border-slate-100 dark:border-slate-800"
                            style={{
                              minWidth: `${SNO_WIDTH}px`,
                              maxWidth: `${SNO_WIDTH}px`,
                              width: `${SNO_WIDTH}px`,
                              left: `${SNO_LEFT}px`,
                            }}
                          >
                            {startIndex + idx + 1}
                          </td>

                          {/* FROZEN LEFT 2: Application Number */}
                          <td
                            className="py-3 px-4 font-mono font-bold text-blue-700 dark:text-blue-400 whitespace-nowrap sticky z-20 bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800 transition-colors border-r border-slate-100 dark:border-slate-800"
                            style={{
                              minWidth: `${APP_NO_WIDTH}px`,
                              maxWidth: `${APP_NO_WIDTH}px`,
                              width: `${APP_NO_WIDTH}px`,
                              left: `${APP_NO_LEFT}px`,
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                if (onSelectId) onSelectId(row)
                                else if (onView) onView?.(row)
                              }}
                              className="hover:underline text-[#1677FF] dark:text-blue-400 font-mono font-bold cursor-pointer text-left inline-flex items-center gap-1.5 group/btn"
                              title={`Click to view application details for ${appNo}`}
                            >
                              <span className="group-hover/btn:text-blue-700 dark:group-hover/btn:text-blue-300 transition-colors">
                                {appNo}
                              </span>
                              {row.id && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900 font-mono font-semibold">
                                  {row.id}
                                </span>
                              )}
                            </button>
                          </td>

                          {/* FROZEN LEFT 3: Student Name */}
                          <td
                            className="py-3 px-4 font-bold text-slate-900 dark:text-white whitespace-nowrap sticky z-20 bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800 transition-colors border-r border-slate-200 dark:border-slate-800 shadow-[4px_0_6px_-2px_rgba(0,0,0,0.08)]"
                            style={{
                              minWidth: `${STUDENT_NAME_WIDTH}px`,
                              maxWidth: `${STUDENT_NAME_WIDTH}px`,
                              width: `${STUDENT_NAME_WIDTH}px`,
                              left: `${STUDENT_NAME_LEFT}px`,
                            }}
                          >
                            {studentName}
                          </td>

                          {/* MIDDLE SCROLLABLE COLUMNS */}
                          {scrollableColumns.map((col) => (
                            <td
                              key={col.key}
                              className={`py-3 px-4 whitespace-nowrap border-r border-slate-100 dark:border-slate-800/40 ${
                                col.className || ''
                              }`}
                              style={{ minWidth: '150px' }}
                            >
                              {col.render
                                ? col.render(row, startIndex + idx)
                                : renderCellContent(row, col.key)}
                            </td>
                          ))}

                          {/* FROZEN RIGHT: Actions */}
                          <td
                            className="py-3 px-4 text-center whitespace-nowrap sticky right-0 z-20 bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800 transition-colors border-l border-slate-200 dark:border-slate-800 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.08)]"
                            style={{
                              minWidth: `${ACTIONS_WIDTH}px`,
                              maxWidth: `${ACTIONS_WIDTH}px`,
                              width: `${ACTIONS_WIDTH}px`,
                              right: 0,
                            }}
                          >
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
                              <DropdownMenuContent align="end" className="w-56 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-xl text-xs">
                                {onView && (
                                  <DropdownMenuItem
                                    onClick={() => onView(row)}
                                    className="cursor-pointer py-2 px-2.5 rounded-lg flex items-center gap-2 font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                                  >
                                    <Eye className="h-3.5 w-3.5 text-blue-600" /> View
                                  </DropdownMenuItem>
                                )}
                                {(onEdit || onModify) && (
                                  <DropdownMenuItem
                                    onClick={() => {
                                      if (onEdit) onEdit(row)
                                      else if (onModify) onModify(row)
                                    }}
                                    className="cursor-pointer py-2 px-2.5 rounded-lg flex items-center gap-2 font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                                  >
                                    <Edit3 className="h-3.5 w-3.5 text-emerald-600" /> Edit
                                  </DropdownMenuItem>
                                )}
                                {onPrintTrackSheet && (
                                  <DropdownMenuItem
                                    onClick={() => onPrintTrackSheet(row)}
                                    className="cursor-pointer py-2 px-2.5 rounded-lg flex items-center gap-2 font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                                  >
                                    <FileText className="h-3.5 w-3.5 text-indigo-600" /> Print Track Sheet
                                  </DropdownMenuItem>
                                )}
                                {onPrintRegistrationForm && (
                                  <DropdownMenuItem
                                    onClick={() => onPrintRegistrationForm(row)}
                                    className="cursor-pointer py-2 px-2.5 rounded-lg flex items-center gap-2 font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                                  >
                                    <Printer className="h-3.5 w-3.5 text-amber-600" /> Print Registration Form
                                  </DropdownMenuItem>
                                )}
                                {onDelete && (
                                  <DropdownMenuItem
                                    onClick={() => onDelete(row)}
                                    className="cursor-pointer py-2 px-2.5 rounded-lg flex items-center gap-2 font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                                  >
                                    <Trash2 className="h-3.5 w-3.5 text-rose-600" /> Delete
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </>
                      ) : (
                        /* Legacy fallback cells for AdminStudents */
                        <>
                          <td className="py-3 px-3.5 text-center font-mono text-slate-500 whitespace-nowrap">
                            {startIndex + idx + 1}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-blue-700 dark:text-blue-400 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => {
                                if (onSelectId) onSelectId(row)
                                else if (onView) onView?.(row)
                              }}
                              className="hover:underline text-[#1677FF] dark:text-blue-400 font-mono font-bold cursor-pointer text-left inline-flex items-center gap-1.5 group"
                              title={`Click to view application details for ID ${row.id}`}
                            >
                              <span className="group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                                {row.registrationNumber}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900 font-mono font-semibold">
                                {row.id}
                              </span>
                            </button>
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-900 dark:text-white whitespace-nowrap">{row.studentName}</td>
                          <td className="py-3 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">{row.fatherName}</td>
                          <td className="py-3 px-4 whitespace-nowrap">{row.schoolBranch}</td>
                          <td className="py-3 px-4 text-slate-500 whitespace-nowrap">{row.area}, {row.city}</td>
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                row.applicationStatus === 'Declared'
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200'
                                  : row.applicationStatus === 'Approved'
                                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 border border-blue-200'
                                    : row.applicationStatus === 'Pending'
                                      ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200'
                                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                              }`}
                            >
                              {row.applicationStatus === 'Declared' && <CheckCircle2 className="h-3 w-3" />}
                              {row.applicationStatus === 'Pending' && <Clock className="h-3 w-3" />}
                              {row.applicationStatus}
                            </span>
                          </td>
                          {showCheckmarkCols && (
                            <>
                              <td className="py-3 px-2 text-center whitespace-nowrap">
                                {row.status1 ? (
                                  <span className="inline-block p-1 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">
                                    ✔
                                  </span>
                                ) : (
                                  <span className="text-slate-300">-</span>
                                )}
                              </td>
                              <td className="py-3 px-2 text-center whitespace-nowrap">
                                {row.status2 ? (
                                  <span className="inline-block p-1 rounded-md bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300">
                                    ✔
                                  </span>
                                ) : (
                                  <span className="text-slate-300">-</span>
                                )}
                              </td>
                            </>
                          )}
                          <td className="py-3 px-4 text-center whitespace-nowrap">
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
                              <DropdownMenuContent align="end" className="w-56 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-xl text-xs">
                                {onView && (
                                  <DropdownMenuItem
                                    onClick={() => onView(row)}
                                    className="cursor-pointer py-2 px-2.5 rounded-lg flex items-center gap-2 font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                                  >
                                    <Eye className="h-3.5 w-3.5 text-blue-600" /> View
                                  </DropdownMenuItem>
                                )}
                                {(onEdit || onModify) && (
                                  <DropdownMenuItem
                                    onClick={() => {
                                      if (onEdit) onEdit(row)
                                      else if (onModify) onModify(row)
                                    }}
                                    className="cursor-pointer py-2 px-2.5 rounded-lg flex items-center gap-2 font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                                  >
                                    <Edit3 className="h-3.5 w-3.5 text-emerald-600" /> Edit
                                  </DropdownMenuItem>
                                )}
                                {onPrintTrackSheet && (
                                  <DropdownMenuItem
                                    onClick={() => onPrintTrackSheet(row)}
                                    className="cursor-pointer py-2 px-2.5 rounded-lg flex items-center gap-2 font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                                  >
                                    <FileText className="h-3.5 w-3.5 text-indigo-600" /> Print Track Sheet
                                  </DropdownMenuItem>
                                )}
                                {onPrintRegistrationForm && (
                                  <DropdownMenuItem
                                    onClick={() => onPrintRegistrationForm(row)}
                                    className="cursor-pointer py-2 px-2.5 rounded-lg flex items-center gap-2 font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                                  >
                                    <Printer className="h-3.5 w-3.5 text-amber-600" /> Print Registration Form
                                  </DropdownMenuItem>
                                )}
                                {onDelete && (
                                  <DropdownMenuItem
                                    onClick={() => onDelete(row)}
                                    className="cursor-pointer py-2 px-2.5 rounded-lg flex items-center gap-2 font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                                  >
                                    <Trash2 className="h-3.5 w-3.5 text-rose-600" /> Delete
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </>
                      )}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= PAGINATION FOOTER FROM COMMON ================= */}
      <Pagination table={tableObject} totalCount={totalRecords} pageSizeOptions={[5, 10, 20, 50]} />
    </div>
  )
}
