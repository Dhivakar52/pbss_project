import React from 'react'
import {
  Printer,
  FileText,
  ChevronRight,
  CheckCircle2,
  RotateCcw,
  Eye,
  ArrowLeft,
  Lock,
  Check,
} from 'lucide-react'
import type { Step } from '../types'
import { useNavigate } from 'react-router-dom'

export interface RegistrationOverviewProps {
  steps: Step[]
  completedCount?: number
  isRegistrationComplete: boolean
  activeStepId?: number
  completedStepIds?: number[]
  isFromAdmin?: boolean
  isAdminUser?: boolean
  isReadOnly?: boolean
  onStepClick: (stepId: number) => void
  onCompleteAll: () => void
  onReset: () => void
  onPrintTrackSheet: () => void
  onPrintRegistrationForm: () => void
  onOpenSuccessModal?: () => void
  onViewApplicationDetails?: () => void
  onOpenInstruction?: () => void
  applicationNo?: string
  studentName?: string
  upperNotice?: string
  lowerNotice?: string
  onBackToAdmin?: () => void
  backAdminLabel?: string
}

export const RegistrationOverview: React.FC<RegistrationOverviewProps> = ({
  steps,
  completedCount: _completedCount,
  isRegistrationComplete,
  activeStepId: _activeStepId,
  completedStepIds = [],
  isFromAdmin: _isFromAdmin = false,
  isAdminUser = false,
  isReadOnly = false,
  onStepClick,
  onCompleteAll,
  onReset,
  onPrintTrackSheet,
  onPrintRegistrationForm,
  onOpenSuccessModal,
  onViewApplicationDetails: _onViewApplicationDetails,
  onOpenInstruction,
  applicationNo,
  studentName,
  upperNotice,
  lowerNotice,
  onBackToAdmin,
  backAdminLabel,
}) => {
  const navigate = useNavigate()

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Admin / Utility Bar - only shown for existing applications */}
      {Boolean(applicationNo) && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-slate-50 to-blue-50/50 dark:from-slate-900 dark:to-blue-950/40 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center gap-2.5 flex-wrap">
            {isAdminUser && (
              <button
                type="button"
                onClick={onBackToAdmin || (() => navigate('/admin/students'))}
                className="h-8 px-2.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>{backAdminLabel || "Student Master"}</span>
              </button>
            )}
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Pre-KG (2027-28) Registration
            </span>
            {applicationNo && (
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                {applicationNo}
              </span>
            )}
            {studentName && (
              <span className="text-xs text-slate-600 dark:text-slate-400 font-medium hidden sm:inline">
                • {studentName}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {isRegistrationComplete && onOpenSuccessModal && (
              <button
                type="button"
                onClick={onOpenSuccessModal}
                className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/80 hover:bg-emerald-200/80 dark:hover:bg-emerald-900/80 px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 border border-emerald-300/60 dark:border-emerald-800"
              >
                <Eye className="h-3.5 w-3.5" /> Submission Details
              </button>
            )}
            {isAdminUser && (
              <>
                <button
                  type="button"
                  onClick={onCompleteAll}
                  className="text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-100/70 dark:bg-blue-950/70 hover:bg-blue-100 dark:hover:bg-blue-900 px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 border border-blue-200/60 dark:border-blue-800/60"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> Complete All
                </button>
                <button
                  type="button"
                  onClick={onReset}
                  className="text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-200/70 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 border border-slate-300/50 dark:border-slate-700"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Reset
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Main Form Portal Card matching PDF Pages 3 & 18 */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Subheader Banner (PDF Pages 3 & 18) */}
        <div className="bg-slate-100 dark:bg-slate-800/80 px-6 py-3 border-b border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-slate-700 dark:text-slate-200">
          <div className="text-slate-900 dark:text-white font-extrabold text-sm tracking-tight">
            Please fill up the following
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            {isAdminUser ? (
              <button
                type="button"
                onClick={() => navigate('/admin/students')}
                className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                Admin Home
              </button>
            ) : (
              <span className="text-blue-600 dark:text-blue-400">Home</span>
            )}
            <span className="text-slate-400 dark:text-slate-500">•</span>
            <span className="text-slate-800 dark:text-slate-200 font-bold">
              Pre-KG (2027-28) Registration Form
            </span>
          </div>
        </div>

        {/* Yellow Notice Banner 1 (Top) */}
        <div className="bg-[#FFF8E7] dark:bg-amber-950/40 border-b border-[#FFE8B3] dark:border-amber-900/50 px-6 py-2.5 text-center">
          <p className="text-xs sm:text-sm font-bold text-[#D46B08] dark:text-amber-400">
            {upperNotice || '*Track sheet print option will not be available after midnight of specified date.'}
          </p>
        </div>

        {/* 7 Registration Steps List (PDF Pages 3 & 18) */}
        <div className="p-6 sm:p-8 space-y-3.5 bg-slate-50/40 dark:bg-slate-900/60">
          {/* 1. Applicant Details */}
          {(() => {
            const isStep1Done = completedStepIds.includes(1) || steps[0]?.status === 'COMPLETED'
            return (
              <div
                onClick={() => onStepClick(1)}
                className="group flex items-center justify-between px-5 py-3.5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-800 hover:bg-blue-50/60 dark:hover:bg-slate-800/90 hover:border-blue-300 dark:hover:border-blue-700 transition-all cursor-pointer shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      isStep1Done ? 'bg-emerald-500 text-white' : 'border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {isStep1Done ? <Check className="h-3.5 w-3.5" /> : '1'}
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    1. Applicant Details
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-extrabold tracking-wide uppercase ${
                      isStep1Done ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    ({isStep1Done ? 'DONE' : 'PENDING'})
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            )
          })()}

          {/* 2. Parent Details */}
          {(() => {
            const isStep2Done = completedStepIds.includes(2)
            const isStep2Locked = !isReadOnly && !isRegistrationComplete && !isStep2Done && !completedStepIds.includes(1)
            return (
              <div
                onClick={() => !isStep2Locked && onStepClick(2)}
                className={`group flex items-center justify-between px-5 py-3.5 rounded-xl border transition-all shadow-2xs ${
                  isStep2Locked
                    ? 'border-slate-200/60 dark:border-slate-800/60 bg-slate-100/50 dark:bg-slate-900/40 opacity-60 cursor-not-allowed select-none'
                    : 'border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-800 hover:bg-blue-50/60 dark:hover:bg-slate-800/90 hover:border-blue-300 dark:hover:border-blue-700 cursor-pointer'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      isStep2Done
                        ? 'bg-emerald-500 text-white'
                        : isStep2Locked
                        ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 border border-slate-300 dark:border-slate-700'
                        : 'border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {isStep2Done ? <Check className="h-3.5 w-3.5" /> : '2'}
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    2. Parent Details
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-extrabold tracking-wide uppercase flex items-center gap-1 ${
                      isStep2Done ? 'text-emerald-600 dark:text-emerald-400' : isStep2Locked ? 'text-slate-400 dark:text-slate-500' : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    ({isStep2Done ? 'DONE' : isStep2Locked ? 'LOCKED' : 'PENDING'})
                  </span>
                  {isStep2Locked ? (
                    <Lock className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                  )}
                </div>
              </div>
            )
          })()}

          {/* 3. Guardian Details (If Applicable) */}
          {(() => {
            const isStep3Done = completedStepIds.includes(3)
            const isStep3Locked = !isReadOnly && !isRegistrationComplete && !isStep3Done && !completedStepIds.includes(2)
            return (
              <div
                onClick={() => !isStep3Locked && onStepClick(3)}
                className={`group flex items-center justify-between px-5 py-3.5 rounded-xl border transition-all shadow-2xs ${
                  isStep3Locked
                    ? 'border-slate-200/60 dark:border-slate-800/60 bg-slate-100/50 dark:bg-slate-900/40 opacity-60 cursor-not-allowed select-none'
                    : 'border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-800 hover:bg-blue-50/60 dark:hover:bg-slate-800/90 hover:border-blue-300 dark:hover:border-blue-700 cursor-pointer'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      isStep3Done
                        ? 'bg-emerald-500 text-white'
                        : isStep3Locked
                        ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 border border-slate-300 dark:border-slate-700'
                        : 'border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {isStep3Done ? <Check className="h-3.5 w-3.5" /> : '3'}
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    3. Guardian Details
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-extrabold tracking-wide uppercase flex items-center gap-1 ${
                      isStep3Done ? 'text-emerald-600 dark:text-emerald-400' : isStep3Locked ? 'text-slate-400 dark:text-slate-500' : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    ({isStep3Done ? 'DONE' : isStep3Locked ? 'LOCKED' : 'PENDING'})
                  </span>
                  {isStep3Locked ? (
                    <Lock className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                  )}
                </div>
              </div>
            )
          })()}

          {/* 4. Communication and Other Details */}
          {(() => {
            const isStep4Done = completedStepIds.includes(4)
            const isStep4Locked = !isReadOnly && !isRegistrationComplete && !isStep4Done && !completedStepIds.includes(3) && !completedStepIds.includes(2)
            return (
              <div
                onClick={() => !isStep4Locked && onStepClick(4)}
                className={`group flex items-center justify-between px-5 py-3.5 rounded-xl border transition-all shadow-2xs ${
                  isStep4Locked
                    ? 'border-slate-200/60 dark:border-slate-800/60 bg-slate-100/50 dark:bg-slate-900/40 opacity-60 cursor-not-allowed select-none'
                    : 'border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-800 hover:bg-blue-50/60 dark:hover:bg-slate-800/90 hover:border-blue-300 dark:hover:border-blue-700 cursor-pointer'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      isStep4Done
                        ? 'bg-emerald-500 text-white'
                        : isStep4Locked
                        ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 border border-slate-300 dark:border-slate-700'
                        : 'border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {isStep4Done ? <Check className="h-3.5 w-3.5" /> : '4'}
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    4. Communication and Other Details
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-extrabold tracking-wide uppercase flex items-center gap-1 ${
                      isStep4Done ? 'text-emerald-600 dark:text-emerald-400' : isStep4Locked ? 'text-slate-400 dark:text-slate-500' : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    ({isStep4Done ? 'DONE' : isStep4Locked ? 'LOCKED' : 'PENDING'})
                  </span>
                  {isStep4Locked ? (
                    <Lock className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                  )}
                </div>
              </div>
            )
          })()}

          {/* 5. Declaration */}
          {(() => {
            const isStep5Done = completedStepIds.includes(5)
            const isStep5Locked = !isReadOnly && !isRegistrationComplete && !isStep5Done && !completedStepIds.includes(4)
            return (
              <div
                onClick={() => !isStep5Locked && onStepClick(5)}
                className={`group flex items-center justify-between px-5 py-3.5 rounded-xl border transition-all shadow-2xs ${
                  isStep5Locked
                    ? 'border-slate-200/60 dark:border-slate-800/60 bg-slate-100/50 dark:bg-slate-900/40 opacity-60 cursor-not-allowed select-none'
                    : 'border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-800 hover:bg-blue-50/60 dark:hover:bg-slate-800/90 hover:border-blue-300 dark:hover:border-blue-700 cursor-pointer'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      isStep5Done
                        ? 'bg-emerald-500 text-white'
                        : isStep5Locked
                        ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 border border-slate-300 dark:border-slate-700'
                        : 'border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {isStep5Done ? <Check className="h-3.5 w-3.5" /> : '5'}
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    5. Declaration
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-extrabold tracking-wide uppercase flex items-center gap-1 ${
                      isStep5Done ? 'text-emerald-600 dark:text-emerald-400' : isStep5Locked ? 'text-slate-400 dark:text-slate-500' : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    ({isStep5Done ? 'DONE' : isStep5Locked ? 'LOCKED' : 'PENDING'})
                  </span>
                  {isStep5Locked ? (
                    <Lock className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                  )}
                </div>
              </div>
            )
          })()}

          {/* 6. Print Track Sheet (Mandatory) */}
          <div
            onClick={onPrintTrackSheet}
            className={`group px-5 py-3.5 rounded-xl border transition-all shadow-2xs ${isRegistrationComplete || Boolean(applicationNo)
                ? 'border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 cursor-pointer'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 cursor-pointer'
              }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Printer className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  6. Print Track Sheet
                </span>
                <span className="text-xs font-extrabold text-rose-600 dark:text-rose-400">
                  (Mandatory)
                </span>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400 leading-normal pl-6">
              <strong className="text-slate-700 dark:text-slate-300">Note:</strong> Registration Process is considered to be complete only on submission of Track Sheet in person as per specified dates. For more details read the{' '}
              <span
                onClick={(e) => {
                  e.stopPropagation()
                  onOpenInstruction?.()
                }}
                className="text-blue-600 dark:text-blue-400 underline font-semibold cursor-pointer"
              >
                instruction
              </span>
            </p>
          </div>

          {/* 7. Print Registration Form (Optional) */}
          <div
            onClick={onPrintRegistrationForm}
            className={`group flex items-center justify-between px-5 py-3.5 rounded-xl border transition-all shadow-2xs ${isRegistrationComplete || Boolean(applicationNo)
                ? 'border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 cursor-pointer'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 cursor-pointer'
              }`}
          >
            <div className="flex items-center gap-2.5">
              <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                7. Print Registration Form
              </span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                (Optional)
              </span>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>

        {/* Yellow Notice Banner 2 (Bottom - PDF Pages 3 & 18) */}
        <div className="bg-[#FFF8E7] dark:bg-amber-950/40 border-t border-[#FFE8B3] dark:border-amber-900/50 px-6 py-4 text-center space-y-1">
          {lowerNotice ? (
            lowerNotice.split('\n').filter(Boolean).map((line, idx) => (
              <p key={idx} className="text-xs sm:text-sm font-bold text-[#D46B08] dark:text-amber-400">
                {line.trim()}
              </p>
            ))
          ) : (
            <>
              <p className="text-xs sm:text-sm font-bold text-[#D46B08] dark:text-amber-400">
                *Please ensure that you have taken the Track Sheet print out.
              </p>
              <p className="text-xs sm:text-sm font-bold text-[#D46B08] dark:text-amber-400">
                "Print" option will not be available after midnight of specified date.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
