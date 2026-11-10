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
  schoolAddress?: string
  schoolId?: number
  school?: string
  preferredEmail?: string
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
  guardianDesignation?: string
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
  fatherEmail?: string
  motherEmail?: string
  guardianEmail?: string
  guardianRelationship?: string
  fatherAddress?: string
  motherAddress?: string
  guardianAddress?: string
  guardianDob?: string
}

/**
 * Format a date string to DD/MM/YYYY
 */
export function formatPrintDate(dateStr?: string): string {
  if (!dateStr) return ''
  try {
    const trimmed = String(dateStr).trim()
    if (!trimmed) return ''

    // Check if in DD-MM-YYYY or DD/MM/YYYY format
    const ddmmyyyyMatch = /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/.exec(trimmed)
    if (ddmmyyyyMatch) {
      const day = ddmmyyyyMatch[1].padStart(2, '0')
      const month = ddmmyyyyMatch[2].padStart(2, '0')
      const year = ddmmyyyyMatch[3]
      return `${day}/${month}/${year}`
    }

    // Check if in YYYY-MM-DD or YYYY/MM/DD format
    const yyyymmddMatch = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/.exec(trimmed)
    if (yyyymmddMatch) {
      const year = yyyymmddMatch[1]
      const month = yyyymmddMatch[2].padStart(2, '0')
      const day = yyyymmddMatch[3].padStart(2, '0')
      return `${day}/${month}/${year}`
    }

    const d = new Date(trimmed)
    if (isNaN(d.getTime())) return trimmed
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    return `${day}/${month}/${year}`
  } catch {
    return String(dateStr)
  }
}

function formatPrintDob(dateStr?: string): string {
  if (!dateStr) return ''

  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
  const formatParts = (day: string, month: number, year: string) =>
    month >= 1 && month <= months.length
      ? `${day.padStart(2, '0')}/${months[month - 1]}/${year}`
      : ''

  const trimmed = String(dateStr).trim()
  if (!trimmed) return ''

  const dayMonthYear = /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/.exec(trimmed)
  if (dayMonthYear) {
    return formatParts(dayMonthYear[1], Number(dayMonthYear[2]), dayMonthYear[3]) || trimmed
  }

  const yearMonthDay = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/.exec(trimmed)
  if (yearMonthDay) {
    return formatParts(yearMonthDay[3], Number(yearMonthDay[2]), yearMonthDay[1]) || trimmed
  }

  const namedMonth = /^(\d{1,2})[-/ ]([A-Za-z]{3})[-/ ](\d{4})$/.exec(trimmed)
  if (namedMonth) {
    const month = months.indexOf(namedMonth[2].toUpperCase()) + 1
    if (month) return formatParts(namedMonth[1], month, namedMonth[3])
  }

  const date = new Date(trimmed)
  if (isNaN(date.getTime())) return trimmed
  return formatParts(String(date.getDate()), date.getMonth() + 1, String(date.getFullYear()))
}

function formatParentName(title: unknown, initials: unknown, fullName: unknown): string {
  return [title, initials, fullName]
    .map((part) => String(part || '').trim())
    .filter(Boolean)
    .join(' ')
}

/**
 * Maps a student record or raw DB record to TrackSheetData structure
 */
