import React, { useState, useMemo, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ApiService } from '@/services/api.service'
import CustomPanel from '@/common/CustomPanel'
import { Field, SelectField, TextField } from '@/components/FormPrimitives'
import { AdminDataTable } from '@/components/AdminDataTable'
import { reportConfig, formatHeaderLabel, type ReportConfigItem } from '@/data/reportConfig'
import { exportToExcel, type ExportColumn } from '@/utils/exportToExcel'
import { exportToPdf } from '@/utils/exportToPdf'
import {
  Trash2,
  AlertTriangle,
  Search,
  RotateCcw,
} from 'lucide-react'
import { toast } from '@/components/ui/toast'
import { useMasterStore } from '@/store/useMasterStore'
import { useStudentStore } from '@/store/useStudentStore'

const reportOptions = Object.keys(reportConfig).map((key) => ({
  value: key,
  label: reportConfig[key].label,
}))

// Reports that display high-level statistical summaries rather than individual applicants
const SUMMARY_REPORTS = [
  'application-statistics',
  'date-wise',
  'submission-date-wise',
  'statistics',
]



const DEFAULT_FILTERS: Record<string, string> = {
  academicYearId: '1',
  branchId: '',
  applicationStatusId: '',
  alumniCategory: 'all',
  siblingCategory: 'all',
  siblingSchoolId: '',
  siblingType: '',
  appNoFrom: '',
  appNoTo: '',
  registrationNumber: '',
  genderId: '',
  alumni: '',
  childGotoPlaySchool: '',
  isNormalChild: '',
  isTwins: '',
  schoolGoingSibilings: '',
  fatherIncomeId: '',
  motherIncomeId: '',
  distanceId: '',
  motherTongueId: '',
  nationalityId: '',
  religionId: '',
  casteId: '',
  communityId: '',
}

