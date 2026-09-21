import React from 'react'
import { ArrowLeft, CheckCircle2, Printer, Lock, ChevronRight } from 'lucide-react'
import type { Step } from '../types'

interface StepSidebarProps {
  steps: Step[]
  activeStepId: number
  completedStepIds: number[]
  onBackToDashboard: () => void
  backLabel?: string
  onStepSelect: (stepId: number) => void
  isFromAdmin?: boolean
}

export const StepSidebar: React.FC<StepSidebarProps> = ({
  steps,
  activeStepId,
  completedStepIds,
  onBackToDashboard,
  backLabel,
  onStepSelect,
  isFromAdmin = false,
}) => {
  const isAllDone = completedStepIds.length === 5

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={onBackToDashboard}
        className="flex items-center gap-1.5 text-xs font-semibold text-[#1677FF] dark:text-blue-400 hover:text-[#0958D9] dark:hover:text-blue-300 transition-colors cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" /> {backLabel || 'Back to Dashboard'}
      </button>

      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-4">
        {/* Step Counter & Progress Bar */}
        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-400">Step {activeStepId} of 5</span>
          <h2 className="text-base font-bold text-[#0F294A] dark:text-white">{steps[activeStepId - 1].title}</h2>

          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-[#1677FF] dark:bg-blue-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${(activeStepId / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Steps List Menu */}
        <div className="space-y-2 pt-2">
          {steps.map((step) => {
            const isActive = activeStepId === step.id
            const isDone = completedStepIds.includes(step.id)
            const isPrevDone = step.id === 1 || completedStepIds.includes(step.id - 1)
            const isLocked = !isFromAdmin && !isAllDone && !isPrevDone

            return (
              <div
                key={step.id}
                onClick={() => {
                  if (isLocked) {
                    return
                  }
                  onStepSelect(step.id)
                }}
                className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                  isLocked
                    ? 'opacity-50 cursor-not-allowed text-slate-400 dark:text-slate-600 bg-slate-50/50 dark:bg-slate-900/40 select-none'
                    : isActive
                    ? 'bg-[#E6F4FF] dark:bg-blue-950/50 text-[#1677FF] dark:text-blue-400 font-bold shadow-2xs cursor-pointer'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      isDone
                        ? 'bg-emerald-500 text-white'
                        : isActive
                        ? 'bg-[#1677FF] dark:bg-blue-500 text-white'
                        : isLocked
                        ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-300 dark:border-slate-700'
                        : 'border border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    ) : isLocked ? (
                      <Lock className="h-3 w-3 text-slate-400" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <span className="text-xs font-medium truncate">
                    {step.title} {step.id === 3 && <span className="text-slate-400 dark:text-slate-500 font-normal text-[11px]">(Optional)</span>}
                  </span>
                </div>
                <div className="shrink-0 flex items-center">
                  {isLocked ? (
                    <Lock className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                  ) : isDone ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <ChevronRight className={`h-3.5 w-3.5 ${isActive ? 'text-[#1677FF] dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} />
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Info Card at bottom */}
        <div className="p-3.5 rounded-xl bg-[#F0F7FF] dark:bg-blue-950/30 border border-[#BDE0FE] dark:border-blue-900/50 flex items-start gap-3 mt-4">
          <div className="p-2 rounded-lg bg-[#E6F4FF] dark:bg-blue-900/40 text-[#1677FF] dark:text-blue-400 shrink-0 mt-0.5">
            <Printer className="h-4 w-4" />
          </div>
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Please fill up the form carefully.</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">All fields marked with <span className="text-red-500 font-bold">*</span> are mandatory.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
