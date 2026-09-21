import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import CustomPanel from '@/common/CustomPanel'
import { type StudentRecord } from '@/data/mockStudents'
import { useStudentStore } from '@/store/useStudentStore'
import {
  Trash2,
  AlertTriangle,
} from 'lucide-react'
import { toast } from '@/components/ui/toast'
import { AdminDataTable } from '@/components/AdminDataTable'
import { Field, SelectField } from '@/components/FormPrimitives'
import { PrintPreviewModal } from '@/components/print'

export const AdminStudents: React.FC = () => {
  const navigate = useNavigate()
  const { students, deleteStudent } = useStudentStore()

  // Filter panel state (Default to empty - no preselected values)
  const [academicYear, setAcademicYear] = useState('')
  const [schoolBranch, setSchoolBranch] = useState('')
  const [applnFrom, setApplnFrom] = useState('')
  const [applnTo, setApplnTo] = useState('')
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false)

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

  // Active filter state
  const [filters, setFilters] = useState({
    academicYear: '',
    schoolBranch: '',
    applnFrom: '',
    applnTo: '',
  })

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

  // Filtered Students
  const filteredStudents = useMemo(() => {
    const fromNum = filters.applnFrom ? Number(filters.applnFrom) : null
    const toNum = filters.applnTo ? Number(filters.applnTo) : null

    return students.filter((item) => {
      if (filters.academicYear && item.academicYear !== filters.academicYear) return false
      if (filters.schoolBranch && item.schoolBranch !== filters.schoolBranch) return false

      const studentApplnNum = getApplnNumericValue(item)
      if (!isNaN(studentApplnNum)) {
        if (fromNum !== null && !isNaN(fromNum) && studentApplnNum < fromNum) return false
        if (toNum !== null && !isNaN(toNum) && studentApplnNum > toNum) return false
      } else {
        // Fallback to string comparison if not purely numeric
        if (filters.applnFrom && item.registrationNumber < filters.applnFrom) return false
        if (filters.applnTo && item.registrationNumber > filters.applnTo) return false
      }

      return true
    })
  }, [students, filters])

  // Filter Handler
  const handleApplyFilter = () => {
    setFilters({
      academicYear,
      schoolBranch,
      applnFrom,
      applnTo,
    })
    setIsFilterPanelOpen(false)
    setShowFromSuggestions(false)
    setShowToSuggestions(false)
    toast.success('Filters applied successfully')
  }

  // Clear Filter
  const handleClear = () => {
    setAcademicYear('')
    setSchoolBranch('')
    setApplnFrom('')
    setApplnTo('')
    setShowFromSuggestions(false)
    setShowToSuggestions(false)
    setFilters({
      academicYear: '',
      schoolBranch: '',
      applnFrom: '',
      applnTo: '',
    })
    toast.info('Search filters reset')
  }

  // 1. Edit Action Handler (Navigates to /admission/:id?mode=edit)
  const handleEdit = (student: StudentRecord) => {
    navigate(`/admission/${student.id}?mode=edit`)
  }

  // 2. Select ID / View Action Handler (Navigates to /admission/:id?mode=view)
  const handleSelectStudent = (student: StudentRecord) => {
    navigate(`/admission/${student.id}?mode=view`)
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
  const [previewDocType, setPreviewDocType] = useState<'track-sheet' | 'registration-form'>('track-sheet')
  const [selectedStudentForPrint, setSelectedStudentForPrint] = useState<any | null>(null)

  const handlePrintTrackSheet = (student: StudentRecord) => {
    // Reusing the same admission data source: fetch complete record from store
    const fullRecord = useStudentStore.getState().getStudentById(student.id) || student
    setSelectedStudentForPrint(fullRecord)
    setPreviewDocType('track-sheet')
    setIsPreviewModalOpen(true)
  }

  const handlePrintRegistrationForm = (student: StudentRecord) => {
    // Reusing the same admission data source: fetch complete record from store
    const fullRecord = useStudentStore.getState().getStudentById(student.id) || student
    setSelectedStudentForPrint(fullRecord)
    setPreviewDocType('registration-form')
    setIsPreviewModalOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* DATA TABLE WITH INTEGRATED CUSTOM FILTER PANEL VIA POPOVER FILTER ICON */}
      <AdminDataTable
        title="Student Applications Master List"
        subtitle="Manage registered pre-kg applicants. Click any Reg Number or ID to view complete application details."
        data={filteredStudents}
        onSelectId={handleSelectStudent}
        onView={handleSelectStudent}
        onEdit={handleEdit}
        onAddNew={() => {
          navigate('/admission/add')
        }}
        onDelete={(student) => setDeletingStudent(student)}
        onPrintTrackSheet={handlePrintTrackSheet}
        onPrintRegistrationForm={handlePrintRegistrationForm}
        showCheckmarkCols={true}
        onToggleFilterPanel={() => setIsFilterPanelOpen(true)}
        onExportExcel={() => toast.success("Exported Student Master List to Excel")}
        onPrint={() => window.print()}
      />

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
          <Field label="Academic Year">
            <SelectField
              value={academicYear}
              onChange={(val) => setAcademicYear(val)}
              placeholder="-- Select --"
              options={["2025-26", "2024-25"]}
            />
          </Field>

          <Field label="School Applied For">
            <SelectField
              value={schoolBranch}
              onChange={(val) => setSchoolBranch(val)}
              placeholder="-- Select --"
              options={["T.Nagar-PSBB", "KK Nagar-PSBB", "Nungambakkam-PSBB"]}
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
    </div>
  )
}

export default AdminStudents
