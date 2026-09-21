import React, { useMemo } from 'react'
import { createPortal } from 'react-dom'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Printer, X, FileText } from 'lucide-react'
import { TrackSheetPrint } from './TrackSheetPrint'
import { RegistrationFormPrint } from './RegistrationFormPrint'
import { mapStudentToTrackSheet, mapStudentToRegistrationForm } from './printMappers'

export interface PrintPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  documentType: 'track-sheet' | 'registration-form'
  student: any | null
}

export const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({
  isOpen,
  onClose,
  documentType,
  student,
}) => {
  React.useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })
    }
  }, [isOpen])

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })
      setTimeout(() => {
        window.print()
      }, 50)
    }
  }

  const trackSheetData = useMemo(() => {
    if (!student) return null
    return mapStudentToTrackSheet(student)
  }, [student])

  const registrationFormData = useMemo(() => {
    if (!student) return null
    return mapStudentToRegistrationForm(student)
  }, [student])

  if (!student) return null

  const isTrackSheet = documentType === 'track-sheet'
  const title = isTrackSheet ? 'Track Sheet Preview' : 'Registration Form Preview'
  const studentName = student.studentName || student.childName || 'Applicant'
  const regNo = student.registrationNumber || student.id || ''

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          className="p-0 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[92vh] flex flex-col print:hidden bg-white dark:bg-slate-900 shadow-2xl"
          style={{
            maxWidth: '900px',
            width: '95vw',
          }}
        >
          {/* Header */}
          <DialogHeader className="bg-slate-50 dark:bg-slate-800/60 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-slate-900 dark:text-white">
                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle className="text-base font-semibold leading-tight">
                    {title}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {studentName} {regNo ? `(${regNo})` : ''} • A4 Multi-Page Layout
                  </DialogDescription>
                </div>
              </div>
            </div>
          </DialogHeader>

          {/* Scrollable Document Preview Body */}
          <div className="flex-1 overflow-y-auto bg-slate-200/80 dark:bg-slate-950 p-4 sm:p-6 flex flex-col items-center gap-6 print:hidden">
            {isTrackSheet && trackSheetData && (
              <TrackSheetPrint data={trackSheetData} />
            )}
            {!isTrackSheet && registrationFormData && (
              <RegistrationFormPrint data={registrationFormData} />
            )}
          </div>

          {/* Footer Action Buttons */}
          <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs font-medium cursor-pointer"
            >
              <X className="h-3.5 w-3.5 mr-1" /> Close
            </Button>

            <Button
              size="sm"
              onClick={handlePrint}
              className="text-xs font-medium gap-1.5 text-white cursor-pointer bg-blue-600 hover:bg-blue-700 shadow-sm"
            >
              <Printer className="h-3.5 w-3.5" />
              Print
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Standalone Print-Only Portal attached directly to document.body for clean browser printing */}
      {isOpen &&
        createPortal(
          <div id="printable-document-container" className="print-document-standalone">
            {isTrackSheet && trackSheetData && (
              <TrackSheetPrint data={trackSheetData} />
            )}
            {!isTrackSheet && registrationFormData && (
              <RegistrationFormPrint data={registrationFormData} />
            )}
          </div>,
          document.body
        )}
    </>
  )
}
