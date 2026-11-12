import React, { useCallback, useRef, useState } from 'react'
import {
  User,
  School,
  Heart,
  PlusCircle,
  Save,
  ArrowRight,
  Building,
  ChevronDown,
  RotateCcw,
  Trash2,
  Check
} from 'lucide-react'
import { toast } from '@/components/ui/toast'
import { Field, TextField, SelectField, DobDateField } from '@/components/FormPrimitives'
import type { Sibling, AdditionalChild } from '../types'
import { useMasterStore } from '@/store/useMasterStore'
import { ApiService, type MasterSection, type MasterStandard } from '@/services/api.service'

const NAME_REGEX = /^[a-zA-Z\s.]+$/
const USN_REGEX = /^[KSN]\d{6}$/i

export const isOther = (val?: string) =>
  Boolean(val && (val.toLowerCase() === 'others' || val.toLowerCase() === 'other' || val.toLowerCase().startsWith('other')))

export function getBranchInitial(schoolName?: string): string {
  if (!schoolName || schoolName.toLowerCase() === 'others') return ''
  const trimmed = schoolName.trim()
  if (/k\.?\s*k\.?\s*nagar/i.test(trimmed)) return 'K'
  if (/t\.?\s*nagar/i.test(trimmed)) return 'T'
  if (/siruseri/i.test(trimmed)) return 'S'
  if (/nungambakkam/i.test(trimmed)) return 'N'
  const stripped = trimmed.replace(/^PSBB[\s\-_–:]*/i, '').trim()
  const target = stripped || trimmed
  const match = target.match(/[a-zA-Z]/)
  return match ? match[0].toUpperCase() : ''
}

