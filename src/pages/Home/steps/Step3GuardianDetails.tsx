import React, { useState } from 'react'
import { User, Save, ArrowRight, RotateCcw } from 'lucide-react'
import { toast } from '@/components/ui/toast'
import { Field, TextField, SelectField } from '@/components/FormPrimitives'
import type { GuardianDetailsState } from '../types'

interface Step3GuardianDetailsProps {
  guardian: GuardianDetailsState
  setGuardian: React.Dispatch<React.SetStateAction<GuardianDetailsState>>
  onClear: () => void
  onSaveAndExit: () => void
  onSaveAndNext: () => void
  isReadOnly?: boolean
}

export const Step3GuardianDetails: React.FC<Step3GuardianDetailsProps> = ({
  guardian,
  setGuardian,
  onClear,
  onSaveAndExit,
  onSaveAndNext,
  isReadOnly = false,
}) => {
  const [showErrors, setShowErrors] = useState(false)

  const update = (key: keyof GuardianDetailsState, val: any) => {
    setGuardian((prev) => ({ ...prev, [key]: val }))
  }

  const isReasonErr = showErrors && guardian.isApplicable && !guardian.reason.trim()
  const isGenderErr = showErrors && guardian.isApplicable && !guardian.gender
  const isTitleErr = showErrors && guardian.isApplicable && !guardian.title
  const isNameErr = showErrors && guardian.isApplicable && !guardian.name.trim()
  const isOccErr = showErrors && guardian.isApplicable && guardian.isEmployed && !guardian.occupation.trim()
  const isCompErr = showErrors && guardian.isApplicable && guardian.isEmployed && !guardian.companyName.trim()
  const isIncErr = showErrors && guardian.isApplicable && guardian.isEmployed && !guardian.monthlyIncome
  const isMobileErr = showErrors && guardian.isApplicable && !guardian.mobileNo.trim()
  const isAddrErr = showErrors && guardian.isApplicable && !guardian.officeAddress.trim()

  const handleNext = () => {
    if (guardian.isApplicable) {
      const isValid =
        guardian.reason.trim() &&
        guardian.gender &&
        guardian.title &&
        guardian.name.trim() &&
        (!guardian.isEmployed || (guardian.occupation.trim() && guardian.companyName.trim() && guardian.monthlyIncome)) &&
        guardian.mobileNo.trim() &&
        guardian.officeAddress.trim()

      if (!isValid) {
        setShowErrors(true)
        toast.error('Please fill in all mandatory fields for Guardian before proceeding.')
        return
      }
    }
    setShowErrors(false)
    onSaveAndNext()
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2 text-sm font-bold text-[#0F294A]">
          <User className="h-4.5 w-4.5 text-[#1677FF]" />
          <span>Guardian Details (If Applicable)</span>
        </div>
      </div>

      <fieldset disabled={isReadOnly} className={isReadOnly ? "space-y-4 border-none p-0 m-0 disabled:opacity-95" : "space-y-4 border-none p-0 m-0"}>
        {/* Toggle Guardian Applicable */}
        <Field label="Guardian Details (If Applicable)">
          <div className="flex items-center gap-4 text-xs font-medium text-slate-700 mt-1">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="guardianApplicable"
                checked={guardian.isApplicable === true}
                onChange={() => update('isApplicable', true)}
                className="text-blue-600 focus:ring-blue-500"
              /> Yes
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="guardianApplicable"
                checked={guardian.isApplicable === false}
                onChange={() => update('isApplicable', false)}
                className="text-blue-600 focus:ring-blue-500"
              /> No
            </label>
          </div>
        </Field>

        {/* Conditional Form Inputs */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 transition-all duration-200 ${
          !guardian.isApplicable ? 'opacity-40 pointer-events-none' : ''
        }`}>
          <Field label="Reason for having Guardian" span={4} required={guardian.isApplicable} error={isReasonErr}>
            <TextField
              placeholder="Enter reason"
              disabled={!guardian.isApplicable}
              value={guardian.reason}
              onChange={(val) => update('reason', val)}
              error={isReasonErr}
            />
          </Field>

          <Field label="Guardian Gender" required={guardian.isApplicable} error={isGenderErr}>
            <SelectField
              placeholder="-- Select --"
              disabled={!guardian.isApplicable}
              value={guardian.gender}
              onChange={(val) => update('gender', val)}
              options={['Male', 'Female']}
              error={isGenderErr}
            />
          </Field>

          <Field label="Guardian Title" required={guardian.isApplicable} error={isTitleErr}>
            <SelectField
              placeholder="-- Select --"
              disabled={!guardian.isApplicable}
              value={guardian.title}
              onChange={(val) => update('title', val)}
              options={['Mr.', 'Mrs.', 'Ms.', 'Dr.']}
              error={isTitleErr}
            />
          </Field>

          <Field label="Initials">
            <TextField
              placeholder="Enter initials"
              disabled={!guardian.isApplicable}
              value={guardian.initials}
              onChange={(val) => update('initials', val)}
            />
          </Field>

          <Field label="Guardian Name" required={guardian.isApplicable} error={isNameErr}>
            <TextField
              placeholder="Enter guardian name"
              disabled={!guardian.isApplicable}
              value={guardian.name}
              onChange={(val) => update('name', val)}
              error={isNameErr}
            />
          </Field>

          {/* Employment Toggle */}
          <Field label="Is Guardian Employed?" span={4}>
            <div className="flex items-center gap-4 text-xs font-medium text-slate-700 mt-1">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="guardianEmployed"
                  checked={guardian.isEmployed === true}
                  onChange={() => update('isEmployed', true)}
                  disabled={!guardian.isApplicable}
                  className="text-blue-600 focus:ring-blue-500"
                /> Yes
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="guardianEmployed"
                  checked={guardian.isEmployed === false}
                  onChange={() => update('isEmployed', false)}
                  disabled={!guardian.isApplicable}
                  className="text-blue-600 focus:ring-blue-500"
                /> No
              </label>
            </div>
          </Field>

          <Field label="Occupation" required={guardian.isApplicable && guardian.isEmployed} error={isOccErr}>
            <TextField
              placeholder="Enter occupation"
              disabled={!guardian.isApplicable || !guardian.isEmployed}
              value={guardian.occupation}
              onChange={(val) => update('occupation', val)}
              error={isOccErr}
            />
          </Field>

          <Field label="Company / Business Name" required={guardian.isApplicable && guardian.isEmployed} error={isCompErr}>
            <TextField
              placeholder="Enter company name"
              disabled={!guardian.isApplicable || !guardian.isEmployed}
              value={guardian.companyName}
              onChange={(val) => update('companyName', val)}
              error={isCompErr}
            />
          </Field>

          <Field label="Monthly Income" required={guardian.isApplicable && guardian.isEmployed} error={isIncErr}>
            <SelectField
              placeholder="-- Select --"
              disabled={!guardian.isApplicable || !guardian.isEmployed}
              value={guardian.monthlyIncome}
              onChange={(val) => update('monthlyIncome', val)}
              options={['Below 5 Lakhs', '5-10 Lakhs', '10-15 Lakhs', 'Above 15 Lakhs']}
              error={isIncErr}
            />
          </Field>

          <Field label="Mobile Number" required={guardian.isApplicable} error={isMobileErr}>
            <TextField
              placeholder="10 digit mobile"
              disabled={!guardian.isApplicable}
              value={guardian.mobileNo}
              onChange={(val) => update('mobileNo', val)}
              error={isMobileErr}
            />
          </Field>

          <Field label="Office Phone">
            <TextField
              placeholder="STD - Number"
              disabled={!guardian.isApplicable}
              value={guardian.phoneOff}
              onChange={(val) => update('phoneOff', val)}
            />
          </Field>

          <Field label="Residence Phone">
            <TextField
              placeholder="STD - Number"
              disabled={!guardian.isApplicable}
              value={guardian.phoneRes}
              onChange={(val) => update('phoneRes', val)}
            />
          </Field>

          <Field label="Office Address" span={2} required={guardian.isApplicable} error={isAddrErr}>
            <textarea
              rows={2}
              placeholder="Enter office address"
              disabled={!guardian.isApplicable}
              value={guardian.officeAddress}
              onChange={(e) => update('officeAddress', e.target.value)}
              className={`w-full p-2.5 rounded-lg border text-xs focus:outline-none disabled:bg-slate-50 disabled:text-slate-400 ${
                isAddrErr ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200 focus:border-blue-500'
              }`}
            />
          </Field>
        </div>
      </fieldset>

      <div className="flex items-center justify-end gap-3 pt-3">
        {!isReadOnly && (
          <>
            <button
              type="button"
              onClick={onClear}
              className="h-9 px-4 rounded-xl text-xs font-semibold border border-slate-300 text-slate-700 hover:bg-slate-100 transition-all cursor-pointer flex items-center gap-1.5 bg-white"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Clear
            </button>
            <button
              type="button"
              onClick={onSaveAndExit}
              className="h-9 px-4 rounded-xl text-xs font-semibold border border-blue-500 text-[#1677FF] hover:bg-blue-50 transition-all cursor-pointer flex items-center gap-1.5 bg-white"
            >
              <Save className="h-3.5 w-3.5" /> Save & Exit
            </button>
          </>
        )}
        <button
          type="button"
          onClick={isReadOnly ? onSaveAndNext : handleNext}
          className="h-9 px-5 rounded-xl text-xs font-semibold bg-[#1677FF] hover:bg-[#0958D9] text-white shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
        >
          {isReadOnly ? 'Next Step' : 'Save & Next'} <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

