import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { TextField } from "@/components/FormPrimitives"
import { Loader2, ArrowLeft, User, Mail, Lock, CheckCircle } from "lucide-react"
import { toast } from "@/components/ui/toast"
import { useAuthStore } from "@/store/useAuthStore"
import { validateRegisterForm, type RegisterFormErrors } from "@/utils/validation"
import { STATIC_OTP } from "@/services/auth.service"

const CreateAccount: React.FC = () => {
  const navigate = useNavigate()
  const { startRegistration, isEmailRegistered } = useAuthStore()

  // Form states - Strictly the 4 required fields
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [regErrors, setRegErrors] = useState<RegisterFormErrors>({})
  const [isLoading, setIsLoading] = useState(false)

  // Handle Create Account submission
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate using centralized validation utility (checks required, email format, email uniqueness, password match)
    const errors = validateRegisterForm(
      { fullName, email, password, confirmPassword },
      isEmailRegistered
    )

    setRegErrors(errors)
    if (Object.keys(errors).length > 0) {
      toast.error('Please fix the validation errors before proceeding.')
      return
    }

    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 400))

    // Store pending registration and advance to OTP verification
    startRegistration({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      password,
    })

    toast.info(`Verification code sent to ${email}. Default OTP: ${STATIC_OTP}`)
    setIsLoading(false)
    navigate('/verify-otp')
  }

  // Clear Register form
  const handleClearRegister = () => {
    setFullName('')
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setRegErrors({})
  }

  return (
    <div className="min-h-screen w-full bg-[#f0f7ff] flex flex-col justify-between font-sans">
      <div>
        {/* ================= MAIN CONTENT CONTAINER ================= */}
        <div className="w-full flex justify-center px-4 mt-7 pb-10">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-sky-100 p-6 sm:p-8">

            {/* Top back navigation */}
            <div className="mb-4">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="inline-flex items-center text-xs font-semibold text-[#0088b6] hover:underline gap-1 cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Login
              </button>
            </div>

            {/* Title Header */}
            <div className="text-center mb-6">
              <h1 className="text-xl sm:text-2xl font-bold text-[#0284c7] tracking-tight">
                Create Your Account
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Enter your details below to register for Pre-KG Online Admission
              </p>
            </div>

            {/* Registration Form with 4 Required Fields */}
            <form onSubmit={handleRegisterSubmit} className="space-y-4">

              {/* 1. Full Name */}
              <div className="space-y-1">
                <label htmlFor="fullName" className="text-xs sm:text-sm font-semibold text-slate-700 block">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <TextField
                  id="fullName"
                  placeholder="e.g. John Doe"
                  value={fullName}
                  onChange={(val) => {
                    setFullName(val)
                    setRegErrors(prev => ({ ...prev, fullName: undefined }))
                  }}
                  leftIcon={<User className="h-4 w-4 text-sky-600" />}
                  error={!!regErrors.fullName}
                  className="h-11 border-slate-300 focus:ring-sky-500"
                />
                {regErrors.fullName && (
                  <p className="text-xs text-red-500 mt-0.5">{regErrors.fullName}</p>
                )}
              </div>

              {/* 2. Email Address */}
              <div className="space-y-1">
                <label htmlFor="regEmail" className="text-xs sm:text-sm font-semibold text-slate-700 block">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <TextField
                  id="regEmail"
                  type="email"
                  placeholder="e.g. parent@example.com"
                  value={email}
                  onChange={(val) => {
                    setEmail(val)
                    setRegErrors(prev => ({ ...prev, email: undefined }))
                  }}
                  leftIcon={<Mail className="h-4 w-4 text-sky-600" />}
                  error={!!regErrors.email}
                  className="h-11 border-slate-300 focus:ring-sky-500"
                />
                {regErrors.email && (
                  <p className="text-xs text-red-500 mt-0.5">{regErrors.email}</p>
                )}
              </div>

              {/* 3. Password */}
              <div className="space-y-1">
                <label htmlFor="regPassword" className="text-xs sm:text-sm font-semibold text-slate-700 block">
                  Password <span className="text-red-500">*</span>
                </label>
                <TextField
                  id="regPassword"
                  placeholder="Enter your password"
                  showPasswordToggle
                  value={password}
                  onChange={(val) => {
                    setPassword(val)
                    setRegErrors(prev => ({ ...prev, password: undefined }))
                  }}
                  leftIcon={<Lock className="h-4 w-4 text-sky-600" />}
                  error={!!regErrors.password}
                  className="h-11 border-slate-300 focus:ring-sky-500"
                />
                {regErrors.password && (
                  <p className="text-xs text-red-500 mt-0.5">{regErrors.password}</p>
                )}
              </div>

              {/* 4. Confirm Password */}
              <div className="space-y-1">
                <label htmlFor="regConfirmPassword" className="text-xs sm:text-sm font-semibold text-slate-700 block">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <TextField
                  id="regConfirmPassword"
                  placeholder="Re-enter your password"
                  showPasswordToggle
                  value={confirmPassword}
                  onChange={(val) => {
                    setConfirmPassword(val)
                    setRegErrors(prev => ({ ...prev, confirmPassword: undefined }))
                  }}
                  leftIcon={<Lock className="h-4 w-4 text-sky-600" />}
                  error={!!regErrors.confirmPassword}
                  className="h-11 border-slate-300 focus:ring-sky-500"
                />
                {regErrors.confirmPassword && (
                  <p className="text-xs text-red-500 mt-0.5">{regErrors.confirmPassword}</p>
                )}
              </div>

              {/* Information Note */}
              <div className="p-3 rounded-lg bg-sky-50 border border-sky-100 flex items-start gap-2 text-xs text-sky-900 mt-2">
                <CheckCircle className="h-4 w-4 text-sky-600 shrink-0 mt-0.5" />
                <p>
                  After clicking submit, a 4-digit verification code (OTP) will be required to activate your account.
                </p>
              </div>

              {/* Action Buttons: SUBMIT and CLEAR */}
              <div className="flex justify-center gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 h-11 text-white font-bold text-sm rounded-lg shadow-md border border-sky-600 btn-app-gradient cursor-pointer"
                  style={{ background: "var(--app-gradient)" }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                      PROCESSING...
                    </>
                  ) : (
                    'SUBMIT & VERIFY'
                  )}
                </Button>

                <Button
                  type="button"
                  onClick={handleClearRegister}
                  className="px-6 h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-lg border border-slate-200 cursor-pointer"
                >
                  CLEAR
                </Button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateAccount
