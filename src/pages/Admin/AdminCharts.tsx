import React, { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Pie,
  PieChart,
  Cell,
  Line,
  LineChart,
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { BarChart3, TrendingUp, Users, Clock, School, ArrowUpDown } from 'lucide-react'
import { toast } from '@/components/ui/toast'
import type { ColumnDef } from '@tanstack/react-table'
import { SeatAvailabilityTable } from './components/SeatAvailabilityTable'

// ---------- Common Source Dataset Definition ----------
export interface ApplicationDataItem {
  academicYear: string
  branch: 'T.Nagar-PSBB' | 'KK Nagar-PSBB'
  status: 'Approved' | 'Pending'
  date: string
  timeSlot: '10:00 AM - 12:00 PM' | '1:00 PM - 3:00 PM' | '3:00 PM - 6:00 PM'
  seats: number
}

// Single source of truth dataset
const rawApplicationData: ApplicationDataItem[] = [
  // KK Nagar - Date 14
  { academicYear: '2025-26', branch: 'KK Nagar-PSBB', status: 'Approved', date: '14', timeSlot: '10:00 AM - 12:00 PM', seats: 3 },
  { academicYear: '2025-26', branch: 'KK Nagar-PSBB', status: 'Pending',  date: '14', timeSlot: '10:00 AM - 12:00 PM', seats: 1 },
  { academicYear: '2025-26', branch: 'KK Nagar-PSBB', status: 'Approved', date: '14', timeSlot: '1:00 PM - 3:00 PM',   seats: 5 },
  { academicYear: '2025-26', branch: 'KK Nagar-PSBB', status: 'Pending',  date: '14', timeSlot: '1:00 PM - 3:00 PM',   seats: 3 },
  { academicYear: '2025-26', branch: 'KK Nagar-PSBB', status: 'Approved', date: '14', timeSlot: '3:00 PM - 6:00 PM',   seats: 6 },
  { academicYear: '2025-26', branch: 'KK Nagar-PSBB', status: 'Pending',  date: '14', timeSlot: '3:00 PM - 6:00 PM',   seats: 4 },

  // KK Nagar - Date 15
  { academicYear: '2025-26', branch: 'KK Nagar-PSBB', status: 'Approved', date: '15', timeSlot: '10:00 AM - 12:00 PM', seats: 4 },
  { academicYear: '2025-26', branch: 'KK Nagar-PSBB', status: 'Pending',  date: '15', timeSlot: '10:00 AM - 12:00 PM', seats: 2 },
  { academicYear: '2025-26', branch: 'KK Nagar-PSBB', status: 'Approved', date: '15', timeSlot: '1:00 PM - 3:00 PM',   seats: 7 },
  { academicYear: '2025-26', branch: 'KK Nagar-PSBB', status: 'Pending',  date: '15', timeSlot: '1:00 PM - 3:00 PM',   seats: 3 },
  { academicYear: '2025-26', branch: 'KK Nagar-PSBB', status: 'Approved', date: '15', timeSlot: '3:00 PM - 6:00 PM',   seats: 8 },
  { academicYear: '2025-26', branch: 'KK Nagar-PSBB', status: 'Pending',  date: '15', timeSlot: '3:00 PM - 6:00 PM',   seats: 4 },

  // KK Nagar - Date 16
  { academicYear: '2025-26', branch: 'KK Nagar-PSBB', status: 'Approved', date: '16', timeSlot: '10:00 AM - 12:00 PM', seats: 2 },
  { academicYear: '2025-26', branch: 'KK Nagar-PSBB', status: 'Pending',  date: '16', timeSlot: '10:00 AM - 12:00 PM', seats: 2 },
  { academicYear: '2025-26', branch: 'KK Nagar-PSBB', status: 'Approved', date: '16', timeSlot: '1:00 PM - 3:00 PM',   seats: 5 },
  { academicYear: '2025-26', branch: 'KK Nagar-PSBB', status: 'Pending',  date: '16', timeSlot: '1:00 PM - 3:00 PM',   seats: 3 },
  { academicYear: '2025-26', branch: 'KK Nagar-PSBB', status: 'Approved', date: '16', timeSlot: '3:00 PM - 6:00 PM',   seats: 6 },
  { academicYear: '2025-26', branch: 'KK Nagar-PSBB', status: 'Pending',  date: '16', timeSlot: '3:00 PM - 6:00 PM',   seats: 3 },

  // T.Nagar - Date 14 (ONLY 10:00 AM - 12:00 PM and 1:00 PM - 3:00 PM)
  { academicYear: '2025-26', branch: 'T.Nagar-PSBB', status: 'Approved', date: '14', timeSlot: '10:00 AM - 12:00 PM', seats: 4 },
  { academicYear: '2025-26', branch: 'T.Nagar-PSBB', status: 'Pending',  date: '14', timeSlot: '10:00 AM - 12:00 PM', seats: 2 },
  { academicYear: '2025-26', branch: 'T.Nagar-PSBB', status: 'Approved', date: '14', timeSlot: '1:00 PM - 3:00 PM',   seats: 6 },
  { academicYear: '2025-26', branch: 'T.Nagar-PSBB', status: 'Pending',  date: '14', timeSlot: '1:00 PM - 3:00 PM',   seats: 3 },

  // T.Nagar - Date 15 (ONLY 10:00 AM - 12:00 PM and 1:00 PM - 3:00 PM)
  { academicYear: '2025-26', branch: 'T.Nagar-PSBB', status: 'Approved', date: '15', timeSlot: '10:00 AM - 12:00 PM', seats: 3 },
  { academicYear: '2025-26', branch: 'T.Nagar-PSBB', status: 'Pending',  date: '15', timeSlot: '10:00 AM - 12:00 PM', seats: 2 },
  { academicYear: '2025-26', branch: 'T.Nagar-PSBB', status: 'Approved', date: '15', timeSlot: '1:00 PM - 3:00 PM',   seats: 5 },
  { academicYear: '2025-26', branch: 'T.Nagar-PSBB', status: 'Pending',  date: '15', timeSlot: '1:00 PM - 3:00 PM',   seats: 2 },

  // T.Nagar - Date 16 (ONLY 10:00 AM - 12:00 PM and 1:00 PM - 3:00 PM)
  { academicYear: '2025-26', branch: 'T.Nagar-PSBB', status: 'Approved', date: '16', timeSlot: '10:00 AM - 12:00 PM', seats: 2 },
  { academicYear: '2025-26', branch: 'T.Nagar-PSBB', status: 'Pending',  date: '16', timeSlot: '10:00 AM - 12:00 PM', seats: 1 },
  { academicYear: '2025-26', branch: 'T.Nagar-PSBB', status: 'Approved', date: '16', timeSlot: '1:00 PM - 3:00 PM',   seats: 4 },
  { academicYear: '2025-26', branch: 'T.Nagar-PSBB', status: 'Pending',  date: '16', timeSlot: '1:00 PM - 3:00 PM',   seats: 2 },
]

// ---------- Table Row Interfaces ----------
interface KKNagarSeatRow {
  date: number
  slot10to12: number
  slot1to3: number
  slot3to6: number
}

interface TNagarSeatRow {
  date: number
  slot10to12: number
  slot1to3: number
}

// ---------- Chart Configs ----------
const groupedBarConfig = {
  slot10to12: { label: '10:00 AM – 12:00 PM', color: '#1677FF' },
  slot1to3: { label: '1:00 PM – 3:00 PM', color: '#10B981' },
  slot3to6: { label: '3:00 PM – 6:00 PM', color: '#F59E0B' },
} satisfies ChartConfig

const lineChartConfig = {
  slot10to12: { label: '10:00 AM – 12:00 PM', color: '#1677FF' },
  slot1to3: { label: '1:00 PM – 3:00 PM', color: '#10B981' },
  slot3to6: { label: '3:00 PM – 6:00 PM', color: '#F59E0B' },
} satisfies ChartConfig

const donutChartConfig = {
  value: { label: 'Filled Seats' },
  slot10to12: { label: '10:00 AM – 12:00 PM', color: '#1677FF' },
  slot1to3: { label: '1:00 PM – 3:00 PM', color: '#10B981' },
  slot3to6: { label: '3:00 PM – 6:00 PM', color: '#F59E0B' },
} satisfies ChartConfig

const SLOT_COLORS = ['#1677FF', '#10B981', '#F59E0B']

// ---------- Metric Card ----------
type MetricCardProps = {
  label: string
  value: number
  icon: React.ReactNode
  valueClass: string
  iconClass: string
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, icon, valueClass, iconClass }) => (
  <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center justify-between">
    <div>
      <p className="text-xs text-slate-500 font-medium">{label}</p>
      <p className={`text-2xl font-black mt-0.5 ${valueClass}`}>{value}</p>
    </div>
    <div className={`p-3 rounded-xl ${iconClass}`}>{icon}</div>
  </div>
)

