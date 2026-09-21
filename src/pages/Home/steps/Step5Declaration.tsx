import React from 'react'
import { FileCheck, Save, ArrowRight, AlertTriangle } from 'lucide-react'
import { Field, TextField } from '@/components/FormPrimitives'

interface Step5DeclarationProps {
  declarantType: 'Father' | 'Mother' | 'Guardian'
  setDeclarantType: (val: 'Father' | 'Mother' | 'Guardian') => void
  childName: string
  setChildName?: (val: string) => void
  isDeclared: boolean
  setIsDeclared: (val: boolean) => void
  onSaveAndExit: () => void
  onSaveAndNext: () => void
  isReadOnly?: boolean
  onBackToMaster?: () => void
  onPrint?: () => void
  backLabel?: string
}

export const Step5Declaration: React.FC<Step5DeclarationProps> = ({
  declarantType,
  setDeclarantType,
  childName,
  isDeclared,
  setIsDeclared,
  onSaveAndExit,
  onSaveAndNext,
  isReadOnly = false,
  onBackToMaster,
  onPrint,
  backLabel,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-6">
      <div className="flex items-center gap-2 text-sm font-bold text-[#0F294A] dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
        <FileCheck className="h-4.5 w-4.5 text-[#1677FF] dark:text-blue-400" />
        <span>Declaration</span>
      </div>

      {/* Main Declaration Box matching Screenshot 4 */}
      <fieldset disabled={isReadOnly} className={isReadOnly ? "border-none p-0 m-0 disabled:opacity-95" : "border-none p-0 m-0"}>
        <div className="p-5 rounded-xl bg-[#E6F4FF]/50 dark:bg-blue-950/30 border border-[#BAE0FF] dark:border-blue-900/60 space-y-4">
          {/* Declarant Radio Selection */}
          <div className="flex items-center gap-6 text-xs font-bold text-slate-800 dark:text-slate-200 border-b border-blue-100 dark:border-blue-900/40 pb-3">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="declarantType"
                checked={declarantType === 'Father'}
                onChange={() => setDeclarantType('Father')}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span>Father</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="declarantType"
                checked={declarantType === 'Mother'}
                onChange={() => setDeclarantType('Mother')}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span>Mother</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="declarantType"
                checked={declarantType === 'Guardian'}
                onChange={() => setDeclarantType('Guardian')}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span>Guardian</span>
            </label>
          </div>

          <div className="max-w-xs">
            <Field label="Name of the Declarant">
              <TextField
                placeholder="Auto-filled from selection"
                value={
                  declarantType === 'Father'
                    ? 'Father'
                    : declarantType === 'Mother'
                    ? 'Mother'
                    : 'Guardian'
                }
                onChange={() => {}}
                disabled
              />
            </Field>
          </div>

          {/* Declaration Input & Paragraph */}
          <div className="space-y-4 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
            <p>
              We, the parents (father & mother) / guardian of{' '}
              <span className="font-bold text-blue-900 dark:text-blue-200 bg-white dark:bg-slate-800 px-2 py-1 rounded border border-blue-200 dark:border-blue-800 inline-block">
                {childName.trim() ? childName : 'Child Name'}
              </span>{' '}
              seeking his/her admission to Pre-KG hereby solemnly declare that the information furnished above is absolutely true and that if found factually incorrect any time after the admission during his/her stay in the school, We shall abide by the orders of the school for withdrawal of our son/daughter/ward without any protest or plea.
            </p>
            <p className="font-semibold text-slate-900 dark:text-white">
              We also declare that we have applied in <span className="text-blue-700 dark:text-blue-400 font-bold">T.Nagar-PSBB</span> branch only.
            </p>

            <label className="flex items-center gap-2 cursor-pointer pt-2 border-t border-blue-100 dark:border-blue-900/40">
              <input
                type="checkbox"
                checked={isDeclared}
                onChange={(e) => setIsDeclared(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500"
              />
              <span className="font-bold text-slate-800 dark:text-slate-200">
                I agree and accept the declaration terms above.
              </span>
            </label>
          </div>
        </div>
      </fieldset>

      {/* Yellow Warning Note Box matching Screenshot 4 */}
      <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-start gap-3 text-amber-900 dark:text-amber-200 text-xs font-semibold">
        <AlertTriangle className="h-4.5 w-4.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-amber-950 dark:text-amber-200">
            *Please ensure that you have taken the Track Sheet print out.
          </p>
          <p className="text-amber-800 dark:text-amber-300 font-medium">
            "Print" option will not be available after midnight of 21/01/2025 (Tuesday).
          </p>
        </div>
      </div>

      {/* Action Buttons matching Screenshot 4 ACCEPT button */}
      <div className="flex items-center justify-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        {isReadOnly ? (
          <>
            <button
              type="button"
              onClick={onBackToMaster || onSaveAndNext}
              className="h-10 px-6 rounded-xl text-xs font-semibold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer flex items-center gap-2"
            >
              {backLabel || "Back to Admission"}
            </button>
            <button
              type="button"
              onClick={onPrint || (() => window.print())}
              className="h-10 px-6 rounded-xl text-xs font-bold bg-[#1677FF] hover:bg-[#0958D9] dark:bg-blue-600 dark:hover:bg-blue-500 text-white shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              Print Application
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={onSaveAndExit}
              className="h-10 px-5 rounded-xl text-xs font-semibold border border-blue-500 text-[#1677FF] dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-all cursor-pointer flex items-center gap-1.5 bg-white dark:bg-slate-800"
            >
              <Save className="h-4 w-4" /> Save & Exit
            </button>
            <button
              type="button"
              onClick={onSaveAndNext}
              className="h-10 px-8 rounded-xl text-xs font-bold bg-[#1677FF] hover:bg-[#0958D9] dark:bg-blue-600 dark:hover:bg-blue-500 text-white shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              <FileCheck className="h-4 w-4" /> ACCEPT & SUBMIT <ArrowRight className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
    </div>
  )
}
