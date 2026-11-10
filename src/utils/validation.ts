/**
 * Validation utilities for PSBB Admission Module & Authentication flows
 */

const EMAIL_REGEX = /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,63}$/

export const isValidEmail = (email: string): boolean => {
  if (!email) return false
  const trimmed = email.trim()
  const [localPart, ...domainParts] = trimmed.split('@')
  return (
    trimmed.length <= 254 &&
    localPart.length <= 64 &&
    domainParts.length === 1 &&
    EMAIL_REGEX.test(trimmed)
  )
}

const COMMON_MISTYPED_EMAIL_DOMAINS = new Set([
  'hmail.com',
  'hmmail.com',
  'tmail.com',
  'gamil.com',
  'gmai.com',
  'gmial.com',
  'hotmial.com',
  'yaho.com',
  'outlok.com',
])

export const isValidRegistrationEmail = (email: string): boolean => {
  if (!isValidEmail(email)) return false
  const domain = email.trim().toLowerCase().split('@')[1]
  return !COMMON_MISTYPED_EMAIL_DOMAINS.has(domain)
}

export interface LoginFormValues {
  email: string
  password?: string
}

export interface LoginFormErrors {
  email?: string
  password?: string
}

export const validateLoginForm = (values: LoginFormValues): LoginFormErrors => {
  const errors: LoginFormErrors = {}

  if (!values.email.trim()) {
    errors.email = 'Email Address is required'
  } else if (!isValidEmail(values.email)) {
    errors.email = 'Please enter a valid email address (e.g. name@domain.com)'
  }

  if (!values.password) {
    errors.password = 'Password is required'
  } else if (values.password.length < 8) {
    errors.password = 'Password must be at least 8 characters'
  } else if (values.password.length > 20) {
    errors.password = 'Password cannot exceed 20 characters'
  }

  return errors
}

export interface RegisterFormValues {
  userName: string
  email: string
  password: string
  confirmPassword: string
}

export interface RegisterFormErrors {
  userName?: string
  email?: string
  password?: string
  confirmPassword?: string
}

export const validateRegisterForm = (
  values: RegisterFormValues,
  isEmailTaken?: (email: string) => boolean
): RegisterFormErrors => {
  const errors: RegisterFormErrors = {}

  if (!values.userName.trim()) {
    errors.userName = 'Username is required'
  } else if (values.userName.trim().length > 100) {
    errors.userName = 'Username cannot exceed 100 characters'
  }

  // 2. Email Address
  if (!values.email.trim()) {
    errors.email = 'Email Address is required'
  } else if (!isValidEmail(values.email)) {
    errors.email = 'Please enter a valid email address (e.g. name@domain.com)'
  } else if (isEmailTaken && isEmailTaken(values.email.trim())) {
    errors.email = 'An account with this email address already exists'
  }

  // 3. Password
  if (!values.password) {
    errors.password = 'Password is required'
  } else if (values.password.length < 8) {
    errors.password = 'Password must be at least 8 characters'
  } else if (values.password.length > 20) {
    errors.password = 'Password cannot exceed 20 characters'
  }

  // 4. Confirm Password
  if (!values.confirmPassword) {
    errors.confirmPassword = 'Confirm Password is required'
  } else if (values.password !== values.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match'
  }

  return errors
}

export const validateOtp = (otp: string): string | null => {
  if (!otp.trim()) {
    return 'Please enter the 4-digit OTP'
  }
  if (!/^\d{4}$/.test(otp.trim())) {
    return 'OTP must be exactly 4 digits'
  }
  return null
}

/** Name validation: allows alphabets, spaces, and dots for initials (e.g. 'K. Rahul') */
export const NAME_REGEX = /^[a-zA-Z\s.]+$/
export const isValidName = (name: string): boolean => {
  const trimmed = (name || '').trim()
  return Boolean(trimmed && NAME_REGEX.test(trimmed) && /[a-zA-Z]/.test(trimmed))
}

/**
 * Derives the expected branch initial of USN based on selected school name.
 * - K.K. Nagar → K
 * - T. Nagar → T
 * - Siruseri → S
 * - Nungambakkam → N
 */