export function mapStudentToTrackSheet(student: StudentRecord | any): TrackSheetData {
  if (!student) {
    throw new Error('Student data is required for Track Sheet mapping')
  }

  const s = student

  // Extract nested Father, Mother, and Siblings objects
  const fatherObj = (Array.isArray(s.Father) && s.Father.length > 0 ? s.Father[0] : (s.Father || s.father)) || {}
  const motherObj = (Array.isArray(s.Mother) && s.Mother.length > 0 ? s.Mother[0] : (s.Mother || s.mother)) || {}

  const rawSiblings = Array.isArray(s.Siblings)
    ? s.Siblings
    : Array.isArray(s.siblings)
    ? s.siblings
    : []
  const transportModeNames = Array.isArray(s.TransporModeName)
    ? s.TransporModeName
        .map((mode: { TransportModeValue?: string }) => mode.TransportModeValue?.trim())
        .filter((mode: string | undefined): mode is string => Boolean(mode))
        .join('/ ')
    : ''

  const hasSiblingsStudying = Boolean(
    s.SchoolGoingSibilings === 'Yes' ||
    s.SchoolGoingSibilings === true ||
    s.SchoolGoingSibilings === 1 ||
    s.SchoolGoingSibilings === '1' ||
    s.hasSiblings === true ||
    s.hasSiblings === 'Yes' ||
    s.hasSchoolGoingSiblings === true ||
    s.hasSchoolGoingSiblings === 'Yes' ||
    s.siblingsStudying ||
    s.siblings_flag === 'Yes' ||
    s.SIBLINGS_FLAG === 'Yes' ||
    Boolean(s.sibling_name || s.SIBLING_NAME) ||
    (rawSiblings.length > 0 && rawSiblings.some((sib: any) => sib.SiblingName || sib.name))
  )

  const siblingRows: SiblingPrintRow[] = rawSiblings.length > 0
    ? rawSiblings.map((sib: any) => {
        const leaving =
          sib.LeftYear ||
          sib.YearLeaving ||
          sib.yearLeaving ||
          sib.leavingYearAndClass ||
          (sib.IsLeftSchool === 'Yes' ? (sib.LeftYear || 'Yes') : (sib.leftStudent === 'Yes' ? (sib.yearLeaving || 'Yes') : ''))
        return {
          name: sib.SiblingName || sib.name || '',
          school: sib.School || sib.SchoolName || sib.school || '',
          usn: sib.USN || sib.usn || '',
          classSec: sib.Class && sib.Section
            ? `${sib.Class} - ${sib.Section}`
            : (sib.classSec || sib.Class || sib.Section || ''),
          leavingDetails: sib.LeavingDetails || sib.leavingDetails || leaving || '',
          leavingYearAndClass: leaving || '',
        }
      })
    : [
        {
          name: s.sibling_name || s.SIBLING_NAME || '',
          school: s.sibling_school || '',
          usn: s.usn || s.USN || '',
          classSec: s.class_and_sec || s.CLASS_AND_SEC || '',
          leavingDetails: '',
          leavingYearAndClass: '',
        },
        { name: '', school: '', usn: '', classSec: '', leavingDetails: '', leavingYearAndClass: '' },
        { name: '', school: '', usn: '', classSec: '', leavingDetails: '', leavingYearAndClass: '' },
        { name: '', school: '', usn: '', classSec: '', leavingDetails: '', leavingYearAndClass: '' },
      ]

  const isFatherAlumnus = Boolean(
    fatherObj.IsAlumnus === 'Yes' ||
    fatherObj.IsAlumnus === true ||
    fatherObj.isAlumnus === true ||
    s.fatherAlumnus === true ||
    s.fatherAlumnus === 'Yes' ||
    s.isFatherAlumnus === 'Yes' ||
    s.alumni ||
    s.father_alumni_flag === 'Yes' ||
    s.FATHER_ALUMNI_FLAG === 'Yes' ||
    s.father?.isAlumnus === true
  )

  const isMotherAlumnus = Boolean(
    motherObj.IsAlumnus === 'Yes' ||
    motherObj.IsAlumnus === true ||
    motherObj.isAlumnus === true ||
    s.motherAlumnus === true ||
    s.motherAlumnus === 'Yes' ||
    s.isMotherAlumnus === 'Yes' ||
    s.mother_alumni_flag === 'Yes' ||
    s.MOTHER_ALUMNI_FLAG === 'Yes' ||
    s.mother?.isAlumnus === true
  )

  const isHealthy = Boolean(
    s.IsNormalChild === 'Yes' ||
    s.IsNormalChild === true ||
    s.IsNormalChild === 1 ||
    s.IsNormalChild === '1' ||
    s.isHealthy === true ||
    (s.isHealthy !== false && s.IsNormalChild !== 'No' && !s.physicallyChallenged && s.physically_challenged !== 'Yes' && s.PHYSICALLY_CHALLENGED !== 'Yes')
  )

  // Construct residential address with pincode
  const rawAddr = s.ResAddress || s.comm?.address || s.address || (s.area && s.city ? `${s.area}, ${s.city}` : s.area || s.city || '')
  const pin = s.ResPincode || s.comm?.pincode || s.pincode
  let residentialAddress = rawAddr || ''
  if (pin && !residentialAddress.includes(String(pin))) {
    residentialAddress = residentialAddress ? `${residentialAddress}, PIN: ${pin}` : `PIN: ${pin}`
  }

  const fatherReason =
    fatherObj.ReasonForLeaving ||
    fatherObj.reasonForLeaving ||
    s.fatherReasonForLeaving ||
    s.fatherReasonLeaving ||
    s.father_leaving_reason ||
    s.FATHER_LEAVING_REASON ||
    s.father?.reasonForLeaving ||
    ''

  const motherReason =
    motherObj.ReasonForLeaving ||
    motherObj.reasonForLeaving ||
    s.motherReasonForLeaving ||
    s.motherReasonLeaving ||
    s.mother_leaving_reason ||
    s.MOTHER_LEAVING_REASON ||
    s.mother?.reasonForLeaving ||
    ''

  return {
    registrationNo:
      s.ApplicationNo ||
      s.registrationNumber ||
      s.application_number ||
      s.APPLICATION_NUMBER ||
      s.registrationNo ||
      (s.id ? `T25-${String(s.id).padStart(4, '0')}` : ''),
    childName: s.ChildName || s.studentName || s.student_name || s.STUDENT_NAME || s.childName || '',
    dob: formatPrintDob(s.ChildDOB || s.date || s.dob || s.DOB || ''),
    gender: s.Gender || s.gender || s.GENDER || '',
    motherTongue: s.MotherTongue || s.motherTongue || s.student_language || s.STUDENT_LANGUAGE || '',
    religion: s.Religion || s.religion || s.RELIGION || '',
    caste: s.Caste || s.caste || s.caste_name || s.CASTE_NAME || '',
    residentialAddress,
    fatherMobile:
      fatherObj.MobileNo ||
      fatherObj.mobileNo ||
      s.mobile ||
      s.fatherMobile ||
      s.father_mobile_no ||
      s.FATHER_MOBILE_NO ||
      s.father?.mobileNo ||
      '',
    motherMobile:
      motherObj.MobileNo ||
      motherObj.mobileNo ||
      s.motherMobile ||
      s.mother_mobile_no ||
      s.MOTHER_MOBILE_NO ||
      s.mother?.mobileNo ||
      '',
    distanceFromResidence:
      s.Distance ||
      s.comm?.distanceKm ||
      s.distanceKm ||
      s.distance_name ||
      s.DISTANCE_NAME ||
      '',
    modeOfTransport:
      transportModeNames ||
      s.TransportMode ||
      (Array.isArray(s.comm?.commuteMode) ? s.comm?.commuteMode.join(', ') : s.comm?.commuteMode) ||
      (Array.isArray(s.commuteMode) ? s.commuteMode.join(', ') : s.commuteMode) ||
      s.vehicle_name ||
      s.VEHICLE_NAME ||
      '',
    hasSiblings: hasSiblingsStudying ? 'Yes' : 'No',
    hasSchoolGoingSiblings: hasSiblingsStudying,
    siblings: siblingRows,
    fatherName: formatParentName(
      fatherObj.Title || fatherObj.TitleName || s.fatherTitle || s.FatherTitle,
      fatherObj.Initials || fatherObj.initials || s.fatherInitials || s.FatherInitials,
      fatherObj.FullName ||
        fatherObj.name ||
        s.fatherName ||
        s.father_name ||
        s.FATHER_NAME ||
        s.father?.name ||
        '',
    ),
    fatherQualification:
      fatherObj.EducationalQualification ||
      fatherObj.qualification ||
      s.fatherQualification ||
      s.father_qualification ||
      s.FATHER_QUALIFICATION ||
      s.father?.qualification ||
      '',
    fatherDesignation:
      fatherObj.Designation ||
      fatherObj.designation ||
      s.fatherDesignation ||
      s.father_designation ||
      s.FATHER_DESIGNATION ||
      s.father?.designation ||
      '',
    fatherIncome:
      fatherObj.IncomeRange ||
      fatherObj.monthlyIncome ||
      s.fatherIncome ||
      s.incomeRange ||
      s.father_monthly_income ||
      s.FATHER_MONTHLY_INCOME ||
      s.father?.monthlyIncome ||
      '',
    motherName: formatParentName(
      motherObj.Title || motherObj.TitleName || s.motherTitle || s.MotherTitle,
      motherObj.Initials || motherObj.initials || s.motherInitials || s.MotherInitials,
      motherObj.FullName ||
        motherObj.name ||
        s.motherName ||
        s.mother_name ||
        s.MOTHER_NAME ||
        s.mother?.name ||
        '',
    ),
    motherQualification:
      motherObj.EducationalQualification ||
      motherObj.qualification ||
      s.motherQualification ||
      s.mother_qualification ||
      s.MOTHER_QUALIFICATION ||
      s.mother?.qualification ||
      '',
    motherDesignation:
      motherObj.Designation ||
      motherObj.designation ||
      s.motherDesignation ||
      s.mother_designation ||
      s.MOTHER_DESIGNATION ||
      s.mother?.designation ||
      '',
    motherIncome:
      motherObj.IncomeRange ||
      motherObj.monthlyIncome ||
      s.motherIncome ||
      s.mother_monthly_income ||
      s.MOTHER_MONTHLY_INCOME ||
      s.mother?.monthlyIncome ||
      '',
    isFatherAlumnus: isFatherAlumnus ? 'Yes' : 'No',
    fatherAlumnus: isFatherAlumnus,
    isMotherAlumnus: isMotherAlumnus ? 'Yes' : 'No',
    motherAlumnus: isMotherAlumnus,
    fatherPassingYear:
      fatherObj.YearOfLeaving ||
      fatherObj.LeftYear ||
      fatherObj.yearOfLeaving ||
      s.fatherPassingYear ||
      s.father_passing_year ||
      s.FATHER_PASSING_YEAR ||
      s.father?.yearOfLeaving ||
      '',
    motherPassingYear:
      motherObj.YearOfLeaving ||
      motherObj.LeftYear ||
      motherObj.yearOfLeaving ||
      s.motherPassingYear ||
      s.mother_passing_year ||
      s.MOTHER_PASSING_YEAR ||
      s.mother?.yearOfLeaving ||
      '',
    fatherYearsStudied:
      fatherObj.TotalYearsStudied ||
      fatherObj.yearsStudied ||
      s.fatherYearsStudied ||
      s.father_total_years_studied ||
      s.FATHER_TOTAL_YEARS_STUDIED ||
      s.father?.yearsStudied ||
      '',
    motherYearsStudied:
      motherObj.TotalYearsStudied ||
      motherObj.yearsStudied ||
      s.motherYearsStudied ||
      s.mother_total_years_studied ||
      s.MOTHER_TOTAL_YEARS_STUDIED ||
      s.mother?.yearsStudied ||
      '',
    fatherClassLastStudied:
      fatherObj.ClassLastStudied ||
      fatherObj.classLastStudied ||
      s.fatherClassLastStudied ||
      s.fatherstudiedclass ||
      s.FATHERSTUDIEDCLASS ||
      s.father?.classLastStudied ||
      '',
    motherClassLastStudied:
      motherObj.ClassLastStudied ||
      motherObj.classLastStudied ||
      s.motherClassLastStudied ||
      s.motherstudiedclass ||
      s.MOTHERSTUDIEDCLASS ||
      s.mother?.classLastStudied ||
      '',
    fatherBranch:
      fatherObj.Branch ||
      fatherObj.branch ||
      s.fatherBranch ||
      s.father?.branch ||
      '',
    motherBranch:
      motherObj.Branch ||
      motherObj.branch ||
      s.motherBranch ||
      s.mother?.branch ||
      '',
    fatherReasonForLeaving: fatherReason || s.ReasonForLeaving || '',
    fatherReasonLeaving: fatherReason || s.ReasonForLeaving || '',
    motherReasonForLeaving: motherReason || s.ReasonForLeaving || '',
    motherReasonLeaving: motherReason || s.ReasonForLeaving || '',
    isNormalHealthyChild: s.IsNormalChild,
    majorAilment: isHealthy ? 'Nil' : (s.ChildMajorAilment || s.phy_challenged_remarks || s.PHY_CHALLENGED_REMARKS || s.majorAilment || 'Nil'),
    dateOfSubmission: formatPrintDate(s.submissionDate || s.dateOfSubmission || s.date_of_submission || s.DATE_OF_SUBMISSION || ''),
    submissionTimings: s.submissionTimings || s.timings || '',
    timings: s.submissionTimings || s.timings || '',
    schoolAppliedFor: s.School || s.schoolAppliedFor || s.schoolBranch || s.BranchName || s.selectedSchoolName || '',
    schoolAddress: s.schoolAddress || s.SchoolAddress || s.admissionSchoolAddress || '',
    schoolId: s.schoolId || s.SchoolID || undefined,
    school: s.School || '',
    preferredEmail:
      s.preferredEmail ||
      s.PreferredEmail ||
      s.email ||
      s.Email ||
      s.EmailID ||
      s.userEmail ||
      s.fatherEmail ||
      s.motherEmail ||
      (typeof window !== 'undefined' ? (localStorage.getItem('email') || localStorage.getItem('user_email') || '') : '') ||
      '',
    academicYear: s.AcademicYear || s.academicYear || s.academic_year || '2026-27',
  }
}

