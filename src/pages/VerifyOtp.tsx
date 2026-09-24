import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { ShieldCheck, ArrowLeft, RotateCw, Loader2, CheckCircle2 } from "lucide-react"
import { toast } from "@/components/ui/toast"
import { useAuthStore } from "@/store/useAuthStore"
import { STATIC_OTP } from "@/services/auth.service"
import logoImg from "@/assets/images/logo.png"

export const VerifyOtp: React.FC = () => {
  const navigate = useNavigate()
  const { pendingRegistration, verifyRegistrationOtp, clearPendingRegistration } = useAuthStore()

  // 4 individual digit boxes
  const [digits, setDigits] = useState<string[]>(['', '', '', ''])
  const [error, setError] = useState<string>('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ]

  // Focus the first input on mount
  useEffect(() => {
    inputRefs[0].current?.focus()
  }, [])

  const targetEmail = pendingRegistration?.email || 'your email'

  const handleDigitChange = (index: number, value: string) => {
    setError('')
    const cleaned = value.replace(/\D/g, '')

    if (cleaned.length === 0) {
      const nextDigits = [...digits]
      nextDigits[index] = ''
      setDigits(nextDigits)
      return
    }

    if (cleaned.length === 1) {
      const nextDigits = [...digits]
      nextDigits[index] = cleaned
      setDigits(nextDigits)
      if (index < 3) {
        inputRefs[index + 1].current?.focus()
      }
    } else if (cleaned.length >= 4) {
      const pastedDigits = cleaned.slice(0, 4).split('')
      setDigits(pastedDigits)
      inputRefs[3].current?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs[index - 1].current?.focus()
    }
  }

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const fullOtp = digits.join('')

    if (fullOtp.length < 4) {
      setError('Please enter the complete 4-digit OTP.')
      return
    }

    setIsVerifying(true)
    setError('')

    await new Promise(r => setTimeout(r, 600))

    const result = verifyRegistrationOtp(fullOtp)

    if (result.success) {
      setIsSuccess(true)
      toast.success('Account Created Successfully!')
    } else {
      setError(result.error || `Invalid OTP. Please enter ${STATIC_OTP}`)
      toast.error(result.error || `Invalid OTP. Enter ${STATIC_OTP}`)
      setIsVerifying(false)
    }
  }

  const handleResend = () => {
    setDigits(['', '', '', ''])
    setError('')
    inputRefs[0].current?.focus()
    toast.info(`Verification code sent! Use OTP: ${STATIC_OTP}`)
  }

  return (
    <div className="min-h-screen w-full bg-[#f5f5f5] flex flex-col font-sans">
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-sky-100 p-6 sm:p-8 space-y-6">

          {isSuccess ? (
            /* ================= SUCCESS CONFIRMATION CARD ================= */
            <div className="py-2 text-center space-y-5">
              {/* School Crest Logo */}
              <div className="flex justify-center mb-1">
                <img
                  src={logoImg}
                  alt="School Crest Logo"
                  className="w-20 h-20 sm:w-24 sm:h-24 object-contain drop-shadow-sm"
                />
              </div>

              {/* Green Success Icon */}
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </div>

              {/* Heading */}
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
                Account Created Successfully!
              </h2>

              {/* Exact Message Text */}
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium px-1">
                Thank you for successfully creating an account and registering for the{' '}
                <span className="font-bold text-slate-800">PRE-KG (2025-26) ONLINE REGISTRATION.</span>
              </p>

              {/* Go to Login Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    clearPendingRegistration()
                    navigate('/')
                  }}
                  className="w-full h-11 sm:h-12 btn-app-gradient text-white text-sm font-bold rounded-full shadow-md transition-all cursor-pointer uppercase tracking-wider"
                  style={{ background: "var(--app-gradient)" }}
                >
                  Go to Login
                </button>
              </div>
            </div>
          ) : (
            /* ================= OTP VERIFICATION FORM ================= */
            <>
              {/* Logo & Header */}
              <div className="text-center space-y-3">
                <div className="flex justify-center">
                  <img
                    src={logoImg}
                    alt="School Crest Logo"
                    className="w-20 h-20 object-contain drop-shadow-sm"
                  />
                </div>

                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-semibold border border-sky-200">
                    <ShieldCheck className="h-3.5 w-3.5" /> OTP Verification
                  </div>
                  <h1 className="text-xl font-bold text-slate-800 tracking-tight">
                    Verify Your Account
                  </h1>
                  <p className="text-xs text-slate-500 leading-relaxed px-2">
                    We've sent a 4-digit verification code to{' '}
                    <span className="font-semibold text-slate-800 block truncate">{targetEmail}</span>
                  </p>
                </div>
              </div>

              {/* Demo helper badge */}
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-center">
                <p className="text-xs text-amber-800 font-medium">
                  Default Static OTP:{' '}
                  <span className="font-bold font-mono tracking-widest text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded">
                    {STATIC_OTP}
                  </span>
                </p>
              </div>

              <form onSubmit={handleVerify} className="space-y-5">
                {/* 4 Digit OTP Input Boxes */}
                <div className="flex justify-center gap-3">
                  {digits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={inputRefs[idx]}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      disabled={isVerifying}
                      className={`w-14 h-14 text-center text-2xl font-bold rounded-xl border-2 transition-all outline-none ${
                        error
                          ? 'border-red-400 bg-red-50/50 text-red-600 focus:border-red-500'
                          : digit
                          ? 'border-[#0284c7] bg-sky-50/50 text-slate-900'
                          : 'border-slate-300 bg-slate-50/50 text-slate-900 focus:border-[#0284c7] focus:bg-white'
                      }`}
                    />
                  ))}
                </div>

                {/* Error Display */}
                {error && (
                  <div className="text-center">
                    <p className="text-xs font-semibold text-red-500">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isVerifying || digits.join('').length < 4}
                  className="w-full h-11 btn-app-gradient text-white text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  style={{ background: "var(--app-gradient)" }}
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      VERIFYING OTP...
                    </>
                  ) : (
                    'VERIFY & CREATE ACCOUNT'
                  )}
                </Button>

                {/* Resend & Back actions */}
                <div className="flex items-center justify-between text-xs pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      clearPendingRegistration()
                      navigate('/create')
                    }}
                    className="inline-flex items-center gap-1 font-semibold text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Back to Register
                  </button>

                  <button
                    type="button"
                    onClick={handleResend}
                    className="inline-flex items-center gap-1 font-bold text-[#0088b6] hover:underline cursor-pointer"
                  >
                    <RotateCw className="h-3.5 w-3.5" /> Resend OTP
                  </button>
                </div>
              </form>
            </>
          )}

        </div>
      </div>
    </div>
  )
}

export default VerifyOtp
