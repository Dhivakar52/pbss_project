import React from 'react'
import { X, CheckCircle2, Printer, Eye } from 'lucide-react'

interface RegistrationSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  onPrintTrackSheet: () => void
  declarationContent?: unknown
  studentId?: string
  onViewDetails?: (id: string) => void
  isAdminUser?: boolean
}

interface DeclarationContentEntry {
  label?: string
  text: string
}

const formatContentLabel = (label: string) =>
  label
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const toPlainText = (value: string) =>
  value
    .replace(/''/g, "'")
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(?:p|div|li|h[1-6])\s*>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .trim()

const getDeclarationContentEntries = (content: unknown): DeclarationContentEntry[] => {
  if (typeof content === 'string') {
    try {
      return getDeclarationContentEntries(JSON.parse(content))
    } catch {
      const text = toPlainText(content)
      return text ? [{ text }] : []
    }
  }

  if (Array.isArray(content)) {
    return content.flatMap((item) => getDeclarationContentEntries(item))
  }

  if (content && typeof content === 'object') {
    return Object.entries(content as Record<string, unknown>).flatMap(([key, value]) => {
      if (/^(appdeclaredid|applicantid|id|totalrowcount)$/i.test(key) || value == null) return []

      if (/^(data|value|result|declarationcontent)$/i.test(key)) {
        return getDeclarationContentEntries(value)
      }

      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        const text = toPlainText(String(value))
        return text ? [{ label: formatContentLabel(key), text }] : []
      }

      return getDeclarationContentEntries(value).map((entry) => ({
        ...entry,
        label: entry.label ? `${formatContentLabel(key)} - ${entry.label}` : formatContentLabel(key),
      }))
    })
  }

  return []
}

export const RegistrationSuccessModal: React.FC<RegistrationSuccessModalProps> = ({
  isOpen,
  onClose,
  onPrintTrackSheet,
  declarationContent,
  studentId,
  onViewDetails,
  isAdminUser = false,
}) => {
  if (!isOpen) return null

  const declarationEntries = getDeclarationContentEntries(declarationContent)
  const declarationLines = declarationEntries.flatMap((entry) => entry.text.split(/\r?\n/).map((line) => line.trim()))
  const getDeclarationField = (prefix: RegExp) => {
    const line = declarationLines.find((value) => prefix.test(value))
    return line?.replace(prefix, '').replace(/[.]$/, '').trim() || ''
  }
  const declarationRegistrationNo = getDeclarationField(/^The Child['’]s Registration Number is\s*/i)
  const declarationSubmissionDate = getDeclarationField(/^The Tracksheet Submission Date is\s*/i)
  const declarationTimings = getDeclarationField(/^Timings\s*/i)
  const declarationActionText = declarationLines.find((line) => /^Click here to go to Home page to print\b/i.test(line))
  const declarationPrintReminder = declarationLines.find((line) => /^Please ensure that you have taken the Track sheet print out/i.test(line))
  const declarationDeadline = declarationLines.find((line) => /^(?:\*?\s*)?NOTE\s*:/i.test(line))
  const contentLines = declarationLines.filter((line) => line && !/^(?:The Child['’]s Registration Number is|The Tracksheet Submission Date is|Timings\b|Click here to go to Home page to print|Please ensure that you have taken the Track sheet print out|(?:\*?\s*)?NOTE\s*:)/i.test(line))

  const handlePrintClick = () => {
    onPrintTrackSheet()
  }

  const handleGoToHome = () => {
    onClose()
    onPrintTrackSheet()
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Modal Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-xs transition-opacity animate-in fade-in-0 duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="min-h-full flex items-center justify-center p-3 sm:p-4 text-center">
        {/* Modal Container */}
        <div
          className="relative w-full max-w-2xl my-auto text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-10 overflow-hidden text-slate-900 dark:text-slate-100 animate-in fade-in-0 zoom-in-95 duration-200"
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
            {declarationRegistrationNo && (
              <p>
                The Child's Registration Number is{' '}
                <span className="font-bold text-blue-600 dark:text-blue-400 tracking-wide">{declarationRegistrationNo}</span>
              </p>
            )}
            {declarationSubmissionDate && (
              <p>
                The Tracksheet Submission Date is{' '}
                <span className="font-bold text-blue-600 dark:text-blue-400">{declarationSubmissionDate}</span>
              </p>
            )}
            {declarationTimings && (
              <p>
                Timings{' '}
                <span className="font-bold text-blue-600 dark:text-blue-400">{declarationTimings}</span>
              </p>
            )}
            {isAdminUser && studentId && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Application ID: #{studentId}
              </span>
            )}
          </div>

          {/* Dividing Line */}
          <div className="border-t border-slate-200 dark:border-slate-800" />

          {/* SECTION 2: Declaration content from App.ProcFetchDeclarationContent */}
          <div className="space-y-3 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 leading-normal pl-2 sm:pl-4">
            {contentLines.length > 0 ? contentLines.map((line, index) => {
              const isSectionHeading = /^Documents to be (?:submitted|brought)\b/i.test(line)
              return isSectionHeading ? (
                <p key={index} className="font-bold text-slate-900 dark:text-white">{line}</p>
              ) : (
                <ul key={index} className="list-disc pl-6 text-slate-600 dark:text-slate-300">
                  <li>{line}</li>
                </ul>
              )
            }) : (
              <p role="status" className="text-center text-amber-700 dark:text-amber-300">
                Declaration details could not be loaded. Please try again or contact the school.
              </p>
            )}
          </div>

          {/* Dividing Line */}
          <div className="border-t border-slate-200 dark:border-slate-800" />

          {/* SECTION 3: Action Link, Usual Clean Styling & Print Deadline Note */}
          <div className="space-y-2 text-center pt-1">
            {/* Click link to go to Home page to Print Track Sheet */}
            {declarationActionText && <div>
              <button
                type="button"
                onClick={handleGoToHome}
                className="inline-block font-bold text-xs sm:text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline underline-offset-2 transition-colors cursor-pointer"
              >
                {declarationActionText.replace(/''/g, "'")}
              </button>
            </div>}

            {declarationPrintReminder && (
              <p className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                {declarationPrintReminder}
              </p>
            )}

            {declarationDeadline && (
              <p className="font-bold text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                {declarationDeadline}
              </p>
            )}
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
                <span>View Applicant Details</span>
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
    </div>
  )
}
