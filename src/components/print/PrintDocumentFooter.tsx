import React from 'react'

export interface PrintDocumentFooterProps {
  regNo?: string
  childName?: string
  student?: any
  pageNumber?: number
  totalPages?: number
}

export const PrintDocumentFooter: React.FC<PrintDocumentFooterProps> = ({
  regNo,
  childName,
  student,
  pageNumber,
  totalPages,
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
    <div className="print-footer w-full mt-auto pt-3 grid grid-cols-3 items-center select-none text-[12px] text-black font-sans">
      <div className="text-left">
        {pageNumber !== undefined && (
          <div className="inline-flex items-center gap-1">
            <span className="font-bold text-black">Page</span>
            <span className="font-normal text-black">
              {pageNumber}{totalPages ? ` of ${totalPages}` : ''}
            </span>
          </div>
        )}
      </div>

      <div className="text-center flex justify-center items-center">
        <div className="inline-flex items-center gap-1.5 whitespace-nowrap">
          <span className="font-bold text-black">Reg No :</span>
          <span className="font-normal text-black">{displayRegNo}</span>
        </div>
      </div>

      <div className="text-right flex justify-end items-center">
        {rawChildName && (
          <div className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <span className="font-bold text-black">Child's Name :</span>
            <span
              className="font-normal text-black uppercase"
              title={rawChildName}
            >
              {displayChildName}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default PrintDocumentFooter