export const AdminReports: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { students } = useStudentStore()
  const schools = useMasterStore((s) => s.schools)
  const academicYears = useMasterStore((s) => s.academicYears)
  const distances = useMasterStore((s) => s.distances)
  const castes = useMasterStore((s) => s.castes)
  const lookups = useMasterStore((s) => s.lookups)
  const motherTongues = useMasterStore((s) => s.motherTongues)
  const incomeRanges = useMasterStore((s) => s.incomeRanges)
  const fetchMasters = useMasterStore((s) => s.fetchMasters)

  useEffect(() => {
    fetchMasters()
  }, [fetchMasters])

  const academicYearOptions = useMemo(
    () => academicYears.map((a) => ({ value: String(a.AcademicYearID), label: a.AcademicYear })),
    [academicYears]
  )
  const branchOptions = useMemo(
    () => schools.map((s) => ({ value: String(s.SchoolID), label: s.School || '' })),
    [schools]
  )
  const statusOptions = useMemo(
    () =>
      lookups
        .filter((l) => l.LookupRefID === 11 && l.LookupValue)
        .map((l) => ({ value: String(l.LookupID), label: l.LookupValue })),
    [lookups]
  )
  const genderOptions = useMemo(
    () =>
      lookups
        .filter((l) => l.LookupRefID === 2 && l.LookupValue)
        .map((l) => ({ value: String(l.LookupID), label: l.LookupValue })),
    [lookups]
  )
  const nationalityOptions = useMemo(
    () =>
      lookups
        .filter((l) => l.LookupRefID === 3 && l.LookupValue)
        .map((l) => ({ value: String(l.LookupID), label: l.LookupValue })),
    [lookups]
  )
  const religionOptions = useMemo(
    () =>
      lookups
        .filter((l) => l.LookupRefID === 4 && l.LookupValue)
        .map((l) => ({ value: String(l.LookupID), label: l.LookupValue })),
    [lookups]
  )
  const communityOptions = useMemo(
    () =>
      lookups
        .filter((l) => l.LookupRefID === 5 && l.LookupValue)
        .map((l) => ({ value: String(l.LookupID), label: l.LookupValue })),
    [lookups]
  )
  const incomeOptions = useMemo(
    () => incomeRanges.map((i) => ({ value: String(i.IncomeRangeID), label: i.IncomeRange })),
    [incomeRanges]
  )
  const distanceOptions = useMemo(
    () => distances.map((d) => ({ value: String(d.DistanceID), label: d.DistanceName })),
    [distances]
  )
  const motherTongueOptions = useMemo(
    () => motherTongues.map((m) => ({ value: String(m.MotherTongueID), label: m.MotherTongueName })),
    [motherTongues]
  )
  const casteOptions = useMemo(
    () => castes.map((c) => ({ value: String(c.CasteID), label: c.CasteName })),
    [castes]
  )
  const siblingSchoolOptions = useMemo(
    () =>
      lookups
        .filter((l) => l.LookupRefID === 13 && l.LookupValue)
        .map((l) => ({ value: String(l.LookupID), label: l.LookupValue })),
    [lookups]
  )
  const siblingTypeOptions = useMemo(
    () =>
      lookups
        .filter((l) => l.LookupRefID === 12 && l.LookupValue)
        .map((l) => ({ value: String(l.LookupID), label: l.LookupValue })),
    [lookups]
  )

  // 1. Single Source of Truth for Selected Report Type (URL query sync, default to tracksheet-verification)
  const reportParam = searchParams.get('report')
  const initialReport = (reportParam && reportConfig[reportParam]) ? reportParam : 'tracksheet-verification'
  const [selectedReport, setSelectedReport] = useState<string>(initialReport)

  // Listen to searchParams changes so back button or deep links switch reports smoothly
  useEffect(() => {
    const reportFromUrl = searchParams.get('report')
    if (reportFromUrl && reportConfig[reportFromUrl] && reportFromUrl !== selectedReport) {
      handleReportChange(reportFromUrl)
    }
  }, [searchParams])

  // Search input state (controlled so it resets cleanly when switching reports)
  const [searchTerm, setSearchTerm] = useState<string>('')

  const currentReport: ReportConfigItem = reportConfig[selectedReport] || reportConfig['tracksheet-verification']

  // Helper function to build applied filters with specific SP parameters
  const buildAppliedFilters = (filters: Record<string, string>, reportType: string): Record<string, any> => {
    const result: Record<string, any> = {}

    // Only copy non-empty values
    for (const [k, v] of Object.entries(filters)) {
      if (v !== undefined && v !== null && v !== '') {
        result[k] = v
      }
    }

    // Expand Alumni Category for App.ProcAlumniReport
    if (reportType === 'alumni') {
      if (filters.alumniCategory === 'sibling-excluded') {
        result.siblingsExcluded = 1
        delete result.alumni
        delete result.alumniExcluded
      } else if (filters.alumniCategory === 'alumni-excluded') {
        result.alumniExcluded = 1
        delete result.alumni
        delete result.siblingsExcluded
      } else {
        result.alumni = 1
        delete result.siblingsExcluded
        delete result.alumniExcluded
      }
      delete result.alumniCategory
    }

    // Expand Sibling Category for App.ProcSiblingsReport
    if (reportType === 'siblings') {
      if (filters.siblingCategory === 'alumni-excluded') {
        result.alumniExcluded = 1
        delete result.siblings
        delete result.siblingsAlumni
      } else if (filters.siblingCategory === 'sibling-alumni') {
        result.siblingsAlumni = 1
        delete result.siblings
        delete result.alumniExcluded
      } else {
        result.siblings = 1
        delete result.alumniExcluded
        delete result.siblingsAlumni
      }
      delete result.siblingCategory
    }

    return result
  }

  // 2. Active Filter Values State (Default: only Academic Year selected, others empty)
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({ ...DEFAULT_FILTERS })

  // Applied Filter State (triggered when user clicks 'SUBMIT' - initially ONLY academicYearId is passed)
  const [appliedFilters, setAppliedFilters] = useState<Record<string, any>>({
    academicYearId: '1',
  })

  // Live database records from App.Proc...Report stored procedures
  const [liveReportData, setLiveReportData] = useState<any[] | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // Fetch live report data when selectedReport or appliedFilters change
  useEffect(() => {
    let isMounted = true
    setIsLoading(true)

    ApiService.fetchReport(selectedReport, appliedFilters)
      .then((data) => {
        if (isMounted) {
          if (data && Array.isArray(data)) {
            setLiveReportData(data)
          } else {
            setLiveReportData([])
          }
        }
      })
      .catch((err) => {
        console.warn('Live report fetch warning:', err)
        if (isMounted) setLiveReportData([])
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => { isMounted = false }
  }, [selectedReport, appliedFilters])

  // Pure live DB data (no hardcoded fallback)
  const baseData = useMemo(() => {
    return liveReportData || []
  }, [liveReportData])

  // 3. Filter Panel side drawer open state
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false)

  // 4. Delete Confirmation State
  const [deletingRecord, setDeletingRecord] = useState<any | null>(null)

  // 5. Local deleted record IDs tracking per report
  const [deletedIds, setDeletedIds] = useState<Record<string, string[]>>({})

  // Identify whether the currently selected report is an aggregated statistical report
  const isSummaryReport = useMemo(
    () => SUMMARY_REPORTS.includes(selectedReport),
    [selectedReport]
  )

  // Compute number of active extra filters applied
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (activeFilters.academicYearId && activeFilters.academicYearId !== '1') count++
    if (activeFilters.branchId) count++
    if (activeFilters.applicationStatusId) count++
    if (selectedReport === 'alumni' && activeFilters.alumniCategory && activeFilters.alumniCategory !== 'all') count++
    if (selectedReport === 'siblings') {
      if (activeFilters.siblingCategory && activeFilters.siblingCategory !== 'all') count++
      if (activeFilters.siblingSchoolId && activeFilters.siblingSchoolId !== '1046') count++
    }
    if (selectedReport === 'twins-triplets' && activeFilters.siblingType && activeFilters.siblingType !== '1045') count++
    if (selectedReport === 'tracksheet-verification') {
      if (activeFilters.appNoFrom) count++
      if (activeFilters.appNoTo) count++
    }
    if (selectedReport === 'detailed') {
      const detailedKeys = [
        'registrationNumber', 'genderId', 'alumni', 'childGotoPlaySchool',
        'isNormalChild', 'isTwins', 'schoolGoingSibilings', 'fatherIncomeId',
        'motherIncomeId', 'distanceId', 'motherTongueId', 'nationalityId',
        'religionId', 'casteId', 'communityId'
      ]
      detailedKeys.forEach((k) => {
        if (activeFilters[k]) count++
      })
    }
    return count
  }, [activeFilters, selectedReport])

  // Handle Report Type Change: resets search, filters and view states cleanly
  const handleReportChange = (newReportType: string) => {
    setSelectedReport(newReportType)
    setSearchParams({ report: newReportType }, { replace: true })
    setSearchTerm('')
    setDeletingRecord(null)

    // Reset filters: keep currently selected academicYearId
    const baseFilters: Record<string, string> = {
      ...DEFAULT_FILTERS,
      academicYearId: activeFilters.academicYearId !== undefined ? activeFilters.academicYearId : '1',
    }

    setActiveFilters(baseFilters)
    setAppliedFilters(buildAppliedFilters(baseFilters, newReportType))
    const newConfig = reportConfig[newReportType]
    toast.info(`Switched to ${newConfig?.label || newReportType}`)
  }

  // Handle Dynamic Filter Field Change
  const handleFilterValueChange = (key: string, value: string) => {
    setActiveFilters((prev) => ({
      ...prev,
      [key]: value
    }))
  }

  // Filter Handler (SUBMIT)
  const handleApplyFilters = () => {
    setAppliedFilters(buildAppliedFilters(activeFilters, selectedReport))
    setIsFilterPanelOpen(false)
    toast.success(`Loading report: ${currentReport.label}`)
  }

  // Clear Handler
  const handleClearFilters = () => {
    const cleared: Record<string, string> = { ...DEFAULT_FILTERS }
    setActiveFilters(cleared)
    setAppliedFilters(buildAppliedFilters(cleared, selectedReport))
    setSearchTerm('')
    toast.info('Report filters reset')
  }

  // Filtered dataset based on search term and deleted IDs
  const reportData = useMemo(() => {
    const reportDeleted = deletedIds[selectedReport] || []

    return baseData.filter((item: any) => {
      // Exclude locally deleted records
      if (item.id && reportDeleted.includes(item.id)) return false
      if (item.ApplicationNo && reportDeleted.includes(item.ApplicationNo)) return false

      // Text search
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase()
        const match = Object.values(item).some(val =>
          val !== null && val !== undefined && String(val).toLowerCase().includes(q)
        )
        if (!match) return false
      }

      return true
    })
  }, [baseData, searchTerm, deletedIds, selectedReport])

  // Derive clean, dynamic column headers directly based on database returned rows
  const dynamicReportColumns = useMemo(() => {
    if (reportData && reportData.length > 0) {
      const sample = reportData[0]
      const keys = Object.keys(sample).filter((k) => {
        const lower = k.toLowerCase().replace(/[^a-z0-9]/g, '')
        // Exclude system/count/id columns and Applicant ID (Requirement 3)
        if (
          lower === 'totalrowcount' ||
          lower === 'rowcount' ||
          lower === 'id' ||
          lower === 'applicantid' ||
          lower === 'appdeclaredid' ||
          lower === 'applicant' ||
          k.startsWith('_')
        ) {
          return false
        }
        // Requirement 4: Exclude Application No and Student Name for summary reports
        if (isSummaryReport) {
          if (
            lower === 'applicationnumber' ||
            lower === 'applicationno' ||
            lower === 'registrationnumber' ||
            lower === 'studentname' ||
            lower === 'childname' ||
            lower === 'fullname' ||
            lower === 'name'
          ) {
            return false
          }
        }
        return true
      })
      if (keys.length > 0) {
        let cols = keys.map((key) => ({
          key,
          label: formatHeaderLabel(key),
          sortable: true,
        }))

        // Requirement 5: In Applicant Report ('detailed'), move status column to be the last column in grid
        if (selectedReport === 'detailed') {
          const statusColIdx = cols.findIndex((c) => {
            const l = c.key.toLowerCase().replace(/[^a-z0-9]/g, '')
            return l === 'applicationstatus' || l === 'status'
          })
          if (statusColIdx > -1) {
            const [statusCol] = cols.splice(statusColIdx, 1)
            cols.push(statusCol)
          }
        }

        return cols
      }
    }

    // Fallback static columns
    let cols = currentReport.columns.filter((c) => {
      const lower = c.key.toLowerCase().replace(/[^a-z0-9]/g, '')
      if (
        lower === 'applicantid' ||
        lower === 'appdeclaredid' ||
        lower === 'applicant' ||
        lower === 'id'
      ) {
        return false
      }
      if (isSummaryReport) {
        if (
          lower === 'applicationnumber' ||
          lower === 'applicationno' ||
          lower === 'registrationnumber' ||
          lower === 'studentname' ||
          lower === 'childname' ||
          lower === 'fullname' ||
          lower === 'name'
        ) {
          return false
        }
      }
      return true
    })

    // Requirement 5: In Applicant Report ('detailed'), move status column to be the last column in grid
    if (selectedReport === 'detailed') {
      const statusColIdx = cols.findIndex((c) => {
        const l = c.key.toLowerCase().replace(/[^a-z0-9]/g, '')
        return l === 'applicationstatus' || l === 'status'
      })
      if (statusColIdx > -1) {
        const [statusCol] = cols.splice(statusColIdx, 1)
        cols.push(statusCol)
      }
    }

    return cols
  }, [reportData, currentReport, isSummaryReport, selectedReport])

  // Export Handler
  const handleExportExcel = () => {
    const exportColumns: ExportColumn[] = isSummaryReport
      ? [
        { key: '_sno', label: 'S.No' },
        ...dynamicReportColumns
          .filter((c) => {
            const lower = c.key.toLowerCase().replace(/[^a-z0-9]/g, '')
            return (
              lower !== 'applicationnumber' &&
              lower !== 'studentname' &&
              lower !== 'applicationno' &&
              lower !== 'childname' &&
              lower !== 'fullname' &&
              lower !== 'sno' &&
              lower !== 'slno' &&
              lower !== 'id' &&
              lower !== 'applicantid' &&
              lower !== 'appdeclaredid' &&
              lower !== 'totalrowcount'
            )
          })
          .map((c) => ({ key: c.key, label: c.label })),
      ]
      : [
        { key: '_sno', label: 'S.No' },
        {
          key: dynamicReportColumns.some(
            (c) =>
              c.key.toLowerCase().replace(/[^a-z0-9]/g, '') === 'applicationno' ||
              c.key.toLowerCase().replace(/[^a-z0-9]/g, '') === 'applicationnumber'
          )
            ? dynamicReportColumns.find(
              (c) =>
                c.key.toLowerCase().replace(/[^a-z0-9]/g, '') === 'applicationno' ||
                c.key.toLowerCase().replace(/[^a-z0-9]/g, '') === 'applicationnumber'
            )?.key || 'ApplicationNo'
            : 'ApplicationNo',
          label: 'Application No',
        },
        {
          key: dynamicReportColumns.some(
            (c) =>
              c.key.toLowerCase().replace(/[^a-z0-9]/g, '') === 'childname' ||
              c.key.toLowerCase().replace(/[^a-z0-9]/g, '') === 'studentname'
          )
            ? dynamicReportColumns.find(
              (c) =>
                c.key.toLowerCase().replace(/[^a-z0-9]/g, '') === 'childname' ||
                c.key.toLowerCase().replace(/[^a-z0-9]/g, '') === 'studentname'
            )?.key || 'ChildName'
            : 'ChildName',
          label: 'Student Name',
        },
        ...dynamicReportColumns
          .filter((c) => {
            const lower = c.key.toLowerCase().replace(/[^a-z0-9]/g, '')
            return (
              lower !== 'applicationnumber' &&
              lower !== 'studentname' &&
              lower !== 'applicationno' &&
              lower !== 'childname' &&
              lower !== 'fullname' &&
              lower !== 'sno' &&
              lower !== 'slno' &&
              lower !== 'id' &&
              lower !== 'applicantid' &&
              lower !== 'appdeclaredid' &&
              lower !== 'totalrowcount'
            )
          })
          .map((c) => ({ key: c.key, label: c.label })),
      ]

    const exportData = reportData.map((row: any, idx: number) => ({
      ...row,
      _sno: idx + 1,
    }))

    const safeName = currentReport.label.replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '_')
    exportToExcel(exportData, exportColumns, `${safeName}_Report`, currentReport.label)
    toast.success(`Exported ${currentReport.label} to Excel successfully!`)
  }

  // Direct PDF Export / Download Handler for Popover action
  const handleExportPdf = () => {
    if (!reportData || reportData.length === 0) {
      toast.info('No data available to export to PDF.')
      return
    }

    const exportColumns: ExportColumn[] = isSummaryReport
      ? [
        { key: '_sno', label: 'S.No' },
        ...dynamicReportColumns
          .filter((c) => {
            const lower = c.key.toLowerCase().replace(/[^a-z0-9]/g, '')
            return (
              lower !== 'applicationnumber' &&
              lower !== 'studentname' &&
              lower !== 'applicationno' &&
              lower !== 'childname' &&
              lower !== 'fullname' &&
              lower !== 'sno' &&
              lower !== 'slno' &&
              lower !== 'id' &&
              lower !== 'applicantid' &&
              lower !== 'appdeclaredid' &&
              lower !== 'totalrowcount'
            )
          })
          .map((c) => ({ key: c.key, label: c.label })),
      ]
      : [
        { key: '_sno', label: 'S.No' },
        {
          key: dynamicReportColumns.some(
            (c) =>
              c.key.toLowerCase().replace(/[^a-z0-9]/g, '') === 'applicationno' ||
              c.key.toLowerCase().replace(/[^a-z0-9]/g, '') === 'applicationnumber'
          )
            ? dynamicReportColumns.find(
              (c) =>
                c.key.toLowerCase().replace(/[^a-z0-9]/g, '') === 'applicationno' ||
                c.key.toLowerCase().replace(/[^a-z0-9]/g, '') === 'applicationnumber'
            )?.key || 'ApplicationNo'
            : 'ApplicationNo',
          label: 'Application No',
        },
        {
          key: dynamicReportColumns.some(
            (c) =>
              c.key.toLowerCase().replace(/[^a-z0-9]/g, '') === 'childname' ||
              c.key.toLowerCase().replace(/[^a-z0-9]/g, '') === 'studentname'
          )
            ? dynamicReportColumns.find(
              (c) =>
                c.key.toLowerCase().replace(/[^a-z0-9]/g, '') === 'childname' ||
                c.key.toLowerCase().replace(/[^a-z0-9]/g, '') === 'studentname'
            )?.key || 'ChildName'
            : 'ChildName',
          label: 'Student Name',
        },
        ...dynamicReportColumns
          .filter((c) => {
            const lower = c.key.toLowerCase().replace(/[^a-z0-9]/g, '')
            return (
              lower !== 'applicationnumber' &&
              lower !== 'studentname' &&
              lower !== 'applicationno' &&
              lower !== 'childname' &&
              lower !== 'fullname' &&
              lower !== 'sno' &&
              lower !== 'slno' &&
              lower !== 'id' &&
              lower !== 'applicantid' &&
              lower !== 'appdeclaredid' &&
              lower !== 'totalrowcount'
            )
          })
          .map((c) => ({ key: c.key, label: c.label })),
      ]

    const safeName = currentReport.label.replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '_')
    const academicYearLabel = activeFilters.academicYearId === '2' ? '2024-2025' : '2025-2026'

    exportToPdf(reportData, exportColumns, {
      title: currentReport.label,
      academicYear: academicYearLabel,
      fileName: `${safeName}_Report`,
    })

    toast.success(`Exported ${currentReport.label} to PDF successfully!`)
  }

  // View Action Handler: Redirects to /admission/:id?mode=view directly (matching Student Master)
  const handleView = (record: any) => {
    const realId = record.ApplicantID || record.AppDeclaredID || record.id
    const reportName = encodeURIComponent(currentReport.label)
    if (realId) {
      navigate(`/admission/${realId}?mode=view&from=report&report=${selectedReport}&reportName=${reportName}`)
      return
    }
    const appNo =
      record.ApplicationNo ||
      record.application_number ||
      record.APPLICATION_NUMBER ||
      record.registrationNumber
    if (appNo) {
      const matched = students.find((s) => s.registrationNumber === appNo)
      if (matched) {
        navigate(`/admission/${matched.id}?mode=view&from=report&report=${selectedReport}&reportName=${reportName}`)
        return
      }
      navigate(`/admission/${appNo}?mode=view&from=report&report=${selectedReport}&reportName=${reportName}`)
      return
    }
  }

  // Edit Action Handler
  const handleEdit = (record: any) => {
    const realId = record.ApplicantID || record.AppDeclaredID || record.id
    const reportName = encodeURIComponent(currentReport.label)
    if (realId) {
      navigate(`/admission/${realId}?mode=edit&from=report&report=${selectedReport}&reportName=${reportName}`)
      return
    }
    const appNo =
      record.ApplicationNo ||
      record.application_number ||
      record.APPLICATION_NUMBER ||
      record.registrationNumber
    if (appNo) {
      const matched = students.find((s) => s.registrationNumber === appNo)
      if (matched) {
        navigate(`/admission/${matched.id}?mode=edit&from=report&report=${selectedReport}&reportName=${reportName}`)
        return
      }
      navigate(`/admission/${appNo}?mode=edit&from=report&report=${selectedReport}&reportName=${reportName}`)
      return
    }
  }

  // Delete Action Handler
  const handleDeleteConfirm = () => {
    if (!deletingRecord) return
    const id = deletingRecord.id || deletingRecord.ApplicationNo || deletingRecord.application_number || deletingRecord.APPLICATION_NUMBER
    setDeletedIds((prev) => ({
      ...prev,
      [selectedReport]: [...(prev[selectedReport] || []), id]
    }))
    toast.success(`Deleted report record: ${id}`)
    setDeletingRecord(null)
  }

  // Helper to extract fields safely regardless of snake_case or UPPER_SNAKE_CASE
  const getRecordValue = (record: any, ...keys: string[]) => {
    if (!record) return ''
    for (const k of keys) {
      if (record[k] !== undefined && record[k] !== null && record[k] !== '') {
        return record[k]
      }
    }
    return '-'
  }

  return (
    <div className="space-y-6">
      {/* ================= REPORT SELECTOR & ACADEMIC YEAR CONTROLS ================= */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            {/* 1. Select Report Name */}
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">
                Select Report Name:
              </span>
              <div className="w-64 sm:w-72">
                <SelectField
                  value={selectedReport}
                  onChange={handleReportChange}
                  options={reportOptions}
                  className="font-bold text-xs"
                />
              </div>
            </div>

            {/* 2. Academic Year */}
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">
                Academic Year:
              </span>
              <div className="w-36 sm:w-44">
                <SelectField
                  value={activeFilters.academicYearId !== undefined ? activeFilters.academicYearId : '1'}
                  onChange={(val) => handleFilterValueChange('academicYearId', val)}
                  options={academicYearOptions}
                  className="font-bold text-xs"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons: SEARCH & CLEAR (Export to Excel removed from top card) */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleApplyFilters}
              disabled={isLoading}
              style={{ background: "var(--app-gradient)" }}
              className="px-4 py-2 text-white font-bold text-xs rounded-xl shadow-xs transition-opacity hover:opacity-90 cursor-pointer flex items-center gap-1.5"
            >
              <Search className="h-3.5 w-3.5" />
              {isLoading ? 'Searching...' : 'SEARCH'}
            </button>
            <button
              type="button"
              onClick={handleClearFilters}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              CLEAR
            </button>
          </div>
        </div>
      </div>

      {/* ================= DATA TABLE ================= */}
      <AdminDataTable
        key={selectedReport}
        title={currentReport.label}
        subtitle={currentReport.description}
        data={reportData}
        columns={dynamicReportColumns}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder={`Filter in current ${currentReport.label} results...`}
        showApplicationAndStudentCols={!isSummaryReport}
        showActions={!isSummaryReport}
        onSelectId={handleView}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={(rec) => setDeletingRecord(rec)}
        showCheckmarkCols={false}
        onToggleFilterPanel={() => setIsFilterPanelOpen(true)}
        activeFilterCount={activeFilterCount}
        onClearFilters={handleClearFilters}
        onExportExcel={handleExportExcel}
        onExportPdf={handleExportPdf}
        onPrint={handleExportPdf}
      />

      {/* ================= DYNAMIC SIDE DRAWER FILTER PANEL ================= */}
      <CustomPanel
        isOpen={isFilterPanelOpen}
        title={`${currentReport.label} - Filter Options`}
        onClose={() => setIsFilterPanelOpen(false)}
        onSave={handleApplyFilters}
        saveLabel="Apply Filter"
        width="620px"
      >
        <div className="space-y-4">
          {/* Uniform 2-column grid for ALL filter parameters without any split/headers (Single smooth scrollbar) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Common: Branch & Application Status */}

            <Field label="Branch">
              <SelectField
                value={activeFilters.branchId || ''}
                onChange={(val) => handleFilterValueChange('branchId', val)}
                placeholder="-- All Branches --"
                options={branchOptions}
              />
            </Field>

            <Field label="Application Status">
              <SelectField
                value={activeFilters.applicationStatusId || ''}
                onChange={(val) => handleFilterValueChange('applicationStatusId', val)}
                placeholder="-- Select Status --"
                options={statusOptions}
              />
            </Field>

            {/* Detailed Applicant Report: all remaining 15 parameters in the exact same 2-column grid */}
            {selectedReport === 'detailed' && (
              <>
                <Field label="Registration No">
                  <TextField
                    value={activeFilters.registrationNumber || ''}
                    onChange={(val) => handleFilterValueChange('registrationNumber', val)}
                    placeholder="e.g. T25-0001"
                  />
                </Field>

                <Field label="Gender">
                  <SelectField
                    value={activeFilters.genderId || ''}
                    onChange={(val) => handleFilterValueChange('genderId', val)}
                    placeholder="-- Select Gender --"
                    options={genderOptions}
                  />
                </Field>

                <Field label="Alumni Category">
                  <SelectField
                    value={activeFilters.alumni || ''}
                    onChange={(val) => handleFilterValueChange('alumni', val)}
                    placeholder="-- Select Alumni --"
                    options={[
                      { value: '1', label: 'Father' },
                      { value: '2', label: 'Mother' },
                      { value: '3', label: 'Either Father or Mother' },
                      { value: '4', label: 'Both Parents' },
                    ]}
                  />
                </Field>

                <Field label="Child Goes to Play School">
                  <SelectField
                    value={activeFilters.childGotoPlaySchool || ''}
                    onChange={(val) => handleFilterValueChange('childGotoPlaySchool', val)}
                    placeholder="-- Select --"
                    options={[
                      { value: '1', label: 'Yes' },
                      { value: '0', label: 'No' },
                    ]}
                  />
                </Field>

                <Field label="Physically Challenged">
                  <SelectField
                    value={activeFilters.isNormalChild || ''}
                    onChange={(val) => handleFilterValueChange('isNormalChild', val)}
                    placeholder="-- Select --"
                    options={[
                      { value: '0', label: 'Yes' },
                      { value: '1', label: 'No' },
                    ]}
                  />
                </Field>

                <Field label="Twins / Triplets">
                  <SelectField
                    value={activeFilters.isTwins || ''}
                    onChange={(val) => handleFilterValueChange('isTwins', val)}
                    placeholder="-- Select --"
                    options={[
                      { value: '1', label: 'Yes' },
                      { value: '0', label: 'No' },
                    ]}
                  />
                </Field>

                <Field label="Siblings Studying">
                  <SelectField
                    value={activeFilters.schoolGoingSibilings || ''}
                    onChange={(val) => handleFilterValueChange('schoolGoingSibilings', val)}
                    placeholder="-- Select --"
                    options={[
                      { value: '1', label: 'Yes' },
                      { value: '0', label: 'No' },
                    ]}
                  />
                </Field>

                <Field label="Father Income Range">
                  <SelectField
                    value={activeFilters.fatherIncomeId || ''}
                    onChange={(val) => handleFilterValueChange('fatherIncomeId', val)}
                    placeholder="-- Select Range --"
                    options={incomeOptions}
                  />
                </Field>

                <Field label="Mother Income Range">
                  <SelectField
                    value={activeFilters.motherIncomeId || ''}
                    onChange={(val) => handleFilterValueChange('motherIncomeId', val)}
                    placeholder="-- Select Range --"
                    options={incomeOptions}
                  />
                </Field>

                <Field label="Distance from School">
                  <SelectField
                    value={activeFilters.distanceId || ''}
                    onChange={(val) => handleFilterValueChange('distanceId', val)}
                    placeholder="-- Select Distance --"
                    options={distanceOptions}
                  />
                </Field>

                <Field label="Mother Tongue">
                  <SelectField
                    value={activeFilters.motherTongueId || ''}
                    onChange={(val) => handleFilterValueChange('motherTongueId', val)}
                    placeholder="-- Select Mother Tongue --"
                    options={motherTongueOptions}
                  />
                </Field>

                <Field label="Nationality">
                  <SelectField
                    value={activeFilters.nationalityId || ''}
                    onChange={(val) => handleFilterValueChange('nationalityId', val)}
                    placeholder="-- Select Nationality --"
                    options={nationalityOptions}
                  />
                </Field>

                <Field label="Religion">
                  <SelectField
                    value={activeFilters.religionId || ''}
                    onChange={(val) => handleFilterValueChange('religionId', val)}
                    placeholder="-- Select Religion --"
                    options={religionOptions}
                  />
                </Field>

                <Field label="Caste">
                  <SelectField
                    value={activeFilters.casteId || ''}
                    onChange={(val) => handleFilterValueChange('casteId', val)}
                    placeholder="-- Select Caste --"
                    options={casteOptions}
                  />
                </Field>

                <Field label="Community">
                  <SelectField
                    value={activeFilters.communityId || ''}
                    onChange={(val) => handleFilterValueChange('communityId', val)}
                    placeholder="-- Select Community --"
                    options={communityOptions}
                  />
                </Field>
              </>
            )}

            {/* Contextual for Alumni report */}
            {selectedReport === 'alumni' && (
              <Field label="Alumni Category">
                <SelectField
                  value={activeFilters.alumniCategory || 'all'}
                  onChange={(val) => handleFilterValueChange('alumniCategory', val)}
                  options={[
                    { value: 'all', label: 'All Alumni' },
                    { value: 'sibling-excluded', label: 'Sibling Excluded' },
                    { value: 'alumni-excluded', label: 'Alumni Excluded (General)' },
                  ]}
                />
              </Field>
            )}

            {/* Contextual for Siblings report */}
            {selectedReport === 'siblings' && (
              <>
                <Field label="Sibling Category">
                  <SelectField
                    value={activeFilters.siblingCategory || 'all'}
                    onChange={(val) => handleFilterValueChange('siblingCategory', val)}
                    options={[
                      { value: 'all', label: 'All Siblings' },
                      { value: 'alumni-excluded', label: 'Alumni Excluded' },
                      { value: 'sibling-alumni', label: 'Sibling & Alumni' },
                    ]}
                  />
                </Field>
                <Field label="Sibling's School">
                  <SelectField
                    value={activeFilters.siblingSchoolId || (siblingSchoolOptions[0]?.value ?? '')}
                    onChange={(val) => handleFilterValueChange('siblingSchoolId', val)}
                    options={siblingSchoolOptions}
                  />
                </Field>
              </>
            )}

            {/* Contextual for Twins/Triplets report */}
            {selectedReport === 'twins-triplets' && (
              <Field label="Sibling Type">
                <SelectField
                  value={activeFilters.siblingType || (siblingTypeOptions[0]?.value ?? '')}
                  onChange={(val) => handleFilterValueChange('siblingType', val)}
                  options={siblingTypeOptions}
                />
              </Field>
            )}

            {/* Contextual for TrackSheet Verification report */}
            {selectedReport === 'tracksheet-verification' && (
              <>
                <Field label="From Application No">
                  <TextField
                    value={activeFilters.appNoFrom || ''}
                    onChange={(val) => handleFilterValueChange('appNoFrom', val)}
                    placeholder="e.g. 1"
                  />
                </Field>
                <Field label="To Application No">
                  <TextField
                    value={activeFilters.appNoTo || ''}
                    onChange={(val) => handleFilterValueChange('appNoTo', val)}
                    placeholder="e.g. 100"
                  />
                </Field>
              </>
            )}
          </div>

          {/* Drawer Footer Clear Action */}
          <div className="pt-2 flex justify-start items-center border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={handleClearFilters}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset All Filters
            </button>
          </div>
        </div>
      </CustomPanel>

      {/* ================= DELETE CONFIRMATION MODAL ================= */}
      {deletingRecord && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 bg-rose-100 dark:bg-rose-950/50 rounded-xl">
                <AlertTriangle className="h-6 w-6 text-rose-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete Report Record</h3>
                <p className="text-xs text-slate-500">Confirm permanent deletion of record</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Are you sure you want to delete application record{' '}
              <strong className="text-slate-900 dark:text-white">
                {getRecordValue(deletingRecord, 'application_number', 'APPLICATION_NUMBER', 'id')}
              </strong>{' '}
              ({getRecordValue(deletingRecord, 'student_name', 'STUDENT_NAME')})? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setDeletingRecord(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" /> Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
export default AdminReports
