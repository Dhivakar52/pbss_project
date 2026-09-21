import React from 'react'
import {
  Printer,
  FileText,
  ChevronRight,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Eye,
  Lock,
  Bell
} from 'lucide-react'
import type { Step } from '../types'

interface RegistrationOverviewProps {
  steps: Step[]
  completedCount: number
  isRegistrationComplete: boolean
  activeStepId: number
  completedStepIds?: number[]
  isFromAdmin?: boolean
  isAdminUser?: boolean
  onStepClick: (stepId: number) => void
  onCompleteAll: () => void
  onReset: () => void
  onPrintTrackSheet: () => void
  onPrintRegistrationForm: () => void
  onOpenSuccessModal?: () => void
  onViewApplicationDetails?: () => void
}

export const RegistrationOverview: React.FC<RegistrationOverviewProps> = ({
  steps,
  completedCount,
  isRegistrationComplete,
  activeStepId,
  completedStepIds = [],
  isFromAdmin = false,
  isAdminUser = false,
  onStepClick,
  onCompleteAll,
  onReset,
  onPrintTrackSheet,
  onPrintRegistrationForm,
  onOpenSuccessModal,
  onViewApplicationDetails,
}) => {
  return (
    <div className="space-y-6">
      {/* Quick Action Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-slate-50 to-blue-50/50 dark:from-slate-900 dark:to-blue-950/40 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Registration Portal</span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">| Click any step item to open separate step form screen</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {onViewApplicationDetails && (
            <button
              type="button"
              onClick={onViewApplicationDetails}
              className="text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-100/70 dark:bg-blue-950/70 hover:bg-blue-100 dark:hover:bg-blue-900 px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 border border-blue-200/60 dark:border-blue-800/60"
            >
              <FileText className="h-3.5 w-3.5" /> Application Details
            </button>
          )}
          {isRegistrationComplete && onOpenSuccessModal && (
            <button
              type="button"
              onClick={onOpenSuccessModal}
              className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/80 hover:bg-emerald-200/80 dark:hover:bg-emerald-900/80 px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 border border-emerald-300/60 dark:border-emerald-800"
            >
              <Eye className="h-3.5 w-3.5" /> View Success Details
            </button>
          )}
          {isAdminUser && (
            <>
              <button
                type="button"
                onClick={onCompleteAll}
                className="text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-100/70 dark:bg-blue-950/70 hover:bg-blue-100 dark:hover:bg-blue-900 px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 border border-blue-200/60 dark:border-blue-800/60"
              >
                <CheckCircle2 className="h-3.5 w-3.5" /> Complete All Steps
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

      {/* Completion Notification Banner */}
      {isRegistrationComplete && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-blue-500/15 dark:from-emerald-950/50 dark:via-teal-950/30 dark:to-blue-950/40 border border-emerald-300/80 dark:border-emerald-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5">
                Registration Completed & Ready for Submission!
              </h3>
              <p className="text-xs text-emerald-800/90 dark:text-emerald-300/80">
                All 5 admission steps have been fully completed. Track sheet printing is now enabled.
              </p>
            </div>
          </div>
          {onOpenSuccessModal && (
            <button
              type="button"
              onClick={onOpenSuccessModal}
              className="h-9 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Eye className="h-3.5 w-3.5" /> View Submission Modal
            </button>
          )}
        </div>
      )}

      {/* Main 2-Column Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

        {/* LEFT PANEL: Registration Progress */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-[#0F294A] dark:text-slate-100">Registration Progress</h2>
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-400">
              {completedCount} / 5 Completed
            </span>
          </div>

          <div className="space-y-3">
            {steps.map((step) => {
              const isActive = activeStepId === step.id
              const isDone = step.status === 'COMPLETED'
              const isPrevDone = step.id === 1 || completedStepIds.includes(step.id - 1)
              const isLocked = !isFromAdmin && !isRegistrationComplete && !isPrevDone

              return (
                <div
                  key={step.id}
                  onClick={() => {
                    if (isLocked) {
                      return
                    }
                    onStepClick(step.id)
                  }}
                  className={`group relative flex items-center justify-between px-4 py-3.5 rounded-xl border transition-all ${isLocked
                    ? 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60 opacity-60 cursor-not-allowed select-none'
                    : isActive
                      ? 'bg-[#F0F7FF] dark:bg-blue-950/40 border-[#BDE0FE] dark:border-blue-800 shadow-2xs cursor-pointer'
                      : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:bg-slate-50/80 dark:hover:bg-slate-800/70 hover:border-slate-200 dark:hover:border-slate-700 cursor-pointer'
                    }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0 pr-3">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${isDone
                        ? 'bg-emerald-500 text-white'
                        : isLocked
                          ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-300 dark:border-slate-700'
                          : isActive
                            ? 'bg-[#1677FF] text-white'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : isLocked ? (
                        <Lock className="h-3.5 w-3.5 text-slate-400" />
                      ) : (
                        step.id
                      )}
                    </div>

                    <span
                      className={`text-xs sm:text-sm font-semibold truncate ${isLocked
                        ? 'text-slate-400 dark:text-slate-500'
                        : isActive
                          ? 'text-[#1677FF] dark:text-blue-400'
                          : 'text-slate-700 dark:text-slate-200'
                        }`}
                    >
                      {step.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {isLocked ? (
                      <span className="w-[84px] h-7 flex items-center justify-center text-[10px] font-bold tracking-wider rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase border border-slate-200 dark:border-slate-700 shadow-2xs">
                        LOCKED
                      </span>
                    ) : step.status === 'PENDING' ? (
                      <span className="w-[84px] h-7 flex items-center justify-center text-[10px] font-bold tracking-wider rounded-md bg-[#FFF0F0] dark:bg-red-950/60 text-[#FF4D4F] dark:text-red-400 uppercase border border-[#FFD6D6] dark:border-red-900 shadow-2xs">
                        PENDING
                      </span>
                    ) : step.status === 'OPTIONAL' ? (
                      <span className="w-[84px] h-7 flex items-center justify-center text-[10px] font-bold tracking-wider rounded-md bg-[#E6F4FF] dark:bg-blue-950/60 text-[#1677FF] dark:text-blue-400 uppercase border border-[#BAE0FF] dark:border-blue-900 shadow-2xs">
                        OPTIONAL
                      </span>
                    ) : (
                      <span className="w-[84px] h-7 flex items-center justify-center text-[10px] font-bold tracking-wider rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 uppercase border border-emerald-200 dark:border-emerald-800 shadow-2xs">
                        DONE
                      </span>
                    )}

                    <ChevronRight className={`h-4 w-4 shrink-0 transition-transform ${isLocked ? 'text-slate-300 dark:text-slate-600' : 'text-slate-400 dark:text-slate-500 group-hover:translate-x-0.5'
                      }`} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* RIGHT PANEL: Documents & Printing */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-[#0F294A] dark:text-slate-100">Documents & Printing</h2>
          </div>

          <div className="space-y-4">
            {/* Track Sheet Card */}
            <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all">
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-[#E6F4FF] dark:bg-blue-950/60 text-[#1677FF] dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Printer className="h-5 w-5" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">Track Sheet</h3>
                    <span className="w-[84px] h-7 flex items-center justify-center text-[10px] font-bold tracking-wider rounded-md bg-[#FFF0F0] dark:bg-red-950/60 text-[#FF4D4F] dark:text-red-400 uppercase border border-[#FFD6D6] dark:border-red-900 shadow-2xs">
                      REQUIRED
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Registration must be completed before printing.
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 font-normal">
                    Note: Track sheet print option will be available only after midnight of 21/01/2025 (Tuesday).
                  </p>
                </div>
              </div>

              <div className="shrink-0 self-end md:self-center">
                <button
                  type="button"
                  onClick={onPrintTrackSheet}
                  disabled={!isRegistrationComplete}
                  className={`h-9 px-4 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 min-w-[170px] ${isRegistrationComplete
                    ? 'bg-[#1677FF] dark:bg-blue-600 text-white hover:bg-[#0958D9] dark:hover:bg-blue-500 shadow-2xs cursor-pointer'
                    : 'bg-[#EAECEF] dark:bg-slate-800 text-[#8C98A6] dark:text-slate-500 border border-slate-200 dark:border-slate-700 cursor-not-allowed'
                    }`}
                >
                  <Printer className="h-3.5 w-3.5" /> Print Track Sheet
                </button>
              </div>
            </div>

            {/* Registration Form Card */}
            <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all">
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-[#F4EEFF] dark:bg-purple-950/60 text-[#722ED1] dark:text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                  <FileText className="h-5 w-5" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">Registration Form</h3>
                    <span className="w-[84px] h-7 flex items-center justify-center text-[10px] font-bold tracking-wider rounded-md bg-[#FFF0F0] dark:bg-red-950/60 text-[#FF4D4F] dark:text-red-400 uppercase border border-[#BAE0FF] dark:border-blue-900 shadow-2xs">
                      Required
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Download and print a copy of your completed registration form.
                  </p>
                </div>
              </div>

              <div className="shrink-0 self-end md:self-center">
                <button
                  type="button"
                  onClick={onPrintRegistrationForm}
                  disabled={!isRegistrationComplete}
                  className={`h-9 px-4 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 min-w-[170px] ${isRegistrationComplete
                    ? 'bg-[#1677FF] dark:bg-blue-600 text-white hover:bg-[#0958D9] dark:hover:bg-blue-500 shadow-2xs cursor-pointer'
                    : 'bg-[#EAECEF] dark:bg-slate-800 text-[#8C98A6] dark:text-slate-500 border border-slate-200 dark:border-slate-700 cursor-not-allowed'
                    }`}
                >
                  <Printer className="h-3.5 w-3.5" /> Print Registration Form
                </button>
              </div>
            </div>

            {/* Important Notice Card */}
            <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all overflow-hidden">
              <div className="flex items-start gap-3.5 shrink-0">
                <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Bell className="h-5 w-5" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">Important Notice</h3>
                    <span className="w-[84px] h-7 flex items-center justify-center text-[10px] font-bold tracking-wider rounded-md bg-[#FFF7E6] dark:bg-amber-950/60 text-[#D46B08] dark:text-amber-400 uppercase border border-[#FFD591] dark:border-amber-900 shadow-2xs">
                      NOTICE
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Admissions deadline & submission guidelines.
                  </p>
                  {/* <p className="text-[11px] text-slate-400 dark:text-slate-500 font-normal">
                    Note: Last day of application submission is 30-09-2026.
                  </p> */}
                </div>
              </div>

              {/* Right Side Animation */}
              <div className="w-full md:w-auto md:flex-1 md:max-w-[340px] lg:max-w-[370px] overflow-hidden relative rounded-xl bg-amber-50/50 dark:bg-slate-900/80 border border-amber-200/70 dark:border-slate-800 py-2.5 px-3 shadow-2xs">
                {/* Soft gradient masks at edges */}
                <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-amber-50/90 dark:from-slate-900 to-transparent pointer-events-none z-10" />
                <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-amber-50/90 dark:from-slate-900 to-transparent pointer-events-none z-10" />

                <div className="overflow-hidden w-full relative">
                  <div className="animate-marquee font-bold text-xs tracking-wide flex items-center gap-6 whitespace-nowrap" style={{ animationDuration: '22s' }}>
                    <span className="text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping inline-block"></span>
                      ⚠️ Last Day of Submission : <strong className="underline decoration-amber-500 underline-offset-2 font-extrabold">30-09-2026</strong>
                    </span>
                    <span className="text-amber-400/80">•</span>
                    <span className="text-slate-700 dark:text-slate-200">
                      📋 Complete and submit all required application steps before the deadline
                    </span>
                    <span className="text-amber-400/80">•</span>
                    <span className="text-blue-700 dark:text-blue-300">
                      🖨️ Track sheet available after completion
                    </span>
                    <span className="text-amber-400/80">•</span>
                    <span className="text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping inline-block"></span>
                      ⚠️ Last Day of Submission : <strong className="underline decoration-amber-500 underline-offset-2 font-extrabold">30-09-2026</strong>
                    </span>
                    <span className="text-amber-400/80">•</span>
                    <span className="text-slate-700 dark:text-slate-200">
                      📋 Complete and submit all required application steps before the deadline
                    </span>
                    <span className="text-amber-400/80">•</span>
                    <span className="text-blue-700 dark:text-blue-300">
                      🖨️ Track sheet available after completion
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

