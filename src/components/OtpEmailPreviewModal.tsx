import React, { useState } from 'react'
import { X, Mail, Copy, Check, Code, Eye, ShieldCheck } from 'lucide-react'
import { toast } from '@/components/ui/toast'
import defaultLogo from '@/assets/images/logo.png'

export interface OtpEmailPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  otp: string
  targetEmail?: string
  logoUrl?: string
}

export function getOtpEmailHtml(otp: string, logoUrl: string, targetEmail?: string): string {
  const recipientText = targetEmail ? targetEmail : 'Applicant'

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>OTP Verification - PSBB Admission</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f4f6f8;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
    }
    table {
      border-collapse: collapse;
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f6f8; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Main Email Container -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 540px; background-color: #ffffff; border-radius: 14px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);">
          
          <!-- Header with School Logo -->
          <tr>
            <td align="center" style="padding: 36px 24px 24px 24px; border-bottom: 1px solid #f1f5f9; background: linear-gradient(to bottom, #f8fafc, #ffffff);">
              <img
                src="${logoUrl}"
                alt="PSBB Logo"
                width="96"
                height="96"
                style="display: block; width: 96px; height: 96px; max-width: 96px; object-fit: contain; margin: 0 auto; border: 0;"
              />
              <p style="margin: 12px 0 0 0; font-size: 13px; font-weight: 700; color: #0284c7; letter-spacing: 0.05em; text-transform: uppercase;">
                Padma Seshadri Bala Bhavan
              </p>
            </td>
          </tr>

          <!-- Email Content Body -->
          <tr>
            <td align="center" style="padding: 32px 32px 36px 32px;">
              <!-- Heading -->
              <h1 style="margin: 0 0 12px 0; font-size: 22px; font-weight: 800; color: #0f172a; line-height: 1.3; letter-spacing: -0.01em;">
                OTP Verification
              </h1>
              
              <!-- Verification Message -->
              <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #475569; max-width: 440px;">
                Dear <strong style="color: #1e293b;">${recipientText}</strong>,<br />
                Thank you for initiating your registration for <strong>PRE-KG (2025-26) Online Admission</strong>. Please use the following One-Time Password (OTP) to verify your account:
              </p>

              <!-- Prominent OTP Display Box -->
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin: 20px auto; background-color: #f0f9ff; border: 2px dashed #0284c7; border-radius: 12px; width: 100%; max-width: 320px;">
                <tr>
                  <td align="center" style="padding: 18px 24px;">
                    <span style="display: block; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 6px;">
                      Your OTP is
                    </span>
                    <span style="display: block; font-family: 'Courier New', Courier, monospace; font-size: 34px; font-weight: 900; letter-spacing: 0.35em; color: #0284c7; line-height: 1;">
                      ${otp}
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Validity & Security Notice -->
              <p style="margin: 20px 0 0 0; font-size: 12px; line-height: 1.5; color: #64748b;">
                This OTP is valid for <strong>10 minutes</strong>. For security reasons, please do not share this code with anyone.
              </p>

              <p style="margin: 16px 0 0 0; font-size: 11px; line-height: 1.5; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 16px;">
                If you did not request this OTP, please disregard this email or contact support.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="background-color: #f8fafc; padding: 20px 24px; border-top: 1px solid #f1f5f9;">
              <p style="margin: 0; font-size: 11px; color: #64748b; line-height: 1.5;">
                &copy; 2025-2026 Padma Seshadri Bala Bhavan Senior Secondary School.<br />
                All Rights Reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export const OtpEmailPreviewModal: React.FC<OtpEmailPreviewModalProps> = ({
  isOpen,
  onClose,
  otp,
  targetEmail,
  logoUrl = defaultLogo,
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'html'>('preview')
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const emailHtml = getOtpEmailHtml(otp, logoUrl, targetEmail)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(emailHtml)
      setCopied(true)
      toast.success('Email HTML copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy HTML')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Modal Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-xs transition-opacity animate-in fade-in-0 duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-10 overflow-hidden text-slate-900 dark:text-slate-100 animate-in fade-in-0 zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="otp-email-preview-title"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-100 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 flex items-center justify-center shadow-2xs">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="otp-email-preview-title" className="text-base font-bold text-slate-900 dark:text-white">
                  OTP Email Preview
                </h2>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800 flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> Live Dynamic OTP
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Visual preview of the OTP verification email sent to the user
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center rounded-lg bg-slate-200/70 dark:bg-slate-800 p-0.5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  activeTab === 'preview'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Eye className="h-3.5 w-3.5" />
                <span>Visual</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('html')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  activeTab === 'html'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Code className="h-3.5 w-3.5" />
                <span>HTML</span>
              </button>
            </div>

            {/* Close Button (X) */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/70 dark:bg-slate-950/70">
          {activeTab === 'preview' ? (
            /* ================= VISUAL EMAIL PREVIEW ================= */
            <div className="max-w-xl mx-auto space-y-3">
              {/* Simulated Email Envelope Header */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-3 text-xs space-y-1 text-slate-600 dark:text-slate-300 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    From: <span className="font-normal text-slate-900 dark:text-white">PSBB Admissions &lt;admissions@psbb.edu.in&gt;</span>
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Inbox</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    To: <span className="font-normal text-slate-900 dark:text-white">{targetEmail || 'applicant@example.com'}</span>
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    Subject: <span className="font-normal text-slate-900 dark:text-white">OTP Verification - PSBB Admission</span>
                  </span>
                </div>
              </div>

              {/* Responsive Email Card Container */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden">
                <table
                  role="presentation"
                  width="100%"
                  cellPadding={0}
                  cellSpacing={0}
                  style={{ borderCollapse: 'collapse' }}
                >
                  <tbody>
                    {/* Logo Section */}
                    <tr>
                      <td
                        align="center"
                        style={{
                          padding: '36px 24px 20px 24px',
                          borderBottom: '1px solid #f1f5f9',
                          background: 'linear-gradient(to bottom, #f8fafc, #ffffff)',
                        }}
                      >
                        <img
                          src={logoUrl}
                          alt="PSBB School Logo"
                          style={{
                            display: 'block',
                            width: '96px',
                            height: '96px',
                            objectFit: 'contain',
                            margin: '0 auto',
                          }}
                        />
                        <p style={{ margin: '10px 0 0 0', fontSize: '13px', fontWeight: 700, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Padma Seshadri Bala Bhavan
                        </p>
                      </td>
                    </tr>

                    {/* Email Content */}
                    <tr>
                      <td
                        align="center"
                        style={{
                          padding: '32px 32px 36px 32px',
                        }}
                      >
                        <h1
                          style={{
                            margin: '0 0 12px 0',
                            fontSize: '22px',
                            fontWeight: 800,
                            color: '#0f172a',
                            lineHeight: 1.3,
                            letterSpacing: '-0.01em',
                          }}
                          className="text-slate-900 dark:text-white"
                        >
                          OTP Verification
                        </h1>

                        <p
                          style={{
                            margin: '0 0 20px 0',
                            fontSize: '14px',
                            lineHeight: 1.6,
                            color: '#475569',
                            maxWidth: '440px',
                          }}
                          className="text-slate-600 dark:text-slate-300"
                        >
                          Dear <strong className="text-slate-900 dark:text-white">{targetEmail || 'Applicant'}</strong>,<br />
                          Thank you for registering for <strong>PRE-KG (2025-26) Online Admission</strong>. Please use the One-Time Password (OTP) below to verify your account:
                        </p>

                        {/* Prominent Dynamic OTP Box */}
                        <div
                          style={{
                            margin: '20px auto',
                            backgroundColor: '#f0f9ff',
                            border: '2px dashed #0284c7',
                            borderRadius: '12px',
                            maxWidth: '320px',
                            padding: '18px 24px',
                            textAlign: 'center',
                          }}
                          className="shadow-2xs"
                        >
                          <span
                            style={{
                              display: 'block',
                              fontSize: '11px',
                              fontWeight: 700,
                              color: '#64748b',
                              textTransform: 'uppercase',
                              letterSpacing: '0.15em',
                              marginBottom: '6px',
                            }}
                          >
                            Your OTP is
                          </span>
                          <span
                            style={{
                              display: 'block',
                              fontFamily: "'Courier New', Courier, monospace",
                              fontSize: '34px',
                              fontWeight: 900,
                              letterSpacing: '0.35em',
                              color: '#0284c7',
                              lineHeight: 1,
                            }}
                          >
                            {otp}
                          </span>
                        </div>

                        <p
                          style={{
                            margin: '20px 0 0 0',
                            fontSize: '12px',
                            lineHeight: 1.5,
                            color: '#64748b',
                          }}
                          className="text-slate-500 dark:text-slate-400"
                        >
                          This OTP is valid for <strong>10 minutes</strong>. Please do not share this code with anyone.
                        </p>

                        <p
                          style={{
                            margin: '16px 0 0 0',
                            fontSize: '11px',
                            lineHeight: 1.5,
                            color: '#94a3b8',
                            borderTop: '1px solid #f1f5f9',
                            paddingTop: '16px',
                          }}
                        >
                          If you did not request this OTP, please ignore this email.
                        </p>
                      </td>
                    </tr>

                    {/* Footer */}
                    <tr>
                      <td
                        align="center"
                        style={{
                          backgroundColor: '#f8fafc',
                          padding: '20px 24px',
                          borderTop: '1px solid #f1f5f9',
                        }}
                      >
                        <p style={{ margin: 0, fontSize: '11px', color: '#64748b', lineHeight: 1.5 }}>
                          &copy; 2025-2026 Padma Seshadri Bala Bhavan Senior Secondary School.<br />
                          All Rights Reserved.
                        </p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* ================= RAW HTML CODE VIEW ================= */
            <div className="max-w-xl mx-auto space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
                <span>Complete HTML Source with Dynamic OTP: {otp}</span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Code'}</span>
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800">
                <code>{emailHtml}</code>
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-slate-500" />}
            <span>{copied ? 'Copied HTML' : 'Copy HTML'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  )
}

export default OtpEmailPreviewModal
