import { create } from 'zustand'
import {
  ApiService,
  type MasterSchool,
  type MasterAcademicYear,
  type MasterDistance,
  type MasterCaste,
  type MasterLookup,
  type MasterStandard,
  type MasterMotherTongue,
  type MasterIncomeRange,
  type MasterLeftYear,
} from '@/services/api.service'

const SCHOOL_DROPDOWN_TYPE = {
  applying: 1,
  sibling: 2,
  parent: 3,
} as const

interface MasterState {
  schools: MasterSchool[]
  applyingSchools: MasterSchool[]
  siblingSchools: MasterSchool[]
  parentSchools: MasterSchool[]
  academicYears: MasterAcademicYear[]
  distances: MasterDistance[]
  castes: MasterCaste[]
  lookups: MasterLookup[]
  standards: MasterStandard[]
  motherTongues: MasterMotherTongue[]
  incomeRanges: MasterIncomeRange[]
  leftYears: MasterLeftYear[]
  isLoading: boolean
  isLoaded: boolean
  admissionSchoolAddress: string
  setAdmissionSchoolAddress: (address: string) => void

  fetchMasters: () => Promise<void>
  fetchStandardsBySchool: (schoolId?: number) => Promise<MasterStandard[]>

  // Reactive options slices populated directly from API
  genderOptions: string[]
  nationalityOptions: string[]
  religionOptions: string[]
  communityOptions: string[]
  titleOptions: string[]
  transportModeOptions: string[]
  leavingReasonOptions: string[]
  employmentCategoryOptions: string[]
  sectionOptions: string[]
  applicationStatusOptions: string[]
  siblingTypeOptions: string[]
  siblingsSchoolOptions: string[]

  schoolNames: string[]
  siblingSchoolNames: string[]
  parentSchoolNames: string[]
  academicYearNames: string[]
  distanceNames: string[]
  casteNames: string[]
  standardNames: string[]
  motherTongueNames: string[]
  incomeRangeNames: string[]
  leftYearStrings: string[]

  // Lookups helper selectors
  getLookupsByRefId: (refId: number) => string[]
  getGenderOptions: () => string[]
  getNationalityOptions: () => string[]
  getReligionOptions: () => string[]
  getCommunityOptions: () => string[]
  getTitleOptions: () => string[]
  getTransportModeOptions: () => string[]
  getLeavingReasonOptions: () => string[]
  getEmploymentCategoryOptions: () => string[]
  getSectionOptions: () => string[]
  getApplicationStatusOptions: () => string[]
  getSiblingTypeOptions: () => string[]
  getSiblingsSchoolOptions: () => string[]

  // Entity helper selectors
  getSchoolNames: () => string[]
  getAcademicYearNames: () => string[]
  getDistanceNames: () => string[]
  getCasteNames: () => string[]
  getStandardNames: () => string[]
  getMotherTongueNames: () => string[]
  getIncomeRangeNames: () => string[]
  getLeftYearStrings: () => string[]
}