// ---------- Main Component ----------
export const AdminCharts: React.FC = () => {
  // Controlled dropdown states
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('2025-26')
  const [selectedBranch, setSelectedBranch] = useState('ALL')
  const [selectedStatus, setSelectedStatus] = useState('ALL')

  // Applied filter state (updated ONLY when SUBMIT is clicked)
  const [appliedFilters, setAppliedFilters] = useState({
    academicYear: '2025-26',
    branch: 'ALL',
    status: 'ALL',
  })

  const handleSubmit = () => {
    setAppliedFilters({
      academicYear: selectedAcademicYear,
      branch: selectedBranch,
      status: selectedStatus,
    })
    const branchLabel = selectedBranch === 'ALL' ? 'Select All' : selectedBranch
    const statusLabel = selectedStatus === 'ALL' ? 'Select All' : selectedStatus
    toast.success(`Filter Applied: Academic Year (${selectedAcademicYear}) | Branch (${branchLabel}) | Status (${statusLabel})`)
  }

  // 1. Common Filtered Dataset derived from appliedFilters
  const filteredData = useMemo(() => {
    return rawApplicationData.filter((item) => {
      const matchYear = item.academicYear === appliedFilters.academicYear
      const matchBranch = appliedFilters.branch === 'ALL' || item.branch === appliedFilters.branch
      const matchStatus = appliedFilters.status === 'ALL' || item.status === appliedFilters.status
      return matchYear && matchBranch && matchStatus
    })
  }, [appliedFilters])

  // 2. Summary Cards Derived Data
  const { totalApps, approvedApps, pendingApps } = useMemo(() => {
    let approved = 0
    let pending = 0

    filteredData.forEach((item) => {
      if (item.status === 'Approved') {
        approved += item.seats
      } else if (item.status === 'Pending') {
        pending += item.seats
      }
    })

    return {
      totalApps: approved + pending,
      approvedApps: approved,
      pendingApps: pending,
    }
  }, [filteredData])

  // 3. Combined Time Slot Data for Grouped Bar & Line Charts
  const combinedSlotData = useMemo(() => {
    const dateMap = new Map<string, { date: string; slot10to12: number; slot1to3: number; slot3to6: number }>()

    filteredData.forEach((item) => {
      if (!dateMap.has(item.date)) {
        dateMap.set(item.date, {
          date: item.date,
          slot10to12: 0,
          slot1to3: 0,
          slot3to6: 0,
        })
      }
      const entry = dateMap.get(item.date)!
      if (item.timeSlot === '10:00 AM - 12:00 PM') {
        entry.slot10to12 += item.seats
      } else if (item.timeSlot === '1:00 PM - 3:00 PM') {
        entry.slot1to3 += item.seats
      } else if (item.timeSlot === '3:00 PM - 6:00 PM') {
        entry.slot3to6 += item.seats
      }
    })

    return Array.from(dateMap.values()).sort((a, b) => Number(a.date) - Number(b.date))
  }, [filteredData])

  // 4. Donut Chart Data
  const donutData = useMemo(() => {
    let total10to12 = 0
    let total1to3 = 0
    let total3to6 = 0

    filteredData.forEach((item) => {
      if (item.timeSlot === '10:00 AM - 12:00 PM') {
        total10to12 += item.seats
      } else if (item.timeSlot === '1:00 PM - 3:00 PM') {
        total1to3 += item.seats
      } else if (item.timeSlot === '3:00 PM - 6:00 PM') {
        total3to6 += item.seats
      }
    })

    return [
      { slot: 'slot10to12', label: '10:00 AM – 12:00 PM', value: total10to12, fill: '#1677FF' },
      { slot: 'slot1to3', label: '1:00 PM – 3:00 PM', value: total1to3, fill: '#10B981' },
      { slot: 'slot3to6', label: '3:00 PM – 6:00 PM', value: total3to6, fill: '#F59E0B' },
    ]
  }, [filteredData])

  const totalFilledSeats = useMemo(
    () => donutData.reduce((sum, d) => sum + d.value, 0),
    [donutData]
  )

  // 5. KK Nagar Branch Table Data
  const kkNagarSeatData = useMemo<KKNagarSeatRow[]>(() => {
    if (appliedFilters.branch !== 'ALL' && appliedFilters.branch !== 'KK Nagar-PSBB') {
      return []
    }
    const items = filteredData.filter((item) => item.branch === 'KK Nagar-PSBB')
    const map = new Map<number, KKNagarSeatRow>()

    items.forEach((item) => {
      const dNum = Number(item.date)
      if (!map.has(dNum)) {
        map.set(dNum, { date: dNum, slot10to12: 0, slot1to3: 0, slot3to6: 0 })
      }
      const row = map.get(dNum)!
      if (item.timeSlot === '10:00 AM - 12:00 PM') row.slot10to12 += item.seats
      if (item.timeSlot === '1:00 PM - 3:00 PM') row.slot1to3 += item.seats
      if (item.timeSlot === '3:00 PM - 6:00 PM') row.slot3to6 += item.seats
    })

    return Array.from(map.values()).sort((a, b) => a.date - b.date)
  }, [filteredData, appliedFilters.branch])

  // 6. T-Nagar Branch Table Data (ONLY 10:00 AM - 12:00 PM and 1:00 PM - 3:00 PM)
  const tNagarSeatData = useMemo<TNagarSeatRow[]>(() => {
    if (appliedFilters.branch !== 'ALL' && appliedFilters.branch !== 'T.Nagar-PSBB') {
      return []
    }
    const items = filteredData.filter((item) => item.branch === 'T.Nagar-PSBB')
    const map = new Map<number, TNagarSeatRow>()

    items.forEach((item) => {
      const dNum = Number(item.date)
      if (!map.has(dNum)) {
        map.set(dNum, { date: dNum, slot10to12: 0, slot1to3: 0 })
      }
      const row = map.get(dNum)!
      if (item.timeSlot === '10:00 AM - 12:00 PM') row.slot10to12 += item.seats
      if (item.timeSlot === '1:00 PM - 3:00 PM') row.slot1to3 += item.seats
    })

    return Array.from(map.values()).sort((a, b) => a.date - b.date)
  }, [filteredData, appliedFilters.branch])

  // 7. KK Nagar Table Columns Definition (All 3 time slots)
  const kkNagarColumns = useMemo<ColumnDef<KKNagarSeatRow>[]>(
    () => [
      {
        accessorKey: 'date',
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1.5 cursor-pointer hover:bg-white/10 p-1 rounded transition-colors select-none font-semibold text-white"
          >
            <span>Date</span>
            <ArrowUpDown className="h-3 w-3 opacity-70" />
          </button>
        ),
        cell: ({ row }) => (
          <span className="font-bold text-slate-900 dark:text-white">
            {row.original.date}
          </span>
        ),
      },
      {
        accessorKey: 'slot10to12',
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1.5 cursor-pointer hover:bg-white/10 p-1 rounded transition-colors select-none font-semibold text-white"
          >
            <span>10:00 AM - 12:00 PM</span>
            <ArrowUpDown className="h-3 w-3 opacity-70" />
          </button>
        ),
        cell: ({ row }) => (
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {row.original.slot10to12}
          </span>
        ),
      },
      {
        accessorKey: 'slot1to3',
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1.5 cursor-pointer hover:bg-white/10 p-1 rounded transition-colors select-none font-semibold text-white"
          >
            <span>1:00 PM - 3:00 PM</span>
            <ArrowUpDown className="h-3 w-3 opacity-70" />
          </button>
        ),
        cell: ({ row }) => (
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {row.original.slot1to3}
          </span>
        ),
      },
      {
        accessorKey: 'slot3to6',
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1.5 cursor-pointer hover:bg-white/10 p-1 rounded transition-colors select-none font-semibold text-white"
          >
            <span>3:00 PM - 6:00 PM</span>
            <ArrowUpDown className="h-3 w-3 opacity-70" />
          </button>
        ),
        cell: ({ row }) => (
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {row.original.slot3to6}
          </span>
        ),
      },
    ],
    []
  )

  // 8. T-Nagar Table Columns Definition (ONLY 10:00 AM - 12:00 PM and 1:00 PM - 3:00 PM)
  const tNagarColumns = useMemo<ColumnDef<TNagarSeatRow>[]>(
    () => [
      {
        accessorKey: 'date',
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1.5 cursor-pointer hover:bg-white/10 p-1 rounded transition-colors select-none font-semibold text-white"
          >
            <span>Date</span>
            <ArrowUpDown className="h-3 w-3 opacity-70" />
          </button>
        ),
        cell: ({ row }) => (
          <span className="font-bold text-slate-900 dark:text-white">
            {row.original.date}
          </span>
        ),
      },
      {
        accessorKey: 'slot10to12',
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1.5 cursor-pointer hover:bg-white/10 p-1 rounded transition-colors select-none font-semibold text-white"
          >
            <span>10:00 AM - 12:00 PM</span>
            <ArrowUpDown className="h-3 w-3 opacity-70" />
          </button>
        ),
        cell: ({ row }) => (
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {row.original.slot10to12}
          </span>
        ),
      },
      {
        accessorKey: 'slot1to3',
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1.5 cursor-pointer hover:bg-white/10 p-1 rounded transition-colors select-none font-semibold text-white"
          >
            <span>1:00 PM - 3:00 PM</span>
            <ArrowUpDown className="h-3 w-3 opacity-70" />
          </button>
        ),
        cell: ({ row }) => (
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {row.original.slot1to3}
          </span>
        ),
      },
    ],
    []
  )

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex items-center gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
          <BarChart3 className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">
            Registration Analytics &amp; Charts
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Visual statistics for Pre-KG 2025-26 applications
          </p>
        </div>
      </div>

      {/* ================= TOP FILTER BAR ================= */}
      <div className="bg-[#f0f4f8] dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl shadow-2xs flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-semibold text-slate-700 dark:text-slate-300">
        <div className="flex items-center gap-2">
          <label htmlFor="academicYear">Academic Year</label>
          <select
            id="academicYear"
            value={selectedAcademicYear}
            onChange={(e) => setSelectedAcademicYear(e.target.value)}
            className="h-8 px-2.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
          >
            <option value="2025-26">2025-26</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="branch">Branch</label>
          <select
            id="branch"
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="h-8 px-2.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
          >
            <option value="ALL">-- Select All --</option>
            <option value="T.Nagar-PSBB">T.Nagar-PSBB</option>
            <option value="KK Nagar-PSBB">KK Nagar-PSBB</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="appStatus">Application Status</label>
          <select
            id="appStatus"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-8 px-2.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
          >
            <option value="ALL">-- Select All --</option>
            <option value="Approved">Approved</option>
            <option value="Pending">Pending</option>
          </select>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          className="h-8 px-6 text-white font-extrabold rounded-xl shadow-md border border-sky-400/50 transition-all cursor-pointer tracking-wider text-xs flex items-center justify-center active:scale-95 btn-app-gradient"
          style={{ background: 'var(--app-gradient)' }}
        >
          SUBMIT
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          label="Total Applications"
          value={totalApps}
          icon={<Users className="h-5 w-5" />}
          valueClass="text-slate-900 dark:text-white"
          iconClass="bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
        />
        <MetricCard
          label="Approved Seats"
          value={approvedApps}
          icon={<School className="h-5 w-5" />}
          valueClass="text-blue-600 dark:text-blue-400"
          iconClass="bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-400"
        />
        <MetricCard
          label="Pending Review"
          value={pendingApps}
          icon={<Clock className="h-5 w-5" />}
          valueClass="text-amber-600 dark:text-amber-400"
          iconClass="bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400"
        />
      </div>

      {/* ================= 3 CHARTS (TOP) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Grouped Bar Chart — Daily Slot Comparison */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
          <div className="border-b pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-600" /> Daily Slot Comparison
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">
              Combined filled seats per time slot by date
            </p>
          </div>
          <ChartContainer config={groupedBarConfig} className="h-72 w-full">
            <BarChart accessibilityLayer data={combinedSlotData} barCategoryGap="20%">
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fontSize: 12, fontWeight: 600 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11 }}
                allowDecimals={false}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="slot10to12" fill="var(--color-slot10to12)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="slot1to3" fill="var(--color-slot1to3)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="slot3to6" fill="var(--color-slot3to6)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </div>

        {/* Chart 2: Line Chart — Slot Occupancy Trend */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
          <div className="border-b pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-600" /> Slot Occupancy Trend
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">
              Occupancy trend for each time slot across dates
            </p>
          </div>
          <ChartContainer config={lineChartConfig} className="h-72 w-full">
            <LineChart accessibilityLayer data={combinedSlotData}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fontSize: 12, fontWeight: 600 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11 }}
                allowDecimals={false}
              />
              <ChartTooltip cursor={{ strokeDasharray: '3 3' }} content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Line
                type="monotone"
                dataKey="slot10to12"
                stroke="var(--color-slot10to12)"
                strokeWidth={2.5}
                dot={{ r: 5, strokeWidth: 2, fill: 'white' }}
                activeDot={{ r: 7 }}
              />
              <Line
                type="monotone"
                dataKey="slot1to3"
                stroke="var(--color-slot1to3)"
                strokeWidth={2.5}
                dot={{ r: 5, strokeWidth: 2, fill: 'white' }}
                activeDot={{ r: 7 }}
              />
              <Line
                type="monotone"
                dataKey="slot3to6"
                stroke="var(--color-slot3to6)"
                strokeWidth={2.5}
                dot={{ r: 5, strokeWidth: 2, fill: 'white' }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ChartContainer>
        </div>

        {/* Chart 3: Donut / Pie Chart — Total Slot Occupancy */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
          <div className="border-b pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <School className="h-4 w-4 text-amber-600" /> Total Slot Occupancy
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">
              Aggregated filled seats — {totalFilledSeats} total across all slots
            </p>
          </div>
          <ChartContainer config={donutChartConfig} className="h-72 w-full">
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={donutData}
                dataKey="value"
                nameKey="label"
                innerRadius={55}
                outerRadius={95}
                paddingAngle={4}
                strokeWidth={2}
                label={({ value, percent }) =>
                  totalFilledSeats > 0 ? `${value} (${((percent ?? 0) * 100).toFixed(0)}%)` : '0 (0%)'
                }
                labelLine={false}
              >
                {donutData.map((entry, index) => (
                  <Cell key={entry.slot} fill={SLOT_COLORS[index % SLOT_COLORS.length]} />
                ))}
              </Pie>
              <ChartLegend content={<ChartLegendContent nameKey="label" />} />
            </PieChart>
          </ChartContainer>
        </div>
      </div>

      {/* ================= DATA TABLES (BOTTOM) ================= */}
      <div className={`grid grid-cols-1 ${appliedFilters.branch === 'ALL' ? 'lg:grid-cols-2' : 'lg:grid-cols-1'} gap-6`}>
        {/* KK Nagar Table */}
        {(appliedFilters.branch === 'ALL' || appliedFilters.branch === 'KK Nagar-PSBB') && (
          <SeatAvailabilityTable
            title="KK Nagar"
            subtitle="Seat Booked across interview slots"
            data={kkNagarSeatData}
            columns={kkNagarColumns}
            iconColorClass="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
          />
        )}

        {/* T-Nagar Table */}
        {(appliedFilters.branch === 'ALL' || appliedFilters.branch === 'T.Nagar-PSBB') && (
          <SeatAvailabilityTable
            title="T-Nagar"
            subtitle="Seat Booked across interview slots"
            data={tNagarSeatData}
            columns={tNagarColumns}
            iconColorClass="bg-blue-50 dark:bg-blue-950/60 text-[#1677FF] dark:text-blue-400"
          />
        )}
      </div>
    </div>
  )
}