export interface Step {
  id: number
  title: string
  status: 'PENDING' | 'OPTIONAL' | 'COMPLETED'
  hasSubChevron?: boolean
}

export interface Sibling {
  name: string
  school: string
  leftStudent: string
  usn: string
  classSec: string
  yearLeaving: string
}

export interface FatherDetailsState {
  title: string
  initials: string
  name: string
  dob: string
  isAlumnus: boolean
  yearsStudied: string
  classLastStudied: string
  yearOfLeaving: string
  branch: string
  reasonForLeaving: string
  qualification: string
  university: string
  occupation: string
  employmentCategory: string
  designation: string
  companyName: string
  officeAddress: string
  monthlyIncome: string
  phoneOff: string
  mobileNo: string
}

export interface MotherDetailsState {
  title: string
  initials: string
  name: string
  dob: string
  isAlumnus: boolean
  yearsStudied: string
  classLastStudied: string
  yearOfLeaving: string
  branch: string
  reasonForLeaving: string
  qualification: string
  university: string
  isEmployed: boolean
  occupation: string
  employmentCategory: string
  designation: string
  companyName: string
  officeAddress: string
  monthlyIncome: string
  phoneOff: string
  mobileNo: string
}

export interface GuardianDetailsState {
  isApplicable: boolean
  reason: string
  gender: string
  title: string
  initials: string
  name: string
  isEmployed: boolean
  occupation: string
  companyName: string
  monthlyIncome: string
  officeAddress: string
  phoneOff: string
  phoneRes: string
  mobileNo: string
}

export interface CommunicationDetailsState {
  address: string
  pincode: string
  residencePhone: string
  landmark: string
  distanceKm: string
  commuteMode: string[]
  parentAchievements: string
  isTransferFromOutside: boolean
}
