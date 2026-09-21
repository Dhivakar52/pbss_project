import React from "react";
import { createPortal } from "react-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, X, FileText } from "lucide-react";
import { DischargeSummaryDocument } from "./DischargeSummaryDocument";

interface PatientPrintPreviewModalProps {
  patient: {
    id: string; // UHID
    opNo?: string;
    patientName: string;
    title?: string;
    fhwo?: string;
    gender?: string;
    age?: number | string;
    phone?: string;
    address?: string;
    city?: string;
    department?: string;
    doctor?: string;
    registrationDate?: string;
    ipNo?: string;
    admitDate?: string;
    ward?: string;
    abhaId?: string;
    dischargeDate?: string;
    unit?: string;
    mlcStatus?: string;
    diagnoses?: any[];
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
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PatientPrintPreviewModal: React.FC<PatientPrintPreviewModalProps> = ({
  patient,
  isOpen,
  onClose,
}) => {
  React.useEffect(() => {
    if (isOpen) {
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
      }
      setTimeout(() => {
        const modalContent = document.querySelector('[role="dialog"]');
        if (modalContent) {
          modalContent.scrollTop = 0;
          modalContent.scrollLeft = 0;
        }
        const printContainers = document.querySelectorAll(
          '.print-discharge-summary-standalone, .discharge-summary-print, #printable-discharge-summary'
        );
        printContainers.forEach((el) => {
          el.scrollTop = 0;
          el.scrollLeft = 0;
        });
      }, 0);
    }
  }, [isOpen]);

  if (!patient) return null;

  const handlePrint = () => {
    // 1. Scroll main window to top
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
    }

    // 2. Reset modal scroll container
    const modalContent = document.querySelector('[role="dialog"]');
    if (modalContent) {
      modalContent.scrollTop = 0;
      modalContent.scrollLeft = 0;
    }

    // 3. Reset standalone print container
    const printContainers = document.querySelectorAll(
      '.print-discharge-summary-standalone, .discharge-summary-print, #printable-discharge-summary'
    );
    printContainers.forEach((el) => {
      el.scrollTop = 0;
      el.scrollLeft = 0;
    });

    // 4. Trigger print
    setTimeout(() => {
      window.print();
    }, 50);
  };

  const patientTitle = patient.title ? `${patient.title}. ` : "";
  const rawName = patient.patientName || "";
  const hasTitlePrefix = rawName.startsWith("Mr.") || rawName.startsWith("Mrs.") || rawName.startsWith("Ms.") || rawName.startsWith("Dr.");
  const fullPatientName = hasTitlePrefix ? rawName : `${patientTitle}${rawName}`;

  const dischargeData = {
    ipNo: patient.ipNo || patient.opNo || "25106887",
    patientName: fullPatientName || "Mr.MUNIYANDI",
    department: patient.department || "General Medicine",
    admitDate: patient.admitDate || patient.registrationDate || "15-Dec-2025 13:44",
    ward: patient.ward || "Male Medical",
    abhaId: patient.abhaId || "",
    uhidNo: patient.id || "2689068",
    genderAge: patient.gender && patient.age ? `${patient.gender} / ${patient.age}` : "Male / 54Y 2M 19D",
    doctor: patient.doctor || "Aneesh Basheer",
    doctorSignature: (patient as any).doctorSignature || (patient as any).signature || "",
    dischargeDate: patient.dischargeDate || "18-Dec-2025 16:00",
    unit: patient.unit || "UNIT-7",
    mlcStatus: patient.mlcStatus || "Non MLC",
    diagnoses: patient.diagnoses,
    diagnosisText: patient.diagnosisText,
    presentingComplaints: patient.presentingComplaints,
    hopi: patient.hopi,
    pastHistory: patient.pastHistory,
    examination: patient.examination,
    investigation: patient.investigation,
    treatment: patient.treatment,
    hospitalCourse: patient.hospitalCourse,
    dischargeAdvice: patient.dischargeAdvice,
    followUp: patient.followUp,
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent 
          className="p-0 rounded-xl border border-slate-200 overflow-y-auto max-h-[90vh] print:hidden"
          style={{
            maxWidth: "850px",
          }}
        >
          <DialogHeader className="bg-slate-50 px-6 py-4 border-b border-slate-100 print:hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900">
                <FileText className="h-5 w-5 text-blue-600" />
                <DialogTitle className="text-base font-semibold">
                  Discharge Summary Print Preview
                </DialogTitle>
              </div>
            </div>
            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
              Formatted for standard A4 document printing
            </DialogDescription>
          </DialogHeader>

          {/* Screen Preview Container */}
          <div className="p-6 bg-slate-100 flex justify-center print:hidden">
            <DischargeSummaryDocument data={dischargeData} />
          </div>

          {/* Action Buttons */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between print:hidden">
            <Button variant="outline" size="sm" onClick={onClose} className="text-[12.5px] cursor-pointer">
              <X className="h-3.5 w-3.5 mr-1" /> Close
            </Button>

            <Button
              size="sm"
              onClick={handlePrint}
              className="text-[12.5px] gap-1.5 text-white cursor-pointer"
              style={{ background: "var(--blue-btn)" }}
            >
              <Printer className="h-3.5 w-3.5" />
              Print Discharge Summary
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Standalone Print-Only Portal attached directly to document.body */}
      {isOpen &&
        createPortal(
          <div className="print-discharge-summary-standalone">
            <DischargeSummaryDocument data={dischargeData} />
          </div>,
          document.body
        )}
    </>
  );
};
