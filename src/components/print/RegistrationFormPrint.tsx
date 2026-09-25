import React from 'react'
import { PrintDocumentHeader } from './PrintDocumentHeader'
import { PrintDocumentFooter } from './PrintDocumentFooter'
import { PrintField } from './PrintField'
import type { RegistrationFormData } from './printMappers'

export interface RegistrationFormPrintProps {
  data: RegistrationFormData
}

export const RegistrationFormPrint: React.FC<RegistrationFormPrintProps> = ({ data }) => {
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

  // Left vertical sidebar matching the sample PDF:
  // Left vertical sidebar matching the sample PDF:
  // Centered 44px x 622px dark gray box (#5c6470) with white vertical text on #ccc sidebar
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

  return (
    <div className="registration-form-document font-sans text-black bg-white select-none">
      {/* ================= PAGE 1 ================= */}
      <div className="print-page reg-form-page relative w-[210mm] min-h-[297mm] mx-auto bg-white flex box-border border border-slate-300 shadow-md print:border-none print:shadow-none print:m-0 break-after-page text-[12px] leading-relaxed p-0">
        <LeftVerticalSidebar />

        <div className="reg-form-content flex-1 flex flex-col justify-between p-6 sm:p-7 print:p-6 min-w-0">
          <div>
            {/* Common Header on Page 1 */}
            <PrintDocumentHeader documentType="registration-form" student={data} />

            {/* Top Registration No & School Applied For */}
            <div className="flex justify-between items-center mt-1 mb-2">
              <PrintField
                label="Registration No."
                value={
                  <span className="inline-block border border-black px-4 py-0.5 font-bold text-sm min-w-[140px] text-center">
                    {data.registrationNo}
                  </span>
                }
              />
              <PrintField
                label="School Applied For"
                value={<span className="font-bold uppercase">{data.schoolAppliedFor}</span>}
              />
            </div>

            {/* Child Details */}
            <div className="space-y-2.5">
              <PrintField
                label="Name of the Child"
                value={<span className="uppercase">{data.childName}</span>}
              />

              <div className="grid grid-cols-2 gap-4">
                <PrintField label="Date of Birth" value={data.dob} />
                <PrintField label="Passport No." value={data.passportNo || '-'} />
              </div>

              <PrintField label="Mother Tongue" value={data.motherTongue} />

              <div className="grid grid-cols-2 gap-4">
                <PrintField label="Religion" value={data.religion} />
                <PrintField label="Caste" value={data.caste} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <PrintField label="Nationality" value={data.nationality} />
                <PrintField label="Gender" value={data.gender} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <PrintField label="Community" value={data.community} />
                <PrintField
                  label="Does the Child go to play school?"
                  value={data.goesToPlaySchool ? 'Yes' : 'No'}
                />
              </div>

              <PrintField
                label="If yes, Play School Name"
                value={data.playSchoolName || '-'}
                labelWidth="w-[280px]"
              />

              <PrintField
                label="Is the child One of Twins/Triplets/Quadruplets"
                value={data.isMultipleBirth ? 'Yes' : 'No'}
                labelWidth="w-[280px]"
              />

              <PrintField
                label="Does the child have any school going Siblings?"
                value={data.hasSchoolGoingSiblings ? 'Yes' : 'No'}
                labelWidth="w-[280px]"
              />
            </div>

            {/* Sibling Table */}
            <table className="w-full border-collapse border border-black text-[11px] mt-3">
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

            {/* Health and Parents DOB */}
            <div className="space-y-4 mt-3">
              <PrintField
                label="Is the Child a normal and healthy Child"
                value={data.isNormalHealthyChild ? 'Yes' : 'No'}
                labelWidth="w-[280px]"
              />

              <PrintField
                label="Specify Major ailment, If any (Past/Present)"
                value={data.majorAilment || 'Nil'}
                labelWidth="w-[280px]"
              />

              <div className="grid grid-cols-2 gap-4 pt-1">
                <PrintField
                  label="Father's Name"
                  value={<span className="uppercase">{data.fatherName}</span>}
                />
                <PrintField
                  label="Mother's Name"
                  value={<span className="uppercase">{data.motherName}</span>}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <PrintField label="Father's DOB" value={data.fatherDob || ''} />
                <PrintField label="Mother's DOB" value={data.motherDob || ''} />
              </div>
            </div>
          </div>

          {/* Common Footer on Page 1 */}
          <PrintDocumentFooter regNo={data.registrationNo} childName={data.childName} pageNumber={1} totalPages={3} />
        </div>
      </div>

      {/* ================= PAGE 2 ================= */}
      <div className="print-page reg-form-page relative w-[210mm] min-h-[297mm] mx-auto bg-white flex box-border border border-slate-300 shadow-md print:border-none print:shadow-none print:m-0 break-after-page text-[11.5px] leading-tight p-0">
        <LeftVerticalSidebar />

        <div className="reg-form-content flex-1 flex flex-col justify-between p-6 sm:p-7 print:p-6 min-w-0">
          <div>
            {/* Common Header on Page 2 */}
            <PrintDocumentHeader documentType="registration-form" student={data} />

            <div className="space-y-4 pt-1">
              <div className="grid grid-cols-2 gap-6">
                <PrintField
                  label="Is Father an Alumnus"
                  value={data.fatherAlumnus ? 'Yes' : 'No'}
                />
                <PrintField
                  label="Is Mother an Alumnus"
                  value={data.motherAlumnus ? 'Yes' : 'No'}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <PrintField
                  label="Total No of Years Studied"
                  value={data.fatherYearsStudied || ''}
                />
                <PrintField
                  label="Total No of Years Studied"
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
                  label="Year of leaving / Passing"
                  value={data.fatherPassingYear || ''}
                />
                <PrintField
                  label="Year of leaving / Passing"
                  value={data.motherPassingYear || ''}
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
                  label="Reason of Leaving"
                  value={data.fatherReasonLeaving || ''}
                />
                <PrintField
                  label="Reason of Leaving"
                  value={data.motherReasonLeaving || ''}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <PrintField
                  label="Father's Educational Qualification"
                  value={data.fatherQualification || ''}
                />
                <PrintField
                  label="Mother's Educational Qualification"
                  value={data.motherQualification || ''}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <PrintField
                  label="University/Institution"
                  value={data.fatherUniversity || ''}
                />
                <PrintField
                  label="University/Institution"
                  value={data.motherUniversity || ''}
                />
              </div>

              {/* Mother Employed question */}
              <div className="grid grid-cols-2 gap-6">
                <div></div>
                <PrintField
                  label="Is Mother Employed?"
                  value={data.isMotherEmployed ? 'Yes' : 'No'}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <PrintField
                  label="Father's Occupation"
                  value={data.fatherOccupation || ''}
                />
                <PrintField
                  label="Mother's Occupation"
                  value={data.motherOccupation || ''}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <PrintField
                  label="Father's Employment Category"
                  value={data.fatherEmploymentCategory || ''}
                />
                <PrintField
                  label="Mother's Employment Category"
                  value={data.motherEmploymentCategory || ''}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <PrintField
                  label="Father's Designation"
                  value={data.fatherDesignation || ''}
                />
                <PrintField
                  label="Mother's Designation"
                  value={data.motherDesignation || ''}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <PrintField
                  label="Institution / Company Name"
                  value={data.fatherCompany || ''}
                />
                <PrintField
                  label="Institution / Company Name"
                  value={data.motherCompany || ''}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <PrintField
                  label="Father's Office Address"
                  value={data.fatherOfficeAddress || ''}
                />
                <PrintField
                  label="Mother's Office Address"
                  value={data.motherOfficeAddress || ''}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <PrintField
                  label="Father's Income"
                  value={data.fatherIncome || ''}
                />
                <PrintField
                  label="Mother's Income"
                  value={data.motherIncome || ''}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <PrintField
                  label="Father's Ph. No-Off"
                  value={data.fatherPhoneOffice || ''}
                />
                <PrintField
                  label="Mother's Ph. No-Off"
                  value={data.motherPhoneOffice || ''}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <PrintField
                  label="Father's Mobile No"
                  value={data.fatherMobile || ''}
                />
                <PrintField
                  label="Mother's Mobile No"
                  value={data.motherMobile || ''}
                />
              </div>

              <div className="pt-1">
                <PrintField
                  label="Guardian's Name"
                  value={<span className="uppercase">{data.guardianName || ''}</span>}
                />
              </div>
            </div>
          </div>

          {/* Common Footer on Page 2 */}
          <PrintDocumentFooter regNo={data.registrationNo} childName={data.childName} pageNumber={2} totalPages={3} />
        </div>
      </div>

      {/* ================= PAGE 3 ================= */}
      <div className="print-page reg-form-page relative w-[210mm] min-h-[297mm] mx-auto bg-white flex box-border border border-slate-300 shadow-md print:border-none print:shadow-none print:m-0 break-after-page text-[11.5px] leading-tight p-0">
        <LeftVerticalSidebar />

        <div className="reg-form-content flex-1 flex flex-col justify-between p-6 sm:p-7 print:p-6 min-w-0">
          <div>
            {/* Common Header on Page 3 */}
            <PrintDocumentHeader documentType="registration-form" student={data} />

            {/* Guardian and Residence Details */}
            <div className="space-y-1.5 pt-1">
              <div className="grid grid-cols-2 gap-4">
                <PrintField
                  label="Guardian's Gender"
                  value={data.guardianGender || ''}
                />
                <PrintField
                  label="Occupation"
                  value={data.guardianOccupation || ''}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <PrintField
                  label="Institution / Company Name"
                  value={data.guardianCompany || ''}
                />
                <PrintField
                  label="Monthly Income"
                  value={data.guardianIncome || ''}
                />
              </div>

              <PrintField
                label="Office Address"
                value={data.guardianOfficeAddress || ''}
              />

              <div className="grid grid-cols-2 gap-4">
                <PrintField
                  label="Guardian's Ph. No-Off"
                  value={data.guardianPhoneOffice || ''}
                />
                <PrintField
                  label="Guardian's Ph. No-Res"
                  value={data.guardianPhoneRes || ''}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <PrintField
                  label="Guardian's Mobile No"
                  value={data.guardianMobile || ''}
                />
                <PrintField
                  label="Residence Telephone No"
                  value={data.residenceTelephone || ''}
                />
              </div>

              <PrintField
                label="Residential Address"
                value={data.residentialAddress || ''}
              />

              <PrintField
                label="Important land mark"
                value={data.importantLandmark || ''}
              />

              <div className="grid grid-cols-2 gap-4">
                <PrintField
                  label="Distance from Residence"
                  value={data.distanceFromResidence || ''}
                />
                <PrintField
                  label="Mode of Transport"
                  value={data.modeOfTransport || ''}
                />
              </div>

              <PrintField
                label="Outstanding achievements of parents"
                value={data.parentAchievements || ''}
              />

              <PrintField
                label="Is the Parent coming on transfer from outside Chennai / from outside India"
                value={data.isTransferParent ? 'Yes' : 'No'}
                labelWidth="w-[280px]"
              />
            </div>

            {/* Declaration Paragraph */}
            <div className="mt-3 text-[11px] leading-relaxed text-justify">
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

            {/* Date and Parent Signature - Dedicated Writing Height */}
            <div className="mt-6 pt-1">
              <div className="flex justify-between items-start text-[11.5px] min-h-[80px] pt-12">
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
              <div className="mt-3.5 text-[11.5px] font-bold flex items-center">
                <span className="shrink-0">Name in BLOCK LETTER :&nbsp;&nbsp;</span>
                <span className="flex-1 border-b border-black max-w-[280px]">&nbsp;</span>
              </div>
            </div>

            {/* Note & Document Checklist */}
            <div className="mt-4 text-[10.5px] leading-tight space-y-1">
              <p className="font-bold">Instruction :</p>
              <ul className="space-y-0.5 list-disc pl-4">
                <li>Forms with False/ Incomplete/Vague information will not be considered.</li>
                <li>Submit the Track Sheet signed by both parents (to the school office of the branch applied for)</li>
                <li>
                  Documents to be submitted in person by the parent only (with authorization letter from parent, if guardian):
                  <div className="mt-0.5 space-y-0.5 pl-3">
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

          {/* Common Footer on Page 3 */}
          <PrintDocumentFooter regNo={data.registrationNo} childName={data.childName} pageNumber={3} totalPages={3} />
        </div>
      </div>
    </div>
  )
}

export default RegistrationFormPrint
