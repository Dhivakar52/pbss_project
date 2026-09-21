import type { StudentRecord } from '@/data/mockStudents'

export interface SiblingPrintRow {
  name: string
  school: string
  usn: string
  classSec: string
  leavingDetails?: string
  leavingYearAndClass?: string
}

export interface TrackSheetData {
  registrationNo: string
  childName: string
  dob: string
  gender: string
  motherTongue: string
  religion: string
  caste: string
  residentialAddress: string
  fatherMobile: string
  motherMobile: string
  distanceFromResidence: string
  modeOfTransport: string
  hasSiblings: string
  hasSchoolGoingSiblings?: boolean | string
  siblings: SiblingPrintRow[]
  fatherName: string
  fatherQualification: string
  fatherDesignation: string
  fatherIncome: string
  motherName: string
  motherQualification: string
  motherDesignation: string
  motherIncome: string
  isFatherAlumnus: string
  fatherAlumnus?: boolean | string
  isMotherAlumnus: string
  motherAlumnus?: boolean | string
  fatherPassingYear: string
  motherPassingYear: string
  fatherYearsStudied: string
  motherYearsStudied: string
  fatherClassLastStudied: string
  motherClassLastStudied: string
  fatherBranch: string
  motherBranch: string
  fatherReasonForLeaving: string
  fatherReasonLeaving?: string
  motherReasonForLeaving: string
  motherReasonLeaving?: string
  isNormalHealthyChild: string
  majorAilment: string
  dateOfSubmission: string
  submissionTimings: string
  timings?: string
  schoolAppliedFor: string
  academicYear: string
}

export interface RegistrationFormData extends TrackSheetData {
  passportNo: string
  nationality: string
  community: string
  doesChildGoToPlaySchool: string
  goesToPlaySchool?: boolean | string
  playSchoolName: string
  isTwinsTriplets: string
  isMultipleBirth?: boolean | string
  fatherDob: string
  motherDob: string
  fatherUniversity: string
  motherUniversity: string
  fatherOccupation: string
  isMotherEmployed: string
  motherOccupation: string
  fatherEmploymentCategory: string
  motherEmploymentCategory: string
  fatherCompany: string
  motherCompany: string
  fatherOfficeAddress: string
  motherOfficeAddress: string
  fatherPhoneOff: string
  fatherPhoneOffice?: string
  motherPhoneOff: string
  motherPhoneOffice?: string
  guardianName: string
  guardianGender: string
  guardianOccupation: string
  guardianCompany: string
  guardianMonthlyIncome: string
  guardianIncome?: string
  guardianOfficeAddress: string
  guardianPhoneOff: string
  guardianPhoneOffice?: string
  guardianPhoneRes: string
  guardianMobile: string
  residenceTelephone: string
  landmark: string
  importantLandmark?: string
  parentAchievements: string
  isComingOnTransfer: string
  isTransferParent?: boolean | string
}

/**
 * Format a date string to DD/MM/YYYY
 */
export function formatPrintDate(dateStr?: string): string {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    return `${day}/${month}/${year}`
  } catch {
    return dateStr
  }
}

/**
 * Maps a student record to TrackSheetData structure
 */
