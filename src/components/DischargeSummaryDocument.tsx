import React from "react";
import srmLogo from "@/assets/images/srm_logo.png";

export interface DiagnosisItem {
  sNo?: number | string;
  code: string;
  name: string;
}

export interface PatientDischargeData {
  ipNo?: string;
  patientName?: string;
  department?: string;
  admitDate?: string;
  ward?: string;
  abhaId?: string;
  uhidNo?: string;
  genderAge?: string;
  doctor?: string;
  doctorSignature?: string;
  dischargeDate?: string;
  unit?: string;
  mlcStatus?: string;
  diagnoses?: DiagnosisItem[];
  diagnosisText?: string[];
  presentingComplaints?: string[];
  hopi?: string[];
  pastHistory?: string[];
  examination?: string[];
  investigation?: string[];
  treatment?: string[];
  hospitalCourse?: string[];
  dischargeAdvice?: string[];
  followUp?: string[];
}

interface DischargeSummaryDocumentProps {
  data?: PatientDischargeData;
  className?: string;
}

// Custom SVG component for NABH Accredited logo matching the exact reference badge
// const NabhLogo: React.FC<{ className?: string }> = ({ className = "h-16 w-16" }) => (
//   <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
//     {/* Outer Red Ring */}
//     <circle cx="50" cy="50" r="46" fill="none" stroke="#d32f2f" strokeWidth="8" />

//     {/* Top Text along path */}
//     <path id="textPathTop" d="M 12 50 A 38 38 0 0 1 88 50" fill="none" />
//     <text fontSize="7" fontWeight="bold" fill="#d32f2f" textAnchor="middle">
//       <textPath href="#textPathTop" startOffset="50%">
//         PATIENT SAFETY &amp; QUALITY OF CARE
//       </textPath>
//     </text>

//     {/* Inner Blue Shield / Circle */}
//     <circle cx="50" cy="50" r="33" fill="#0288d1" />

//     {/* Center Emblem Graphic */}
//     <path d="M 36 50 C 36 38 50 34 50 34 C 50 34 64 38 64 50 C 64 60 50 66 50 66 C 50 66 36 60 36 50 Z" fill="#ffffff" />
//     <circle cx="50" cy="48" r="7" fill="#0288d1" />

//     {/* Center Text "NABH" */}
//     <text x="50" y="74" fontSize="11" fontWeight="900" fill="#ffffff" textAnchor="middle" fontFamily="sans-serif">
//       NABH
//     </text>
//     {/* "ACCREDITED" text */}
//     <path id="textPathBottom" d="M 20 50 A 30 30 0 0 0 80 50" fill="none" />
//     <text fontSize="5.5" fontWeight="bold" fill="#d32f2f" textAnchor="middle">
//       <textPath href="#textPathBottom" startOffset="50%">
//         ACCREDITED
//       </textPath>
//     </text>
//   </svg>
// );

