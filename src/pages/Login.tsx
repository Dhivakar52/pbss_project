import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Mail,
  Lock,
  Loader2,
  UserPlus,
  ArrowLeft,
  ChevronDown,
  FileText,
} from 'lucide-react'
import { toast } from '@/components/ui/toast'
import { useAuthStore } from '@/store/useAuthStore'
import { validateLoginForm, type LoginFormErrors, isValidEmail, validatePasswordLength } from '@/utils/validation'
import { Field, TextField, DobDateField } from '@/components/FormPrimitives'
import { ApiService, type HomeContentsRecord } from '@/services/api.service'
import { downloadTrackSheetPdf } from '@/utils/trackSheetPdfGenerator'
import { INSTRUCTION_DATES } from '@/constants/instructionDates'
import logoImg from '@/assets/images/logo.png'
import bannerImg from '@/assets/images/banner.png'
import banner1Img from '@/assets/images/banner-1.png'
import ElibilityForm from '@/assets/images/Register-login.png'
import RegistrationContent from '@/components/RegistrationContent'
import TrackSheetContent from '@/components/TrackSheetContent'
import TermsContent from '@/components/TermsContent'

type ViewMode = 'login' | 'forgot'
type ForgotStep = 'verify' | 'reset'

interface ForgotErrors {
  userId?: string
  dob?: string
  newPassword?: string
  confirmPassword?: string
}

const formatHomeContent = (content?: string | null) =>
  content
    ?.replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(?:p|div|li)\s*>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .trim() || ''

// Temporary display cutoff: November 3, 2026, 5:00 PM IST (Asia/Kolkata)
const LOGIN_CUTOFF_TIMESTAMP = new Date('2026-11-04T14:45:00+05:30').getTime()

const checkIsCutoffReached = (): boolean => Date.now() >= LOGIN_CUTOFF_TIMESTAMP

// const formatCurrentDateTime = (): string => {
//   const now = new Date()
//   const month = String(now.getMonth() + 1).padStart(2, '0')
//   const day = String(now.getDate()).padStart(2, '0')
//   const year = now.getFullYear()
//   let hours = now.getHours()
//   const minutes = String(now.getMinutes()).padStart(2, '0')
//   const ampm = hours >= 12 ? 'PM' : 'AM'
//   hours = hours % 12 || 12
//   return `${month}/${day}/${year} ${hours}:${minutes} ${ampm}`
// }
const formatCurrentDateTime = (): string => {
  const now = new Date()

  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).formatToParts(now)

  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value || ''

  return `${get('day')}/${get('month')}/${get('year')} ${get('hour')}:${get('minute')} ${get('dayPeriod')}`
}

export const CircleDateBadge: React.FC<{ text?: string | null }> = ({ text }) => {
  const formattedTime = formatHomeContent(text)
  const lines = formattedTime ? formattedTime.split(/\r?\n/).filter(Boolean) : null

  return (
    <div className="absolute -top-9 -right-3 sm:-top-8 sm:-right-6 w-[130px] h-[130px] sm:w-[125px] sm:h-[125px] md:w-[155px]  md:h-[155px]  rounded-full bg-[#08698c] border-[2.5px] border-[#eab308] flex flex-col items-center justify-center text-center text-white font-bold leading-tight px-2.5 shadow-md z-10 select-none"
      style={{
        fontSize: "10px"
      }}>
      {
        lines && lines.length > 0 ? (
          lines.map((l, idx) => (
            <span key={idx} className="text-[10px] sm:text-[11px] leading-[1.25]">
              {l}
            </span>
          ))
        )

          : (
            <>
              <span className="text-[11px] sm:text-xs">Registration</span>
              <span className="text-[10px] sm:text-[11px]">Opens on</span>
              <span className="text-[10px] sm:text-[11px]">15 Nov, 5AM</span>
              <span className="text-[10px] sm:text-[11px]">and Closes on</span>
              <span className="text-[10px] sm:text-[11px]">17 Nov, 12PM.</span>
            </>
          )}
    </div>
  )
}

/* =========================================================
   HARDCODED ACCORDION CONTENT (screenshot-படி)
   Dates use INSTRUCTION_DATES constants
   ========================================================= */



