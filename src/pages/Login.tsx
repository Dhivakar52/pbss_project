import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, Loader2, UserPlus, CalendarDays, KeyRound, ArrowLeft } from "lucide-react"
import { toast } from "@/components/ui/toast"
import { useAuthStore } from "@/store/useAuthStore"
import { validateLoginForm, type LoginFormErrors } from "@/utils/validation"
import { Field, TextField } from "@/components/FormPrimitives"
import logoImg from "@/assets/images/logo.png"

type ViewMode = 'login' | 'forgot_step1' | 'forgot_step2'

interface ForgotErrors {
  email?: string
  otp?: string
  newPassword?: string
  confirmPassword?: string
}

const Login: React.FC = () => {
  const navigate = useNavigate()
  const { login } = useAuthStore()

  // View state: 'login' | 'forgot_step1' | 'forgot_step2'
  const [mode, setMode] = useState<ViewMode>('login')

  // Login form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [loginErrors, setLoginErrors] = useState<LoginFormErrors>({})

  // Forgot Password state
  const [forgotEmail, setForgotEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [forgotErrors, setForgotErrors] = useState<ForgotErrors>({})
  const [isSendingOtp, setIsSendingOtp] = useState(false)
  const [isResettingPassword, setIsResettingPassword] = useState(false)

  // Handle Login submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const errors = validateLoginForm({ email, password })
    setLoginErrors(errors)

    if (Object.keys(errors).length > 0) {
      toast.error('Please correct the errors in the login form.')
      return
    }

    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))

    const result = login(email, password)

    if (result.success && result.user) {
      if (result.user.role === 'admin') {
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

    setIsLoading(false)
  }

  // Handle Step 1 — Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    const errors: ForgotErrors = {}

    const trimmedEmail = forgotEmail.trim()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!trimmedEmail) {
      errors.email = 'Email Address is required'
    } else if (!emailRegex.test(trimmedEmail)) {
      errors.email = 'Please enter a valid email address'
    }

    setForgotErrors(errors)
    if (Object.keys(errors).length > 0) return

    setIsSendingOtp(true)
    await new Promise(resolve => setTimeout(resolve, 600))
    setIsSendingOtp(false)

    toast.success('OTP sent successfully to your email address!')
    setMode('forgot_step2')
  }

  // Handle Step 2 — Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    const errors: ForgotErrors = {}

    if (!otp.trim()) {
      errors.otp = 'OTP is required'
    }

    if (!newPassword) {
      errors.newPassword = 'New Password is required'
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Confirm New Password is required'
    } else if (newPassword && confirmPassword !== newPassword) {
      errors.confirmPassword = 'Confirm New Password must match New Password'
    }

    setForgotErrors(errors)
    if (Object.keys(errors).length > 0) return

    setIsResettingPassword(true)
    await new Promise(resolve => setTimeout(resolve, 600))
    setIsResettingPassword(false)

    toast.success('Password reset successfully! You can now log in with your new password.')

    // Reset forgot password state & return to login
    setForgotEmail('')
    setOtp('')
    setNewPassword('')
    setConfirmPassword('')
    setForgotErrors({})
    setMode('login')
  }

  return (
    <div className="min-h-screen w-full bg-[#f5f5f5] flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
      {/* ================= LOGIN CARD CONTAINER ================= */}
      <div className="w-full max-w-[440px] bg-white rounded-2xl shadow-xl border border-sky-100/70 overflow-hidden flex flex-col my-auto">

        {/* Upper Card Padding */}
        <div className="p-6 sm:p-8 space-y-4">

          {/* School Crest Logo */}
          <div className="flex justify-center mb-1">
            <img
              src={logoImg}
              alt="School Crest Logo"
              className="w-24 h-24 sm:w-28 sm:h-28 object-contain drop-shadow-sm"
            />
          </div>

          {/* Page Title */}
          <div className="text-center pb-1">
            <h1 className="text-lg sm:text-xl font-extrabold text-[#0e364f] tracking-wide uppercase">
              {mode === 'login' ? 'PRE-KG (2025–26) ONLINE REGISTRATION' : 'FORGOT PASSWORD'}
            </h1>
            {mode !== 'login' && (
              <p className="text-xs text-slate-500 font-medium mt-1">
                {mode === 'forgot_step1' ? 'Step 1 of 2: Verify Email' : 'Step 2 of 2: Reset Password'}
              </p>
            )}
          </div>

          {/* ================= VIEW 1: LOGIN FORM ================= */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Email Address Field */}
              <Field label="Email Address" required error={!!loginErrors.email} errorText={loginErrors.email}>
                <TextField
                  id="email"
                  type="email"
                  placeholder="e.g. user@gmail.com"
                  value={email}
                  onChange={(val) => {
                    setEmail(val)
                    setLoginErrors(prev => ({ ...prev, email: undefined }))
                  }}
                  leftIcon={<Mail className="h-4 w-4 text-slate-400" />}
                  error={!!loginErrors.email}
                  disabled={isLoading}
                  autoComplete="email"
                  className="h-11 rounded-full bg-[#f1f6fa] border-slate-200/90 text-xs sm:text-sm focus-visible:ring-[#24758d]"
                />
              </Field>

              {/* Password Field */}
              <Field label="Password" required error={!!loginErrors.password} errorText={loginErrors.password}>
                <TextField
                  id="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(val) => {
                    setPassword(val)
                    setLoginErrors(prev => ({ ...prev, password: undefined }))
                  }}
                  leftIcon={<Lock className="h-4 w-4 text-slate-400" />}
                  showPasswordToggle
                  error={!!loginErrors.password}
                  disabled={isLoading}
                  autoComplete="current-password"
                  className="h-11 rounded-full bg-[#f1f6fa] border-slate-200/90 text-xs sm:text-sm focus-visible:ring-[#24758d]"
                />
              </Field>

              {/* Forgot Password Link */}
              <div className="text-left pt-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setForgotErrors({})
                    setMode('forgot_step1')
                  }}
                  className="text-xs text-[#24758d] font-semibold hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>

              {/* LOGIN Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 sm:h-12 btn-app-gradient text-white text-xs sm:text-sm font-bold rounded-full shadow-md transition-all mt-2 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
                style={{ background: "var(--app-gradient)" }}
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

              {/* OR Divider */}
              <div className="relative my-4 flex items-center justify-center">
                <div className="w-full border-t border-slate-200" />
                <span className="absolute bg-white px-3 text-[11px] font-bold text-slate-400 tracking-wider">
                  OR
                </span>
              </div>

              {/* CREATE NEW ACCOUNT Button */}
              <button
                type="button"
                onClick={() => navigate('/create')}
                className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-[#24758d] hover:text-[#185263] transition-colors py-1 cursor-pointer tracking-wider"
              >
                <UserPlus className="h-4 w-4" />
                CREATE NEW ACCOUNT
              </button>
            </form>
          )}

          {/* ================= VIEW 2: FORGOT PASSWORD - STEP 1 (VERIFY EMAIL) ================= */}
          {mode === 'forgot_step1' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <Field label="Email Address" required error={!!forgotErrors.email} errorText={forgotErrors.email}>
                <TextField
                  id="forgotEmail"
                  type="email"
                  placeholder="Enter your email address"
                  value={forgotEmail}
                  onChange={(val) => {
                    setForgotEmail(val)
                    setForgotErrors(prev => ({ ...prev, email: undefined }))
                  }}
                  leftIcon={<Mail className="h-4 w-4 text-slate-400" />}
                  error={!!forgotErrors.email}
                  disabled={isSendingOtp}
                  autoComplete="email"
                  className="h-11 rounded-full bg-[#f1f6fa] border-slate-200/90 text-xs sm:text-sm focus-visible:ring-[#24758d]"
                />
              </Field>

              <button
                type="submit"
                disabled={isSendingOtp}
                className="w-full h-11 sm:h-12 btn-app-gradient text-white text-xs sm:text-sm font-bold rounded-full shadow-md transition-all mt-2 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
                style={{ background: "var(--app-gradient)" }}
              >
                {isSendingOtp ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    SENDING OTP...
                  </>
                ) : (
                  'SEND OTP'
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="inline-flex items-center gap-1.5 text-xs text-[#24758d] font-semibold hover:underline cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to Login
                </button>
              </div>
            </form>
          )}

          {/* ================= VIEW 3: FORGOT PASSWORD - STEP 2 (RESET PASSWORD) ================= */}
          {mode === 'forgot_step2' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="p-3 rounded-2xl bg-[#e6f4f8] border border-cyan-200/80 text-xs text-[#1a5568] flex items-center justify-between">
                <span>OTP sent to: <strong>{forgotEmail}</strong></span>
                <button
                  type="button"
                  onClick={() => setMode('forgot_step1')}
                  className="text-[11px] text-[#24758d] font-bold hover:underline cursor-pointer ml-2"
                >
                  Change
                </button>
              </div>

              {/* OTP Field */}
              <Field label="OTP" required error={!!forgotErrors.otp} errorText={forgotErrors.otp}>
                <TextField
                  id="otp"
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(val) => {
                    setOtp(val)
                    setForgotErrors(prev => ({ ...prev, otp: undefined }))
                  }}
                  leftIcon={<KeyRound className="h-4 w-4 text-slate-400" />}
                  error={!!forgotErrors.otp}
                  disabled={isResettingPassword}
                  className="h-11 rounded-full bg-[#f1f6fa] border-slate-200/90 text-xs sm:text-sm focus-visible:ring-[#24758d]"
                />
              </Field>

              {/* New Password Field */}
              <Field label="New Password" required error={!!forgotErrors.newPassword} errorText={forgotErrors.newPassword}>
                <TextField
                  id="newPassword"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(val) => {
                    setNewPassword(val)
                    setForgotErrors(prev => ({ ...prev, newPassword: undefined }))
                  }}
                  leftIcon={<Lock className="h-4 w-4 text-slate-400" />}
                  showPasswordToggle
                  error={!!forgotErrors.newPassword}
                  disabled={isResettingPassword}
                  className="h-11 rounded-full bg-[#f1f6fa] border-slate-200/90 text-xs sm:text-sm focus-visible:ring-[#24758d]"
                />
              </Field>

              {/* Confirm New Password Field */}
              <Field label="Confirm New Password" required error={!!forgotErrors.confirmPassword} errorText={forgotErrors.confirmPassword}>
                <TextField
                  id="confirmPassword"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(val) => {
                    setConfirmPassword(val)
                    setForgotErrors(prev => ({ ...prev, confirmPassword: undefined }))
                  }}
                  leftIcon={<Lock className="h-4 w-4 text-slate-400" />}
                  showPasswordToggle
                  error={!!forgotErrors.confirmPassword}
                  disabled={isResettingPassword}
                  className="h-11 rounded-full bg-[#f1f6fa] border-slate-200/90 text-xs sm:text-sm focus-visible:ring-[#24758d]"
                />
              </Field>

              {/* Reset Password Button */}
              <button
                type="submit"
                disabled={isResettingPassword}
                className="w-full h-11 sm:h-12 btn-app-gradient text-white text-xs sm:text-sm font-bold rounded-full shadow-md transition-all mt-2 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
                style={{ background: "var(--app-gradient)" }}
              >
                {isResettingPassword ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    RESETTING PASSWORD...
                  </>
                ) : (
                  'RESET PASSWORD'
                )}
              </button>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => setMode('forgot_step1')}
                  className="text-[#24758d] font-semibold hover:underline cursor-pointer"
                >
                  Step 1: Resend OTP
                </button>

                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="inline-flex items-center gap-1 text-[#24758d] font-semibold hover:underline cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to Login
                </button>
              </div>
            </form>
          )}

        </div>

        {/* ================= AGE ELIGIBILITY FOOTER ================= */}
        <div className="p-4 sm:p-5 bg-[#eaf5f9] border-t border-cyan-100/90 text-slate-700 space-y-2 text-center">
          <p className="text-xs sm:text-sm font-bold text-[#1b586d]">
            Age eligibility minimum 3 years as on 1st June 2025
          </p>
          <div className="flex items-start justify-center gap-2 text-[11px] sm:text-xs text-slate-600 leading-snug font-medium text-left">
            <CalendarDays className="h-5 w-5 text-[#24758d] shrink-0 mt-0.5" />
            <span>
              (i.e., Children born between 01/06/2021 and 31/05/2022 – both days inclusive) ONLY are eligible for registration.
            </span>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Login