export function mapStudentToTrackSheet(student: StudentRecord | any): TrackSheetData {
  if (!student) {
    throw new Error('Student data is required for Track Sheet mapping')
  }

  const s = student
  const hasSiblingsStudying =
    s.siblingsStudying ||
    s.siblings_flag === 'Yes' ||
    s.SIBLINGS_FLAG === 'Yes' ||
    Boolean(s.sibling_name || s.SIBLING_NAME)

  const siblingRows: SiblingPrintRow[] = [
    {
      name: s.sibling_name || s.SIBLING_NAME || (hasSiblingsStudying ? 'Sibling' : ''),
      school: s.schoolBranch || 'T.Nagar-PSBB',
      usn: s.usn || s.USN || (hasSiblingsStudying ? 'USN-8821' : ''),
      classSec: s.class_and_sec || s.CLASS_AND_SEC || (hasSiblingsStudying ? 'Std IV - A' : ''),
      leavingDetails: '',
      leavingYearAndClass: '',
    },
    { name: '', school: '', usn: '', classSec: '', leavingDetails: '', leavingYearAndClass: '' },
    { name: '', school: '', usn: '', classSec: '', leavingDetails: '', leavingYearAndClass: '' },
    { name: '', school: '', usn: '', classSec: '', leavingDetails: '', leavingYearAndClass: '' },
    { name: '', school: '', usn: '', classSec: '', leavingDetails: '', leavingYearAndClass: '' },
  ]

  const isFatherAlumnus =
    s.alumni ||
    s.father_alumni_flag === 'Yes' ||
    s.FATHER_ALUMNI_FLAG === 'Yes'

  const isMotherAlumnus =
    s.mother_alumni_flag === 'Yes' ||
    s.MOTHER_ALUMNI_FLAG === 'Yes'

  const isHealthy =
    s.isHealthy !== undefined
      ? s.isHealthy
      : !s.physicallyChallenged && s.physically_challenged !== 'Yes' && s.PHYSICALLY_CHALLENGED !== 'Yes'

  return {
    registrationNo:
      s.registrationNumber ||
      s.application_number ||
      s.APPLICATION_NUMBER ||
      `T25-${String(s.id || '0001').padStart(4, '0')}`,
    childName: s.studentName || s.student_name || s.STUDENT_NAME || '',
    dob: formatPrintDate(s.date || s.dob || s.DOB || '2021-04-12'),
    gender: s.gender || s.GENDER || 'Male',
    motherTongue: s.motherTongue || s.student_language || s.STUDENT_LANGUAGE || 'Tamil',
    religion: s.religion || s.RELIGION || 'Hindu',
    caste: s.caste || s.caste_name || s.CASTE_NAME || 'Brahmin',
    residentialAddress:
      s.address ||
      (s.area && s.city ? `${s.area}, ${s.city}` : s.area || s.city || '12th Avenue, Chennai - 600078'),
    fatherMobile: s.mobile || s.father_mobile_no || s.FATHER_MOBILE_NO || '9840123456',
    motherMobile: s.motherMobile || s.mother_mobile_no || s.MOTHER_MOBILE_NO || '9840987654',
    distanceFromResidence: s.distanceKm || s.distance_name || s.DISTANCE_NAME || '1.5 KM',
    modeOfTransport: s.vehicle_name || s.VEHICLE_NAME || s.commuteMode?.[0] || 'Two Wheeler',
    hasSiblings: hasSiblingsStudying ? 'Yes' : 'No',
    hasSchoolGoingSiblings: hasSiblingsStudying,
    siblings: siblingRows,
    fatherName: s.fatherName || s.father_name || s.FATHER_NAME || '',
    fatherQualification:
      s.fatherQualification ||
      s.father_qualification ||
      s.FATHER_QUALIFICATION ||
      'M.Tech Software Engineering',
    fatherDesignation:
      s.fatherDesignation ||
      s.father_designation ||
      s.FATHER_DESIGNATION ||
      'Principal Architect',
    fatherIncome:
      s.incomeRange ||
      s.father_monthly_income ||
      s.FATHER_MONTHLY_INCOME ||
      '₹1,25,000',
    motherName: s.motherName || s.mother_name || s.MOTHER_NAME || '',
    motherQualification:
      s.motherQualification ||
      s.mother_qualification ||
      s.MOTHER_QUALIFICATION ||
      'M.Sc Mathematics, B.Ed',
    motherDesignation:
      s.motherDesignation ||
      s.mother_designation ||
      s.MOTHER_DESIGNATION ||
      'Senior Assistant Professor',
    motherIncome:
      s.motherIncome ||
      s.mother_monthly_income ||
      s.MOTHER_MONTHLY_INCOME ||
      '₹75,000',
    isFatherAlumnus: isFatherAlumnus ? 'Yes' : 'No',
    fatherAlumnus: isFatherAlumnus,
    isMotherAlumnus: isMotherAlumnus ? 'Yes' : 'No',
    motherAlumnus: isMotherAlumnus,
    fatherPassingYear:
      s.father_passing_year ||
      s.FATHER_PASSING_YEAR ||
      (isFatherAlumnus ? '2006' : ''),
    motherPassingYear:
      s.mother_passing_year ||
      s.MOTHER_PASSING_YEAR ||
      (isMotherAlumnus ? '2008' : ''),
    fatherYearsStudied:
      s.father_total_years_studied ||
      s.FATHER_TOTAL_YEARS_STUDIED ||
      (isFatherAlumnus ? '12' : ''),
    motherYearsStudied:
      s.mother_total_years_studied ||
      s.MOTHER_TOTAL_YEARS_STUDIED ||
      (isMotherAlumnus ? '10' : ''),
    fatherClassLastStudied:
      s.fatherstudiedclass ||
      s.FATHERSTUDIEDCLASS ||
      (isFatherAlumnus ? 'XII' : ''),
    motherClassLastStudied:
      s.motherstudiedclass ||
      s.MOTHERSTUDIEDCLASS ||
      (isMotherAlumnus ? 'XII' : ''),
    fatherBranch: s.fatherBranch || s.schoolBranch || 'T.Nagar-PSBB',
    motherBranch: s.motherBranch || s.schoolBranch || 'T.Nagar-PSBB',
    fatherReasonForLeaving:
      s.father_leaving_reason ||
      s.FATHER_LEAVING_REASON ||
      (isFatherAlumnus ? 'Higher Studies' : ''),
    fatherReasonLeaving:
      s.father_leaving_reason ||
      s.FATHER_LEAVING_REASON ||
      (isFatherAlumnus ? 'Higher Studies' : ''),
    motherReasonForLeaving:
      s.mother_leaving_reason ||
      s.MOTHER_LEAVING_REASON ||
      (isMotherAlumnus ? 'College Studies' : ''),
    motherReasonLeaving:
      s.mother_leaving_reason ||
      s.MOTHER_LEAVING_REASON ||
      (isMotherAlumnus ? 'College Studies' : ''),
    isNormalHealthyChild: isHealthy ? 'Yes' : 'No',
    majorAilment: isHealthy ? 'Nil' : s.phy_challenged_remarks || s.PHY_CHALLENGED_REMARKS || 'None',
    dateOfSubmission: formatPrintDate(s.date_of_submission || s.DATE_OF_SUBMISSION || s.date || '2025-01-10'),
    submissionTimings: '09:00 AM - 12:00 PM',
    timings: '09:00 AM - 12:00 PM',
    schoolAppliedFor: s.schoolBranch || 'T.NAGAR-PSBB',
    academicYear: s.academicYear || '2024-25',
  }
}

