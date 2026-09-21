import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import CustomPanel from '@/common/CustomPanel'
import { Field, SelectField, TextField } from '@/components/FormPrimitives'
import { AdminDataTable } from '@/components/AdminDataTable'
import { reportMockData } from '@/data/reportMockData'
import { reportConfig, type ReportConfigItem } from '@/data/reportConfig'
import {
  User,
  Briefcase,
  MapPin,
  Trash2,
  AlertTriangle,
  GraduationCap,
  Users
} from 'lucide-react'
import { toast } from '@/components/ui/toast'

export const AdminReports: React.FC = () => {
  const navigate = useNavigate()

  // 1. Single Source of Truth for Selected Report Type
  const [selectedReport, setSelectedReport] = useState<string>('master')

  // Search input state (controlled so it resets cleanly when switching reports)
  const [searchTerm, setSearchTerm] = useState<string>('')

  // Get current active report configuration and dataset
  const currentReport: ReportConfigItem = reportConfig[selectedReport] || reportConfig.master
  const baseData = useMemo(() => reportMockData[selectedReport] || [], [selectedReport])

  // 2. Dynamic Active Filter Values State: Record<filterKey, string>
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({})

  // Applied Filter State (triggered when user clicks 'Generate Report')
  const [appliedFilters, setAppliedFilters] = useState<Record<string, string>>({})

  // 3. Filter Panel side drawer open state
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false)

  // 4. View Details CustomPanel State & Delete Confirmation State
  const [viewingRecord, setViewingRecord] = useState<any | null>(null)
  const [deletingRecord, setDeletingRecord] = useState<any | null>(null)

  // 5. Local deleted record IDs tracking per report
  const [deletedIds, setDeletedIds] = useState<Record<string, string[]>>({})

  // Handle Report Type Change: resets search, filters and view states cleanly
  const handleReportChange = (newReportType: string) => {
    setSelectedReport(newReportType)
    setSearchTerm('')
    setActiveFilters({})
    setAppliedFilters({})
    setViewingRecord(null)
    setDeletingRecord(null)
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

  // Filter Handler (Generate Report)
  const handleApplyFilters = () => {
    setAppliedFilters({ ...activeFilters })
    setIsFilterPanelOpen(false)
    toast.success(`Applied filters for ${currentReport.label}`)
  }

  // Clear Handler
  const handleClearFilters = () => {
    setActiveFilters({})
    setAppliedFilters({})
    setSearchTerm('')
    toast.info('Report filters cleared')
  }

  // Filtered dataset based on applied dynamic filters and deleted IDs
  const reportData = useMemo(() => {
    const reportDeleted = deletedIds[selectedReport] || []

    return baseData.filter((item: any) => {
      // Exclude locally deleted records
      if (item.id && reportDeleted.includes(item.id)) return false

      // Check all active applied filters against item fields
      for (const [key, filterVal] of Object.entries(appliedFilters)) {
        if (!filterVal || filterVal.trim() === '') continue

        const itemVal = item[key]
        if (itemVal === undefined || itemVal === null) return false

        if (typeof itemVal === 'string') {
          if (itemVal.toLowerCase() !== filterVal.toLowerCase()) {
            return false
          }
        } else if (typeof itemVal === 'boolean') {
          const booleanStr = itemVal ? 'Yes' : 'No'
          if (booleanStr.toLowerCase() !== filterVal.toLowerCase()) {
            return false
          }
        } else if (String(itemVal) !== filterVal) {
          return false
        }
      }

      return true
    })
  }, [baseData, appliedFilters, deletedIds, selectedReport])

  // Export Handler
  const handleExportExcel = () => {
    toast.success(`Exported ${currentReport.label} to Excel successfully!`)
  }

  // Edit Action Handler
  const handleEdit = (record: any) => {
    const recId = record.id || record.application_number || record.APPLICATION_NUMBER || ''
    navigate(`/admission/${recId}?mode=edit`)
  }

  // Delete Action Handler
  const handleDeleteConfirm = () => {
    if (!deletingRecord) return
    const id = deletingRecord.id || deletingRecord.application_number || deletingRecord.APPLICATION_NUMBER
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
      {/* ================= DATA TABLE WITH SINGLE REPORT TYPE SELECTOR ================= */}
      <AdminDataTable
        key={selectedReport}
        title={currentReport.label}
        subtitle={currentReport.description}
        data={reportData}
        columns={currentReport.columns}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder={`Search in ${currentReport.label}...`}
        searchExtra={
          <div className="flex items-center gap-2 min-w-[240px] sm:min-w-[280px]">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
              Report Type:
            </span>
            <div className="flex-1">
              <SelectField
                value={selectedReport}
                onChange={handleReportChange}
                placeholder="-- Select Report --"
                options={[
                  { value: 'master', label: 'Master (KK Nagar and T Nagar)' },
                  { value: 'general', label: 'General' },
                  { value: 'alumni', label: 'Alumni Report' },
                  { value: 'alumniSibling', label: 'Alumni and Sibling Report' },
                  { value: 'sibling', label: 'Sibling Report' }
                ]}
                className="font-semibold bg-white dark:bg-slate-900 border-blue-300 dark:border-blue-700 shadow-xs text-xs"
              />
            </div>
          </div>
        }
        onSelectId={(rec) => setViewingRecord(rec)}
        onView={(rec) => setViewingRecord(rec)}
        onEdit={handleEdit}
        onDelete={(rec) => setDeletingRecord(rec)}
        showCheckmarkCols={false}
        onToggleFilterPanel={() => setIsFilterPanelOpen(true)}
        onExportExcel={handleExportExcel}
        onPrint={() => window.print()}
      />

      {/* ================= DYNAMIC SIDE DRAWER FILTER PANEL ================= */}
      <CustomPanel
        isOpen={isFilterPanelOpen}
        title={`${currentReport.label} - Filter Options`}
        onClose={() => setIsFilterPanelOpen(false)}
        onSave={handleApplyFilters}
        saveLabel="Generate Report"
        width="560px"
      >
        <div className="space-y-4">
          {/* Dynamically Generated Filter Fields (No duplicate Report Type selector) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {currentReport.filters.map((filter) => (
              <Field key={filter.key} label={filter.label}>
                {filter.type === 'select' && filter.options ? (
                  <SelectField
                    value={activeFilters[filter.key] || ''}
                    onChange={(val) => handleFilterValueChange(filter.key, val)}
                    placeholder={filter.placeholder || '-- Select --'}
                    options={filter.options}
                  />
                ) : (
                  <TextField
                    value={activeFilters[filter.key] || ''}
                    onChange={(val) => handleFilterValueChange(filter.key, val)}
                    placeholder={filter.placeholder || `Enter ${filter.label}`}
                  />
                )}
              </Field>
            ))}
          </div>

          {/* Drawer Footer Controls */}
          <div className="pt-3 flex justify-between items-center border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={handleClearFilters}
              className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
            >
              Reset All Filters
            </button>

            <button
              type="button"
              onClick={handleExportExcel}
              className="text-xs font-bold text-emerald-600 hover:underline cursor-pointer flex items-center gap-1"
            >
              Export to Excel
            </button>
          </div>
        </div>
      </CustomPanel>

      {/* ================= VIEW DETAILS DYNAMIC CUSTOM PANEL ================= */}
      <CustomPanel
        isOpen={!!viewingRecord}
        title={`Application Details - ${
          getRecordValue(viewingRecord, 'application_number', 'APPLICATION_NUMBER', 'registrationNumber')
        }`}
        onClose={() => setViewingRecord(null)}
        onSave={() => {
          if (viewingRecord) {
            handleEdit(viewingRecord)
          }
        }}
        saveLabel="Edit Application"
        width="620px"
      >
        {viewingRecord && (
          <div className="space-y-5">
            {/* Banner */}
            <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white p-4 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs text-blue-200 block font-semibold">Application Number</span>
                <span className="text-lg font-extrabold tracking-wide">
                  {getRecordValue(viewingRecord, 'application_number', 'APPLICATION_NUMBER', 'registrationNumber')}
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                {currentReport.label}
              </span>
            </div>

            {/* Child Information */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
                <User className="h-4 w-4 text-blue-600" /> Child Information
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 block text-[11px]">Full Name</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {getRecordValue(viewingRecord, 'student_name', 'STUDENT_NAME')}
                  </span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 block text-[11px]">Gender</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {getRecordValue(viewingRecord, 'gender', 'GENDER')}
                  </span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 block text-[11px]">Date of Birth</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {getRecordValue(viewingRecord, 'dob', 'DOB')}
                  </span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 block text-[11px]">Mother Tongue</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {getRecordValue(viewingRecord, 'student_language', 'STUDENT_LANGUAGE')}
                  </span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 block text-[11px]">Religion</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {getRecordValue(viewingRecord, 'religion', 'RELIGION')}
                  </span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 block text-[11px]">Caste & Sub Caste</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {getRecordValue(viewingRecord, 'caste_name', 'CASTE_NAME')} (
                    {getRecordValue(viewingRecord, 'sub_caste_name', 'SUB_CASTE_NAME')})
                  </span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 block text-[11px]">Playschool Going</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {getRecordValue(viewingRecord, 'playschool_going', 'PLAYSCHOOL_GOING')} -{' '}
                    {getRecordValue(viewingRecord, 'play_school_name', 'PLAY_SCHOOL_NAME')}
                  </span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 block text-[11px]">Date of Submission</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {getRecordValue(viewingRecord, 'date_of_submission', 'DATE_OF_SUBMISSION')}
                  </span>
                </div>
              </div>
            </div>

            {/* Sibling Information (if applicable) */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
                <Users className="h-4 w-4 text-emerald-600" /> Sibling Information
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 block text-[11px]">Sibling Enrolled</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {getRecordValue(viewingRecord, 'siblings_flag', 'SIBLINGS_FLAG')}
                  </span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 block text-[11px]">Sibling Name & Class</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {getRecordValue(viewingRecord, 'sibling_name', 'SIBLING_NAME')} (
                    {getRecordValue(viewingRecord, 'class_and_sec', 'CLASS_AND_SEC')})
                  </span>
                </div>
              </div>
            </div>

            {/* Alumni Information */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
                <GraduationCap className="h-4 w-4 text-indigo-600" /> Alumni Information
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 block text-[11px]">Father Alumni</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {getRecordValue(viewingRecord, 'father_alumni_flag', 'FATHER_ALUMNI_FLAG')} (
                    Batch: {getRecordValue(viewingRecord, 'father_passing_year', 'FATHER_PASSING_YEAR')})
                  </span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 block text-[11px]">Mother Alumni</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {getRecordValue(viewingRecord, 'mother_alumni_flag', 'MOTHER_ALUMNI_FLAG')} (
                    Batch: {getRecordValue(viewingRecord, 'mother_passing_year', 'MOTHER_PASSING_YEAR')})
                  </span>
                </div>
              </div>
            </div>

            {/* Parents & Contact */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
                <Briefcase className="h-4 w-4 text-purple-600" /> Parents & Contact
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 block text-[11px]">Father's Name & Mobile</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {getRecordValue(viewingRecord, 'father_name', 'FATHER_NAME')} (
                    {getRecordValue(viewingRecord, 'father_mobile_no', 'FATHER_MOBILE_NO')})
                  </span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 block text-[11px]">Mother's Name & Mobile</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {getRecordValue(viewingRecord, 'mother_name', 'MOTHER_NAME')} (
                    {getRecordValue(viewingRecord, 'mother_mobile_no', 'MOTHER_MOBILE_NO')})
                  </span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 block text-[11px]">Father Occupation & Company</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {getRecordValue(viewingRecord, 'father_designation', 'FATHER_DESIGNATION')}, {getRecordValue(viewingRecord, 'father_company_name', 'FATHER_COMPANY_NAME')}
                  </span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 block text-[11px]">Mother Occupation & Company</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {getRecordValue(viewingRecord, 'mother_designation', 'MOTHER_DESIGNATION')}, {getRecordValue(viewingRecord, 'mother_company_name', 'MOTHER_COMPANY_NAME')}
                  </span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 block text-[11px]">Father Income</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {getRecordValue(viewingRecord, 'father_monthly_income', 'FATHER_MONTHLY_INCOME')}
                  </span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 block text-[11px]">Email ID</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {getRecordValue(viewingRecord, 'email')}
                  </span>
                </div>
              </div>
            </div>

            {/* Residence */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
                <MapPin className="h-4 w-4 text-amber-600" /> Residence Details
              </h4>
              <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                <div>
                  <span className="text-slate-500 block text-[11px]">Address</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {getRecordValue(viewingRecord, 'address')}, Pincode: {getRecordValue(viewingRecord, 'pincode', 'PINCODE')}
                  </span>
                </div>
                <div className="flex gap-6">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Distance from School</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {getRecordValue(viewingRecord, 'distance_name', 'DISTANCE_NAME')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Commute Vehicle</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {getRecordValue(viewingRecord, 'vehicle_name', 'VEHICLE_NAME')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Landmark</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {getRecordValue(viewingRecord, 'landmark', 'LANDMARK')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
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
