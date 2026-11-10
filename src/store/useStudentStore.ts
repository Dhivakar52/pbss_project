import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { StudentRecord } from '@/data/mockStudents'
import { StudentService } from '@/services/student.service'

interface StudentState {
  students: StudentRecord[]
  isLoading: boolean

  // Selectors / Actions
  getStudentById: (id: string) => StudentRecord | undefined
  addStudent: (payload: Partial<StudentRecord>) => StudentRecord
  updateStudent: (id: string, updates: Partial<StudentRecord>) => StudentRecord | undefined
  deleteStudent: (id: string) => boolean
  bulkUpdateStudents: (
    applnNumbers: number[],
    fieldOrUpdates: string | Partial<StudentRecord>,
    value?: any
  ) => number
  mergeServerRecords: (serverRecords: any[]) => void
  setMasterStudents: (serverApplicants: any[]) => void
  resetStudents: () => void
}

export const useStudentStore = create<StudentState>()(
  persist(
    (set, get) => ({
      students: [],
      isLoading: false,

      getStudentById: (id: string) => {
        const { students } = get()
        return StudentService.findById(id, students)
      },

      addStudent: (payload: Partial<StudentRecord>) => {
        const { students } = get()
        const newRecord = StudentService.buildRecord(payload, students)

        set({
          students: [newRecord, ...students], // Add to top so immediately visible in table
        })

        return newRecord
      },

      updateStudent: (id: string, updates: Partial<StudentRecord>) => {
        const { students } = get()
        const existing = StudentService.findById(id, students)
        if (!existing) return undefined

        const updated: StudentRecord = { ...existing, ...updates }

        set({
          students: students.map((s) => (s.id === existing.id ? updated : s)),
        })

        return updated
      },

      deleteStudent: (id: string) => {
        const { students } = get()
        const existing = StudentService.findById(id, students)
        if (!existing) return false

        set({
          students: students.filter((s) => s.id !== existing.id),
        })

        return true
      },

      bulkUpdateStudents: (
        applnNumbers: number[],
        fieldOrUpdates: string | Partial<StudentRecord>,
        value?: any
      ) => {
        const { students } = get()
        const { updatedCount, updatedList } = StudentService.bulkUpdateStudents(
          students,
          applnNumbers,
          fieldOrUpdates,
          value
        )
        if (updatedCount > 0) {
          set({ students: updatedList })
        }
        return updatedCount
      },

      mergeServerRecords: (serverRecords: any[]) => {
        if (!Array.isArray(serverRecords) || serverRecords.length === 0) return
        const { students } = get()
        const updated = [...students]
        serverRecords.forEach((sr) => {
          const regNo = sr.ApplicationNo || sr.applicationNo || sr.registrationNumber
          if (!regNo) return
          const idx = updated.findIndex(
            (s) => s.registrationNumber === regNo || s.id === String(sr.ApplicantID || sr.AppDeclaredID || sr.applicantID)
          )
          const isTrackSheet = sr.TrackSheetStatus === 'Yes' || sr.TrackSheetStatus === true
          const isCert = sr.CertificateSubmissionStatus === 'Yes' || sr.CertificateSubmissionStatus === true

          if (idx >= 0) {
            updated[idx] = {
              ...updated[idx],
              studentName: sr.StudentName || sr.ChildName || updated[idx].studentName,
              schoolBranch: sr.School || sr.BranchName || updated[idx].schoolBranch,
              trackSheet: isTrackSheet,
              registrationForm: isCert,
              status1: isTrackSheet,
              status2: isCert,
            }
          } else {
            updated.push({
              id: String(sr.ApplicantID || sr.AppDeclaredID || regNo || ''),
              registrationNumber: String(regNo || ''),
              studentName: sr.StudentName || sr.ChildName || '',
              schoolBranch: sr.School || sr.BranchName || '',
              academicYear: sr.AcademicYear || '',
              date: sr.DateOfBirth || '',
              gender: sr.Gender || '',
              trackSheet: isTrackSheet,
              registrationForm: isCert,
              status1: isTrackSheet,
              status2: isCert,
              applicationStatus: sr.ApplicationStatus || (sr.IsAdmissionApproved ? 'Approved' : 'Pending'),
              fatherName: sr.FatherName || '',
              motherName: sr.MotherName || '',
              mobile: sr.MobileNo || '',
              city: sr.City || '',
            } as unknown as StudentRecord)
          }
        })
        set({ students: updated })
      },

      setMasterStudents: (serverApplicants: any[]) => {
        if (!Array.isArray(serverApplicants)) return
        const mapped = serverApplicants.map((raw, idx) => mapApplicantToStudentRecord(raw, idx))
        set({ students: mapped })
      },

      resetStudents: () => {
        set({ students: [] })
      },
    }),
    {
      name: 'pbss_students_master',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        students: state.students,
      }),
    }
  )
)

