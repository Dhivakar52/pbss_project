/**
 * Validation utilities for Authentication & Registration flows
 */

// RFC 5322 standard simplified email regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

export const isValidEmail = (email: string): boolean => {
  return EMAIL_REGEX.test(email.trim())
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
  }

  return errors
}

export interface RegisterFormValues {
  fullName: string
  email: string
  password: string
  confirmPassword: string
}

export interface RegisterFormErrors {
  fullName?: string
  email?: string
  password?: string
  confirmPassword?: string
}

export const validateRegisterForm = (
  values: RegisterFormValues,
  isEmailTaken?: (email: string) => boolean
): RegisterFormErrors => {
  const errors: RegisterFormErrors = {}

  // 1. Full Name
  if (!values.fullName.trim()) {
    errors.fullName = 'Full Name is required'
  } else if (values.fullName.trim().length < 2) {
    errors.fullName = 'Full Name must be at least 2 characters'
  }

  // 2. Email Address
  if (!values.email.trim()) {
    errors.email = 'Email Address is required'
  } else if (!isValidEmail(values.email)) {
    errors.email = 'Please enter a valid email address'
  } else if (isEmailTaken && isEmailTaken(values.email.trim())) {
    errors.email = 'An account with this email address already exists'
  }

  // 3. Password
  if (!values.password) {
    errors.password = 'Password is required'
  } else if (values.password.length < 3) {
    errors.password = 'Password must be at least 3 characters'
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
