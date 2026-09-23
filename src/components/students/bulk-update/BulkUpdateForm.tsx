import React from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { FieldLabel } from '@/components/FormPrimitives'
import { FileCheck, FileText } from 'lucide-react'

export interface BulkUpdateFormProps {
  trackSheetChecked: boolean
  onTrackSheetChange: (checked: boolean) => void
  registrationFormChecked: boolean
  onRegistrationFormChange: (checked: boolean) => void
  disabled?: boolean
}

export const BulkUpdateForm: React.FC<BulkUpdateFormProps> = ({
  trackSheetChecked,
  onTrackSheetChange,
  registrationFormChecked,
  onRegistrationFormChange,
  disabled = false,
}) => {
  return (
    <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
      <div>
        <FieldLabel>Document Statuses to Apply</FieldLabel>
        <p className="text-[11.5px] text-slate-500 dark:text-slate-400 mb-2.5">
          Select or unselect options to set their boolean values (<span className="font-semibold text-emerald-600 dark:text-emerald-400">Checked = true</span>, <span className="font-semibold text-slate-500">Unchecked = false</span>) for the selected students.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* TrackSheet Checkbox */}
          <label
            htmlFor="bulk-update-tracksheet"
            className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all cursor-pointer select-none ${trackSheetChecked
              ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-400 dark:border-blue-700 shadow-xs'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              } ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
          >
            <Checkbox
              id="bulk-update-tracksheet"
              checked={trackSheetChecked}
              onCheckedChange={(val) => onTrackSheetChange(!!val)}
              disabled={disabled}
              className="data-checked:border-transparent data-checked:text-white"
              style={{ background: trackSheetChecked ? 'var(--app-gradient)' : undefined }}
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <FileCheck className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  TrackSheet
                </span>
              </div>
              {/* <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {trackSheetChecked ? 'Will set trackSheet = true' : 'Will set trackSheet = false'}
              </span> */}
            </div>
          </label>

          {/* Registration Form Checkbox */}
          <label
            htmlFor="bulk-update-registration-form"
            className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all cursor-pointer select-none ${registrationFormChecked
              ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-400 dark:border-blue-700 shadow-xs'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              } ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
          >
            <Checkbox
              id="bulk-update-registration-form"
              checked={registrationFormChecked}
              onCheckedChange={(val) => onRegistrationFormChange(!!val)}
              disabled={disabled}
              className="data-checked:border-transparent data-checked:text-white"
              style={{ background: registrationFormChecked ? 'var(--app-gradient)' : undefined }}
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Registration Form
                </span>
              </div>
              {/* <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {registrationFormChecked ? 'Will set registrationForm = true' : 'Will set registrationForm = false'}
              </span> */}
            </div>
          </label>
        </div>
      </div>
    </div>
  )
}
