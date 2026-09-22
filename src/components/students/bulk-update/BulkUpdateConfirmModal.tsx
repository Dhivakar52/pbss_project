import React from 'react'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

interface BulkUpdateConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  recordCount: number
  rangeString: string
  fieldLabel: string
  newValue: string
  isSubmitting?: boolean
}

export const BulkUpdateConfirmModal: React.FC<BulkUpdateConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  recordCount,
  rangeString,
  fieldLabel,
  newValue,
  isSubmitting = false,
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 animate-in fade-in zoom-in-95">
        <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400">
          <div className="p-2.5 rounded-full bg-blue-100 dark:bg-blue-950">
            <AlertCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Confirm Bulk Update
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Please review the details before proceeding.
            </p>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950/80 rounded-xl p-4 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
          <p className="font-semibold text-slate-700 dark:text-slate-300">
            You are about to update:
          </p>

          <div className="flex items-center justify-between py-1.5 border-b border-slate-200/60 dark:border-slate-800">
            <span className="text-slate-500">Selected Records:</span>
            <span className="font-bold text-blue-600 dark:text-blue-400 text-sm">
              {recordCount} {recordCount === 1 ? 'Student' : 'Students'}
            </span>
          </div>

          <div className="flex items-start justify-between py-1.5 border-b border-slate-200/60 dark:border-slate-800 gap-2">
            <span className="text-slate-500 shrink-0">Application Numbers:</span>
            <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-right break-all">
              {rangeString || '-'}
            </span>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-slate-200/60 dark:border-slate-800">
            <span className="text-slate-500">Field To Update:</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {fieldLabel}
            </span>
          </div>

          <div className="flex items-center justify-between py-1.5">
            <span className="text-slate-500">New Value:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-900">
              {newValue}
            </span>
          </div>
        </div>

        <p className="text-[12px] text-slate-500 dark:text-slate-400 leading-relaxed">
          Do you want to continue with this update?
        </p>

        <div className="flex justify-end gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="h-9 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="h-9 px-5 rounded-xl text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
            style={{ background: 'var(--app-gradient)' }}
          >
            <CheckCircle2 className="h-4 w-4" />
            {isSubmitting ? 'Updating...' : 'Confirm Update'}
          </button>
        </div>
      </div>
    </div>
  )
}
