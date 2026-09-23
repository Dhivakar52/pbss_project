import React from 'react'
import { CheckCircle2 } from 'lucide-react'

export interface BulkUpdateSuccessModalProps {
  isOpen: boolean
  onClose: () => void
}

export const BulkUpdateSuccessModal: React.FC<BulkUpdateSuccessModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 animate-in zoom-in-95 duration-200 text-center flex flex-col items-center">
        <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 mb-1">
          <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
        </div>

        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Update Successfully
        </h3>

        <div className="pt-2 w-full">
          <button
            type="button"
            onClick={onClose}
            className="w-full h-9 px-6 rounded-xl text-white text-xs font-bold flex items-center justify-center cursor-pointer shadow-sm transition-opacity hover:opacity-90"
            style={{ background: 'var(--app-gradient)' }}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  )
}
