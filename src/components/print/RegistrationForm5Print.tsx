import React from 'react'
import { PrintDocumentHeader } from './PrintDocumentHeader'
import { PrintDocumentFooter } from './PrintDocumentFooter'
import type { RegistrationFormData } from './printMappers'

export interface RegistrationForm5PrintProps {
  data: RegistrationFormData
}

export const RegistrationForm5Print: React.FC<RegistrationForm5PrintProps> = ({ data }) => {
  const siblings = data.siblings || []
  const siblingRows = [...siblings]
  while (siblingRows.length < 4) {
    siblingRows.push({
      name: '',
      school: '',
      usn: '',
      classSec: '',
      leavingYearAndClass: '',
    })
  }

  // Left vertical sidebar matching existing Registration Form PDF design:
  const LeftVerticalSidebar = () => (
    <div
      className="reg-form-sidebar w-[44px] min-w-[44px] max-w-[44px] self-stretch flex items-center justify-center select-none shrink-0"
      style={{
        width: '44px',
        minWidth: '44px',
        maxWidth: '44px',
        backgroundColor: '#ccc',
        WebkitPrintColorAdjust: 'exact',
        printColorAdjust: 'exact',
      }}
    >
      <div
        className="w-[44px] h-[622px] flex items-center justify-center overflow-hidden"
        style={{
          width: '44px',
          height: '622px',
          WebkitPrintColorAdjust: 'exact',
          printColorAdjust: 'exact',
        }}
      >
        <svg
          viewBox="0 0 44 622"
          width="44"
          height="622"
          style={{ width: '44px', height: '622px', display: 'block' }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="44" height="622" fill="#5c6470" />
          <text
            x="-311"
            y="23"
            fill="#ffffff"
            fontFamily="Arial, Helvetica, sans-serif"
            fontSize="15"
            fontWeight="bold"
            letterSpacing="1.2"
            textAnchor="middle"
            dominantBaseline="central"
            transform="rotate(-90)"
            className="rectSize"
          >
            Padma Seshadri Bala Bhavan Senior Secondary School
          </text>
        </svg>
      </div>
    </div>
  )

  const fatherPhone = data.fatherMobile || data.fatherPhoneOffice || data.fatherPhoneOff || ''
  const motherPhone = data.motherMobile || data.motherPhoneOffice || data.motherPhoneOff || ''
  const guardianPhone = data.guardianMobile || data.guardianPhoneOffice || data.guardianPhoneOff || ''

  const fatherAddr = data.fatherAddress || data.fatherOfficeAddress || data.residentialAddress || ''
  const motherAddr = data.motherAddress || data.motherOfficeAddress || data.residentialAddress || ''
  const guardianAddr = data.guardianAddress || data.guardianOfficeAddress || data.residentialAddress || ''

  return (
    <div className="registration-form-document font-sans text-black bg-white select-none">
      {/* ================= PAGE 1: CHILD DETAILS, SIBLING TABLE & HEALTH DETAILS ================= */}
      <div className="print-page reg-form-page relative w-[210mm] min-h-[297mm] mx-auto bg-white flex box-border border border-slate-300 shadow-md print:border-none print:shadow-none print:m-0 break-after-page text-[11.5px] leading-snug p-0">
        <LeftVerticalSidebar />

        <div className="reg-form-content flex-1 flex flex-col justify-between p-6 print:p-6 min-w-0">
          <div>
            {/* Common Header on Page 1 */}
            <PrintDocumentHeader documentType="registration-form" student={data} />

            {/* Student Details Table */}
            <div className="mt-1 mb-2.5">
              <div className="border border-black overflow-hidden">
                <table className="w-full border-collapse text-[10.5px] leading-tight">
                  <tbody>
                    {/* Row 1: Registration No. & School Applied For */}
                    <tr className="border-b border-black">
                      <td className="w-[22%] px-2 py-1.5 font-bold border-r border-black bg-slate-50/60">
                        Registration No.
                      </td>
                      <td className="w-[28%] px-2 py-1.5 font-bold text-sm text-black border-r border-black">
                        {data.registrationNo}
                      </td>
                      <td className="w-[22%] px-2 py-1.5 font-bold border-r border-black bg-slate-50/60">
                        School Applied For
                      </td>
                      <td className="w-[28%] px-2 py-1.5 font-bold text-black uppercase">
                        {data.schoolAppliedFor}
                      </td>
                    </tr>

                    {/* Row 2: Name of the Child */}
                    <tr className="border-b border-black">
                      <td className="px-2 py-1.5 font-bold border-r border-black bg-slate-50/60">
                        Name of the Child
                      </td>
                      <td colSpan={3} className="px-2 py-1.5 font-bold uppercase text-black">
                        {data.childName}
                      </td>
                    </tr>

                    {/* Row 3: Date of Birth & Passport No. */}
                    <tr className="border-b border-black">
                      <td className="px-2 py-1.5 font-bold border-r border-black bg-slate-50/60">
                        Date of Birth
                      </td>
                      <td className="px-2 py-1.5 font-normal text-black border-r border-black">
                        {data.dob}
                      </td>
                      <td className="px-2 py-1.5 font-bold border-r border-black bg-slate-50/60">
                        Passport No.
                      </td>
                      <td className="px-2 py-1.5 font-normal text-black">
                        {data.passportNo || '-'}
                      </td>
                    </tr>

                    {/* Row 4: Mother Tongue & Religion */}
                    <tr className="border-b border-black">
                      <td className="px-2 py-1.5 font-bold border-r border-black bg-slate-50/60">
                        Mother Tongue
                      </td>
                      <td className="px-2 py-1.5 font-normal text-black border-r border-black">
                        {data.motherTongue}
                      </td>
                      <td className="px-2 py-1.5 font-bold border-r border-black bg-slate-50/60">
                        Religion
                      </td>
                      <td className="px-2 py-1.5 font-normal text-black">
                        {data.religion}
                      </td>
                    </tr>

                    {/* Row 5: Caste & Nationality */}
                    <tr className="border-b border-black">
                      <td className="px-2 py-1.5 font-bold border-r border-black bg-slate-50/60">
                        Caste
                      </td>
                      <td className="px-2 py-1.5 font-normal text-black border-r border-black">
                        {data.caste}
                      </td>
                      <td className="px-2 py-1.5 font-bold border-r border-black bg-slate-50/60">
                        Nationality
                      </td>
                      <td className="px-2 py-1.5 font-normal text-black">
                        {data.nationality}
                      </td>
                    </tr>

                    {/* Row 6: Gender & Community */}
                    <tr className="border-b border-black">
                      <td className="px-2 py-1.5 font-bold border-r border-black bg-slate-50/60">
                        Gender
                      </td>
                      <td className="px-2 py-1.5 font-normal text-black border-r border-black">
                        {data.gender}
                      </td>
                      <td className="px-2 py-1.5 font-bold border-r border-black bg-slate-50/60">
                        Community
                      </td>
                      <td className="px-2 py-1.5 font-normal text-black">
                        {data.community}
                      </td>
                    </tr>

                    {/* Row 7: Does the Child go to play school? & Play School Name */}
                    <tr className="border-b border-black">
                      <td className="px-2 py-1.5 font-bold border-r border-black bg-slate-50/60 leading-tight">
                        Does the Child go to play school?
                      </td>
                      <td className="px-2 py-1.5 font-normal text-black border-r border-black">
                        {data.goesToPlaySchool ? 'Yes' : 'No'}
                      </td>
                      <td className="px-2 py-1.5 font-bold border-r border-black bg-slate-50/60 leading-tight">
                        If yes, Play School Name
                      </td>
                      <td className="px-2 py-1.5 font-normal text-black break-words">
                        {data.playSchoolName || '-'}
                      </td>
                    </tr>

                    {/* Row 8: Is the child One of Twins/Triplets/Quadruplets? */}
                    <tr className="border-b border-black">
                      <td colSpan={3} className="px-2 py-1.5 font-bold border-r border-black bg-slate-50/60">
                        Is the child One of Twins/Triplets/Quadruplets?
                      </td>
                      <td className="px-2 py-1.5 font-normal text-black">
                        {data.isMultipleBirth ? 'Yes' : 'No'}
                      </td>
                    </tr>

                    {/* Row 9: Does the child have any school going Siblings? */}
                    <tr>
                      <td colSpan={3} className="px-2 py-1.5 font-bold border-r border-black bg-slate-50/60">
                        Does the child have any school going Siblings?
                      </td>
                      <td className="px-2 py-1.5 font-normal text-black">
                        {data.hasSchoolGoingSiblings ? 'Yes' : 'No'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sibling Table - Full Printable Page Width */}
            <table className="w-full border-collapse border border-black text-[10.5px] mt-2.5">
              <thead>
                <tr className="border-b border-black bg-slate-100/80">
                  <th className="border-r border-black p-1.5 font-bold text-center w-1/5">Name of the Sibling</th>
                  <th className="border-r border-black p-1.5 font-bold text-center w-1/5">Name of the School</th>
                  <th className="border-r border-black p-1.5 font-bold text-center w-1/6">USN</th>
                  <th className="border-r border-black p-1.5 font-bold text-center w-1/6">Class / Sec</th>
                  <th className="p-1.5 font-bold text-center w-1/4">Year&Class Of Leaving If Former/Left Student</th>
                </tr>
              </thead>
              <tbody>
                {siblingRows.map((sib, i) => (
                  <tr key={i} className="border-b border-black h-6">
                    <td className="border-r border-black p-1 text-center">{sib.name}</td>
                    <td className="border-r border-black p-1 text-center">{sib.school}</td>
                    <td className="border-r border-black p-1 text-center">{sib.usn}</td>
                    <td className="border-r border-black p-1 text-center">{sib.classSec}</td>
                    <td className="p-1 text-center">{sib.leavingYearAndClass}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Health Details Table */}
            <div className="mt-2.5">
              <div className="border border-black overflow-hidden">
                <table className="w-full border-collapse text-[10.5px] leading-tight">
                  <tbody>
                    <tr className="border-b border-black">
                      <td className="w-[72%] px-2 py-1.5 font-bold border-r border-black bg-slate-50/60 leading-tight">
                        Is the Child a normal and healthy Child
                      </td>
                      <td className="w-[28%] px-2 py-1.5 font-normal text-black">
                        {data.isNormalHealthyChild === 'Yes' ? 'Yes' : (data.isNormalHealthyChild || 'No')}
                      </td>
                    </tr>
                    <tr>
                      <td className="w-[72%] px-2 py-1.5 font-bold border-r border-black bg-slate-50/60 leading-tight">
                        Specify Major ailment, If any (Past/Present)
                      </td>
                      <td className="w-[28%] px-2 py-1.5 font-normal text-black break-words">
                        {data.majorAilment || 'Nil'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Footer on Page 1 */}
          <PrintDocumentFooter regNo={data.registrationNo} childName={data.childName} pageNumber={1} totalPages={3} />
        </div>
      </div>

      {/* ================= PAGE 2: PARENT & GUARDIAN DETAILS TABLE & COMPACT RESIDENCE DETAILS ================= */}
      <div className="print-page reg-form-page relative w-[210mm] min-h-[297mm] mx-auto bg-white flex box-border border border-slate-300 shadow-md print:border-none print:shadow-none print:m-0 break-after-page text-[11.5px] leading-snug p-0">
        <LeftVerticalSidebar />

        <div className="reg-form-content flex-1 flex flex-col justify-between p-6 print:p-6 min-w-0">
          <div>
            {/* Common Header on Page 2 */}
            <PrintDocumentHeader documentType="registration-form" student={data} />

            {/* ================= SINGLE COMBINED TABLE (3 COLUMNS FOR DETAILS) ================= */}
            <div className="mt-1">
              <div className="border-black pb-0.5 mb-1.5 text-[11.5px] font-bold uppercase tracking-wide text-black">
                Parent & Guardian Details
              </div>
              <div className="border border-black overflow-hidden mb-2.5">
                <table className="w-full border-collapse text-[10.5px] leading-tight">
                  <thead>
                    <tr className="border-b border-black bg-slate-100">
                      <th className="w-1/5 px-2 py-1 font-bold text-left border-r border-black bg-slate-200/80">
                        Field
                      </th>
                      <th className="w-[26.66%] px-2 py-1 font-bold text-left border-r border-black">
                        Father's Details
                      </th>
                      <th className="w-[26.66%] px-2 py-1 font-bold text-left border-r border-black">
                        Mother's Details
                      </th>
                      <th className="w-[26.66%] px-2 py-1 font-bold text-left">
                        Guardian's Details
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Row 1: Name */}
                    <tr className="border-b border-black">
                      <td className="px-2 py-1 font-bold border-r border-black bg-slate-50/60">
                        Name
                      </td>
                      <td className="px-2 py-1 font-normal uppercase text-black border-r border-black">
                        {data.fatherName || '-'}
                      </td>
                      <td className="px-2 py-1 font-normal uppercase text-black border-r border-black">
                        {data.motherName || '-'}
                      </td>
                      <td className="px-2 py-1 font-normal uppercase text-black">
                        {data.guardianName || '-'}
                      </td>
                    </tr>

                    {/* Row 2: DOB */}
                    <tr className="border-b border-black">
                      <td className="px-2 py-1 font-bold border-r border-black bg-slate-50/60">
                        DOB
                      </td>
                      <td className="px-2 py-1 font-normal text-black border-r border-black">
                        {data.fatherDob || '-'}
                      </td>
                      <td className="px-2 py-1 font-normal text-black border-r border-black">
                        {data.motherDob || '-'}
                      </td>
                      <td className="px-2 py-1 font-normal text-black">
                        {data.guardianDob || '-'}
                      </td>
                    </tr>

                    {/* Row 3: Relationship */}
                    <tr className="border-b border-black">
                      <td className="px-2 py-1 font-bold border-r border-black bg-slate-50/60">
                        Relationship
                      </td>
                      <td className="px-2 py-1 font-normal text-black border-r border-black">
                        Father
                      </td>
                      <td className="px-2 py-1 font-normal text-black border-r border-black">
                        Mother
                      </td>
                      <td className="px-2 py-1 font-normal text-black">
                        {data.guardianRelationship || '-'}
                      </td>
                    </tr>

                    {/* Row 4: Qualification */}
                    <tr className="border-b border-black">
                      <td className="px-2 py-1 font-bold border-r border-black bg-slate-50/60">
                        Qualification
                      </td>
                      <td className="px-2 py-1 font-normal text-black border-r border-black">
                        {data.fatherQualification || '-'}
                      </td>
                      <td className="px-2 py-1 font-normal text-black border-r border-black">
                        {data.motherQualification || '-'}
                      </td>
                      <td className="px-2 py-1 font-normal text-black">
                        -
                      </td>
                    </tr>

                    {/* Row 5: Occupation */}
                    <tr className="border-b border-black">
                      <td className="px-2 py-1 font-bold border-r border-black bg-slate-50/60">
                        Occupation
                      </td>
                      <td className="px-2 py-1 font-normal text-black border-r border-black">
                        {data.fatherOccupation || '-'}
                      </td>
                      <td className="px-2 py-1 font-normal text-black border-r border-black">
                        {data.motherOccupation || '-'}
                      </td>
                      <td className="px-2 py-1 font-normal text-black">
                        {data.guardianOccupation || '-'}
                      </td>
                    </tr>

                    {/* Row 6: Company Name */}
                    <tr className="border-b border-black">
                      <td className="px-2 py-1 font-bold border-r border-black bg-slate-50/60">
                        Company Name
                      </td>
                      <td className="px-2 py-1 font-normal text-black border-r border-black">
                        {data.fatherCompany || '-'}
                      </td>
                      <td className="px-2 py-1 font-normal text-black border-r border-black">
                        {data.motherCompany || '-'}
                      </td>
                      <td className="px-2 py-1 font-normal text-black">
                        {data.guardianCompany || '-'}
                      </td>
                    </tr>

                    {/* Row 7: Monthly Income */}
                    <tr className="border-b border-black">
                      <td className="px-2 py-1 font-bold border-r border-black bg-slate-50/60">
                        Monthly Income
                      </td>
                      <td className="px-2 py-1 font-normal text-black border-r border-black">
                        {data.fatherIncome || '-'}
                      </td>
                      <td className="px-2 py-1 font-normal text-black border-r border-black">
                        {data.motherIncome || '-'}
                      </td>
                      <td className="px-2 py-1 font-normal text-black">
                        {data.guardianIncome || data.guardianMonthlyIncome || '-'}
                      </td>
                    </tr>

                    {/* Row 8: Phone Number */}
                    <tr className="border-b border-black">
                      <td className="px-2 py-1 font-bold border-r border-black bg-slate-50/60">
                        Phone Number
                      </td>
                      <td className="px-2 py-1 font-normal text-black border-r border-black">
                        {fatherPhone || '-'}
                      </td>
                      <td className="px-2 py-1 font-normal text-black border-r border-black">
                        {motherPhone || '-'}
                      </td>
                      <td className="px-2 py-1 font-normal text-black">
                        {guardianPhone || '-'}
                      </td>
                    </tr>

                    {/* Row 9: Email */}
                    <tr className="border-b border-black">
                      <td className="px-2 py-1 font-bold border-r border-black bg-slate-50/60">
                        Email
                      </td>
                      <td className="px-2 py-1 font-normal text-black border-r border-black break-all">
                        {data.fatherEmail || '-'}
                      </td>
                      <td className="px-2 py-1 font-normal text-black border-r border-black break-all">
                        {data.motherEmail || '-'}
                      </td>
                      <td className="px-2 py-1 font-normal text-black break-all">
                        {data.guardianEmail || '-'}
                      </td>
                    </tr>

                    {/* Row 10: Address */}
                    <tr className="border-b border-black">
                      <td className="px-2 py-1.5 font-bold border-r border-black bg-slate-50/60 align-top">
                        Address
                      </td>
                      <td className="px-2 py-1.5 font-normal text-black border-r border-black leading-tight align-top break-words">
                        {fatherAddr || '-'}
                      </td>
                      <td className="px-2 py-1.5 font-normal text-black border-r border-black leading-tight align-top break-words">
                        {motherAddr || '-'}
                      </td>
                      <td className="px-2 py-1.5 font-normal text-black leading-tight align-top break-words">
                        {guardianAddr || '-'}
                      </td>
                    </tr>

                    {/* Row 11: Is Alumnus? */}
                    <tr>
                      <td className="px-2 py-1 font-bold border-r border-black bg-slate-50/60">
                        Is Alumnus?
                      </td>
                      <td className="px-2 py-1 font-normal text-black border-r border-black">
                        {data.fatherAlumnus ? 'Yes' : 'No'}
                      </td>
                      <td className="px-2 py-1 font-normal text-black border-r border-black">
                        {data.motherAlumnus ? 'Yes' : 'No'}
                      </td>
                      <td className="px-2 py-1 font-normal text-black">
                        -
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Additional Parent Details - Compact Multi-Column Layout */}
            <div className="mt-2.5">
              <div className="border border-black overflow-hidden mb-2.5">
                <table className="w-full border-collapse text-[10.5px] leading-tight">
                  <tbody>
                    {/* Row 1: Residence Telephone No & Distance from Residence */}
                    <tr className="border-b border-black">
                      <td className="w-[22%] px-2 py-1 font-bold border-r border-black bg-slate-50/60">
                        Residence Telephone No
                      </td>
                      <td className="w-[28%] px-2 py-1 font-normal text-black border-r border-black">
                        {data.residenceTelephone || '-'}
                      </td>
                      <td className="w-[22%] px-2 py-1 font-bold border-r border-black bg-slate-50/60">
                        Distance from Residence
                      </td>
                      <td className="w-[28%] px-2 py-1 font-normal text-black">
                        {data.distanceFromResidence || '-'}
                      </td>
                    </tr>

                    {/* Row 2: Residential Address & Mode of Transport */}
                    <tr className="border-b border-black">
                      <td className="px-2 py-1.5 font-bold border-r border-black bg-slate-50/60 align-top">
                        Residential Address
                      </td>
                      <td className="px-2 py-1.5 font-normal text-black border-r border-black align-top break-words">
                        {data.residentialAddress || '-'}
                      </td>
                      <td className="px-2 py-1.5 font-bold border-r border-black bg-slate-50/60 align-top">
                        Mode of Transport
                      </td>
                      <td className="px-2 py-1.5 font-normal text-black align-top">
                        {data.modeOfTransport || '-'}
                      </td>
                    </tr>

                    {/* Row 3: Important Landmark & Parent Transfer */}
                    <tr className="border-b border-black">
                      <td className="px-2 py-1.5 font-bold border-r border-black bg-slate-50/60 align-top">
                        Important Landmark
                      </td>
                      <td className="px-2 py-1.5 font-normal text-black border-r border-black align-top break-words">
                        {data.importantLandmark || data.landmark || '-'}
                      </td>
                      <td className="px-2 py-1.5 font-bold border-r border-black bg-slate-50/60 align-top">
                        Is Parent Transfer?
                      </td>
                      <td className="px-2 py-1.5 font-normal text-black align-top">
                        {data.isComingOnTransfer || (data.isTransferParent ? 'Yes' : 'No')}
                      </td>
                    </tr>

                    {/* Row 4: Outstanding Achievements of Parents (Spans full width for long content) */}
                    <tr>
                      <td className="px-2 py-1.5 font-bold border-r border-black bg-slate-50/60 align-top">
                        Outstanding Achievements of Parents
                      </td>
                      <td colSpan={3} className="px-2 py-1.5 font-normal text-black align-top break-words">
                        {data.parentAchievements || '-'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Declaration Paragraph */}
            <div className="mt-3 text-[10.5px] leading-relaxed text-justify border border-black p-2.5 bg-slate-50/30">
              <p>
                We, the parents (father &amp; mother)/guardian of{' '}
                <span className="underline font-bold uppercase inline-block min-w-[140px] text-center">
                  {data.childName}
                </span>{' '}
                seeking his / her admission to Pre KG hereby solemnly declare that the information
                furnished above is absolutely true and that if found factually wrong at any time after
                the admission during his / her stay in school, We shall abide by the orders of the
                school for withdrawal of our son/ daughter/ward without any plea or protest. We also
                understand and accept that submission of online registration form and track sheet does
                not guarantee admission.
              </p>
            </div>

            {/* Signature Section - Dedicated Writing Height */}
            <div className="mt-6 pt-1">
              <div className="flex justify-between items-start text-[11px] min-h-[80px] pt-12">
                <div className="pt-1.5 font-bold shrink-0">
                  Date :&nbsp;&nbsp;
                  <span className="inline-block border-b border-black w-32">&nbsp;</span>
                </div>
                <div className="text-center font-bold">
                  <div className="border-t border-black pt-1.5 px-4 min-w-[230px]">
                    Signature of the Parent / Guardian
                  </div>
                </div>
              </div>

              {/* Name in BLOCK LETTER */}
              <div className="mt-3.5 text-[11px] font-bold flex items-center">
                <span className="shrink-0">Name in BLOCK LETTER :&nbsp;&nbsp;</span>
                <span className="flex-1 border-b border-black">&nbsp;</span>
              </div>
            </div>
          </div>

          {/* Footer on Page 2 */}
          <PrintDocumentFooter regNo={data.registrationNo} childName={data.childName} pageNumber={2} totalPages={3} />
        </div>
      </div>

      {/* ================= PAGE 3: INSTRUCTION & DOCUMENT CHECKLIST ================= */}
      <div className="print-page reg-form-page relative w-[210mm] min-h-[297mm] mx-auto bg-white flex box-border border border-slate-300 shadow-md print:border-none print:shadow-none print:m-0 text-[11.5px] leading-snug p-0">
        <LeftVerticalSidebar />

        <div className="reg-form-content flex-1 flex flex-col justify-between p-6 print:p-6 min-w-0">
          <div>
            {/* Common Header on Page 3 */}
            <PrintDocumentHeader documentType="registration-form" student={data} />

            {/* Instruction & Document Checklist */}
            <div className="mt-6 text-[10.5px] leading-tight space-y-2">
              <p className="font-bold text-[12px] uppercase tracking-wide text-black">Instruction :</p>
              <ul className="space-y-1.5 list-disc pl-4 text-slate-900">
                <li>Forms with False/ Incomplete/Vague information will not be considered.</li>
                <li>Submit the Track Sheet signed by both parents (to the school office of the branch applied for)</li>
                <li>
                  Documents to be submitted in person by the parent only (with authorization letter from parent, if guardian):
                  <div className="mt-1 space-y-1 pl-3 font-normal">
                    <p>
                      1. Track sheet signed by BOTH parents/guardian with recent photo of the child duly affixed
                      <span className="pl-1.5">(please mention Reg No. at the back of the photo)</span>
                    </p>
                    <p>2. Birth Certificate of Child - COPY</p>
                    <p>3. Passport size photographs of both parents with Reg No. written at the back.</p>
                    <p>4. Address proof of parents - COPY</p>
                  </div>
                </li>
                <li>
                  Documents to be brought for verification:
                  <div className="mt-1 space-y-1 pl-3 font-normal">
                    <p>1. Birth Certificate of Child - ORIGINAL</p>
                    <p>2. Proof of Address of both Parents – ORIGINAL</p>
                    <p>3. Photo ID of both parents - ORIGINAL</p>
                  </div>
                </li>
                <li>Rs.500/- to be remitted through Debit/Credit card ONLY towards processing fee.</li>
              </ul>
            </div>
          </div>

          {/* Footer on Page 3 */}
          <PrintDocumentFooter regNo={data.registrationNo} childName={data.childName} pageNumber={3} totalPages={3} />
        </div>
      </div>
    </div>
  )
}

export default RegistrationForm5Print
