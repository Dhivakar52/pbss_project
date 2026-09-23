import React, { useState, useEffect } from 'react'
import CustomPanel from '@/common/CustomPanel'
import { parseApplicationRanges, type ParseRangeResult } from '@/utils/parseApplicationRanges'
import { StudentService } from '@/services/student.service'
import { useStudentStore } from '@/store/useStudentStore'
import { type StudentRecord } from '@/data/mockStudents'
import { BulkUpdatePreviewTable } from './BulkUpdatePreviewTable'
import { BulkUpdateForm } from './BulkUpdateForm'
import { Field } from '@/components/FormPrimitives'
import { toast } from '@/components/ui/toast'
import { Layers, Search } from 'lucide-react'

export interface PendingBulkUpdatePayload {
  applnNumbers: number[]
  trackSheet: boolean
  registrationForm: boolean
}

interface BulkUpdateDrawerProps {
  isOpen: boolean
  onClose: () => void
  onInitiateUpdate?: (payload: PendingBulkUpdatePayload) => void
  initialApplnInput?: string
}

export const BulkUpdateDrawer: React.FC<BulkUpdateDrawerProps> = ({
  isOpen,
  onClose,
  onInitiateUpdate,
  initialApplnInput = '',
}) => {
  const { students } = useStudentStore()

  // Form states
  const [rangeInput, setRangeInput] = useState(initialApplnInput)
  const [parseResult, setParseResult] = useState<ParseRangeResult | null>(null)
  const [previewRecords, setPreviewRecords] = useState<StudentRecord[]>([])
  const [hasPreviewed, setHasPreviewed] = useState(false)

  // Document checkboxes state
  // TrackSheet -> trackSheet: boolean
  // Registration Form -> registrationForm: boolean
  const [trackSheetChecked, setTrackSheetChecked] = useState(false)
  const [registrationFormChecked, setRegistrationFormChecked] = useState(false)

  // Reset form states
  const resetFormState = () => {
    setRangeInput('')
    setParseResult(null)
    setPreviewRecords([])
    setHasPreviewed(false)
    setTrackSheetChecked(false)
    setRegistrationFormChecked(false)
  }

  // Sync initialApplnInput when drawer opens
  useEffect(() => {
    if (isOpen) {
      const inputToUse = initialApplnInput.trim()
      setRangeInput(inputToUse)
      setTrackSheetChecked(false)
      setRegistrationFormChecked(false)
      setHasPreviewed(false)
      setParseResult(null)
      setPreviewRecords([])

      // Automatically preview if initialApplnInput was passed in
      if (inputToUse) {
        handlePreview(inputToUse)
      }
    }
  }, [isOpen, initialApplnInput])

  // Handle preview calculation
  const handlePreview = (inputToParse: string = rangeInput) => {
    const result = parseApplicationRanges(inputToParse)
    setParseResult(result)

    if (!result.isValid) {
      setPreviewRecords([])
      setHasPreviewed(true)
      return
    }

    // Lookup matching students in store
    const matched = StudentService.findMatchingStudents(result.numbers, students)
    setPreviewRecords(matched)
    setHasPreviewed(true)
  }

  // When user clicks Update on the Bulk Update panel:
  // 1. Immediately close the Bulk Update panel/drawer.
  // 2. Open confirmation modal in parent.
  const handleInitiateUpdate = () => {
    if (!rangeInput.trim()) {
      toast.error('Please enter application numbers before updating.')
      return
    }

    if (!hasPreviewed || !parseResult?.isValid) {
      handlePreview()
    }

    const currentResult = parseResult?.isValid ? parseResult : parseApplicationRanges(rangeInput)
    if (!currentResult.isValid) {
      toast.error(currentResult.error || 'Please fix invalid application numbers.')
      return
    }

    const matched = StudentService.findMatchingStudents(currentResult.numbers, students)
    if (matched.length === 0) {
      toast.error('No matching student records found to update.')
      return
    }

    const payload: PendingBulkUpdatePayload = {
      applnNumbers: currentResult.numbers,
      trackSheet: trackSheetChecked,
      registrationForm: registrationFormChecked,
    }

    // Clear form state before closing
    resetFormState()

    // 1. Immediately close the Bulk Update panel/drawer
    onClose()

    // 2. Open confirmation modal in parent
    onInitiateUpdate?.(payload)
  }

  return (
    <CustomPanel
      isOpen={isOpen}
      title="Bulk Update Student Records"
      onClose={onClose}
      onSave={handleInitiateUpdate}
      saveLabel="Update"
      width="580px"
    >
      <div className="space-y-6">
        {/* Information Notice */}
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 text-blue-800 dark:text-blue-300 text-xs">
          <Layers className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Administrator Bulk Action</p>
            <p className="text-[11.5px] text-blue-700 dark:text-blue-400 mt-0.5 leading-normal">
              Update multiple student applications in a single operation. Enter application numbers and choose the document statuses to set.
            </p>
          </div>
        </div>

        {/* Application Numbers Range Input */}
        <div className="space-y-3">
          <Field label="Application Numbers / Ranges" required error={hasPreviewed && !parseResult?.isValid} errorText={parseResult?.error}>
            <div className="space-y-2">
              <textarea
                rows={3}
                value={rangeInput}
                onChange={(e) => {
                  setRangeInput(e.target.value)
                  setHasPreviewed(false)
                }}
                placeholder="Enter numbers or ranges e.g. 100-110,113-150,155,160"
                className="w-full p-3 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
              />

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handlePreview()}
                  className="h-8 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Search className="h-3.5 w-3.5" />
                  Preview Records
                </button>
              </div>
            </div>
          </Field>
        </div>

        {/* Read-Only Preview Table */}
        {hasPreviewed && (
          <div className="animate-in fade-in duration-200">
            <BulkUpdatePreviewTable records={previewRecords} />
          </div>
        )}

        {/* Document Status Checkbox Options */}
        <BulkUpdateForm
          trackSheetChecked={trackSheetChecked}
          onTrackSheetChange={setTrackSheetChecked}
          registrationFormChecked={registrationFormChecked}
          onRegistrationFormChange={setRegistrationFormChecked}
          disabled={previewRecords.length === 0}
        />
      </div>
    </CustomPanel>
  )
}
