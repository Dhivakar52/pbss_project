import React from 'react'
import { PrintDocumentHeader } from './PrintDocumentHeader'
import { PrintDocumentFooter } from './PrintDocumentFooter'
import type { TrackSheetData, RegistrationFormData } from './printMappers'

export interface TrackSheet2PrintProps {
  data: TrackSheetData | RegistrationFormData
}

export const TrackSheet2Print: React.FC<TrackSheet2PrintProps> = ({ data }) => {
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

  // Cast data to access optional extended properties safely
  const regData = data as RegistrationFormData

  const fatherMobile = data.fatherMobile || ''
  const motherMobile = data.motherMobile || ''
  const guardianMobile = regData.guardianMobile || ''

  return (
    <div className="track-sheet-2-document font-sans text-black bg-white select-none">
      {/* ================= PAGE 1 ================= */}
      <div className="print-page w-[210mm] min-h-[297mm] p-8 mx-auto bg-white flex flex-col justify-between box-border border border-slate-300 shadow-md print:border-none print:shadow-none print:p-6 print:m-0 break-after-page text-[12.5px] leading-relaxed">
        <div>
          {/* Header */}
          <PrintDocumentHeader documentType="track-sheet" student={data} />

          {/* Top Section with Registration & Photo Box */}
          <div className="flex justify-between items-start gap-4 mt-1">
            <div className="space-y-2 flex-1">
              <div className="flex items-center">
                <span className="w-44 font-bold">Registration No.</span>
                <span className="w-6 font-bold">:</span>
                <span className="inline-block border border-black px-4 py-0.5 font-bold text-sm min-w-[140px] text-center">
                  {data.registrationNo}
                </span>
              </div>

              <div className="flex items-start">
                <span className="w-44 font-bold">Name of the Child</span>
                <span className="w-6 font-bold">:</span>
                <span className="font-normal uppercase">{data.childName}</span>
              </div>

              <div className="flex items-center">
                <div className="flex items-center w-[320px]">
                  <span className="w-44 font-bold">Date of Birth</span>
                  <span className="w-6 font-bold">:</span>
                  <span className="font-normal">{data.dob}</span>
                </div>
                <div className="flex items-center pl-8">
                  <span className="w-20 font-bold">Gender</span>
                  <span className="w-6 font-bold">:</span>
                  <span className="font-normal">{data.gender}</span>
                </div>
              </div>

              <div className="flex items-center">
                <span className="w-44 font-bold">Mother Tongue</span>
                <span className="w-6 font-bold">:</span>
                <span className="font-normal">{data.motherTongue}</span>
              </div>

              <div className="flex items-center">
                <div className="flex items-center w-[320px]">
                  <span className="w-44 font-bold">Religion</span>
                  <span className="w-6 font-bold">:</span>
                  <span className="font-normal">{data.religion}</span>
                </div>
                <div className="flex items-center pl-8">
                  <span className="w-20 font-bold">Caste</span>
                  <span className="w-6 font-bold">:</span>
                  <span className="font-normal">{data.caste}</span>
                </div>
              </div>

              <div className="flex items-start">
                <span className="w-44 font-bold shrink-0">Residential Address</span>
                <span className="w-6 font-bold shrink-0">:</span>
                <span className="font-normal leading-snug">{data.residentialAddress}</span>
              </div>
            </div>

            {/* Applicant Photo Box */}
            <div className="w-[130px] h-[155px] border border-black flex flex-col items-center justify-center p-2 text-center shrink-0">
              <span className="text-[10.5px] text-black font-bold leading-tight">
                Affix latest Passport size photo of the applicant with Reg No. at the back.
              </span>
            </div>
          </div>

          {/* Contact & Transport Details */}
          <div className="space-y-1.5 mt-2.5">
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center">
                <span className="w-44 font-bold">Father's Mobile No</span>
                <span className="w-6 font-bold">:</span>
                <span className="font-normal">{fatherMobile}</span>
              </div>
              <div className="flex items-center">
                <span className="w-44 font-bold">Mother's Mobile No :</span>
                <span className="font-normal ml-2">{motherMobile}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center">
                <span className="w-44 font-bold">Distance from Residence</span>
                <span className="w-6 font-bold">:</span>
                <span className="font-normal">{data.distanceFromResidence}</span>
              </div>
              <div className="flex items-center">
                <span className="w-44 font-bold">Mode of Transport:</span>
                <span className="font-normal ml-2">{data.modeOfTransport}</span>
              </div>
            </div>
          </div>

          {/* Sibling Details Section */}
          <div className="mt-3 space-y-1">
            <div className="flex items-center">
              <span className="font-bold">Does the child have any school going Siblings?</span>
              <span className="font-bold mx-2">:</span>
              <span className="font-normal">{data.hasSchoolGoingSiblings ? 'Yes' : 'No'}</span>
            </div>

            {/* Sibling Table */}
            <table className="w-full border-collapse border border-black text-[11px] mt-1">
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
          </div>

          {/* ================= ONE CONTINUOUS PARENT DETAILS TABLE (FORM 5 DESIGN) ================= */}
          <div className="mt-3">
            <div className="border-b border-black pb-0.5 mb-1 text-[11.5px] font-bold uppercase tracking-wide text-black">
              Parent Details
            </div>
            <div className="border border-black overflow-hidden">
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
                    <td className="px-2 py-1 font-normal uppercase text-black border-r border-black break-words">
                      {data.fatherName || '-'}
                    </td>
                    <td className="px-2 py-1 font-normal uppercase text-black border-r border-black break-words">
                      {data.motherName || '-'}
                    </td>
                    <td className="px-2 py-1 font-normal uppercase text-black break-words">
                      {regData.guardianName || '-'}
                    </td>
                  </tr>

                  {/* Row 2: Qualification */}
                  <tr className="border-b border-black">
                    <td className="px-2 py-1 font-bold border-r border-black bg-slate-50/60">
                      Qualification
                    </td>
                    <td className="px-2 py-1 font-normal text-black border-r border-black break-words">
                      {data.fatherQualification || '-'}
                    </td>
                    <td className="px-2 py-1 font-normal text-black border-r border-black break-words">
                      {data.motherQualification || '-'}
                    </td>
                    <td className="px-2 py-1 font-normal text-black break-words">
                      -
                    </td>
                  </tr>

                  {/* Row 3: Designation / Occupation */}
                  <tr className="border-b border-black">
                    <td className="px-2 py-1 font-bold border-r border-black bg-slate-50/60">
                      Designation
                    </td>
                    <td className="px-2 py-1 font-normal text-black border-r border-black break-words">
                      {data.fatherDesignation || '-'}
                    </td>
                    <td className="px-2 py-1 font-normal text-black border-r border-black break-words">
                      {data.motherDesignation || '-'}
                    </td>
                    <td className="px-2 py-1 font-normal text-black break-words">
                      {regData.guardianOccupation || '-'}
                    </td>
                  </tr>

                  {/* Row 4: Income */}
                  <tr className="border-b border-black">
                    <td className="px-2 py-1 font-bold border-r border-black bg-slate-50/60">
                      Income
                    </td>
                    <td className="px-2 py-1 font-normal text-black border-r border-black break-words">
                      {data.fatherIncome || '-'}
                    </td>
                    <td className="px-2 py-1 font-normal text-black border-r border-black break-words">
                      {data.motherIncome || '-'}
                    </td>
                    <td className="px-2 py-1 font-normal text-black break-words">
                      {regData.guardianIncome || regData.guardianMonthlyIncome || '-'}
                    </td>
                  </tr>

                  {/* Row 5: Mobile No */}
                  <tr className="border-b border-black">
                    <td className="px-2 py-1 font-bold border-r border-black bg-slate-50/60">
                      Mobile No
                    </td>
                    <td className="px-2 py-1 font-normal text-black border-r border-black break-words">
                      {fatherMobile || '-'}
                    </td>
                    <td className="px-2 py-1 font-normal text-black border-r border-black break-words">
                      {motherMobile || '-'}
                    </td>
                    <td className="px-2 py-1 font-normal text-black break-words">
                      {guardianMobile || '-'}
                    </td>
                  </tr>

                  {/* Row 6: Is Alumnus? */}
                  <tr className="border-b border-black">
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

                  {/* Row 7: Year of Passing/ Leaving */}
                  <tr className="border-b border-black">
                    <td className="px-2 py-1 font-bold border-r border-black bg-slate-50/60">
                      Year of Passing / Leaving
                    </td>
                    <td className="px-2 py-1 font-normal text-black border-r border-black break-words">
                      {data.fatherPassingYear || '-'}
                    </td>
                    <td className="px-2 py-1 font-normal text-black border-r border-black break-words">
                      {data.motherPassingYear || '-'}
                    </td>
                    <td className="px-2 py-1 font-normal text-black break-words">
                      -
                    </td>
                  </tr>

                  {/* Row 8: No of Years Studied */}
                  <tr className="border-b border-black">
                    <td className="px-2 py-1 font-bold border-r border-black bg-slate-50/60">
                      No of Years Studied
                    </td>
                    <td className="px-2 py-1 font-normal text-black border-r border-black break-words">
                      {data.fatherYearsStudied || '-'}
                    </td>
                    <td className="px-2 py-1 font-normal text-black border-r border-black break-words">
                      {data.motherYearsStudied || '-'}
                    </td>
                    <td className="px-2 py-1 font-normal text-black break-words">
                      -
                    </td>
                  </tr>

                  {/* Row 9: Class Last Studied */}
                  <tr className="border-b border-black">
                    <td className="px-2 py-1 font-bold border-r border-black bg-slate-50/60">
                      Class Last Studied
                    </td>
                    <td className="px-2 py-1 font-normal text-black border-r border-black break-words">
                      {data.fatherClassLastStudied || '-'}
                    </td>
                    <td className="px-2 py-1 font-normal text-black border-r border-black break-words">
                      {data.motherClassLastStudied || '-'}
                    </td>
                    <td className="px-2 py-1 font-normal text-black break-words">
                      -
                    </td>
                  </tr>

                  {/* Row 10: Branch */}
                  <tr className="border-b border-black">
                    <td className="px-2 py-1 font-bold border-r border-black bg-slate-50/60">
                      Branch
                    </td>
                    <td className="px-2 py-1 font-normal text-black border-r border-black break-words">
                      {data.fatherBranch || '-'}
                    </td>
                    <td className="px-2 py-1 font-normal text-black border-r border-black break-words">
                      {data.motherBranch || '-'}
                    </td>
                    <td className="px-2 py-1 font-normal text-black break-words">
                      -
                    </td>
                  </tr>

                  {/* Row 11: Reason for Leaving */}
                  <tr className="border-b border-black">
                    <td className="px-2 py-1 font-bold border-r border-black bg-slate-50/60">
                      Reason for Leaving
                    </td>
                    <td className="px-2 py-1 font-normal text-black border-r border-black break-words">
                      {data.fatherReasonLeaving || '-'}
                    </td>
                    <td className="px-2 py-1 font-normal text-black border-r border-black break-words">
                      {data.motherReasonLeaving || '-'}
                    </td>
                    <td className="px-2 py-1 font-normal text-black break-words">
                      -
                    </td>
                  </tr>

                  {/* Row 12: Photo Instructions Aligned Inside Continuous Table */}
                  <tr>
                    <td className="px-2 py-1 font-bold border-r border-black bg-slate-50/60 align-middle">
                      Photo Instructions
                    </td>
                    <td className="px-2 py-1 font-normal text-[9.5px] leading-tight text-black border-r border-black align-middle">
                      Affix latest Passport size photo of Father with Reg No. at back.
                    </td>
                    <td className="px-2 py-1 font-normal text-[9.5px] leading-tight text-black border-r border-black align-middle">
                      Affix latest Passport size photo of Mother with Reg No. at back.
                    </td>
                    <td className="px-2 py-1 font-normal text-[9.5px] leading-tight text-black align-middle">
                      Affix latest Passport size photo of Guardian (if applicable) with Reg No. at back.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer Page 1 */}
        <PrintDocumentFooter regNo={data.registrationNo} childName={data.childName} pageNumber={1} totalPages={3} />
      </div>

      {/* ================= PAGE 2 ================= */}
      <div className="print-page w-[210mm] min-h-[297mm] p-8 mx-auto bg-white flex flex-col justify-between box-border border border-slate-300 shadow-md print:border-none print:shadow-none print:m-0 break-after-page text-[12px] leading-relaxed">
        <div>
          {/* Common Header on Page 2 */}
          <PrintDocumentHeader documentType="track-sheet" student={data} />

          {/* Child Health Status */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center">
              <span className="w-60 font-bold leading-tight">
                Is the child a normal healthy child
              </span>
              <span className="w-6 font-bold">:</span>
              <span className="font-normal">{data.isNormalHealthyChild ? 'Yes' : 'No'}</span>
            </div>

            <div className="flex items-start">
              <span className="w-60 font-bold leading-tight">
                Specify Major ailment, If any (Past/Present)
              </span>
              <span className="w-6 font-bold">:</span>
              <span className="font-normal">{data.majorAilment || 'Nil'}</span>
            </div>
          </div>

          {/* Three Photo Boxes */}
          <div className="mt-5 flex justify-center items-center gap-5">
            <div className="w-[130px] h-[150px] border border-black flex flex-col items-center justify-center p-2 text-center">
              <span className="text-[10px] font-bold leading-tight">
                Affix latest Passport size photo of the Guardian<br />(if applicable)<br />with Reg No. at the back.
              </span>
            </div>

            <div className="w-[130px] h-[150px] border border-black flex flex-col items-center justify-center p-2 text-center">
              <span className="text-[10px] font-bold leading-tight">
                Affix latest Passport size photo of the Father<br />with Reg No. at the back.
              </span>
            </div>

            <div className="w-[130px] h-[150px] border border-black flex flex-col items-center justify-center p-2 text-center">
              <span className="text-[10px] font-bold leading-tight">
                Affix latest Passport size photo of the Mother<br />with Reg No. at the back.
              </span>
            </div>
          </div>

          {/* Declaration */}
          <div className="mt-5 text-[11.5px] leading-relaxed text-justify">
            <p>
              We, the parents (father & mother) / guardian of{' '}
              <span className="underline font-bold uppercase inline-block min-w-[180px] text-center">
                {data.childName}
              </span>{' '}
              seeking his / her admission to Pre-KG hereby solemnly declare that the information
              furnished above is absolutely true and that if found factually incorrect at any time
              after the admission during his / her stay in school, We shall abide by the orders of the
              school for withdrawal of our son/daughter/ward without any plea or protest. We also
              understand and accept that submission of online registration form and track sheet does
              not guarantee admission.
            </p>
          </div>

          {/* Signatures Row */}
          <div className="mt-5">
            <div className="flex justify-between items-center text-[12px] font-bold">
              <div>Date :</div>
              <div>Signature of Father</div>
              <div>Signature of Mother</div>
              <div className="text-center">
                Signature of Guardian<br />
                <span className="text-[10px] font-normal">(If Applicable)</span>
              </div>
            </div>

            <div className="mt-4 text-[11.5px]">
              <span className="font-bold">Name in BLOCK LETTER :</span>
            </div>
          </div>

          {/* Bottom Submission Box containing Date of Submission, Timings, Reg No., Child's Name */}
          <div className="mt-4 border border-black p-3 text-[12.5px] select-none text-black">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center">
                  <span className="w-40 font-bold">Date of Submission</span>
                  <span className="w-6 font-bold">:</span>
                  <span className="font-normal">{data.dateOfSubmission || ''}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-40 font-bold">Timings</span>
                  <span className="w-6 font-bold">:</span>
                  <span className="font-normal">{data.timings || data.submissionTimings || ''}</span>
                </div>
              </div>
              <div className="space-y-2 pl-6">
                <div className="flex items-center">
                  <span className="w-28 font-bold">Reg No.</span>
                  <span className="w-6 font-bold">:</span>
                  <span className="font-normal">{data.registrationNo}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-28 font-bold">Child's Name</span>
                  <span className="w-6 font-bold">:</span>
                  <span className="font-normal uppercase" title={data.childName}>
                    {data.childName.trim().length > 18
                      ? `${data.childName.trim().slice(0, 18)}...`
                      : data.childName.trim()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Page 2 */}
        <PrintDocumentFooter regNo={data.registrationNo} childName={data.childName} pageNumber={2} totalPages={3} />
      </div>

      {/* ================= PAGE 3 ================= */}
      <div className="print-page w-[210mm] min-h-[297mm] p-8 mx-auto bg-white flex flex-col justify-between box-border border border-slate-300 shadow-md print:border-none print:shadow-none print:m-0 break-after-page text-[12.5px] leading-relaxed">
        <div>
          {/* Common Header on Page 3 */}
          <PrintDocumentHeader documentType="track-sheet" student={data} />

          <div className="space-y-4 pt-4 px-2">
            <h3 className="font-bold text-[14px]">Note:</h3>

            <ul className="space-y-3 list-disc pl-5">
              <li>
                Forms with False/ Incomplete/Vague information will not be considered.
              </li>
              <li>
                Submit the Track Sheet signed by both parents (to the school office of the branch applied for)
              </li>
              <li>
                Documents to be submitted in person by the parent only (with authorization letter from parent, if guardian):
                <div className="mt-2 space-y-2 pl-4">
                  <p>
                    1. Track sheet signed by BOTH parents/guardian with recent photo of the child duly affixed<br />
                    <span className="pl-4">(please mention Reg No. at the back of the photo)</span>
                  </p>
                  <p>2. Birth Certificate of Child - COPY</p>
                  <p>3. Passport size photographs of both parents with Reg No. written at the back.</p>
                  <p>4. Address proof of parents - COPY</p>
                </div>
              </li>
              <li>
                Documents to be brought for verification:
                <div className="mt-2 space-y-2 pl-4">
                  <p>1. Birth Certificate of Child - ORIGINAL</p>
                  <p>2. Proof of Address of both Parents – ORIGINAL</p>
                  <p>3. Photo ID of both parents - ORIGINAL</p>
                </div>
              </li>
              <li>
                Rs.500/- to be remitted through Debit/Credit card ONLY towards processing fee.
              </li>
            </ul>
          </div>
        </div>

        {/* Common Footer on Page 3 */}
        <PrintDocumentFooter regNo={data.registrationNo} childName={data.childName} pageNumber={3} totalPages={3} />
      </div>
    </div>
  )
}

export default TrackSheet2Print