export const getBranchInitial = (schoolName?: string): string => {
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

/**
 * USN Format: T/N/S/K + 6 digits (e.g. T123456)
 */
export const USN_REGEX = /^[KSN]\d{6}$/i

export const isValidUsn = (schoolName: string, usn: string): boolean => {
  const trimmedSchool = (schoolName || '').trim()
  if (!trimmedSchool || trimmedSchool.toLowerCase() === 'others') return true
  const trimmedUsn = (usn || '').trim()
  if (!trimmedUsn) return false
  // const branchInitial = getBranchInitial(trimmedSchool)
  // if (branchInitial) {
  //   return new RegExp(`^${branchInitial}\\d{6}$`, 'i').test(trimmedUsn)
  // }
  return USN_REGEX.test(trimmedUsn)
}

/**
 * Validates Sibling USN based on selected school name and returns error message if invalid.
 */
export const getUsnValidationError = (schoolName: string, usn: string): string => {
  const trimmedSchool = (schoolName || '').trim()
  if (!trimmedSchool || trimmedSchool.toLowerCase() === 'others') return ''
  const trimmedUsn = (usn || '').trim()
  if (!trimmedUsn) return 'USN is required'  
    if (!USN_REGEX.test(trimmedUsn)) {
      return 'USN must start with N, S, or K followed by 6 digits (e.g. T123456).'
    }
  
  return ''
}

/** Indian Pincode validation: exactly 6 digits */
export const PINCODE_REGEX = /^\d{6}$/
export const isValidPincode = (pincode: string): boolean => {
  return PINCODE_REGEX.test((pincode || '').trim())
}

/** 10-digit Indian Mobile validation */
export const MOBILE_REGEX = /^[6-9]\d{9}$/
export const isValidMobile = (mobile: string): boolean => {
  return MOBILE_REGEX.test((mobile || '').replace(/\D/g, ''))
}

/** Phone Number validation: numeric with optional hyphen/space, between 6 and 15 digits */
export const isValidPhoneNumber = (phone: string): boolean => {
  const digits = (phone || '').replace(/\D/g, '')
  return digits.length >= 6 && digits.length <= 15
}

/** Address character regex */
export const ADDRESS_REGEX = /^[a-zA-Z0-9\s.,\-#/\\:;()'&]+$/
export const isValidAddress = (addr: string): boolean => {
  const trimmed = (addr || '').trim()
  return Boolean(trimmed && ADDRESS_REGEX.test(trimmed))
}

/**
 * Calculates the maximum selectable date of birth for an adult (at least 18 years old as of today).
 * Format: YYYY-MM-DD
 */
export const getMaxAdultDate = (): string => {
  const today = new Date()
  const cutoff = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate())
  if (cutoff.getMonth() !== today.getMonth()) {
    cutoff.setDate(0) // Handle Feb 29 rollover in non-leap year
  }
  const yyyy = cutoff.getFullYear()
  const mm = String(cutoff.getMonth() + 1).padStart(2, '0')
  const dd = String(cutoff.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

/**
 * Validates that a date of birth represents an individual at least 18 years old as of today.
 */
export const isValidAdultDob = (dob: string): { isValid: boolean; error?: string } => {
  if (!dob || !dob.trim()) {
    return { isValid: false, error: 'Date of Birth is required' }
  }
  let dobIso = dob.trim()
  const ddmmyyyy = dobIso.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/)
  if (ddmmyyyy) {
    dobIso = `${ddmmyyyy[3]}-${ddmmyyyy[2].padStart(2, '0')}-${ddmmyyyy[1].padStart(2, '0')}`
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dobIso)) {
    return { isValid: false, error: 'Please enter a valid Date of Birth' }
  }
  const dateObj = new Date(dobIso + 'T00:00:00')
  if (isNaN(dateObj.getTime())) {
    return { isValid: false, error: 'Please enter a valid Date of Birth' }
  }
  if (dobIso < '1900-01-01') {
    return { isValid: false, error: 'Please enter a valid Date of Birth' }
  }
  const maxAdultDate = getMaxAdultDate()
  if (dobIso > maxAdultDate) {
    return { isValid: false, error: 'You must be at least 18 years old to create an account.' }
  }
  return { isValid: true }
}

/**
 * Password validation rule:
 * Must be between 8 and 20 characters.
 */
export const validatePasswordLength = (password: string, fieldName = 'Password'): string | undefined => {
  if (!password) {
    return `${fieldName} is required`
  }
  if (password.length < 8) {
    return `${fieldName} must be at least 6 characters`
  }
  if (password.length > 20) {
    return `${fieldName} cannot exceed 20 characters`
  }
  return undefined
}