export const useMasterStore = create<MasterState>((set, get) => ({
  schools: [],
  applyingSchools: [],
  siblingSchools: [],
  parentSchools: [],
  academicYears: [],
  distances: [],
  castes: [],
  lookups: [],
  standards: [],
  motherTongues: [],
  incomeRanges: [],
  leftYears: [],
  isLoading: false,
  isLoaded: false,
  admissionSchoolAddress: '',
  setAdmissionSchoolAddress: (admissionSchoolAddress) => set({ admissionSchoolAddress }),

  genderOptions: [],
  nationalityOptions: [],
  religionOptions: [],
  communityOptions: [],
  titleOptions: [],
  transportModeOptions: [],
  leavingReasonOptions: [],
  employmentCategoryOptions: [],
  sectionOptions: [],
  applicationStatusOptions: [],
  siblingTypeOptions: [],
  siblingsSchoolOptions: [],

  schoolNames: [],
  siblingSchoolNames: [],
  parentSchoolNames: [],
  academicYearNames: [],
  distanceNames: [],
  casteNames: [],
  standardNames: [],
  motherTongueNames: [],
  incomeRangeNames: [],
  leftYearStrings: [],

  fetchMasters: async () => {
    if (get().isLoaded || get().isLoading) return

    set({ isLoading: true })
    try {
      const [
        schools,
        applyingSchools,
        siblingSchools,
        parentSchools,
        academicYears,
        distances,
        castes,
        lookups,
        standards,
        motherTongues,
        incomeRanges,
        leftYears,
      ] = await Promise.all([
        ApiService.getSchools(),
        ApiService.getSchools(SCHOOL_DROPDOWN_TYPE.applying),
        ApiService.getSchools(SCHOOL_DROPDOWN_TYPE.sibling),
        ApiService.getSchools(SCHOOL_DROPDOWN_TYPE.parent),
        ApiService.getAcademicYears(),
        ApiService.getDistances(),
        ApiService.getCastes(),
        ApiService.getLookups(),
        ApiService.getStandards(),
        ApiService.getMotherTongues(),
        ApiService.getIncomeRanges(),
        ApiService.getLeftYears(),
      ])

      const filterLookups = (refId: number) =>
        lookups.filter((l) => l.LookupRefID === refId && l.LookupValue).map((l) => l.LookupValue)

      const schoolNames = schools.map((s) => s.School || s.SchoolName || s.SchoolShortName || '').filter(Boolean)
      const siblingSchoolNames = siblingSchools.map((s) => s.School || s.SchoolName || s.SchoolShortName || '').filter(Boolean)
      const parentSchoolNames = parentSchools.map((s) => s.School || s.SchoolName || s.SchoolShortName || '').filter(Boolean)
      const academicYearNames = academicYears.map((a) => a.AcademicYear).filter(Boolean)
      const distanceNames = distances.map((d) => d.DistanceName).filter(Boolean)
      const casteNames = castes.map((c) => c.CasteName).filter(Boolean)
      const standardNames = standards.map((s) => s.StandardName).filter(Boolean)
      const motherTongueNames = motherTongues.map((m) => m.MotherTongueName).filter(Boolean)
      const incomeRangeNames = incomeRanges.map((i) => i.IncomeRange).filter(Boolean)
      const leftYearStrings = leftYears.map((y) => String(y.YearValue)).filter(Boolean)

      const genderOptions = filterLookups(2)
      const nationalityOptions = filterLookups(3)
      const religionOptions = filterLookups(4)
      const communityOptions = filterLookups(5)
      const titleOptions = filterLookups(6)
      const transportModeOptions = filterLookups(7)
      const leavingReasonOptions = filterLookups(8)
      const employmentCategoryOptions = filterLookups(9)
      const sectionOptions = filterLookups(10)
      const applicationStatusOptions = filterLookups(11)
      const siblingTypeOptions = filterLookups(12)
      const siblingsSchoolOptions = filterLookups(13)

      set({
        schools,
        applyingSchools,
        siblingSchools,
        parentSchools,
        academicYears,
        distances,
        castes,
        lookups,
        standards,
        motherTongues,
        incomeRanges,
        leftYears,

        schoolNames,
        siblingSchoolNames,
        parentSchoolNames,
        academicYearNames,
        distanceNames,
        casteNames,
        standardNames,
        motherTongueNames,
        incomeRangeNames,
        leftYearStrings,

        genderOptions,
        nationalityOptions,
        religionOptions,
        communityOptions,
        titleOptions,
        transportModeOptions,
        leavingReasonOptions,
        employmentCategoryOptions,
        sectionOptions,
        applicationStatusOptions,
        siblingTypeOptions,
        siblingsSchoolOptions,

        isLoading: false,
        isLoaded: true,
      })
    } catch (err) {
      console.error('Failed to load master data:', err)
      set({ isLoading: false })
    }
  },

  fetchStandardsBySchool: async (schoolId?: number) => {
    try {
      const records = await ApiService.getStandards(schoolId)
      return records
    } catch (err) {
      console.error(`Failed to fetch standards for school ${schoolId}:`, err)
      return []
    }
  },

  getLookupsByRefId: (refId: number) => {
    return get()
      .lookups.filter((l) => l.LookupRefID === refId && l.LookupValue)
      .map((l) => l.LookupValue)
  },

  getGenderOptions: () => get().genderOptions,
  getNationalityOptions: () => get().nationalityOptions,
  getReligionOptions: () => get().religionOptions,
  getCommunityOptions: () => get().communityOptions,
  getTitleOptions: () => get().titleOptions,
  getTransportModeOptions: () => get().transportModeOptions,
  getLeavingReasonOptions: () => get().leavingReasonOptions,
  getEmploymentCategoryOptions: () => get().employmentCategoryOptions,
  getSectionOptions: () => get().sectionOptions,
  getApplicationStatusOptions: () => get().applicationStatusOptions,
  getSiblingTypeOptions: () => get().siblingTypeOptions,
  getSiblingsSchoolOptions: () => get().siblingsSchoolOptions,

  getSchoolNames: () => get().schoolNames,
  getAcademicYearNames: () => get().academicYearNames,
  getDistanceNames: () => get().distanceNames,
  getCasteNames: () => get().casteNames,
  getStandardNames: () => get().standardNames,
  getMotherTongueNames: () => get().motherTongueNames,
  getIncomeRangeNames: () => get().incomeRangeNames,
  getLeftYearStrings: () => get().leftYearStrings,
}))

// Auto-trigger master data fetch immediately on module load
useMasterStore.getState().fetchMasters()