/**
 * Maps a student record or raw DB record to RegistrationFormData structure
 */
export function mapStudentToRegistrationForm(student: StudentRecord | any): RegistrationFormData {
  const base = mapStudentToTrackSheet(student)
  const s = student

  const fatherObj = (Array.isArray(s.Father) && s.Father.length > 0 ? s.Father[0] : (s.Father || s.father)) || {}
  const motherObj = (Array.isArray(s.Mother) && s.Mother.length > 0 ? s.Mother[0] : (s.Mother || s.mother)) || {}
  const guardianObj = (Array.isArray(s.Guardian) && s.Guardian.length > 0 ? s.Guardian[0] : (s.Guardian || s.guardian)) || {}

  const isGuardianApplicable = Boolean(
    guardianObj.IsGuardianApplicable === 'Yes' ||
    guardianObj.IsGuardianApplicable === true ||
    guardianObj.IsGuardianApplicable === 1 ||
    guardianObj.isGuardianApplicable === 'Yes' ||
    guardianObj.isGuardianApplicable === true ||
    guardianObj.isGuardianApplicable === 1 ||
    s.guardianApplicable === true ||
    s.guardianApplicable === 'Yes' ||
    s.isGuardianApplicable === true ||
    s.isGuardianApplicable === 'Yes' ||
    (s.guardian && s.guardian.isApplicable === true)
  )

  const goesToPlaySchool = Boolean(
    s.ChildGotoPlaySchool === 'Yes' ||
    s.ChildGotoPlaySchool === true ||
    s.ChildGotoPlaySchool === 1 ||
    s.ChildGotoPlaySchool === '1' ||
    s.childGoesToSchool === true ||
    s.childGoesToSchool === 'Yes' ||
    s.playSchool ||
    s.playschool_going === 'Yes' ||
    s.PLAYSCHOOL_GOING === 'Yes' ||
    Boolean(s.PlaySchoolName || s.prevSchool)
  )

  const isTwins = Boolean(
    s.IsTwins === 'Yes' ||
    s.IsTwins === true ||
    s.IsTwins === 1 ||
    s.IsTwins === '1' ||
    s.isTwins === true ||
    s.isTwins === 'Yes' ||
    s.twinsTriplets ||
    s.twin_triplets_flag === 'Yes' ||
    s.TWIN_TRIPLETS_FLAG === 'Yes'
  )

  const isMotherEmployed = Boolean(
    motherObj.IsEmployed === 'Yes' ||
    motherObj.IsEmployed === true ||
    motherObj.isEmployed === true ||
    s.mother?.isEmployed === true ||
    (motherObj.Occupation && motherObj.Occupation.trim().toLowerCase() !== 'homemaker') ||
    (s.mother_occupation && s.mother_occupation.trim().toLowerCase() !== 'homemaker') ||
    (s.mother?.occupation && s.mother.occupation.trim().toLowerCase() !== 'homemaker')
  )

  const isComingOnTransfer = Boolean(
    s.TransferfromOutside === 'Yes' ||
    s.TransferfromOutside === true ||
    s.comm?.isTransferFromOutside ||
    s.isTransferFromOutside ||
    s.is_parent_coming_on_transfer_from_outside_chennai_or_outside_india === 'Yes' ||
    s.IS_PARENT_COMING_ON_TRANSFER_FROM_OUTSIDE_CHENNAI_OR_OUTSIDE_INDIA === 'Yes'
  )

  const fatherPhone =
    fatherObj.CompanyMobileNo ||
    fatherObj.phoneOff ||
    s.fatherPhoneOff ||
    s.fatherPhoneOffice ||
    s.father_phone_number ||
    s.FATHER_PHONE_NUMBER ||
    s.father?.phoneOff ||
    ''

  const motherPhone =
    motherObj.CompanyMobileNo ||
    motherObj.phoneOff ||
    s.motherPhoneOff ||
    s.motherPhoneOffice ||
    s.mother_phone_number ||
    s.MOTHER_PHONE_NUMBER ||
    s.mother?.phoneOff ||
    ''

  const guardianPhoneOff =
    guardianObj.CompanyMobileNo ||
    guardianObj.phoneOff ||
    s.guardianPhoneOff ||
    s.guardianPhoneOffice ||
    s.guardian_office_phone_number ||
    s.GUARDIAN_OFFICE_PHONE_NUMBER ||
    s.guardian?.phoneOff ||
    ''

  const landmark =
    s.ResLandmark ||
    s.comm?.landmark ||
    s.landmark ||
    s.LANDMARK ||
    ''

  return {
    ...base,
    passportNo: s.PassportNo || s.passportNo || s.passport_number || s.PASSPORT_NUMBER || '',
    nationality: s.Nationality || s.nationality || s.NATIONALITY || '',
    community: s.Community || s.community || '',
    doesChildGoToPlaySchool: goesToPlaySchool ? 'Yes' : 'No',
    goesToPlaySchool,
    playSchoolName:
      s.PlaySchoolName ||
      s.prevSchool ||
      s.play_school_name ||
      s.PLAY_SCHOOL_NAME ||
      '',
    isTwinsTriplets: isTwins ? 'Yes' : 'No',
    isMultipleBirth: isTwins,
    fatherDob: formatPrintDob(
      fatherObj.DOB ||
      fatherObj.dob ||
      s.fatherDob ||
      s.father_dob ||
      s.FATHER_DOB ||
      s.father?.dob ||
      ''
    ),
    motherDob: formatPrintDob(
      motherObj.DOB ||
      motherObj.dob ||
      s.motherDob ||
      s.mother_dob ||
      s.MOTHER_DOB ||
      s.mother?.dob ||
      ''
    ),
    fatherUniversity:
      fatherObj.UniversityOrInstitution ||
      fatherObj.university ||
      s.fatherUniversity ||
      s.father_instituation_name ||
      s.FATHER_INSTITUATION_NAME ||
      s.father?.university ||
      '',
    motherUniversity:
      motherObj.UniversityOrInstitution ||
      motherObj.university ||
      s.motherUniversity ||
      s.mother_instituation_name ||
      s.MOTHER_INSTITUATION_NAME ||
      s.mother?.university ||
      '',
    fatherOccupation:
      fatherObj.Occupation ||
      fatherObj.occupation ||
      s.fatherOccupation ||
      s.father_occupation ||
      s.FATHER_OCCUPATION ||
      s.father?.occupation ||
      '',
    isMotherEmployed: isMotherEmployed ? 'Yes' : 'No',
    motherOccupation:
      motherObj.Occupation ||
      motherObj.occupation ||
      s.motherOccupation ||
      s.mother_occupation ||
      s.MOTHER_OCCUPATION ||
      s.mother?.occupation ||
      '',
    fatherEmploymentCategory:
      fatherObj.EmployementCategory ||
      fatherObj.employmentCategory ||
      s.fatherEmploymentCategory ||
      s.father_employment_category_name ||
      s.FATHER_EMPLOYMENT_CATEGORY_NAME ||
      s.father?.employmentCategory ||
      '',
    motherEmploymentCategory:
      motherObj.EmployementCategory ||
      motherObj.employmentCategory ||
      s.motherEmploymentCategory ||
      s.mother_employment_category_name ||
      s.MOTHER_EMPLOYMENT_CATEGORY_NAME ||
      s.mother?.employmentCategory ||
      '',
    fatherCompany:
      fatherObj.CompanyName ||
      fatherObj.companyName ||
      s.fatherCompany ||
      s.father_company_name ||
      s.FATHER_COMPANY_NAME ||
      s.father?.companyName ||
      '',
    motherCompany:
      motherObj.CompanyName ||
      motherObj.companyName ||
      s.motherCompany ||
      s.mother_company_name ||
      s.MOTHER_COMPANY_NAME ||
      s.mother?.companyName ||
      '',
    fatherOfficeAddress:
      fatherObj.CompanyAddress ||
      fatherObj.officeAddress ||
      s.fatherOfficeAddress ||
      s.father_office_address ||
      s.FATHER_OFFICE_ADDRESS ||
      s.father?.officeAddress ||
      '',
    motherOfficeAddress:
      motherObj.CompanyAddress ||
      motherObj.officeAddress ||
      s.motherOfficeAddress ||
      s.mother_office_address ||
      s.MOTHER_OFFICE_ADDRESS ||
      s.mother?.officeAddress ||
      '',
    fatherPhoneOff: fatherPhone,
    fatherPhoneOffice: fatherPhone,
    motherPhoneOff: motherPhone,
    motherPhoneOffice: motherPhone,
    guardianName: isGuardianApplicable
      ? formatParentName(
          guardianObj.Title || guardianObj.TitleName || s.guardianTitle || s.GuardianTitle,
          guardianObj.Initials || guardianObj.initials || s.guardianInitials || s.GuardianInitials,
          guardianObj.FullName ||
            guardianObj.name ||
            s.guardianName ||
            s.guardian_name ||
            s.GUARDIAN_NAME ||
            s.guardian?.name ||
            '',
        )
      : '',
    guardianGender: isGuardianApplicable
      ? guardianObj.Gender ||
        guardianObj.gender ||
        s.guardianGender ||
        s.guardian_gender ||
        s.GUARDIAN_GENDER ||
        s.guardian?.gender ||
        ''
      : '',
    guardianOccupation: isGuardianApplicable
      ? guardianObj.Occupation ||
        guardianObj.occupation ||
        s.guardianOccupation ||
        s.guardian_occupation ||
        s.GUARDIAN_OCCUPATION ||
        s.guardian?.occupation ||
        ''
      : '',
    guardianDesignation: isGuardianApplicable
      ? guardianObj.Designation ||
        guardianObj.designation ||
        s.guardianDesignation ||
        s.guardian_designation ||
        s.GUARDIAN_DESIGNATION ||
        s.guardian?.designation ||
        ''
      : '',
    guardianCompany: isGuardianApplicable
      ? guardianObj.CompanyName ||
        guardianObj.companyName ||
        s.guardianCompany ||
        s.guardian_instituation_name ||
        s.GUARDIAN_INSTITUATION_NAME ||
        s.guardian?.companyName ||
        ''
      : '',
    guardianMonthlyIncome: isGuardianApplicable
      ? guardianObj.IncomeRange ||
        guardianObj.monthlyIncome ||
        s.guardianMonthlyIncome ||
        s.guardianIncome ||
        s.guardian_monthly_income ||
        s.guardian?.monthlyIncome ||
        ''
      : '',
    guardianIncome: isGuardianApplicable
      ? guardianObj.IncomeRange ||
        guardianObj.monthlyIncome ||
        s.guardianMonthlyIncome ||
        s.guardianIncome ||
        s.guardian_monthly_income ||
        s.guardian?.monthlyIncome ||
        ''
      : '',
    guardianOfficeAddress: isGuardianApplicable
      ? guardianObj.CompanyAddress ||
        guardianObj.officeAddress ||
        s.guardianOfficeAddress ||
        s.guardian_office_address ||
        s.GUARDIAN_OFFICE_ADDRESS ||
        s.guardian?.officeAddress ||
        ''
      : '',
    guardianPhoneOff: isGuardianApplicable ? guardianPhoneOff : '',
    guardianPhoneOffice: isGuardianApplicable ? guardianPhoneOff : '',
    guardianPhoneRes: isGuardianApplicable
      ? guardianObj.phoneRes ||
        s.guardianPhoneRes ||
        s.guardian_residence_phone_number ||
        s.GUARDIAN_RESIDENCE_PHONE_NUMBER ||
        s.guardian?.phoneRes ||
        ''
      : '',
    guardianMobile: isGuardianApplicable
      ? guardianObj.MobileNo ||
        guardianObj.mobileNo ||
        s.guardianMobile ||
        s.guardian_mobile_number ||
        s.GUARDIAN_MOBILE_NUMBER ||
        s.guardian?.mobileNo ||
        ''
      : '',
    residenceTelephone:
      s.residence_phone_number ||
      s.RESIDENCE_PHONE_NUMBER ||
      s.residenceTelephone ||
      s.residencePhone ||
      s.comm?.residencePhone ||
      '',
    landmark,
    importantLandmark: landmark,
    parentAchievements:
      s.ParentsAchivements ||
      s.comm?.parentAchievements ||
      s.parentAchievements ||
      s.parent_acheivements ||
      '',
    isComingOnTransfer: isComingOnTransfer ? 'Yes' : 'No',
    isTransferParent: isComingOnTransfer,
    fatherEmail: s.fatherEmail || s.father_email || s.FATHER_EMAIL || '',
    motherEmail: s.motherEmail || s.mother_email || s.MOTHER_EMAIL || '',
    guardianEmail: isGuardianApplicable ? (s.guardianEmail || s.guardian_email || s.GUARDIAN_EMAIL || '') : '',
    guardianRelationship: isGuardianApplicable
      ? guardianObj.Relationship ||
        guardianObj.relationship ||
        s.guardianRelationship ||
        s.guardian_relationship ||
        s.GUARDIAN_RELATIONSHIP ||
        s.guardian?.relationship ||
        ''
      : '',
    fatherAddress:
      fatherObj.CompanyAddress ||
      fatherObj.officeAddress ||
      s.father_office_address ||
      s.FATHER_OFFICE_ADDRESS ||
      s.fatherAddress ||
      s.father?.officeAddress ||
      '',
    motherAddress:
      motherObj.CompanyAddress ||
      motherObj.officeAddress ||
      s.mother_office_address ||
      s.MOTHER_OFFICE_ADDRESS ||
      s.motherAddress ||
      s.mother?.officeAddress ||
      '',
    guardianAddress: isGuardianApplicable
      ? guardianObj.CompanyAddress ||
        guardianObj.officeAddress ||
        s.guardian_office_address ||
        s.GUARDIAN_OFFICE_ADDRESS ||
        s.guardianAddress ||
        s.guardian?.officeAddress ||
        ''
      : '',
    guardianDob: isGuardianApplicable
      ? formatPrintDob(
          guardianObj.DOB ||
          guardianObj.dob ||
          s.guardianDob ||
          s.guardian_dob ||
          s.GUARDIAN_DOB ||
          s.guardian?.dob ||
          ''
        )
      : '',
  }
}
