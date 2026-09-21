import React from 'react'
import logoImg from '@/assets/images/logo.png'

export interface PrintDocumentHeaderProps {
  documentType: 'track-sheet' | 'registration-form'
  academicYear?: string
  student?: any
}

export const PrintDocumentHeader: React.FC<PrintDocumentHeaderProps> = ({
  documentType,
  academicYear,
  student,
}) => {
  const year =
    academicYear ||
    student?.academicYear ||
    student?.academic_year ||
    '2024-25'

  const title =
    documentType === 'track-sheet'
      ? `Track Sheet for Registration into Pre KG ${year}`
      : `Registration Form for Pre KG ${year}`

  return (
    <div className="w-full pb-2 mb-4 select-none">
      <div className="flex items-center justify-between gap-2">
        {/* School Logo */}
        <div className="shrink-0 w-20 flex items-center justify-center">
          <img
            src={logoImg}
            alt="PSBB Logo"
            className="h-20 w-20 object-contain"
          />
        </div>

        {/* Center: School Info & Document Title */}
        <div className="flex-1 text-center pr-16">
          <h1 className="text-[19px] font-normal text-black tracking-normal leading-tight font-sans">
            Padma Seshadri Bala Bhavan Sr. Sec. School
          </h1>
          <p className="text-[15px] font-normal text-black leading-snug mt-0.5 font-sans">
            No.17,Thirumalai Road,T.Nagar,Chennai - 17.
          </p>
          <h2 className="text-[15px] font-normal text-black mt-1 font-sans">
            {title}
          </h2>
        </div>
      </div>
    </div>
  )
}

export default PrintDocumentHeader
