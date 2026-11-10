import React, { useState } from 'react'
import { User, Save, ArrowRight, RotateCcw } from 'lucide-react'
import { toast } from '@/components/ui/toast'
import { Field, TextField, SelectField } from '@/components/FormPrimitives'
import type { GuardianDetailsState } from '../types'
import { useMasterStore } from '@/store/useMasterStore'
import { ApiService } from '@/services/api.service'

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
  const [genderOptions, setGenderOptions] = useState<string[]>([])
  const [isLoadingGenderOptions, setIsLoadingGenderOptions] = useState(true)
  const fetchMasters = useMasterStore((s) => s.fetchMasters)

  React.useEffect(() => {
    fetchMasters()
  }, [fetchMasters])

  React.useEffect(() => {
    let isMounted = true

    const loadGenderOptions = async () => {
      const lookups = await ApiService.getLookups(2)
      if (!isMounted) return

      setGenderOptions(lookups.filter((lookup) => lookup.LookupValue).map((lookup) => lookup.LookupValue))
      setIsLoadingGenderOptions(false)
    }

    void loadGenderOptions()

    return () => {
      isMounted = false
    }
  }, [])

  const rawTitleOptions = useMasterStore((s) => s.titleOptions)
  const titleOptions = React.useMemo(() => {
    const base = rawTitleOptions.length > 0 ? rawTitleOptions : ['Mr', 'Mrs', 'Ms', 'Dr', 'Others']
    const list = [...base]
    if (!list.some((t) => t.toLowerCase() === 'others' || t.toLowerCase() === 'other')) {
      list.push('Others')
    }
    return list
  }, [rawTitleOptions])

  // Restrict Guardian's titles based on selected Gender
  const guardianTitleOptions = React.useMemo(() => {
    const g = (guardian.gender || '').trim().toLowerCase()
    if (g === 'male') {
      return titleOptions.filter((t) => {
        const lower = t.toLowerCase()
        return lower !== 'mrs' && lower !== 'ms' && lower !== 'miss'
      })
    } else if (g === 'female') {
      return titleOptions.filter((t) => {
        const lower = t.toLowerCase()
        return lower !== 'mr'
      })
    }
    return titleOptions
  }, [titleOptions, guardian.gender])

  const incomeRangeOptions = useMasterStore((s) => s.incomeRangeNames)

  const isOther = (val?: string) => Boolean(val && (val.toLowerCase() === 'others' || val.toLowerCase() === 'other' || val.toLowerCase().startsWith('other')))
  const isOtherGender = isOther(guardian.gender)
  const isOtherTitle = isOther(guardian.title)

  const update = (key: keyof GuardianDetailsState, val: any) => {
    setGuardian((prev) => ({ ...prev, [key]: val }))
  }

  const handleGuardianToggle = (applicable: boolean) => {
    if (!applicable) {
      // Clear previously entered values when No is selected (Bug 13)
      setGuardian({
        isApplicable: false,
        reason: '',
        gender: '',
        otherGender: '',
        title: '',
        otherTitle: '',
        initials: '',
        name: '',
        isEmployed: false,
        occupation: '',
        companyName: '',
        monthlyIncome: '',
        officeAddress: '',
        phoneOff: '',
        phoneRes: '',
        mobileNo: '',
      })
      setShowErrors(false)
    } else {
      update('isApplicable', true)
    }
  }

  const isValidMobile = (mobile: string) => /^[6-9]\d{9}$/.test((mobile || '').replace(/\D/g, ''))

  const isInitialsErr = Boolean(guardian.isApplicable && guardian.initials && guardian.initials.length > 5)
  const isReasonErr = showErrors && guardian.isApplicable && !guardian.reason.trim()
  const isGenderErr = showErrors && guardian.isApplicable && !guardian.gender
  const isOtherGenderErr = showErrors && guardian.isApplicable && isOtherGender && !(guardian.otherGender || '').trim()
  const isTitleErr = showErrors && guardian.isApplicable && !guardian.title
  const isOtherTitleErr = showErrors && guardian.isApplicable && isOtherTitle && !(guardian.otherTitle || '').trim()
  const fullNameSpan = (isOtherGender || isOtherTitle) ? 2 : 1
  const isNameErr = showErrors && guardian.isApplicable && !guardian.name.trim()
  const isOccErr = showErrors && guardian.isApplicable && guardian.isEmployed && !guardian.occupation.trim()
  const isCompErr = showErrors && guardian.isApplicable && guardian.isEmployed && !guardian.companyName.trim()
  const isIncErr = showErrors && guardian.isApplicable && guardian.isEmployed && !guardian.monthlyIncome
  const isMobileMissing = showErrors && guardian.isApplicable && !guardian.mobileNo.trim()
  const isMobileInvalid = showErrors && guardian.isApplicable && !!guardian.mobileNo.trim() && !isValidMobile(guardian.mobileNo)
  const isMobileErr = isMobileMissing || isMobileInvalid
  const isAddrErr = showErrors && guardian.isApplicable && guardian.isEmployed && !guardian.officeAddress.trim()

  const validateStep3 = (): boolean => {
    if (guardian.isApplicable) {
      if (guardian.initials && guardian.initials.length > 5) {
        setShowErrors(true)
        toast.error("Guardian's Initials cannot exceed 5 characters.")
        return false
      }
      if (isOtherGender && !(guardian.otherGender || '').trim()) {
        setShowErrors(true)
        toast.error("Please specify Guardian's Gender.")
        return false
      }
      if (isOtherTitle && !(guardian.otherTitle || '').trim()) {
        setShowErrors(true)
        toast.error("Please specify Guardian's Title.")
        return false
      }
      const isMobileValid = isValidMobile(guardian.mobileNo)
      const isValid =
        guardian.reason.trim() &&
        guardian.gender &&
        (!isOtherGender || Boolean(guardian.otherGender?.trim())) &&
        guardian.title &&
        (!isOtherTitle || Boolean(guardian.otherTitle?.trim())) &&
        guardian.name.trim() &&
        (!guardian.isEmployed || (guardian.occupation.trim() && guardian.companyName.trim() && guardian.monthlyIncome && guardian.officeAddress.trim())) &&
        isMobileValid

      if (!isValid) {
        setShowErrors(true)
        if (!isMobileValid) {
          toast.error('Please enter a valid 10-digit mobile number for Guardian.')
        } else {
          toast.error('Please fill in all mandatory fields for Guardian before proceeding.')
        }
        return false
      }
    }
    setShowErrors(false)
    return true
    // onSaveAndNext()
  };
  const handleNext = () => {
    if (!validateStep3()) return
    onSaveAndNext()
  }
  const handleSaveAndExit = () => {
    if (!validateStep3()) return;
    onSaveAndExit();
  };
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
        <Field label="Guardian Details">
          <div className="flex items-center gap-4 text-xs font-medium text-slate-700 mt-1">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="guardianApplicable"
                checked={guardian.isApplicable === true}
                onChange={() => handleGuardianToggle(true)}
                className="text-blue-600 focus:ring-blue-500"
              /> Yes
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="guardianApplicable"
                checked={guardian.isApplicable === false}
                onChange={() => handleGuardianToggle(false)}
                className="text-blue-600 focus:ring-blue-500"
              /> No
            </label>
          </div>
        </Field>

        {/* Conditional Form Inputs */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 transition-all duration-200 ${!guardian.isApplicable ? 'opacity-40 pointer-events-none' : ''
          }`}>
          <Field
            label="Reason for having Guardian"
            span={4}
            required={guardian.isApplicable}
            error={isReasonErr}
            errorText={isReasonErr ? "Reason is required when Guardian is applicable" : undefined}
          >
            <TextField
              placeholder="Enter reason"
              disabled={!guardian.isApplicable}
              value={guardian.reason}
              onChange={(val) => update('reason', val)}
              error={isReasonErr}
            />
          </Field>

          <Field
            label="Guardian's Gender"
            required={guardian.isApplicable}
            error={isGenderErr}
            errorText={isGenderErr ? "Gender is required" : undefined}
          >
            <SelectField
              placeholder="Select gender"
              disabled={!guardian.isApplicable || isLoadingGenderOptions || genderOptions.length === 0}
              value={guardian.gender}
              onChange={(val) => {
                update('gender', val)
                if (!isOther(val)) {
                  update('otherGender', '')
                }
                const g = (val || '').trim().toLowerCase()
                if (g === 'male' && ['mrs', 'ms', 'miss'].includes((guardian.title || '').toLowerCase())) {
                  update('title', '')
                  update('otherTitle', '')
                } else if (g === 'female' && ['mr'].includes((guardian.title || '').toLowerCase())) {
                  update('title', '')
                  update('otherTitle', '')
                }
              }}
              options={genderOptions}
              error={isGenderErr}
            />
          </Field>

          {isOtherGender && (
            <Field
              label="Specify Guardian's Gender"
              required={guardian.isApplicable}
              error={isOtherGenderErr}
              errorText={isOtherGenderErr ? "Specify Gender is required" : undefined}
            >
              <TextField
                placeholder="Enter custom gender"
                disabled={!guardian.isApplicable}
                value={guardian.otherGender || ''}
                onChange={(val) => update('otherGender', val.replace(/[^a-zA-Z\s]/g, ''))}
                error={isOtherGenderErr}
              />
            </Field>
          )}

          <Field
            label="Guardian's Title"
            required={guardian.isApplicable}
            error={isTitleErr}
            errorText={isTitleErr ? "Title is required" : undefined}
          >
            <SelectField
              placeholder="-- Select --"
              disabled={!guardian.isApplicable}
              value={guardian.title}
              onChange={(val) => {
                update('title', val)
                if (!isOther(val)) {
                  update('otherTitle', '')
                }
              }}
              options={guardianTitleOptions}
              error={isTitleErr}
            />
          </Field>

          {isOtherTitle && (
            <Field
              label="Specify Title"
              required={guardian.isApplicable}
              error={isOtherTitleErr}
              errorText={isOtherTitleErr ? "Specify Title is required" : undefined}
            >
              <TextField
                placeholder="Enter custom title"
                disabled={!guardian.isApplicable}
                value={guardian.otherTitle || ''}
                onChange={(val) => update('otherTitle', val.replace(/[^a-zA-Z\s.]/g, ''))}
                error={isOtherTitleErr}
              />
            </Field>
          )}

          <Field
            label="Guardian's Initials"
            error={isInitialsErr}
            errorText={isInitialsErr ? "Initials cannot exceed 5 characters" : undefined}
          >
            <TextField
              placeholder="Guardian's Initials"
              maxLength={5}
              disabled={!guardian.isApplicable}
              value={guardian.initials}
              onChange={(val) => update('initials', val.replace(/[^a-zA-Z\s.]/g, '').toUpperCase().slice(0, 5))}
              error={isInitialsErr}
            />
          </Field>

          <Field
            label="Guardian's Name"
            span={fullNameSpan}
            required={guardian.isApplicable}
            error={isNameErr}
            errorText={isNameErr ? "Guardian Full Name is required" : undefined}
          >
            <TextField
              placeholder="Enter guardian's full name"
              disabled={!guardian.isApplicable}
              maxLength={50}
              value={guardian.name}
              onChange={(val) => update('name', val.replace(/[^a-zA-Z\s.]/g, '').slice(0, 50))}
              error={isNameErr}
            />
          </Field>

          <Field label="Is Guardian Employed?">
            <div className="flex items-center gap-4 text-xs font-medium text-slate-700 mt-1">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="guardianEmployed"
                  disabled={!guardian.isApplicable}
                  checked={guardian.isEmployed === true}
                  onChange={() => update('isEmployed', true)}
                  className="text-blue-600 focus:ring-blue-500"
                /> Yes
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="guardianEmployed"
                  disabled={!guardian.isApplicable}
                  checked={guardian.isEmployed === false}
                  onChange={() => {
                    update('isEmployed', false)
                    update('occupation', '')
                    update('companyName', '')
                    update('monthlyIncome', '')
                    update('phoneOff', '')
                    update('officeAddress', '')
                  }}
                  className="text-blue-600 focus:ring-blue-500"
                /> No
              </label>
            </div>
          </Field>

          <Field
            label="Occupation"
            required={guardian.isApplicable && guardian.isEmployed}
            error={isOccErr}
            errorText={isOccErr ? "Occupation is required when employed" : undefined}
          >
            <TextField
              placeholder="Enter occupation"
              disabled={!guardian.isApplicable || !guardian.isEmployed}
              maxLength={50}
              value={guardian.occupation}
              onChange={(val) => update('occupation', val.replace(/[^a-zA-Z0-9\s]/g, '').slice(0, 50))}
              error={isOccErr}
            />
          </Field>

          <Field
            label="Institution / Company Name"
            required={guardian.isApplicable && guardian.isEmployed}
            error={isCompErr}
            errorText={isCompErr ? "Institution / Company name is required when employed" : undefined}
          >
            <TextField
              placeholder="Enter institution company name"
              disabled={!guardian.isApplicable || !guardian.isEmployed}
              maxLength={50}
              value={guardian.companyName}
              onChange={(val) => update('companyName', val.replace(/[^a-zA-Z0-9\s]/g, '').slice(0, 50))}
              error={isCompErr}
            />
          </Field>

          <Field
            label="Monthly Income (In Rs.)"
            required={guardian.isApplicable && guardian.isEmployed}
            error={isIncErr}
            errorText={isIncErr ? "Monthly Income is required when employed" : undefined}
          >
            <SelectField
              placeholder="-- Select --"
              disabled={!guardian.isApplicable || !guardian.isEmployed}
              value={guardian.monthlyIncome}
              onChange={(val) => update('monthlyIncome', val)}
              options={incomeRangeOptions}
              error={isIncErr}
            />
          </Field>

          <Field
            label="Guardian's Mobile Number"
            required={guardian.isApplicable}
            error={isMobileErr}
            errorText={
              isMobileMissing
                ? "Guardian's mobile number is required"
                : isMobileInvalid
                  ? "Please enter a valid 10-digit mobile number"
                  : undefined
            }
          >
            <TextField
              placeholder="10 digit mobile"
              disabled={!guardian.isApplicable}
              value={guardian.mobileNo}
              onChange={(val) => update('mobileNo', val.replace(/\D/g, '').slice(0, 10))}
              error={isMobileErr}
            />
          </Field>

          <Field label="Guardian's Phone-Off">
            <TextField
              placeholder={!guardian.isApplicable ? "N/A" : !guardian.isEmployed ? "Disabled (Not Employed)" : "Guardian's Phone-Of"}
              disabled={!guardian.isApplicable || !guardian.isEmployed}
              value={guardian.isEmployed ? guardian.phoneOff : ''}
              className={!guardian.isApplicable || !guardian.isEmployed ? "bg-slate-100 text-slate-400 cursor-not-allowed" : ""}
              maxLength={20}
              onChange={(val) => update('phoneOff', val.replace(/\D/g, '').slice(0, 20))}
            />
          </Field>

          <Field label="Guardian's Phone-Res">
            <TextField
              placeholder="Guardian's Phone-Res"
              disabled={!guardian.isApplicable}
              value={guardian.phoneRes}
              maxLength={20}
              onChange={(val) => update('phoneRes', val.replace(/\D/g, '').slice(0, 20))}
            />
          </Field>

          <Field
            label="Office Address"
            span={2}
            required={guardian.isApplicable && guardian.isEmployed}
            error={isAddrErr}
            errorText={isAddrErr ? "Office Address is required when employed" : undefined}
          >
            <textarea
              rows={3}
              maxLength={250}
              placeholder="Enter office address"
              disabled={!guardian.isApplicable || !guardian.isEmployed}
              value={guardian.officeAddress}
              onChange={(e) => update('officeAddress', e.target.value.replace(/[^a-zA-Z0-9\s/.,]/g, '').slice(0, 250))}
              className={`w-full p-2.5 rounded-lg border text-xs focus:outline-none disabled:bg-slate-50 disabled:text-slate-400 min-h-[72px] ${isAddrErr ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200 focus:border-blue-500'
                }`}
            />
            <div className="flex justify-end text-[11px] text-slate-400 mt-0.5">
              {(guardian.officeAddress || '').length}/250
            </div>
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
              onClick={handleSaveAndExit}
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
