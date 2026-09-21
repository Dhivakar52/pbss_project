import React from 'react'

export interface PrintDocumentFooterProps {
  regNo?: string
  childName?: string
  student?: any
}

export const PrintDocumentFooter: React.FC<PrintDocumentFooterProps> = ({
  regNo,
  childName,
  student,
}) => {
  const displayRegNo =
    regNo ||
    student?.registrationNo ||
    student?.registrationNumber ||
    student?.id ||
    ''

  const rawChildName =
    childName ||
    student?.childName ||
    student?.studentName ||
    ''

  // Child's Name: max 18 characters, if longer append "..."
  const formatChildName = (name: string): string => {
    const trimmed = name.trim()
    if (!trimmed) return ''
    if (trimmed.length > 18) {
      return `${trimmed.slice(0, 18)}...`
    }
    return trimmed
  }

  const displayChildName = formatChildName(rawChildName)

  return (
    <div className="print-footer w-full mt-auto pt-3 flex justify-end items-center select-none text-[12.5px] text-black font-sans">
      <div className="flex items-center gap-6 whitespace-nowrap">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-black">Reg No. :</span>
          <span className="font-normal text-black">{displayRegNo}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-black">Child's Name :</span>
          <span
            className="font-normal text-black uppercase"
            title={rawChildName}
          >
            {displayChildName}
          </span>
        </div>
      </div>
    </div>
  )
}

export default PrintDocumentFooter
