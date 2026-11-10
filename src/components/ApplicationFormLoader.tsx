import React from 'react'
import { cn } from '@/lib/utils'

export interface ApplicationFormLoaderProps {
  /**
   * Main text message displayed below the icon. Defaults to "Loading Application Details..."
   */
  message?: string
  /**
   * Optional supporting subtext.
   */
  subMessage?: string
  /**
   * If true, renders as a fixed viewport overlay. Defaults to false.
   */
  fullScreen?: boolean
  /**
   * Additional custom CSS classes for the outer wrapper.
   */
  className?: string
  /**
   * Optional minimum height when rendered inline. Defaults to min-h-[460px].
   */
  minHeight?: string
}

/**
 * Modern Application Form Loader for the School Admission Portal.
 * Features a floating document / application form icon with #08805E theme accent,
 * clean white background, professional typography, and smooth transitions.
 */
export const ApplicationFormLoader: React.FC<ApplicationFormLoaderProps> = ({
  message = 'Loading Application Details...',
  subMessage,
  fullScreen = false,
  className,
  minHeight = 'min-h-[460px] sm:min-h-[560px]',
}) => {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={message}
      className={cn(
        'w-full flex flex-col items-center justify-center p-6 text-center select-none bg-white dark:bg-slate-900 transition-opacity duration-300 ease-in-out animate-in fade-in-0',
        fullScreen
          ? 'fixed inset-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs'
          : cn(minHeight, 'rounded-2xl border border-slate-100 dark:border-slate-800 shadow-2xs'),
        className
      )}
    >
      {/* Animated Document / Application Form Icon Card */}
      <div className="relative flex items-center justify-center mb-5 animate-form-float">
        {/* Soft Background Pulse Ring */}
        <div className="absolute -inset-3 rounded-3xl bg-[#08805E]/10 dark:bg-[#08805E]/20 blur-md animate-pulse" />

        {/* Outer Icon Badge */}
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-850 border-2 border-[#08805E]/25 shadow-xl shadow-[#08805E]/15 flex items-center justify-center ring-8 ring-[#08805E]/5 dark:ring-[#08805E]/10">
          {/* Document / Application Form SVG */}
          <svg
            className="w-10 h-10 sm:w-12 sm:h-12 text-[#08805E]"
            viewBox="0 0 48 48"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Document sheet with folded corner */}
            <path
              d="M10 6h20l10 10v24a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4V10a4 4 0 0 1 4-4z"
              fill="#08805E"
              fillOpacity="0.08"
            />
            {/* Folded corner flap */}
            <path
              d="M30 6v10h10"
              fill="#08805E"
              fillOpacity="0.18"
            />
            {/* Form Section Header Bar */}
            <line x1="14" y1="20" x2="24" y2="20" strokeWidth="3" />
            {/* Structured Form Fields Lines */}
            <line x1="14" y1="26" x2="34" y2="26" strokeWidth="2.2" strokeOpacity="0.8" />
            <line x1="14" y1="32" x2="31" y2="32" strokeWidth="2.2" strokeOpacity="0.8" />
            <line x1="14" y1="38" x2="22" y2="38" strokeWidth="2.2" strokeOpacity="0.6" />
          </svg>

          {/* Decorative Verified Check Indicator on the corner */}
          <div className="absolute -bottom-1 -right-1 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#08805E] text-white flex items-center justify-center shadow-md shadow-[#08805E]/30 ring-2 ring-white dark:ring-slate-900">
            <svg
              className="w-3.5 h-3.5 sm:w-4 sm:h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>
      </div>

      {/* Main Status Text */}
      <h3 className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-100 tracking-wide mt-1">
        {message}
      </h3>

      {/* Optional Subtext */}
      {subMessage && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs sm:max-w-sm">
          {subMessage}
        </p>
      )}

      {/* Minimal Indeterminate Progress Bar */}
      <div className="w-36 sm:w-48 h-1 bg-[#08805E]/15 rounded-full overflow-hidden mt-3.5 relative">
        <div className="h-full w-1/3 bg-[#08805E] rounded-full animate-form-bar" />
      </div>

      <span className="sr-only">Loading</span>
    </div>
  )
}

export default ApplicationFormLoader

