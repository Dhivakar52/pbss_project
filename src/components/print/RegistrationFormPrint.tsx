import React from 'react'
import { PrintDocumentHeader } from './PrintDocumentHeader'
import { PrintDocumentFooter } from './PrintDocumentFooter'
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
            <div className="space-y-4">
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
                  <span className="w-48 font-bold leading-tight">Does the Child go<br />to any play school?</span>
                  <span className="w-6 font-bold">:</span>
                  <span className="font-normal">{data.goesToPlaySchool ? 'Yes' : 'No'}</span>
                </div>
              </div>

              <div className="flex items-start">
                <span className="w-48 font-bold leading-tight">If yes, Play<br />School Name</span>
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
              <div className="flex items-center">
                <span className="w-64 font-bold">Is the Child a normal and healthy Child</span>
                <span className="w-6 font-bold">:</span>
                <span className="font-normal">{data.isNormalHealthyChild ? 'Yes' : 'No'}</span>
              </div>

              <div className="flex items-start">
                <span className="w-64 font-bold leading-tight">Specify Major<br />ailment, If any :<br />(Past/Present)</span>
                <span className="font-normal ml-2">{data.majorAilment || 'Nil'}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-1">
                <div className="flex items-center">
                  <span className="w-36 font-bold">Father's Name :</span>
                  <span className="font-normal uppercase">{data.fatherName}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-36 font-bold">Mother's Name :</span>
                  <span className="font-normal uppercase">{data.motherName}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <span className="w-36 font-bold">Father's DOB :</span>
                  <span className="font-normal">{data.fatherDob || ''}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-36 font-bold">Mother's DOB :</span>
                  <span className="font-normal">{data.motherDob || ''}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Common Footer on Page 1 */}
          <PrintDocumentFooter regNo={data.registrationNo} childName={data.childName} />
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
                <div className="flex items-center">
                  <span className="w-52 font-bold">Is Father an Alumnus</span>
                  <span className="w-6 font-bold">:</span>
                  <span className="font-normal">{data.fatherAlumnus ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-52 font-bold">Is Mother an Alumnus</span>
                  <span className="w-6 font-bold">:</span>
                  <span className="font-normal">{data.motherAlumnus ? 'Yes' : 'No'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center">
                  <span className="w-52 font-bold">Total No of Years Studied</span>
                  <span className="w-6 font-bold">:</span>
                  <span className="font-normal">{data.fatherYearsStudied || ''}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-52 font-bold">Total No of Years Studied</span>
                  <span className="w-6 font-bold">:</span>
                  <span className="font-normal">{data.motherYearsStudied || ''}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center">
                  <span className="w-52 font-bold">Class Last Studied</span>
                  <span className="w-6 font-bold">:</span>
                  <span className="font-normal">{data.fatherClassLastStudied || ''}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-52 font-bold">Class Last Studied</span>
                  <span className="w-6 font-bold">:</span>
                  <span className="font-normal">{data.motherClassLastStudied || ''}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center">
                  <span className="w-52 font-bold">Year of leaving / Passing</span>
                  <span className="w-6 font-bold">:</span>
                  <span className="font-normal">{data.fatherPassingYear || ''}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-52 font-bold">Year of leaving / Passing</span>
                  <span className="w-6 font-bold">:</span>
                  <span className="font-normal">{data.motherPassingYear || ''}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center">
                  <span className="w-52 font-bold">Branch</span>
                  <span className="w-6 font-bold">:</span>
                  <span className="font-normal">{data.fatherBranch || ''}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-52 font-bold">Branch</span>
                  <span className="w-6 font-bold">:</span>
                  <span className="font-normal">{data.motherBranch || ''}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center">
                  <span className="w-52 font-bold">Reason of Leaving</span>
                  <span className="w-6 font-bold">:</span>
                  <span className="font-normal">{data.fatherReasonLeaving || ''}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-52 font-bold">Reason of Leaving</span>
                  <span className="w-6 font-bold">:</span>
                  <span className="font-normal">{data.motherReasonLeaving || ''}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-start">
                  <span className="w-52 font-bold leading-tight">Father's Educational<br />Qualification :</span>
                  <span className="font-normal ml-2">{data.fatherQualification || ''}</span>
                </div>
                <div className="flex items-start">
                  <span className="w-52 font-bold leading-tight">Mother's Educational<br />Qualification :</span>
                  <span className="font-normal ml-2">{data.motherQualification || ''}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center">
                  <span className="w-52 font-bold">University/Institution :</span>
                  <span className="font-normal ml-2">{data.fatherUniversity || ''}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-52 font-bold">University/Institution :</span>
                  <span className="font-normal ml-2">{data.motherUniversity || ''}</span>
                </div>
              </div>

              {/* Mother Employed question */}
              <div className="grid grid-cols-2 gap-6">
                <div></div>
                <div className="flex items-center">
                  <span className="w-52 font-bold">Is Mother Employed? :</span>
                  <span className="font-normal ml-2">{data.isMotherEmployed ? 'Yes' : 'No'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-start">
                  <span className="w-52 font-bold leading-tight">Father's<br />Occupation :</span>
                  <span className="font-normal ml-2">{data.fatherOccupation || ''}</span>
                </div>
                <div className="flex items-start">
                  <span className="w-52 font-bold leading-tight">Mother's<br />Occupation :</span>
                  <span className="font-normal ml-2">{data.motherOccupation || ''}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-start">
                  <span className="w-52 font-bold leading-tight">Father's<br />Employment<br />Category :</span>
                  <span className="font-normal ml-2">{data.fatherEmploymentCategory || ''}</span>
                </div>
                <div className="flex items-start">
                  <span className="w-52 font-bold leading-tight">Mother's<br />Employment<br />Category :</span>
                  <span className="font-normal ml-2">{data.motherEmploymentCategory || ''}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-start">
                  <span className="w-52 font-bold leading-tight">Father's<br />Designation :</span>
                  <span className="font-normal ml-2">{data.fatherDesignation || ''}</span>
                </div>
                <div className="flex items-start">
                  <span className="w-52 font-bold leading-tight">Mother's<br />Designation :</span>
                  <span className="font-normal ml-2">{data.motherDesignation || ''}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-start">
                  <span className="w-52 font-bold leading-tight">Institution<br />/Company<br />Name :</span>
                  <span className="font-normal ml-2">{data.fatherCompany || ''}</span>
                </div>
                <div className="flex items-start">
                  <span className="w-52 font-bold leading-tight">Institution<br />/Company<br />Name :</span>
                  <span className="font-normal ml-2">{data.motherCompany || ''}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-start">
                  <span className="w-52 font-bold leading-tight">Father's Office<br />Address :</span>
                  <span className="font-normal ml-2">{data.fatherOfficeAddress || ''}</span>
                </div>
                <div className="flex items-start">
                  <span className="w-52 font-bold leading-tight">Mother's Office<br />Address :</span>
                  <span className="font-normal ml-2">{data.motherOfficeAddress || ''}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center">
                  <span className="w-48 font-bold">Father's Income :</span>
                  <span className="font-normal ml-2">{data.fatherIncome || ''}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-48 font-bold">Mother's Income :</span>
                  <span className="font-normal ml-2">{data.motherIncome || ''}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center">
                  <span className="w-48 font-bold">Father's Ph. No-Off :</span>
                  <span className="font-normal ml-2">{data.fatherPhoneOffice || ''}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-48 font-bold">Mother's Ph. No-Off :</span>
                  <span className="font-normal ml-2">{data.motherPhoneOffice || ''}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center">
                  <span className="w-48 font-bold">Father's Mobile No :</span>
                  <span className="font-normal ml-2">{data.fatherMobile || ''}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-48 font-bold">Mother's Mobile No :</span>
                  <span className="font-normal ml-2">{data.motherMobile || ''}</span>
                </div>
              </div>

              <div className="pt-1">
                <div className="flex items-center">
                  <span className="w-48 font-bold">Guardian's Name</span>
                  <span className="w-6 font-bold">:</span>
                  <span className="font-normal uppercase">{data.guardianName || ''}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Common Footer on Page 2 */}
          <PrintDocumentFooter regNo={data.registrationNo} childName={data.childName} />
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
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center">
                  <span className="w-48 font-bold">Guardian's Gender :</span>
                  <span className="font-normal ml-2">{data.guardianGender || ''}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-36 font-bold">Occupation :</span>
                  <span className="font-normal ml-2">{data.guardianOccupation || ''}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-start">
                  <span className="w-48 font-bold leading-tight">Institution / Company<br />Name :</span>
                  <span className="font-normal ml-2">{data.guardianCompany || ''}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-36 font-bold">Monthly Income:</span>
                  <span className="font-normal ml-2">{data.guardianIncome || ''}</span>
                </div>
              </div>

              <div className="flex items-start">
                <span className="w-48 font-bold">Office Address :</span>
                <span className="font-normal ml-2">{data.guardianOfficeAddress || ''}</span>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center">
                  <span className="w-48 font-bold">Guardian's Ph. No-Off :</span>
                  <span className="font-normal ml-2">{data.guardianPhoneOffice || ''}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-44 font-bold">Guardian's Ph. No-Res :</span>
                  <span className="font-normal ml-2">{data.guardianPhoneRes || ''}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-start">
                  <span className="w-48 font-bold leading-tight">Guardian's Mobile<br />Number :</span>
                  <span className="font-normal ml-2">{data.guardianMobile || ''}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-44 font-bold">Residence Telephone No :</span>
                  <span className="font-normal ml-2">{data.residenceTelephone || ''}</span>
                </div>
              </div>

              <div className="flex items-start pt-0.5">
                <span className="w-48 font-bold leading-tight shrink-0">Residential<br />Address :</span>
                <span className="font-normal ml-2">{data.residentialAddress || ''}</span>
              </div>

              <div className="flex items-start">
                <span className="w-48 font-bold leading-tight shrink-0">Important<br />land mark :</span>
                <span className="font-normal ml-2">{data.importantLandmark || ''}</span>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-start">
                  <span className="w-48 font-bold leading-tight">Distance from<br />Residence :</span>
                  <span className="font-normal ml-2">{data.distanceFromResidence || ''}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-44 font-bold">Mode of Transport :</span>
                  <span className="font-normal ml-2">{data.modeOfTransport || ''}</span>
                </div>
              </div>

              <div className="flex items-start pt-0.5">
                <span className="w-48 font-bold leading-tight shrink-0">Outstanding achievements<br />of parents :</span>
                <span className="font-normal ml-2">{data.parentAchievements || ''}</span>
              </div>

              <div className="flex items-start pt-0.5">
                <span className="w-56 font-bold leading-tight shrink-0">
                  Is the Parent coming on<br />transfer<br />from outside Chennai/from<br />outside India :
                </span>
                <span className="font-normal ml-2">{data.isTransferParent ? 'Yes' : 'No'}</span>
              </div>
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

            {/* Date and Parent Signature */}
            <div className="mt-4 flex justify-between items-start text-[11.5px]">
              <div>
                <span className="font-bold">Date :</span>
              </div>
              <div className="text-right space-y-2">
                <div className="font-bold">Signature of the Parent / Guardian</div>
                <div className="pt-1 font-bold">Name in BLOCK LETTER :</div>
              </div>
            </div>

            {/* Note & Document Checklist */}
            <div className="mt-4 text-[10.5px] leading-tight space-y-1">
              <p className="font-bold">Note :</p>
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
          <PrintDocumentFooter regNo={data.registrationNo} childName={data.childName} />
        </div>
      </div>
    </div>
  )
}

export default RegistrationFormPrint
