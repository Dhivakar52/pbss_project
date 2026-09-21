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
  Area,
  AreaChart,
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { format, subDays } from 'date-fns'
import { BarChart3, TrendingUp, Users, CheckCircle, Clock, School } from 'lucide-react'
import { toast } from '@/components/ui/toast'

// ---------- Data ----------
const branchData = [
  { name: 'T.Nagar', applications: 45, declared: 32, approved: 10 },
  { name: 'KK Nagar', applications: 38, declared: 25, approved: 8 },
  { name: 'Nungambakkam', applications: 27, declared: 18, approved: 5 },
]

const statusData = [
  { status: 'declared', value: 75, fill: 'var(--color-declared)' },
  { status: 'approved', value: 23, fill: 'var(--color-approved)' },
  { status: 'pending', value: 12, fill: 'var(--color-pending)' },
  { status: 'draft', value: 5, fill: 'var(--color-draft)' },
]

// ---------- Stacked Timeline Data (3 branches per day) ----------
const timelineData = [
  { date: 'Jan 10', tNagar: 5, kkNagar: 4, nungambakkam: 3 },
  { date: 'Jan 12', tNagar: 10, kkNagar: 8, nungambakkam: 6 },
  { date: 'Jan 14', tNagar: 18, kkNagar: 14, nungambakkam: 10 },
  { date: 'Jan 16', tNagar: 28, kkNagar: 22, nungambakkam: 18 },
  { date: 'Jan 18', tNagar: 36, kkNagar: 30, nungambakkam: 23 },
  { date: 'Jan 20', tNagar: 45, kkNagar: 38, nungambakkam: 27 },
]

// ---------- Interactive Area Chart Data ----------
const generateDailyData = () => {
  const today = new Date()
  const data: { date: string; applications: number }[] = []
  for (let i = 89; i >= 0; i--) {
    const d = subDays(today, i)
    const base = 0.8 + (89 - i) / 90
    const noise = Math.random() * 1.5
    const daily = Math.round(base + noise)
    data.push({
      date: format(d, 'yyyy-MM-dd'),
      applications: daily,
    })
  }
  return data
}

const dailyData = generateDailyData()

// ---------- Chart Configs ----------
const branchChartConfig = {
  applications: { label: 'Total Apps', color: '#1677FF' },
  declared: { label: 'Declared', color: '#10B981' },
} satisfies ChartConfig

const statusChartConfig = {
  value: { label: 'Applications' },
  declared: { label: 'Declared', color: '#10B981' },
  approved: { label: 'Approved', color: '#1677FF' },
  pending: { label: 'Pending', color: '#F59E0B' },
  draft: { label: 'Draft', color: '#94A3B8' },
} satisfies ChartConfig

// ✅ Stacked chart config — one key per branch
const timelineChartConfig = {
  tNagar: { label: 'T.Nagar', color: '#1677FF' },
  kkNagar: { label: 'KK Nagar', color: '#10B981' },
  nungambakkam: { label: 'Nungambakkam', color: '#8B5CF6' },
} satisfies ChartConfig

const interactiveChartConfig = {
  applications: {
    label: 'Applications',
    color: '#8B5CF6',
  },
} satisfies ChartConfig

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

// ---------- Interactive Area Chart Component ----------
type TimeRange = '90d' | '30d' | '7d'

const InteractiveAreaChart: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('90d')

  const filteredData = useMemo(() => {
    const days = timeRange === '90d' ? 90 : timeRange === '30d' ? 30 : 7
    return dailyData.slice(-days)
  }, [timeRange])

  const total = useMemo(
    () => filteredData.reduce((sum, d) => sum + d.applications, 0),
    [filteredData],
  )

  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-3">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-purple-600" /> Application Submission Trend
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">
            Daily applications over the selected period
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-xs text-slate-500">
            Total:{' '}
            <span className="font-bold text-slate-900 dark:text-white">{total}</span>
          </span>
          <Select value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
            <SelectTrigger
              className="w-[140px] rounded-lg text-xs h-8"
              aria-label="Select a time range"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg text-xs">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg text-xs">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg text-xs">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Chart */}
      <ChartContainer config={interactiveChartConfig} className="h-64 w-full">
        <AreaChart accessibilityLayer data={filteredData}>
          <defs>
            <linearGradient id="fillApplicationsInteractive" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-applications)" stopOpacity={0.8} />
              <stop offset="95%" stopColor="var(--color-applications)" stopOpacity={0.1} />
            </linearGradient>
          </defs>

          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={32}
            tick={{ fontSize: 11 }}
            tickFormatter={(value) => {
              const date = new Date(value)
              return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })
            }}
          />
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                indicator="line"
                labelFormatter={(value) =>
                  new Date(value).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                }
              />
            }
          />
          <Area
            dataKey="applications"
            type="natural"
            fill="url(#fillApplicationsInteractive)"
            stroke="var(--color-applications)"
            strokeWidth={2}
            stackId="a"
          />
        </AreaChart>
      </ChartContainer>
    </div>
  )
}

