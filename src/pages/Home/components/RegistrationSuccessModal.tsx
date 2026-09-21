import React from 'react'
import { X, CheckCircle2, Printer, Eye } from 'lucide-react'

interface RegistrationSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  onPrintTrackSheet: () => void
  registrationNo?: string
  studentId?: string
  submissionDate?: string
  timings?: string
  onViewDetails?: (id: string) => void
  isAdminUser?: boolean
}

export const RegistrationSuccessModal: React.FC<RegistrationSuccessModalProps> = ({
  isOpen,
  onClose,
  onPrintTrackSheet,
  registrationNo = 'T25-0003',
  studentId,
  submissionDate = '14/09/2025',
  timings = '9:00 AM - 11:00 AM',
  onViewDetails,
  isAdminUser = false,
}) => {
  if (!isOpen) return null

  const handlePrintClick = () => {
    onPrintTrackSheet()
  }

  const handleGoToHome = () => {
    onClose()
    onPrintTrackSheet()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Modal Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-xs transition-opacity animate-in fade-in-0 duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-10 overflow-hidden text-slate-900 dark:text-slate-100 animate-in fade-in-0 zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Top Close Icon */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer z-20"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Top Success Icon */}
        <div className="flex flex-col items-center justify-center pt-6 pb-2 text-center px-6">
          <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs mb-2">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            Registration Submitted Successfully
          </h2>
        </div>

        <div className="p-6 sm:p-8 pt-4 space-y-5">
          {/* SECTION 1: Registration Details Header */}
          <div className="space-y-1 font-semibold text-sm sm:text-base leading-relaxed text-slate-800 dark:text-slate-200">
            <p className="flex flex-wrap items-center gap-2">
              <span>The Child's Registration Number is{' '}</span>
              <span className="font-bold text-blue-600 dark:text-blue-400 tracking-wide">
                {registrationNo}
              </span>
              {isAdminUser && studentId && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Application ID: #{studentId}
                </span>
              )}
            </p>
            <p>
              The Tracksheet Submission Date is{' '}
              <span className="font-bold text-blue-600 dark:text-blue-400">
                {submissionDate}
              </span>
            </p>
            <p>
              Timings{' '}
              <span className="font-bold text-blue-600 dark:text-blue-400">
                {timings}
              </span>
            </p>
          </div>

          {/* Dividing Line */}
          <div className="border-t border-slate-200 dark:border-slate-800" />

          {/* SECTION 2: Instructions & Documents List */}
          <div className="space-y-4 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 leading-normal pl-2 sm:pl-4">
            {/* Group 1: Documents to be submitted in person */}
            <div className="space-y-1.5">
              <div className="flex items-start gap-2 font-bold text-slate-900 dark:text-white">
                <span className="text-base leading-none select-none">•</span>
                <span>Documents to be submitted in person by the Parent/Guardian only :</span>
              </div>
              <ul className="space-y-1 pl-6">
                <li className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
                  <span className="text-xs select-none">◦</span>
                  <span>Track sheet signed by the parent with latest photo of the child duly affixed</span>
                </li>
                <li className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
                  <span className="text-xs select-none">◦</span>
                  <span>Birth Certificate of Child - COPY</span>
                </li>
                <li className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
                  <span className="text-xs select-none">◦</span>
                  <span>An authorization letter from the parent (if guardian)</span>
                </li>
              </ul>
            </div>

            {/* Group 2: Documents to be brought for verification */}
            <div className="space-y-1.5">
              <div className="flex items-start gap-2 font-bold text-slate-900 dark:text-white">
                <span className="text-base leading-none select-none">•</span>
                <span>Documents to be brought for verification:</span>
              </div>
              <ul className="space-y-1 pl-6">
                <li className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
                  <span className="text-xs select-none">◦</span>
                  <span>Birth Certificate of Child - ORIGINAL</span>
                </li>
                <li className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
                  <span className="text-xs select-none">◦</span>
                  <span>Proof of Address of both Parents - ORIGINAL</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Dividing Line */}
          <div className="border-t border-slate-200 dark:border-slate-800" />

          {/* SECTION 3: Action Link, Usual Clean Styling & Print Deadline Note */}
          <div className="space-y-2 text-center pt-1">
            {/* Click link to go to Home page to print Track Sheet */}
            <div>
              <button
                type="button"
                onClick={handleGoToHome}
                className="inline-block font-bold text-xs sm:text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline underline-offset-2 transition-colors cursor-pointer"
              >
                Click here to go to Home page to print "Track Sheet"
              </button>
            </div>

            {/* Usual Text Color - No Yellow Highlight */}
            <p className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200">
              Please ensure that you have taken the Track sheet print out
            </p>

            {/* Deadline Note */}
            <p className="font-bold text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              NOTE : "Print" option will not be available after midnight of 21/01/2025 (Tuesday).
            </p>
          </div>

          {/* Action Button Bar */}
          <div className="pt-2 flex items-center justify-center flex-wrap gap-3">
            {isAdminUser && studentId && onViewDetails && (
              <button
                type="button"
                onClick={() => {
                  onClose()
                  onViewDetails(studentId)
                }}
                className="h-9 px-4 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Eye className="h-3.5 w-3.5" />
                <span>View Application Details</span>
              </button>
            )}
            <button
              type="button"
              onClick={handlePrintClick}
              className="h-9 px-5 rounded-xl text-xs font-bold bg-[#1677FF] hover:bg-[#0958D9] dark:bg-blue-600 dark:hover:bg-blue-500 text-white shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Track Sheet</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
