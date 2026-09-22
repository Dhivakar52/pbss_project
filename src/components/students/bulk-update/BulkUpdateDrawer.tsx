import React, { useState, useEffect } from 'react'
import CustomPanel from '@/common/CustomPanel'
import { parseApplicationRanges, type ParseRangeResult } from '@/utils/parseApplicationRanges'
import { StudentService } from '@/services/student.service'
import { useStudentStore } from '@/store/useStudentStore'
import { type StudentRecord } from '@/data/mockStudents'
import { BulkUpdatePreviewTable } from './BulkUpdatePreviewTable'
import { BulkUpdateForm, BULK_UPDATE_FIELDS } from './BulkUpdateForm'
import { BulkUpdateConfirmModal } from './BulkUpdateConfirmModal'
import { Field } from '@/components/FormPrimitives'
import { toast } from '@/components/ui/toast'
import { Layers, Search } from 'lucide-react'

interface BulkUpdateDrawerProps {
  isOpen: boolean
  onClose: () => void
  initialApplnInput?: string
}

export const BulkUpdateDrawer: React.FC<BulkUpdateDrawerProps> = ({
  isOpen,
  onClose,
  initialApplnInput = '',
}) => {
  const { students, bulkUpdateStudents } = useStudentStore()

  // Form states
  const [rangeInput, setRangeInput] = useState(initialApplnInput)
  const [parseResult, setParseResult] = useState<ParseRangeResult | null>(null)
  const [previewRecords, setPreviewRecords] = useState<StudentRecord[]>([])
  const [hasPreviewed, setHasPreviewed] = useState(false)

  const [selectedFieldKey, setSelectedFieldKey] = useState('')
  const [selectedValue, setSelectedValue] = useState('')

  // Confirmation modal state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Sync initialApplnInput when drawer opens
  useEffect(() => {
    if (isOpen) {
      const inputToUse = initialApplnInput.trim()
      setRangeInput(inputToUse)
      setSelectedFieldKey('')
      setSelectedValue('')
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

  // Submit flow
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

    if (previewRecords.length === 0) {
      toast.error('No matching student records found to update.')
      return
    }

    if (!selectedFieldKey) {
      toast.error('Please select a field to update.')
      return
    }

    if (!selectedValue) {
      toast.error('Please select a new value for the field.')
      return
    }

    setIsConfirmOpen(true)
  }

  // Execute bulk update
  const handleConfirmUpdate = () => {
    if (!parseResult?.numbers || parseResult.numbers.length === 0) return

    setIsSubmitting(true)

    try {
      // Find actual target value type (e.g., boolean for status1, string for status)
      const fieldConfig = BULK_UPDATE_FIELDS.find((f) => f.key === selectedFieldKey)
      const rawOpt = fieldConfig?.options.find((o) => String(o.value) === selectedValue)
      const parsedValue = rawOpt ? rawOpt.value : selectedValue

      const count = bulkUpdateStudents(parseResult.numbers, selectedFieldKey, parsedValue)

      if (count > 0) {
        toast.success(`${count} student records updated successfully.`)
        setIsConfirmOpen(false)
        onClose()
      } else {
        toast.error('No matching records were updated. Please try again.')
      }
    } catch (err) {
      toast.error('Unable to update records. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedFieldConfig = BULK_UPDATE_FIELDS.find((f) => f.key === selectedFieldKey)
  const selectedValueLabel =
    selectedFieldConfig?.options.find((o) => String(o.value) === selectedValue)?.label || selectedValue

  return (
    <>
      <CustomPanel
        isOpen={isOpen}
        title="Bulk Update Student Records"
        onClose={onClose}
        onSave={handleInitiateUpdate}
        saveLabel="Update All"
        width="580px"
      >
        <div className="space-y-6">
          {/* Information Notice */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 text-blue-800 dark:text-blue-300 text-xs">
            <Layers className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Administrator Bulk Action</p>
              <p className="text-[11.5px] text-blue-700 dark:text-blue-400 mt-0.5 leading-normal">
                Update multiple student applications in a single operation. Enter application numbers.
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
                  {/* <span className="text-[11px] text-slate-400">
                    Supports formats: <span className="font-mono">100</span>, <span className="font-mono">100-110</span>, <span className="font-mono">100-110,113-150</span>
                  </span> */}

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

          {/* Bulk Update Field & New Value Selectors */}
          <BulkUpdateForm
            selectedFieldKey={selectedFieldKey}
            onFieldKeyChange={setSelectedFieldKey}
            selectedValue={selectedValue}
            onValueChange={setSelectedValue}
            disabled={previewRecords.length === 0}
          />
        </div>
      </CustomPanel>

      {/* Confirmation Modal */}
      <BulkUpdateConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmUpdate}
        recordCount={previewRecords.length}
        rangeString={rangeInput}
        fieldLabel={selectedFieldConfig?.label || selectedFieldKey}
        newValue={selectedValueLabel}
        isSubmitting={isSubmitting}
      />
    </>
  )
}
