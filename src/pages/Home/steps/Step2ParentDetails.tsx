import React, { useState } from 'react'
import { Users, Save, ArrowRight, RotateCcw } from 'lucide-react'
import { toast } from '@/components/ui/toast'
import { Field, TextField, SelectField, DobDateField } from '@/components/FormPrimitives'
import type { FatherDetailsState, MotherDetailsState } from '../types'
import { useMasterStore } from '@/store/useMasterStore'
import { ApiService, type MasterSchool } from '@/services/api.service'

interface Step2ParentDetailsProps {
  father: FatherDetailsState
  setFather: React.Dispatch<React.SetStateAction<FatherDetailsState>>
  mother: MotherDetailsState
  setMother: React.Dispatch<React.SetStateAction<MotherDetailsState>>
  onClear: () => void
  onSaveAndExit: () => void
  onSaveAndNext: () => void
  isReadOnly?: boolean
}

export const normalizeDateIso = (d: string) => {
  if (!d) return ''
  const ddmmyyyy = d.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/)
  if (ddmmyyyy) return `${ddmmyyyy[3]}-${ddmmyyyy[2]}-${ddmmyyyy[1]}`
  return d.slice(0, 10)
}

export const extractBirthYear = (dob?: string): number | null => {
  if (!dob || !dob.trim()) return null
  const iso = normalizeDateIso(dob.trim())
  const match = iso.match(/^(\d{4})/)
  if (match) {
    const yr = parseInt(match[1], 10)
    return isNaN(yr) ? null : yr
  }
  return null
}

export const validateParentDob = (dobStr: string): { isValid: boolean; errorText: string } => {
  if (!dobStr || !dobStr.trim()) {
    return { isValid: false, errorText: 'Date of Birth is required' }
  }
  const iso = normalizeDateIso(dobStr)
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    return { isValid: false, errorText: 'Please enter a valid Date of Birth' }
  }
  const [yStr, mStr, dStr] = iso.split('-')
  const year = parseInt(yStr, 10)
  const month = parseInt(mStr, 10)
  const day = parseInt(dStr, 10)
  const dateObj = new Date(year, month - 1, day)
  if (
    isNaN(dateObj.getTime()) ||
    dateObj.getFullYear() !== year ||
    dateObj.getMonth() !== month - 1 ||
    dateObj.getDate() !== day
  ) {
    return { isValid: false, errorText: 'Invalid Date of Birth' }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (dateObj > today) {
    return { isValid: false, errorText: 'Date of Birth cannot be in the future' }
  }

  if (year < 1920) {
    return { isValid: false, errorText: 'Please enter a valid Date of Birth' }
  }

  // Must be an adult (age >= 18 years, born on or before 2008-12-31)
  if (iso > '2008-12-31') {
    return { isValid: false, errorText: 'Parent must be at least 18 years old' }
  }

  return { isValid: true, errorText: '' }
}

const isOther = (val?: string) => (val || '').trim().toLowerCase().startsWith('other')

const getParentSchoolId = (schools: MasterSchool[], branch: string) => {
  const normalizedBranch = branch.trim().toLowerCase()
  const school = schools.find((item) =>
    [item.School, item.SchoolName, item.SchoolShortName]
      .some((name) => name?.trim().toLowerCase() === normalizedBranch)
  )
  return school?.SchoolID
}

