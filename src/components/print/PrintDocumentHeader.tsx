import React from 'react'
import logoImg from '@/assets/images/logo.png'
import { useMasterStore } from '@/store/useMasterStore'

export interface PrintDocumentHeaderProps {
  documentType: 'track-sheet' | 'registration-form'
  academicYear?: string
  student?: any
  logoSrc?: string
}

export const PrintDocumentHeader: React.FC<PrintDocumentHeaderProps> = ({
  documentType,
  academicYear,
  student,
  logoSrc,
}) => {
  const year =
    academicYear ||
    student?.academicYear ||
    student?.academic_year ||
    student?.AcademicYear ||
    '2025-2026'

  const effectiveLogo = logoSrc || student?.logoSrc || logoImg

  const schoolAddress = React.useMemo(() => {
    const rawAddress =
      student?.schoolAddress ||
      student?.SchoolAddress ||
      student?.admissionSchoolAddress
    if (rawAddress && typeof rawAddress === 'string' && rawAddress.trim()) {
      return rawAddress.trim()
    }

    const schoolApplied = String(
      student?.schoolAppliedFor ||
      student?.School ||
      student?.schoolBranch ||
      student?.BranchName ||
      ''
    ).toLowerCase()

    const schoolId = Number(student?.schoolId || student?.SchoolID)

    const masterSchools = useMasterStore.getState().schools || []
    if (schoolId > 0) {
      const matchById = masterSchools.find((s) => Number(s.SchoolID) === schoolId)
      if (matchById?.SchoolAddress?.trim()) {
        return matchById.SchoolAddress.trim()
      }
    }

    if (schoolApplied) {
      const matchByName = masterSchools.find((s) => {
        const sName = (s.SchoolName || s.School || s.SchoolShortName || '').toLowerCase()
        return sName && (sName.includes(schoolApplied) || schoolApplied.includes(sName))
      })
      if (matchByName?.SchoolAddress?.trim()) {
        return matchByName.SchoolAddress.trim()
      }
    }

    // Direct fallback if master store not yet populated
    if (schoolId === 2 || schoolApplied.includes('k.k') || schoolApplied.includes('kk')) {
      return '29, Alagirisamy Salai, K.K. Nagar, Chennai - 600078'
    }

    return 'No: 17, Thirumalai Road, T.Nagar, Chennai - 600017'
  }, [student])

  const title =
    documentType === 'track-sheet'
      ? `Track Sheet for Registration into Pre KG ${year}`
      : `Registration Form for Pre KG ${year}`

  return (
    <div
      className="w-full pb-2 mb-3 select-none"
      style={{ borderBottom: '1.5px solid #000', paddingBottom: '6px', marginBottom: '10px' }}
    >
      <div className="flex items-center justify-between gap-2">
        {/* School Logo */}
        <div className="shrink-0 w-20 flex items-center justify-center">
          <img
            src={effectiveLogo}
            alt="PSBB Logo"
            className="h-20 w-20 object-contain"
          />
        </div>

        {/* Center: School Info & Document Title */}
        <div className="flex-1 text-center">
          <h1 className="text-[19px] font-normal text-black tracking-normal leading-tight font-sans">
            Padma Seshadri Bala Bhavan Sr. Sec. School
          </h1>
          <p className="text-[15px] font-normal text-black leading-snug mt-0.5 font-sans">
            {schoolAddress}
          </p>
          <h2 className="text-[15px] font-normal text-black mt-1 font-sans">
            {title}
          </h2>
        </div>

        {/* Right Spacer matching logo width for perfect centering */}
        <div className="shrink-0 w-20" />
      </div>
    </div>
  )
}

export default PrintDocumentHeader
