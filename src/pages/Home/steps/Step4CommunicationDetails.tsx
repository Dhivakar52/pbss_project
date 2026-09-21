import React, { useState } from 'react'
import { Building, MapPin, Save, ArrowRight, RotateCcw } from 'lucide-react'
import { toast } from '@/components/ui/toast'
import { Field, TextField, SelectField } from '@/components/FormPrimitives'
import type { CommunicationDetailsState } from '../types'

interface Step4CommunicationDetailsProps {
  comm: CommunicationDetailsState
  setComm: React.Dispatch<React.SetStateAction<CommunicationDetailsState>>
  onClear: () => void
  onSaveAndExit: () => void
  onSaveAndNext: () => void
  isReadOnly?: boolean
}

export const Step4CommunicationDetails: React.FC<Step4CommunicationDetailsProps> = ({
  comm,
  setComm,
  onClear,
  onSaveAndExit,
  onSaveAndNext,
  isReadOnly = false,
}) => {
  const [showErrors, setShowErrors] = useState(false)

  const update = (key: keyof CommunicationDetailsState, val: any) => {
    setComm((prev) => ({ ...prev, [key]: val }))
  }

  const toggleCommuteMode = (mode: string) => {
    setComm((prev) => {
      const exists = prev.commuteMode.includes(mode)
      if (exists) {
        return { ...prev, commuteMode: prev.commuteMode.filter((m) => m !== mode) }
      } else {
        return { ...prev, commuteMode: [...prev.commuteMode, mode] }
      }
    })
  }

  const commuteOptions = ['Car', 'Auto/Hired Van', 'Bus', 'Two Wheeler', 'Walk']

  const isAddrErr = showErrors && !comm.address.trim()
  const isPincodeErr = showErrors && !comm.pincode.trim()
  const isDistErr = showErrors && !comm.distanceKm
  const isCommuteErr = showErrors && comm.commuteMode.length === 0

  const handleNext = () => {
    const isValid =
      comm.address.trim() &&
      comm.pincode.trim() &&
      comm.distanceKm &&
      comm.commuteMode.length > 0

    if (!isValid) {
      setShowErrors(true)
      toast.error('Please fill in all mandatory fields before proceeding.')
      return
    }

    setShowErrors(false)
    onSaveAndNext()
  }

  return (
    <div className="space-y-6">
      <fieldset disabled={isReadOnly} className={isReadOnly ? "space-y-6 border-none p-0 m-0 disabled:opacity-95" : "space-y-6 border-none p-0 m-0"}>
        {/* Section 1: Residential Details */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-sm font-bold text-[#0F294A]">
            <Building className="h-4.5 w-4.5 text-[#1677FF]" />
            <span>Residential Details</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Field label="Address" required span={4} error={isAddrErr}>
            <textarea
              rows={3}
              placeholder="Enter full residential address"
              value={comm.address}
              onChange={(e) => update('address', e.target.value)}
              className={`w-full p-2.5 rounded-lg border text-xs focus:outline-none ${
                isAddrErr ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200 focus:border-blue-500'
              }`}
            />
          </Field>

          <Field label="Pincode" required error={isPincodeErr}>
            <TextField
              placeholder="Pincode"
              value={comm.pincode}
              onChange={(val) => update('pincode', val)}
              error={isPincodeErr}
            />
          </Field>

          <Field label="Residence Telephone No" span={2}>
            <TextField
              placeholder="Landline number"
              value={comm.residencePhone}
              onChange={(val) => update('residencePhone', val)}
            />
          </Field>
        </div>
      </div>

      {/* Section 2: Other Details */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-[#0F294A] border-b border-slate-100 pb-3">
          <MapPin className="h-4.5 w-4.5 text-[#1677FF]" />
          <span>Other Details</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Field label="Important (familiar) landmark (Near Residence)" span={2}>
            <TextField
              placeholder="Enter landmark"
              value={comm.landmark}
              onChange={(val) => update('landmark', val)}
            />
          </Field>

          <Field label="Distance between Child's Residence and School (in K.M)" required span={2} error={isDistErr}>
            <SelectField
              placeholder="-- Select --"
              value={comm.distanceKm}
              onChange={(val) => update('distanceKm', val)}
              options={['Less than 1 KM', '1 - 3 KM', '3 - 5 KM', '5 - 10 KM', 'Above 10 KM']}
              error={isDistErr}
            />
          </Field>

          <Field label="How will the child commute to school?" required span={4} error={isCommuteErr} errorText={isCommuteErr ? "Please select at least one commute option" : undefined}>
            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-700 mt-1">
              {commuteOptions.map((opt) => (
                <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={comm.commuteMode.includes(opt)}
                    onChange={() => toggleCommuteMode(opt)}
                    className="text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </Field>

          <Field label="Outstanding achievements of parent in any field if any" span={4}>
            <textarea
              rows={2}
              placeholder="Enter details if applicable"
              value={comm.parentAchievements}
              onChange={(e) => update('parentAchievements', e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
            />
          </Field>

          <Field label="Is Parent coming on transfer from outside Chennai/from outside India" required span={4}>
            <div className="flex items-center gap-4 text-xs font-medium text-slate-700 mt-1">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="parentTransfer"
                  checked={comm.isTransferFromOutside === true}
                  onChange={() => update('isTransferFromOutside', true)}
                  className="text-blue-600 focus:ring-blue-500"
                /> Yes
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="parentTransfer"
                  checked={comm.isTransferFromOutside === false}
                  onChange={() => update('isTransferFromOutside', false)}
                  className="text-blue-600 focus:ring-blue-500"
                /> No
              </label>
            </div>
          </Field>
        </div>
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