export const Step2ParentDetails: React.FC<Step2ParentDetailsProps> = ({
  father,
  setFather,
  mother,
  setMother,
  onClear,
  onSaveAndExit,
  onSaveAndNext,
  isReadOnly = false,
}) => {
  const [showErrors, setShowErrors] = useState(false)
  const [fatherDobTouched, setFatherDobTouched] = useState(false)
  const [motherDobTouched, setMotherDobTouched] = useState(false)

  const fetchMasters = useMasterStore((s) => s.fetchMasters)

  React.useEffect(() => {
    fetchMasters()
  }, [fetchMasters])

  const rawTitleOptions = useMasterStore((s) => s.titleOptions)
  const titleOptions = React.useMemo(() => {
    const base = rawTitleOptions.length > 0 ? rawTitleOptions : ['Mr', 'Mrs', 'Ms', 'Dr', 'Others']
    const normalized = base.map((title) => (isOther(title) ? 'Others' : title))
    if (!normalized.some((title) => isOther(title))) {
      normalized.push('Others')
    }
    return normalized
  }, [rawTitleOptions])

  // Restrict Father's titles to Male options: Mr, Dr, Others
  const fatherTitleOptions = React.useMemo(() => {
    return titleOptions.filter((t) => {
      const lower = t.toLowerCase()
      return lower !== 'mrs' && lower !== 'ms' && lower !== 'miss'
    })
  }, [titleOptions])

  // Restrict Mother's titles to Female options: Mrs, Ms, Miss, Dr, Others
  const motherTitleOptions = React.useMemo(() => {
    return titleOptions.filter((t) => {
      const lower = t.toLowerCase()
      return lower !== 'mr'
    })
  }, [titleOptions])

  const standardNames = useMasterStore((s) => s.standardNames)
  const parentSchools = useMasterStore((s) => s.parentSchools)
  const [fatherStandardOptions, setFatherStandardOptions] = useState(standardNames)
  const [motherStandardOptions, setMotherStandardOptions] = useState(standardNames)
  const leftYearOptions = useMasterStore((s) => s.leftYearStrings)
  const schoolBranchOptions = useMasterStore((s) => s.parentSchoolNames)
  const alumniBranchOptions = schoolBranchOptions.filter((s) => s.toLowerCase() !== 'others')
  const leavingReasonOptions = useMasterStore((s) => s.leavingReasonOptions)
  const employmentCategoryOptions = useMasterStore((s) => s.employmentCategoryOptions)
  const incomeRangeOptions = useMasterStore((s) => s.incomeRangeNames)

  React.useEffect(() => {
    const schoolId = getParentSchoolId(parentSchools, father.branch)
    let isCurrent = true
    if (schoolId == null) {
      setFatherStandardOptions(standardNames)
      return () => { isCurrent = false }
    }

    setFatherStandardOptions([])
    void ApiService.getStandards(schoolId)
      .then((standards) => {
        if (isCurrent) setFatherStandardOptions(standards.map((standard) => standard.StandardName))
      })
      .catch((error) => {
        console.error(`Failed to fetch standards for father's school ${schoolId}:`, error)
        if (isCurrent) setFatherStandardOptions([])
      })

    return () => { isCurrent = false }
  }, [father.branch, parentSchools, standardNames])

  React.useEffect(() => {
    const schoolId = getParentSchoolId(parentSchools, mother.branch)
    let isCurrent = true
    if (schoolId == null) {
      setMotherStandardOptions(standardNames)
      return () => { isCurrent = false }
    }

    setMotherStandardOptions([])
    void ApiService.getStandards(schoolId)
      .then((standards) => {
        if (isCurrent) setMotherStandardOptions(standards.map((standard) => standard.StandardName))
      })
      .catch((error) => {
        console.error(`Failed to fetch standards for mother's school ${schoolId}:`, error)
        if (isCurrent) setMotherStandardOptions([])
      })

    return () => { isCurrent = false }
  }, [mother.branch, parentSchools, standardNames])

  const updateFather = (key: keyof FatherDetailsState, value: any) => {
    setFather((prev) => ({ ...prev, [key]: value }))
  }

  const updateMother = (key: keyof MotherDetailsState, value: any) => {
    setMother((prev) => ({ ...prev, [key]: value }))
  }

  // Father and Mother birth years extracted from DOB
  const fatherBirthYear = React.useMemo(() => extractBirthYear(father.dob), [father.dob])
  const motherBirthYear = React.useMemo(() => extractBirthYear(mother.dob), [mother.dob])

  // Dynamic Year of Leaving options: birthYear to birthYear + 17 from master leftYearOptions
  const fatherLeavingYearOptions = React.useMemo(() => {
    if (!fatherBirthYear) {
      return leftYearOptions
    }
    const maxYear = fatherBirthYear + 18
    return leftYearOptions.filter((opt) => {
      const yr = parseInt(opt, 10)
      return !isNaN(yr) && yr > fatherBirthYear && yr <= maxYear
    })
  }, [fatherBirthYear, leftYearOptions])

  const motherLeavingYearOptions = React.useMemo(() => {
    if (!motherBirthYear) {
      return leftYearOptions
    }
    const maxYear = motherBirthYear + 18
    return leftYearOptions.filter((opt) => {
      const yr = parseInt(opt, 10)
      return !isNaN(yr) && yr > motherBirthYear && yr <= maxYear
    })
  }, [motherBirthYear, leftYearOptions])

  // Clear previously selected Year of Leaving only if it is not available in newly filtered options
  // Guard preserves valid saved values during asynchronous initialization
  React.useEffect(() => {
    if (!father.isAlumnus || leftYearOptions.length === 0 || !fatherBirthYear || !father.yearOfLeaving) {
      return
    }
    const isSelectedAvailable = fatherLeavingYearOptions.some((opt) => opt.trim() === father.yearOfLeaving.trim())
    if (!isSelectedAvailable) {
      updateFather('yearOfLeaving', '')
    }
  }, [father.isAlumnus, fatherBirthYear, fatherLeavingYearOptions, father.yearOfLeaving, leftYearOptions.length])

  React.useEffect(() => {
    if (!mother.isAlumnus || leftYearOptions.length === 0 || !motherBirthYear || !mother.yearOfLeaving) {
      return
    }
    const isSelectedAvailable = motherLeavingYearOptions.some((opt) => opt.trim() === mother.yearOfLeaving.trim())
    if (!isSelectedAvailable) {
      updateMother('yearOfLeaving', '')
    }
  }, [mother.isAlumnus, motherBirthYear, motherLeavingYearOptions, mother.yearOfLeaving, leftYearOptions.length])

  // 10-digit Indian mobile validation: starts with 6, 7, 8, or 9 and has exactly 10 digits
  const isValidMobile = (mobile: string) => /^[6-9]\d{9}$/.test((mobile || '').replace(/\D/g, ''))

  // Initials error states (maximum 5 characters)
  const fInitialsErr = Boolean(father.initials && father.initials.length > 5)
  const mInitialsErr = Boolean(mother.initials && mother.initials.length > 5)

  // Father field error states
  const isFatherOtherTitle = isOther(father.title)
  const fTitleErr = showErrors && !father.title
  const fOtherTitleErr = showErrors && isFatherOtherTitle && !(father.otherTitle || '').trim()
  const fNameErr = showErrors && !father.name.trim()

  const fDobValidation = validateParentDob(father.dob)
  const isFatherDobErr = (showErrors || fatherDobTouched) && !fDobValidation.isValid
  const fDobErrText = isFatherDobErr ? fDobValidation.errorText : undefined

  // Father Year of Leaving must be between birth year and birth year + 17
  const fDobYear = fatherBirthYear ?? NaN
  const fLeavingYear = father.yearOfLeaving ? parseInt(father.yearOfLeaving, 10) : NaN
  const isFatherLeavingYearInvalid = Boolean(
    father.isAlumnus &&
    father.yearOfLeaving &&
    !isNaN(fDobYear) &&
    !isNaN(fLeavingYear) &&
    (fLeavingYear < fDobYear || fLeavingYear > fDobYear + 17)
  )
  const fYearsErr = showErrors && father.isAlumnus && !father.yearsStudied.trim()
  const fClassErr = showErrors && father.isAlumnus && !father.classLastStudied
  const fYearOfLeavingErr =
    (showErrors && father.isAlumnus && !father.yearOfLeaving) ||
    (showErrors && isFatherLeavingYearInvalid)
  const fYearOfLeavingErrText = (showErrors && father.isAlumnus && !father.yearOfLeaving)
    ? 'Year of leaving is required'
    : isFatherLeavingYearInvalid
      ? (fLeavingYear < fDobYear
        ? 'Year of leaving cannot be earlier than Date of Birth'
        : 'Year of leaving cannot exceed 18 years from Date of Birth')
      : undefined

  const fBranchErr = showErrors && father.isAlumnus && !father.branch

  const isFatherOtherReason = isOther(father.reasonForLeaving)
  const fReasonErr = showErrors && father.isAlumnus && !father.reasonForLeaving
  const fOtherReasonErr =
    showErrors && father.isAlumnus && isFatherOtherReason && !(father.otherReasonForLeaving || '').trim()

  const isFatherOtherEmp = isOther(father.employmentCategory)
  const fOtherEmpErr = showErrors && isFatherOtherEmp && !(father.otherEmploymentCategory || '').trim()

  const fQualErr = showErrors && !father.qualification.trim()
  const fUnivErr = showErrors && !father.university.trim()
  const fDesigErr = showErrors && !father.designation.trim()
  const fIncomeErr = showErrors && !father.monthlyIncome
  const fMobileMissing = showErrors && !father.mobileNo.trim()
  const fMobileInvalid = showErrors && !!father.mobileNo.trim() && !isValidMobile(father.mobileNo)
  const fMobileErr = fMobileMissing || fMobileInvalid

  // Mother field error states
  const isMotherOtherTitle = isOther(mother.title)
  const mTitleErr = showErrors && !mother.title
  const mOtherTitleErr = showErrors && isMotherOtherTitle && !(mother.otherTitle || '').trim()
  const mNameErr = showErrors && !mother.name.trim()

  const mDobValidation = validateParentDob(mother.dob)
  const isMotherDobErr = (showErrors || motherDobTouched) && !mDobValidation.isValid
  const mDobErrText = isMotherDobErr ? mDobValidation.errorText : undefined

  // Mother Year of Leaving must be between birth year and birth year + 17
  const mDobYear = motherBirthYear ?? NaN
  const mLeavingYear = mother.yearOfLeaving ? parseInt(mother.yearOfLeaving, 10) : NaN
  const isMotherLeavingYearInvalid = Boolean(
    mother.isAlumnus &&
    mother.yearOfLeaving &&
    !isNaN(mDobYear) &&
    !isNaN(mLeavingYear) &&
    (mLeavingYear < mDobYear || mLeavingYear > mDobYear + 17)
  )
  const mYearsErr = showErrors && mother.isAlumnus && !mother.yearsStudied.trim()
  const mClassErr = showErrors && mother.isAlumnus && !mother.classLastStudied
  const mYearOfLeavingErr =
    (showErrors && mother.isAlumnus && !mother.yearOfLeaving) ||
    (showErrors && isMotherLeavingYearInvalid)
  const mYearOfLeavingErrText = (showErrors && mother.isAlumnus && !mother.yearOfLeaving)
    ? 'Year of leaving is required'
    : isMotherLeavingYearInvalid
      ? (mLeavingYear < mDobYear
        ? 'Year of leaving cannot be earlier than Date of Birth'
        : 'Year of leaving cannot exceed 18 years from Date of Birth')
      : undefined

  const mBranchErr = showErrors && mother.isAlumnus && !mother.branch

  const isMotherOtherReason = isOther(mother.reasonForLeaving)
  const mReasonErr = showErrors && mother.isAlumnus && !mother.reasonForLeaving
  const mOtherReasonErr =
    showErrors && mother.isAlumnus && isMotherOtherReason && !(mother.otherReasonForLeaving || '').trim()

  const isMotherOtherEmp = isOther(mother.employmentCategory)
  const mOtherEmpErr =
    showErrors && mother.isEmployed && isMotherOtherEmp && !(mother.otherEmploymentCategory || '').trim()

  const mQualErr = showErrors && !mother.qualification.trim()
  const mUnivErr = showErrors && !mother.university.trim()
  const mDesigErr = showErrors && mother.isEmployed && !mother.designation.trim()
  const mIncomeErr = showErrors && mother.isEmployed && !mother.monthlyIncome
  const mMobileMissing = showErrors && !mother.mobileNo.trim()
  const mMobileInvalid = showErrors && !!mother.mobileNo.trim() && !isValidMobile(mother.mobileNo)
  const mMobileErr = mMobileMissing || mMobileInvalid

  const handleNext = () => {
    const isFatherMobileValid = isValidMobile(father.mobileNo)
    const isMotherMobileValid = isValidMobile(mother.mobileNo)
    const isFatherDobValid = fDobValidation.isValid
    const isMotherDobValid = mDobValidation.isValid

    if (father.initials && father.initials.length > 5) {
      setShowErrors(true)
      toast.error("Father's Initials cannot exceed 5 characters.")
      return
    }
    if (mother.initials && mother.initials.length > 5) {
      setShowErrors(true)
      toast.error("Mother's Initials cannot exceed 5 characters.")
      return
    }

    const isFatherValid =
      father.title &&
      (!isFatherOtherTitle || Boolean((father.otherTitle || '').trim())) &&
      father.name.trim() &&
      father.dob &&
      isFatherDobValid &&
      (!father.isAlumnus || (
        father.yearsStudied.trim() &&
        father.classLastStudied &&
        father.yearOfLeaving &&
        !isFatherLeavingYearInvalid &&
        father.branch &&
        father.reasonForLeaving &&
        (!isFatherOtherReason || Boolean((father.otherReasonForLeaving || '').trim()))
      )) &&
      father.qualification.trim() &&
      father.university.trim() &&
      (!isFatherOtherEmp || Boolean((father.otherEmploymentCategory || '').trim())) &&
      father.designation.trim() &&
      father.monthlyIncome &&
      isFatherMobileValid

    const isMotherValid =
      mother.title &&
      (!isMotherOtherTitle || Boolean((mother.otherTitle || '').trim())) &&
      mother.name.trim() &&
      mother.dob &&
      isMotherDobValid &&
      (!mother.isAlumnus || (
        mother.yearsStudied.trim() &&
        mother.classLastStudied &&
        mother.yearOfLeaving &&
        !isMotherLeavingYearInvalid &&
        mother.branch &&
        mother.reasonForLeaving &&
        (!isMotherOtherReason || Boolean((mother.otherReasonForLeaving || '').trim()))
      )) &&
      mother.qualification.trim() &&
      mother.university.trim() &&
      (!mother.isEmployed || (
        (!isMotherOtherEmp || Boolean((mother.otherEmploymentCategory || '').trim())) &&
        mother.designation.trim() &&
        mother.monthlyIncome
      )) &&
      isMotherMobileValid

    if (!isFatherValid || !isMotherValid) {
      setShowErrors(true)
      if (!isFatherDobValid || !isMotherDobValid) {
        toast.error(
          !isFatherDobValid
            ? `Father's ${fDobValidation.errorText}`
            : `Mother's ${mDobValidation.errorText}`
        )
      } else if (isFatherLeavingYearInvalid) {
        toast.error(
          fLeavingYear < fDobYear
            ? "Father's Year of Leaving cannot be earlier than Date of Birth."
            : "Father's Year of Leaving cannot exceed 18 years from Date of Birth."
        )
      } else if (isMotherLeavingYearInvalid) {
        toast.error(
          mLeavingYear < mDobYear
            ? "Mother's Year of Leaving cannot be earlier than Date of Birth."
            : "Mother's Year of Leaving cannot exceed 18 years from Date of Birth."
        )
      } else if (!isFatherMobileValid || !isMotherMobileValid) {
        toast.error('Please enter a valid 10-digit mobile number for Father and Mother.')
      } else {
        toast.error('Please fill in all mandatory fields for Father and Mother before proceeding.')
      }
      return
    }

    setShowErrors(false)
    onSaveAndNext()
  }

  return (
    <div className="space-y-6">
      <fieldset disabled={isReadOnly} className={isReadOnly ? "space-y-6 border-none p-0 m-0 disabled:opacity-95" : "space-y-6 border-none p-0 m-0"}>
        {/* 1. Father's Details Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-sm font-bold text-[#0F294A]">
              <Users className="h-4.5 w-4.5 text-[#1677FF]" />
              <span>Father's Details</span>
            </div>
          </div>

          {/* 4-Column Grid Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Field label="Father's Name Title" required error={fTitleErr} errorText={fTitleErr ? "Title is required" : undefined}>
              <SelectField
                placeholder="-- Select --"
                value={father.title}
                onChange={(val) => {
                  updateFather('title', val)
                  if (!isOther(val)) {
                    updateFather('otherTitle', '')
                  }
                }}
                options={fatherTitleOptions}
                error={fTitleErr}
              />
            </Field>

            {isFatherOtherTitle && (
              <Field label="Specify Title" required error={fOtherTitleErr} errorText={fOtherTitleErr ? "Title is required" : undefined}>
                <TextField
                  placeholder="Enter custom title"
                  value={father.otherTitle || ''}
                  onChange={(val) => updateFather('otherTitle', val)}
                  error={fOtherTitleErr}
                />
              </Field>
            )}

            <Field label="Father's Initials">
              <TextField
                placeholder="Father's Initials"
                maxLength={5}
                value={father.initials}
                onChange={(val) => updateFather('initials', val.replace(/[^a-zA-Z\s.]/g, '').toUpperCase().slice(0, 5))}
                error={fInitialsErr}
              />
            </Field>

            <Field label="Father's Name" required span={isFatherOtherTitle ? 1 : 2} error={fNameErr} errorText={fNameErr ? "Father's Name is required" : undefined}>
              <TextField
                placeholder="Enter father's full name"
                maxLength={50}
                value={father.name}
                onChange={(val) => updateFather('name', val.replace(/[^a-zA-Z\s.]/g, '').slice(0, 50))}
                error={fNameErr}
              />
            </Field>

            <Field
              label="Father's DOB (DD/MM/YYYY)"
              required
              error={isFatherDobErr}
              errorText={fDobErrText}
            >
              <DobDateField
                id="fatherDob"
                placeholder="Select Date of Birth"
                value={father.dob}
                onChange={(val: string) => updateFather('dob', val)}
                onBlur={() => setFatherDobTouched(true)}
                min="1940-01-01"
                max="2008-12-31"
                error={isFatherDobErr}
              />
              {/* <p className="text-[11px] text-slate-500 mt-1 font-medium">To edit, select yyyy/mm/dd again in the same order.</p> */}
            </Field>

            <Field label="Is Father Alumnus of PSBB?">
              <div className="flex items-center gap-4 text-xs font-medium text-slate-700 mt-1">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="fatherAlumnus"
                    checked={father.isAlumnus === true}
                    onChange={() => updateFather('isAlumnus', true)}
                    className="text-blue-600 focus:ring-blue-500"
                  /> Yes
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="fatherAlumnus"
                    checked={father.isAlumnus === false}
                    onChange={() => setFather((previous) => ({
                      ...previous,
                      isAlumnus: false,
                      yearsStudied: '',
                      classLastStudied: '',
                      yearOfLeaving: '',
                      branch: '',
                      reasonForLeaving: '',
                      otherReasonForLeaving: '',
                    }))}
                    className="text-blue-600 focus:ring-blue-500"
                  /> No
                </label>
              </div>
            </Field>

            <Field label="Total No of years studied in PSBB" required={father.isAlumnus} error={fYearsErr} errorText={fYearsErr ? "Years studied is required" : undefined}>
              <TextField
                placeholder="Total years"
                disabled={!father.isAlumnus}
                value={father.yearsStudied}
                onChange={(val) => updateFather('yearsStudied', val.replace(/\D/g, '').slice(0, 2))}
                error={fYearsErr}
              />
            </Field>

            <Field label="Year of Leaving" required={father.isAlumnus} error={fYearOfLeavingErr} errorText={fYearOfLeavingErrText}>
              <SelectField
                placeholder="-- Select --"
                disabled={!father.isAlumnus}
                value={father.yearOfLeaving}
                onChange={(val) => updateFather('yearOfLeaving', val)}
                options={fatherLeavingYearOptions}
                error={fYearOfLeavingErr}
              />
            </Field>

            <Field label="Branch" required={father.isAlumnus} error={fBranchErr} errorText={fBranchErr ? "Branch is required" : undefined}>
              <SelectField
                placeholder="-- Select --"
                disabled={!father.isAlumnus}
                value={father.branch}
                onChange={(val) => {
                  setFather((previous) => previous.branch === val
                    ? previous
                    : { ...previous, branch: val, classLastStudied: '' })
                }}
                options={alumniBranchOptions}
                error={fBranchErr}
              />
            </Field>

            <Field label="Class Last Studied" required={father.isAlumnus} error={fClassErr} errorText={fClassErr ? "Class is required" : undefined}>
              <SelectField
                placeholder="-- Select --"
                disabled={!father.isAlumnus || !father.branch.trim()}
                value={father.classLastStudied}
                onChange={(val) => updateFather('classLastStudied', val)}
                options={fatherStandardOptions}
                error={fClassErr}
              />
            </Field>

            <Field label="Reason for Leaving" required={father.isAlumnus} error={fReasonErr} errorText={fReasonErr ? "Reason for leaving is required" : undefined}>
              <SelectField
                placeholder="-- Select --"
                disabled={!father.isAlumnus}
                value={father.reasonForLeaving}
                onChange={(val) => {
                  updateFather('reasonForLeaving', val)
                  if (!isOther(val)) {
                    updateFather('otherReasonForLeaving', '')
                  }
                }}
                options={leavingReasonOptions}
                error={fReasonErr}
              />
            </Field>

            {father.isAlumnus && isFatherOtherReason && (
              <Field
                label="Specify Reason for Leaving"
                required
                error={fOtherReasonErr}
                errorText={fOtherReasonErr ? "Please specify reason for leaving" : undefined}
              >
                <TextField
                  placeholder="Enter reason for leaving"
                  disabled={!father.isAlumnus}
                  value={father.otherReasonForLeaving || ''}
                  onChange={(val) => updateFather('otherReasonForLeaving', val.replace(/[^a-zA-Z0-9\s]/g, ''))}
                  error={fOtherReasonErr}
                />
              </Field>
            )}

            <Field label="Father's Educational Qualification" required error={fQualErr} errorText={fQualErr ? "Qualification is required" : undefined}>
              <TextField
                placeholder="e.g. B.Tech / M.B.A"
                maxLength={50}
                value={father.qualification}
                onChange={(val) => updateFather('qualification', val.replace(/[^a-zA-Z0-9\s.,\-/()&']/g, '').slice(0, 50))}
                error={fQualErr}
              />
            </Field>

            <Field label="University / Institution" required error={fUnivErr} errorText={fUnivErr ? "University is required" : undefined}>
              <TextField
                placeholder="Enter university"
                maxLength={50}
                value={father.university}
                onChange={(val) => updateFather('university', val.replace(/[^a-zA-Z0-9\s]/g, '').slice(0, 50))}
                error={fUnivErr}
              />
            </Field>

            <Field label="Father's Occupation">
              <TextField
                placeholder="Enter occupation"
                maxLength={50}
                value={father.occupation}
                onChange={(val) => updateFather('occupation', val.replace(/[^a-zA-Z0-9\s]/g, '').slice(0, 50))}
              />
            </Field>

            <Field label="Father's  Employment Category">
              <SelectField
                placeholder="-- Select --"
                value={father.employmentCategory}
                onChange={(val) => {
                  updateFather('employmentCategory', val)
                  if (!isOther(val)) {
                    updateFather('otherEmploymentCategory', '')
                  }
                }}
                options={employmentCategoryOptions}
              />
            </Field>

            {isFatherOtherEmp && (
              <Field
                label="Specify Father's Employment Category"
                required
                error={fOtherEmpErr}
                errorText={fOtherEmpErr ? "Please specify employment category" : undefined}
              >
                <TextField
                  placeholder="Enter Mothers's employment category"
                  value={father.otherEmploymentCategory || ''}
                  onChange={(val) => updateFather('otherEmploymentCategory', val)}
                  error={fOtherEmpErr}
                />
              </Field>
            )}

            <Field label="Designation" required error={fDesigErr} errorText={fDesigErr ? "Designation is required" : undefined}>
              <TextField
                placeholder="Enter designation"
                value={father.designation}
                onChange={(val) => updateFather('designation', val.replace(/[^a-zA-Z0-9\s]/g, ''))}
                error={fDesigErr}
              />
            </Field>

            <Field label="Institution / Company Name">
              <TextField
                placeholder="Enter institution company name"
                maxLength={50}
                value={father.companyName}
                onChange={(val) => updateFather('companyName', val.replace(/[^a-zA-Z0-9\s]/g, '').slice(0, 50))}
              />
            </Field>

            <Field label="Monthly Income (Rs.)" required error={fIncomeErr} errorText={fIncomeErr ? "Monthly Income is required" : undefined}>
              <SelectField
                placeholder="-- Select --"
                value={father.monthlyIncome}
                onChange={(val) => updateFather('monthlyIncome', val)}
                options={incomeRangeOptions}
                error={fIncomeErr}
              />
            </Field>

            <Field label="Phone No-Off">
              <TextField
                placeholder="Office phone"
                value={father.phoneOff}
                maxLength={20}
                onChange={(val) => updateFather('phoneOff', val.replace(/\D/g, '').slice(0, 20))}
              />
            </Field>

            <Field
              label="Mobile No"
              required
              error={fMobileErr}
              errorText={
                fMobileMissing
                  ? "Mobile number is required"
                  : fMobileInvalid
                    ? "Please enter a valid 10-digit mobile number"
                    : undefined
              }
            >
              <TextField
                placeholder="10-digit mobile number"
                value={father.mobileNo}
                onChange={(val) => updateFather('mobileNo', val.replace(/\D/g, '').slice(0, 10))}
                error={fMobileErr}
              />
            </Field>

            <Field label="Father's Office Address" span={2}>
              <textarea
                rows={3}
                maxLength={250}
                placeholder="Enter office address"
                value={father.officeAddress}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^a-zA-Z0-9\s/.,]/g, '').slice(0, 250);
                  updateFather('officeAddress', value);
                }}
                className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-blue-500 min-h-[72px]"
              />
              <div className="flex justify-end text-[11px] text-slate-400 mt-0.5">
                {(father.officeAddress || '').length}/250
              </div>
            </Field>
          </div>
        </div>

        {/* 2. Mother's Details Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-sm font-bold text-[#0F294A]">
              <Users className="h-4.5 w-4.5 text-[#1677FF]" />
              <span>Mother's Details</span>
            </div>
          </div>

          {/* 4-Column Grid Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Field label="Mother's Name Title" required error={mTitleErr} errorText={mTitleErr ? "Title is required" : undefined}>
              <SelectField
                placeholder="-- Select --"
                value={mother.title}
                onChange={(val) => {
                  updateMother('title', val)
                  if (!isOther(val)) {
                    updateMother('otherTitle', '')
                  }
                }}
                options={motherTitleOptions}
                error={mTitleErr}
              />
            </Field>

            {isMotherOtherTitle && (
              <Field label="Specify Title" required error={mOtherTitleErr} errorText={mOtherTitleErr ? "Title is required" : undefined}>
                <TextField
                  placeholder="Enter custom title"
                  value={mother.otherTitle || ''}
                  onChange={(val) => updateMother('otherTitle', val)}
                  error={mOtherTitleErr}
                />
              </Field>
            )}

            <Field label="Mother's Initials">
              <TextField
                placeholder="Mother's Initials"
                maxLength={5}
                value={mother.initials}
                onChange={(val) => updateMother('initials', val.replace(/[^a-zA-Z\s.]/g, '').toUpperCase().slice(0, 5))}
                error={mInitialsErr}
              />
            </Field>

            <Field label="Mother's Name" required span={isMotherOtherTitle ? 1 : 2} error={mNameErr} errorText={mNameErr ? "Mother's Name is required" : undefined}>
              <TextField
                placeholder="Enter mother's full name"
                maxLength={50}
                value={mother.name}
                onChange={(val) => updateMother('name', val.replace(/[^a-zA-Z\s.]/g, '').slice(0, 50))}
                error={mNameErr}
              />
            </Field>

            <Field
              label="Mother's DOB (DD/MM/YYYY)"
              required
              error={isMotherDobErr}
              errorText={mDobErrText}
            >
              <DobDateField
                id="motherDob"
                placeholder="Select Date of Birth"
                value={mother.dob}
                onChange={(val: string) => updateMother('dob', val)}
                onBlur={() => setMotherDobTouched(true)}
                min="1940-01-01"
                max="2008-12-31"
                error={isMotherDobErr}
              />
              {/* <p className="text-[11px] text-slate-500 mt-1 font-medium">To edit, select yyyy/mm/dd again in the same order.</p> */}
            </Field>

            <Field label="Is Mother Alumnus of PSBB?">
              <div className="flex items-center gap-4 text-xs font-medium text-slate-700 mt-1">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="motherAlumnus"
                    checked={mother.isAlumnus === true}
                    onChange={() => updateMother('isAlumnus', true)}
                    className="text-blue-600 focus:ring-blue-500"
                  /> Yes
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="motherAlumnus"
                    checked={mother.isAlumnus === false}
                    onChange={() => setMother((previous) => ({
                      ...previous,
                      isAlumnus: false,
                      yearsStudied: '',
                      classLastStudied: '',
                      yearOfLeaving: '',
                      branch: '',
                      reasonForLeaving: '',
                      otherReasonForLeaving: '',
                    }))}
                    className="text-blue-600 focus:ring-blue-500"
                  /> No
                </label>
              </div>
            </Field>

            <Field label="Total No of years studied in PSBB" required={mother.isAlumnus} error={mYearsErr} errorText={mYearsErr ? "Years studied is required" : undefined}>
              <TextField
                placeholder="Total years"
                disabled={!mother.isAlumnus}
                value={mother.yearsStudied}
                onChange={(val) => updateMother('yearsStudied', val.replace(/\D/g, '').slice(0, 2))}
                error={mYearsErr}
              />
            </Field>

            <Field label="Year of Leaving" required={mother.isAlumnus} error={mYearOfLeavingErr} errorText={mYearOfLeavingErrText}>
              <SelectField
                placeholder="-- Select --"
                disabled={!mother.isAlumnus}
                value={mother.yearOfLeaving}
                onChange={(val) => updateMother('yearOfLeaving', val)}
                options={motherLeavingYearOptions}
                error={mYearOfLeavingErr}
              />
            </Field>

            <Field label="Branch" required={mother.isAlumnus} error={mBranchErr} errorText={mBranchErr ? "Branch is required" : undefined}>
              <SelectField
                placeholder="-- Select --"
                disabled={!mother.isAlumnus}
                value={mother.branch}
                onChange={(val) => {
                  setMother((previous) => previous.branch === val
                    ? previous
                    : { ...previous, branch: val, classLastStudied: '' })
                }}
                options={alumniBranchOptions}
                error={mBranchErr}
              />
            </Field>

            <Field label="Class Last Studied" required={mother.isAlumnus} error={mClassErr} errorText={mClassErr ? "Class is required" : undefined}>
              <SelectField
                placeholder="-- Select --"
                disabled={!mother.isAlumnus || !mother.branch.trim()}
                value={mother.classLastStudied}
                onChange={(val) => updateMother('classLastStudied', val)}
                options={motherStandardOptions}
                error={mClassErr}
              />
            </Field>

            <Field label="Reason for Leaving" required={mother.isAlumnus} error={mReasonErr} errorText={mReasonErr ? "Reason for leaving is required" : undefined}>
              <SelectField
                placeholder="-- Select --"
                disabled={!mother.isAlumnus}
                value={mother.reasonForLeaving}
                onChange={(val) => {
                  updateMother('reasonForLeaving', val)
                  if (!isOther(val)) {
                    updateMother('otherReasonForLeaving', '')
                  }
                }}
                options={leavingReasonOptions}
                error={mReasonErr}
              />
            </Field>

            {mother.isAlumnus && isMotherOtherReason && (
              <Field
                label="Specify Reason for Leaving"
                required
                error={mOtherReasonErr}
                errorText={mOtherReasonErr ? "Please specify reason for leaving" : undefined}
              >
                <TextField
                  placeholder="Enter reason for leaving"
                  disabled={!mother.isAlumnus}
                  value={mother.otherReasonForLeaving || ''}
                  onChange={(val) => updateMother('otherReasonForLeaving', val.replace(/[^a-zA-Z0-9\s]/g, ''))}
                  error={mOtherReasonErr}
                />
              </Field>
            )}

            <Field label="Mother's Educational Qualification" required error={mQualErr} errorText={mQualErr ? "Qualification is required" : undefined}>
              <TextField
                placeholder="e.g. M.Sc / B.Ed"
                maxLength={50}
                value={mother.qualification}
                onChange={(val) => updateMother('qualification', val.replace(/[^a-zA-Z0-9\s.,\-/()&']/g, '').slice(0, 50))}
                error={mQualErr}
              />
            </Field>

            <Field
              label="University / Institution"
              required
              error={mUnivErr}
              errorText={mUnivErr ? "University / Institution is required" : undefined}
            >
              <TextField
                placeholder="Enter university / institution"
                maxLength={50}
                value={mother.university}
                onChange={(val) => updateMother('university', val.replace(/[^a-zA-Z0-9\s]/g, '').slice(0, 50))}
                error={mUnivErr}
              />
            </Field>

            <Field label="Is Mother Employed?">
              <div className="flex items-center gap-4 text-xs font-medium text-slate-700 mt-1">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="motherEmployed"
                    checked={mother.isEmployed === true}
                    onChange={() => updateMother('isEmployed', true)}
                    className="text-blue-600 focus:ring-blue-500"
                  /> Yes
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="motherEmployed"
                    checked={mother.isEmployed === false}
                    onChange={() => {
                      updateMother('isEmployed', false)
                      updateMother('occupation', '')
                      updateMother('employmentCategory', '')
                      updateMother('otherEmploymentCategory', '')
                      updateMother('designation', '')
                      updateMother('companyName', '')
                      updateMother('monthlyIncome', '')
                      updateMother('officeAddress', '')
                      updateMother('phoneOff', '')
                    }}
                    className="text-blue-600 focus:ring-blue-500"
                  /> No
                </label>
              </div>
            </Field>

            <Field label="Mother's Occupation">
              <TextField
                placeholder="Enter occupation"
                disabled={!mother.isEmployed}
                maxLength={50}
                value={mother.occupation}
                onChange={(val) => updateMother('occupation', val.replace(/[^a-zA-Z0-9\s]/g, '').slice(0, 50))}
              />
            </Field>

            <Field label="Mothers's Employment Category">
              <SelectField
                placeholder="-- Select --"
                disabled={!mother.isEmployed}
                value={mother.employmentCategory}
                onChange={(val) => {
                  updateMother('employmentCategory', val)
                  if (!isOther(val)) {
                    updateMother('otherEmploymentCategory', '')
                  }
                }}
                options={employmentCategoryOptions}
              />
            </Field>

            {mother.isEmployed && isMotherOtherEmp && (
              <Field
                label="Specify Mothers's Employment Category"
                required={mother.isEmployed}
                error={mOtherEmpErr}
                errorText={mOtherEmpErr ? "Please specify employment category" : undefined}
              >
                <TextField
                  placeholder="Enter employment category"
                  disabled={!mother.isEmployed}
                  value={mother.otherEmploymentCategory || ''}
                  onChange={(val) => updateMother('otherEmploymentCategory', val)}
                  error={mOtherEmpErr}
                />
              </Field>
            )}

            <Field label="Designation" required={mother.isEmployed} error={mDesigErr} errorText={mDesigErr ? "Designation is required when employed" : undefined}>
              <TextField
                placeholder="Enter designation"
                disabled={!mother.isEmployed}
                value={mother.designation}
                onChange={(val) => updateMother('designation', val.replace(/[^a-zA-Z0-9\s]/g, ''))}
                error={mDesigErr}
              />
            </Field>

            <Field label="Institution / Company Name">
              <TextField
                placeholder="Enter institution company name"
                disabled={!mother.isEmployed}
                maxLength={50}
                value={mother.companyName}
                onChange={(val) => updateMother('companyName', val.replace(/[^a-zA-Z0-9\s]/g, '').slice(0, 50))}
              />
            </Field>

            <Field label="Monthly Income (Rs.)" required={mother.isEmployed} error={mIncomeErr} errorText={mIncomeErr ? "Monthly Income is required when employed" : undefined}>
              <SelectField
                placeholder="-- Select --"
                disabled={!mother.isEmployed}
                value={mother.monthlyIncome}
                onChange={(val) => updateMother('monthlyIncome', val)}
                options={incomeRangeOptions}
                error={mIncomeErr}
              />
            </Field>

            <Field label="Phone No-Off">
              <TextField
                placeholder={mother.isEmployed ? "Office phone" : "Disabled (Not Employed)"}
                disabled={!mother.isEmployed}
                value={mother.isEmployed ? mother.phoneOff : ''}
                className={!mother.isEmployed ? "bg-slate-100 text-slate-400 cursor-not-allowed" : ""}
                maxLength={20}
                onChange={(val) => updateMother('phoneOff', val.replace(/\D/g, '').slice(0, 20))}
              />
            </Field>

            <Field
              label="Mobile No"
              required
              error={mMobileErr}
              errorText={
                mMobileMissing
                  ? "Mobile number is required"
                  : mMobileInvalid
                    ? "Please enter a valid 10-digit mobile number"
                    : undefined
              }
            >
              <TextField
                placeholder="10-digit mobile number"
                value={mother.mobileNo}
                onChange={(val) => updateMother('mobileNo', val.replace(/\D/g, '').slice(0, 10))}
                error={mMobileErr}
              />
            </Field>

            <Field label="Mother's Office Address" span={2}>
              <textarea
                rows={3}
                maxLength={250}
                placeholder="Enter office address"
                disabled={!mother.isEmployed}
                value={mother.officeAddress}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^a-zA-Z0-9\s/.,]/g, '').slice(0, 250);
                  updateMother('officeAddress', value);
                }}
                className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-400 min-h-[72px]"
              />
              <div className="flex justify-end text-[11px] text-slate-400 mt-0.5">
                {(mother.officeAddress || '').length}/250
              </div>
            </Field>
          </div>
        </div>
      </fieldset>

      {/* Bottom Actions */}
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
