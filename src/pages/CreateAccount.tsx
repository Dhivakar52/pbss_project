import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, Lock, CheckCircle2, FileText, UserRound, Loader2, RefreshCw } from 'lucide-react'
import { TextField, DobDateField } from '@/components/FormPrimitives'
import { InstructionModal } from '@/pages/Home/components/InstructionModal'
import { useAuthStore } from '@/store/useAuthStore'
import { toast } from '@/components/ui/toast'
import { getMaxAdultDate, isValidAdultDob, isValidRegistrationEmail } from '@/utils/validation'
import { ApiService } from '@/services/api.service'
import { PrintPreviewModal } from '@/components/print'

interface RegistrationErrors {
  userName?: string
  email?: string
  dob?: string
  password?: string
  confirmPassword?: string
  captcha?: string
  instructions?: string
}

const CreateAccount: React.FC = () => {
  const navigate = useNavigate()
  const startRegistration = useAuthStore((s) => s.startRegistration)
  const clearPendingRegistration = useAuthStore((s) => s.clearPendingRegistration)
  const pendingRegistration = useAuthStore((s) => s.pendingRegistration)

  const [userName, setUserName] = useState(pendingRegistration?.userName || '')
  const [email, setEmail] = useState(pendingRegistration?.email || '')
  const [dob, setDob] = useState(pendingRegistration?.dob || '')
  const [password, setPassword] = useState(pendingRegistration?.password || '')
  const [confirmPassword, setConfirmPassword] = useState(pendingRegistration?.password || '')
  const [hasAgreedToInstructions, setHasAgreedToInstructions] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)
  const [isSampleFormOpen, setIsSampleFormOpen] = useState(false)
  const [sampleFormStudent, setSampleFormStudent] = useState<Record<string, string> | null>(null)
  const [errors, setErrors] = useState<RegistrationErrors>({})
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false)
  // Word Verification CAPTCHA state
  const [captchaCode, setCaptchaCode] = useState('')
  const [captchaInput, setCaptchaInput] = useState('')
  const [isCaptchaSpinning, setIsCaptchaSpinning] = useState(false)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  const generateCaptchaText = () => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz'
    let text = ''
    for (let i = 0; i < 5; i++) {
      text += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return text
  }

  const renderCaptchaCanvas = (text: string) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height)
    gradient.addColorStop(0, '#f0f9ff')
    gradient.addColorStop(1, '#e0f2fe')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    // Noise lines
    for (let i = 0; i < 4; i++) {
      ctx.strokeStyle = `rgba(2, 132, 199, ${0.18 + Math.random() * 0.15})`
      ctx.lineWidth = 1 + Math.random() * 1.5
      ctx.beginPath()
      ctx.moveTo(Math.random() * width, Math.random() * height)
      ctx.bezierCurveTo(
        Math.random() * width, Math.random() * height,
        Math.random() * width, Math.random() * height,
        Math.random() * width, Math.random() * height
      )
      ctx.stroke()
    }

    // Noise dots
    for (let i = 0; i < 25; i++) {
      ctx.fillStyle = `rgba(14, 54, 79, ${0.1 + Math.random() * 0.2})`
      ctx.beginPath()
      ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 1.5, 0, Math.PI * 2)
      ctx.fill()
    }

    // Render distorted characters
    const charSpacing = width / (text.length + 1)
    const fonts = ['bold 22px sans-serif', 'bold 24px monospace', 'bold 22px serif']
    const colors = ['#0e364f', '#0284c7', '#0369a1', '#075985', '#0c4a6e']

    for (let i = 0; i < text.length; i++) {
      const char = text[i]
      ctx.save()
      ctx.font = fonts[i % fonts.length]
      ctx.fillStyle = colors[i % colors.length]
      ctx.textBaseline = 'middle'

      const x = charSpacing * (i + 0.8)
      const y = height / 2 + (Math.random() * 6 - 3)
      const angle = (Math.random() * 24 - 12) * (Math.PI / 180)

      ctx.translate(x, y)
      ctx.rotate(angle)
      ctx.fillText(char, 0, 0)
      ctx.restore()
    }
  }

  const handleRefreshCaptcha = () => {
    setIsCaptchaSpinning(true)
    const newCode = generateCaptchaText()
    setCaptchaCode(newCode)
    renderCaptchaCanvas(newCode)
    setCaptchaInput('')
    setErrors((prev) => ({ ...prev, captcha: undefined }))
    setTimeout(() => setIsCaptchaSpinning(false), 500)
  }

  React.useEffect(() => {
    const initialCode = generateCaptchaText()
    setCaptchaCode(initialCode)
    renderCaptchaCanvas(initialCode)
  }, [])


  const handleViewSampleRegistrationForm = (academicYear: string) => {
    setSampleFormStudent({ academicYear })
    setShowInstructions(false)
    setIsSampleFormOpen(true)
  }

  const handleClear = () => {
    clearPendingRegistration()
    setUserName('')
    setEmail('')
    setDob('')
    setPassword('')
    setConfirmPassword('')
    setHasAgreedToInstructions(false)
    setCaptchaInput('')
    handleRefreshCaptcha()
    setErrors({})
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const nextErrors: RegistrationErrors = {}
    if (!userName.trim()) {
      nextErrors.userName = 'Username is required'
    } else if (userName.trim().length > 100) {
      nextErrors.userName = 'Username cannot exceed 100 characters'
    }
    if (!email.trim()) {
      nextErrors.email = 'Email Address is required'
    } else if (!isValidRegistrationEmail(email.trim())) {
      nextErrors.email = 'Please enter a valid email address and check for typing errors'
    }
    const dobValidation = isValidAdultDob(dob)
    if (!dobValidation.isValid) nextErrors.dob = dobValidation.error
    if (!password) {
      nextErrors.password = 'Password is required'
    } else if (password.length < 8 || password.length > 20) {
      nextErrors.password = 'Password must be 8–20 characters'
    }
    if (!confirmPassword) {
      nextErrors.confirmPassword = 'Confirm Password is required'
    } else if (password !== confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match'
    }

    if (!captchaInput.trim()) {
      nextErrors.captcha = 'Please enter the verification code'
    } else if (captchaInput.trim().toLowerCase() !== captchaCode.toLowerCase()) {
      nextErrors.captcha = 'Verification code does not match. Please try again.'
      handleRefreshCaptcha()
    }

    if (!hasAgreedToInstructions) {
      nextErrors.instructions = 'Please confirm that you have read and understood the Registration Instructions.'
    }

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setIsCheckingAvailability(true)
    try {
      const availability = await ApiService.checkRegistrationAvailability({
        userName: userName.trim(),
        email: email.trim().toLowerCase(),
      })
      const availabilityErrors: RegistrationErrors = {}
      // if (!availability.userNameAvailable) {
      //   availabilityErrors.userName = 'This username is already registered'
      // }
      if (!availability.emailAvailable) {
        availabilityErrors.email = 'This email address is already registered'
      }
      if (Object.keys(availabilityErrors).length > 0) {
        setErrors(availabilityErrors)
        return
      }
    } catch (error) {
      console.error('Unable to verify registration availability:', error)
      setErrors({
        email: 'Unable to verify email and username right now. Please try again.',
      })
      return
    } finally {
      setIsCheckingAvailability(false)
    }

    startRegistration({
      userName: userName.trim(),
      fullName: undefined,
      email: email.trim().toLowerCase(),
      dob,
      password,
    })
    toast.info(`Verification code sent to ${email.trim()}!`)
    navigate('/verify-otp')
  }

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-[490px] bg-white rounded-2xl shadow-xl border border-sky-100 p-6 sm:p-8 space-y-5">
        {/* Top: Back to Login */}
        <div>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center text-xs sm:text-[13px] font-bold text-[#0088b6] hover:underline gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Login
          </button>
        </div>

        {/* Centered Header */}
        <div className="text-center space-y-1">
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#0284c7] tracking-tight">
            Create Your Account
          </h1>
          <p className="text-xs sm:text-[13px] text-slate-500 font-medium">
            Enter your details below to register for Pre-KG Online Admission
          </p>
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowInstructions(true)}
              className="text-xs sm:text-[13px] font-bold text-[#0284c7] hover:underline cursor-pointer inline-flex items-center gap-1.5"
            >
              <FileText className="h-4 w-4 text-[#0284c7]" />
              Click here to read the complete Instructions
            </button>
          </div>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Full Name remains optional in the account model but is not collected here. */}
          {/* Username */}
          <div>
            <label htmlFor="userName" className="block text-sm font-semibold text-[#0e364f] mb-1.5">
              User Name <span className="text-red-500">*</span>
            </label>
            <TextField
              id="userName"
              placeholder="Enter a username"
              value={userName}
              onChange={(value) => {
                setUserName(value)
                setErrors((previous) => ({ ...previous, userName: undefined }))
              }}
              leftIcon={<UserRound className="h-4 w-4 text-sky-600" />}
              error={!!errors.userName}
              autoComplete="username"
              maxLength={100}
              className="h-11 rounded-lg border-slate-300 bg-white text-sm text-[#0e364f] focus-visible:ring-[#0284c7]"
            />
            {errors.userName && <p className="mt-1 text-[11px] font-medium text-rose-500">{errors.userName}</p>}
          </div>

          {/* Email Address */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-[#0e364f] mb-1.5">
              Email Address <span className="text-red-500">*</span>
            </label>
            <TextField
              id="email"
              type="text"
              placeholder="e.g. parent@example.com"
              value={email}
              onChange={(value) => {
                setEmail(value)
                setErrors((previous) => ({ ...previous, email: undefined }))
              }}
              leftIcon={<Mail className="h-4 w-4 text-sky-600" />}
              error={!!errors.email}
              autoComplete="email"
              className="h-11 rounded-lg border-slate-300 bg-white text-sm text-[#0e364f] focus-visible:ring-[#0284c7]"
            />
            {errors.email && <p className="mt-1 text-[11px] font-medium text-rose-500">{errors.email}</p>}
          </div>

          {/* Date of Birth */}
          <div>
            <label htmlFor="dob" className="block text-sm font-semibold text-[#0e364f] mb-1.5">
              User's Date of Birth (DD/MM/YYYY) <span className="text-red-500">*</span>
            </label>
            <DobDateField
              id="dob"
              value={dob}
              onChange={(value: string) => {
                setDob(value)
                setErrors((previous) => ({ ...previous, dob: undefined }))
              }}
              max={getMaxAdultDate()}
              className="h-11 rounded-lg border-slate-300 bg-white text-sm text-[#0e364f] focus:ring-[#0284c7]"
            />
            {errors.dob && <p className="mt-1 text-[11px] font-medium text-rose-500">{errors.dob}</p>}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-[#0e364f] mb-1.5">
              Password <span className="text-red-500">*</span>
            </label>
            <TextField
              id="password"
              placeholder="Enter your password (8-20 characters)"
              showPasswordToggle
              value={password}
              onChange={(value) => {
                setPassword(value)
                setErrors((previous) => ({ ...previous, password: undefined }))
              }}
              leftIcon={<Lock className="h-4 w-4 text-sky-600" />}
              error={!!errors.password}
              autoComplete="new-password"
              maxLength={20}
              className="h-11 rounded-lg border-slate-300 bg-white text-sm text-[#0e364f] focus-visible:ring-[#0284c7]"
            />
            {errors.password && <p className="mt-1 text-[11px] font-medium text-rose-500">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-[#0e364f] mb-1.5">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <TextField
              id="confirmPassword"
              placeholder="Re-enter your password"
              showPasswordToggle
              value={confirmPassword}
              onChange={(value) => {
                setConfirmPassword(value)
                setErrors((previous) => ({ ...previous, confirmPassword: undefined }))
              }}
              leftIcon={<Lock className="h-4 w-4 text-sky-600" />}
              error={!!errors.confirmPassword}
              autoComplete="new-password"
              maxLength={20}
              className="h-11 rounded-lg border-slate-300 bg-white text-sm text-[#0e364f] focus-visible:ring-[#0284c7]"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-[11px] font-medium text-rose-500">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Word Verification CAPTCHA */}
          <div>
            <label htmlFor="captchaInput" className="block text-sm font-semibold text-[#0e364f] mb-1.5">
              Word Verification <span className="text-red-500">*</span>
            </label>

            <div className="flex items-center gap-2.5">
              <div className="relative rounded-lg overflow-hidden border border-sky-200 bg-sky-50/50 shadow-2xs shrink-0 flex items-center justify-center">
                <canvas
                  ref={canvasRef}
                  width={140}
                  height={44}
                  className="block cursor-pointer select-none"
                  onClick={handleRefreshCaptcha}
                  title="Click to refresh verification code"
                  aria-label="Word Verification Image"
                />
              </div>

              <button
                type="button"
                onClick={handleRefreshCaptcha}
                title="Generate new verification code"
                aria-label="Generate new verification code"
                className="w-11 h-11 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-[#0284c7] flex items-center justify-center transition-colors cursor-pointer shrink-0 shadow-2xs"
              >
                <RefreshCw className={`h-4 w-4 ${isCaptchaSpinning ? 'animate-spin text-[#0284c7]' : ''}`} />
              </button>

              <div className="flex-1 min-w-0">
                <TextField
                  id="captchaInput"
                  placeholder="Enter code"
                  value={captchaInput}
                  onChange={(val) => {
                    setCaptchaInput(val)
                    setErrors((previous) => ({ ...previous, captcha: undefined }))
                  }}
                  error={!!errors.captcha}
                  maxLength={10}
                  autoComplete="off"
                  className="h-11 rounded-lg border-slate-300 bg-white text-sm text-[#0e364f] focus-visible:ring-[#0284c7]"
                />
              </div>
            </div>

            {errors.captcha && (
              <p className="mt-1 text-[11px] font-medium text-rose-500">{errors.captcha}</p>
            )}
          </div>

          {/* Info Callout Box */}
          <div className="p-3.5 rounded-xl bg-[#f0f9ff] border border-[#bae6fd] flex items-start gap-2.5">
            <CheckCircle2 className="h-5 w-5 text-[#0284c7] shrink-0 mt-0.5" />
            <p className="text-xs sm:text-[12.5px] text-[#0369a1] font-medium leading-relaxed">
              After clicking submit, a 4-digit verification code (OTP) will be required to activate your account.
            </p>
          </div>

          {/* Instructions Confirmation Checkbox */}
          <div className="pt-1">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                id="instructionsConfirmation"
                checked={hasAgreedToInstructions}
                onChange={(e) => {
                  setHasAgreedToInstructions(e.target.checked)
                  if (e.target.checked) {
                    setErrors((previous) => ({ ...previous, instructions: undefined }))
                  }
                }}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#006699] focus:ring-[#0284c7] cursor-pointer"
              />
              <span className="text-xs sm:text-[13px] font-semibold text-[#0e364f] leading-snug">

                Read the sample Registration form carefully before you start the Online Registration form <span className="text-red-500">*</span>
              </span>
            </label>
            {errors.instructions && (
              <p className="mt-1 text-[11px] font-medium text-rose-500">{errors.instructions}</p>
            )}
          </div>

          {/* Instructions Confirmation Checkbox */}
          {/* <div className="pt-1">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                id="instructionsConfirmation"
                checked={hasAgreedToInstructions}
                onChange={(e) => {
                  setHasAgreedToInstructions(e.target.checked)
                  if (e.target.checked) {
                    setErrors((previous) => ({ ...previous, instructions: undefined }))
                  }
                }}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#006699] focus:ring-[#0284c7] cursor-pointer"
              />
              <span className="text-xs sm:text-[13px] font-semibold text-[#0e364f] leading-snug">
                I have read and understood the Registration Instructions. <span className="text-red-500">*</span>
              </span>
            </label>
            {errors.instructions && (
              <p className="mt-1 text-[11px] font-medium text-rose-500">{errors.instructions}</p>
            )}
          </div> */}

          {/* Buttons: SUBMIT & VERIFY + CLEAR */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={isCheckingAvailability}
              className="flex-1 h-11 bg-[#006699] hover:bg-[#005580] text-white font-extrabold text-xs sm:text-sm rounded-lg shadow-sm transition-all uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isCheckingAvailability ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  CHECKING DETAILS...
                </>
              ) : (
                'SUBMIT'
              )}
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="px-6 h-11 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm rounded-lg border border-slate-200 transition-colors uppercase tracking-wider cursor-pointer"
            >
              CLEAR
            </button>
          </div>
        </form>
      </div>

      {/* Complete Instructions Modal */}
      <InstructionModal
        isOpen={showInstructions}
        onClose={() => setShowInstructions(false)}
        onViewSampleRegistrationForm={handleViewSampleRegistrationForm}
      />
      <PrintPreviewModal
        isOpen={isSampleFormOpen}
        onClose={() => setIsSampleFormOpen(false)}
        documentType="registration-form-5"
        student={sampleFormStudent}
      />
    </div>
  )
}

export default CreateAccount
