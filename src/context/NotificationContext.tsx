import React, { createContext, useContext, useState } from "react";
import { notify } from "@/lib/notify";

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  type:
    | "lab_result"
    | "appointment"
    | "patient"
    | "prescription"
    | "admission"
    | "system"
    | "critical_lab"
    | "doctor"
    | "discharge"
    | "emergency"
    | "document"
    | "approval";
  priority: "Critical" | "High" | "Medium" | "Low";
  patientName?: string;
  patientId?: string;
  department?: string;
  referenceId?: string;
  referenceType?: "Patient" | "Appointment" | "LabResult" | "Prescription" | "Admission";
  createdBy?: string;
  date: string;
  time: string;
  unread: boolean;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Critical Blood Test Result",
    description: "Hemoglobin level is 6.8 g/dL for Patient NITESH KUMAR. Immediate clinical review recommended.",
    type: "critical_lab",
    priority: "Critical",
    patientName: "NITESH KUMAR",
    patientId: "3995988",
    department: "Hematology Lab",
    referenceId: "3995988",
    referenceType: "Patient",
    createdBy: "Dr. Anitha (Lab Incharge)",
    date: "03 Aug 2026",
    time: "17:45",
    unread: true,
  },
  {
    id: "notif-2",
    title: "OP Revisit Consultation Scheduled",
    description: "Mrs. SUVETHA has booked an OP revisit consultation for Urology.",
    type: "appointment",
    priority: "Medium",
    patientName: "SUVETHA",
    patientId: "3489205",
    department: "Urology",
    referenceId: "3489205",
    referenceType: "Patient",
    createdBy: "OP Reception",
    date: "03 Aug 2026",
    time: "16:30",
    unread: true,
  },
  {
    id: "notif-3",
    title: "Antenatal Record Registration Update",
    description: "ANC Record #263208 created for patient AMUTHA in Obstetrics Department.",
    type: "patient",
    priority: "Low",
    patientName: "AMUTHA",
    patientId: "4282176",
    department: "Obstetrics",
    referenceId: "4282176",
    referenceType: "Patient",
    createdBy: "Sister Mary",
    date: "03 Aug 2026",
    time: "14:04",
    unread: true,
  },
  {
    id: "notif-4",
    title: "Emergency Prescription Dispensed",
    description: "Stat IV Antibiotics order completed by Central Pharmacy for ER Ward Bed 4.",
    type: "prescription",
    priority: "High",
    patientName: "ERGAMREDDY SHARMILA",
    patientId: "4137281",
    department: "Central Pharmacy",
    referenceId: "4137281",
    referenceType: "Patient",
    createdBy: "Pharmacist Rajesh",
    date: "02 Aug 2026",
    time: "21:10",
    unread: false,
  },
  {
    id: "notif-5",
    title: "IP Admission Transfer Approved",
    description: "Patient PRIYANSHU PANDA transferred from Casualty to ICU Bed 12.",
    type: "admission",
    priority: "High",
    patientName: "PRIYANSHU PANDA",
    patientId: "3709448",
    department: "ICU Ward",
    referenceId: "3709448",
    referenceType: "Patient",
    createdBy: "Dr. Sathish Babu",
    date: "02 Aug 2026",
    time: "19:15",
    unread: false,
  },
];

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  loadingId: string | null;
  isMarkingAll: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  getNotificationById: (id: string) => NotificationItem | undefined;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAsRead = async (id: string) => {
    if (loadingId === id) return;
    setLoadingId(id);
    try {
      await new Promise((res) => setTimeout(res, 300));
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
      );
    } catch (err) {
      notify.serverError("Failed to update notification state. Please try again.");
    } finally {
      setLoadingId(null);
    }
  };

  const markAllAsRead = async () => {
    if (isMarkingAll || unreadCount === 0) return;
    setIsMarkingAll(true);
    try {
      await new Promise((res) => setTimeout(res, 400));
      setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
      notify.updateSuccess("All notifications marked as read.");
    } catch (err) {
      notify.serverError("Failed to mark all as read.");
    } finally {
      setIsMarkingAll(false);
    }
  };

  const getNotificationById = (id: string) => {
    return notifications.find((n) => n.id === id);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loadingId,
        isMarkingAll,
        markAsRead,
        markAllAsRead,
        getNotificationById,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};
