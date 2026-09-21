import React, { useState } from 'react'
import { Users, UserCheck, Save, ArrowRight, RotateCcw } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from '@/components/ui/toast'
import { Field, TextField, SelectField, DobDateField } from '@/components/FormPrimitives'
import type { FatherDetailsState, MotherDetailsState } from '../types'

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

const parseDate = (val?: string) => {
  if (!val) return undefined
  const d = new Date(val)
  return isNaN(d.getTime()) ? undefined : d
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

  const updateFather = (key: keyof FatherDetailsState, value: any) => {
    setFather((prev) => ({ ...prev, [key]: value }))
  }

  const updateMother = (key: keyof MotherDetailsState, value: any) => {
    setMother((prev) => ({ ...prev, [key]: value }))
  }

  // Father field error states
  const fTitleErr = showErrors && !father.title
  const fNameErr = showErrors && !father.name.trim()
  const fDobErr = showErrors && !father.dob
  const fYearsErr = showErrors && father.isAlumnus && !father.yearsStudied.trim()
  const fClassErr = showErrors && father.isAlumnus && !father.classLastStudied
  const fYearOfLeavingErr = showErrors && father.isAlumnus && !father.yearOfLeaving
  const fBranchErr = showErrors && father.isAlumnus && !father.branch
  const fReasonErr = showErrors && father.isAlumnus && !father.reasonForLeaving
  const fQualErr = showErrors && !father.qualification.trim()
  const fUnivErr = showErrors && !father.university.trim()
  const fDesigErr = showErrors && !father.designation.trim()
  const fIncomeErr = showErrors && !father.monthlyIncome
  const fMobileErr = showErrors && !father.mobileNo.trim()

  // Mother field error states
  const mTitleErr = showErrors && !mother.title
  const mNameErr = showErrors && !mother.name.trim()
  const mDobErr = showErrors && !mother.dob
  const mYearsErr = showErrors && mother.isAlumnus && !mother.yearsStudied.trim()
  const mClassErr = showErrors && mother.isAlumnus && !mother.classLastStudied
  const mYearOfLeavingErr = showErrors && mother.isAlumnus && !mother.yearOfLeaving
  const mBranchErr = showErrors && mother.isAlumnus && !mother.branch
  const mReasonErr = showErrors && mother.isAlumnus && !mother.reasonForLeaving
  const mQualErr = showErrors && !mother.qualification.trim()
  const mUnivErr = showErrors && !mother.university.trim()
  const mDesigErr = showErrors && mother.isEmployed && !mother.designation.trim()
  const mIncomeErr = showErrors && mother.isEmployed && !mother.monthlyIncome
  const mMobileErr = showErrors && !mother.mobileNo.trim()

  const handleNext = () => {
    const isFatherValid =
      father.title &&
      father.name.trim() &&
      father.dob &&
      (!father.isAlumnus || (father.yearsStudied.trim() && father.classLastStudied && father.yearOfLeaving && father.branch && father.reasonForLeaving)) &&
      father.qualification.trim() &&
      father.university.trim() &&
      father.designation.trim() &&
      father.monthlyIncome &&
      father.mobileNo.trim()

    const isMotherValid =
      mother.title &&
      mother.name.trim() &&
      mother.dob &&
      (!mother.isAlumnus || (mother.yearsStudied.trim() && mother.classLastStudied && mother.yearOfLeaving && mother.branch && mother.reasonForLeaving)) &&
      mother.qualification.trim() &&
      mother.university.trim() &&
      (!mother.isEmployed || (mother.designation.trim() && mother.monthlyIncome)) &&
      mother.mobileNo.trim()

    if (!isFatherValid || !isMotherValid) {
      setShowErrors(true)
      toast.error('Please fill in all mandatory fields for Father and Mother before proceeding.')
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
          <Field label="Father's Name Title" required error={fTitleErr}>
            <SelectField
              placeholder="-- Select --"
              value={father.title}
              onChange={(val) => updateFather('title', val)}
              options={['Mr.', 'Dr.', 'Prof.', 'Capt.']}
              error={fTitleErr}
            />
          </Field>

          <Field label="Father's Initials">
            <TextField
              placeholder="Enter initials"
              value={father.initials}
              onChange={(val) => updateFather('initials', val)}
            />
          </Field>

          <Field label="Father's Name" required span={2} error={fNameErr}>
            <TextField
              placeholder="Enter father's full name"
              value={father.name}
              onChange={(val) => updateFather('name', val)}
              error={fNameErr}
            />
          </Field>

          <Field label="Father's DOB" required error={fDobErr}>
            <DobDateField
              placeholder="Select Date of Birth"
              value={parseDate(father.dob)}
              onChange={(d) => updateFather('dob', d ? format(d, 'yyyy-MM-dd') : '')}
              error={fDobErr}
            />
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
                  onChange={() => updateFather('isAlumnus', false)}
                  className="text-blue-600 focus:ring-blue-500"
                /> No
              </label>
            </div>
          </Field>

          <Field label="Years Studied in PSBB" required={father.isAlumnus} error={fYearsErr}>
            <TextField
              placeholder="Total years"
              disabled={!father.isAlumnus}
              value={father.yearsStudied}
              onChange={(val) => updateFather('yearsStudied', val)}
              error={fYearsErr}
            />
          </Field>

          <Field label="Class Last Studied" required={father.isAlumnus} error={fClassErr}>
            <SelectField
              placeholder="-- Select --"
              disabled={!father.isAlumnus}
              value={father.classLastStudied}
              onChange={(val) => updateFather('classLastStudied', val)}
              options={['Class X', 'Class XII']}
              error={fClassErr}
            />
          </Field>

          <Field label="Year of Leaving" required={father.isAlumnus} error={fYearOfLeavingErr}>
            <SelectField
              placeholder="-- Select --"
              disabled={!father.isAlumnus}
              value={father.yearOfLeaving}
              onChange={(val) => updateFather('yearOfLeaving', val)}
              options={['2000', '2005', '2010']}
              error={fYearOfLeavingErr}
            />
          </Field>

          <Field label="Branch" required={father.isAlumnus} error={fBranchErr}>
            <SelectField
              placeholder="-- Select --"
              disabled={!father.isAlumnus}
              value={father.branch}
              onChange={(val) => updateFather('branch', val)}
              options={['T. Nagar', 'KK Nagar', 'Nungambakkam']}
              error={fBranchErr}
            />
          </Field>

          <Field label="Reason for Leaving" required={father.isAlumnus} error={fReasonErr}>
            <SelectField
              placeholder="-- Select --"
              disabled={!father.isAlumnus}
              value={father.reasonForLeaving}
              onChange={(val) => updateFather('reasonForLeaving', val)}
              options={['Completed Schooling', 'Parent Relocation']}
              error={fReasonErr}
            />
          </Field>

          <Field label="Educational Qualification" required error={fQualErr}>
            <TextField
              placeholder="e.g. B.Tech / M.B.A"
              value={father.qualification}
              onChange={(val) => updateFather('qualification', val)}
              error={fQualErr}
            />
          </Field>

          <Field label="University / Institution" required error={fUnivErr}>
            <TextField
              placeholder="Enter university"
              value={father.university}
              onChange={(val) => updateFather('university', val)}
              error={fUnivErr}
            />
          </Field>

          <Field label="Father's Occupation">
            <TextField
              placeholder="Enter occupation"
              value={father.occupation}
              onChange={(val) => updateFather('occupation', val)}
            />
          </Field>

          <Field label="Employment Category">
            <SelectField
              placeholder="-- Select --"
              value={father.employmentCategory}
              onChange={(val) => updateFather('employmentCategory', val)}
              options={['Private Sector', 'Government', 'Self Employed', 'Business']}
            />
          </Field>

          <Field label="Designation" required error={fDesigErr}>
            <TextField
              placeholder="Enter designation"
              value={father.designation}
              onChange={(val) => updateFather('designation', val)}
              error={fDesigErr}
            />
          </Field>

          <Field label="Company Name">
            <TextField
              placeholder="Enter company name"
              value={father.companyName}
              onChange={(val) => updateFather('companyName', val)}
            />
          </Field>

          <Field label="Monthly Income (Rs.)" required error={fIncomeErr}>
            <SelectField
              placeholder="-- Select --"
              value={father.monthlyIncome}
              onChange={(val) => updateFather('monthlyIncome', val)}
              options={['Below 50,000', '50,000 - 1,00,000', 'Above 1,00,000']}
              error={fIncomeErr}
            />
          </Field>

          <Field label="Phone No-Off">
            <TextField
              placeholder="Office phone"
              value={father.phoneOff}
              onChange={(val) => updateFather('phoneOff', val)}
            />
          </Field>

          <Field label="Mobile No" required error={fMobileErr}>
            <TextField
              placeholder="Mobile number"
              value={father.mobileNo}
              onChange={(val) => updateFather('mobileNo', val)}
              error={fMobileErr}
            />
          </Field>

          <Field label="Father's Office Address" span={2}>
            <textarea
              rows={2}
              placeholder="Enter office address"
              value={father.officeAddress}
              onChange={(e) => updateFather('officeAddress', e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
            />
          </Field>
        </div>
      </div>

      {/* 2. Mother's Details Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-sm font-bold text-[#0F294A]">
            <UserCheck className="h-4.5 w-4.5 text-purple-600" />
            <span>Mother's Details</span>
          </div>
        </div>

        {/* 4-Column Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Field label="Mother's Name Title" required error={mTitleErr}>
            <SelectField
              placeholder="-- Select --"
              value={mother.title}
              onChange={(val) => updateMother('title', val)}
              options={['Mrs.', 'Dr.', 'Prof.']}
              error={mTitleErr}
            />
          </Field>

          <Field label="Mother's Initials">
            <TextField
              placeholder="Enter initials"
              value={mother.initials}
              onChange={(val) => updateMother('initials', val)}
            />
          </Field>

          <Field label="Mother's Name" required span={2} error={mNameErr}>
            <TextField
              placeholder="Enter mother's full name"
              value={mother.name}
              onChange={(val) => updateMother('name', val)}
              error={mNameErr}
            />
          </Field>

          <Field label="Mother's DOB" required error={mDobErr}>
            <DobDateField
              placeholder="Select Date of Birth"
              value={parseDate(mother.dob)}
              onChange={(d) => updateMother('dob', d ? format(d, 'yyyy-MM-dd') : '')}
              error={mDobErr}
            />
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
                  onChange={() => updateMother('isAlumnus', false)}
                  className="text-blue-600 focus:ring-blue-500"
                /> No
              </label>
            </div>
          </Field>

          <Field label="Years Studied in PSBB" required={mother.isAlumnus} error={mYearsErr}>
            <TextField
              placeholder="Total years"
              disabled={!mother.isAlumnus}
              value={mother.yearsStudied}
              onChange={(val) => updateMother('yearsStudied', val)}
              error={mYearsErr}
            />
          </Field>

          <Field label="Class Last Studied" required={mother.isAlumnus} error={mClassErr}>
            <SelectField
              placeholder="-- Select --"
              disabled={!mother.isAlumnus}
              value={mother.classLastStudied}
              onChange={(val) => updateMother('classLastStudied', val)}
              options={['Class X', 'Class XII']}
              error={mClassErr}
            />
          </Field>

          <Field label="Year of Leaving" required={mother.isAlumnus} error={mYearOfLeavingErr}>
            <SelectField
              placeholder="-- Select --"
              disabled={!mother.isAlumnus}
              value={mother.yearOfLeaving}
              onChange={(val) => updateMother('yearOfLeaving', val)}
              options={['2000', '2005', '2010']}
              error={mYearOfLeavingErr}
            />
          </Field>

          <Field label="Branch" required={mother.isAlumnus} error={mBranchErr}>
            <SelectField
              placeholder="-- Select --"
              disabled={!mother.isAlumnus}
              value={mother.branch}
              onChange={(val) => updateMother('branch', val)}
              options={['T. Nagar', 'KK Nagar', 'Nungambakkam']}
              error={mBranchErr}
            />
          </Field>

          <Field label="Reason for Leaving" required={mother.isAlumnus} error={mReasonErr}>
            <SelectField
              placeholder="-- Select --"
              disabled={!mother.isAlumnus}
              value={mother.reasonForLeaving}
              onChange={(val) => updateMother('reasonForLeaving', val)}
              options={['Completed Schooling', 'Parent Relocation']}
              error={mReasonErr}
            />
          </Field>

          <Field label="Educational Qualification" required error={mQualErr}>
            <TextField
              placeholder="e.g. M.Sc / B.Ed"
              value={mother.qualification}
              onChange={(val) => updateMother('qualification', val)}
              error={mQualErr}
            />
          </Field>

          <Field label="University / Institution" required error={mUnivErr}>
            <TextField
              placeholder="Enter university"
              value={mother.university}
              onChange={(val) => updateMother('university', val)}
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
                  onChange={() => updateMother('isEmployed', false)}
                  className="text-blue-600 focus:ring-blue-500"
                /> No
              </label>
            </div>
          </Field>

          <Field label="Mother's Occupation">
            <TextField
              placeholder="Enter occupation"
              disabled={!mother.isEmployed}
              value={mother.occupation}
              onChange={(val) => updateMother('occupation', val)}
            />
          </Field>

          <Field label="Employment Category">
            <SelectField
              placeholder="-- Select --"
              disabled={!mother.isEmployed}
              value={mother.employmentCategory}
              onChange={(val) => updateMother('employmentCategory', val)}
              options={['Private Sector', 'Government', 'Self Employed', 'Home Maker']}
            />
          </Field>

          <Field label="Designation" required={mother.isEmployed} error={mDesigErr}>
            <TextField
              placeholder="Enter designation"
              disabled={!mother.isEmployed}
              value={mother.designation}
              onChange={(val) => updateMother('designation', val)}
              error={mDesigErr}
            />
          </Field>

          <Field label="Company Name">
            <TextField
              placeholder="Enter company name"
              disabled={!mother.isEmployed}
              value={mother.companyName}
              onChange={(val) => updateMother('companyName', val)}
            />
          </Field>

          <Field label="Monthly Income (Rs.)" required={mother.isEmployed} error={mIncomeErr}>
            <SelectField
              placeholder="-- Select --"
              disabled={!mother.isEmployed}
              value={mother.monthlyIncome}
              onChange={(val) => updateMother('monthlyIncome', val)}
              options={['Below 50,000', '50,000 - 1,00,000', 'Above 1,00,000']}
              error={mIncomeErr}
            />
          </Field>

          <Field label="Phone No-Off">
            <TextField
              placeholder="Office phone"
              value={mother.phoneOff}
              onChange={(val) => updateMother('phoneOff', val)}
            />
          </Field>

          <Field label="Mobile No" required error={mMobileErr}>
            <TextField
              placeholder="Mobile number"
              value={mother.mobileNo}
              onChange={(val) => updateMother('mobileNo', val)}
              error={mMobileErr}
            />
          </Field>

          <Field label="Mother's Office Address" span={2}>
            <textarea
              rows={2}
              placeholder="Enter office address"
              disabled={!mother.isEmployed}
              value={mother.officeAddress}
              onChange={(e) => updateMother('officeAddress', e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-400"
            />
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


