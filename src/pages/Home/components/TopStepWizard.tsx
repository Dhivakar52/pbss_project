import React from 'react'
import {
  ArrowLeft,
  Check,
  User,
  Users,
  ShieldAlert,
  MapPin,
  Lock,
  ChevronRight
} from 'lucide-react'
import type { Step } from '../types'

interface TopStepWizardProps {
  steps: Step[]
  activeStepId: number
  completedStepIds: number[]
  onBackToDashboard: () => void
  onStepSelect: (stepId: number) => void
}

export const TopStepWizard: React.FC<TopStepWizardProps> = ({
  steps,
  activeStepId,
  completedStepIds,
  onBackToDashboard,
  onStepSelect,
}) => {
  const completedCount = completedStepIds.length
  const progressPercent = Math.round((completedCount / 5) * 100)

  // Step Icons matching each registration section
  const getStepIcon = (stepId: number) => {
    switch (stepId) {
      case 1:
        return User
      case 2:
        return Users
      case 3:
        return ShieldAlert
      case 4:
        return MapPin
      case 5:
        return Lock
      default:
        return User
    }
  }

  return (
    <div className="w-full bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-5">
      {/* Top Header Row: Back Button & Step Progress */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
        <button
          type="button"
          onClick={onBackToDashboard}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-[#1677FF] dark:hover:text-blue-400 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Step {activeStepId} of 5
            </span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {completedCount} of 5 Completed ({progressPercent}%)
            </span>
          </div>

          <div className="w-20 sm:w-28 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shrink-0">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${(completedCount / 5) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* HORIZONTAL STEPPER WITH ICONS, STEP NUMBER, TITLE, AND BADGES */}
      <div className="overflow-x-auto pb-2 pt-1 -mx-2 px-2 sm:mx-0 sm:px-0">
        <div className="flex items-start justify-between min-w-[700px] sm:min-w-0 sm:w-full">
          {steps.map((step, index) => {
            const isCompleted = completedStepIds.includes(step.id)
            const isActive = activeStepId === step.id
            const isLast = index === steps.length - 1
            const StepIcon = getStepIcon(step.id)

            return (
              <div
                key={step.id}
                className="flex-1 flex flex-col items-start relative select-none pr-3"
              >
                {/* Top Row: Circle Icon + Connecting Line to next step */}
                <div className="flex items-center w-full">
                  {/* Step Circle Button */}
                  <button
                    type="button"
                    onClick={() => onStepSelect(step.id)}
                    title={`Click to go to Step ${step.id}: ${step.title}`}
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-xs z-10 ${isCompleted
                        ? 'bg-emerald-500 text-white hover:bg-emerald-600 ring-4 ring-emerald-50 dark:ring-emerald-950/40'
                        : isActive
                          ? 'bg-[#1677FF] text-white ring-4 ring-blue-100 dark:ring-blue-900/60 shadow-md shadow-blue-500/20'
                          : 'border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:border-slate-400'
                      }`}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5 stroke-[2.5]" />
                    ) : (
                      <StepIcon className={`h-4.5 w-4.5 ${isActive ? 'text-white' : ''}`} />
                    )}
                  </button>

                  {/* Connecting Line to next step */}
                  {!isLast && (
                    <div
                      className={`flex-1 h-[2.5px] mx-2.5 sm:mx-3 rounded-full transition-colors duration-300 ${isCompleted
                          ? 'bg-emerald-500'
                          : 'bg-slate-200 dark:bg-slate-700'
                        }`}
                    />
                  )}
                </div>

                {/* Text Block directly under the circle: Step 1 / Title / Badge */}
                <div className="mt-3.5 space-y-1 text-left">
                  {/* Line 1: Step X */}
                  <span
                    className={`text-[11px] sm:text-xs font-semibold tracking-wider block ${isActive
                        ? 'text-[#1677FF] dark:text-blue-400 font-bold'
                        : isCompleted
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-400 dark:text-slate-500'
                      }`}
                  >
                    Step {step.id}
                  </span>

                  {/* Line 2: Step Title */}
                  <h3
                    onClick={() => onStepSelect(step.id)}
                    className={`text-sm sm:text-base font-bold leading-tight cursor-pointer transition-colors ${isActive
                        ? 'text-[#1677FF] dark:text-blue-400 font-extrabold'
                        : isCompleted
                          ? 'text-slate-800 dark:text-slate-200'
                          : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-700'
                      }`}
                  >
                    {step.title}
                  </h3>

                  {/* Line 3: Badge (Completed = Green / In Progress = Warning / Pending = Warning) */}
                  <div className="pt-1">
                    {isCompleted ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-2xs">
                        Completed
                      </span>
                    ) : isActive ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shadow-2xs">
                        In Progress
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50/70 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-900/60">
                        Pending
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Mobile Active Step Info Banner (< 640px) */}
      <div className="sm:hidden pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Current Active Step {activeStepId} of 5
          </span>
          <span className="text-xs font-bold text-slate-900 dark:text-white">
            {steps[activeStepId - 1].title}
          </span>
        </div>
        <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-0.5">
          Swipe steps <ChevronRight className="h-3 w-3" />
        </span>
      </div>
    </div>
  )
}