export function mapApplicantToStudentRecord(raw: any, index: number): StudentRecord {
  const fatherObj = Array.isArray(raw.Father) ? raw.Father[0] : (raw.Father || {})
  const motherObj = Array.isArray(raw.Mother) ? raw.Mother[0] : (raw.Mother || {})
  const guardianObj = Array.isArray(raw.Guardian) ? raw.Guardian[0] : (raw.Guardian || {})
  const siblingsArr = Array.isArray(raw.Siblings) ? raw.Siblings : []
  const secStatus = Array.isArray(raw.ApplicationSectionStatus) ? raw.ApplicationSectionStatus : []

  const isTrackSheet = secStatus.some((s: any) =>
    (s.ApplicationSectionID === 6 || String(s.AppSectionName || '').toLowerCase().includes('track')) && s.SectionStatus === 'Done'
  )
  const isRegForm = secStatus.some((s: any) =>
    (s.ApplicationSectionID === 7 || String(s.AppSectionName || '').toLowerCase().includes('registration form')) && s.SectionStatus === 'Done'
  )
  const isDeclared = secStatus.some((s: any) =>
    (s.ApplicationSectionID === 5 || String(s.AppSectionName || '').toLowerCase().includes('declaration')) && s.SectionStatus === 'Done'
  )

  const fatherIncome = fatherObj?.IncomeRange || ''
  const motherIncome = motherObj?.IncomeRange || ''
  const incomeRange = fatherIncome || motherIncome || ''

  const fatherAlumnus = fatherObj?.IsAlumnus === 'Yes' || fatherObj?.IsAlumnus === true || fatherObj?.IsAlumnus === 1
  const motherAlumnus = motherObj?.IsAlumnus === 'Yes' || motherObj?.IsAlumnus === true || motherObj?.IsAlumnus === 1
  const isAlumni = fatherAlumnus || motherAlumnus

  const hasSiblings = raw.SchoolGoingSibilings === 'Yes' || siblingsArr.length > 0

  const regNo = raw.ApplicationNo || (raw.ApplicantID ? `T25-${String(raw.ApplicantID).padStart(4, '0')}` : '')

    const rawAddress = String(raw.ResAddress || '').trim()
    const rawCity = String(raw.City || '').trim()
    const addressParts = rawAddress.split(',').map((p: string) => p.trim()).filter(Boolean)
    const inferredCity = rawCity || (addressParts.length > 1 ? addressParts[addressParts.length - 1] : '')

    let cleanArea = String(raw.ResLandmark || '').trim()
    if (!cleanArea && rawAddress) {
      if (inferredCity && addressParts.length > 1 && addressParts[addressParts.length - 1].toLowerCase() === inferredCity.toLowerCase()) {
        cleanArea = addressParts.slice(0, -1).join(', ')
      } else {
        cleanArea = rawAddress
      }
    }

    return {
      id: String(raw.ApplicantID || ''),
      slNo: index + 1,
      registrationNumber: regNo,
      studentName: raw.ChildName || '',
      schoolBranch: raw.School || raw.BranchName || '',
      academicYear: raw.AcademicYear || '',
      gender: (raw.Gender || '') as 'Male' | 'Female',
      motherTongue: raw.MotherTongue || '',
      applicationStatus: isDeclared ? 'Declared' : 'Pending',
      date: raw.ChildDOB || '',
      trackSheet: isTrackSheet,
      registrationForm: isRegForm,
      status1: isTrackSheet,
      status2: isRegForm,
      fatherName: fatherObj?.FullName || '',
      motherName: motherObj?.FullName || '',
      mobile: fatherObj?.MobileNo || motherObj?.MobileNo || guardianObj?.MobileNo || '',
      city: inferredCity,
      area: cleanArea,
    playSchool: raw.ChildGotoPlaySchool === 'Yes',
    physicallyChallenged: raw.IsNormalChild === 'No',
    twinsTriplets: raw.IsTwins === 'Yes',
    alumni: isAlumni,
    siblingsStudying: hasSiblings,
    distanceKm: raw.Distance || '',
    incomeRange: incomeRange,
    religion: raw.Religion || '',
    caste: raw.Caste || '',
    community: raw.Community || '',
    // Additional fields for complete form preview/edit in HomeModule
    ...raw,
    fatherTitle: fatherObj?.Title || '',
    fatherDob: fatherObj?.DOB || '',
    fatherQualification: fatherObj?.EducationalQualification || '',
    fatherUniversity: fatherObj?.UniversityOrInstitution || '',
    fatherDesignation: fatherObj?.Designation || '',
    fatherOccupation: fatherObj?.Occupation || '',
    fatherCompany: fatherObj?.CompanyName || '',
    motherTitle: motherObj?.Title || '',
    motherDob: motherObj?.DOB || '',
    motherQualification: motherObj?.EducationalQualification || '',
    motherUniversity: motherObj?.UniversityOrInstitution || '',
    motherDesignation: motherObj?.Designation || '',
    motherOccupation: motherObj?.Occupation || '',
    guardianApplicable: guardianObj?.IsGuardianApplicable === 'Yes',
    guardianReason: guardianObj?.GuardianReason || '',
    guardianTitle: guardianObj?.Title || '',
    guardianName: guardianObj?.FullName || '',
    guardianMobile: guardianObj?.MobileNo || '',
    guardianAddress: guardianObj?.CompanyAddress || '',
    pincode: raw.ResPincode || '',
    commuteMode: raw.TransportMode ? [raw.TransportMode] : [],
  }
}
