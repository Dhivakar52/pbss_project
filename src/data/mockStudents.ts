export interface StudentRecord {
  id: string
  slNo: number
  registrationNumber: string
  studentName: string
  schoolBranch: string
  academicYear: string
  gender: 'Male' | 'Female'
  motherTongue: string
  applicationStatus: 'Declared' | 'Pending' | 'Approved' | 'Draft' | 'Rejected'
  date: string
  trackSheet: boolean
  registrationForm: boolean
  status1?: boolean
  status2?: boolean
  fatherName: string
  motherName: string
  mobile: string
  city: string
  area: string
  pincode?: string
  playSchool: boolean
  physicallyChallenged: boolean
  twinsTriplets: boolean
  alumni: boolean
  siblingsStudying: boolean
  distanceKm: string
  incomeRange: string
  religion: string
  caste: string
  community: string
}

// All dummy hardcoded data removed. Only real records fetched from DB will be stored.
export const mockStudents: StudentRecord[] = []