/**
 * Maps a student record to RegistrationFormData structure
 */
export function mapStudentToRegistrationForm(student: StudentRecord | any): RegistrationFormData {
  const base = mapStudentToTrackSheet(student)
  const s = student

  const goesToPlaySchool =
    s.playSchool ||
    s.playschool_going === 'Yes' ||
    s.PLAYSCHOOL_GOING === 'Yes'

  const isTwins =
    s.twinsTriplets ||
    s.twin_triplets_flag === 'Yes' ||
    s.TWIN_TRIPLETS_FLAG === 'Yes'

  const isMotherEmployed =
    s.mother_occupation && s.mother_occupation !== 'Homemaker'
      ? 'Yes'
      : 'Yes'

  return {
    ...base,
    passportNo: s.passport_number || s.PASSPORT_NUMBER || '',
    nationality: s.nationality || s.NATIONALITY || 'Indian',
    community: s.community || 'FC',
    doesChildGoToPlaySchool: goesToPlaySchool ? 'Yes' : 'No',
    goesToPlaySchool,
    playSchoolName:
      s.play_school_name ||
      s.PLAY_SCHOOL_NAME ||
      (goesToPlaySchool ? 'EuroKids KK Nagar' : ''),
    isTwinsTriplets: isTwins ? 'Yes' : 'No',
    isMultipleBirth: isTwins,
    fatherDob: formatPrintDate(s.father_dob || s.FATHER_DOB || s.fatherDob || '1988-06-15'),
    motherDob: formatPrintDate(s.mother_dob || s.MOTHER_DOB || s.motherDob || '1990-09-22'),
    fatherUniversity:
      s.father_instituation_name ||
      s.FATHER_INSTITUATION_NAME ||
      s.fatherUniversity ||
      'IIT Madras',
    motherUniversity:
      s.mother_instituation_name ||
      s.MOTHER_INSTITUATION_NAME ||
      s.motherUniversity ||
      'Madras Christian College',
    fatherOccupation:
      s.father_occupation ||
      s.FATHER_OCCUPATION ||
      s.fatherOccupation ||
      'Salaried',
    isMotherEmployed,
    motherOccupation:
      s.mother_occupation ||
      s.MOTHER_OCCUPATION ||
      s.motherOccupation ||
      'Senior Educator',
    fatherEmploymentCategory:
      s.father_employment_category_name ||
      s.FATHER_EMPLOYMENT_CATEGORY_NAME ||
      s.fatherEmploymentCategory ||
      'Information Technology',
    motherEmploymentCategory:
      s.mother_employment_category_name ||
      s.MOTHER_EMPLOYMENT_CATEGORY_NAME ||
      s.motherEmploymentCategory ||
      'Education',
    fatherCompany:
      s.father_company_name ||
      s.FATHER_COMPANY_NAME ||
      s.fatherCompanyName ||
      'Infosys Ltd',
    motherCompany:
      s.mother_company_name ||
      s.MOTHER_COMPANY_NAME ||
      s.motherCompanyName ||
      'DAV Girls School',
    fatherOfficeAddress:
      s.father_office_address ||
      s.FATHER_OFFICE_ADDRESS ||
      s.fatherOfficeAddress ||
      'OMR Sholinganallur, Chennai',
    motherOfficeAddress:
      s.mother_office_address ||
      s.MOTHER_OFFICE_ADDRESS ||
      s.motherOfficeAddress ||
      'Gopalapuram, Chennai',
    fatherPhoneOff:
      s.father_phone_number ||
      s.FATHER_PHONE_NUMBER ||
      s.fatherPhoneOff ||
      '044-24891234',
    fatherPhoneOffice:
      s.father_phone_number ||
      s.FATHER_PHONE_NUMBER ||
      s.fatherPhoneOff ||
      '044-24891234',
    motherPhoneOff:
      s.mother_phone_number ||
      s.MOTHER_PHONE_NUMBER ||
      s.motherPhoneOff ||
      '044-24891235',
    motherPhoneOffice:
      s.mother_phone_number ||
      s.MOTHER_PHONE_NUMBER ||
      s.motherPhoneOff ||
      '044-24891235',
    guardianName: s.guardian_name || s.GUARDIAN_NAME || s.guardianName || '',
    guardianGender: s.guardian_gender || s.GUARDIAN_GENDER || s.guardianGender || '',
    guardianOccupation: s.guardian_occupation || s.GUARDIAN_OCCUPATION || s.guardianOccupation || '',
    guardianCompany: s.guardian_instituation_name || s.GUARDIAN_INSTITUATION_NAME || '',
    guardianMonthlyIncome: s.guardian_monthly_income || '',
    guardianIncome: s.guardian_monthly_income || '',
    guardianOfficeAddress: s.guardian_office_address || s.GUARDIAN_OFFICE_ADDRESS || '',
    guardianPhoneOff: s.guardian_office_phone_number || s.GUARDIAN_OFFICE_PHONE_NUMBER || '',
    guardianPhoneOffice: s.guardian_office_phone_number || s.GUARDIAN_OFFICE_PHONE_NUMBER || '',
    guardianPhoneRes: s.guardian_residence_phone_number || s.GUARDIAN_RESIDENCE_PHONE_NUMBER || '',
    guardianMobile: s.guardian_mobile_number || s.GUARDIAN_MOBILE_NUMBER || '',
    residenceTelephone: s.residence_phone_number || s.RESIDENCE_PHONE_NUMBER || '044-24741122',
    landmark: s.landmark || s.LANDMARK || 'Near Sivan Park',
    importantLandmark: s.landmark || s.LANDMARK || 'Near Sivan Park',
    parentAchievements: s.parent_acheivements || 'National Olympiad Mentor & Tech Speaker',
    isComingOnTransfer:
      s.is_parent_coming_on_transfer_from_outside_chennai_or_outside_india ||
      s.IS_PARENT_COMING_ON_TRANSFER_FROM_OUTSIDE_CHENNAI_OR_OUTSIDE_INDIA ||
      'No',
    isTransferParent:
      s.is_parent_coming_on_transfer_from_outside_chennai_or_outside_india === 'Yes' ||
      s.IS_PARENT_COMING_ON_TRANSFER_FROM_OUTSIDE_CHENNAI_OR_OUTSIDE_INDIA === 'Yes',
  }
}
