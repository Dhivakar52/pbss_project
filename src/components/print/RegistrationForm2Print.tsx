import React from 'react'
import { PrintDocumentHeader } from './PrintDocumentHeader'
import { PrintDocumentFooter } from './PrintDocumentFooter'
import type { RegistrationFormData } from './printMappers'

export interface RegistrationForm2PrintProps {
  data: RegistrationFormData
}

export const RegistrationForm2Print: React.FC<RegistrationForm2PrintProps> = ({ data }) => {
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

  // Reusable 3-column field item component with consistent alignment and comfortable spacing
  const RenderField = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex items-baseline text-[11px] leading-snug min-w-0 overflow-hidden pr-1">
      <span className="font-bold shrink-0 mr-1.5 text-black">{label} :</span>
      <span className="font-normal truncate text-black">{value !== undefined && value !== null && value !== '' ? value : '-'}</span>
    </div>
  )

  return (
    <div className="registration-form-document font-sans text-black bg-white select-none">
      {/* ================= PAGE 1 ================= */}
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

            {/* FATHER DETAILS SECTION (3 FIELDS PER ROW - INTEGRATED DIRECTLY ON PAGE 1 FOR OPTIMAL SPACE UTILIZATION) */}
            <div className="mt-3.5 mb-1">
              <div className="border-b border-black pb-0.5 mb-2 text-[11.5px] font-bold uppercase tracking-wide text-black">
                Father Details
              </div>
              <div className="grid grid-cols-3 gap-x-6 gap-y-2.5">
                <RenderField label="Father's Name" value={data.fatherName ? data.fatherName.toUpperCase() : ''} />
                <RenderField label="Father's DOB" value={data.fatherDob} />
                <RenderField label="Is Alumnus" value={data.fatherAlumnus ? 'Yes' : 'No'} />

                <RenderField label="Years Studied" value={data.fatherYearsStudied} />
                <RenderField label="Class Last Studied" value={data.fatherClassLastStudied} />
                <RenderField label="Passing Year" value={data.fatherPassingYear} />

                <RenderField label="Branch" value={data.fatherBranch} />
                <RenderField label="Reason of Leaving" value={data.fatherReasonLeaving} />
                <RenderField label="Qualification" value={data.fatherQualification} />

                <RenderField label="University/Inst." value={data.fatherUniversity} />
                <RenderField label="Occupation" value={data.fatherOccupation} />
                <RenderField label="Employment Cat." value={data.fatherEmploymentCategory} />

                <RenderField label="Designation" value={data.fatherDesignation} />
                <RenderField label="Company Name" value={data.fatherCompany} />
                <RenderField label="Office Address" value={data.fatherOfficeAddress} />

                <RenderField label="Income" value={data.fatherIncome} />
                <RenderField label="Ph. No-Off" value={data.fatherPhoneOffice} />
                <RenderField label="Mobile No" value={data.fatherMobile} />
              </div>
            </div>
          </div>

          {/* Common Footer on Page 1 */}
          <PrintDocumentFooter regNo={data.registrationNo} childName={data.childName} pageNumber={1} totalPages={3} />
        </div>
      </div>

      {/* ================= PAGE 2: MOTHER DETAILS, GUARDIANS DETAILS & RESIDENCE DETAILS ================= */}
      <div className="print-page reg-form-page relative w-[210mm] min-h-[297mm] mx-auto bg-white flex box-border border border-slate-300 shadow-md print:border-none print:shadow-none print:m-0 break-after-page text-[11.5px] leading-snug p-0">
        <LeftVerticalSidebar />

        <div className="reg-form-content flex-1 flex flex-col justify-between p-6 print:p-6 min-w-0">
          <div>
            {/* Common Header on Page 2 */}
            <PrintDocumentHeader documentType="registration-form" student={data} />

            {/* MOTHER DETAILS SECTION (3 FIELDS PER ROW) */}
            <div className="mt-1 mb-4">
              <div className="border-b border-black pb-0.5 mb-2 text-[11.5px] font-bold uppercase tracking-wide text-black">
                Mother Details
              </div>
              <div className="grid grid-cols-3 gap-x-6 gap-y-2.5">
                <RenderField label="Mother's Name" value={data.motherName ? data.motherName.toUpperCase() : ''} />
                <RenderField label="Mother's DOB" value={data.motherDob} />
                <RenderField label="Is Alumnus" value={data.motherAlumnus ? 'Yes' : 'No'} />

                <RenderField label="Years Studied" value={data.motherYearsStudied} />
                <RenderField label="Class Last Studied" value={data.motherClassLastStudied} />
                <RenderField label="Passing Year" value={data.motherPassingYear} />

                <RenderField label="Branch" value={data.motherBranch} />
                <RenderField label="Reason of Leaving" value={data.motherReasonLeaving} />
                <RenderField label="Qualification" value={data.motherQualification} />

                <RenderField label="University/Inst." value={data.motherUniversity} />
                <RenderField label="Is Mother Employed?" value={data.isMotherEmployed ? 'Yes' : 'No'} />
                <RenderField label="Occupation" value={data.motherOccupation} />

                <RenderField label="Employment Cat." value={data.motherEmploymentCategory} />
                <RenderField label="Designation" value={data.motherDesignation} />
                <RenderField label="Company Name" value={data.motherCompany} />

                <RenderField label="Office Address" value={data.motherOfficeAddress} />
                <RenderField label="Income" value={data.motherIncome} />
                <RenderField label="Ph. No-Off" value={data.motherPhoneOffice} />

                <RenderField label="Mobile No" value={data.motherMobile} />
                <div></div>
                <div></div>
              </div>
            </div>

            {/* GUARDIANS DETAILS SECTION (3 FIELDS PER ROW - BALANCED CLEAR SPACING BEFORE AND AFTER) */}
            <div className="mt-4 mb-3 pt-2 border-t border-slate-200/60">
              <div className="border-b border-black pb-0.5 mb-2 text-[11.5px] font-bold uppercase tracking-wide text-black">
                Guardians Details
              </div>
              <div className="grid grid-cols-3 gap-x-6 gap-y-2.5">
                <RenderField label="Guardian's Name" value={data.guardianName ? data.guardianName.toUpperCase() : ''} />
                <RenderField label="Guardian's Gender" value={data.guardianGender} />
                <RenderField label="Occupation" value={data.guardianOccupation} />

                <RenderField label="Company Name" value={data.guardianCompany} />
                <RenderField label="Monthly Income" value={data.guardianIncome} />
                <RenderField label="Office Address" value={data.guardianOfficeAddress} />

                <RenderField label="Ph. No-Off" value={data.guardianPhoneOffice} />
                <RenderField label="Ph. No-Res" value={data.guardianPhoneRes} />
                <RenderField label="Mobile No" value={data.guardianMobile} />
              </div>
            </div>

            {/* Residence, Transport & Other Details */}
            <div className="space-y-1.5 mt-3 pt-2 border-t border-slate-200">
              <div className="flex items-center">
                <span className="w-44 font-bold">Residence Telephone No :</span>
                <span className="font-normal ml-2">{data.residenceTelephone || ''}</span>
              </div>

              <div className="flex items-start">
                <span className="w-48 font-bold leading-tight shrink-0">Residential Address :</span>
                <span className="font-normal ml-2">{data.residentialAddress || ''}</span>
              </div>

              <div className="flex items-start">
                <span className="w-48 font-bold leading-tight shrink-0">Important landmark :</span>
                <span className="font-normal ml-2">{data.importantLandmark || ''}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start">
                  <span className="w-48 font-bold leading-tight">Distance from Residence :</span>
                  <span className="font-normal ml-2">{data.distanceFromResidence || ''}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-44 font-bold">Mode of Transport :</span>
                  <span className="font-normal ml-2">{data.modeOfTransport || ''}</span>
                </div>
              </div>

              <div className="flex items-start">
                <span className="w-48 font-bold leading-tight shrink-0">Outstanding achievements of parents :</span>
                <span className="font-normal ml-2">{data.parentAchievements || ''}</span>
              </div>

              <div className="flex items-start">
                <span className="w-56 font-bold leading-tight shrink-0">
                  Is the Parent coming on transfer from outside Chennai/from outside India :
                </span>
                <span className="font-normal ml-2">{data.isTransferParent ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>

          {/* Common Footer on Page 2 */}
          <PrintDocumentFooter regNo={data.registrationNo} childName={data.childName} pageNumber={2} totalPages={3} />
        </div>
      </div>

      {/* ================= PAGE 3: DECLARATION, SIGNATURES & NOTE / CHECKLIST ================= */}
      <div className="print-page reg-form-page relative w-[210mm] min-h-[297mm] mx-auto bg-white flex box-border border border-slate-300 shadow-md print:border-none print:shadow-none print:m-0 text-[11.5px] leading-snug p-0">
        <LeftVerticalSidebar />

        <div className="reg-form-content flex-1 flex flex-col justify-between p-6 print:p-6 min-w-0">
          <div>
            {/* Common Header on Page 3 */}
            <PrintDocumentHeader documentType="registration-form" student={data} />

            {/* Declaration Paragraph */}
            <div className="mt-2 text-[11px] leading-relaxed text-justify">
              <p>
                We, the parents (father & mother)/guardian of{' '}
                <span className="underline font-bold uppercase inline-block min-w-[180px] text-center">
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

            {/* Date and Parent Signature */}
            <div className="mt-6 flex justify-between items-start text-[11.5px]">
              <div>
                <span className="font-bold">Date :</span>
              </div>
              <div className="text-right space-y-2">
                <div className="font-bold">Signature of the Parent / Guardian</div>
                <div className="pt-1 font-bold">Name in BLOCK LETTER :</div>
              </div>
            </div>

            {/* Note & Document Checklist */}
            <div className="mt-6 text-[10.5px] leading-relaxed space-y-1.5 border-t border-slate-200 pt-3">
              <p className="font-bold text-[11px]">Note :</p>
              <ul className="space-y-1 list-disc pl-4">
                <li>Forms with False/ Incomplete/Vague information will not be considered.</li>
                <li>Submit the Track Sheet signed by both parents (to the school office of the branch applied for)</li>
                <li>
                  Documents to be submitted in person by the parent only (with authorization letter from parent, if guardian):
                  <div className="mt-1 space-y-0.5 pl-3">
                    <p>
                      1. Track sheet signed by BOTH parents/guardian with recent photo of the child duly affixed
                      <span className="pl-2">(please mention Reg No. at the back of the photo)</span>
                    </p>
                    <p>2. Birth Certificate of Child - COPY</p>
                    <p>3. Passport size photographs of both parents with Reg No. written at the back.</p>
                    <p>4. Address proof of parents - COPY</p>
                  </div>
                </li>
                <li>
                  Documents to be brought for verification:
                  <div className="mt-1 space-y-0.5 pl-3">
                    <p>1. Birth Certificate of Child - ORIGINAL</p>
                    <p>2. Proof of Address of both Parents – ORIGINAL</p>
                    <p>3. Photo ID of both parents - ORIGINAL</p>
                  </div>
                </li>
                <li>Rs.500/- to be remitted through Debit/Credit card ONLY towards processing fee.</li>
              </ul>
            </div>
          </div>

          {/* Common Footer on Page 3 */}
          <PrintDocumentFooter regNo={data.registrationNo} childName={data.childName} pageNumber={3} totalPages={3} />
        </div>
      </div>
    </div>
  )
}

export default RegistrationForm2Print
