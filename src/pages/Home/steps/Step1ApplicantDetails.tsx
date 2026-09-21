import React, { useState } from 'react'
import {
  User,
  School,
  Heart,
  PlusCircle,
  Save,
  ArrowRight,
  Building,
  ChevronDown
} from 'lucide-react'
import { format } from 'date-fns'
import { toast } from '@/components/ui/toast'
import { Field, TextField, SelectField, DobDateField } from '@/components/FormPrimitives'
import type { Sibling } from '../types'

interface Step1ApplicantDetailsProps {
  childName: string
  setChildName: (val: string) => void
  dob: string
  setDob: (val: string) => void
  gender: string
  setGender: (val: string) => void
  motherTongue: string
  setMotherTongue: (val: string) => void
  nationality: string
  setNationality: (val: string) => void
  religion: string
  setReligion: (val: string) => void
  caste: string
  setCaste: (val: string) => void
  community: string
  setCommunity: (val: string) => void
  isHealthy: boolean
  setIsHealthy: (val: boolean) => void
  majorAilment: string
  setMajorAilment: (val: string) => void
  childGoesToSchool: boolean
  setChildGoesToSchool: (val: boolean) => void
  prevSchool: string
  setPrevSchool: (val: string) => void
  hasSiblings: boolean
  setHasSiblings: (val: boolean) => void
  siblings: Sibling[]
  addSibling: () => void
  removeSibling: (index: number) => void
  updateSibling: (index: number, key: keyof Sibling, val: string) => void
  onSaveAndExit: () => void
  onSaveAndNext: () => void
  isReadOnly?: boolean
}

const parseDate = (val?: string) => {
  if (!val) return undefined
  const d = new Date(val)
  return isNaN(d.getTime()) ? undefined : d
}

