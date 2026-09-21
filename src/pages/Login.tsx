import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Field, TextField } from "@/components/FormPrimitives"
import { Mail, Lock, Loader2, LogIn, UserPlus } from "lucide-react"
import { toast } from "@/components/ui/toast"
import { useAuthStore } from "@/store/useAuthStore"
import { validateLoginForm, type LoginFormErrors } from "@/utils/validation"
import logoImg from "@/assets/images/logo.png"

const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuthStore()

  // Login form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [loginErrors, setLoginErrors] = useState<LoginFormErrors>({})

  // Handle Login submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate using centralized validation utility
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

  return (
    <div className="min-h-screen w-full bg-[#f0f7ff] flex flex-col font-sans">
      {/* ================= MAIN CONTENT CONTAINER (CENTERED) ================= */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        {/* ================= LOGIN CARD ================= */}
        <div className="w-full max-w-xl bg-white rounded-xl shadow-lg border border-sky-100 p-6 sm:p-8">
          {/* School Crest Logo */}
          <div className="flex justify-center mb-3">
            <img
              src={logoImg}
              alt="School Crest Logo"
              className="w-28 h-28 object-contain drop-shadow-md"
            />
          </div>

          {/* ================= PAGE TITLE ================= */}
          <div className="w-full text-center pt-2 pb-4 px-4">
            <h1 className="text-lg sm:text-2xl font-bold text-slate-800 tracking-wide">
              PRE-KG (2025-26) ONLINE REGISTRATION
            </h1>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* Email Address Field */}
            <Field label="Email Address" required error={!!loginErrors.email} errorText={loginErrors.email}>
              <TextField
                id="email"
                type="email"
                placeholder="e.g. user@gmail.com or admin@gmail.com"
                value={email}
                onChange={(val) => {
                  setEmail(val)
                  setLoginErrors(prev => ({ ...prev, email: undefined }))
                }}
                leftIcon={<Mail className="h-4 w-4 text-sky-600" />}
                error={!!loginErrors.email}
                disabled={isLoading}
                autoComplete="email"
                className="h-11 border-slate-300 focus:ring-sky-500"
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
                leftIcon={<Lock className="h-4 w-4 text-sky-600" />}
                showPasswordToggle
                error={!!loginErrors.password}
                disabled={isLoading}
                autoComplete="current-password"
                className="h-11 border-slate-300 focus:ring-sky-500"
              />
            </Field>

            {/* Forgot Password Link */}
            <div className="text-left pt-0.5">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  toast.info("Please contact IT support to reset your password.")
                }}
                className="text-xs text-[#0088b6] font-semibold hover:underline"
              >
                Forgot Password?
              </a>
            </div>

            {/* Quick Test Credentials Helper Box */}
            <div className="p-3 rounded-lg bg-sky-50/70 border border-sky-200/80 text-xs space-y-1.5">
              <p className="font-bold text-slate-700 text-center">Test Credentials (Click to fill):</p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEmail('user@gmail.com')
                    setPassword('123')
                    setLoginErrors({})
                  }}
                  className="px-2.5 py-1 bg-white hover:bg-sky-100 border border-sky-300 rounded font-semibold text-sky-800 shadow-2xs transition-colors cursor-pointer"
                >
                  User: <span className="font-mono text-blue-700">user@gmail.com</span> / <span className="font-mono text-blue-700">123</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('admin@gmail.com')
                    setPassword('123')
                    setLoginErrors({})
                  }}
                  className="px-2.5 py-1 bg-white hover:bg-sky-100 border border-sky-300 rounded font-semibold text-purple-800 shadow-2xs transition-colors cursor-pointer"
                >
                  Admin: <span className="font-mono text-purple-700">admin@gmail.com</span> / <span className="font-mono text-purple-700">123</span>
                </button>
              </div>
            </div>

            {/* LOGIN Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 btn-app-gradient text-white text-sm font-bold rounded-lg shadow-sm transition-all mt-2 flex items-center justify-center gap-2 cursor-pointer"
              style={{ background: "var(--app-gradient)" }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  LOGGING IN...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  LOGIN
                </>
              )}
            </Button>

            {/* OR Divider */}
            <div className="relative my-4 flex items-center justify-center">
              <div className="w-full border-t border-slate-200" />
              <span className="absolute bg-white px-3 text-xs font-semibold text-slate-400">
                OR
              </span>
            </div>

            {/* CREATE NEW ACCOUNT Button (Navigates to /create) */}
            <Button
              type="button"
              onClick={() => navigate('/create')}
              className="w-full h-11 bg-white hover:bg-sky-50 border-2 border-[#0a6f9c] text-[#0a6f9c] text-sm font-bold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <UserPlus className="h-4 w-4" />
              CREATE NEW ACCOUNT
            </Button>
          </form>

          {/* ================= AGE ELIGIBILITY FOOTER ================= */}
          <div className="text-center text-slate-700 pt-5 pb-2 px-4 space-y-0.5">
            <p className="text-[13px] font-semibold">
              Age eligibility minimum 3 years as on 1st June 2025
            </p>
            <p className="text-[12px]">
              (i.e., Children born between 01/06/2021 and 31/05/2022 – both days inclusive) ONLY are eligible for registration.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login