const Login: React.FC = () => {
  const navigate = useNavigate()
  const { login, updateLocalPassword, clearPendingRegistration } = useAuthStore()

  // View state: 'login' | 'forgot'
  const [mode, setMode] = useState<ViewMode>('login')

  // Login form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [loginErrors, setLoginErrors] = useState<LoginFormErrors>({})

  // Forgot Password state
  const [forgotUserId, setForgotUserId] = useState('')
  const [forgotDob, setForgotDob] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [forgotErrors, setForgotErrors] = useState<ForgotErrors>({})
  const [forgotStep, setForgotStep] = useState<ForgotStep>('verify')
  const [isVerifyingForgotDetails, setIsVerifyingForgotDetails] = useState(false)
  const [isResettingPassword, setIsResettingPassword] = useState(false)

  // Home Content
  const [homeContents, setHomeContents] = useState<HomeContentsRecord | null>(null)
  const [openAccordion, setOpenAccordion] = useState<string | null>(null)
  const [currentDateTime, setCurrentDateTime] = useState<string>(formatCurrentDateTime)

  // Temporary banner display state until November 3, 2026, 5:00 PM IST
  const [isCutoffReached, setIsCutoffReached] = useState<boolean>(checkIsCutoffReached)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(formatCurrentDateTime())
    }, 30000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (isCutoffReached) return

    const verifyCutoff = () => {
      if (checkIsCutoffReached()) {
        setIsCutoffReached(true)
      }
    }

    verifyCutoff()
    if (checkIsCutoffReached()) return

    const remainingDelay = Math.max(0, LOGIN_CUTOFF_TIMESTAMP - Date.now())
    const timeoutId = setTimeout(verifyCutoff, remainingDelay)
    const intervalId = setInterval(verifyCutoff, 5000)

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        verifyCutoff()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearTimeout(timeoutId)
      clearInterval(intervalId)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isCutoffReached])

  useEffect(() => {
    let isMounted = true
    ApiService.fetchHomeContents()
      .then((contents) => {
        if (isMounted) setHomeContents(contents)
      })
      .catch(console.warn)

    // Clear logout flag once the login page has mounted
    if (typeof window !== 'undefined') {
      const timer = setTimeout(() => {
        sessionStorage.removeItem('psbb_logging_out')
      }, 500)
      return () => {
        isMounted = false
        clearTimeout(timer)
      }
    }
    return () => {
      isMounted = false
    }
  }, [])

  const handleLoginEmailChange = (val: string) => {
    setEmail(val)
    if (!val.trim()) {
      setLoginErrors((prev) => ({ ...prev, email: undefined }))
      return
    }
    if (loginErrors.email && isValidEmail(val)) {
      setLoginErrors((prev) => ({ ...prev, email: undefined }))
    }
  }

  const handleLoginEmailBlur = () => {
    const trimmed = email.trim()
    if (!trimmed) {
      setLoginErrors((prev) => ({ ...prev, email: 'Email Address is required' }))
    } else if (!isValidEmail(trimmed)) {
      setLoginErrors((prev) => ({ ...prev, email: 'Please enter a valid email address (e.g. name@domain.com)' }))
    } else {
      setLoginErrors((prev) => ({ ...prev, email: undefined }))
    }
  }

  const handleLoginPasswordChange = (val: string) => {
    const sanitized = val.slice(0, 20)
    setPassword(sanitized)
    if (!sanitized) {
      setLoginErrors((prev) => ({ ...prev, password: undefined }))
      return
    }
    if (loginErrors.password && sanitized.length >= 6) {
      setLoginErrors((prev) => ({ ...prev, password: undefined }))
    }
  }

  const handleLoginPasswordBlur = () => {
    if (!password) {
      setLoginErrors((prev) => ({ ...prev, password: 'Password is required' }))
    } else if (password.length < 8) {
      setLoginErrors((prev) => ({ ...prev, password: 'Password must be at least 8 characters' }))
    } else if (password.length > 20) {
      setLoginErrors((prev) => ({ ...prev, password: 'Password cannot exceed 20 characters' }))
    } else {
      setLoginErrors((prev) => ({ ...prev, password: undefined }))
    }
  }

  const handleForgotUserIdChange = (val: string) => {
    setForgotUserId(val)
    if (!val.trim()) {
      setForgotErrors((prev) => ({ ...prev, userId: undefined }))
      return
    }
    if (forgotErrors.userId && isValidEmail(val)) {
      setForgotErrors((prev) => ({ ...prev, userId: undefined }))
    }
  }

  const handleForgotUserIdBlur = () => {
    const trimmed = forgotUserId.trim()
    if (!trimmed) {
      setForgotErrors((prev) => ({ ...prev, userId: 'Email Address is required' }))
    } else if (!isValidEmail(trimmed)) {
      setForgotErrors((prev) => ({ ...prev, userId: 'Please enter a valid email address (e.g. name@domain.com)' }))
    } else {
      setForgotErrors((prev) => ({ ...prev, userId: undefined }))
    }
  }

  // Handle Login submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const errors = validateLoginForm({ email, password })
    setLoginErrors(errors)

    if (errors.email) {
      toast.error(errors.email)
      return
    }

    if (errors.password) {
      toast.error(errors.password)
      return
    }

    setIsLoading(true)

    try {
      const result = await login(email, password)

      if (result.success && result.user) {
        if (result.user.role?.toLowerCase() === 'admin') {
          toast.success(`Welcome ${result.user.name}! Redirecting to Dashboard...`)
          navigate('/dashboard')
        } else {
          toast.success(`Welcome ${result.user.name}! Redirecting to Admission...`)
          navigate('/admission')
        }
      } else {
        const errorMsg = result.error || 'Invalid Email Address or Password'
        setLoginErrors({
          email: errorMsg,
          password: 'Check your password or credentials',
        })
        toast.error(errorMsg)
      }
    } catch (err: any) {
      const errorMsg = err?.message || 'Login failed. Please check backend connection.'
      setLoginErrors({ email: errorMsg })
      toast.error(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotNewPasswordChange = (val: string) => {
    const sanitized = val.slice(0, 20)
    setNewPassword(sanitized)
    if (!sanitized) {
      setForgotErrors((prev) => ({ ...prev, newPassword: undefined }))
      return
    }
    if (sanitized.length >= 8) {
      setForgotErrors((prev) => ({ ...prev, newPassword: undefined }))
    }
    if (confirmPassword && sanitized !== confirmPassword) {
      setForgotErrors((prev) => ({ ...prev, confirmPassword: 'Passwords do not match' }))
    } else if (confirmPassword && sanitized === confirmPassword) {
      setForgotErrors((prev) => ({ ...prev, confirmPassword: undefined }))
    }
  }

  const handleForgotNewPasswordBlur = () => {
    if (!newPassword) {
      setForgotErrors((prev) => ({ ...prev, newPassword: 'New Password is required' }))
    } else if (newPassword.length < 8) {
      setForgotErrors((prev) => ({ ...prev, newPassword: 'New Password must be at least 8 characters' }))
    } else if (newPassword.length > 20) {
      setForgotErrors((prev) => ({ ...prev, newPassword: 'New Password cannot exceed 20 characters' }))
    } else {
      setForgotErrors((prev) => ({ ...prev, newPassword: undefined }))
    }
  }

  const handleForgotConfirmPasswordChange = (val: string) => {
    const sanitized = val.slice(0, 20)
    setConfirmPassword(sanitized)
    if (!sanitized) {
      setForgotErrors((prev) => ({ ...prev, confirmPassword: undefined }))
      return
    }
    if (newPassword && sanitized !== newPassword) {
      setForgotErrors((prev) => ({ ...prev, confirmPassword: 'Passwords do not match' }))
    } else {
      setForgotErrors((prev) => ({ ...prev, confirmPassword: undefined }))
    }
  }

  const handleForgotConfirmPasswordBlur = () => {
    if (!confirmPassword) {
      setForgotErrors((prev) => ({ ...prev, confirmPassword: 'Confirm Password is required' }))
    } else if (newPassword !== confirmPassword) {
      setForgotErrors((prev) => ({ ...prev, confirmPassword: 'Passwords do not match' }))
    } else if (confirmPassword.length > 20) {
      setForgotErrors((prev) => ({ ...prev, confirmPassword: 'Confirm Password cannot exceed 20 characters' }))
    } else {
      setForgotErrors((prev) => ({ ...prev, confirmPassword: undefined }))
    }
  }

  const handleVerifyForgotDetails = async (e: React.FormEvent) => {
    e.preventDefault()
    const errors: ForgotErrors = {}

    if (!forgotUserId.trim()) {
      errors.userId = 'Email Address is required'
    } else if (!isValidEmail(forgotUserId.trim())) {
      errors.userId = 'Please enter a valid email address (e.g. name@domain.com)'
    }
    if (!forgotDob) {
      errors.dob = 'Date of Birth is required'
    }
    setForgotErrors(errors)
    if (Object.keys(errors).length > 0) return

    setIsVerifyingForgotDetails(true)
    try {
      const res = await ApiService.verifyPasswordReset({
        userName: forgotUserId.trim(),
        dob: forgotDob,
      })

      if (res?.ResponseCode === 1 || res?.ResponseCode === 200) {
        setForgotErrors({})
        setForgotStep('reset')
      } else {
        setForgotErrors({
          dob: res?.Message || 'Email Address and Date of Birth do not match.',
        })
      }
    } catch (apiErr: any) {
      setForgotErrors({
        dob: apiErr?.message || 'Unable to verify your details right now. Please try again.',
      })
    } finally {
      setIsVerifyingForgotDetails(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    const errors: ForgotErrors = {}
    const passError = validatePasswordLength(newPassword, 'New Password')
    if (passError) {
      errors.newPassword = passError
    } else if (newPassword.length < 8) {
      errors.newPassword = 'New Password must be at least 8 characters'
    }
    if (!confirmPassword) {
      errors.confirmPassword = 'Confirm Password is required'
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }

    setForgotErrors(errors)
    if (Object.keys(errors).length > 0) return

    setIsResettingPassword(true)
    try {
      const res = await ApiService.resetPassword({
        userName: forgotUserId.trim(),
        dob: forgotDob,
        newPassword,
      })

      if (res?.ResponseCode === 200 || res?.ResponseCode === 1) {
        updateLocalPassword?.(forgotUserId.trim(), newPassword)
        toast.success(res.Message || 'Password reset successfully! Please log in with your new password.')
        setMode('login')
      } else {
        setForgotErrors({
          newPassword: res?.Message || 'Password reset failed. Please try again.',
        })
      }
    } catch (apiErr: any) {
      setForgotErrors({
        newPassword: apiErr?.message || 'Password reset failed. Please try again.',
      })
    } finally {
      setIsResettingPassword(false)
    }
  }

  const toggleAccordion = (section: string) => {
    setOpenAccordion((prev) => (prev === section ? null : section))
  }

  // Before 5:00 PM IST on 03-Nov-2026, render only the temporary announcement banner
  if (!isCutoffReached) {
    return (
      <div className="min-h-screen w-full bg-[#f4f4f4] dark:bg-slate-950 flex items-center justify-center p-3 sm:p-5 md:p-8">
        <div className="w-full flex items-center justify-center">
          <img
            src={bannerImg}
            alt="School Admission Announcement"
            className="w-auto h-auto max-w-full max-h-[92vh] sm:max-h-[94vh] object-contain rounded-xl sm:rounded-2xl shadow-xl shadow-slate-300/60 dark:shadow-none border border-slate-200/80 dark:border-slate-800"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-[#dff0f8] flex flex-col font-sans select-text">
      {/* 1. Full-width dark teal header with school logo and current date/time */}
      <header className="w-full bg-[#08698c] text-white px-4 sm:px-6 md:px-8 py-3.5 shadow-md shrink-0 z-20">
        <div className=" flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="h-11 w-11 sm:h-12 sm:w-12 bg-white rounded-full p-1 flex items-center justify-center shrink-0 shadow-xs border border-white/60">
              <img
                src={logoImg}
                alt="Padma Seshadri Bala Bhavan Senior Secondary School Logo"
                className="h-full w-full object-contain"
              />
            </div>
            <h1 className="text-xs sm:text-sm md:text-base lg:text-[17px] font-bold tracking-wide uppercase text-white leading-tight">
              {formatHomeContent(homeContents?.SchoolNameContent) ||
                'PADMA SESHADRI BALA BHAVAN SENIOR SECONDARY SCHOOL'}
            </h1>
          </div>

          {/* Current date and time displayed in header right */}
          <div className="hidden sm:flex items-center text-white/90 font-semibold text-xs sm:text-sm tracking-wider shrink-0">
            {currentDateTime}
          </div>
        </div>
      </header>

      {/* 2. Page Content with banner-1.png educational doodles pattern */}
      <div
        className="flex-1 w-full relative flex items-center justify-center  mt- md:mt-0  p-4 sm:p-6 md:p-8 lg:p-10 bg-[#dff0f8]"
        style={{
          backgroundImage: `url(${banner1Img})`,
          backgroundRepeat: 'repeat',
          backgroundSize: '1200px auto',
        }}
      >
        <div className="w-full max-w-8xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center relative z-10">
          {/* ========================================================= */}
          {/* LEFT SECTION (col-span-7) */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 space-y-4">
            {/* Yellow Eligibility Information Card */}
            <div className="relative  ">
              <img src={ElibilityForm} className="w-full" />
            </div>

            {/* Three Accordion Sections */}
            <div className="space-y-3 pt-1">
              {/* Accordion 1: REGISTRATION */}
              <div className="bg-white rounded-lg border border-[#08698c] shadow-xs overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleAccordion('registration')}
                  className="w-full flex items-center justify-between px-5 py-3.5 text-left font-bold text-xs sm:text-sm tracking-wider uppercase text-black hover:bg-slate-50 transition-colors cursor-pointer"
                  aria-expanded={openAccordion === 'registration'}
                >
                  <span>REGISTRATION</span>
                  <ChevronDown
                    className={`h-4 w-4 text-[#08698c] transition-transform duration-200 ${openAccordion === 'registration' ? 'rotate-180' : ''
                      }`}
                  />
                </button>
                {openAccordion === 'registration' && (
                  <div className="px-5 pb-5 pt-2 border-t border-slate-100 text-xs sm:text-[13px] text-slate-700 leading-relaxed bg-white space-y-2.5">
                    {<RegistrationContent />}
                  </div>
                )}
              </div>

              {/* Accordion 2: TRACK SHEET SUBMISSION */}
              <div className="bg-white rounded-lg border border-[#08698c] shadow-xs overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleAccordion('trackSheet')}
                  className="w-full flex items-center justify-between px-5 py-3.5 text-left font-bold text-xs sm:text-sm tracking-wider uppercase text-black hover:bg-slate-50 transition-colors cursor-pointer"
                  aria-expanded={openAccordion === 'trackSheet'}
                >
                  <span>TRACK SHEET SUBMISSION</span>
                  <ChevronDown
                    className={`h-4 w-4 text-[#08698c] transition-transform duration-200 ${openAccordion === 'trackSheet' ? 'rotate-180' : ''
                      }`}
                  />
                </button>
                {openAccordion === 'trackSheet' && (
                  <div className="px-5 pb-5 pt-2 border-t border-slate-100 text-xs sm:text-[13px] text-slate-700 leading-relaxed bg-white space-y-2.5">
                    {<TrackSheetContent />}

                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await downloadTrackSheetPdf({ academicYear: INSTRUCTION_DATES.trackSheet.academicYear || '2027-28' })
                            toast.success('Track Sheet PDF downloaded successfully!')
                          } catch (err) {
                            console.error('Failed to download track sheet PDF:', err)
                            toast.error('The Track Sheet PDF could not be downloaded.')
                          }
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#08698c] hover:underline cursor-pointer"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        Click here to download Blank Track Sheet PDF
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Accordion 3: TERMS & CONDITIONS */}
              <div className="bg-white rounded-lg border border-[#08698c] shadow-xs overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleAccordion('terms')}
                  className="w-full flex items-center justify-between px-5 py-3.5 text-left font-bold text-xs sm:text-sm tracking-wider uppercase text-black hover:bg-slate-50 transition-colors cursor-pointer"
                  aria-expanded={openAccordion === 'terms'}
                >
                  <span>TERMS &amp; CONDITIONS</span>
                  <ChevronDown
                    className={`h-4 w-4 text-[#08698c] transition-transform duration-200 ${openAccordion === 'terms' ? 'rotate-180' : ''
                      }`}
                  />
                </button>
                {openAccordion === 'terms' && (
                  <div className="px-5 pb-5 pt-2 border-t border-slate-100 text-xs sm:text-[13px] text-slate-700 leading-relaxed bg-white space-y-2.5">
                    {<TermsContent />}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT SECTION (col-span-5) */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 flex justify-center ">
            <div className="relative w-full max-w-[430px] bg-white rounded-xl shadow-lg border border-slate-100 p-6 sm:p-8">
              {/* Back button in forgot password mode */}
              {mode === 'forgot' && forgotStep === 'verify' && (
                <button
                  type="button"
                  onClick={() => {
                    setForgotErrors({})
                    setMode('login')
                  }}
                  className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#08698c] hover:underline cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to Login
                </button>
              )}

              {/* School Name & Subtitle at top */}
              <div className="text-center pb-2">
                <h2 className="text-xs sm:text-[13px] font-extrabold text-[#083e58] tracking-wide uppercase leading-snug">
                  {formatHomeContent(homeContents?.SchoolNameContent) ||
                    'PADMA SESHADRI BALA BHAVAN SENIOR SECONDARY SCHOOL'}
                </h2>
                <p className="text-[11px] sm:text-xs font-semibold text-slate-500 tracking-wider uppercase mt-1.5">
                  {mode === 'forgot'
                    ? 'FORGOT PASSWORD'
                    : formatHomeContent(homeContents?.UpperContent) ||
                    'PRE-KG 2027-2028 ONLINE REGISTRATION'}
                </p>
                {mode === 'forgot' && (
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                    Reset your account password
                  </p>
                )}
              </div>

              {/* VIEW 1: LOGIN FORM */}
              {mode === 'login' && (
                <form onSubmit={handleLoginSubmit} className="space-y-4 pt-2">
                  <Field
                    label="Email Address"
                    required
                    error={!!loginErrors.email}
                    errorText={loginErrors.email}
                  >
                    <TextField
                      id="email"
                      type="text"
                      placeholder="prasathsw@srmtech.com"
                      value={email}
                      onChange={handleLoginEmailChange}
                      onBlur={handleLoginEmailBlur}
                      leftIcon={<Mail className="h-4 w-4 text-slate-400" />}
                      error={!!loginErrors.email}
                      disabled={isLoading}
                      autoComplete="username"
                      className="h-10 sm:h-11 rounded-lg bg-[#eef4f9] border-slate-200 text-xs sm:text-sm focus:bg-white focus-visible:ring-[#08698c]"
                    />
                  </Field>

                  <Field
                    label="Password"
                    required
                    error={!!loginErrors.password}
                    errorText={loginErrors.password}
                  >
                    <TextField
                      id="password"
                      placeholder="Enter your password (8-20 characters)"
                      maxLength={20}
                      value={password}
                      onChange={handleLoginPasswordChange}
                      onBlur={handleLoginPasswordBlur}
                      leftIcon={<Lock className="h-4 w-4 text-slate-400" />}
                      showPasswordToggle
                      error={!!loginErrors.password}
                      disabled={isLoading}
                      autoComplete="current-password"
                      className="h-10 sm:h-11 rounded-lg bg-[#eef4f9] border-slate-200 text-xs sm:text-sm focus:bg-white focus-visible:ring-[#08698c]"
                    />
                  </Field>

                  <div className="text-left pt-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        setForgotErrors({})
                        setForgotStep('verify')
                        setMode('forgot')
                      }}
                      className="text-xs text-[#08698c] font-semibold hover:underline cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-10 sm:h-11 bg-[#08698c] hover:bg-[#065470] active:bg-[#044057] text-white text-xs sm:text-sm font-bold rounded-lg shadow-sm hover:shadow transition-all mt-1 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        LOGGING IN...
                      </>
                    ) : (
                      <>
                        <span className="text-base font-normal">→</span> LOGIN
                      </>
                    )}
                  </button>

                  <div className="relative my-3.5 flex items-center justify-center">
                    <div className="w-full border-t border-slate-200" />
                    <span className="absolute bg-white px-3 text-[11px] font-bold text-slate-400 tracking-wider">
                      OR
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      clearPendingRegistration()
                      navigate('/create')
                    }}
                    style={{
                      fontSize: "12px"
                    }}
                    className="w-full flex items-center  justify-center gap-2 text-xs sm:text-sm font-bold text-[#08698c] hover:text-[#065470] transition-colors py-0.5 cursor-pointer tracking-wider "
                  >
                    <UserPlus className="h-4 w-4" />
                    Register  Yourself to get the User ID and Password
                  </button>
                </form>
              )}

              {/* VIEW 2: FORGOT PASSWORD */}
              {mode === 'forgot' && (
                <form
                  onSubmit={forgotStep === 'verify' ? handleVerifyForgotDetails : handleResetPassword}
                  className="space-y-3 pt-2"
                >
                  {forgotStep === 'verify' ? (
                    <>
                      <Field
                        label="Email Address"
                        required
                        error={!!forgotErrors.userId}
                        errorText={forgotErrors.userId}
                      >
                        <TextField
                          id="forgotUserId"
                          type="text"
                          placeholder="e.g. parent@example.com"
                          value={forgotUserId}
                          onChange={handleForgotUserIdChange}
                          onBlur={handleForgotUserIdBlur}
                          leftIcon={<Mail className="h-4 w-4 text-slate-400" />}
                          error={!!forgotErrors.userId}
                          disabled={isVerifyingForgotDetails}
                          autoComplete="username"
                          className="h-10 sm:h-11 rounded-lg bg-[#eef4f9] border-slate-200 text-xs sm:text-sm focus:bg-white focus-visible:ring-[#08698c]"
                        />
                      </Field>

                      <Field
                        label="Date of Birth (DD/MM/YYYY)"
                        required
                        error={!!forgotErrors.dob}
                        errorText={forgotErrors.dob}
                      >
                        <DobDateField
                          id="forgotDob"
                          value={forgotDob}
                          onChange={(val: string) => {
                            setForgotDob(val)
                            setForgotErrors((prev) => ({ ...prev, dob: undefined }))
                          }}
                          disabled={isVerifyingForgotDetails}
                          error={!!forgotErrors.dob}
                          max={new Date().toISOString().split('T')[0]}
                          className="h-10 sm:h-11 px-4 rounded-lg bg-[#eef4f9] border-slate-200 text-xs sm:text-sm focus:ring-[#08698c]"
                        />
                      </Field>

                      <button
                        type="submit"
                        disabled={isVerifyingForgotDetails}
                        className="w-full h-10 sm:h-11 bg-[#08698c] hover:bg-[#065470] active:bg-[#044057] text-white text-xs sm:text-sm font-bold rounded-lg shadow-sm hover:shadow transition-all mt-1 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
                      >
                        {isVerifyingForgotDetails ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            VERIFYING...
                          </>
                        ) : (
                          'VERIFY & NEXT'
                        )}
                      </button>
                    </>
                  ) : (
                    <>
                      <Field
                        label="New Password"
                        required
                        error={!!forgotErrors.newPassword}
                        errorText={forgotErrors.newPassword}
                      >
                        <TextField
                          id="newPassword"
                          placeholder="Enter new password (8-20 chars)"
                          maxLength={20}
                          value={newPassword}
                          onChange={handleForgotNewPasswordChange}
                          onBlur={handleForgotNewPasswordBlur}
                          leftIcon={<Lock className="h-4 w-4 text-slate-400" />}
                          showPasswordToggle
                          error={!!forgotErrors.newPassword}
                          disabled={isResettingPassword}
                          className="h-10 sm:h-11 rounded-lg bg-[#eef4f9] border-slate-200 text-xs sm:text-sm focus:bg-white focus-visible:ring-[#08698c]"
                        />
                      </Field>

                      <Field
                        label="Confirm Password"
                        required
                        error={!!forgotErrors.confirmPassword}
                        errorText={forgotErrors.confirmPassword}
                      >
                        <TextField
                          id="confirmPassword"
                          placeholder="Confirm new password"
                          maxLength={20}
                          value={confirmPassword}
                          onChange={handleForgotConfirmPasswordChange}
                          onBlur={handleForgotConfirmPasswordBlur}
                          leftIcon={<Lock className="h-4 w-4 text-slate-400" />}
                          showPasswordToggle
                          error={!!forgotErrors.confirmPassword}
                          disabled={isResettingPassword}
                          className="h-10 sm:h-11 rounded-lg bg-[#eef4f9] border-slate-200 text-xs sm:text-sm focus:bg-white focus-visible:ring-[#08698c]"
                        />
                      </Field>

                      <button
                        type="submit"
                        disabled={isResettingPassword}
                        className="w-full h-10 sm:h-11 bg-[#08698c] hover:bg-[#065470] active:bg-[#044057] text-white text-xs sm:text-sm font-bold rounded-lg shadow-sm hover:shadow transition-all mt-1 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
                      >
                        {isResettingPassword ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            SUBMITTING...
                          </>
                        ) : (
                          'SUBMIT'
                        )}
                      </button>
                      <div className="text-center pt-1">
                        <button
                          type="button"
                          disabled={isResettingPassword}
                          onClick={() => setForgotStep('verify')}
                          className="inline-flex items-center gap-1.5 text-xs text-[#08698c] font-semibold hover:underline cursor-pointer disabled:opacity-50"
                        >
                          <ArrowLeft className="h-3.5 w-3.5" /> Back
                        </button>
                      </div>
                    </>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login