// ---------- Main ----------
export const AdminCharts: React.FC = () => {
  const [academicYear, setAcademicYear] = useState('2025-26')
  const [branch, setBranch] = useState('T.Nagar-PSBB')
  const [applicationStatus, setApplicationStatus] = useState('Declared')

  const handleSubmit = () => {
    toast.success(`Filter Applied: Academic Year (${academicYear}) | Branch (${branch || 'All'}) | Status (${applicationStatus || 'All'})`)
  }

  const totalApps = 115
  const declaredApps = 75
  const approvedApps = 23
  const pendingApps = 12

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex items-center gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
          <BarChart3 className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">
            Registration Analytics & Charts
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Visual statistics for Pre-KG 2025-26 applications
          </p>
        </div>
      </div>

      {/* ================= TOP FILTER BAR (MATCHING USER REFERENCE) ================= */}
      <div className="bg-[#f0f4f8] dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl shadow-2xs flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-semibold text-slate-700 dark:text-slate-300">
        <div className="flex items-center gap-2">
          <label htmlFor="academicYear">Academic Year</label>
          <select
            id="academicYear"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            className="h-8 px-2.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
          >
            <option value="2025-26">2025-26</option>
            <option value="2024-25">2024-25</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="branch">Branch</label>
          <select
            id="branch"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            className="h-8 px-2.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
          >
            <option value="">-- Select All --</option>
            <option value="T.Nagar-PSBB">T.Nagar-PSBB</option>
            <option value="KK Nagar-PSBB">KK Nagar-PSBB</option>
            <option value="Nungambakkam-PSBB">Nungambakkam-PSBB</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="appStatus">Application Status</label>
          <select
            id="appStatus"
            value={applicationStatus}
            onChange={(e) => setApplicationStatus(e.target.value)}
            className="h-8 px-2.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
          >
            <option value="">-- Select All --</option>
            <option value="Declared">Declared</option>
            <option value="Approved">Approved</option>
            <option value="Pending">Pending</option>
            <option value="Draft">Draft</option>
          </select>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          className="h-8 px-6 text-white font-extrabold rounded-xl shadow-md border border-sky-400/50 transition-all cursor-pointer tracking-wider text-xs flex items-center justify-center active:scale-95 btn-app-gradient"
          style={{ background: "var(--app-gradient)" }}
        >
          SUBMIT
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Applications"
          value={totalApps}
          icon={<Users className="h-5 w-5" />}
          valueClass="text-slate-900 dark:text-white"
          iconClass="bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
        />
        <MetricCard
          label="Declared Applications"
          value={declaredApps}
          icon={<CheckCircle className="h-5 w-5" />}
          valueClass="text-emerald-600 dark:text-emerald-400"
          iconClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400"
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

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Applications by Branch */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
          <div className="border-b pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <School className="h-4 w-4 text-blue-600" /> Applications by Branch
            </h3>
          </div>
          <ChartContainer config={branchChartConfig} className="h-64 w-full">
            <BarChart accessibilityLayer data={branchData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fontSize: 11 }}
              />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="applications" fill="var(--color-applications)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="declared" fill="var(--color-declared)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </div>

        {/* Chart 2: Status Breakdown Pie */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
          <div className="border-b pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-600" /> Application Status Breakdown
            </h3>
          </div>
          <ChartContainer config={statusChartConfig} className="h-64 w-full">
            <PieChart>
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="status"
                innerRadius={50}
                outerRadius={85}
                paddingAngle={4}
                strokeWidth={2}
              >
                {statusData.map((entry) => (
                  <Cell key={entry.status} fill={entry.fill} />
                ))}
              </Pie>
              <ChartLegend content={<ChartLegendContent nameKey="status" />} />
            </PieChart>
          </ChartContainer>
        </div>

        {/* Chart 3: Stacked Area Chart — Branch contribution over time */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
          <div className="border-b pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-600" /> Application Submission Trend Over Time
            </h3>
          </div>
          <ChartContainer config={timelineChartConfig} className="h-64 w-full">
            <AreaChart accessibilityLayer data={timelineData}>
              <defs>
                <linearGradient id="fillTNagar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-tNagar)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-tNagar)" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="fillKKNagar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-kkNagar)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-kkNagar)" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="fillNungambakkam" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-nungambakkam)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-nungambakkam)" stopOpacity={0.1} />
                </linearGradient>
              </defs>

              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fontSize: 11 }}
              />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <ChartLegend content={<ChartLegendContent />} />

              <Area
                dataKey="tNagar"
                type="natural"
                fill="url(#fillTNagar)"
                stroke="var(--color-tNagar)"
                strokeWidth={2}
                stackId="a"
              />
              <Area
                dataKey="kkNagar"
                type="natural"
                fill="url(#fillKKNagar)"
                stroke="var(--color-kkNagar)"
                strokeWidth={2}
                stackId="a"
              />
              <Area
                dataKey="nungambakkam"
                type="natural"
                fill="url(#fillNungambakkam)"
                stroke="var(--color-nungambakkam)"
                strokeWidth={2}
                stackId="a"
              />
            </AreaChart>
          </ChartContainer>
        </div>
      </div>

      {/* Interactive Area Chart — Full Width */}
      <InteractiveAreaChart />

    </div>
  )
}