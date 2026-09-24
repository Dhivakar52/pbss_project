import React from 'react'
import { PrintDocumentHeader } from './PrintDocumentHeader'
import { PrintDocumentFooter } from './PrintDocumentFooter'
import type { RegistrationFormData } from './printMappers'

export interface RegistrationForm4PrintProps {
  data: RegistrationFormData
}

export const RegistrationForm4Print: React.FC<RegistrationForm4PrintProps> = ({ data }) => {
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

            {/* Top Registration No & School Applied For */}
            <div className="flex justify-between items-center mt-1 mb-2">
              <div className="flex items-center">
                <span className="w-36 font-bold">Registration No.</span>
                <span className="w-6 font-bold">:</span>
                <span className="inline-block border border-black px-4 py-0.5 font-bold text-sm min-w-[140px] text-center">
                  {data.registrationNo}
                </span>
              </div>
              <div className="flex items-center">
                <span className="font-bold">School Applied For :</span>
                <span className="font-bold ml-2 uppercase">{data.schoolAppliedFor}</span>
              </div>
            </div>

            {/* Child Details */}
            <div className="space-y-2.5">
              <div className="flex items-start">
                <span className="w-48 font-bold">Name of the Child</span>
                <span className="w-6 font-bold">:</span>
                <span className="font-normal uppercase">{data.childName}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <span className="w-48 font-bold">Date of Birth</span>
                  <span className="w-6 font-bold">:</span>
                  <span className="font-normal">{data.dob}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-28 font-bold">Passport No :</span>
                  <span className="font-normal ml-2">{data.passportNo || ''}</span>
                </div>
              </div>

              <div className="flex items-center">
                <span className="w-48 font-bold">Mother Tongue</span>
                <span className="w-6 font-bold">:</span>
                <span className="font-normal">{data.motherTongue}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <span className="w-48 font-bold">Religion</span>
                  <span className="w-6 font-bold">:</span>
                  <span className="font-normal">{data.religion}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-28 font-bold">Caste :</span>
                  <span className="font-normal ml-2">{data.caste}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <span className="w-48 font-bold">Nationality</span>
                  <span className="w-6 font-bold">:</span>
                  <span className="font-normal">{data.nationality}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-28 font-bold">Gender :</span>
                  <span className="font-normal ml-2">{data.gender}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <span className="w-48 font-bold">Community</span>
                  <span className="w-6 font-bold">:</span>
                  <span className="font-normal">{data.community}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-48 font-bold leading-tight">Does the Child go to any play school?</span>
                  <span className="w-6 font-bold">:</span>
                  <span className="font-normal">{data.goesToPlaySchool ? 'Yes' : 'No'}</span>
                </div>
              </div>

              <div className="flex items-start">
                <span className="w-48 font-bold leading-tight">If yes, Play School Name</span>
                <span className="w-6 font-bold">:</span>
                <span className="font-normal">{data.playSchoolName || ''}</span>
              </div>

              <div className="flex items-center">
                <span className="w-80 font-bold">Is the child One of Twins/Triplets/Quadruplets</span>
                <span className="w-6 font-bold">:</span>
                <span className="font-normal">{data.isMultipleBirth ? 'Yes' : 'No'}</span>
              </div>

              <div className="flex items-center">
                <span className="w-80 font-bold">Does the child have any school going Siblings?</span>
                <span className="w-6 font-bold">:</span>
                <span className="font-normal">{data.hasSchoolGoingSiblings ? 'Yes' : 'No'}</span>
              </div>
            </div>

            {/* Sibling Table */}
            <table className="w-full border-collapse border border-black text-[10.5px] mt-2.5">
              <thead>
                <tr className="border-b border-black">
                  <th className="border-r border-black p-1 font-bold text-center w-1/5">Name of the Sibling</th>
                  <th className="border-r border-black p-1 font-bold text-center w-1/5">Name of the School</th>
                  <th className="border-r border-black p-1 font-bold text-center w-1/6">USN</th>
                  <th className="border-r border-black p-1 font-bold text-center w-1/6">Class / Sec</th>
                  <th className="p-1 font-bold text-center w-1/4">Year&Class Of Leaving If Former/Left Student</th>
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

            {/* Health Details */}
            <div className="space-y-2 mt-2.5">
              <div className="flex items-center">
                <span className="w-64 font-bold">Is the Child a normal and healthy Child</span>
                <span className="w-6 font-bold">:</span>
                <span className="font-normal">{data.isNormalHealthyChild ? 'Yes' : 'No'}</span>
              </div>

              <div className="flex items-start">
                <span className="w-64 font-bold leading-tight">Specify Major ailment, If any (Past/Present) :</span>
                <span className="font-normal ml-2">{data.majorAilment || 'Nil'}</span>
              </div>
            </div>
          </div>

          {/* Footer on Page 1 */}
          <PrintDocumentFooter regNo={data.registrationNo} childName={data.childName} pageNumber={1} totalPages={2} />
        </div>
      </div>

      {/* ================= PAGE 2: PARENT & GUARDIAN DETAILS TABLE, RESIDENCE DETAILS, DECLARATION & SIGNATURES ================= */}
      <div className="print-page reg-form-page relative w-[210mm] min-h-[297mm] mx-auto bg-white flex box-border border border-slate-300 shadow-md print:border-none print:shadow-none print:m-0 text-[11.5px] leading-snug p-0">
        <LeftVerticalSidebar />

        <div className="reg-form-content flex-1 flex flex-col justify-between p-6 print:p-6 min-w-0">
          <div>
            {/* Common Header on Page 2 */}
            <PrintDocumentHeader documentType="registration-form" student={data} />

            {/* ================= SINGLE COMBINED TABLE (3 COLUMNS FOR DETAILS) ================= */}
            <div className="mt-1">
              <div className="border-b border-black pb-0.5 mb-1.5 text-[11.5px] font-bold uppercase tracking-wide text-black">
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

            {/* Additional Parent Details - Compact Inline Layout (No Table) */}
            <div className="space-y-1.5 mt-2 pt-2 border-t border-slate-200 text-[11px] leading-tight">
              <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                <div className="flex items-start">
                  <span className="font-bold shrink-0">Residence Telephone No :</span>
                  <span className="font-normal ml-2">{data.residenceTelephone || '-'}</span>
                </div>
                <div className="flex items-start">
                  <span className="font-bold shrink-0">Distance from Residence :</span>
                  <span className="font-normal ml-2">{data.distanceFromResidence || '-'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                <div className="flex items-start">
                  <span className="font-bold shrink-0">Residential Address :</span>
                  <span className="font-normal ml-2 break-words">{data.residentialAddress || '-'}</span>
                </div>
                <div className="flex items-start">
                  <span className="font-bold shrink-0">Mode of Transport :</span>
                  <span className="font-normal ml-2">{data.modeOfTransport || '-'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                <div className="flex items-start">
                  <span className="font-bold shrink-0">Important Landmark :</span>
                  <span className="font-normal ml-2 break-words">{data.importantLandmark || data.landmark || '-'}</span>
                </div>
                <div className="flex items-start">
                  <span className="font-bold shrink-0">Parent Transfer :</span>
                  <span className="font-normal ml-2">{data.isComingOnTransfer || (data.isTransferParent ? 'Yes' : 'No')}</span>
                </div>
              </div>

              <div className="flex items-start">
                <span className="font-bold shrink-0">Outstanding Achievements of Parents :</span>
                <span className="font-normal ml-2 break-words">{data.parentAchievements || '-'}</span>
              </div>
            </div>

            {/* Declaration Paragraph */}
            <div className="mt-2.5 text-[10.5px] leading-tight text-justify pt-1.5 border-t border-slate-200">
              <p>
                We, the parents (father & mother)/guardian of{' '}
                <span className="underline font-bold uppercase inline-block min-w-[160px] text-center">
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

            {/* Date and Parent Signature - Dedicated Writing Height */}
            <div className="mt-5 pt-1">
              <div className="flex justify-between items-start text-[11px] min-h-[75px] pt-11">
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
              <div className="mt-3 text-[11px] font-bold flex items-center">
                <span className="shrink-0">Name in BLOCK LETTER :&nbsp;&nbsp;</span>
                <span className="flex-1 border-b border-black max-w-[260px]">&nbsp;</span>
              </div>
            </div>

            {/* Note & Document Checklist */}
            <div className="mt-3 text-[10px] leading-tight space-y-1 border-t border-slate-200 pt-2">
              <p className="font-bold text-[10.5px]">Instruction :</p>
              <ul className="space-y-0.5 list-disc pl-4">
                <li>Forms with False/ Incomplete/Vague information will not be considered.</li>
                <li>Submit the Track Sheet signed by both parents (to the school office of the branch applied for)</li>
                <li>
                  Documents to be submitted in person by the parent only (with authorization letter from parent, if guardian):
                  <div className="mt-0.5 space-y-0.5 pl-3">
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
                  <div className="mt-0.5 space-y-0.5 pl-3">
                    <p>1. Birth Certificate of Child - ORIGINAL</p>
                    <p>2. Proof of Address of both Parents – ORIGINAL</p>
                    <p>3. Photo ID of both parents - ORIGINAL</p>
                  </div>
                </li>
                <li>Rs.500/- to be remitted through Debit/Credit card ONLY towards processing fee.</li>
              </ul>
            </div>
          </div>

          {/* Footer on Page 2 */}
          <PrintDocumentFooter regNo={data.registrationNo} childName={data.childName} pageNumber={2} totalPages={2} />
        </div>
      </div>
    </div>
  )
}

export default RegistrationForm4Print
