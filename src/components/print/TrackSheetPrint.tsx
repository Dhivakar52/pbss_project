import React from 'react'
import { PrintDocumentHeader } from './PrintDocumentHeader'
import { PrintDocumentFooter } from './PrintDocumentFooter'
import { PrintField } from './PrintField'
import type { TrackSheetData } from './printMappers'

export interface TrackSheetPrintProps {
  data: TrackSheetData
}

export const TrackSheetPrint: React.FC<TrackSheetPrintProps> = ({ data }) => {
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

  return (
    <div className="track-sheet-document font-sans text-black bg-white select-none">
      {/* ================= PAGE 1 ================= */}
      <div className="print-page w-[210mm] min-h-[297mm] p-8 mx-auto bg-white flex flex-col justify-between box-border border border-slate-300 shadow-md print:border-none print:shadow-none print:p-6 print:m-0 break-after-page text-[12.5px] leading-relaxed">
        <div>
          {/* Header */}
          <PrintDocumentHeader documentType="track-sheet" student={data} />

          {/* Top Section with Registration & Photo Box */}
          <div className="flex justify-between items-start gap-4 mt-1">
            <div className="space-y-2.5 flex-1">
              <PrintField
                label="Registration No."
                value={
                  <span className="inline-block border border-black px-4 py-0.5 font-bold text-sm min-w-[140px] text-center">
                    {data.registrationNo}
                  </span>
                }
              />

              <PrintField
                label="Name of the Child"
                value={<span className="uppercase">{data.childName}</span>}
              />

              <div className="grid grid-cols-2 gap-4">
                <PrintField label="Date of Birth" value={data.dob} />
                <PrintField label="Gender" value={data.gender} />
              </div>

              <PrintField label="Mother Tongue" value={data.motherTongue} />

              <div className="grid grid-cols-2 gap-4">
                <PrintField label="Religion" value={data.religion} />
                <PrintField label="Caste" value={data.caste} />
              </div>

              <PrintField
                label="Residential Address"
                value={data.residentialAddress}
              />
            </div>

            {/* Applicant Photo Box */}
            <div className="w-[130px] h-[155px] border border-black flex flex-col items-center justify-center p-2 text-center shrink-0">
              <span className="text-[10.5px] text-black font-bold leading-tight">
                Affix latest Passport size photo of the applicant with Reg No. at the back.
              </span>
            </div>
          </div>

          {/* Contact & Transport Details */}
          <div className="space-y-2 mt-3">
            <div className="grid grid-cols-2 gap-6">
              <PrintField label="Father's Mobile No" value={data.fatherMobile} />
              <PrintField label="Mother's Mobile No" value={data.motherMobile} />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <PrintField label="Distance from Residence" value={data.distanceFromResidence} />
              <PrintField label="Mode of Transport" value={data.modeOfTransport} />
            </div>
          </div>

          {/* Sibling Details Section */}
          <div className="mt-4 space-y-1.5">
            <PrintField
              label="Does the child have any school going Siblings?"
              value={data.hasSchoolGoingSiblings ? 'Yes' : 'No'}
              labelWidth="w-[280px]"
            />

            {/* Sibling Table */}
            <table className="w-full border-collapse border border-black text-[11px] mt-1.5">
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
                  <tr key={i} className="border-b border-black h-7">
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

          {/* Parents Profile Info */}
          <div className="mt-4 space-y-2">
            <div className="grid grid-cols-2 gap-6">
              <PrintField
                label="Father's Name"
                value={<span className="uppercase">{data.fatherName}</span>}
              />
              <PrintField
                label="Mother's Name"
                value={<span className="uppercase">{data.motherName}</span>}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <PrintField
                label="Father's Qualification"
                value={data.fatherQualification}
              />
              <PrintField
                label="Mother's Qualification"
                value={data.motherQualification}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <PrintField
                label="Father's Designation"
                value={data.fatherDesignation}
              />
              <PrintField
                label="Mother's Designation"
                value={data.motherDesignation}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <PrintField
                label="Father's Income"
                value={data.fatherIncome}
              />
              <PrintField
                label="Mother's Income"
                value={data.motherIncome}
              />
            </div>
          </div>
        </div>

        {/* Footer Page 1 */}
        <PrintDocumentFooter regNo={data.registrationNo} childName={data.childName} pageNumber={1} totalPages={3} />
      </div>

      {/* ================= PAGE 2 ================= */}
      <div className="print-page w-[210mm] min-h-[297mm] p-8 mx-auto bg-white flex flex-col justify-between box-border border border-slate-300 shadow-md print:border-none print:shadow-none print:p-6 print:m-0 break-after-page text-[12px] leading-relaxed">
        <div>
          {/* Common Header on Page 2 */}
          <PrintDocumentHeader documentType="track-sheet" student={data} />

          {/* Top Alumni Info */}
          {/* Top Alumni Info */}
          <div className="space-y-2 pt-1">
            <div className="grid grid-cols-2 gap-6">
              <PrintField
                label="Is Father an Alumnus?"
                value={data.fatherAlumnus ? 'Yes' : 'No'}
              />
              <PrintField
                label="Is Mother an Alumnus?"
                value={data.motherAlumnus ? 'Yes' : 'No'}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <PrintField
                label="Year of Passing/ Leaving"
                value={data.fatherPassingYear || ''}
              />
              <PrintField
                label="Year of Passing/ Leaving"
                value={data.motherPassingYear || ''}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <PrintField
                label="No of Years Studied"
                value={data.fatherYearsStudied || ''}
              />
              <PrintField
                label="No of Years Studied"
                value={data.motherYearsStudied || ''}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <PrintField
                label="Class Last Studied"
                value={data.fatherClassLastStudied || ''}
              />
              <PrintField
                label="Class Last Studied"
                value={data.motherClassLastStudied || ''}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <PrintField
                label="Branch"
                value={data.fatherBranch || ''}
              />
              <PrintField
                label="Branch"
                value={data.motherBranch || ''}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <PrintField
                label="Reason for Leaving"
                value={data.fatherReasonLeaving || ''}
              />
              <PrintField
                label="Reason for Leaving"
                value={data.motherReasonLeaving || ''}
              />
            </div>
          </div>

          {/* Child Health Status */}
          <div className="mt-4 space-y-2">
            <PrintField
              label="Is the child a normal healthy child"
              value={data.isNormalHealthyChild ? 'Yes' : 'No'}
              labelWidth="w-[280px]"
            />
            <PrintField
              label="Specify Major ailment, If any (Past/Present)"
              value={data.majorAilment || 'Nil'}
              labelWidth="w-[280px]"
            />
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

          {/* Signatures Row - Dedicated Signing Height */}
          <div className="mt-6 pt-2">
            <div className="flex justify-between items-start text-[12px] font-bold min-h-[85px] pt-14">
              <div className="pt-1.5 font-bold shrink-0">Date :</div>
              <div className="flex justify-end gap-6 flex-1">
                <div className="text-center border-t border-black pt-1.5 px-2 w-[150px]">
                  Signature of Father
                </div>
                <div className="text-center border-t border-black pt-1.5 px-2 w-[150px]">
                  Signature of Mother
                </div>
                <div className="text-center border-t border-black pt-1.5 px-2 w-[165px]">
                  <div>Signature of Guardian</div>
                  <div className="text-[10px] font-normal leading-tight">(If Applicable)</div>
                </div>
              </div>
            </div>

            <div className="mt-4 text-[11.5px]">
              <PrintField label="Name in BLOCK LETTER" value="" labelWidth="w-[165px]" />
            </div>
          </div>

          {/* Bottom Submission Box containing Date of Submission, Timings, Reg No., Child's Name */}
          <div className="mt-4 border border-black p-3 text-[12px] select-none text-black">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <PrintField
                  label="Date of Submission"
                  value={data.dateOfSubmission || ''}
                  labelWidth="w-[140px]"
                />
                <PrintField
                  label="Timings"
                  value={data.timings || data.submissionTimings || ''}
                  labelWidth="w-[140px]"
                />
              </div>
              <div className="space-y-2 pl-6">
                <PrintField
                  label="Reg No."
                  value={data.registrationNo}
                  labelWidth="w-[140px]"
                />
                <PrintField
                  label="Child's Name"
                  value={
                    <span className="uppercase" title={data.childName}>
                      {data.childName.trim().length > 18
                        ? `${data.childName.trim().slice(0, 18)}...`
                        : data.childName.trim()}
                    </span>
                  }
                  labelWidth="w-[140px]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Page 2 */}
        <PrintDocumentFooter regNo={data.registrationNo} childName={data.childName} pageNumber={2} totalPages={3} />
      </div>

      {/* ================= PAGE 3 ================= */}
      <div className="print-page w-[210mm] min-h-[297mm] p-8 mx-auto bg-white flex flex-col justify-between box-border border border-slate-300 shadow-md print:border-none print:shadow-none print:p-6 print:m-0 break-after-page text-[12.5px] leading-relaxed">
        <div>
          {/* Common Header on Page 3 */}
          <PrintDocumentHeader documentType="track-sheet" student={data} />

          <div className="space-y-4 pt-4 px-2">
            <h3 className="font-bold text-[14px]">Instruction:</h3>

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

export default TrackSheetPrint
