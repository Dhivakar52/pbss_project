import React from 'react'

export interface ReportColumnConfig {
  key: string
  label: string
  sortable?: boolean
  className?: string
  headerClassName?: string
  render?: (row: any, index: number) => React.ReactNode
}

export interface ReportFilterConfig {
  key: string
  label: string
  type: 'select' | 'text'
  options?: readonly string[] | readonly { value: string; label: string }[]
  placeholder?: string
}

export interface ReportConfigItem {
  id: string
  label: string
  description: string
  columns: ReportColumnConfig[]
  filters: ReportFilterConfig[]
}

// Special dictionary for common acronyms and abbreviations
export const customLabelMap: Record<string, string> = {
  SNo: 'S.No',
  sno: 'S.No',
  slno: 'S.No',
  SLNo: 'S.No',
  ApplicantID: 'Applicant ID',
  applicant_id: 'Applicant ID',
  ApplicationNo: 'Application No',
  application_number: 'Application No',
  APPLICATION_NUMBER: 'Application No',
  registrationNumber: 'Application No',
  ChildName: 'Student Name',
  student_name: 'Student Name',
  STUDENT_NAME: 'Student Name',
  studentName: 'Student Name',
  FullName: 'Student Name',
  DateOfBirth: 'Date of Birth',
  ChildDOB: 'Date of Birth',
  dob: 'Date of Birth',
  DOB: 'Date of Birth',
  Gender: 'Gender',
  gender: 'Gender',
  GENDER: 'Gender',
  School: 'School Branch',
  AcademicYear: 'Academic Year',
  FatherName: "Father's Name",
  father_name: "Father's Name",
  FATHER_NAME: "Father's Name",
  FatherEducational: "Father Education",
  FatherDesignation: "Father Designation",
  FatherNoYearsStudied: "Father Years Studied",
  FatherIncome: "Father Monthly Income",
  MotherName: "Mother's Name",
  mother_name: "Mother's Name",
  MOTHER_NAME: "Mother's Name",
  MotherEducational: "Mother Education",
  MotherDesignation: "Mother Designation",
  MotherNoYearsStudied: "Mother Years Studied",
  MotherIncome: "Mother Monthly Income",
  Distance: 'Distance (KM)',
  TransportMode: 'Transport Mode',
  SiblingName: 'Sibling Name',
  sibling_name: 'Sibling Name',
  USN: 'USN',
  ClassAndSec: 'Class & Sec',
  class_and_sec: 'Class & Sec',
  SiblingOtherSchool: 'Sibling Other School',
  NoOfTimesApplied: 'Times Applied',
  no_of_times: 'Times Applied',
  Submitted: 'Submitted',
  submitted: 'Submitted',
  NotSubmitted: 'Not Submitted',
  not_submitted: 'Not Submitted',
  IsLeftSchool: 'Left School?',
  left_student: 'Left School?',
  FatherNameEducationalQualificationUniversity: "Father Details (Edu & Univ)",
  FatherIsAlumniClassLastStudiedNoYearsLeavingYear: "Father Alumni Details",
  MotherNameEducationalQualificationUniversity: "Mother Details (Edu & Univ)",
  MotherIsAlumniClassLastStudiedNoYearsLeavingYear: "Mother Alumni Details",
  AddressResmobNoFatherNoMotherNo: "Address & Contact Numbers",
  SiblingNameUSNClassSec: "Sibling Details (USN / Class)",
  Particulars: 'Particulars',
  Count: 'Count',
  No: 'No',
  Date: 'Date',
  SubmissionDate: 'Submission Date',
  Called_Declared: 'Called (Declared)',
  Registered_AllBranch: 'Registered (All Branch)',
  Declared: 'Declared',
  NotSubmitted_TrackSheet_Certificate: 'Not Submitted (Track & Cert)',
  Submitted_TrackSheet_Certificate: 'Submitted (Track & Cert)',
  Approved: 'Approved',
  TwinsNo: 'Twin/Triplet Type',
  Religion: 'Religion',
  Caste: 'Caste',
  Community: 'Community',
  MotherTongue: 'Mother Tongue',
  Nationality: 'Nationality',
  ApplicationStatus: 'Status',
  TrackSheetStatus: 'Track Sheet Status',
  CertificateSubmissionStatus: 'Certificate Status',
}

