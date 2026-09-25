import React, { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { BarChart3, Users, ArrowUpDown, ArrowLeft, Briefcase, MapPin, Layers } from 'lucide-react'
import { toast } from '@/components/ui/toast'
import type { ColumnDef } from '@tanstack/react-table'
import { SeatAvailabilityTable } from './components/SeatAvailabilityTable'

// ---------- Table Row Interfaces ----------
interface KKNagarSeatRow {
  no: number | string
  slot10to11: string
  slot11to12: string
  slot1to2: string
  slot2to3: string
}

interface TNagarSeatRow {
  no: number | string
  slot10to1: string
  slot2to4: string
}

const defaultKKNagarSlotData: KKNagarSeatRow[] = [
  { no: 14, slot10to11: '1-100', slot11to12: '101-200', slot1to2: '201-300', slot2to3: '301-400' },
  { no: 15, slot10to11: '401-500', slot11to12: '501-600', slot1to2: '601-700', slot2to3: '701-800' },
  { no: 16, slot10to11: '801-900', slot11to12: '901-1000', slot1to2: '1001-1100', slot2to3: '1101-onwards' },
]

const defaultTNagarSlotData: TNagarSeatRow[] = [
  { no: 14, slot10to1: '1-100', slot2to4: '301-400' },
  { no: 15, slot10to1: '401-500', slot2to4: '701-800' },
  { no: 16, slot10to1: '801-900', slot2to4: '1101-onwards' },
]

// ---------- Chronological Hourly Time-Based Dataset (Date -> Time -> Count) ----------
export interface DateTimeCountRecord {
  date: '10' | '11' | '12'
  time: string
  count: number
}

// Master Date -> Time -> Count dataset strictly following user requirement
export const dateTimeCountData: DateTimeCountRecord[] = [
  // Date 10 (starts from 5:00 AM through 12:00 AM)
  { date: '10', time: '5:00 AM', count: 100 },
  { date: '10', time: '6:00 AM', count: 9 },
  { date: '10', time: '7:00 AM', count: 2 },
  { date: '10', time: '8:00 AM', count: 0 },
  { date: '10', time: '9:00 AM', count: 0 },
  { date: '10', time: '10:00 AM', count: 0 },
  { date: '10', time: '11:00 AM', count: 0 },
  { date: '10', time: '12:00 PM', count: 1 },
  { date: '10', time: '1:00 PM', count: 0 },
  { date: '10', time: '2:00 PM', count: 0 },
  { date: '10', time: '3:00 PM', count: 0 },
  { date: '10', time: '4:00 PM', count: 0 },
  { date: '10', time: '5:00 PM', count: 0 },
  { date: '10', time: '6:00 PM', count: 0 },
  { date: '10', time: '7:00 PM', count: 0 },
  { date: '10', time: '8:00 PM', count: 0 },
  { date: '10', time: '9:00 PM', count: 0 },
  { date: '10', time: '10:00 PM', count: 0 },
  { date: '10', time: '11:00 PM', count: 0 },
  { date: '10', time: '12:00 AM', count: 0 },

  // Date 11 (starts from 1:00 AM through 12:00 AM)
  { date: '11', time: '1:00 AM', count: 0 },
  { date: '11', time: '2:00 AM', count: 0 },
  { date: '11', time: '3:00 AM', count: 0 },
  { date: '11', time: '4:00 AM', count: 0 },
  { date: '11', time: '5:00 AM', count: 0 },
  { date: '11', time: '6:00 AM', count: 0 },
  { date: '11', time: '7:00 AM', count: 0 },
  { date: '11', time: '8:00 AM', count: 0 },
  { date: '11', time: '9:00 AM', count: 0 },
  { date: '11', time: '10:00 AM', count: 0 },
  { date: '11', time: '11:00 AM', count: 0 },
  { date: '11', time: '12:00 PM', count: 200 },
  { date: '11', time: '1:00 PM', count: 0 },
  { date: '11', time: '2:00 PM', count: 0 },
  { date: '11', time: '3:00 PM', count: 0 },
  { date: '11', time: '4:00 PM', count: 0 },
  { date: '11', time: '5:00 PM', count: 0 },
  { date: '11', time: '6:00 PM', count: 0 },
  { date: '11', time: '7:00 PM', count: 0 },
  { date: '11', time: '8:00 PM', count: 0 },
  { date: '11', time: '9:00 PM', count: 0 },
  { date: '11', time: '10:00 PM', count: 0 },
  { date: '11', time: '11:00 PM', count: 0 },
  { date: '11', time: '12:00 AM', count: 0 },

  // Date 12 (starts from 1:00 AM through 12:00 AM)
  { date: '12', time: '1:00 AM', count: 0 },
  { date: '12', time: '2:00 AM', count: 0 },
  { date: '12', time: '3:00 AM', count: 0 },
  { date: '12', time: '4:00 AM', count: 0 },
  { date: '12', time: '5:00 AM', count: 0 },
  { date: '12', time: '6:00 AM', count: 0 },
  { date: '12', time: '7:00 AM', count: 0 },
  { date: '12', time: '8:00 AM', count: 0 },
  { date: '12', time: '9:00 AM', count: 0 },
  { date: '12', time: '10:00 AM', count: 0 },
  { date: '12', time: '11:00 AM', count: 0 },
  { date: '12', time: '12:00 PM', count: 0 },
  { date: '12', time: '1:00 PM', count: 0 },
  { date: '12', time: '2:00 PM', count: 0 },
  { date: '12', time: '3:00 PM', count: 0 },
  { date: '12', time: '4:00 PM', count: 0 },
  { date: '12', time: '5:00 PM', count: 0 },
  { date: '12', time: '6:00 PM', count: 0 },
  { date: '12', time: '7:00 PM', count: 0 },
  { date: '12', time: '8:00 PM', count: 0 },
  { date: '12', time: '9:00 PM', count: 0 },
  { date: '12', time: '10:00 PM', count: 0 },
  { date: '12', time: '11:00 PM', count: 0 },
  { date: '12', time: '12:00 AM', count: 0 },
]

// ---------- 4-Hour Time Slot Definitions (Date-wise) ----------
export interface FourHourSlotGroup {
  id: string
  date: '10' | '11' | '12'
  slotRange: string
  fullLabel: string
  shortLabel: string
  hours: string[]
}

export const fourHourSlotDefinitions: FourHourSlotGroup[] = [
  // Date 10 (starts from 5 AM)
  {
    id: '10_5am-8am',
    date: '10',
    slotRange: '5 AM – 8 AM',
    fullLabel: 'Date 10: 5 AM – 8 AM',
    shortLabel: 'D10 5AM–8AM',
    hours: ['5:00 AM', '6:00 AM', '7:00 AM', '8:00 AM'],
  },
  {
    id: '10_9am-12pm',
    date: '10',
    slotRange: '9 AM – 12 PM',
    fullLabel: 'Date 10: 9 AM – 12 PM',
    shortLabel: 'D10 9AM–12PM',
    hours: ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM'],
  },
  {
    id: '10_1pm-4pm',
    date: '10',
    slotRange: '1 PM – 4 PM',
    fullLabel: 'Date 10: 1 PM – 4 PM',
    shortLabel: 'D10 1PM–4PM',
    hours: ['1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'],
  },
  {
    id: '10_5pm-8pm',
    date: '10',
    slotRange: '5 PM – 8 PM',
    fullLabel: 'Date 10: 5 PM – 8 PM',
    shortLabel: 'D10 5PM–8PM',
    hours: ['5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM'],
  },
  {
    id: '10_9pm-12am',
    date: '10',
    slotRange: '9 PM – 12 AM',
    fullLabel: 'Date 10: 9 PM – 12 AM',
    shortLabel: 'D10 9PM–12AM',
    hours: ['9:00 PM', '10:00 PM', '11:00 PM', '12:00 AM'],
  },

  // Date 11 (starts from 1 AM)
  {
    id: '11_1am-4am',
    date: '11',
    slotRange: '1 AM – 4 AM',
    fullLabel: 'Date 11: 1 AM – 4 AM',
    shortLabel: 'D11 1AM–4AM',
    hours: ['1:00 AM', '2:00 AM', '3:00 AM', '4:00 AM'],
  },
  {
    id: '11_5am-8am',
    date: '11',
    slotRange: '5 AM – 8 AM',
    fullLabel: 'Date 11: 5 AM – 8 AM',
    shortLabel: 'D11 5AM–8AM',
    hours: ['5:00 AM', '6:00 AM', '7:00 AM', '8:00 AM'],
  },
  {
    id: '11_9am-12pm',
    date: '11',
    slotRange: '9 AM – 12 PM',
    fullLabel: 'Date 11: 9 AM – 12 PM',
    shortLabel: 'D11 9AM–12PM',
    hours: ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM'],
  },
  {
    id: '11_1pm-4pm',
    date: '11',
    slotRange: '1 PM – 4 PM',
    fullLabel: 'Date 11: 1 PM – 4 PM',
    shortLabel: 'D11 1PM–4PM',
    hours: ['1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'],
  },
  {
    id: '11_5pm-8pm',
    date: '11',
    slotRange: '5 PM – 8 PM',
    fullLabel: 'Date 11: 5 PM – 8 PM',
    shortLabel: 'D11 5PM–8PM',
    hours: ['5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM'],
  },
  {
    id: '11_9pm-12am',
    date: '11',
    slotRange: '9 PM – 12 AM',
    fullLabel: 'Date 11: 9 PM – 12 AM',
    shortLabel: 'D11 9PM–12AM',
    hours: ['9:00 PM', '10:00 PM', '11:00 PM', '12:00 AM'],
  },

  // Date 12 (starts from 1 AM)
  {
    id: '12_1am-4am',
    date: '12',
    slotRange: '1 AM – 4 AM',
    fullLabel: 'Date 12: 1 AM – 4 AM',
    shortLabel: 'D12 1AM–4AM',
    hours: ['1:00 AM', '2:00 AM', '3:00 AM', '4:00 AM'],
  },
  {
    id: '12_5am-8am',
    date: '12',
    slotRange: '5 AM – 8 AM',
    fullLabel: 'Date 12: 5 AM – 8 AM',
    shortLabel: 'D12 5AM–8AM',
    hours: ['5:00 AM', '6:00 AM', '7:00 AM', '8:00 AM'],
  },
  {
    id: '12_9am-12pm',
    date: '12',
    slotRange: '9 AM – 12 PM',
    fullLabel: 'Date 12: 9 AM – 12 PM',
    shortLabel: 'D12 9AM–12PM',
    hours: ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM'],
  },
  {
    id: '12_1pm-4pm',
    date: '12',
    slotRange: '1 PM – 4 PM',
    fullLabel: 'Date 12: 1 PM – 4 PM',
    shortLabel: 'D12 1PM–4PM',
    hours: ['1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'],
  },
  {
    id: '12_5pm-8pm',
    date: '12',
    slotRange: '5 PM – 8 PM',
    fullLabel: 'Date 12: 5 PM – 8 PM',
    shortLabel: 'D12 5PM–8PM',
    hours: ['5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM'],
  },
  {
    id: '12_9pm-12am',
    date: '12',
    slotRange: '9 PM – 12 AM',
    fullLabel: 'Date 12: 9 PM – 12 AM',
    shortLabel: 'D12 9PM–12AM',
    hours: ['9:00 PM', '10:00 PM', '11:00 PM', '12:00 AM'],
  },
]

export interface SlotChartItem {
  id: string
  date: '10' | '11' | '12'
  slotRange: string
  fullLabel: string
  shortLabel: string
  totalSeats: number
  hourlyRecords: { time: string; count: number }[]
}

// ---------- Chart Configs ----------
const singleChartConfig = {
  totalSeats: { label: 'Total Applications / Seats', color: '#1677FF' },
} satisfies ChartConfig

const hourlyDrillConfig = {
  count: { label: 'Seats', color: '#1677FF' },
} satisfies ChartConfig

// ---------- 4 Report Charts Datasets ----------
// 2. Father's Salary Data & Complete Legend
const allSalaryCategories = [
  { range: '< 50,000 p.m', percentage: 0, color: '#94A3B8' },
  { range: '50,001 - 1,00,000 p.m', percentage: 0, color: '#64748B' },
  { range: '1,00,001 - 1,25,000 p.m', percentage: 0, color: '#38BDF8' },
  { range: '125001 - 150000 p.m', percentage: 67, color: '#1677FF' },
  { range: '1,50,001 - 2,00,000 p.m', percentage: 0, color: '#818CF8' },
  { range: '2,00,001 - 3,50,000 p.m', percentage: 0, color: '#A855F7' },
  { range: '350001 - 400000 p.m', percentage: 33, color: '#10B981' },
  { range: '> 4,00,000 p.m', percentage: 0, color: '#F59E0B' },
]

const fatherSalaryChartData = allSalaryCategories

// 3. Distance From Residence Data & Complete Legend
const allDistanceCategories = [
  { category: '< 0.5 Km', percentage: 0, color: '#94A3B8' },
  { category: '0.5 Km - 1.0 Km', percentage: 67, color: '#1677FF' },
  { category: '1.1 Km - 1.5 Km', percentage: 33, color: '#0EA5E9' },
  { category: '1.6 Km - 2.0 Km', percentage: 0, color: '#10B981' },
  { category: '2.1 Km - 3.0 Km', percentage: 0, color: '#F59E0B' },
  { category: '> 3.0 Km', percentage: 0, color: '#8B5CF6' },
]

const distanceChartData = allDistanceCategories

// 4. Grouping Data
const groupingChartData = [
  { name: 'GENERAL', percentage: 67, color: '#1677FF' },
  { name: 'SIBLING', percentage: 13, color: '#10B981' },
  { name: 'ALUMNI', percentage: 12, color: '#F59E0B' },
  { name: 'SIBLING & ALUMNI COMBO', percentage: 8, color: '#8B5CF6' },
]

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
  // Single Chart Date filter ('ALL' | '10' | '11' | '12') & Drill-down state
  const [selectedDateFilter, setSelectedDateFilter] = useState<'ALL' | '10' | '11' | '12'>('ALL')
  const [drillDownSlot, setDrillDownSlot] = useState<SlotChartItem | null>(null)

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

  // Summary Cards: Total Application & Application Submitted
  const totalApplications = useMemo(() => {
    return dateTimeCountData.reduce((acc, curr) => acc + curr.count, 0)
  }, [])
  const totalApplicationSubmitted = totalApplications

  // Dynamic Gender Wise Report Data
  const genderChartData = useMemo(() => {
    const total = totalApplicationSubmitted || 1
    const maleCount = Math.round(total * 0.58)
    const femaleCount = total - maleCount
    const malePct = Math.round((maleCount / total) * 100)
    const femalePct = 100 - malePct
    return [
      { name: 'Male', value: maleCount, percentage: malePct, color: '#1677FF' },
      { name: 'Female', value: femaleCount, percentage: femalePct, color: '#EC4899' },
    ]
  }, [totalApplicationSubmitted])

  // 3. Chronological 4-Hour Time Slot Aggregated Data (Date 10, Date 11, Date 12)
  const slotChartData = useMemo<SlotChartItem[]>(() => {
    return fourHourSlotDefinitions.map((slotDef) => {
      const hourlyRecords = slotDef.hours.map((hourStr) => {
        const match = dateTimeCountData.find(
          (item) => item.date === slotDef.date && item.time === hourStr
        )
        return {
          time: hourStr,
          count: match ? match.count : 0,
        }
      })
      const totalSeats = hourlyRecords.reduce((acc, curr) => acc + curr.count, 0)

      return {
        id: slotDef.id,
        date: slotDef.date,
        slotRange: slotDef.slotRange,
        fullLabel: slotDef.fullLabel,
        shortLabel: slotDef.shortLabel,
        totalSeats,
        hourlyRecords,
      }
    })
  }, [])

  // Filtered by selected date (or ALL by default)
  const displayedSlots = useMemo(() => {
    if (selectedDateFilter === 'ALL') {
      return slotChartData
    }
    return slotChartData.filter((item) => item.date === selectedDateFilter)
  }, [slotChartData, selectedDateFilter])


  const getDateColor = (date: '10' | '11' | '12') => {
    switch (date) {
      case '10':
        return '#1677FF' // Blue
      case '11':
        return '#8B5CF6' // Purple
      case '12':
        return '#0EA5E9' // Cyan
      default:
        return '#1677FF'
    }
  }

  // 5. KK Nagar Branch Table Data
  const kkNagarSeatData = useMemo<KKNagarSeatRow[]>(() => {
    if (appliedFilters.branch !== 'ALL' && appliedFilters.branch !== 'KK Nagar-PSBB') {
      return []
    }
    return defaultKKNagarSlotData
  }, [appliedFilters.branch])

  // 6. T-Nagar (Inagar) Branch Table Data
  const tNagarSeatData = useMemo<TNagarSeatRow[]>(() => {
    if (appliedFilters.branch !== 'ALL' && appliedFilters.branch !== 'T.Nagar-PSBB') {
      return []
    }
    return defaultTNagarSlotData
  }, [appliedFilters.branch])

  // 7. KK Nagar Table Columns Definition (10 AM - 11 AM, 11 AM - 12 PM, 1 PM - 2 PM, 2 PM - 3 PM)
  const kkNagarColumns = useMemo<ColumnDef<KKNagarSeatRow>[]>(
    () => [
      {
        accessorKey: 'no',
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1.5 cursor-pointer hover:bg-white/10 p-1 rounded transition-colors select-none font-semibold text-white"
          >
            <span>No.</span>
            <ArrowUpDown className="h-3 w-3 opacity-70" />
          </button>
        ),
        cell: ({ row }) => (
          <span className="font-bold text-slate-900 dark:text-white">
            {row.original.no}
          </span>
        ),
      },
      {
        accessorKey: 'slot10to11',
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1.5 cursor-pointer hover:bg-white/10 p-1 rounded transition-colors select-none font-semibold text-white"
          >
            <span>10 AM - 11 AM</span>
            <ArrowUpDown className="h-3 w-3 opacity-70" />
          </button>
        ),
        cell: ({ row }) => (
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {row.original.slot10to11}
          </span>
        ),
      },
      {
        accessorKey: 'slot11to12',
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1.5 cursor-pointer hover:bg-white/10 p-1 rounded transition-colors select-none font-semibold text-white"
          >
            <span>11 AM - 12 PM</span>
            <ArrowUpDown className="h-3 w-3 opacity-70" />
          </button>
        ),
        cell: ({ row }) => (
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {row.original.slot11to12}
          </span>
        ),
      },
      {
        accessorKey: 'slot1to2',
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1.5 cursor-pointer hover:bg-white/10 p-1 rounded transition-colors select-none font-semibold text-white"
          >
            <span>1 PM - 2 PM</span>
            <ArrowUpDown className="h-3 w-3 opacity-70" />
          </button>
        ),
        cell: ({ row }) => (
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {row.original.slot1to2}
          </span>
        ),
      },
      {
        accessorKey: 'slot2to3',
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1.5 cursor-pointer hover:bg-white/10 p-1 rounded transition-colors select-none font-semibold text-white"
          >
            <span>2 PM - 3 PM</span>
            <ArrowUpDown className="h-3 w-3 opacity-70" />
          </button>
        ),
        cell: ({ row }) => (
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {row.original.slot2to3}
          </span>
        ),
      },
    ],
    []
  )

  // 8. T-Nagar (Inagar) Table Columns Definition (10 AM - 1 PM, 2 PM - 4 PM)
  const tNagarColumns = useMemo<ColumnDef<TNagarSeatRow>[]>(
    () => [
      {
        accessorKey: 'no',
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1.5 cursor-pointer hover:bg-white/10 p-1 rounded transition-colors select-none font-semibold text-white"
          >
            <span>No.</span>
            <ArrowUpDown className="h-3 w-3 opacity-70" />
          </button>
        ),
        cell: ({ row }) => (
          <span className="font-bold text-slate-900 dark:text-white">
            {row.original.no}
          </span>
        ),
      },
      {
        accessorKey: 'slot10to1',
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1.5 cursor-pointer hover:bg-white/10 p-1 rounded transition-colors select-none font-semibold text-white"
          >
            <span>10 AM - 1 PM</span>
            <ArrowUpDown className="h-3 w-3 opacity-70" />
          </button>
        ),
        cell: ({ row }) => (
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {row.original.slot10to1}
          </span>
        ),
      },
      {
        accessorKey: 'slot2to4',
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1.5 cursor-pointer hover:bg-white/10 p-1 rounded transition-colors select-none font-semibold text-white"
          >
            <span>2 PM - 4 PM</span>
            <ArrowUpDown className="h-3 w-3 opacity-70" />
          </button>
        ),
        cell: ({ row }) => (
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {row.original.slot2to4}
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

      {/* Top Metric Cards: Total Application & Application Submitted */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Application"
          value={totalApplications + 10}
          icon={<Layers className="h-5 w-5" />}
          valueClass="text-slate-900 dark:text-white"
          iconClass="bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400"
        />
        <MetricCard
          label="Application Submitted"
          value={totalApplicationSubmitted}
          icon={<Users className="h-5 w-5" />}
          valueClass="text-slate-900 dark:text-white"
          iconClass="bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
        />
      </div>

      {/* ================= ONE SINGLE COMBINED TIME-BASED CHART WITH 4-HOUR SLOTS & DRILL-DOWN ================= */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-6">
        {/* Date Report Header Card Inside Single Chart Container */}
        <div className="bg-slate-50/90 dark:bg-slate-950/70 p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
              Application Submission Trends
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              4-Hour time slot distribution across Dates 10, 11 &amp; 12
            </p>
          </div>

          {/* Quick Date Focus Filter: ALL, Date 10, Date 11, Date 12 */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
            <button
              type="button"
              onClick={() => {
                setSelectedDateFilter('ALL')
                setDrillDownSlot(null)
              }}
              className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${selectedDateFilter === 'ALL'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
            >
              All Dates
            </button>
            {(['10', '11', '12'] as const).map((date) => (
              <button
                key={date}
                type="button"
                onClick={() => {
                  setSelectedDateFilter(date)
                  setDrillDownSlot(null)
                }}
                className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${selectedDateFilter === date
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
              >
                Date {date}
              </button>
            ))}
          </div>
        </div>

        {/* ================= CONDITIONAL: DRILL-DOWN VIEW VS MAIN CHART ================= */}
        {drillDownSlot ? (
          /* DRILL-DOWN VIEW */
          <div className="bg-slate-50/80 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-6">
            {/* Drill-down Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className="px-2.5 py-0.5 rounded text-xs font-black text-white shadow-2xs"
                    style={{ backgroundColor: getDateColor(drillDownSlot.date) }}
                  >
                    Date {drillDownSlot.date}
                  </span>
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {drillDownSlot.slotRange}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Individual hourly breakdown for {drillDownSlot.fullLabel}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setDrillDownSlot(null)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold shadow-2xs cursor-pointer transition-all active:scale-95"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Overview
              </button>
            </div>

            {/* Drill-down Grid: Breakdown Table/List + Mini Visual Chart */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Hourly Seat List */}
              <div className="space-y-3">
                <div className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-2xs">
                  {drillDownSlot.hourlyRecords.map((rec) => (
                    <div
                      key={rec.time}
                      className="flex items-center justify-between px-4 py-3 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <span className="font-bold text-slate-900 dark:text-white">
                        {rec.time}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 font-mono">→</span>
                        <span
                          className={`font-black px-2.5 py-0.5 rounded text-xs ${rec.count > 0
                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400'
                            : 'text-slate-400'
                            }`}
                        >
                          {rec.count} {rec.count === 1 ? 'seat' : 'seats'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total highlight */}
                <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 flex items-center justify-between">
                  <span className="text-sm font-bold text-blue-900 dark:text-blue-200">
                    Total Seats ({drillDownSlot.slotRange}):
                  </span>
                  <span className="text-xl font-black text-blue-600 dark:text-blue-400">
                    {drillDownSlot.totalSeats}
                  </span>
                </div>
              </div>

              {/* Mini Visual Chart for the 4 hours */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                <p className="text-xs font-bold text-slate-500 mb-2">
                  Hourly Distribution
                </p>
                <ChartContainer config={hourlyDrillConfig} className="h-56 w-full">
                  <LineChart
                    accessibilityLayer
                    data={drillDownSlot.hourlyRecords}
                    margin={{ top: 12, right: 15, left: -20, bottom: 5 }}
                  >
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis
                      dataKey="time"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tick={{ fontSize: 10, fontWeight: 600 }}
                      tickFormatter={(val) => val.replace(':00', '')}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 10 }}
                      allowDecimals={false}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke={getDateColor(drillDownSlot.date)}
                      strokeWidth={2.5}
                      dot={{
                        r: 4.5,
                        fill: getDateColor(drillDownSlot.date),
                        strokeWidth: 2,
                        stroke: '#ffffff',
                      }}
                      activeDot={{
                        r: 6.5,
                        fill: getDateColor(drillDownSlot.date),
                        strokeWidth: 2,
                        stroke: '#ffffff',
                      }}
                      name="Seats"
                    />
                  </LineChart>
                </ChartContainer>
              </div>
            </div>

            {/* Bottom Back Button */}
            {/* <div className="pt-2">
              <button
                type="button"
                onClick={() => setDrillDownSlot(null)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-bold shadow-2xs cursor-pointer transition-all active:scale-95"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                ← Back to Overview
              </button>
            </div> */}
          </div>
        ) : (
          /* MAIN COMBINED 4-HOUR CHART */
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between px-1 gap-2">
              <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                Total Applications / Seats per 4-Hour Range (Click any bar to drill down)
              </span>
              <div className="flex items-center gap-5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span className="inline-flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-[4px] bg-[#1677FF] shrink-0" />
                  <span>Date 10</span>
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-[4px] bg-[#8B5CF6] shrink-0" />
                  <span>Date 11</span>
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-[4px] bg-[#0EA5E9] shrink-0" />
                  <span>Date 12</span>
                </span>
              </div>
            </div>

            {/* Combined Bar Chart */}
            <ChartContainer config={singleChartConfig} className="h-80 w-full">
              <BarChart
                accessibilityLayer
                data={displayedSlots}
                barCategoryGap="18%"
                onClick={(state: any) => {
                  if (state && state.activePayload && state.activePayload.length) {
                    const item = state.activePayload[0].payload as SlotChartItem
                    if (item) setDrillDownSlot(item)
                  }
                }}
                className="cursor-pointer"
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="shortLabel"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  angle={-15}
                  textAnchor="end"
                  height={50}
                  interval={0}
                  tick={{ fontSize: 9, fontWeight: 600 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11 }}
                  allowDecimals={false}
                />
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as SlotChartItem
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1 border border-slate-700">
                          <p className="font-extrabold text-blue-400">Date {data.date}</p>
                          <p className="font-semibold">{data.slotRange}</p>
                          <p className="text-sm font-black text-white">
                            Total: {data.totalSeats} {data.totalSeats === 1 ? 'seat' : 'seats'}
                          </p>
                          <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-700">
                            👆 Click to drill down into hourly records
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar dataKey="totalSeats" radius={[4, 4, 0, 0]} name="Total Seats">
                  {displayedSlots.map((entry) => (
                    <Cell
                      key={entry.id}
                      fill={getDateColor(entry.date)}
                      onClick={() => setDrillDownSlot(entry)}
                      className="cursor-pointer hover:opacity-85 transition-opacity"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </div>
        )}
      </div>

      {/* ================= 4 REPORT CHARTS (2 x 2 GRID) ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ROW 1 - CHART 1: GENDER WISE REPORT */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#1677FF] dark:text-blue-400">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                  Gender Wise Report
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  Dynamic Male &amp; Female distribution
                </p>
              </div>
            </div>
          </div>

          <div className="h-64 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {genderChartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any, name: any) => [
                    `${val} (${name === 'Male' ? genderChartData[0].percentage : genderChartData[1].percentage}%)`,
                    name,
                  ]}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label inside donut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total</span>
              <span className="text-xl font-black text-slate-900 dark:text-white">
                {totalApplicationSubmitted}
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-2">
            {genderChartData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <span
                  className="w-3.5 h-3.5 rounded-[4px] shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {item.name} ({item.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ROW 1 - CHART 2: FATHER'S SALARY */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <Briefcase className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                  Father's Salary
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  Income range distribution
                </p>
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fatherSalaryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 45 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="range"
                  tickLine={false}
                  axisLine={false}
                  angle={-25}
                  textAnchor="end"
                  interval={0}
                  tick={{ fontSize: 9, fontWeight: 600 }}
                  height={50}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`}
                  tick={{ fontSize: 10 }}
                  allowDecimals={false}
                />
                <Tooltip
                  formatter={(val: any) => [`${val}%`, 'Percentage']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="percentage" radius={[4, 4, 0, 0]}>
                  {fatherSalaryChartData.map((entry, index) => (
                    <Cell
                      key={`salary-${index}`}
                      fill={entry.percentage > 0 ? entry.color : '#CBD5E1'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Complete Salary Range Legend */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5">
              {allSalaryCategories.map((item) => (
                <div key={item.range} className="flex items-center gap-2">
                  <span
                    className="w-3.5 h-3.5 rounded-[4px] shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {item.range} {item.percentage > 0 && <span className="font-bold text-slate-500">({item.percentage}%)</span>}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ROW 2 - CHART 3: DISTANCE FROM RESIDENCE */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
                <MapPin className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                  Distance From Residence
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  Distance radius distribution
                </p>
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={distanceChartData}
                margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10 }}
                />
                <YAxis
                  type="category"
                  dataKey="category"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fontWeight: 600 }}
                  width={95}
                />
                <Tooltip
                  formatter={(val: any) => [`${val}%`, 'Percentage']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="percentage" radius={[0, 4, 4, 0]}>
                  {distanceChartData.map((entry, index) => (
                    <Cell
                      key={`distance-${index}`}
                      fill={entry.percentage > 0 ? entry.color : '#CBD5E1'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Complete Distance Categories Legend */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5">
              {allDistanceCategories.map((item) => (
                <div key={item.category} className="flex items-center gap-2">
                  <span
                    className="w-3.5 h-3.5 rounded-[4px] shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {item.category} {item.percentage > 0 && <span className="font-bold text-slate-500">({item.percentage}%)</span>}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ROW 2 - CHART 4: GROUPING */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                <Layers className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                  Grouping
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  Category allocation breakdown
                </p>
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={groupingChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  dataKey="percentage"
                  nameKey="name"
                  label={({ value }: any) => `${value}%`}
                  labelLine={false}
                >
                  {groupingChartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any, name: any) => [`${val}%`, name]}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Grouping Legend */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            {groupingChartData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <span
                  className="w-3.5 h-3.5 rounded-[4px] shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {item.name} <span className="font-bold text-slate-500">({item.percentage}%)</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ================= DATA TABLES (BOTTOM) ================= */}
      <div className={`grid grid-cols-1 ${appliedFilters.branch === 'ALL' ? 'lg:grid-cols-2' : 'lg:grid-cols-1'} gap-6`}>
        {/* KK Nagar Table */}
        {(appliedFilters.branch === 'ALL' || appliedFilters.branch === 'KK Nagar-PSBB') && (
          <SeatAvailabilityTable
            title="KK Nagar"
            subtitle="Application Submission slots"
            data={kkNagarSeatData}
            columns={kkNagarColumns}
            searchPlaceholder="Search No. / Range..."
            iconColorClass="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
          />
        )}

        {/* T-Nagar Table */}
        {(appliedFilters.branch === 'ALL' || appliedFilters.branch === 'T.Nagar-PSBB') && (
          <SeatAvailabilityTable
            title="T-Nagar"
            subtitle="Application Submission slots"
            data={tNagarSeatData}
            columns={tNagarColumns}
            searchPlaceholder="Search No. / Range..."
            iconColorClass="bg-blue-50 dark:bg-blue-950/60 text-[#1677FF] dark:text-blue-400"
          />
        )}
      </div>
    </div>
  )
}