/**
 * Centralized instruction dates for Login Page accordion sections:
 * - Registration
 * - Track Sheet
 * - Terms and Conditions
 *
 * Date format: DD-MM-YYYY
 */

// Shared date constants ensuring a single source of truth across all instruction sections
export const INSTRUCTION_SHARED_DATES = {
  dateOfBirthFrom: '01-06-2023',
  dateOfBirthTo: '31-05-2024',
  asOnDate: '01-06-2027',
  printDeadlineDate: '03-06-2027',
  academicYear: '2027-2028',
  academicYearShort: '2027-28',
} as const

export const INSTRUCTION_DATES = {
  registration: {
    /** Eligible child date of birth starting range (DD-MM-YYYY) */
    dateOfBirthFrom: INSTRUCTION_SHARED_DATES.dateOfBirthFrom,
    /** Eligible child date of birth ending range (DD-MM-YYYY) */
    dateOfBirthTo: INSTRUCTION_SHARED_DATES.dateOfBirthTo,
    /** Print option availability deadline (DD-MM-YYYY) */
    printDeadlineDate: INSTRUCTION_SHARED_DATES.printDeadlineDate,
    /** Academic year for registration */
    academicYear: INSTRUCTION_SHARED_DATES.academicYear,
  },
  trackSheet: {
    /** Submission deadline for track sheet (if applicable) */
    submissionDeadline: '',
    /** Short academic year for track sheet PDF (e.g. '2027-28') */
    academicYear: INSTRUCTION_SHARED_DATES.academicYearShort,
  },
  terms: {
    /** Age eligibility reference cutoff date ("as on DD-MM-YYYY") */
    asOnDate: INSTRUCTION_SHARED_DATES.asOnDate,
    /** Eligible child date of birth starting range (DD-MM-YYYY) */
    dateOfBirthFrom: INSTRUCTION_SHARED_DATES.dateOfBirthFrom,
    /** Eligible child date of birth ending range (DD-MM-YYYY) */
    dateOfBirthTo: INSTRUCTION_SHARED_DATES.dateOfBirthTo,
  },
  termsAndConditions: {
    /** Age eligibility reference cutoff date ("as on DD-MM-YYYY") */
    asOnDate: INSTRUCTION_SHARED_DATES.asOnDate,
    /** Eligible child date of birth starting range (DD-MM-YYYY) */
    dateOfBirthFrom: INSTRUCTION_SHARED_DATES.dateOfBirthFrom,
    /** Eligible child date of birth ending range (DD-MM-YYYY) */
    dateOfBirthTo: INSTRUCTION_SHARED_DATES.dateOfBirthTo,
  },
} as const

export type InstructionDates = typeof INSTRUCTION_DATES
