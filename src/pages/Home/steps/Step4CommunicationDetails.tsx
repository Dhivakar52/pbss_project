import React, { useState } from 'react'
import { Building, MapPin, Save, ArrowRight, RotateCcw } from 'lucide-react'
import { toast } from '@/components/ui/toast'
import { Field, TextField, SelectField } from '@/components/FormPrimitives'
import type { CommunicationDetailsState } from '../types'
import { useMasterStore } from '@/store/useMasterStore'
import { isValidEmail } from '@/utils/validation'

const ADDRESS_REGEX = /^[a-zA-Z0-9\s/.,\-#]+$/

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
  const fetchMasters = useMasterStore((s) => s.fetchMasters)

  React.useEffect(() => {
    fetchMasters()
  }, [fetchMasters])

  const distanceOptions = useMasterStore((s) => s.distanceNames)
  const commuteOptions = useMasterStore((s) => s.transportModeOptions)
  const update = (key: keyof CommunicationDetailsState, val: any) => {
    setComm((prev) => ({ ...prev, [key]: val }))
  }

  const isAddrEmpty = showErrors && !comm.address.trim()
  const isAddrFormatErr = showErrors && Boolean(comm.address.trim() && !ADDRESS_REGEX.test(comm.address.trim()))
  const isAddrErr = isAddrEmpty || isAddrFormatErr
  const addrErrorText = isAddrEmpty ? "Residential address is required." : isAddrFormatErr ? "Address contains invalid special characters." : undefined

  const isPincodeEmpty = showErrors && !comm.pincode.trim()
  const isPincodeFormatErr = showErrors && Boolean(comm.pincode.trim() && (comm.pincode.length !== 6 || !/^\d{6}$/.test(comm.pincode)))
  const isPincodeErr = isPincodeEmpty || isPincodeFormatErr
  const pincodeErrorText = isPincodeEmpty ? "PIN code is required." : isPincodeFormatErr ? "PIN code must be exactly 6 digits." : undefined

  const isEmailErr = showErrors && Boolean(comm.email.trim() && !isValidEmail(comm.email))
  const isDistErr = showErrors && !comm.distanceKm
  const isCommuteErr = showErrors && comm.commuteMode.length === 0
  const isPlaceErr = showErrors && comm.isTransferFromOutside && !(comm.transferDetails || '').trim()

  const handleNext = () => {
    const isAddrValid = Boolean(comm.address.trim() && ADDRESS_REGEX.test(comm.address.trim()))
    const isPincodeValid = Boolean(comm.pincode.trim().length === 6 && /^\d{6}$/.test(comm.pincode.trim()))
    const isEmailValid = !comm.email.trim() || isValidEmail(comm.email)
    const isDistValid = Boolean(comm.distanceKm)
    const isCommuteValid = comm.commuteMode.length > 0
    const isPlaceValid = !comm.isTransferFromOutside || Boolean((comm.transferDetails || '').trim())

    if (!isAddrValid || !isPincodeValid || !isEmailValid || !isDistValid || !isCommuteValid || !isPlaceValid) {
      setShowErrors(true)
      if (comm.address.trim() && !ADDRESS_REGEX.test(comm.address.trim())) {
        toast.error("Address contains invalid special characters.")
      } else if (comm.pincode.trim() && (comm.pincode.length !== 6 || !/^\d{6}$/.test(comm.pincode))) {
        toast.error("PIN code must be exactly 6 numeric digits.")
      } else if (!isEmailValid) {
        toast.error("Please enter a valid email address.")
      } else if (comm.isTransferFromOutside && !(comm.transferDetails || '').trim()) {
        toast.error("Please specify place of transfer.")
      } else {
        toast.error('Please fill in all mandatory fields before proceeding.')
      }
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
            <Field label="Address" required span={4} error={isAddrErr} errorText={addrErrorText}>
              <textarea
                rows={3}
                maxLength={250}
                placeholder="Enter full residential address"
                value={comm.address}
                onChange={(e) => update('address', e.target.value.replace(/[^a-zA-Z0-9\s/.,\-#]/g, '').slice(0, 250))}
                className={`w-full p-2.5 rounded-lg border text-xs focus:outline-none min-h-[80px] ${isAddrErr ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200 focus:border-blue-500'
                  }`}
              />
              <div className="flex justify-end text-[11px] text-slate-400 mt-0.5">
                {(comm.address || '').length}/250
              </div>
            </Field>

            <Field label="Pincode" required error={isPincodeErr} errorText={pincodeErrorText}>
              <TextField
                placeholder="6-digit PIN code"
                maxLength={6}
                value={comm.pincode}
                onChange={(val) => update('pincode', val.replace(/\D/g, '').slice(0, 6))}
                error={isPincodeErr}
              />
            </Field>

            <Field label="Residence Telephone No">
              <TextField
                placeholder="Landline number"
                maxLength={20}
                value={comm.residencePhone}
                onChange={(val) => update('residencePhone', val.replace(/\D/g, '').slice(0, 20))}
              />
            </Field>

            <Field
              label="Preferred Email ID for Communication"
              span={2}
              error={isEmailErr}
              errorText={isEmailErr ? "Please enter a valid email address." : undefined}
            >
              <TextField
                id="Email"
                type="email"
                placeholder="Enter email address"
                autoComplete="email"
                value={comm.email}
                onChange={(val) => update('email', val)}
                error={isEmailErr}
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
                maxLength={50}
                value={comm.landmark}
                onChange={(val) => update('landmark', val.slice(0, 50))}
              />
            </Field>

            <Field label="Distance between Child's Residence and School (in K.M)" required span={2} error={isDistErr} errorText={isDistErr ? "Please select distance." : undefined}>
              <SelectField
                placeholder="-- Select --"
                value={comm.distanceKm}
                onChange={(val) => update('distanceKm', val)}
                options={distanceOptions}
                error={isDistErr}
              />
            </Field>

            <Field label="How will the child commute to school?" required span={4} error={isCommuteErr} errorText={isCommuteErr ? "Please select a commute option." : undefined}>
              <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-700 mt-1">
                {commuteOptions.map((opt) => (
                  <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={comm.commuteMode.includes(opt)}
                      onChange={() => {
                        const current = comm.commuteMode || []
                        const next = current.includes(opt)
                          ? current.filter((m) => m !== opt)
                          : [...current, opt]
                        update('commuteMode', next)
                      }}
                      className="text-blue-600 focus:ring-blue-500 rounded border-slate-300"
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
                maxLength={100}
                value={comm.parentAchievements}
                onChange={(e) => update('parentAchievements', e.target.value.slice(0, 100))}
                className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
              />
            </Field>

            <Field label="Is Parent coming on transfer from outside Chennai/from outside India" required span={comm.isTransferFromOutside ? 2 : 4}>
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
                    onChange={() => {
                      update('isTransferFromOutside', false)
                      update('transferDetails', '')
                    }}
                    className="text-blue-600 focus:ring-blue-500"
                  /> No
                </label>
              </div>
            </Field>

            {comm.isTransferFromOutside && (
              <Field
                label="Specify Place"
                required
                span={2}
                error={isPlaceErr}
                errorText={isPlaceErr ? "Please specify place of transfer" : undefined}
              >
                <TextField
                  placeholder="Enter place of transfer"
                  value={comm.transferDetails || ''}
                  onChange={(val) => update('transferDetails', val)}
                  error={isPlaceErr}
                />
              </Field>
            )}
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
