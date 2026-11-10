import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, ArrowLeft, RotateCw, Loader2, Check } from 'lucide-react'
import { toast } from '@/components/ui/toast'
import { useAuthStore } from '@/store/useAuthStore'
import { STATIC_OTP } from '@/services/auth.service'
import logoImg from '@/assets/images/logo.png'
import { EmailPreviewModal } from '@/components/EmailPreviewModal'
import { OtpEmailPreviewModal } from '@/components/OtpEmailPreviewModal'

export const VerifyOtp: React.FC = () => {
  const navigate = useNavigate()
  const { pendingRegistration, verifyRegistrationOtp, clearPendingRegistration } = useAuthStore()

  // Dynamic OTP state (defaults to STATIC_OTP = "1111", regenerates on Resend)
  const [currentOtp, setCurrentOtp] = useState<string>(STATIC_OTP)
  const [verifiedEmail] = useState(pendingRegistration?.email || '')
  const [isOtpEmailModalOpen, setIsOtpEmailModalOpen] = useState(false)
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false)

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

  const targetEmail = pendingRegistration?.email || verifiedEmail

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

    await new Promise((r) => setTimeout(r, 400))

    if (fullOtp === currentOtp || fullOtp === STATIC_OTP || fullOtp === '1111') {
      const result = await verifyRegistrationOtp(fullOtp, currentOtp)

      if (result.success) {
        setIsSuccess(true)
        toast.success('Account Created Successfully!')
      } else {
        setError(result.error || `Invalid OTP. Please enter ${currentOtp}`)
        toast.error(result.error || `Invalid OTP. Enter ${currentOtp}`)
        setIsVerifying(false)
      }
    } else {
      setError(`Invalid OTP. Please enter ${currentOtp}`)
      toast.error(`Invalid OTP. Enter ${currentOtp}`)
      setIsVerifying(false)
    }
  }

  const handleResend = () => {
    const newOtp = Math.floor(1000 + Math.random() * 9000).toString()
    setCurrentOtp(newOtp)
    setDigits(['', '', '', ''])
    setError('')
    inputRefs[0].current?.focus()
    toast.info(`Verification code sent! Use OTP: ${newOtp}`)
  }

  return (
    <div className="min-h-screen w-full bg-[#f5f5f5] flex flex-col font-sans">
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-[460px] bg-white rounded-2xl shadow-xl border border-sky-100 p-6 sm:p-8 space-y-5 relative">
          {isSuccess ? (
            /* ================= SUCCESS CONFIRMATION CARD (Image 3) ================= */
            <div className="py-2 text-center space-y-5">
              {/* School Crest Logo */}
              <div className="flex justify-center mb-1">
                <img
                  src={logoImg}
                  alt="School Crest Logo"
                  className="w-20 h-20 sm:w-22 sm:h-22 object-contain drop-shadow-sm"
                />
              </div>

              {/* Green Success Icon */}
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
                <Check className="h-7 w-7 text-emerald-600 stroke-[3]" />
              </div>

              {/* Heading */}
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
                Account Created Successfully!
              </h2>

              {/* Exact Message Text */}
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium px-1">
                Thank you for successfully creating an account and registering for the{' '}
                <strong className="text-slate-900 block mt-1">
                  PRE-KG (2027-28) ONLINE REGISTRATION.
                </strong>
              </p>

              {/* Email Icon / Preview Button */}
              {/* <div className="flex justify-center pt-1">
                <button
                  type="button"
                  onClick={() => setIsEmailModalOpen(true)}
                  title="Preview Confirmation Email"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-50 hover:bg-sky-100 text-[#0284c7] border border-sky-200 text-xs font-bold transition-colors cursor-pointer"
                >
                  <Mail className="h-3.5 w-3.5" />
                  <span>Preview Confirmation Email</span>
                </button>
              </div> */}

              {/* Go to Login Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    clearPendingRegistration()
                    navigate('/')
                  }}
                  className="w-full h-11 bg-gradient-to-r from-[#006699] to-[#0088cc] hover:opacity-95 text-white font-extrabold text-sm rounded-lg shadow-sm transition-all cursor-pointer uppercase tracking-wider"
                >
                  GO TO LOGIN
                </button>
              </div>
            </div>
          ) : (
            /* ================= OTP VERIFICATION FORM (Image 2) ================= */
            <>
              {/* Top Right Mail Icon Button */}
              <div className="absolute right-6 top-6">
                {/* <button
                  type="button"
                  onClick={() => setIsOtpEmailModalOpen(true)}
                  title="Preview OTP Verification Email"
                  className="p-2.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-[#0284c7] border border-sky-200 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                >
                  <Mail className="h-4 w-4" />
                </button> */}
              </div>

              {/* Logo & Header */}
              <div className="text-center space-y-2">
                <div className="flex justify-center mb-1">
                  <img
                    src={logoImg}
                    alt="School Crest Logo"
                    className="w-20 h-20 sm:w-22 sm:h-22 object-contain drop-shadow-sm"
                  />
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-[#0284c7] text-xs font-bold border border-sky-200">
                  <ShieldCheck className="h-3.5 w-3.5" /> OTP Verification
                </div>

                <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight pt-1">
                  Verify Your Account
                </h1>

                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  We've sent a 4-digit verification code to{' '}
                  <span className="font-bold text-slate-900 block mt-0.5">{targetEmail}</span>
                </p>

                {/* Preview OTP Email Button */}
                {/* <div className="pt-1 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setIsOtpEmailModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-[#0284c7] border border-sky-200 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    <span>Preview OTP Email</span>
                  </button>
                </div> */}
              </div>

              {/* Current Verification OTP Highlight Box */}
              <div className="p-3 rounded-xl bg-[#fffbeb] border border-[#fef3c7] text-center my-2">
                <p className="text-xs text-amber-900 font-bold">
                  Current Verification OTP:{' '}
                  <span className="font-mono text-sm font-extrabold tracking-widest text-amber-950 bg-[#fef3c7] px-2 py-0.5 rounded ml-1">
                    {currentOtp}
                  </span>
                </p>
              </div>

              <form onSubmit={handleVerify} className="space-y-4">
                {/* 4 Digit OTP Input Boxes */}
                <div className="flex justify-center gap-3 my-2">
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
                      className={`w-14 h-14 text-center text-2xl font-bold font-mono rounded-xl border-2 transition-all outline-none ${error
                        ? 'border-red-400 bg-red-50/50 text-red-600 focus:border-red-500'
                        : digit
                          ? 'border-[#0284c7] bg-sky-50/50 text-slate-900'
                          : 'border-slate-300 bg-white text-slate-900 focus:border-[#0284c7] focus:bg-white'
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
                <button
                  type="submit"
                  disabled={isVerifying || digits.join('').length < 4}
                  className="w-full h-11 sm:h-12 bg-gradient-to-r from-[#006699] to-[#0088cc] hover:opacity-95 text-white font-extrabold text-xs sm:text-sm rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer disabled:opacity-50"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      CREATING...
                    </>
                  ) : (
                    'CREATE ACCOUNT'
                  )}
                </button>

                {/* Resend & Back actions */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      navigate('/create')
                    }}
                    className="inline-flex items-center gap-1 font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Back to Register
                  </button>

                  <button
                    type="button"
                    onClick={handleResend}
                    className="inline-flex items-center gap-1 font-bold text-[#006699] hover:underline cursor-pointer"
                  >
                    <RotateCw className="h-3.5 w-3.5" /> Resend OTP
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>

      {/* ================= OTP EMAIL PREVIEW MODAL (Image 5) ================= */}
      <OtpEmailPreviewModal
        isOpen={isOtpEmailModalOpen}
        onClose={() => setIsOtpEmailModalOpen(false)}
        otp={currentOtp}
        targetEmail={targetEmail}
        logoUrl={logoImg}
      />

      {/* ================= CONFIRMATION SUCCESS EMAIL PREVIEW MODAL (Image 4) ================= */}
      <EmailPreviewModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        logoUrl={logoImg}
      />
    </div>
  )
}

export default VerifyOtp
