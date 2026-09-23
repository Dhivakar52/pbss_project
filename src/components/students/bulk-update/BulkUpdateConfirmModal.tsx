import React from 'react'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

export interface BulkUpdateConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isSubmitting?: boolean
}

export const BulkUpdateConfirmModal: React.FC<BulkUpdateConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting = false,
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400">
          <div className="p-2.5 rounded-full bg-blue-100 dark:bg-blue-950">
            <AlertCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Confirm Update
          </h3>
        </div>

        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
          Are you sure you want to update the selected student records?
        </p>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="h-9 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="h-9 px-5 rounded-xl text-white text-xs font-bold flex items-center justify-center cursor-pointer shadow-sm disabled:opacity-50 transition-opacity"
            style={{ background: 'var(--app-gradient)' }}
          >
            {isSubmitting ? 'Updating...' : 'Update'}
          </button>
        </div>
      </div>
    </div>
  )
}
