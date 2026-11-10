import React, { useState, useMemo, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ApiService } from '@/services/api.service'
import CustomPanel from '@/common/CustomPanel'
import { type StudentRecord } from '@/data/mockStudents'
import { useStudentStore } from '@/store/useStudentStore'
import {
  Trash2,
  AlertTriangle,
  Plus,
  Search,
  SlidersHorizontal,
  Filter,
  FileSpreadsheet,
  FileText,
  UserCheck,
  RotateCcw,
  X,
} from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { toast } from '@/components/ui/toast'
import { StudentDataTable } from '@/components/students/StudentDataTable'
import Pagination from '@/common/Pagination'
import { Field, SelectField } from '@/components/FormPrimitives'
import { useMasterStore } from '@/store/useMasterStore'
import { exportToExcel, type ExportColumn } from '@/utils/exportToExcel'
import { exportToPdf } from '@/utils/exportToPdf'
import { PrintPreviewModal } from '@/components/print'
import {
  BulkUpdateDrawer,
  BulkUpdateConfirmModal,
  BulkUpdateSuccessModal,
  type PendingBulkUpdatePayload,
} from '@/components/students/bulk-update'

export const AdminStudents: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { students, deleteStudent, bulkUpdateStudents, setMasterStudents } = useStudentStore()

  // View mode tab matching PDF page 2 & 11 (URL query sync)
  const initialTabParam = searchParams.get('tab') as 'verification' | 'confirmation' | 'master' | null
  const validTabs: ('verification' | 'confirmation' | 'master')[] = ['verification', 'confirmation', 'master']
  const initialTab = (initialTabParam && validTabs.includes(initialTabParam)) ? initialTabParam : 'verification'

  const [activeTab, setActiveTab] = useState<'verification' | 'confirmation' | 'master'>(initialTab)

  // Listen to searchParams changes so back button or deep links switch tabs smoothly
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab') as 'verification' | 'confirmation' | 'master' | null
    if (tabFromUrl && validTabs.includes(tabFromUrl) && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl)
    }
  }, [searchParams])

  const [verificationEdits, setVerificationEdits] = useState<Record<number, { track: boolean; cert: boolean }>>({})
  const [confirmationEdits, setConfirmationEdits] = useState<Record<number, boolean>>({})
  const [isUpdating, setIsUpdating] = useState(false)

  // Tab 1: Verification Data State (loaded from [App].[ProcFetchApplicationVerification])
  const [verificationData, setVerificationData] = useState<any[]>([])
  const [isVerificationLoading, setIsVerificationLoading] = useState(false)
  const [verificationSearch, setVerificationSearch] = useState('')
  const [verificationPageIndex, setVerificationPageIndex] = useState(0)
  const [verificationPageSize, setVerificationPageSize] = useState(10)

  // Tab 2: Confirmation Data State (loaded from [App].[ProcFetchApplicationConfirmation])
  const [confirmationData, setConfirmationData] = useState<any[]>([])
  const [isConfirmationLoading, setIsConfirmationLoading] = useState(false)
  const [confirmationSearch, setConfirmationSearch] = useState('')
  const [confirmationPageIndex, setConfirmationPageIndex] = useState(0)
  const [confirmationPageSize, setConfirmationPageSize] = useState(10)

  // Master Store Data
  const schools = useMasterStore((s) => s.schools)
  const academicYears = useMasterStore((s) => s.academicYears)
  const ACADEMIC_YEAR_OPTIONS = useMasterStore((s) => s.academicYearNames)
  const SCHOOL_BRANCH_OPTIONS = useMasterStore((s) => s.schoolNames)
  const fetchMasters = useMasterStore((s) => s.fetchMasters)

  useEffect(() => {
    fetchMasters()
  }, [fetchMasters])

  // Filter panel state (Default to 2025-2026, branch empty)
  const [academicYear, setAcademicYear] = useState('2025-2026')
  const [schoolBranch, setSchoolBranch] = useState('')
  const [applnFrom, setApplnFrom] = useState('')
  const [applnTo, setApplnTo] = useState('')
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false)

  // Helper to extract branch ID
  const getBranchId = (branch: string): number | undefined => {
    if (!branch || branch === 'Select' || branch.startsWith('--') || branch.toLowerCase() === 'all') return undefined
    const match = schools.find((s) => s.School?.toLowerCase() === branch.toLowerCase() || String(s.SchoolID) === branch)
    if (match) return match.SchoolID
    const num = parseInt(branch, 10)
    return isNaN(num) ? undefined : num
  }

  // Helper to extract academic year ID. Returns undefined when unselected / "Select" -> sends NULL to SP
  const getAcademicYearId = (year: string): number | undefined => {
    if (!year || year === 'Select' || year.startsWith('--') || year.toLowerCase() === 'all') return undefined
    const match = academicYears.find((a) => a.AcademicYear.toLowerCase() === year.toLowerCase() || String(a.AcademicYearID) === year)
    if (match) return match.AcademicYearID
    const num = parseInt(year, 10)
    if (!isNaN(num) && academicYears.some(a => a.AcademicYearID === num)) return num
    return undefined
  }

  // 1. Fetch Verification records directly from SQL Server ([App].[ProcFetchApplicationVerification])
  const loadVerificationData = async (
    yearVal = academicYear,
    branchVal = schoolBranch,
    fromVal = applnFrom,
    toVal = applnTo
  ) => {
    setIsVerificationLoading(true)
    try {
      const bId = getBranchId(branchVal)
      const ayId = getAcademicYearId(yearVal)
      const res = await ApiService.fetchVerification({
        academicYearId: ayId,
        schoolId: bId,
        appNoFrom: fromVal ? Number(fromVal) : undefined,
        appNoTo: toVal ? Number(toVal) : undefined,
      })
      const records = Array.isArray(res) ? res : res?.value || res?.data || []
      setVerificationData(records)
    } catch (err) {
      console.warn('loadVerificationData error:', err)
    } finally {
      setIsVerificationLoading(false)
    }
  }

  // 2. Fetch Confirmation records directly from SQL Server ([App].[ProcFetchApplicationConfirmation])
  const loadConfirmationData = async (
    yearVal = academicYear,
    branchVal = schoolBranch,
    fromVal = applnFrom,
    toVal = applnTo
  ) => {
    setIsConfirmationLoading(true)
    try {
      const bId = getBranchId(branchVal)
      const ayId = getAcademicYearId(yearVal)
      const res = await ApiService.fetchConfirmation({
        academicYearId: ayId,
        schoolId: bId,
        appNoFrom: fromVal ? Number(fromVal) : undefined,
        appNoTo: toVal ? Number(toVal) : undefined,
      })
      const records = Array.isArray(res) ? res : res?.value || res?.data || []
      setConfirmationData(records)
    } catch (err) {
      console.warn('loadConfirmationData error:', err)
    } finally {
      setIsConfirmationLoading(false)
    }
  }

  // 3. Fetch real Master student records from SQL Server ([App].[ProcFetchApplicant])
  const loadMasterData = async () => {
    try {
      const res = await ApiService.fetchApplicant()
      const records = Array.isArray(res) ? res : res?.value || res?.data || []
      if (records.length > 0) {
        setMasterStudents(records)
      }
    } catch (err) {
      console.warn('loadMasterData error:', err)
    }
  }

  useEffect(() => {
    loadMasterData()
    loadVerificationData('2025-2026', '', '', '')
    loadConfirmationData('2025-2026', '', '', '')
  }, [])

  // Bulk Update state
  const [isBulkUpdateOpen, setIsBulkUpdateOpen] = useState(false)
  const [tableKey, setTableKey] = useState(0)
  const [pendingBulkUpdate, setPendingBulkUpdate] = useState<PendingBulkUpdatePayload | null>(null)
  const [isSubmittingBulkUpdate, setIsSubmittingBulkUpdate] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)

  // Extract available application numbers from existing student data
  const availableApplnNumbers = useMemo(() => {
    const set = new Set<string>()
    students.forEach((s) => {
      if (s.id && /^\d+$/.test(s.id)) set.add(s.id)
      const regDigits = s.registrationNumber ? s.registrationNumber.replace(/\D/g, '') : ''
      if (regDigits) set.add(regDigits)
    })
    return Array.from(set).sort((a, b) => Number(a) - Number(b))
  }, [students])

  // Filtered suggestions for 'From'
  const fromSuggestions = useMemo(() => {
    const trimmed = applnFrom.trim()
    if (!trimmed) return []
    return availableApplnNumbers.filter((num) => num.startsWith(trimmed) || num.includes(trimmed))
  }, [availableApplnNumbers, applnFrom])

  // Filtered suggestions for 'To'
  const toSuggestions = useMemo(() => {
    const trimmed = applnTo.trim()
    if (!trimmed) return []
    return availableApplnNumbers.filter((num) => num.startsWith(trimmed) || num.includes(trimmed))
  }, [availableApplnNumbers, applnTo])

  // Suggestion popup visibility states
  const [showFromSuggestions, setShowFromSuggestions] = useState(false)
  const [showToSuggestions, setShowToSuggestions] = useState(false)

  // Active filter state initialized with default academic year '2025-2026'
  const [filters, setFilters] = useState({
    academicYear: '2025-2026',
    schoolBranch: '',
    applnFrom: '',
    applnTo: '',
  })

  // Compute number of active extra filters applied
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.schoolBranch && filters.schoolBranch !== 'Select' && !filters.schoolBranch.startsWith('--')) count++
    if (filters.applnFrom) count++
    if (filters.applnTo) count++
    if (filters.academicYear && filters.academicYear !== '2025-2026') count++
    return count
  }, [filters])

  // Delete Modal State
  const [deletingStudent, setDeletingStudent] = useState<StudentRecord | null>(null)

  // Helper to extract numeric application value for comparison
  const getApplnNumericValue = (student: StudentRecord): number => {
    if (student.id && !isNaN(Number(student.id))) {
      return Number(student.id)
    }
    const digits = student.registrationNumber ? student.registrationNumber.replace(/\D/g, '') : ''
    return digits ? Number(digits) : NaN
  }

  // Filtered Students (Tab 3: All Applications Master)
  const filteredStudents = useMemo(() => {
    const fromNum = filters.applnFrom ? Number(filters.applnFrom) : null
    const toNum = filters.applnTo ? Number(filters.applnTo) : null

    return students.filter((item) => {
      // 1. Academic Year: Only filter when year is explicitly selected.
      // When empty, null, or "-- Select Year --", do not filter -> show all years!
      if (filters.academicYear && filters.academicYear !== 'Select' && !filters.academicYear.startsWith('--')) {
        const itemYear = (item.academicYear || '').trim()
        const targetYear = filters.academicYear.trim()
        if (targetYear && !itemYear.includes(targetYear.substring(0, 4))) {
          return false
        }
      }

      // 2. School Branch: Match by school branch ID or name
      if (filters.schoolBranch && filters.schoolBranch !== 'Select' && !filters.schoolBranch.startsWith('--')) {
        const bId = getBranchId(filters.schoolBranch)
        const itemBranchId = getBranchId(item.schoolBranch || '')
        if (bId && itemBranchId) {
          if (bId !== itemBranchId) return false
        } else {
          const itemB = (item.schoolBranch || '').toLowerCase().replace(/[^a-z0-9]/g, '')
          const targetB = filters.schoolBranch.toLowerCase().replace(/[^a-z0-9]/g, '')
          if (!itemB.includes(targetB) && !targetB.includes(itemB)) return false
        }
      }

      // 3. Application Number Range
      const studentApplnNum = getApplnNumericValue(item)
      if (!isNaN(studentApplnNum)) {
        if (fromNum !== null && !isNaN(fromNum) && studentApplnNum < fromNum) return false
        if (toNum !== null && !isNaN(toNum) && studentApplnNum > toNum) return false
      } else {
        if (filters.applnFrom && (item.registrationNumber || '') < filters.applnFrom) return false
        if (filters.applnTo && (item.registrationNumber || '') > filters.applnTo) return false
      }

      return true
    })
  }, [students, filters])

  // Filtered Verification Data (Tab 1: Search Filter)
  const filteredVerificationData = useMemo(() => {
    if (!verificationSearch.trim()) return verificationData
    const q = verificationSearch.toLowerCase().trim()
    return verificationData.filter((item: any) => {
      const appNo = String(item.ApplicationNo || '').toLowerCase()
      const name = String(item.StudentName || '').toLowerCase()
      const school = String(item.School || '').toLowerCase()
      const id = String(item.ApplicantID || item.AppDeclaredID || '').toLowerCase()
      return appNo.includes(q) || name.includes(q) || school.includes(q) || id.includes(q)
    })
  }, [verificationData, verificationSearch])

  // Tab 1 Pagination Adapter
  const verificationTablePagination = useMemo(() => ({
    getState: () => ({ pagination: { pageIndex: verificationPageIndex, pageSize: verificationPageSize } }),
    setPageIndex: (index: number) => setVerificationPageIndex(index),
    setPageSize: (size: number) => {
      setVerificationPageSize(size)
      setVerificationPageIndex(0)
    },
    previousPage: () => setVerificationPageIndex((p) => Math.max(0, p - 1)),
    nextPage: () => setVerificationPageIndex((p) => p + 1),
    getCanPreviousPage: () => verificationPageIndex > 0,
    getCanNextPage: () => (verificationPageIndex + 1) * verificationPageSize < filteredVerificationData.length,
  }), [verificationPageIndex, verificationPageSize, filteredVerificationData.length])

  // Tab 1 Paginated Data (10 records per page)
  const paginatedVerificationData = useMemo(() => {
    const start = verificationPageIndex * verificationPageSize
    return filteredVerificationData.slice(start, start + verificationPageSize)
  }, [filteredVerificationData, verificationPageIndex, verificationPageSize])

  // Filtered Confirmation Data (Tab 2: Search Filter)
  const filteredConfirmationData = useMemo(() => {
    if (!confirmationSearch.trim()) return confirmationData
    const q = confirmationSearch.toLowerCase().trim()
    return confirmationData.filter((item: any) => {
      const appNo = String(item.ApplicationNo || '').toLowerCase()
      const name = String(item.StudentName || '').toLowerCase()
      const school = String(item.School || '').toLowerCase()
      const id = String(item.ApplicantID || item.AppDeclaredID || '').toLowerCase()
      return appNo.includes(q) || name.includes(q) || school.includes(q) || id.includes(q)
    })
  }, [confirmationData, confirmationSearch])

  // Tab 2 Pagination Adapter
  const confirmationTablePagination = useMemo(() => ({
    getState: () => ({ pagination: { pageIndex: confirmationPageIndex, pageSize: confirmationPageSize } }),
    setPageIndex: (index: number) => setConfirmationPageIndex(index),
    setPageSize: (size: number) => {
      setConfirmationPageSize(size)
      setConfirmationPageIndex(0)
    },
    previousPage: () => setConfirmationPageIndex((p) => Math.max(0, p - 1)),
    nextPage: () => setConfirmationPageIndex((p) => p + 1),
    getCanPreviousPage: () => confirmationPageIndex > 0,
    getCanNextPage: () => (confirmationPageIndex + 1) * confirmationPageSize < filteredConfirmationData.length,
  }), [confirmationPageIndex, confirmationPageSize, filteredConfirmationData.length])

  // Tab 2 Paginated Data (10 records per page)
  const paginatedConfirmationData = useMemo(() => {
    const start = confirmationPageIndex * confirmationPageSize
    return filteredConfirmationData.slice(start, start + confirmationPageSize)
  }, [filteredConfirmationData, confirmationPageIndex, confirmationPageSize])

  // Export to Excel for Tab 1
  const handleExportVerificationExcel = () => {
    const exportCols: ExportColumn[] = [
      { key: 'ApplicationNo', label: 'Application No' },
      { key: 'StudentName', label: 'Student Name' },
      { key: 'School', label: 'School Branch' },
      { key: 'TrackSheetStatus', label: 'Track Sheet Status' },
      { key: 'CertificateSubmissionStatus', label: 'Certificate Submission Status' },
    ]
    exportToExcel(filteredVerificationData, exportCols, 'Student_Verification_Status', 'Verification')
    toast.success('Exported Student Verification Status to Excel')
  }

  // Export to PDF for Tab 1 (Full dataset)
  const handleExportVerificationPdf = () => {
    if (!filteredVerificationData || filteredVerificationData.length === 0) {
      toast.info('No data available to export to PDF.')
      return
    }
    const exportCols: ExportColumn[] = [
      { key: '_sno', label: 'S.No' },
      { key: 'ApplicationNo', label: 'Application No' },
      { key: 'StudentName', label: 'Student Name' },
      { key: 'School', label: 'School Branch' },
      { key: 'TrackSheetStatus', label: 'Track Sheet Status' },
      { key: 'CertificateSubmissionStatus', label: 'Certificate Submission Status' },
    ]
    exportToPdf(filteredVerificationData, exportCols, {
      title: 'Student Verification Status',
      academicYear: filters.academicYear || academicYear || '2025-2026',
      fileName: 'Student_Verification_Status',
    })
    toast.success('Exported Student Verification Status to PDF')
  }

  // Export to Excel for Tab 2
  const handleExportConfirmationExcel = () => {
    const exportCols: ExportColumn[] = [
      { key: 'ApplicationNo', label: 'Application No' },
      { key: 'StudentName', label: 'Student Name' },
      { key: 'School', label: 'School Branch' },
      { key: 'ApprovalStatus', label: 'Approve Status' },
    ]
    exportToExcel(filteredConfirmationData, exportCols, 'Student_Confirmation_Status', 'Confirmation')
    toast.success('Exported Student Confirmation Status to Excel')
  }

  // Export to PDF for Tab 2 (Full dataset)
  const handleExportConfirmationPdf = () => {
    if (!filteredConfirmationData || filteredConfirmationData.length === 0) {
      toast.info('No data available to export to PDF.')
      return
    }
    const exportCols: ExportColumn[] = [
      { key: '_sno', label: 'S.No' },
      { key: 'ApplicationNo', label: 'Application No' },
      { key: 'StudentName', label: 'Student Name' },
      { key: 'School', label: 'School Branch' },
      { key: 'ApprovalStatus', label: 'Approve Status' },
    ]
    exportToPdf(filteredConfirmationData, exportCols, {
      title: 'Student Confirmation Status (Before Admission)',
      academicYear: filters.academicYear || academicYear || '2025-2026',
      fileName: 'Student_Confirmation_Status',
    })
    toast.success('Exported Student Confirmation Status to PDF')
  }

  // Tab 3 Master Columns Definition
  const studentExportColumns: ExportColumn[] = [
    { key: 'slNo', label: 'SL No' },
    { key: 'registrationNumber', label: 'Reg Number' },
    { key: 'studentName', label: 'Student Name' },
    { key: 'fatherName', label: 'Parent / Guardian' },
    { key: 'schoolBranch', label: 'School Branch' },
    { key: 'academicYear', label: 'Academic Year' },
    { key: 'gender', label: 'Gender' },
    { key: 'motherTongue', label: 'Mother Tongue' },
    { key: 'applicationStatus', label: 'Application Status' },
    { key: 'date', label: 'Date' },
    { key: 'mobile', label: 'Mobile' },
    { key: 'city', label: 'City' },
    { key: 'area', label: 'Area' },
    { key: 'religion', label: 'Religion' },
    { key: 'caste', label: 'Caste' },
    { key: 'community', label: 'Community' },
    { key: 'trackSheet', label: 'Track Sheet' },
    { key: 'registrationForm', label: 'Registration Form' },
  ]

  // Export to PDF for Tab 3 (Full dataset)
  const handleExportMasterPdf = () => {
    if (!filteredStudents || filteredStudents.length === 0) {
      toast.info('No data available to export to PDF.')
      return
    }
    exportToPdf(filteredStudents, studentExportColumns, {
      title: 'Student Applications Master List',
      academicYear: filters.academicYear || academicYear || '2025-2026',
      fileName: 'Student_Master_List',
    })
    toast.success('Exported Student Master List to PDF')
  }

  // Filter Handler (Executes live SQL Stored Procedures across tabs)
  const handleApplyFilter = async () => {
    setFilters({
      academicYear,
      schoolBranch,
      applnFrom,
      applnTo,
    })
    setVerificationPageIndex(0)
    setConfirmationPageIndex(0)
    setIsFilterPanelOpen(false)
    setShowFromSuggestions(false)
    setShowToSuggestions(false)

    if (activeTab === 'verification') {
      await loadVerificationData(academicYear, schoolBranch, applnFrom, applnTo)
    } else if (activeTab === 'confirmation') {
      await loadConfirmationData(academicYear, schoolBranch, applnFrom, applnTo)
    } else {
      await loadMasterData()
    }

    toast.success('Filters applied successfully')
  }

  // Clear/Reset all filters back to default initial page load state
  const handleClearFilters = async () => {
    const defaultYear = '2025-2026'
    setAcademicYear(defaultYear)
    setSchoolBranch('')
    setApplnFrom('')
    setApplnTo('')
    setVerificationSearch('')
    setConfirmationSearch('')
    setVerificationPageIndex(0)
    setConfirmationPageIndex(0)
    setShowFromSuggestions(false)
    setShowToSuggestions(false)
    setFilters({
      academicYear: defaultYear,
      schoolBranch: '',
      applnFrom: '',
      applnTo: '',
    })

    if (activeTab === 'verification') {
      await loadVerificationData(defaultYear, '', '', '')
    } else if (activeTab === 'confirmation') {
      await loadConfirmationData(defaultYear, '', '', '')
    } else {
      await loadMasterData()
    }
    toast.info('Search filters reset')
  }

  // Clear Filter alias
  const handleClear = handleClearFilters

  // Remove individual filter parameter
  const handleRemoveFilter = async (key: 'schoolBranch' | 'applnFrom' | 'applnTo' | 'academicYear') => {
    const defaultYear = '2025-2026'
    const updated = { ...filters }
    if (key === 'academicYear') {
      updated.academicYear = defaultYear
      setAcademicYear(defaultYear)
    } else if (key === 'schoolBranch') {
      updated.schoolBranch = ''
      setSchoolBranch('')
    } else if (key === 'applnFrom') {
      updated.applnFrom = ''
      setApplnFrom('')
    } else if (key === 'applnTo') {
      updated.applnTo = ''
      setApplnTo('')
    }
    setFilters(updated)
    setVerificationPageIndex(0)
    setConfirmationPageIndex(0)

    if (activeTab === 'verification') {
      await loadVerificationData(updated.academicYear, updated.schoolBranch, updated.applnFrom, updated.applnTo)
    } else if (activeTab === 'confirmation') {
      await loadConfirmationData(updated.academicYear, updated.schoolBranch, updated.applnFrom, updated.applnTo)
    } else {
      await loadMasterData()
    }
    const label =
      key === 'schoolBranch'
        ? 'School'
        : key === 'academicYear'
        ? 'Academic Year'
        : key === 'applnFrom'
        ? 'From Appln'
        : 'To Appln'
    toast.info(`Removed ${label} filter`)
  }

  // Helper to render active filter badges row
  const renderActiveFilterBadges = () => {
    if (activeFilterCount === 0) return null
    return (
      <div className="flex flex-wrap items-center gap-2 pt-1 pb-1 text-xs animate-in fade-in duration-150">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Active Filters:
        </span>

        {/* School Branch Filter Chip */}
        {filters.schoolBranch && filters.schoolBranch !== 'Select' && !filters.schoolBranch.startsWith('--') && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800 shadow-2xs">
            <span className="text-slate-500 dark:text-slate-400 font-normal">School:</span>
            <span className="font-bold">{filters.schoolBranch}</span>
            <button
              type="button"
              onClick={() => handleRemoveFilter('schoolBranch')}
              className="text-blue-500 hover:text-rose-600 dark:hover:text-rose-400 p-0.5 rounded cursor-pointer transition-colors"
              title="Remove School filter"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        )}

        {/* Appln From Filter Chip */}
        {filters.applnFrom && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800 shadow-2xs">
            <span className="text-slate-500 dark:text-slate-400 font-normal">From:</span>
            <span className="font-mono font-bold">{filters.applnFrom}</span>
            <button
              type="button"
              onClick={() => handleRemoveFilter('applnFrom')}
              className="text-blue-500 hover:text-rose-600 dark:hover:text-rose-400 p-0.5 rounded cursor-pointer transition-colors"
              title="Remove From Appln filter"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        )}

        {/* Appln To Filter Chip */}
        {filters.applnTo && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800 shadow-2xs">
            <span className="text-slate-500 dark:text-slate-400 font-normal">To:</span>
            <span className="font-mono font-bold">{filters.applnTo}</span>
            <button
              type="button"
              onClick={() => handleRemoveFilter('applnTo')}
              className="text-blue-500 hover:text-rose-600 dark:hover:text-rose-400 p-0.5 rounded cursor-pointer transition-colors"
              title="Remove To Appln filter"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        )}

        {/* Academic Year Filter Chip */}
        {filters.academicYear && filters.academicYear !== '2025-2026' && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800 shadow-2xs">
            <span className="text-slate-500 dark:text-slate-400 font-normal">Year:</span>
            <span className="font-bold">{filters.academicYear}</span>
            <button
              type="button"
              onClick={() => handleRemoveFilter('academicYear')}
              className="text-blue-500 hover:text-rose-600 dark:hover:text-rose-400 p-0.5 rounded cursor-pointer transition-colors"
              title="Reset Academic Year to default (2025-2026)"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        )}

        {/* Clear All button */}
        <button
          type="button"
          onClick={handleClearFilters}
          className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer flex items-center gap-1 ml-1"
          title="Clear all filters"
        >
          <RotateCcw className="h-3 w-3" />
          Clear All
        </button>
      </div>
    )
  }

  // 1. Edit Action Handler (Navigates to /admission/:id?mode=edit with tab info)
  const handleEdit = (student: StudentRecord) => {
    navigate(`/admission/${student.id}?mode=edit&from=student-master&tab=${activeTab}`)
  }

  // 2. Select ID / View Action Handler (Navigates to /admission/:id?mode=view with tab info)
  const handleSelectStudent = (student: StudentRecord) => {
    navigate(`/admission/${student.id}?mode=view&from=student-master&tab=${activeTab}`)
  }

  // 3. Delete Action Handler
  const handleDeleteConfirm = () => {
    if (!deletingStudent) return
    deleteStudent(deletingStudent.id)
    toast.success(`Deleted student record: ${deletingStudent.registrationNumber}`)
    setDeletingStudent(null)
  }

  // 4. Print Preview Modal State & Handlers
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [previewDocType, setPreviewDocType] = useState<'track-sheet' | 'track-sheet-2' | 'registration-form' | 'registration-form-5'>('track-sheet')
  const [selectedStudentForPrint, setSelectedStudentForPrint] = useState<any | null>(null)

  const fetchFullStudentRecordForPrint = async (student: StudentRecord): Promise<any> => {
    let fullRecord: any = useStudentStore.getState().getStudentById(student.id) || student
    const numericId = Number(student.id)
    if (numericId > 0) {
      try {
        const res = await ApiService.fetchApplicant({ applicantId: numericId })
        const rawList = Array.isArray(res) ? res : (res?.value || res?.data || (res ? [res] : []))
        const dbRecord = rawList.find((a: any) => Number(a.ApplicantID) === numericId) || rawList[0]
        if (dbRecord) {
          fullRecord = { ...fullRecord, ...dbRecord }
        }
      } catch (e) {
        console.warn('Could not fetch applicant from DB for print:', e)
      }
    }
    return fullRecord
  }

  const handlePrintTrackSheet = async (student: StudentRecord) => {
    const fullRecord = await fetchFullStudentRecordForPrint(student)
    setSelectedStudentForPrint(fullRecord)
    setPreviewDocType('track-sheet')
    setIsPreviewModalOpen(true)
    try {
      await ApiService.generateTrackSheet(student.id)
    } catch (e) {
      console.warn('Live track sheet generation warning:', e)
    }
  }

  const handlePrintTrackSheet2 = async (student: StudentRecord) => {
    const fullRecord = await fetchFullStudentRecordForPrint(student)
    setSelectedStudentForPrint(fullRecord)
    setPreviewDocType('track-sheet-2')
    setIsPreviewModalOpen(true)
    try {
      await ApiService.generateTrackSheet(student.id, true)
    } catch (e) {
      console.warn('Live track sheet generation warning:', e)
    }
  }

  const handlePrintRegistrationForm = async (student: StudentRecord) => {
    const fullRecord = await fetchFullStudentRecordForPrint(student)
    setSelectedStudentForPrint(fullRecord)
    setPreviewDocType('registration-form')
    setIsPreviewModalOpen(true)
    try {
      await ApiService.generateRegistrationForm(student.id)
    } catch (e) {
      console.warn('Live registration form generation warning:', e)
    }
  }

  const handlePrintRegistrationForm5 = async (student: StudentRecord) => {
    const fullRecord = await fetchFullStudentRecordForPrint(student)
    setSelectedStudentForPrint(fullRecord)
    setPreviewDocType('registration-form-5')
    setIsPreviewModalOpen(true)
    try {
      await ApiService.generateRegistrationForm(student.id, true)
    } catch (e) {
      console.warn('Live registration form generation warning:', e)
    }
  }

  // Bulk Update Confirmation Handler
  const handleConfirmBulkUpdate = async () => {
    if (!pendingBulkUpdate) return
    setIsSubmittingBulkUpdate(true)
    try {
      const updates: Partial<StudentRecord> = {
        trackSheet: pendingBulkUpdate.trackSheet,
        registrationForm: pendingBulkUpdate.registrationForm,
        status1: pendingBulkUpdate.trackSheet,
        status2: pendingBulkUpdate.registrationForm,
      }

      // Persist to SQL Server using [App].[ProcSaveApplicationVerification]
      try {
        const verificationPayload = pendingBulkUpdate.applnNumbers.map((num) => ({
          ApplicationNumber: num,
          IsTrackSheetVerified: pendingBulkUpdate.trackSheet,
          IsCertificatesVerified: pendingBulkUpdate.registrationForm,
          VerifiedDate: new Date().toISOString(),
        }))
        await ApiService.saveVerification(verificationPayload)
      } catch (apiErr) {
        console.warn('API saveVerification warning:', apiErr)
      }

      const count = bulkUpdateStudents(pendingBulkUpdate.applnNumbers, updates)
      if (count > 0) {
        setPendingBulkUpdate(null)
        setIsSuccessModalOpen(true)
      } else {
        toast.error('No matching records were updated.')
      }
    } catch (err) {
      toast.error('Unable to update student records. Please try again.')
    } finally {
      setIsSubmittingBulkUpdate(false)
    }
  }

  // Navigation helpers for records fetched from SPs
  const handleSelectFromItem = (item: any) => {
    const realId = item.ApplicantID || item.AppDeclaredID
    if (realId) {
      navigate(`/admission/${realId}?mode=view&from=student-master&tab=${activeTab}`)
      return
    }
    const appNo = item.ApplicationNo
    const matched = students.find((s) => s.registrationNumber === appNo)
    if (matched) {
      handleSelectStudent(matched)
    } else {
      navigate(`/admission/${appNo}?mode=view&from=student-master&tab=${activeTab}`)
    }
  }

  const handleEditFromItem = (item: any) => {
    const realId = item.ApplicantID || item.AppDeclaredID
    if (realId) {
      navigate(`/admission/${realId}?mode=edit&from=student-master&tab=${activeTab}`)
      return
    }
    const appNo = item.ApplicationNo
    const matched = students.find((s) => s.registrationNumber === appNo)
    if (matched) {
      handleEdit(matched)
    } else {
      navigate(`/admission/${appNo}?mode=edit&from=student-master&tab=${activeTab}`)
    }
  }

  // Save Verification Edits (PDF Page 3 UPDATE button) -> [App].[ProcSaveApplicationVerification]
  const handleUpdateVerification = async () => {
    setIsUpdating(true)
    try {
      const payload = Object.entries(verificationEdits).map(([id, val]) => ({
        AppDeclaredID: Number(id),
        IsTrackSheetSubmitted: val.track,
        IsCertificatesSubmitted: val.cert,
        UpdatedBy: 1,
      }))
      if (payload.length === 0) {
        toast.info('No pending changes to update.')
        return
      }
      const success = await ApiService.saveVerification(payload)
      if (success) {
        toast.success('Student Verification Status updated successfully in database!')
        setVerificationEdits({})
        await loadVerificationData(academicYear, schoolBranch, applnFrom, applnTo)
      } else {
        toast.error('Failed to update verification status.')
      }
    } catch (e) {
      toast.error('Error saving verification updates.')
    } finally {
      setIsUpdating(false)
    }
  }

  // Save Confirmation Edits (PDF Page 12 UPDATE button) -> [App].[ProcSaveApplicationConfirmation]
  const handleUpdateConfirmation = async () => {
    setIsUpdating(true)
    try {
      const payload = Object.entries(confirmationEdits).map(([id, approved]) => ({
        AppDeclaredID: Number(id),
        IsAdmissionApproved: approved,
        UpdatedBy: 1,
      }))
      if (payload.length === 0) {
        toast.info('No pending changes to update.')
        return
      }
      const success = await ApiService.saveConfirmation(payload)
      if (success) {
        toast.success('Student Confirmation Status updated successfully in database!')
        setConfirmationEdits({})
        await loadConfirmationData(academicYear, schoolBranch, applnFrom, applnTo)
      } else {
        toast.error('Failed to update confirmation status.')
      }
    } catch (e) {
      toast.error('Error saving confirmation updates.')
    } finally {
      setIsUpdating(false)
    }
  }

  // Handle tab switching: automatically reverts all filters, search, and academic year to initial page load state
  const handleTabChange = (newTab: 'verification' | 'confirmation' | 'master') => {
    setActiveTab(newTab)
    setSearchParams({ tab: newTab }, { replace: true })
    const defaultYear = '2025-2026'
    setAcademicYear(defaultYear)
    setSchoolBranch('')
    setApplnFrom('')
    setApplnTo('')
    setVerificationSearch('')
    setConfirmationSearch('')
    setVerificationPageIndex(0)
    setConfirmationPageIndex(0)
    setShowFromSuggestions(false)
    setShowToSuggestions(false)
    setIsFilterPanelOpen(false)
    setFilters({
      academicYear: defaultYear,
      schoolBranch: '',
      applnFrom: '',
      applnTo: '',
    })

    if (newTab === 'verification') {
      loadVerificationData(defaultYear, '', '', '')
    } else if (newTab === 'confirmation') {
      loadConfirmationData(defaultYear, '', '', '')
    } else {
      loadMasterData()
    }
  }

  return (
    <div className="space-y-6">
      {/* ================= VIEW MODE TABS (PDF PAGE 2 & PAGE 11) ================= */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        {/* Left: 3 Tab Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleTabChange('verification')}
            style={activeTab === 'verification' ? { background: "var(--app-gradient)" } : undefined}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'verification'
                ? 'text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            Student Verification Status (Before Admission)
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('confirmation')}
            style={activeTab === 'confirmation' ? { background: "var(--app-gradient)" } : undefined}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'confirmation'
                ? 'text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            Student Confirmation Status (Before Admission)
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('master')}
            style={activeTab === 'master' ? { background: "var(--app-gradient)" } : undefined}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'master'
                ? 'text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            All Applications Master
          </button>
        </div>

        {/* Right: Academic Year Caption & Dropdown, SEARCH, and Clear Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">
              Academic Year:
            </span>
            <div className="w-40 sm:w-44">
              <SelectField
                value={academicYear}
                onChange={setAcademicYear}
                placeholder="-- Select Year --"
                options={ACADEMIC_YEAR_OPTIONS}
                className="font-bold text-xs"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={handleApplyFilter}
            style={{ background: "var(--app-gradient)" }}
            className="h-9 px-4 text-white font-bold text-xs rounded-xl shadow-xs transition-opacity hover:opacity-90 cursor-pointer flex items-center gap-1.5"
            title="Search Applications"
          >
            <Search className="h-3.5 w-3.5" />
            <span>SEARCH</span>
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="h-9 px-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1"
            title="Clear Filters"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>CLEAR</span>
          </button>
        </div>
      </div>

      {/* ================= TAB 1: STUDENT VERIFICATION STATUS (PDF PAGES 2 - 3) ================= */}
      {activeTab === 'verification' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-slate-200/90 dark:border-slate-800 p-5 space-y-4">
          {/* Card Header & Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            {/* Left: Title & Badge */}
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#1677FF] dark:text-blue-400">
                <UserCheck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                  Student Verification Status (Before Admission)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Manage and track application verification, track sheet status, and certificate submissions.
                </p>
              </div>
            </div>

            {/* Right Controls: Search, Filter Popover, Add (+) */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search Input */}
              <div className="relative flex items-center min-w-[200px] sm:min-w-[220px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={verificationSearch}
                  onChange={(e) => {
                    setVerificationSearch(e.target.value)
                    setVerificationPageIndex(0)
                  }}
                  placeholder="Search Student / Reg No / School"
                  className="h-9 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 pl-9 pr-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all"
                />
              </div>

              {/* Active filter chip if filters are applied */}
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="h-8 px-2.5 rounded-lg text-xs font-bold bg-blue-50 hover:bg-rose-50 text-blue-700 hover:text-rose-700 border border-blue-200 hover:border-rose-300 dark:bg-blue-950/60 dark:text-blue-300 dark:hover:bg-rose-950/60 dark:hover:text-rose-300 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs group"
                  title="Filters are applied. Click to remove all filters."
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600 group-hover:bg-rose-600"></span>
                  <span>{activeFilterCount} Filter{activeFilterCount > 1 ? 's' : ''}</span>
                  <X className="h-3 w-3 opacity-60 group-hover:opacity-100" />
                </button>
              )}

              {/* Filter Popover Button */}
              <Popover>
                <PopoverTrigger
                  render={
                    <button
                      type="button"
                      title="Filter & Export Options"
                      className={`relative h-9 w-9 flex items-center justify-center rounded-lg border transition-colors cursor-pointer ${
                        activeFilterCount > 0
                          ? 'border-blue-500 bg-blue-50 text-blue-600 ring-2 ring-blue-500/20 dark:bg-blue-950 dark:text-blue-400'
                          : isFilterPanelOpen
                          ? 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <SlidersHorizontal className="h-4 w-4" />
                      {activeFilterCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 h-4 min-w-4 px-1 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                          {activeFilterCount}
                        </span>
                      )}
                    </button>
                  }
                />
                <PopoverContent
                  align="end"
                  className="w-auto p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-2xl"
                >
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setIsFilterPanelOpen(true)}
                      title="Toggle Custom Filters"
                      className={`relative p-2 rounded-xl transition-all cursor-pointer ${
                        activeFilterCount > 0 || isFilterPanelOpen
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-bold'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <Filter className="h-4 w-4" />
                      {activeFilterCount > 0 && (
                        <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-blue-600"></span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleExportVerificationExcel}
                      title="Export to Excel"
                      className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
                    >
                      <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                    </button>

                    {/* 3. Download PDF */}
                    <button
                      type="button"
                      onClick={handleExportVerificationPdf}
                      title="Download PDF"
                      className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
                    >
                      <FileText className="h-4 w-4 text-rose-600" />
                    </button>

                    {/* Reset Filters if active */}
                    {activeFilterCount > 0 && (
                      <button
                        type="button"
                        onClick={handleClearFilters}
                        title="Reset All Filters"
                        className="p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950 text-rose-600 dark:text-rose-400 transition-all cursor-pointer border-l border-slate-200 dark:border-slate-800 ml-1 pl-2"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Square Add (+) button */}
              <button
                type="button"
                onClick={() => navigate(`/admission/add?from=student-master&tab=${activeTab}`)}
                className="h-9 px-3 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center cursor-pointer"
                style={{ background: "var(--app-gradient)" }}
                title="New Application"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Active Filter Badges */}
          {renderActiveFilterBadges()}

          {/* Table Container */}
          <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead
                  className="text-white font-semibold uppercase tracking-wider select-none"
                  style={{ background: "var(--table-header-bg, #13729d)" }}
                >
                  <tr>
                    <th className="py-3 px-3 text-center w-12 border-r border-white/20 select-none">S.No</th>
                    <th className="py-3 px-4 border-r border-white/20 select-none">Application No</th>
                    <th className="py-3 px-4 border-r border-white/20 select-none">Student Name</th>
                    <th className="py-3 px-4 border-r border-white/20 select-none">School Branch</th>
                    <th className="py-3 px-4 text-center border-r border-white/20 select-none">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 bg-rose-500 rounded-xs inline-block" />
                        Track Sheet Status
                      </span>
                    </th>
                    <th className="py-3 px-4 text-center border-r border-white/20 select-none">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 bg-purple-500 rounded-xs inline-block" />
                        Certificate Submission Status
                      </span>
                    </th>
                    <th className="py-3 px-4 text-center select-none">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredVerificationData.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <UserCheck className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                          <span className="font-semibold text-sm">
                            {isVerificationLoading
                              ? 'Loading verification records from database...'
                              : 'No student verification records found.'}
                          </span>
                          {!isVerificationLoading && (
                            <span className="text-xs text-slate-400">
                              Try adjusting your filters or search keywords.
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedVerificationData.map((item, idx) => {
                      const numId = Number(item.AppDeclaredID || item.ApplicantID) || idx + 1
                      const sNo = verificationPageIndex * verificationPageSize + idx + 1
                      const defaultTrack = item.TrackSheetStatus === 'Yes' || item.TrackSheetStatus === true
                      const defaultCert = item.CertificateSubmissionStatus === 'Yes' || item.CertificateSubmissionStatus === true
                      const currentTrack = verificationEdits[numId]?.track !== undefined ? verificationEdits[numId].track : defaultTrack
                      const currentCert = verificationEdits[numId]?.cert !== undefined ? verificationEdits[numId].cert : defaultCert

                      return (
                        <tr key={numId} className="hover:bg-blue-50/50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="py-3 px-3 text-center font-mono text-slate-400">{sNo}</td>
                          <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                            <button
                              type="button"
                              onClick={() => handleSelectFromItem(item)}
                              className="hover:underline cursor-pointer"
                            >
                              {item.ApplicationNo || `APP-${item.ApplicantID}`}
                            </button>
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">{item.StudentName || '-'}</td>
                          <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{item.School || '-'}</td>
                          <td className="py-3 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                setVerificationEdits((prev) => ({
                                  ...prev,
                                  [numId]: {
                                    track: !currentTrack,
                                    cert: currentCert,
                                  },
                                }))
                              }}
                              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                                currentTrack
                                  ? 'bg-rose-100 border-rose-400 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                                  : 'bg-slate-100 border-slate-300 text-slate-400 dark:bg-slate-800'
                              }`}
                              title="Click to toggle Track Sheet Status"
                            >
                              {currentTrack ? '✔ Submitted' : '✖ Pending'}
                            </button>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                setVerificationEdits((prev) => ({
                                  ...prev,
                                  [numId]: {
                                    track: currentTrack,
                                    cert: !currentCert,
                                  },
                                }))
                              }}
                              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                                currentCert
                                  ? 'bg-purple-100 border-purple-400 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                                  : 'bg-slate-100 border-slate-300 text-slate-400 dark:bg-slate-800'
                              }`}
                              title="Click to toggle Certificate Submission Status"
                            >
                              {currentCert ? '✔ Submitted' : '✖ Pending'}
                            </button>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleSelectFromItem(item)}
                                className="px-2.5 py-1 text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 rounded-md border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
                                title="View Applicant Details"
                              >
                                View
                              </button>
                              <button
                                type="button"
                                onClick={() => handleEditFromItem(item)}
                                className="px-2.5 py-1 text-[11px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300 rounded-md border border-blue-200 dark:border-blue-800 transition-colors cursor-pointer"
                                title="Edit Application"
                              >
                                Edit
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom Controls & Legend (PDF Page 3) */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-5 text-xs font-semibold text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 bg-rose-500 rounded-xs inline-block" />
                  <span>Track Sheet Status</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 bg-purple-500 rounded-xs inline-block" />
                  <span>Certificate Submission Status</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={handleUpdateVerification}
                  disabled={isUpdating}
                  style={{ background: "var(--app-gradient)" }}
                  className="px-6 py-2 text-white font-bold text-xs rounded-xl shadow-xs transition-opacity hover:opacity-90 cursor-pointer"
                >
                  {isUpdating ? 'Updating...' : 'UPDATE'}
                </button>
              </div>
            </div>
          </div>

          {/* Pagination Footer */}
          <Pagination
            table={verificationTablePagination}
            totalCount={filteredVerificationData.length}
            pageSizeOptions={[5, 10, 20, 50]}
          />
        </div>
      )}

      {/* ================= TAB 2: STUDENT CONFIRMATION STATUS (PDF PAGES 11 - 12) ================= */}
      {activeTab === 'confirmation' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-slate-200/90 dark:border-slate-800 p-5 space-y-4">
          {/* Card Header & Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            {/* Left: Title & Badge */}
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#1677FF] dark:text-blue-400">
                <UserCheck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                  Student Confirmation Status (Before Admission)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Manage student admission approval and confirmation status.
                </p>
              </div>
            </div>

            {/* Right Controls: Search, Filter Popover, Add (+) */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search Input */}
              <div className="relative flex items-center min-w-[200px] sm:min-w-[220px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={confirmationSearch}
                  onChange={(e) => {
                    setConfirmationSearch(e.target.value)
                    setConfirmationPageIndex(0)
                  }}
                  placeholder="Search Student / Reg No / School"
                  className="h-9 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 pl-9 pr-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all"
                />
              </div>

              {/* Active filter chip if filters are applied */}
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="h-8 px-2.5 rounded-lg text-xs font-bold bg-blue-50 hover:bg-rose-50 text-blue-700 hover:text-rose-700 border border-blue-200 hover:border-rose-300 dark:bg-blue-950/60 dark:text-blue-300 dark:hover:bg-rose-950/60 dark:hover:text-rose-300 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs group"
                  title="Filters are applied. Click to remove all filters."
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600 group-hover:bg-rose-600"></span>
                  <span>{activeFilterCount} Filter{activeFilterCount > 1 ? 's' : ''}</span>
                  <X className="h-3 w-3 opacity-60 group-hover:opacity-100" />
                </button>
              )}

              {/* Filter Popover Button */}
              <Popover>
                <PopoverTrigger
                  render={
                    <button
                      type="button"
                      title="Filter & Export Options"
                      className={`relative h-9 w-9 flex items-center justify-center rounded-lg border transition-colors cursor-pointer ${
                        activeFilterCount > 0
                          ? 'border-blue-500 bg-blue-50 text-blue-600 ring-2 ring-blue-500/20 dark:bg-blue-950 dark:text-blue-400'
                          : isFilterPanelOpen
                          ? 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <SlidersHorizontal className="h-4 w-4" />
                      {activeFilterCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 h-4 min-w-4 px-1 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                          {activeFilterCount}
                        </span>
                      )}
                    </button>
                  }
                />
                <PopoverContent
                  align="end"
                  className="w-auto p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-2xl"
                >
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setIsFilterPanelOpen(true)}
                      title="Toggle Custom Filters"
                      className={`relative p-2 rounded-xl transition-all cursor-pointer ${
                        activeFilterCount > 0 || isFilterPanelOpen
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-bold'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <Filter className="h-4 w-4" />
                      {activeFilterCount > 0 && (
                        <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-blue-600"></span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleExportConfirmationExcel}
                      title="Export to Excel"
                      className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
                    >
                      <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                    </button>

                    {/* 3. Download PDF */}
                    <button
                      type="button"
                      onClick={handleExportConfirmationPdf}
                      title="Download PDF"
                      className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
                    >
                      <FileText className="h-4 w-4 text-rose-600" />
                    </button>

                    {/* Reset Filters if active */}
                    {activeFilterCount > 0 && (
                      <button
                        type="button"
                        onClick={handleClearFilters}
                        title="Reset All Filters"
                        className="p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950 text-rose-600 dark:text-rose-400 transition-all cursor-pointer border-l border-slate-200 dark:border-slate-800 ml-1 pl-2"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Square Add (+) button */}
              <button
                type="button"
                onClick={() => navigate(`/admission/add?from=student-master&tab=${activeTab}`)}
                className="h-9 px-3 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center cursor-pointer"
                style={{ background: "var(--app-gradient)" }}
                title="New Application"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Active Filter Badges */}
          {renderActiveFilterBadges()}

          {/* Table Container */}
          <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead
                  className="text-white font-semibold uppercase tracking-wider select-none"
                  style={{ background: "var(--table-header-bg, #13729d)" }}
                >
                  <tr>
                    <th className="py-3 px-3 text-center w-12 border-r border-white/20 select-none">S.No</th>
                    <th className="py-3 px-4 border-r border-white/20 select-none">Application No</th>
                    <th className="py-3 px-4 border-r border-white/20 select-none">Student Name</th>
                    <th className="py-3 px-4 border-r border-white/20 select-none">School Branch</th>
                    <th className="py-3 px-4 text-center border-r border-white/20 select-none">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 bg-emerald-500 rounded-xs inline-block" />
                        Approve Status
                      </span>
                    </th>
                    <th className="py-3 px-4 text-center select-none">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredConfirmationData.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <UserCheck className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                          <span className="font-semibold text-sm">
                            {isConfirmationLoading
                              ? 'Loading confirmation records from database...'
                              : 'No student confirmation records found.'}
                          </span>
                          {!isConfirmationLoading && (
                            <span className="text-xs text-slate-400">
                              Try adjusting your filters or search keywords.
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedConfirmationData.map((item, idx) => {
                      const numId = Number(item.AppDeclaredID || item.ApplicantID) || idx + 1
                      const sNo = confirmationPageIndex * confirmationPageSize + idx + 1
                      const defaultApproved = item.ApprovalStatus === 'Yes' || item.ApprovalStatus === true || item.IsAdmissionApproved === 1
                      const isApproved = confirmationEdits[numId] !== undefined ? confirmationEdits[numId] : defaultApproved

                      return (
                        <tr key={numId} className="hover:bg-blue-50/50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="py-3 px-3 text-center font-mono text-slate-400">{sNo}</td>
                          <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                            <button
                              type="button"
                              onClick={() => handleSelectFromItem(item)}
                              className="hover:underline cursor-pointer"
                            >
                              {item.ApplicationNo || `APP-${item.ApplicantID}`}
                            </button>
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">{item.StudentName || '-'}</td>
                          <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{item.School || '-'}</td>
                          <td className="py-3 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                setConfirmationEdits((prev) => ({
                                  ...prev,
                                  [numId]: !isApproved,
                                }))
                              }}
                              className={`p-1.5 rounded-lg border font-bold transition-all cursor-pointer ${
                                isApproved
                                  ? 'bg-emerald-100 border-emerald-400 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                  : 'bg-rose-100 border-rose-300 text-rose-600 dark:bg-rose-950/40'
                              }`}
                              title="Click to toggle Approve Status"
                            >
                              {isApproved ? '✔ Approved' : '✖ Rejected'}
                            </button>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleSelectFromItem(item)}
                                className="px-2.5 py-1 text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 rounded-md border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
                                title="View Applicant Details"
                              >
                                View
                              </button>
                              <button
                                type="button"
                                onClick={() => handleEditFromItem(item)}
                                className="px-2.5 py-1 text-[11px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300 rounded-md border border-blue-200 dark:border-blue-800 transition-colors cursor-pointer"
                                title="Edit Application"
                              >
                                Edit
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom Controls & Legend (PDF Page 12) */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                <span className="w-3.5 h-3.5 bg-emerald-500 rounded-xs inline-block" />
                <span>Approve Status</span>
              </div>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={handleUpdateConfirmation}
                  disabled={isUpdating}
                  style={{ background: "var(--app-gradient)" }}
                  className="px-6 py-2 text-white font-bold text-xs rounded-xl shadow-xs transition-opacity hover:opacity-90 cursor-pointer"
                >
                  {isUpdating ? 'Updating...' : 'UPDATE'}
                </button>
              </div>
            </div>
          </div>

          {/* Pagination Footer */}
          <Pagination
            table={confirmationTablePagination}
            totalCount={filteredConfirmationData.length}
            pageSizeOptions={[5, 10, 20, 50]}
          />
        </div>
      )}

      {/* ================= TAB 3: ALL APPLICATIONS MASTER ================= */}
      {activeTab === 'master' && (
        <StudentDataTable
          key={tableKey}
          title="Student Applications Master List"
          subtitle="Manage registered pre-kg applicants. Click any Reg Number or ID to view complete applicant details."
          data={filteredStudents}
          onSelectId={handleSelectStudent}
          onView={handleSelectStudent}
          onEdit={handleEdit}
          onAddNew={() => {
            navigate(`/admission/add?from=student-master&tab=${activeTab}`)
          }}
          onDelete={(student) => setDeletingStudent(student)}
          onBulkUpdate={() => setIsBulkUpdateOpen(true)}
          onPrintTrackSheet={handlePrintTrackSheet}
          onPrintTrackSheet2={handlePrintTrackSheet2}
          onPrintRegistrationForm={handlePrintRegistrationForm}
          onPrintRegistrationForm5={handlePrintRegistrationForm5}
          showCheckmarkCols={true}
          onToggleFilterPanel={() => setIsFilterPanelOpen(true)}
          onExportExcel={() => {
            exportToExcel(filteredStudents, studentExportColumns, 'Student_Master_List', 'Students')
            toast.success('Exported Student Master List to Excel')
          }}
          onExportPdf={handleExportMasterPdf}
          onPrint={handleExportMasterPdf}
          activeFilterCount={activeFilterCount}
          onClearFilters={handleClearFilters}
          activeFilterBadges={renderActiveFilterBadges()}
        />
      )}

      {/* ================= CUSTOM SIDE DRAWER FILTER PANEL ================= */}
      <CustomPanel
        isOpen={isFilterPanelOpen}
        title="Student Custom Filter Panel"
        onClose={() => {
          setIsFilterPanelOpen(false)
          setShowFromSuggestions(false)
          setShowToSuggestions(false)
        }}
        onSave={handleApplyFilter}
        saveLabel="Apply Filters"
        width="480px"
      >
        <div className="space-y-4">
          <Field label="School Applied For">
            <SelectField
              value={schoolBranch}
              onChange={(val) => setSchoolBranch(val)}
              placeholder="-- Select --"
              options={SCHOOL_BRANCH_OPTIONS}
            />
          </Field>

          {/* Appln No Range From with Number Input & Live Suggestions */}
          <Field label="Appln No Range From">
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Enter from application number"
                value={applnFrom}
                onFocus={() => setShowFromSuggestions(true)}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '')
                  setApplnFrom(val)
                  setShowFromSuggestions(true)
                }}
                className="w-full h-9 px-3 text-[13px] font-mono rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
              {applnFrom && (
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => {
                    setApplnFrom('')
                    setShowFromSuggestions(false)
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xs cursor-pointer font-bold px-1"
                >
                  ✕
                </button>
              )}

              {/* Suggestions Dropdown */}
              {showFromSuggestions && fromSuggestions.length > 0 && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowFromSuggestions(false)}
                  />
                  <div className="absolute left-0 right-0 top-full mt-1 z-50 max-h-48 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg py-1 animate-in fade-in zoom-in-95">
                    <div className="px-2.5 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                      Suggestions
                    </div>
                    {fromSuggestions.map((num) => (
                      <button
                        key={num}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault()
                          setApplnFrom(num)
                          setShowFromSuggestions(false)
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs font-mono font-medium text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer flex items-center justify-between"
                      >
                        <span>{num}</span>
                        <span className="text-[10px] text-slate-400 font-sans">Click to select</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </Field>

          {/* Appln No Range To with Number Input & Live Suggestions */}
          <Field label="Appln No Range To">
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Enter to application number"
                value={applnTo}
                onFocus={() => setShowToSuggestions(true)}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '')
                  setApplnTo(val)
                  setShowToSuggestions(true)
                }}
                className="w-full h-9 px-3 text-[13px] font-mono rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
              {applnTo && (
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => {
                    setApplnTo('')
                    setShowToSuggestions(false)
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xs cursor-pointer font-bold px-1"
                >
                  ✕
                </button>
              )}

              {/* Suggestions Dropdown */}
              {showToSuggestions && toSuggestions.length > 0 && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowToSuggestions(false)}
                  />
                  <div className="absolute left-0 right-0 top-full mt-1 z-50 max-h-48 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg py-1 animate-in fade-in zoom-in-95">
                    <div className="px-2.5 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                      Suggestions
                    </div>
                    {toSuggestions.map((num) => (
                      <button
                        key={num}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault()
                          setApplnTo(num)
                          setShowToSuggestions(false)
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs font-mono font-medium text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer flex items-center justify-between"
                      >
                        <span>{num}</span>
                        <span className="text-[10px] text-slate-400 font-sans">Click to select</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </Field>

          <div className="pt-3 flex justify-between items-center border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={handleClear}
              className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </CustomPanel>

      {/* ================= DELETE CONFIRMATION MODAL ================= */}
      {deletingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 rounded-full bg-rose-100 dark:bg-rose-950">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Delete Registration Record?
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to delete registration <span className="font-mono font-bold text-rose-600">{deletingStudent.registrationNumber}</span> for <span className="font-bold text-slate-900 dark:text-white">{deletingStudent.studentName}</span>? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setDeletingStudent(null)}
                className="h-9 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="h-9 px-5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Trash2 className="h-4 w-4" /> Delete Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= PRINT PREVIEW MODAL (TRACK SHEET & REGISTRATION FORM) ================= */}
      <PrintPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        documentType={previewDocType}
        student={selectedStudentForPrint}
      />

      {/* ================= BULK UPDATE DRAWER PANEL ================= */}
      <BulkUpdateDrawer
        isOpen={isBulkUpdateOpen}
        onClose={() => setIsBulkUpdateOpen(false)}
        onInitiateUpdate={(payload) => setPendingBulkUpdate(payload)}
      />

      {/* ================= BULK UPDATE CONFIRMATION MODAL ================= */}
      <BulkUpdateConfirmModal
        isOpen={!!pendingBulkUpdate}
        onClose={() => setPendingBulkUpdate(null)}
        onConfirm={handleConfirmBulkUpdate}
        isSubmitting={isSubmittingBulkUpdate}
      />

      {/* ================= BULK UPDATE SUCCESS MODAL ================= */}
      <BulkUpdateSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => {
          setIsSuccessModalOpen(false)
          setTableKey((prev) => prev + 1)
        }}
      />
    </div>
  )
}

export default AdminStudents
