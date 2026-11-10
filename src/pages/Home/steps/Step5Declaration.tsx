import React from 'react'
import { FileCheck, Save, ArrowRight, AlertTriangle } from 'lucide-react'
import { Field, TextField } from '@/components/FormPrimitives'
import type { AdditionalChild } from '../types'

interface Step5DeclarationProps {
  declarantType: 'Father' | 'Mother' | 'Guardian'
  setDeclarantType: (val: 'Father' | 'Mother' | 'Guardian') => void
  childName: string
  setChildName?: (val: string) => void
  childGender?: string
  isTwins?: boolean
  twinsNo?: number | string
  additionalChildren?: AdditionalChild[]
  childDeclarations?: boolean[]
  setChildDeclarations?: React.Dispatch<React.SetStateAction<boolean[]>>
  isDeclared: boolean
  setIsDeclared: (val: boolean) => void
  onSaveAndExit: () => void
  onSaveAndNext: () => void
  isReadOnly?: boolean
  onBackToMaster?: () => void
  onPrint?: () => void
  backLabel?: string
  deadlineNotice?: string
  hasGuardian?: boolean
  selectedSchoolName?: string
}

export const Step5Declaration: React.FC<Step5DeclarationProps> = ({
  declarantType,
  setDeclarantType,
  childName,
  childGender,
  isTwins = false,
  twinsNo = '',
  additionalChildren = [],
  childDeclarations: _childDeclarations = [false, false, false, false],
  setChildDeclarations,
  isDeclared,
  setIsDeclared,
  onSaveAndExit,
  onSaveAndNext,
  isReadOnly = false,
  onBackToMaster,
  onPrint,
  backLabel,
  deadlineNotice,
  hasGuardian = false,
  selectedSchoolName,
}) => {
  React.useEffect(() => {
    if (!hasGuardian && declarantType === 'Guardian') {
      setDeclarantType('Father')
    }
  }, [hasGuardian, declarantType, setDeclarantType])

  const displayBranch = selectedSchoolName
    ? (selectedSchoolName.includes('PSBB') ? selectedSchoolName : `${selectedSchoolName} - PSBB`)
    : ''

  const getPronoun = (gender?: string) => {
    const g = (gender || '').trim().toLowerCase()
    if (g === 'male' || g === 'boy') return 'his'
    if (g === 'female' || g === 'girl') return 'her'
    return 'his/her'
  }

  const allChildren = React.useMemo(() => {
    const list = [{ name: childName, gender: childGender, label: 'Child 1' }]
    if (isTwins && additionalChildren) {
      const extraCount = Math.max(0, Number(twinsNo || 2) - 1)
      for (let i = 0; i < extraCount; i++) {
        const extra = additionalChildren[i]
        list.push({
          name: extra?.name || '',
          gender: extra?.gender || '',
          label: `Child ${i + 2}`,
        })
      }
    }
    return list
  }, [childName, childGender, isTwins, additionalChildren, twinsNo])

  const isMultiple = isTwins && allChildren.length > 1
  const allDeclared = isDeclared

  return (
    <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-6">
      <div className="flex items-center gap-2.5 text-sm font-bold text-[#0F294A] dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3.5">
        <FileCheck className="h-4.5 w-4.5 text-[#1677FF] dark:text-blue-400" />
        <span>Declaration Details</span>
      </div>

      {/* Main Declaration Box */}
      <fieldset disabled={isReadOnly} className={isReadOnly ? "border-none p-0 m-0 disabled:opacity-95" : "border-none p-0 m-0"}>
        <div className="space-y-5">
          {/* Declarant Radio Selection Card */}
          <div className="p-6 sm:p-7 rounded-2xl bg-[#E6F4FF]/50 dark:bg-blue-950/30 border border-[#BAE0FF] dark:border-blue-900/60 space-y-5">
            <div className="flex flex-wrap items-center gap-6 text-xs font-bold text-slate-800 dark:text-slate-200 border-b border-blue-100/90 dark:border-blue-900/40 pb-4">
              <span className="text-slate-500 font-semibold mr-1">Person applying for:</span>
              <label className="flex items-center gap-2 cursor-pointer hover:text-blue-600 transition-colors">
                <input
                  type="radio"
                  name="declarantType"
                  checked={declarantType === 'Father'}
                  onChange={() => setDeclarantType('Father')}
                  className="text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 cursor-pointer"
                />
                <span>Father</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer hover:text-blue-600 transition-colors">
                <input
                  type="radio"
                  name="declarantType"
                  checked={declarantType === 'Mother'}
                  onChange={() => setDeclarantType('Mother')}
                  className="text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 cursor-pointer"
                />
                <span>Mother</span>
              </label>

              {hasGuardian && (
                <label className="flex items-center gap-2 cursor-pointer hover:text-blue-600 transition-colors">
                  <input
                    type="radio"
                    name="declarantType"
                    checked={declarantType === 'Guardian'}
                    onChange={() => setDeclarantType('Guardian')}
                    className="text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 cursor-pointer"
                  />
                  <span>Guardian</span>
                </label>
              )}
            </div>

            <div className="max-w-xs pt-1">
              <Field label="Relation of the  Declarant">
                <TextField
                  placeholder="Auto-filled from selection"
                  value={
                    declarantType === 'Father'
                      ? 'Father'
                      : declarantType === 'Mother'
                        ? 'Mother'
                        : 'Guardian'
                  }
                  onChange={() => { }}
                  disabled
                />
              </Field>
            </div>

            {/* Single Child Declaration Terms */}
            {!isMultiple && (
              <div className="space-y-4 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium pt-1">
                <p>
                  We, the parents (father &amp; mother) / guardian of{' '}
                  <span className="font-bold text-blue-900 dark:text-blue-200 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-md border border-blue-200 dark:border-blue-800 inline-block shadow-2xs">
                    {childName.trim() ? childName : 'Name of the Child'}
                  </span>{' '}
                  seeking his/her admission to Pre-KG hereby solemnly declare that the information furnished above is absolutely true and that if found factually incorrect any time after the admission during his/her stay in the school, We shall abide by the orders of the school for withdrawal of our son/daughter/ward without any protest or plea.
                </p>
                <p className="font-semibold text-slate-900 dark:text-white">
                  We also declare that we have applied in <span className="text-blue-700 dark:text-blue-400 font-bold">{displayBranch}</span> branch only.
                </p>
              </div>
            )}
          </div>

          {/* Multiple Children Declarations Terms (Without checkbox inside) */}
          {isMultiple && (
            <div className="space-y-4">
              {allChildren.map((ch, idx) => {
                const pronoun = getPronoun(ch.gender)
                const displayName = ch.name.trim() || ch.label

                return (
                  <div
                    key={idx}
                    className="p-6 sm:p-7 rounded-2xl bg-[#E6F4FF]/50 dark:bg-blue-950/30 border border-[#BAE0FF] dark:border-blue-900/60 space-y-4"
                  >
                    <div className="flex items-center gap-2 border-b border-blue-100/90 dark:border-blue-900/40 pb-2.5">
                      <FileCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-xs font-bold text-blue-950 dark:text-blue-200">
                        Declaration for {ch.label} – {displayName}
                      </span>
                    </div>

                    <div className="space-y-4 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium pt-1">
                      <p>
                        We, the parents (father &amp; mother) / guardian of{' '}
                        <span className="font-bold text-blue-900 dark:text-blue-200 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-md border border-blue-200 dark:border-blue-800 inline-block shadow-2xs">
                          {displayName}
                        </span>{' '}
                        seeking {pronoun} admission to Pre-KG hereby solemnly declare that the information furnished above is absolutely true and that if found factually incorrect any time after the admission during {pronoun} stay in the school, We shall abide by the orders of the school for withdrawal of our son/daughter/ward without any protest or plea.
                      </p>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        We also declare that we have applied in <span className="text-blue-700 dark:text-blue-400 font-bold">{displayBranch}</span> branch only.
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Shared Application-Level Declaration Agreement Checkbox - Exactly ONE in the entire application */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#E6F4FF]/50 dark:bg-blue-950/30 border border-[#BAE0FF] dark:border-blue-900/60 shadow-2xs">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                id="declarationAgreementCheckbox"
                checked={isDeclared}
                onChange={(e) => {
                  const val = e.target.checked
                  setIsDeclared(val)
                  if (setChildDeclarations) {
                    setChildDeclarations([val, val, val, val])
                  }
                }}
                className="h-4.5 w-4.5 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
              />
              <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                I agree and accept the declaration terms above.
              </span>
            </label>
          </div>
        </div>
      </fieldset>

      {/* Yellow Warning Note Box matching Screenshot 4 */}
      <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-start gap-3 text-amber-900 dark:text-amber-200 text-xs font-semibold mt-6">
        <AlertTriangle className="h-4.5 w-4.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-amber-950 dark:text-amber-200">
            *Please ensure that you have taken the Track Sheet print out.
          </p>
          <p className="text-amber-800 dark:text-amber-300 font-medium mt-0.5">
            {deadlineNotice || '"Print" option will not be available after midnight of specified date.'}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-4 pt-6 mt-8 border-t border-slate-100 dark:border-slate-800">
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
              disabled={!allDeclared}
              onClick={onSaveAndNext}
              title={!allDeclared ? "Please tick 'I agree and accept the declaration terms above' to enable submission" : undefined}
              className={`h-10 px-8 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${allDeclared
                ? 'bg-[#1677FF] hover:bg-[#0958D9] dark:bg-blue-600 dark:hover:bg-blue-500 text-white shadow-md cursor-pointer'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-300/70 dark:border-slate-700 shadow-none'
                }`}
            >
              <FileCheck className="h-4 w-4" /> ACCEPT & SUBMIT <ArrowRight className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
    </div>
  )
}