export function formatHeaderLabel(key: string): string {
  if (customLabelMap[key]) return customLabelMap[key]

  // Case-insensitive lookup in customLabelMap
  const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '')
  for (const [k, v] of Object.entries(customLabelMap)) {
    if (k.toLowerCase().replace(/[^a-z0-9]/g, '') === normalizedKey) {
      return v
    }
  }

  // Handle long multi-word concatenated database column names
  let formatted = key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .trim()

  // Clean and shorten excessively long captions
  if (formatted.length > 35) {
    if (/father.*alumni/i.test(formatted)) return 'Father Alumni Details'
    if (/mother.*alumni/i.test(formatted)) return 'Mother Alumni Details'
    if (/father.*qualification|father.*university/i.test(formatted)) return 'Father Details (Edu & Univ)'
    if (/mother.*qualification|mother.*university/i.test(formatted)) return 'Mother Details (Edu & Univ)'
    if (/address.*mob|resmob/i.test(formatted)) return 'Address & Contacts'
    if (/sibling/i.test(formatted)) return 'Sibling Details (USN / Class)'
    return formatted.slice(0, 32) + '...'
  }

  return formatted
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function buildCols(keys: string[]): ReportColumnConfig[] {
  return keys.map((key) => ({
    key,
    label: formatHeaderLabel(key),
    sortable: true,
  }))
}

// 1. Master / Detailed Report columns
const detailedCols = buildCols([
  'SNo',
  'ApplicationNo',
  'ChildName',
  'DateOfBirth',
  'FatherName',
  'MotherName',
  'School',
  'AcademicYear',
  'Gender',
  'MotherTongue',
  'Religion',
  'Caste',
  'Community',
  'Distance',
  'IncomeRange',
  'ApplicationStatus',
])

// 2. Alumni Report columns (PDF Page 8, 20-21)
const alumniCols = buildCols([
  'SNo',
  'ApplicationNo',
  'ChildName',
  'FatherName',
  'FatherEducational',
  'FatherDesignation',
  'FatherNoYearsStudied',
  'FatherIncome',
  'MotherName',
  'MotherEducational',
  'MotherDesignation',
  'MotherNoYearsStudied',
  'MotherIncome',
  'Distance',
  'TransportMode',
])

// 3. Sibling Report columns (PDF Page 31-34, 48)
const siblingCols = buildCols([
  'SNo',
  'ApplicationNo',
  'ChildName',
  'FatherName',
  'FatherEducational',
  'FatherDesignation',
  'FatherNoYearsStudied',
  'FatherIncome',
  'MotherName',
  'MotherEducational',
  'MotherDesignation',
  'MotherNoYearsStudied',
  'MotherIncome',
  'SiblingName',
  'USN',
  'ClassAndSec',
  'SiblingOtherSchool',
  'Distance',
  'TransportMode',
])

// 4. Duplicate Report columns (PDF Page 35-38)
const duplicateCols = buildCols([
  'SNo',
  'ApplicationNo',
  'ChildName',
  'FatherName',
  'NoOfTimesApplied',
  'Submitted',
  'NotSubmitted',
  'SiblingName',
  'USN',
  'ClassAndSec',
  'IsLeftSchool',
])

// 5. Track Sheet Verification Report columns (PDF Page 7-8, 77)
const trackSheetVerificationCols = buildCols([
  'SNo',
  'ApplicationNo',
  'ChildName',
  'DateOfBirth',
  'FatherNameEducationalQualificationUniversity',
  'FatherIsAlumniClassLastStudiedNoYearsLeavingYear',
  'MotherNameEducationalQualificationUniversity',
  'MotherIsAlumniClassLastStudiedNoYearsLeavingYear',
  'AddressResmobNoFatherNoMotherNo',
  'SiblingNameUSNClassSec',
])

// 6. Application Statistics Report columns (PDF Page 6)
const appStatsCols = buildCols(['SNo', 'Particulars', 'Count'])

// 7. Statistics Report columns (PDF Page 7)
const statsCols = buildCols(['SNo', 'Particulars', 'No'])

// 8. Date Wise Report columns (PDF Page 6)
const dateWiseCols = buildCols([
  'SNo',
  'Date',
  'Registered_AllBranch',
  'Declared',
  'NotSubmitted_TrackSheet_Certificate',
  'Submitted_TrackSheet_Certificate',
  'Approved',
])

// 9. Submission Date Wise Report columns (PDF Page 6)
const subDateWiseCols = buildCols([
  'SNo',
  'SubmissionDate',
  'Called_Declared',
  'NotSubmitted_TrackSheet_Certificate',
  'Submitted_TrackSheet_Certificate',
  'Approved',
])