export const Step1ApplicantDetails: React.FC<Step1ApplicantDetailsProps> = ({
  childName,
  setChildName,
  dob,
  setDob,
  gender,
  setGender,
  motherTongue,
  setMotherTongue,
  nationality,
  setNationality,
  religion,
  setReligion,
  caste,
  setCaste,
  community,
  setCommunity,
  isHealthy,
  setIsHealthy,
  majorAilment,
  setMajorAilment,
  childGoesToSchool,
  setChildGoesToSchool,
  prevSchool,
  setPrevSchool,
  hasSiblings,
  setHasSiblings,
  siblings,
  addSibling,
  removeSibling,
  updateSibling,
  onSaveAndExit,
  onSaveAndNext,
  isReadOnly = false,
}) => {
  const [showErrors, setShowErrors] = useState(false)

  const isChildNameErr = showErrors && !childName.trim()
  const isDobErr = showErrors && !dob
  const isGenderErr = showErrors && !gender
  const isMotherTongueErr = showErrors && !motherTongue
  const isNationalityErr = showErrors && !nationality
  const isReligionErr = showErrors && !religion
  const isCasteErr = showErrors && !caste
  const isCommunityErr = showErrors && !community

  const handleNext = () => {
    if (
      !childName.trim() ||
      !dob ||
      !gender ||
      !motherTongue ||
      !nationality ||
      !religion ||
      !caste ||
      !community
    ) {
      setShowErrors(true)
      toast.error('Please fill in all mandatory fields before proceeding.')
      return
    }
    setShowErrors(false)
    onSaveAndNext()
  }

  return (
    <div className="space-y-5">
      {/* Top Card Banner: Applying For */}
      <div className="p-4 rounded-xl bg-[#F0F7FF] border border-[#BDE0FE] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#E6F4FF] text-[#1677FF] flex items-center justify-center shrink-0">
            <Building className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide block">Applying For</span>
            <span className="text-sm font-bold text-slate-900">T. Nagar - PSBB</span>
          </div>
        </div>
        <ChevronDown className="h-4 w-4 text-slate-400" />
      </div>

      {/* Stacked Cards One by One */}
      <fieldset disabled={isReadOnly} className={isReadOnly ? "space-y-5 border-none p-0 m-0 disabled:opacity-95" : "space-y-5 border-none p-0 m-0"}>
        
        {/* 1. Child Information Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#0F294A] border-b border-slate-100 pb-3">
            <User className="h-4 w-4 text-[#1677FF]" />
            <span>Child Information</span>
          </div>

          {/* 4-Column Grid for Input Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Field label="Child Name" required error={isChildNameErr}>
              <TextField
                placeholder="Enter child name"
                value={childName}
                onChange={setChildName}
                error={isChildNameErr}
              />
            </Field>

            <Field label="Date of Birth" required error={isDobErr}>
              <DobDateField
                placeholder="Select Date of Birth"
                value={parseDate(dob)}
                onChange={(d) => setDob(d ? format(d, 'yyyy-MM-dd') : '')}
                error={isDobErr}
              />
            </Field>

            <Field label="Gender" required error={isGenderErr}>
              <SelectField
                placeholder="Select gender"
                value={gender}
                onChange={setGender}
                options={['Male', 'Female']}
                error={isGenderErr}
              />
            </Field>

            <Field label="Mother Tongue" required error={isMotherTongueErr}>
              <SelectField
                placeholder="Select mother tongue"
                value={motherTongue}
                onChange={setMotherTongue}
                options={['Tamil', 'English', 'Hindi', 'Telugu']}
                error={isMotherTongueErr}
              />
            </Field>

            <Field label="Nationality" required error={isNationalityErr}>
              <SelectField
                value={nationality}
                onChange={setNationality}
                options={['Indian', 'NRI']}
                error={isNationalityErr}
              />
            </Field>

            <Field label="Religion" required error={isReligionErr}>
              <SelectField
                placeholder="Select religion"
                value={religion}
                onChange={setReligion}
                options={['Hindu', 'Christian', 'Muslim', 'Other']}
                error={isReligionErr}
              />
            </Field>

            <Field label="Caste" required error={isCasteErr}>
              <SelectField
                placeholder="Select caste"
                value={caste}
                onChange={setCaste}
                options={['General', 'OBC', 'MBC', 'SC/ST']}
                error={isCasteErr}
              />
            </Field>

            <Field label="Community" required error={isCommunityErr}>
              <SelectField
                placeholder="Select community"
                value={community}
                onChange={setCommunity}
                options={['BC', 'MBC', 'OC', 'SC']}
                error={isCommunityErr}
              />
            </Field>
          </div>
        </div>

        {/* 2. Additional Information Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#0F294A] border-b border-slate-100 pb-3">
            <School className="h-4 w-4 text-[#1677FF]" />
            <span>Additional Information</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Field label="Does the child go to any school?" span={2}>
              <div className="flex items-center gap-4 text-xs font-medium text-slate-700 mt-1">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="childSchool"
                    checked={childGoesToSchool === true}
                    onChange={() => setChildGoesToSchool(true)}
                    className="text-blue-600 focus:ring-blue-500"
                  /> Yes
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="childSchool"
                    checked={childGoesToSchool === false}
                    onChange={() => setChildGoesToSchool(false)}
                    className="text-blue-600 focus:ring-blue-500"
                  /> No
                </label>
              </div>
            </Field>

            <Field label="If Yes, Name of the School and Address" span={2}>
              <TextField
                placeholder="Enter school name and address"
                disabled={!childGoesToSchool}
                value={prevSchool}
                onChange={setPrevSchool}
              />
            </Field>

            <Field label="Does the child have siblings studying in this school?" span={4}>
              <div className="flex items-center gap-4 text-xs font-medium text-slate-700 mt-1">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="hasSibling"
                    checked={hasSiblings === true}
                    onChange={() => setHasSiblings(true)}
                    className="text-blue-600 focus:ring-blue-500"
                  /> Yes
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="hasSibling"
                    checked={hasSiblings === false}
                    onChange={() => setHasSiblings(false)}
                    className="text-blue-600 focus:ring-blue-500"
                  /> No
                </label>
              </div>
            </Field>

            {/* Sibling Table across all 4 columns */}
            <div className="md:col-span-4 overflow-x-auto border border-slate-200 rounded-xl pt-1">
              <table className="w-full text-left text-[11px]">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <th className="p-2">Name of Sibling</th>
                    <th className="p-2">Name of the School</th>
                    <th className="p-2">Left Student?</th>
                    <th className="p-2">USN</th>
                    <th className="p-2">Class/Sec</th>
                    <th className="p-2">Year & Class of Leaving</th>
                    <th className="p-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {siblings.map((sib, index) => (
                    <tr key={index} className="border-b border-slate-100 last:border-0">
                      <td className="p-1.5">
                        <TextField
                          placeholder="Select or type"
                          value={sib.name}
                          onChange={(val) => updateSibling(index, 'name', val)}
                        />
                      </td>
                      <td className="p-1.5">
                        <SelectField
                          value={sib.school}
                          onChange={(val) => updateSibling(index, 'school', val)}
                          options={['PSBB', 'Other']}
                        />
                      </td>
                      <td className="p-1.5">
                        <SelectField
                          value={sib.leftStudent}
                          onChange={(val) => updateSibling(index, 'leftStudent', val)}
                          options={['No', 'Yes']}
                        />
                      </td>
                      <td className="p-1.5">
                        <TextField
                          value={sib.usn}
                          onChange={(val) => updateSibling(index, 'usn', val)}
                        />
                      </td>
                      <td className="p-1.5">
                        <SelectField
                          value={sib.classSec}
                          onChange={(val) => updateSibling(index, 'classSec', val)}
                          options={['V-A', 'VI-B', 'VII-C']}
                        />
                      </td>
                      <td className="p-1.5">
                        <TextField
                          value={sib.yearLeaving}
                          onChange={(val) => updateSibling(index, 'yearLeaving', val)}
                        />
                      </td>
                      <td className="p-1.5 text-center">
                        {!isReadOnly && (
                          <button
                            type="button"
                            onClick={() => removeSibling(index)}
                            className="w-5 h-5 rounded-full text-red-500 hover:bg-red-50 flex items-center justify-center font-bold text-xs cursor-pointer"
                          >
                            -
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {!isReadOnly && (
              <div className="md:col-span-4">
                <button
                  type="button"
                  onClick={addSibling}
                  className="text-xs font-bold text-[#1677FF] hover:underline flex items-center gap-1 cursor-pointer pt-1"
                >
                  <PlusCircle className="h-3.5 w-3.5" /> Add Sibling
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 3. Health Information Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#0F294A] border-b border-slate-100 pb-3">
            <Heart className="h-4 w-4 text-red-500" />
            <span>Health Information</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Field label="Is the Child a normal and healthy child?" span={2}>
              <div className="flex items-center gap-4 text-xs font-medium text-slate-700 mt-1">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="healthyChild"
                    checked={isHealthy === true}
                    onChange={() => setIsHealthy(true)}
                    className="text-blue-600 focus:ring-blue-500"
                  /> Yes
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="healthyChild"
                    checked={isHealthy === false}
                    onChange={() => setIsHealthy(false)}
                    className="text-blue-600 focus:ring-blue-500"
                  /> No
                </label>
              </div>
            </Field>

            <Field label="Specify Major ailment, if any (Past/Present)" span={2}>
              <TextField
                placeholder="Enter major ailment"
                value={majorAilment}
                onChange={setMajorAilment}
              />
            </Field>
          </div>
        </div>

      </fieldset>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-3">
        {!isReadOnly && (
          <button
            type="button"
            onClick={onSaveAndExit}
            className="h-9 px-4 rounded-xl text-xs font-semibold border border-blue-500 text-[#1677FF] hover:bg-blue-50 transition-all cursor-pointer flex items-center gap-1.5 bg-white"
          >
            <Save className="h-3.5 w-3.5" /> Save & Exit
          </button>
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