interface Step1ApplicantDetailsProps {
  childName: string
  setChildName: (val: string) => void
  dob: string
  setDob: (val: string) => void
  gender: string
  setGender: (val: string) => void
  motherTongue: string
  setMotherTongue: (val: string) => void
  otherMotherTongue?: string
  setOtherMotherTongue?: (val: string) => void
  nationality: string
  setNationality: (val: string) => void
  otherNationality?: string
  setOtherNationality?: (val: string) => void
  passportNo?: string
  setPassportNo?: (val: string) => void
  religion: string
  setReligion: (val: string) => void
  otherReligion?: string
  setOtherReligion?: (val: string) => void
  caste: string
  setCaste: (val: string) => void
  otherCaste?: string
  setOtherCaste?: (val: string) => void
  community: string
  setCommunity: (val: string) => void
  otherCommunity?: string
  setOtherCommunity?: (val: string) => void
  isTwins?: boolean
  setIsTwins?: (val: boolean) => void
  twinsNo?: number | string
  setTwinsNo?: (val: number | string) => void
  additionalChildren?: AdditionalChild[]
  setAdditionalChildren?: React.Dispatch<React.SetStateAction<AdditionalChild[]>>
  updateAdditionalChild?: (index: number, key: keyof AdditionalChild, val: string) => void
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
  updateSibling: (index: number, key: keyof Sibling, val: string | number | undefined) => void
  selectedSchoolId?: number
  setSelectedSchoolId?: (id: number) => void
  selectedSchoolName?: string
  setSelectedSchoolName?: (name: string) => void
  onClear?: () => void
  onSaveAndExit: () => void
  onSaveAndNext: () => void
  isReadOnly?: boolean
  isSchoolSelectionDisabled?: boolean
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
  otherMotherTongue = '',
  setOtherMotherTongue,
  nationality,
  setNationality,
  otherNationality = '',
  setOtherNationality,
  passportNo = '',
  setPassportNo,
  religion,
  setReligion,
  otherReligion = '',
  setOtherReligion,
  caste,
  setCaste,
  otherCaste = '',
  setOtherCaste,
  community,
  setCommunity,
  otherCommunity = '',
  setOtherCommunity,
  isTwins = false,
  setIsTwins,
  twinsNo = '',
  setTwinsNo,
  additionalChildren = [],
  setAdditionalChildren: _setAdditionalChildren,
  updateAdditionalChild,
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
  selectedSchoolId = 0,
  setSelectedSchoolId,
  selectedSchoolName = '',
  setSelectedSchoolName,
  onClear,
  onSaveAndExit,
  onSaveAndNext,
  isReadOnly = false,
  isSchoolSelectionDisabled = false,
}) => {
  const [showErrors, setShowErrors] = useState(false)
  const [showAilmentError, setShowAilmentError] = useState(false)
  const [showTwinsError, setShowTwinsError] = useState(false)
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false)
  const [siblingStandards, setSiblingStandards] = useState<Record<number, MasterStandard[]>>({})
  const [siblingSections, setSiblingSections] = useState<Record<string, MasterSection[]>>({})
  const [loadingSiblingStandards, setLoadingSiblingStandards] = useState<Record<number, boolean>>({})
  const [loadingSiblingSections, setLoadingSiblingSections] = useState<Record<string, boolean>>({})
  const siblingStandardsRequests = useRef(new Map<number, Promise<MasterStandard[]>>())
  const siblingSectionsRequests = useRef(new Map<string, Promise<MasterSection[]>>())
  const updateSiblingRef = useRef(updateSibling)
  updateSiblingRef.current = updateSibling
  const fetchMasters = useMasterStore((s) => s.fetchMasters)

  React.useEffect(() => {
    fetchMasters()
  }, [fetchMasters])

  React.useEffect(() => {
    siblings.forEach((s, idx) => {
      if (s.schoolId && s.schoolId > 0 && !siblingStandards[idx]) {
        void ApiService.getStandards(s.schoolId)
          .then((stds: MasterStandard[]) => {
            setSiblingStandards((prev) => ({ ...prev, [idx]: stds }))
          })
          .catch((err: unknown) => console.error(err))
      }
    })
  }, [siblings, siblingStandards])

  const schools = useMasterStore((s) => s.applyingSchools)
  const canSelectSchool = !isReadOnly && !isSchoolSelectionDisabled
  const siblingSchools = useMasterStore((s) => s.siblingSchools)
  const genderOptions = useMasterStore((s) => s.genderOptions)
  const motherTongueOptions = useMasterStore((s) => s.motherTongueNames)
  const nationalityOptions = useMasterStore((s) => s.nationalityOptions)
  const religionOptions = useMasterStore((s) => s.religionOptions)
  const casteOptions = useMasterStore((s) => s.casteNames)
  const communityOptions = useMasterStore((s) => s.communityOptions)
  const siblingSchoolOptions = useMasterStore((s) => s.siblingSchoolNames)
  const standardOptions = useMasterStore((s) => s.standardNames)
  const standardRecords = useMasterStore((s) => s.standards)
  const leftYearOptions = useMasterStore((s) => s.leftYearStrings)
  const loadSiblingStandards = useCallback((schoolId: number): Promise<MasterStandard[]> => {
    const pendingRequest = siblingStandardsRequests.current.get(schoolId)
    if (pendingRequest) return pendingRequest

    setLoadingSiblingStandards((current) => ({ ...current, [schoolId]: true }))
    const request = ApiService.getStandards(schoolId)
      .then((standards) => {
        setSiblingStandards((current) => ({ ...current, [schoolId]: standards }))
        return standards
      })
      .catch((error: unknown) => {
        siblingStandardsRequests.current.delete(schoolId)
        console.error('Failed to load sibling classes:', error)
        toast.error('Classes for the selected sibling school could not be loaded.')
        throw error
      })
      .finally(() => {
        setLoadingSiblingStandards((current) => ({ ...current, [schoolId]: false }))
      })
    siblingStandardsRequests.current.set(schoolId, request)
    return request
  }, [])

  const loadSiblingSections = useCallback((schoolId: number, standardId: number): Promise<MasterSection[]> => {
    const key = `${schoolId}:${standardId}`
    const pendingRequest = siblingSectionsRequests.current.get(key)
    if (pendingRequest) return pendingRequest

    setLoadingSiblingSections((current) => ({ ...current, [key]: true }))
    const request = ApiService.getSections(schoolId, standardId)
      .then((sections) => {
        setSiblingSections((current) => ({ ...current, [key]: sections }))
        return sections
      })
      .catch((error: unknown) => {
        siblingSectionsRequests.current.delete(key)
        console.error('Failed to load sibling sections:', error)
        toast.error('Sections for the selected sibling class could not be loaded.')
        throw error
      })
      .finally(() => {
        setLoadingSiblingSections((current) => ({ ...current, [key]: false }))
      })
    siblingSectionsRequests.current.set(key, request)
    return request
  }, [])

  const siblingSelectionKey = JSON.stringify(siblings.map((sibling, index) => ({
    index,
    school: sibling.school,
    schoolId: sibling.schoolId,
    classSec: sibling.classSec,
    classId: sibling.classId,
    section: sibling.section,
    sectionId: sibling.sectionId,
  })))

  React.useEffect(() => {
    const selections = JSON.parse(siblingSelectionKey) as Array<
      Pick<Sibling, 'school' | 'schoolId' | 'classSec' | 'classId' | 'section' | 'sectionId'> & { index: number }
    >
    selections.forEach((sibling) => {
      const schoolName = sibling.school || ''
      const matchedSchool = siblingSchools.find((school) =>
        [school.School, school.SchoolName, school.SchoolShortName]
          .some((name) => name?.toLowerCase() === schoolName.toLowerCase())
      )
      const schoolId = sibling.schoolId || matchedSchool?.SchoolID || 0
      if (!schoolId || isOther(schoolName)) return

      void loadSiblingStandards(schoolId)
        .then((standards) => {
          const standardName = (sibling.classSec || '').toLowerCase()
          const standard = standards.find((item) =>
            item.StandardName.toLowerCase() === standardName &&
            (sibling.classId == null || item.StandardID === sibling.classId)
          ) || standards.find((item) => item.StandardName.toLowerCase() === standardName)
          if (!standard) return undefined

          if (sibling.classId !== standard.StandardID) {
            updateSiblingRef.current(sibling.index, 'classId', standard.StandardID)
          }

          return loadSiblingSections(schoolId, standard.StandardID).then((sections) => {
            const section = sections.find((item) => item.SectionID === sibling.sectionId) ||
              sections.find((item) => item.SectionName.toLowerCase() === (sibling.section || '').toLowerCase())
            if (section) {
              if (sibling.sectionId !== section.SectionID) {
                updateSiblingRef.current(sibling.index, 'sectionId', section.SectionID)
              }
              if ((sibling.section || '').toLowerCase() !== section.SectionName.toLowerCase()) {
                updateSiblingRef.current(sibling.index, 'section', section.SectionName)
              }
            }
          })
        })
        .catch(() => undefined)
    })
  }, [siblingSelectionKey, siblingSchools, loadSiblingStandards, loadSiblingSections])

  // Validation States
  const isChildNameEmpty = showErrors && !childName.trim()
  const isChildNameInvalid = Boolean(childName.trim() && (!NAME_REGEX.test(childName.trim()) || !/[a-zA-Z]/.test(childName.trim())))
  const isChildNameErr = isChildNameEmpty || (showErrors && isChildNameInvalid)

  const isDobEmpty = showErrors && !dob
  const isDobErr = isDobEmpty

  const isGenderErr = showErrors && !gender
  const isMotherTongueErr = showErrors && !motherTongue
  const isOtherMotherTongueErr = showErrors && isOther(motherTongue) && !otherMotherTongue.trim()
  const isNationalityErr = showErrors && !nationality
  const isOtherNationalityErr = showErrors && isOther(nationality) && !otherNationality.trim()
  const isPassportRequired = isOther(nationality)
  const isPassportErr = showErrors && isPassportRequired && !passportNo.trim()
  const isReligionErr = showErrors && !religion
  const isOtherReligionErr = showErrors && isOther(religion) && !otherReligion.trim()
  const isCasteErr = showErrors && !caste
  const isOtherCasteErr = showErrors && isOther(caste) && !otherCaste.trim()
  const isCommunityErr = showErrors && !community
  const isOtherCommunityErr = showErrors && isOther(community) && !otherCommunity.trim()

  // Studying school validation
  const isPrevSchoolErr = showErrors && childGoesToSchool && !prevSchool.trim()

  // Major ailment validation (only triggers when Save & Next is clicked)
  const isMajorAilmentErr = showAilmentError && !isHealthy && !majorAilment.trim()

  // Twins validation
  const isTwinsErr = showTwinsError && isTwins && (!twinsNo || twinsNo === '0' || twinsNo === 0 || twinsNo === '')

  // Siblings validations
  const hasEnteredSibling = siblings.some((s) => Boolean(s.name?.trim()))
  const isSiblingsEmpty = showErrors && hasSiblings && (!hasEnteredSibling || siblings.length === 0)
  const invalidSiblingIndex = hasSiblings
    ? siblings.findIndex((sib) => {
      if (!sib.name.trim() || !sib.school || !sib.classSec) return true
      if (isOther(sib.school) && !sib.schoolName?.trim()) return true
      const matchedSchool = siblingSchools.find((school) =>
        [school.School, school.SchoolName, school.SchoolShortName]
          .some((name) => name?.toLowerCase() === sib.school.toLowerCase())
      )
      const schoolId = sib.schoolId || matchedSchool?.SchoolID || 0
      const rowStandards = isOther(sib.school) ? standardRecords : (siblingStandards[schoolId] || [])
      const selectedStandard = rowStandards.find((standard) =>
        standard.StandardName.toLowerCase() === sib.classSec.trim().toLowerCase() &&
        (sib.classId == null || standard.StandardID === sib.classId)
      )
      if (!selectedStandard) return true
      if (sib.school !== 'Others') {
        if (!schoolId) return true
        // const branchInitial = getBranchInitial(sib.school)
        // const sibUsnRegex = branchInitial ? new RegExp('^' + branchInitial + '\\d{6}$', 'i') : USN_REGEX
        // if (!sib.usn?.trim() || !sibUsnRegex.test(sib.usn.trim())) return true
        if (!sib.usn?.trim() || !USN_REGEX.test(sib.usn.trim())) {
          return true
        }
        if (!sib.section?.trim()) return true
        const rowSections = siblingSections[`${schoolId}:${selectedStandard.StandardID}`] || []
        if (!rowSections.some((section) =>
          section.SectionName.toLowerCase() === sib.section?.trim().toLowerCase() &&
          (sib.sectionId == null || section.SectionID === sib.sectionId)
        )) return true
      }
      if (sib.leftStudent === 'Yes' && !sib.yearLeaving) return true
      return false
    })
    : -1

  const isSiblingsErr = isSiblingsEmpty || (showErrors && invalidSiblingIndex >= 0)

  const handleNext = () => {
    // 0. School Branch validation
    if (!selectedSchoolId || !selectedSchoolName) {
      setShowErrors(true)
      toast.error('Please select a school branch.')
      return
    }

    // 1. Basic Applicant Fields
    if (
      !childName.trim() ||
      !NAME_REGEX.test(childName.trim()) ||
      !dob ||
      !gender ||
      !motherTongue ||
      (isOther(motherTongue) && !otherMotherTongue.trim()) ||
      !nationality ||
      (isOther(nationality) && !otherNationality.trim()) ||
      (isOther(nationality) && !passportNo.trim()) ||
      !religion ||
      (isOther(religion) && !otherReligion.trim()) ||
      !caste ||
      (isOther(caste) && !otherCaste.trim()) ||
      !community ||
      (isOther(community) && !otherCommunity.trim())
    ) {
      setShowErrors(true)
      if (childName.trim() && (!NAME_REGEX.test(childName.trim()) || !/[a-zA-Z]/.test(childName.trim()))) {
        toast.error('Name of the child should only contain alphabetic characters, spaces, and initials (dots).')
      } else if (isOther(nationality) && !passportNo.trim()) {
        toast.error('Passport Number is mandatory when Nationality is Others.')
      } else {
        toast.error('Please fill in all mandatory fields before proceeding.')
      }
      return
    }

    // 2. Studying school validation
    if (childGoesToSchool && !prevSchool.trim()) {
      setShowErrors(true)
      toast.error('Please enter the Previous School Name and Address.')
      return
    }

    // Twins / Triplets / Quadruplets validation
    if (isTwins) {
      if (!twinsNo || twinsNo === '' || twinsNo === '0' || twinsNo === 0) {
        setShowTwinsError(true)
        toast.error('Please select Multiple Birth Type (Twins / Triplets / Quadruplets).')
        return
      }
      const count = Math.max(0, Number(twinsNo) - 1)
      for (let i = 0; i < count; i++) {
        const extra = additionalChildren?.[i]
        if (!extra?.name?.trim()) {
          setShowErrors(true)
          toast.error(`Please enter Child ${i + 2}'s Full Name in Step 1.`)
          return
        }
        if (!extra.gender) {
          if (gender) {
            extra.gender = gender
          } else {
            setShowErrors(true)
            toast.error(`Please select Child ${i + 2}'s Gender in Step 1.`)
            return
          }
        }
      }
    }

    // 3. Health info validation (Point 4: triggers only when clicking Save & Next)
    if (!isHealthy && !majorAilment.trim()) {
      setShowAilmentError(true)
      toast.error('Please specify the Major ailment when child is marked not healthy.')
      return
    }

    // 4. Sibling validation
    if (hasSiblings) {
      const activeSiblings = siblings.filter((s) => Boolean(s.name?.trim()))
      if (activeSiblings.length === 0) {
        setShowErrors(true)
        toast.error('Please add at least one sibling or select No for school-going siblings.')
        return
      }

      for (let i = 0; i < siblings.length; i++) {
        const s = siblings[i]
        if (!s.name?.trim()) continue
        if (!s.school) {
          setShowErrors(true)
          toast.error(`Please select School Name for Sibling ${i + 1}.`)
          return
        }
        if (isOther(s.school) && !s.schoolName?.trim()) {
          setShowErrors(true)
          toast.error(`Please enter School Name for Sibling ${i + 1}.`)
          return
        }
        if (!s.classSec) {
          setShowErrors(true)
          toast.error(`Please select Class for Sibling ${i + 1}.`)
          return
        }
        if (s.school !== 'Others' && (s.schoolId == null || s.classId == null || (s.section && s.sectionId == null))) {
          setShowErrors(true)
          toast.error(`Please wait for Sibling ${i + 1} school, class, and section details to finish loading.`)
          return
        }
        if (s.school !== 'Others' && s.usn?.trim()) {
          if (!USN_REGEX.test(s.usn.trim())) {
            setShowErrors(true)

            toast.error(
              `Sibling ${i + 1} USN must start with K, S, or N followed by 6 digits (e.g. K123456).`
            )

            return
          }
        }
        if (s.leftStudent === 'Yes' && !s.yearLeaving) {
          setShowErrors(true)
          toast.error(`Please select Year of Leaving for Sibling ${i + 1}.`)
          return
        }
      }
    }

    setShowErrors(false)
    setShowAilmentError(false)
    setShowTwinsError(false)
    onSaveAndNext()
  }

  return (
    <div className="space-y-5">
      {/* Top Card Banner: School/Branch Selection */}
      <div className="relative">
        <div
          role="button"
          tabIndex={canSelectSchool ? 0 : -1}
          aria-expanded={isBranchDropdownOpen}
          aria-disabled={!canSelectSchool}
          onKeyDown={(e) => {
            if (canSelectSchool && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault()
              setIsBranchDropdownOpen(!isBranchDropdownOpen)
            }
          }}
          onClick={() => {
            if (canSelectSchool) setIsBranchDropdownOpen(!isBranchDropdownOpen)
          }}
          className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 select-none ${canSelectSchool
            ? 'cursor-pointer bg-gradient-to-r from-sky-50/80 via-white to-blue-50/50 dark:from-slate-900 dark:via-slate-850 dark:to-slate-900 hover:border-[#0284c7] hover:shadow-md'
            : 'cursor-not-allowed bg-slate-50/80 dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-90'
            } ${showErrors && (!selectedSchoolId || !selectedSchoolName)
              ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/30'
              : 'border-sky-200/90 dark:border-slate-700'
            } ${isBranchDropdownOpen ? 'ring-2 ring-[#0284c7]/25 border-[#0284c7]' : ''
            }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3.5">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 ${showErrors && (!selectedSchoolId || !selectedSchoolName)
                ? 'bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400'
                : 'bg-gradient-to-br from-[#006699] to-[#0284c7] text-white shadow-md shadow-sky-600/20'
                }`}>
                <Building className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  School Applying For <span className="text-red-500">*</span>
                </span>
                <span className={`text-sm sm:text-base font-extrabold truncate block ${selectedSchoolName ? 'text-[#0e364f] dark:text-white' : 'text-slate-400 italic'
                  }`}>
                  {selectedSchoolName || '-- Select School Branch --'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              {canSelectSchool ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-[#0284c7] dark:text-sky-400 bg-white dark:bg-slate-800 border border-sky-200 dark:border-slate-700 shadow-2xs hover:bg-sky-50 dark:hover:bg-slate-750 transition-colors">
                  <span>{selectedSchoolName ? 'Change Branch' : 'Select Branch'}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-[#0284c7] dark:text-sky-400 transition-transform duration-200 ${isBranchDropdownOpen ? 'rotate-180' : ''
                      }`}
                  />
                </div>
              ) : (
                <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800">
                  Fixed Selection
                </span>
              )}
            </div>
          </div>
        </div>

        {showErrors && (!selectedSchoolId || !selectedSchoolName) && (
          <p className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold mt-1.5 pl-1">
            Please select a school branch to continue
          </p>
        )}

        {/* Redesigned Branch Dropdown Menu */}
        {isBranchDropdownOpen && canSelectSchool && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsBranchDropdownOpen(false)}
            />
            <div className="absolute left-0 right-0 z-50 mt-2 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden ring-1 ring-black/5 animate-in fade-in-0 zoom-in-95 duration-150">
              <div className="px-4 py-3 bg-slate-50/90 dark:bg-slate-950/70 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Building className="h-4 w-4 text-[#0284c7]" />
                  Select School Campus / Branch
                </span>
                <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                  {schools.filter((sc) => sc.School && sc.SchoolID !== 5 && sc.School !== 'Others').length} Campuses
                </span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 p-1.5">
                {schools
                  .filter((sc) => sc.School && sc.SchoolID !== 5 && sc.School !== 'Others')
                  .map((sc) => {
                    const isSelected = sc.SchoolID === selectedSchoolId
                    return (
                      <button
                        key={sc.SchoolID}
                        type="button"
                        onClick={() => {
                          setSelectedSchoolId?.(sc.SchoolID)
                          setSelectedSchoolName?.(sc.School || '')
                          setIsBranchDropdownOpen(false)
                        }}
                        className={`w-full text-left px-3.5 py-3 rounded-xl flex items-center justify-between transition-all cursor-pointer ${isSelected
                          ? 'bg-sky-50 dark:bg-sky-950/40 text-[#006699] dark:text-sky-300 font-bold border-l-4 border-[#0284c7]'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/70 font-medium'
                          }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isSelected
                            ? 'bg-[#0284c7] text-white shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                            }`}>
                            <Building className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-sm font-bold block truncate">
                              {sc.School}
                            </span>
                            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-normal block truncate">
                              Padma Seshadri Bala Bhavan Senior Secondary School
                            </span>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0284c7]/15 dark:bg-sky-400/20 text-[#006699] dark:text-sky-300 text-xs font-bold shrink-0">
                            <Check className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Selected</span>
                          </div>
                        )}
                      </button>
                    )
                  })}
              </div>
            </div>
          </>
        )}
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
            <Field
              label={isTwins ? "Name of Child 1" : "Name of the Child"}
              required
              error={isChildNameErr}
              errorText={
                isChildNameEmpty
                  ? (isTwins ? 'Name of Child 1 is required' : 'Name of the child is required')
                  : isChildNameInvalid
                    ? 'Name of child  should only contain alphabets and spaces'
                    : undefined
              }
            >
              <TextField
                placeholder={isTwins ? "Enter full name of Child 1" : "Enter name of the child"}
                maxLength={20}
                value={childName}
                onChange={(val) => setChildName(val.replace(/[^a-zA-Z\s.]/g, '').slice(0, 20))}
                error={isChildNameErr}
              />
              <p className=" mt-1 font-medium text-blue-500"
                style={{
                  fontSize: "10px"
                }}>* Name should be as in Birth Certificate.</p>
            </Field>

            <Field
              label="Date of Birth"
              required
              error={isDobErr}
              errorText={isDobEmpty ? 'Date of Birth is required' : undefined}
            >
              <DobDateField
                id="childDob"
                placeholder="Select Date of Birth"
                value={dob}
                onChange={(val: string) => setDob(val)}
                error={isDobErr}
                min="2023-06-01"
                max="2024-05-31"
              />

              {/* <p className="text-[11px] text-slate-500 mt-1 font-medium">To edit, select dd/mm/yyyy again in the same order.</p> */}
            </Field>

            <Field label="Gender" required error={isGenderErr} errorText={isGenderErr ? 'Gender is required' : undefined}>
              <SelectField
                placeholder="Select gender"
                value={gender}
                onChange={setGender}
                options={genderOptions}
                error={isGenderErr}
              />
            </Field>

            <Field label="Mother Tongue" required error={isMotherTongueErr} errorText={isMotherTongueErr ? 'Mother Tongue is required' : undefined}>
              <SelectField
                placeholder="Select mother tongue"
                value={motherTongue}
                onChange={(val) => {
                  setMotherTongue(val)
                  if (!isOther(val) && setOtherMotherTongue) {
                    setOtherMotherTongue('')
                  }
                }}
                options={motherTongueOptions}
                error={isMotherTongueErr}
              />
            </Field>

            {/* Other Mother Tongue text field if Others is selected */}
            {isOther(motherTongue) && (
              <Field label="Specify Mother Tongue" required error={isOtherMotherTongueErr} errorText={isOtherMotherTongueErr ? 'Please specify mother tongue' : undefined}>
                <TextField
                  placeholder="Enter mother tongue"
                  maxLength={20}
                  value={otherMotherTongue}
                  onChange={(val) => (setOtherMotherTongue ? setOtherMotherTongue(val.replace(/[^a-zA-Z\s.]/g, '').slice(0, 20)) : null)}
                  error={isOtherMotherTongueErr}
                />
              </Field>
            )}

            <Field label="Nationality" required error={isNationalityErr} errorText={isNationalityErr ? 'Nationality is required' : undefined}>
              <SelectField
                value={nationality}
                onChange={(val) => {
                  setNationality(val)
                  if (!isOther(val) && setOtherNationality) {
                    setOtherNationality('')
                  }
                }}
                options={nationalityOptions}
                error={isNationalityErr}
              />
            </Field>

            {/* Other Nationality text field if Others is selected */}
            {isOther(nationality) && (
              <Field label="Specify Nationality" required error={isOtherNationalityErr} errorText={isOtherNationalityErr ? 'Please specify nationality' : undefined}>
                <TextField
                  placeholder="Enter nationality"
                  maxLength={20}
                  value={otherNationality}
                  onChange={(val) => (setOtherNationality ? setOtherNationality(val.replace(/[^a-zA-Z0-9\s]/g, '').slice(0, 20)) : null)}
                  error={isOtherNationalityErr}
                />
              </Field>
            )}

            <Field
              label="Passport No"
              required={isPassportRequired}
              error={isPassportErr}
              errorText={isPassportErr ? 'Passport Number is mandatory for Nationality Others' : undefined}
            >
              <TextField
                placeholder={isPassportRequired ? 'Enter passport number (required)' : 'Enter passport number (optional)'}
                maxLength={20}
                value={passportNo}
                onChange={(val) => (setPassportNo ? setPassportNo(val.replace(/[^a-zA-Z0-9\s]/g, '').slice(0, 20)) : null)}
                error={isPassportErr}
              />
            </Field>

            <Field label="Religion" required error={isReligionErr} errorText={isReligionErr ? 'Religion is required' : undefined}>
              <SelectField
                placeholder="Select religion"
                value={religion}
                onChange={(val) => {
                  setReligion(val)
                  if (!isOther(val) && setOtherReligion) {
                    setOtherReligion('')
                  }
                }}
                options={religionOptions}
                error={isReligionErr}
              />
            </Field>

            {/* Other Religion text field if Others is selected */}
            {isOther(religion) && (
              <Field label="Specify Religion" required error={isOtherReligionErr} errorText={isOtherReligionErr ? 'Please specify religion' : undefined}>
                <TextField
                  placeholder="Enter religion"
                  maxLength={20}
                  value={otherReligion}
                  onChange={(val) => (setOtherReligion ? setOtherReligion(val.replace(/[^a-zA-Z0-9\s]/g, '').slice(0, 20)) : null)}
                  error={isOtherReligionErr}
                />
              </Field>
            )}

            <Field label="Caste" required error={isCasteErr} errorText={isCasteErr ? 'Caste is required' : undefined}>
              <SelectField
                placeholder="Select caste"
                value={caste}
                onChange={(val) => {
                  setCaste(val)
                  if (!isOther(val) && setOtherCaste) {
                    setOtherCaste('')
                  }
                }}
                options={casteOptions}
                error={isCasteErr}
              />
            </Field>

            {/* Other Caste text field if Others is selected */}
            {isOther(caste) && (
              <Field label="Specify Caste" required error={isOtherCasteErr} errorText={isOtherCasteErr ? 'Please specify caste' : undefined}>
                <TextField
                  placeholder="Enter caste"
                  maxLength={20}
                  value={otherCaste}
                  onChange={(val) => (setOtherCaste ? setOtherCaste(val.replace(/[^a-zA-Z0-9\s]/g, '').slice(0, 20)) : null)}
                  error={isOtherCasteErr}
                />
              </Field>
            )}

            <Field label="Community" required error={isCommunityErr} errorText={isCommunityErr ? 'Community is required' : undefined}>
              <SelectField
                placeholder="Select community"
                value={community}
                onChange={(val) => {
                  setCommunity(val)
                  if (!isOther(val) && setOtherCommunity) {
                    setOtherCommunity('')
                  }
                }}
                options={communityOptions}
                error={isCommunityErr}
              />
            </Field>

            {isOther(community) && (
              <Field label="Specify Community" required error={isOtherCommunityErr} errorText={isOtherCommunityErr ? 'Please specify community' : undefined}>
                <TextField
                  placeholder="Enter community"
                  maxLength={100}
                  value={otherCommunity}
                  onChange={(val) => (setOtherCommunity ? setOtherCommunity(val.replace(/[^a-zA-Z0-9\s]/g, '').slice(0, 100)) : null)}
                  error={isOtherCommunityErr}
                />
              </Field>
            )}

          </div>
        </div>

        {/* 2. Additional Information Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#0F294A] border-b border-slate-100 pb-3">
            <School className="h-4 w-4 text-[#1677FF]" />
            <span>Additional Information</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Field label="Does the child go to any play school?" span={2}>
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
                    onChange={() => {
                      setChildGoesToSchool(false)
                      setPrevSchool('')
                    }}
                    className="text-blue-600 focus:ring-blue-500"
                  /> No
                </label>
              </div>
            </Field>

            <Field
              label="If Yes, Name of the School and Address"
              required={childGoesToSchool}
              span={2}
              error={isPrevSchoolErr}
              errorText={isPrevSchoolErr ? 'School name and address is required when Yes is selected' : undefined}
            >
              <TextField
                placeholder="Enter school name and address"
                disabled={!childGoesToSchool}
                maxLength={250}
                value={prevSchool}
                onChange={(val) => setPrevSchool(val.slice(0, 250))}
                error={isPrevSchoolErr}
              />
              <div className="flex justify-end text-[11px] text-slate-400 mt-0.5">
                {(prevSchool || '').length}/250
              </div>
            </Field>

            {/* Twins / Triplets / Quadruplets field (Moved to Additional Information) */}
            <Field label="Is the child one of Twins / Triplets / Quadruplets?" span={isTwins ? 2 : 4}>
              <div className="flex items-center gap-4 text-xs font-medium text-slate-700 mt-1">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="isTwinsOption"
                    checked={isTwins === true}
                    onChange={() => {
                      setIsTwins?.(true)
                      setTwinsNo?.(twinsNo && twinsNo !== '0' && twinsNo !== 0 ? twinsNo : 2)
                      setShowTwinsError(false)
                    }}
                    className="text-blue-600 focus:ring-blue-500"
                  /> Yes
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="isTwinsOption"
                    checked={isTwins === false}
                    onChange={() => {
                      setIsTwins?.(false)
                      setTwinsNo?.('')
                      setShowTwinsError(false)
                    }}
                    className="text-blue-600 focus:ring-blue-500"
                  /> No
                </label>
              </div>
            </Field>

            {isTwins && (
              <Field
                label="Multiple Birth Type"
                required
                span={2}
                error={isTwinsErr}
                errorText={isTwinsErr ? 'Please select multiple birth type' : undefined}
              >
                <SelectField
                  placeholder="-- Select --"
                  value={twinsNo && twinsNo !== '0' && twinsNo !== 0 ? String(twinsNo) : ''}
                  onChange={(val) => {
                    setTwinsNo?.(val ? Number(val) : '')
                    setShowTwinsError(false)
                  }}
                  options={[
                    { label: 'Twins (2)', value: '2' },
                    { label: 'Triplets (3)', value: '3' },
                    { label: 'Quadruplets (4)', value: '4' },
                  ]}
                  error={isTwinsErr}
                />
              </Field>
            )}

            {isTwins && twinsNo && Number(twinsNo) >= 2 && (
              <div className="col-span-full space-y-4 pt-1">
                {Array.from({ length: Math.min(3, Math.max(1, Number(twinsNo) - 1)) }).map((_, idx) => {
                  const childNum = idx + 2
                  const extraChild = additionalChildren?.[idx] || { name: '', gender: '', passportNo: '' }
                  const isChildNameErr = showErrors && isTwins && !extraChild.name?.trim()
                  const isChildGenderErr = showErrors && isTwins && !extraChild.gender

                  return (
                    <div
                      key={idx}
                      className="border border-blue-200 dark:border-blue-900 rounded-xl p-4 sm:p-5 bg-blue-50/40 dark:bg-blue-950/20 space-y-3"
                    >
                      <div className="flex items-center gap-2 text-xs font-bold text-blue-900 dark:text-blue-300 border-b border-blue-100 dark:border-blue-900/40 pb-2">
                        <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span>Child {childNum} Details</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        <Field
                          label={`Child ${childNum} Full Name`}
                          required
                          error={isChildNameErr}
                          errorText={isChildNameErr ? `Child ${childNum} name is required` : undefined}
                        >
                          <TextField
                            placeholder={`Enter child ${childNum} full name`}
                            maxLength={50}
                            value={extraChild.name || ''}
                            onChange={(val) =>
                              updateAdditionalChild
                                ? updateAdditionalChild(idx, 'name', val.replace(/[^a-zA-Z\s.]/g, '').slice(0, 50))
                                : undefined
                            }
                            error={isChildNameErr}
                          />
                        </Field>

                        <Field
                          label={`Child ${childNum} Gender`}
                          required
                          error={isChildGenderErr}
                          errorText={isChildGenderErr ? `Please select gender for Child ${childNum}` : undefined}
                        >
                          <SelectField
                            placeholder="-- Select Gender --"
                            value={extraChild.gender || ''}
                            onChange={(val) =>
                              updateAdditionalChild
                                ? updateAdditionalChild(idx, 'gender', val)
                                : undefined
                            }
                            options={genderOptions}
                            error={isChildGenderErr}
                          />
                        </Field>

                        <Field label={`Child ${childNum} Passport No`}>
                          <TextField
                            placeholder="Optional passport number"
                            maxLength={15}
                            value={extraChild.passportNo || ''}
                            onChange={(val) =>
                              updateAdditionalChild
                                ? updateAdditionalChild(idx, 'passportNo', val.toUpperCase().replace(/[^A-Z0-9]/g, ''))
                                : undefined
                            }
                          />
                        </Field>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            <Field label="Does the Child have school going Siblings?" span={4} error={isSiblingsErr} errorText={isSiblingsErr ? (isSiblingsEmpty ? "Please add sibling details or select No." : "Please fill in all mandatory sibling details.") : undefined}>
              <div className="flex items-center gap-4 text-xs font-medium text-slate-700 mt-1">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="hasSibling"
                    checked={hasSiblings === true}
                    onChange={() => {
                      setHasSiblings(true)
                      if (siblings.length === 0) addSibling()
                    }}
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
              <p className="text-[11px] text-slate-500 mt-1 font-medium">Cousins and other relations are not to be included.</p>
            </Field>

            {/* Sibling Table and Add Sibling Button - only displayed if Yes is selected */}
            {hasSiblings && (
              <>
                <div className="md:col-span-4 overflow-x-auto border border-slate-200 rounded-xl pt-1">
                  <table className="w-full text-left text-[11px]">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                        <th className="p-2 min-w-[140px]">Name of Sibling <span className="text-red-500">*</span></th>
                        <th className="p-2 min-w-[130px]">School Name <span className="text-red-500">*</span></th>
                        <th className="p-2 min-w-[130px]">Other School</th>
                        <th className="p-2 min-w-[90px]">Left School</th>
                        <th className="p-2 min-w-[100px]">USN</th>
                        <th className="p-2 min-w-[100px]">Class <span className="text-red-500">*</span></th>
                        <th className="p-2 min-w-[90px]">Section</th>
                        <th className="p-2 min-w-[110px]">Year of Leaving</th>
                        <th className="p-2 w-10 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {siblings.map((sib, index) => {
                        const isOtherSchool = isOther(sib.school)
                        const siblingSchool = siblingSchools.find((school) =>
                          [school.School, school.SchoolName, school.SchoolShortName]
                            .some((name) =>
                              name?.toLowerCase() === sib.school.toLowerCase() ||
                              (isOther(name) && isOther(sib.school))
                            )
                        )
                        const siblingSchoolId = sib.schoolId || siblingSchool?.SchoolID || 0
                        const rowStandardRecords = isOtherSchool
                          ? standardRecords
                          : (siblingStandards[siblingSchoolId] || [])
                        const selectedStandard = rowStandardRecords.find((standard) =>
                          standard.StandardName.toLowerCase() === sib.classSec.toLowerCase() &&
                          (sib.classId == null || standard.StandardID === sib.classId)
                        ) || rowStandardRecords.find((standard) =>
                          standard.StandardName.toLowerCase() === sib.classSec.toLowerCase()
                        )
                        const sectionKey = `${siblingSchoolId}:${selectedStandard?.StandardID || 0}`
                        const rowSections = siblingSections[sectionKey] || []
                        const rowSectionOptions = rowSections.map((section) => section.SectionName)
                        const branchInitial = getBranchInitial(sib.school)
                        const sibUsnRegex = branchInitial ? new RegExp('^' + branchInitial + '\\d{6}$', 'i') : USN_REGEX
                        const hasSiblingName = Boolean(sib.name?.trim())
                        const isUsnInvalid = showErrors && !isOtherSchool && Boolean(sib.usn?.trim()) && !sibUsnRegex.test(sib.usn.trim())
                        const isNameMissing = showErrors && !hasSiblingName && (!siblings.some(s => s.name?.trim()) || siblings.length === 1)
                        const isSchoolMissing = showErrors && hasSiblingName && !sib.school
                        const isClassMissing = showErrors && hasSiblingName && !sib.classSec
                        const isOtherSchoolMissing = showErrors && hasSiblingName && isOtherSchool && !sib.schoolName?.trim()

                        return (
                          <tr key={index} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                            {/* 1. Name of Sibling */}
                            <td className="p-1.5">
                              <TextField
                                placeholder="Sibling name"
                                value={sib.name}
                                onChange={(val) => {
                                  if (!hasSiblings) setHasSiblings(true)
                                  const upperValue = val.toUpperCase()
                                  if (/^[KSN]?\d{0,6}$/.test(upperValue)) {
                                    updateSibling(index, 'usn', upperValue)
                                  }
                                }}
                                error={isNameMissing}
                              />
                            </td>
                            {/* 2. School Name */}
                            <td className="p-1.5">
                              <SelectField
                                value={sib.school}
                                error={isSchoolMissing}
                                onChange={(val) => {
                                  if (!hasSiblings) setHasSiblings(true)
                                  updateSibling(index, 'school', val)
                                  const matchedSchool = siblingSchools.find((school) =>
                                    [school.School, school.SchoolName, school.SchoolShortName]
                                      .some((name) =>
                                        name?.toLowerCase() === val.toLowerCase() ||
                                        (isOther(name) && isOther(val))
                                      )
                                  )
                                  const isOtherSchool = isOther(val)
                                  const schoolId = matchedSchool?.SchoolID || 0
                                  updateSibling(index, 'schoolId', schoolId)
                                  updateSibling(index, 'schoolName', isOtherSchool ? sib.schoolName || '' : '')
                                  updateSibling(index, 'usn', '')
                                  updateSibling(index, 'classSec', '')
                                  updateSibling(index, 'classId', undefined)
                                  updateSibling(index, 'section', '')
                                  updateSibling(index, 'sectionId', undefined)
                                  if (schoolId) {
                                    void loadSiblingStandards(schoolId).catch(() => undefined)
                                  }
                                }}
                                options={siblingSchoolOptions}
                              />
                            </td>
                            {/* 3. Other School Name */}
                            <td className="p-1.5">
                              <TextField
                                placeholder={isOtherSchool ? "Enter school name" : "N/A"}
                                disabled={!isOtherSchool}
                                value={isOtherSchool ? (sib.schoolName || '') : ''}
                                onChange={(val) => updateSibling(index, 'schoolName', val)}
                                error={isOtherSchoolMissing}
                                className={!isOtherSchool ? "bg-slate-100 text-slate-400 cursor-not-allowed" : ""}
                              />
                            </td>
                            {/* 4. Left School */}
                            <td className="p-1.5">
                              <SelectField
                                value={sib.leftStudent}
                                onChange={(val) => {
                                  if (!hasSiblings) setHasSiblings(true)
                                  updateSibling(index, 'leftStudent', val)
                                  if (val === 'No') {
                                    updateSibling(index, 'yearLeaving', '')
                                  }
                                }}
                                options={['No', 'Yes']}
                              />
                            </td>
                            {/* 5. USN */}
                            <td className="p-1.5">
                              <TextField
                                placeholder={isOtherSchool ? 'Disabled for Others' : (branchInitial ? `${branchInitial}123456` : 'T123456')}
                                disabled={isOtherSchool}
                                maxLength={7}
                                value={isOtherSchool ? '' : (sib.usn || '')}
                                className={isOtherSchool ? "bg-slate-100 text-slate-400 cursor-not-allowed" : ""}
                                onChange={(val) => {
                                  if (!hasSiblings) setHasSiblings(true)
                                  updateSibling(index, 'usn', val.replace(/[^a-zA-Z0-9]/g, '').slice(0, 7).toUpperCase())
                                }}
                                error={!isOtherSchool && isUsnInvalid}
                              />
                            </td>
                            {/* 6. Class */}
                            <td className="p-1.5">
                              <SelectField
                                placeholder="Class"
                                disabled={!sib.school || (!isOtherSchool && (
                                  !siblingSchoolId ||
                                  siblingStandards[siblingSchoolId] === undefined ||
                                  loadingSiblingStandards[siblingSchoolId]
                                ))}
                                value={sib.classSec}
                                onChange={(val) => {
                                  if (!hasSiblings) setHasSiblings(true)
                                  updateSibling(index, 'classSec', val)
                                  const nextStandard = rowStandardRecords.find(
                                    (standard) => standard.StandardName.toLowerCase() === val.toLowerCase()
                                  )
                                  updateSibling(index, 'classId', nextStandard?.StandardID)
                                  updateSibling(index, 'section', '')
                                  updateSibling(index, 'sectionId', undefined)
                                  if (siblingSchoolId && nextStandard && !isOtherSchool) {
                                    void loadSiblingSections(siblingSchoolId, nextStandard.StandardID).catch(() => undefined)
                                  }
                                }}
                                options={isOtherSchool ? standardOptions : rowStandardRecords.map((standard) => standard.StandardName)}
                                error={isClassMissing}
                              />
                            </td>
                            {/* 7. Section */}
                            <td className="p-1.5">
                              <SelectField
                                placeholder={isOtherSchool ? 'Disabled for Others' : 'Sec'}
                                disabled={!sib.classSec || isOtherSchool || !selectedStandard || (
                                  siblingSections[sectionKey] === undefined ||
                                  loadingSiblingSections[sectionKey]
                                )}
                                value={isOtherSchool ? '' : (sib.section || '')}
                                className={isOtherSchool ? "bg-slate-100 text-slate-400 cursor-not-allowed" : ""}
                                onChange={(val) => {
                                  if (!hasSiblings) setHasSiblings(true)
                                  updateSibling(index, 'section', val)
                                  const selectedSection = rowSections.find(
                                    (section) => section.SectionName.toLowerCase() === val.toLowerCase()
                                  )
                                  updateSibling(index, 'sectionId', selectedSection?.SectionID)
                                }}
                                options={rowSectionOptions}
                                error={false}
                              />
                            </td>
                            {/* 8. Year of Leaving */}
                            <td className="p-1.5">
                              <SelectField
                                value={sib.yearLeaving}
                                placeholder="Year"
                                disabled={sib.leftStudent !== 'Yes'}
                                onChange={(val) => {
                                  if (!hasSiblings) setHasSiblings(true)
                                  updateSibling(index, 'yearLeaving', val)
                                }}
                                options={leftYearOptions}
                              />
                            </td>
                            {/* 9. Action */}
                            <td className="p-1.5 text-center">
                              {!isReadOnly && (
                                <button
                                  type="button"
                                  onClick={() => removeSibling(index)}
                                  title="Remove Sibling"
                                  aria-label="Remove Sibling"
                                  className="w-7 h-7 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors flex items-center justify-center cursor-pointer mx-auto"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {!isReadOnly && (
                  <div className="md:col-span-4 flex items-center justify-between pt-1">
                    {siblings.length < 4 ? (
                      <button
                        type="button"
                        onClick={() => {
                          setHasSiblings(true)
                          addSibling()
                        }}
                        className="text-xs font-bold text-[#1677FF] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <PlusCircle className="h-3.5 w-3.5" /> Add Sibling ({siblings.length}/4)
                      </button>
                    ) : (
                      <span className="text-xs text-amber-600 font-semibold">
                        Maximum of 4 siblings reached
                      </span>
                    )}
                    {/* <span className="text-[11px] text-red-400">
                      *For PSBB students, USN must start with the 1st letter of the chosen branch followed by 6 digits (e.g. T1234567).
                    </span> */}
                  </div>
                )}
              </>
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
                    onChange={() => {
                      setIsHealthy(true)
                      setMajorAilment('')
                      setShowAilmentError(false)
                    }}
                    className="text-blue-600 focus:ring-blue-500"
                  /> Yes
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="healthyChild"
                    checked={isHealthy === false}
                    onChange={() => {
                      setIsHealthy(false)
                      setShowAilmentError(false)
                    }}
                    className="text-blue-600 focus:ring-blue-500"
                  /> No
                </label>
              </div>
            </Field>

            <Field
              label="Specify Major ailment, if any (Past/Present)"
              required={!isHealthy}
              span={2}
              error={isMajorAilmentErr}
              errorText={isMajorAilmentErr ? 'Please specify major ailment when child is not healthy' : undefined}
            >
              <TextField
                placeholder={isHealthy ? 'N/A - Child is healthy' : 'Enter major ailment'}
                disabled={isHealthy}
                value={majorAilment}
                onChange={(val) => {
                  setMajorAilment(val)
                  if (val.trim()) setShowAilmentError(false)
                }}
                error={isMajorAilmentErr}
              />
            </Field>
          </div>
        </div>

      </fieldset>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-3">
        {!isReadOnly && (
          <>
            {onClear && (
              <button
                type="button"
                onClick={onClear}
                className="h-9 px-4 rounded-xl text-xs font-semibold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer flex items-center gap-1.5 bg-white dark:bg-slate-900"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Clear
              </button>
            )}
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