// 10. Distance Segregation Report columns (PDF Page 2)
const distanceCols = buildCols([
  'SNo',
  'ApplicationNo',
  'ChildName',
  'FatherName',
  'FatherDesignation',
  'Distance',
  'TransportMode',
])

// 11. Religion / Caste Wise columns (PDF Page 4)
const religionCasteCols = buildCols([
  'SNo',
  'ApplicationNo',
  'ChildName',
  'Gender',
  'DateOfBirth',
  'Religion',
  'Caste',
  'Community',
  'MotherTongue',
  'FatherName',
  'ApplicationStatus',
])

// 12. Twins/Triplets Report columns (PDF Page 5)
const twinsCols = buildCols([
  'SNo',
  'ApplicationNo',
  'ChildName',
  'FatherName',
  'TwinsNo',
  'Gender',
  'DateOfBirth',
])

export const reportConfig: Record<string, ReportConfigItem> = {
  // 1. Track Sheet Verification Report
  'tracksheet-verification': {
    id: 'tracksheet-verification',
    label: 'Track Sheet Verification Report',
    description: 'Detailed verification report showing parents qualifications, alumni status, address, and siblings.',
    columns: trackSheetVerificationCols,
    filters: [
      { key: 'appNoFrom', label: 'Appln No Range From', type: 'text', placeholder: 'From App No' },
      { key: 'appNoTo', label: 'Appln No Range To', type: 'text', placeholder: 'To App No' },
    ],
  },

  // 2. Alumni Report
  alumni: {
    id: 'alumni',
    label: 'Alumni Report',
    description: 'All students who have at least one family member (mother, father, or sibling) who is an alumnus.',
    columns: alumniCols,
    filters: [
      {
        key: 'alumniCategory',
        label: 'Alumni Category',
        type: 'select',
        options: [
          { value: 'all', label: 'All Alumni' },
          { value: 'sibling-excluded', label: 'Sibling Excluded' },
          { value: 'alumni-excluded', label: 'Alumni Excluded (General)' },
        ],
      },
    ],
  },

  // 3. Distance Segregation Report
  'distance-segregation': {
    id: 'distance-segregation',
    label: 'Distance Segregation Report',
    description: 'Applicant segregation based on residential distance from school campuses.',
    columns: distanceCols,
    filters: [],
  },

  // 4. Siblings Report
  siblings: {
    id: 'siblings',
    label: 'Siblings Report',
    description: 'Applicants with school going siblings, filterable by sibling school (All, PSBB, Others).',
    columns: siblingCols,
    filters: [
      {
        key: 'siblingCategory',
        label: 'Sibling Category',
        type: 'select',
        options: [
          { value: 'all', label: 'All Siblings' },
          { value: 'alumni-excluded', label: 'Alumni Excluded' },
          { value: 'sibling-alumni', label: 'Sibling & Alumni' },
        ],
      },
      {
        key: 'siblingSchoolId',
        label: "Sibling's School",
        type: 'select',
        options: [
          { value: '1046', label: 'All' },
          { value: '1047', label: 'PSBB' },
          { value: '1048', label: 'Others' },
        ],
      },
    ],
  },

  // 5. Religion Wise Report
  'religion-wise': {
    id: 'religion-wise',
    label: 'Religion Wise Report',
    description: 'Distribution of applicant registrations by religious affiliations.',
    columns: religionCasteCols,
    filters: [],
  },

  // 10. General Caste Wise Report
  'general-caste-wise': {
    id: 'general-caste-wise',
    label: 'General Caste Wise Report',
    description: 'Applicant records categorized by community and caste demographics.',
    columns: religionCasteCols,
    filters: [],
  },

  // 6. Duplicate Applications Report
  'duplicate-applications': {
    id: 'duplicate-applications',
    label: 'Duplicate Applications Report',
    description: 'Detects duplicate applications based on matching child and parent dates of birth.',
    columns: duplicateCols,
    filters: [],
  },

  // 7. Twins/Triplets/Quadruplets Report
  'twins-triplets': {
    id: 'twins-triplets',
    label: 'Twins / Triplets / Quadruplets Report',
    description: 'Filter applicants who are part of twin, triplet, or quadruplet multiple births.',
    columns: twinsCols,
    filters: [
      {
        key: 'siblingType',
        label: 'Sibling Type',
        type: 'select',
        options: [
          { value: '1045', label: 'All' },
          { value: '1042', label: 'Twins' },
          { value: '1043', label: 'Triplets' },
          { value: '1044', label: 'Quadruplets' },
        ],
      },
    ],
  },

  // 8. Application Statistics Report
  'application-statistics': {
    id: 'application-statistics',
    label: 'Application Statistics Report',
    description: 'Summary counts for Declared, Not Submitted, Submitted, and Approved applications.',
    columns: appStatsCols,
    filters: [],
  },

  // 9. Date Wise Report
  'date-wise': {
    id: 'date-wise',
    label: 'Date Wise Report',
    description: 'Registration counts and progression broken down by calendar declaration dates.',
    columns: dateWiseCols,
    filters: [],
  },

  // 10. Submission Date Wise Report
  'submission-date-wise': {
    id: 'submission-date-wise',
    label: 'Submission Date Wise Report',
    description: 'Applications called and processed categorized by physical track sheet submission date.',
    columns: subDateWiseCols,
    filters: [],
  },

  // 11. Statistics Report
  statistics: {
    id: 'statistics',
    label: 'Statistics Report',
    description: 'High level statistical counts for Alumni, Sibling, Combo, and General categories.',
    columns: statsCols,
    filters: [],
  },

  // 12. Applicant Report (Detailed) - All 18 Criteria
  detailed: {
    id: 'detailed',
    label: 'Applicant Report',
    description: 'Comprehensive query report with granular multi-criteria filtering across all applicant parameters.',
    columns: detailedCols,
    filters: [
      {
        key: 'academicYearId',
        label: 'Academic Year',
        type: 'select',
        options: [
          { value: '1', label: '2025-2026' },
          { value: '2', label: '2024-2025' },
        ],
      },
      {
        key: 'branchId',
        label: 'Branch',
        type: 'select',
        options: [
          { value: '1', label: 'T.Nagar-PSBB' },
          { value: '2', label: 'K.K.Nagar-PSBB' },
        ],
      },
      {
        key: 'applicationStatusId',
        label: 'Application Status',
        type: 'select',
        options: [
          { value: '1', label: 'Declared' },
          { value: '2', label: 'Submitted' },
          { value: '3', label: 'Approved' },
          { value: '4', label: 'Not Submitted' },
        ],
      },
      { key: 'registrationNumber', label: 'Registration Number', type: 'text', placeholder: 'e.g. T25-0001' },
      {
        key: 'genderId',
        label: 'Gender',
        type: 'select',
        options: [
          { value: '1', label: 'Male' },
          { value: '2', label: 'Female' },
        ],
      },
      {
        key: 'alumni',
        label: 'Alumni',
        type: 'select',
        options: [
          { value: '1', label: 'Father' },
          { value: '2', label: 'Mother' },
          { value: '3', label: 'Either Father or Mother' },
          { value: '4', label: 'Both Parents' },
        ],
      },
      {
        key: 'childGotoPlaySchool',
        label: 'Child Goes to Play School',
        type: 'select',
        options: [
          { value: '1', label: 'Yes' },
          { value: '0', label: 'No' },
        ],
      },
      {
        key: 'isNormalChild',
        label: 'Physically Challenged',
        type: 'select',
        options: [
          { value: '0', label: 'Yes' },
          { value: '1', label: 'No' },
        ],
      },
      {
        key: 'isTwins',
        label: 'Twins / Triplets',
        type: 'select',
        options: [
          { value: '1', label: 'Yes' },
          { value: '0', label: 'No' },
        ],
      },
      {
        key: 'schoolGoingSibilings',
        label: 'Siblings Studying',
        type: 'select',
        options: [
          { value: '1', label: 'Yes' },
          { value: '0', label: 'No' },
        ],
      },
      {
        key: 'fatherIncomeId',
        label: 'Father Income Range',
        type: 'select',
        options: [
          { value: '1', label: 'Up to 10,000' },
          { value: '2', label: '10,001 - 20,000' },
          { value: '3', label: '20,001 - 30,000' },
          { value: '4', label: '30,001 - 40,000' },
          { value: '5', label: '40,001 - 50,000' },
          { value: '6', label: '50,001 - 60,000' },
          { value: '7', label: '60,001 - 70,000' },
          { value: '8', label: '70,001 - 80,000' },
          { value: '9', label: '80,001 - 90,000' },
          { value: '10', label: '90,001 - 1,00,000' },
          { value: '11', label: '1,00,001 - 1,25,000' },
          { value: '12', label: '1,25,001 - 1,50,000' },
          { value: '13', label: '1,50,001 - 1,75,000' },
          { value: '14', label: '1,75,001 - 2,00,000' },
          { value: '15', label: '2,00,001 - 2,50,000' },
          { value: '16', label: '2,50,001 - 3,00,000' },
          { value: '17', label: '3,00,001 - 3,50,000' },
          { value: '18', label: '3,50,001 - 4,00,000' },
          { value: '19', label: '4,00,001 - 4,50,000' },
          { value: '20', label: '4,50,001 - 4,99,999' },
          { value: '21', label: '5,00,000 and Above' },
        ],
      },
      {
        key: 'motherIncomeId',
        label: 'Mother Income Range',
        type: 'select',
        options: [
          { value: '1', label: 'Up to 10,000' },
          { value: '2', label: '10,001 - 20,000' },
          { value: '3', label: '20,001 - 30,000' },
          { value: '4', label: '30,001 - 40,000' },
          { value: '5', label: '40,001 - 50,000' },
          { value: '6', label: '50,001 - 60,000' },
          { value: '7', label: '60,001 - 70,000' },
          { value: '8', label: '70,001 - 80,000' },
          { value: '9', label: '80,001 - 90,000' },
          { value: '10', label: '90,001 - 1,00,000' },
          { value: '11', label: '1,00,001 - 1,25,000' },
          { value: '12', label: '1,25,001 - 1,50,000' },
          { value: '13', label: '1,50,001 - 1,75,000' },
          { value: '14', label: '1,75,001 - 2,00,000' },
          { value: '15', label: '2,00,001 - 2,50,000' },
          { value: '16', label: '2,50,001 - 3,00,000' },
          { value: '17', label: '3,00,001 - 3,50,000' },
          { value: '18', label: '3,50,001 - 4,00,000' },
          { value: '19', label: '4,00,001 - 4,50,000' },
          { value: '20', label: '4,50,001 - 4,99,999' },
          { value: '21', label: '5,00,000 and Above' },
        ],
      },
      {
        key: 'distanceId',
        label: 'Distance',
        type: 'select',
        options: [
          { value: '1', label: 'Up to 0.5 Km' },
          { value: '2', label: '0.5 Km - 1.0 Km' },
          { value: '3', label: '1.1 Km - 1.5 Km' },
          { value: '4', label: '1.6 Km - 2.0 Km' },
          { value: '5', label: '2.1 Km - 3.0 Km' },
          { value: '6', label: '3.1 Km - 4.0 Km' },
          { value: '7', label: '4.1 Km - 5.0 Km' },
          { value: '8', label: '5.1 Km - 7.0 Km' },
          { value: '9', label: '7.1 Km - 9.0 Km' },
          { value: '10', label: '9.1 Km and above' },
        ],
      },
      {
        key: 'motherTongueId',
        label: 'Mother Tongue',
        type: 'select',
        options: [
          { value: '1', label: 'Tamil' },
          { value: '2', label: 'English' },
          { value: '3', label: 'Hindi' },
          { value: '4', label: 'Telugu' },
          { value: '5', label: 'Malayalam' },
          { value: '6', label: 'Kannada' },
          { value: '7', label: 'Other' },
        ],
      },
      {
        key: 'nationalityId',
        label: 'Nationality',
        type: 'select',
        options: [
          { value: '1', label: 'Indian' },
          { value: '2', label: 'NRI' },
          { value: '3', label: 'Foreign National' },
        ],
      },
      {
        key: 'religionId',
        label: 'Religion',
        type: 'select',
        options: [
          { value: '1', label: 'Hindu' },
          { value: '2', label: 'Christian' },
          { value: '3', label: 'Muslim' },
          { value: '4', label: 'Jain' },
          { value: '5', label: 'Sikh' },
          { value: '6', label: 'Other' },
        ],
      },
      {
        key: 'casteId',
        label: 'Caste',
        type: 'select',
        options: [
          { value: '1', label: 'General' },
          { value: '2', label: 'OBC' },
          { value: '3', label: 'MBC' },
          { value: '4', label: 'SC' },
          { value: '5', label: 'ST' },
          { value: '6', label: 'Other' },
        ],
      },
      {
        key: 'communityId',
        label: 'Community',
        type: 'select',
        options: [
          { value: '1', label: 'BC' },
          { value: '2', label: 'MBC' },
          { value: '3', label: 'OC' },
          { value: '4', label: 'SC' },
          { value: '5', label: 'ST' },
        ],
      },
    ],
  },
}
