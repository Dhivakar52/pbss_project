import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FileText, ExternalLink, Phone, AlertCircle, Info } from 'lucide-react'
import { PrintPreviewModal } from '@/components/print'
import { mockStudents } from '@/data/mockStudents'

export interface RegistrationInstructionsModalProps {
  isOpen: boolean
  onClose: () => void
}

export const RegistrationInstructionsModal: React.FC<RegistrationInstructionsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [isSampleFormOpen, setIsSampleFormOpen] = useState(false)

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
        <DialogContent
          className="p-0 overflow-hidden max-h-[88vh] flex flex-col sm:max-w-3xl md:max-w-4xl w-[95vw] bg-white rounded-2xl shadow-2xl border border-slate-200"
          showCloseButton={true}
        >
          {/* Header */}
          <DialogHeader className="bg-gradient-to-r from-sky-50 via-slate-50 to-sky-50/50 px-6 py-4 border-b border-slate-200 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-sky-100 text-[#0284c7] shrink-0">
                <FileText className="h-5 w-5" />
              </div>
              <div className="text-left">
                <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  Registration Instructions & Guidelines
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 mt-0.5">
                  Please review all admission guidelines and submission criteria before proceeding
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5 sm:px-8 sm:py-6 space-y-6 text-slate-700 text-xs sm:text-[13.5px] leading-relaxed">

            {/* 1. REGISTRATION SECTION */}
            <section className="space-y-3">
              <h2 className="text-sm sm:text-base font-bold text-[#005691] underline underline-offset-4 decoration-[#005691] tracking-wide uppercase">
                REGISTRATION:
              </h2>

              <ul className="list-disc pl-5 space-y-2">
                <li>
                  Register yourself to get user id and password (
                  <button
                    type="button"
                    // onClick={() => setIsSampleFormOpen(true)}
                    className="text-[#0070ba] hover:text-[#005691] underline font-semibold focus:outline-none focus-visible:ring-1 focus-visible:ring-sky-500 rounded-xs cursor-pointer inline-flex items-center gap-0.5"
                  >
                    click here to view the Sample Registration Form
                  </button>
                  ).
                </li>
                <li>
                  Create separate user id and password for applying in case of twins / triplets.
                </li>
                <li>
                  Ensure you furnish all details as required in the registration form.
                </li>
                <li>
                  Make all the corrections (if any) before accepting the declaration.
                </li>
                <li>
                  Modification of details is not possible after accepting the declaration.
                </li>
                <li>
                  <span className="font-bold text-slate-800">PRINT TRACK SHEET</span> (If Adobe Acrobat reader is not available in your system, please{' '}
                  <a
                    href="https://get.adobe.com/reader/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#0070ba] hover:text-[#005691] underline font-semibold focus:outline-none focus-visible:ring-1 focus-visible:ring-sky-500 rounded-xs inline-flex items-center gap-0.5"
                  >
                    click here
                    <ExternalLink className="h-3 w-3 inline text-slate-400" />
                  </a>{' '}
                  to download{' '}
                  <span className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded text-[10px] font-bold bg-red-100 text-red-700 border border-red-200 align-middle">
                    <FileText className="h-2.5 w-2.5 text-red-600 inline" />
                    PDF
                  </span>{' '}
                  )
                </li>
                <li>
                  During the process of filling the online Registration form, if there is any interruption restart the process using the same user id and password.
                </li>
                <li>
                  To print the Track Sheet later (if not done immediately after submitting the Online Registration Form)
                  <ul className="list-disc pl-6 mt-1.5 space-y-1 text-slate-600">
                    <li>Login once again with the given user-id and password</li>
                    <li>&ldquo;Print Track Sheet&rdquo;</li>
                  </ul>
                </li>
                <li>
                  Please ensure &ldquo;Track Sheet&rdquo; is printed as soon as Online Registration Form is submitted.
                </li>
              </ul>

              {/* Solid Blue Note Banner */}
              <div className="my-3 px-4 py-2.5 bg-[#0070ba] text-white rounded font-bold text-xs sm:text-[13px] tracking-wide shadow-xs">
                <span>NOTE : </span>
                <span className="font-normal italic">&ldquo;Print&rdquo; option will not be available after midnight of 06/01/2026 (Tuesday).</span>
              </div>

              {/* Registration completion requirement */}
              <p className="font-bold text-[#005691] text-xs sm:text-[13.5px] pt-0.5">
                Registration process is considered to be complete only on submission of Track sheet
              </p>
            </section>

            {/* 2. TRACK SHEET SUBMISSION SECTION */}
            <section className="space-y-3 pt-2 border-t border-slate-100">
              <h2 className="text-sm sm:text-base font-bold text-[#005691] underline underline-offset-4 decoration-[#005691] tracking-wide uppercase">
                TRACK SHEET SUBMISSION:
              </h2>

              <ul className="list-disc pl-5 space-y-2.5">
                <li>
                  Submit the Track Sheet signed by both parents (to the school office of the branch applied for)
                </li>
                <li>
                  Documents to <strong className="font-bold text-slate-900">be submitted in person by the parent only</strong>(with authorization letter from parent, if guardian) :
                  <ol className="list-decimal pl-6 mt-2 space-y-1.5">
                    <li>
                      Track sheet signed by <strong className="font-bold text-slate-900">BOTH</strong> parents/guardian with recent photo of the child duly affixed (please mention <strong className="font-bold text-slate-900">Reg No.</strong> at the back of the photo)
                    </li>
                    <li>
                      Birth Certificate of Child - COPY
                    </li>
                    <li>
                      Passport size photographs of both parents with <strong className="font-bold text-slate-900">Reg No.</strong> written at the back
                    </li>
                    <li>
                      Address proof of parents - COPY
                    </li>
                  </ol>
                </li>

                <li>
                  Documents to be brought for <strong className="font-bold text-slate-900">verification</strong>:
                  <ol className="list-decimal pl-6 mt-2 space-y-1.5">
                    <li>
                      Birth Certificate of Child - ORIGINAL
                    </li>
                    <li>
                      Proof of Address of both Parents - ORIGINAL
                    </li>
                    <li>
                      Photo ID of both parents - ORIGINAL
                    </li>
                  </ol>
                </li>

                <li className="font-medium text-slate-800">
                  Rs.500/- to be remitted through Debit / Credit card ONLY towards processing fee.
                </li>
              </ul>
            </section>

            {/* 3. TERMS & CONDITIONS SECTION */}
            <section className="space-y-3 pt-3 p-4 rounded-xl bg-slate-50/70 border border-slate-200/80">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-[#005691]" />
                <h2 className="text-sm sm:text-base font-bold text-[#005691] underline underline-offset-4 decoration-[#005691] tracking-wide uppercase">
                  TERMS &amp; CONDITIONS :
                </h2>
              </div>

              <ul className="list-disc pl-5 space-y-2 text-slate-700">
                <li>
                  The Birth certificate should have the Child&apos;s Name
                </li>
                <li>
                  <strong className="font-bold text-slate-900">Age eligibility-minimum 3 years as on 1st June 2026</strong>(i.e., Children born between <strong className="font-bold text-slate-900">01/06/2022 and 31/05/2023</strong> - both days inclusive) <strong className="font-bold text-slate-900">ONLY</strong> are eligible for registration.
                </li>
                <li>
                  Name of the child and Date of Birth should be filled exactly as given in the birth certificate.
                </li>
                <li>
                  Registration forms with false / incomplete or vague information will not be considered.
                </li>
                <li>
                  Please adhere to the instructions given under &ldquo;Track Sheet Submission&rdquo;.
                </li>
              </ul>
            </section>

            {/* Contact Information */}
            <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/90 text-amber-950 flex items-start gap-2.5">
              <Phone className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
              <p className="text-xs sm:text-[13px] leading-relaxed">
                Kindly contact <strong className="font-bold text-slate-900">9566114406</strong>, <strong className="font-bold underline text-slate-900">ONLY</strong> in case you encounter any difficulty in online submission of application (OR) in taking a print out of the Track Sheet.
              </p>
            </div>

          </div>

          {/* Footer with Close Button */}
          <DialogFooter className="bg-slate-50/90 px-6 py-3.5 border-t border-slate-200 shrink-0 flex items-center justify-between sm:justify-between">
            <div className="text-[11px] text-slate-500 hidden sm:flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5 text-slate-400" />
              Press ESC or click outside to dismiss
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-6 h-9 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-lg shadow-sm cursor-pointer"
              >
                Close Instructions
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Embedded Sample Registration Form Preview if clicked */}
      {isSampleFormOpen && mockStudents[0] && (
        <PrintPreviewModal
          isOpen={isSampleFormOpen}
          onClose={() => setIsSampleFormOpen(false)}
          documentType="registration-form"
          student={mockStudents[0]}
        />
      )}
    </>
  )
}

export default RegistrationInstructionsModal