export const DischargeSummaryDocument: React.FC<DischargeSummaryDocumentProps> = ({
  data,
  className = "",
}) => {
  // Default values strictly matching reference image sample data
  const ipNo = data?.ipNo ?? "25106887";
  const patientName = data?.patientName ?? "Mr.MUNIYANDI";
  const department = data?.department ?? "General Medicine";
  const admitDate = data?.admitDate ?? "15-Dec-2025 13:44";
  const ward = data?.ward ?? "Male Medical";
  const abhaId = data?.abhaId ?? "";

  const uhidNo = data?.uhidNo ?? "2689068";
  const genderAge = data?.genderAge ?? "Male / 54Y 2M 19D";
  const doctor = data?.doctor ?? "Aneesh Basheer";
  const dischargeDate = data?.dischargeDate ?? "18-Dec-2025 16:00";
  const unit = data?.unit ?? "UNIT-7";
  const mlcStatus = data?.mlcStatus ?? "Non MLC";

  const defaultDiagnoses: DiagnosisItem[] = [
    { sNo: 1, code: "E11.2", name: "Non-insulin-dependent diabetes mellitus without complications" },
    { sNo: 2, code: "I10", name: "Essential (primary) hypertension" },
    { sNo: 3, code: "K27.9", name: "Peptic ulcer, unspecified as acute or chronic, without haemorrhage or perforation" },
    { sNo: 4, code: "N18.4", name: "CKD - STAGE 4" },
    { sNo: 5, code: "N20.0", name: "Calculus of kidney" },
  ];

  const diagnoses = data?.diagnoses && data.diagnoses.length > 0 ? data.diagnoses : defaultDiagnoses;

  const defaultDiagnosisText = [
    "TYPE 2 DIABETES MELLITUS WITH NEPHROPATHY (HBA1C- 8.6%)",
    "SYSTEMIC HYPERTENSION",
    "CHRONIC KIDNEY DISEASE STAGE 4 (eGFR- ML/MIN/1.73M^2)",
    "LEFT RENAL CALCULUS",
    "LUMBAR SPONDYLOSIS",
    "ACID PEPTIC DISEASE",
  ];

  const defaultPresentingComplaints = [
    "A 54 YEAR OLD MALE KNOWN CASE OF TYPE 2 DIABETES MELLITUS, SYSTEMIC HYPERTENSION, ?CHRONIC KIDNEY DISEASE CAME WITH COMPLAINTS OF",
    "BELCHING AND EPIGASTRIC BURNING SENSATION FOR 1 WEEK, CONSTIPATION FOR 20 DAYS",
  ];

  const defaultHopi = [
    "PATIENT WAS APPARENTLY ASYMPTOMATIC 20 DAYS BACK AFTER WHICH HE DEVELOPED COMPLAINTS OF FEVER, GENERALIZED WEAKNESS AND BODY PAIN. THE SYMPTOMS WERE GRADUALLY PROGRESSIVE, FOR WHICH HE CONSULTED A LOCAL PHYSICIAN AND WAS EVALUATED. IN VIEW OF PERSISTENT SYMPTOMS, HE WAS ADVISED FURTHER EVALUATION AND MANAGEMENT, FOLLOWING WHICH HE WAS ADMITTED FOR FURTHER MANAGEMENT.",
  ];

  const diagnosisText = data?.diagnosisText ?? defaultDiagnosisText;
  const presentingComplaints = data?.presentingComplaints ?? defaultPresentingComplaints;
  const hopi = data?.hopi ?? defaultHopi;
  const pastHistory = data?.pastHistory;
  const examination = data?.examination;
  const investigation = data?.investigation;
  const treatment = data?.treatment;
  const hospitalCourse = data?.hospitalCourse;
  const dischargeAdvice = data?.dischargeAdvice;
  const followUp = data?.followUp;

  return (
    <div
      id="printable-discharge-summary"
      className={`discharge-summary-print print-discharge-summary discharge-print-container bg-white text-black p-4 border border-black ${className}`}
      style={{
        fontFamily: '"Times New Roman", Times, serif',
        color: "#000000",
        backgroundColor: "#ffffff",
        boxSizing: "border-box",
        width: "100%",
        maxWidth: "210mm",
        margin: "0 auto",
      }}
    >
      {/* 1. HOSPITAL HEADER */}
      <div className="flex items-center justify-between pb-2 border-b border-black mb-1 avoid-break">
        {/* Left Logo */}
        <div className="w-24 flex items-center justify-start shrink-0">
          <img
            src={srmLogo}
            alt="SRM Hospital Logo"
            className="h-16 w-auto object-contain"
          />
        </div>

        {/* Center Hospital Name & Info */}
        <div className="text-center flex-1 px-2">
          <h1 className="text-[15px] font-bold uppercase tracking-tight text-black leading-snug m-0">
            SRM MEDICAL COLLEGE HOSPITAL &amp; RESEARCH CENTRE
          </h1>
          <p className="text-[13px] font-bold text-black leading-snug mt-0.5 m-0">
            SRM Nagar, Potheri, Kattankulathur-603 203
          </p>
          <p className="text-[13px] font-bold text-black leading-snug mt-0.5 m-0">
            PHONE : 27455317 Extn: 2423 &amp; 2424.
          </p>
        </div>

        {/* Right NABH Accreditation Logo */}
        {/* <div className="w-24 flex items-center justify-end shrink-0">
          <NabhLogo className="h-16 w-16 object-contain" />
        </div> */}
      </div>

      {/* 2. DISCHARGE SUMMARY TITLE */}
      <div className="border-b border-black py-1 text-center mb-2 avoid-break">
        <h2 className="text-[14px] font-bold uppercase tracking-wider text-black m-0">
          DISCHARGE SUMMARY
        </h2>
      </div>

      {/* 3. PATIENT INFORMATION */}
      <div className="grid grid-cols-2 gap-x-6 text-[13px] leading-tight mb-2 border-b border-black pb-2 avoid-break">
        {/* LEFT COLUMN */}
        <div className="space-y-1">
          <div className="flex items-baseline">
            <span className="font-bold w-28 shrink-0">IP No:</span>
            <span className="font-normal">{ipNo}</span>
          </div>

          <div className="flex items-baseline">
            <span className="font-bold w-28 shrink-0 leading-tight">
              Patient<br />Name:
            </span>
            <span className="font-normal self-end">{patientName}</span>
          </div>

          <div className="flex items-baseline">
            <span className="font-bold w-28 shrink-0">Department:</span>
            <span className="font-normal">{department}</span>
          </div>

          <div className="flex items-baseline">
            <span className="font-bold w-28 shrink-0">Admit Date:</span>
            <span className="font-normal">{admitDate}</span>
          </div>

          <div className="flex items-baseline">
            <span className="font-bold w-28 shrink-0">Ward:</span>
            <span className="font-normal">{ward}</span>
          </div>

          <div className="flex items-baseline">
            <span className="font-bold w-28 shrink-0">ABHA ID:</span>
            <span className="font-normal">{abhaId}</span>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-1">
          <div className="flex items-baseline">
            <span className="font-bold w-32 shrink-0">UHID No:</span>
            <span className="font-normal">{uhidNo}</span>
          </div>

          <div className="flex items-baseline">
            <span className="font-bold w-32 shrink-0">Gender / Age:</span>
            <span className="font-normal">{genderAge}</span>
          </div>

          <div className="flex items-baseline">
            <span className="font-bold w-32 shrink-0">Doctor:</span>
            <span className="font-normal">{doctor}</span>
          </div>

          <div className="flex items-baseline">
            <span className="font-bold w-32 shrink-0">Discharge Date:</span>
            <span className="font-normal">{dischargeDate}</span>
          </div>

          <div className="flex items-baseline">
            <span className="font-bold w-32 shrink-0">Unit:</span>
            <span className="font-normal">{unit}</span>
          </div>

          <div className="flex items-baseline">
            <span className="w-32 shrink-0"></span>
            <span className="font-bold">{mlcStatus}</span>
          </div>
        </div>
      </div>

      {/* 4. DISCHARGE DESCRIPTION & TABLE */}
      <div className="my-1 avoid-break">
        <h3 className="text-[13px] font-bold text-black m-0 mb-1">
          Discharge Description:
        </h3>
      </div>

      <table className="diagnosis-table w-full border-collapse text-[12.5px] mb-3 border border-gray-600 avoid-break">
        <thead>
          <tr className="border-b border-gray-600 bg-white">
            <th className="border border-gray-600 px-2 py-1 text-center font-bold" style={{ width: "7%" }}>
              S No
            </th>
            <th className="border border-gray-600 px-2 py-1 text-left font-bold" style={{ width: "17%" }}>
              Diagnosis Code
            </th>
            <th className="border border-gray-600 px-2 py-1 text-center font-bold" style={{ width: "76%" }}>
              Diagnosis Name
            </th>
          </tr>
        </thead>
        <tbody>
          {diagnoses.map((item, idx) => (
            <tr key={idx} className="border-b border-gray-600">
              <td className="border border-gray-600 px-2 py-1 text-center font-normal">
                {item.sNo ?? idx + 1}
              </td>
              <td className="border border-gray-600 px-2 py-1 font-normal text-left">
                {item.code}
              </td>
              <td className="border border-gray-600 px-2 py-1 font-normal text-left">
                {item.name}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 5. CLINICAL CONTENT */}
      <div className="text-[12.5px] leading-snug space-y-3 text-black">
        {/* DIAGNOSIS */}
        {diagnosisText && diagnosisText.length > 0 && (
          <div className="avoid-break">
            <h4 className="font-bold underline uppercase text-[12.5px] mb-1 m-0">
              DIAGNOSIS:
            </h4>
            <div className="space-y-0.5">
              {diagnosisText.map((line, idx) => (
                <p key={idx} className="m-0 leading-tight">
                  {line}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* PRESENTING COMPLAINTS */}
        {presentingComplaints && presentingComplaints.length > 0 && (
          <div className="avoid-break">
            <h4 className="font-bold underline uppercase text-[12.5px] mb-1 m-0">
              PRESENTING COMPLAINTS
            </h4>
            <div className="space-y-1">
              {presentingComplaints.map((line, idx) => (
                <p key={idx} className="m-0 leading-tight uppercase">
                  {line}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* HOPI */}
        {hopi && hopi.length > 0 && (
          <div className="avoid-break">
            <h4 className="font-bold underline uppercase text-[12.5px] mb-1 m-0">
              HOPI
            </h4>
            <div className="space-y-1">
              {hopi.map((line, idx) => (
                <p key={idx} className="m-0 leading-tight uppercase">
                  {line}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* PAST HISTORY */}
        {pastHistory && pastHistory.length > 0 && (
          <div className="avoid-break">
            <h4 className="font-bold underline uppercase text-[12.5px] mb-1 m-0">
              PAST HISTORY:
            </h4>
            <div className="space-y-1">
              {pastHistory.map((line, idx) => (
                <p key={idx} className="m-0 leading-tight uppercase">
                  {line}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* EXAMINATION */}
        {examination && examination.length > 0 && (
          <div className="avoid-break">
            <h4 className="font-bold underline uppercase text-[12.5px] mb-1 m-0">
              EXAMINATION:
            </h4>
            <div className="space-y-1">
              {examination.map((line, idx) => (
                <p key={idx} className="m-0 leading-tight uppercase">
                  {line}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* INVESTIGATION */}
        {investigation && investigation.length > 0 && (
          <div className="avoid-break">
            <h4 className="font-bold underline uppercase text-[12.5px] mb-1 m-0">
              INVESTIGATION:
            </h4>
            <div className="space-y-1">
              {investigation.map((line, idx) => (
                <p key={idx} className="m-0 leading-tight uppercase">
                  {line}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* TREATMENT */}
        {treatment && treatment.length > 0 && (
          <div className="avoid-break">
            <h4 className="font-bold underline uppercase text-[12.5px] mb-1 m-0">
              TREATMENT:
            </h4>
            <div className="space-y-1">
              {treatment.map((line, idx) => (
                <p key={idx} className="m-0 leading-tight uppercase">
                  {line}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* HOSPITAL COURSE */}
        {hospitalCourse && hospitalCourse.length > 0 && (
          <div className="avoid-break">
            <h4 className="font-bold underline uppercase text-[12.5px] mb-1 m-0">
              HOSPITAL COURSE:
            </h4>
            <div className="space-y-1">
              {hospitalCourse.map((line, idx) => (
                <p key={idx} className="m-0 leading-tight uppercase">
                  {line}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* DISCHARGE ADVICE */}
        {dischargeAdvice && dischargeAdvice.length > 0 && (
          <div className="avoid-break">
            <h4 className="font-bold underline uppercase text-[12.5px] mb-1 m-0">
              DISCHARGE ADVICE:
            </h4>
            <div className="space-y-1">
              {dischargeAdvice.map((line, idx) => (
                <p key={idx} className="m-0 leading-tight uppercase">
                  {line}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* FOLLOW UP */}
        {followUp && followUp.length > 0 && (
          <div className="avoid-break">
            <h4 className="font-bold underline uppercase text-[12.5px] mb-1 m-0">
              FOLLOW UP:
            </h4>
            <div className="space-y-1">
              {followUp.map((line, idx) => (
                <p key={idx} className="m-0 leading-tight uppercase">
                  {line}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 6. SIGNATURE SECTION */}
      <div className="signature-section pt-6 mt-6 border-t border-black avoid-break">
        <div className="flex justify-between items-end text-[12.5px] text-black">
          {/* Left: Prepared By */}
          <div className="w-1/2 pr-4 space-y-1.5">
            <p className="font-bold m-0 mb-3">Prepared By</p>
            <p className="m-0 flex items-baseline">
              <span className="font-semibold w-24 shrink-0">Name:</span>
              <span className="border-b border-black flex-1 font-normal text-slate-800">________________________</span>
            </p>
            <p className="m-0 flex items-baseline">
              <span className="font-semibold w-24 shrink-0">Designation:</span>
              <span className="border-b border-black flex-1 font-normal text-slate-800">__________________</span>
            </p>
            <p className="m-0 flex items-baseline">
              <span className="font-semibold w-24 shrink-0">Date:</span>
              <span className="border-b border-black flex-1 font-normal text-slate-800">________________________</span>
            </p>
          </div>

          {/* Right (Bottom-Right Corner): Doctor's Signature */}
          <div className="w-1/2 pl-4 text-right flex flex-col items-end justify-end space-y-1">
            {/* Signature Graphic / Blank Signature Space */}
            <div className="h-14 flex items-end justify-end mb-1">
              {data?.doctorSignature ? (
                <img
                  src={data.doctorSignature}
                  alt="Doctor's Signature"
                  className="h-12 w-auto max-w-[160px] object-contain"
                />
              ) : (
                <div className="w-44 border-b border-black h-10"></div>
              )}
            </div>

            <p className="font-bold text-[13px] text-black m-0 tracking-wide uppercase">
              Doctor's Signature
            </p>
            <p className="m-0 text-[12px] font-semibold text-slate-900">
              {doctor || "Dr. Aneesh Basheer"}
            </p>
            <p className="m-0 text-[11.5px] text-slate-700">
              Consultant / Attending Physician
            </p>
          </div>
        </div>
      </div>

      {/* 7. PROFESSIONAL DOCUMENT FOOTER */}
      <div className="document-footer pt-3 mt-6 border-t border-black text-center text-[10.5px] text-black avoid-break">
        <p className="m-0 font-bold uppercase tracking-tight">
          SRM MEDICAL COLLEGE HOSPITAL &amp; RESEARCH CENTRE &nbsp;|&nbsp; DISCHARGE SUMMARY &nbsp;|&nbsp; UHID: {uhidNo}
        </p>
        <p className="m-0 text-[9.5px] text-gray-700 mt-0.5 italic">
          This document is part of the patient's official medical record.
        </p>
      </div>
    </div>
  );
};

export default DischargeSummaryDocument;
