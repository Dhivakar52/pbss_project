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

  // If no registration is pending, allow user to test or return to /create
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

    // Handle single character or pasted multiple digits
    if (cleaned.length === 1) {
      const nextDigits = [...digits]
      nextDigits[index] = cleaned
      setDigits(nextDigits)
      // Auto-advance to next input
      if (index < 3) {
        inputRefs[index + 1].current?.focus()
      }
    } else if (cleaned.length >= 4) {
      // Pasted full OTP
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

    // Brief simulation for realistic feel
    await new Promise(r => setTimeout(r, 600))

    const result = verifyRegistrationOtp(fullOtp)

    if (result.success) {
      setIsSuccess(true)
      toast.success('Account created successfully! Redirecting to login...')
      setTimeout(() => {
        navigate('/')
      }, 1500)
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
    <div className="min-h-screen w-full bg-[#f0f7ff] flex flex-col font-sans">
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-sky-100 p-6 sm:p-8 space-y-6">

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
              Default Static OTP: <span className="font-bold font-mono tracking-widest text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded">{STATIC_OTP}</span>
            </p>
          </div>

          {isSuccess ? (
            <div className="py-6 text-center space-y-3">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h2 className="text-base font-bold text-emerald-800">
                Account Verified Successfully!
              </h2>
              <p className="text-xs text-slate-500">
                Redirecting you to the login page now...
              </p>
            </div>
          ) : (
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
                  className="inline-flex items-center gap-1 font-semibold text-slate-500 hover:text-slate-700 transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to Register
                </button>

                <button
                  type="button"
                  onClick={handleResend}
                  className="inline-flex items-center gap-1 font-bold text-[#0088b6] hover:underline"
                >
                  <RotateCw className="h-3.5 w-3.5" /> Resend OTP
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  )
}

export default VerifyOtp
