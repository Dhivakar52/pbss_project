import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FlaskConical,
  CalendarClock,
  User,
  Pill,
  Bed,
  Info,
  CheckCircle2,
  ExternalLink,
  ArrowLeft,
  Clock,
  Building,
  UserCheck,
  AlertTriangle,
  Stethoscope,
  LogOut,
  Siren,
  FileText,
  CheckCircle,
  FileSpreadsheet,
} from "lucide-react";
import { useNotifications, type NotificationItem } from "@/context/NotificationContext";

interface NotificationDetailModalProps {
  notification: NotificationItem | null;
  isOpen: boolean;
  onClose: () => void;
}

const typeIcons: Record<NotificationItem["type"], React.ReactNode> = {
  critical_lab: <AlertTriangle className="h-5 w-5 text-red-600 animate-pulse" />,
  lab_result: <FlaskConical className="h-5 w-5 text-purple-600" />,
  appointment: <CalendarClock className="h-5 w-5 text-blue-600" />,
  patient: <User className="h-5 w-5 text-emerald-600" />,
  doctor: <Stethoscope className="h-5 w-5 text-indigo-600" />,
  prescription: <Pill className="h-5 w-5 text-amber-600" />,
  admission: <Bed className="h-5 w-5 text-cyan-600" />,
  discharge: <LogOut className="h-5 w-5 text-teal-600" />,
  emergency: <Siren className="h-5 w-5 text-red-600" />,
  document: <FileText className="h-5 w-5 text-slate-600" />,
  approval: <CheckCircle className="h-5 w-5 text-blue-600" />,
  system: <Info className="h-5 w-5 text-slate-600" />,
};

const priorityStyles: Record<NotificationItem["priority"], string> = {
  Critical: "bg-red-600 text-white border-red-700",
  High: "bg-amber-500 text-white border-amber-600",
  Medium: "bg-blue-500 text-white border-blue-600",
  Low: "bg-slate-400 text-white border-slate-500",
};

export const NotificationDetailModal: React.FC<NotificationDetailModalProps> = ({
  notification,
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const { markAsRead } = useNotifications();

  if (!notification) return null;

  const handleMarkRead = () => {
    markAsRead(notification.id);
  };

  const handleNavigateToRecord = () => {
    onClose();
    if (notification.referenceType === "Patient") {
      navigate("/registered-patients");
    } else if (notification.type === "appointment") {
      navigate("/revisit-records");
    } else if (notification.type === "patient" && notification.department === "Obstetrics") {
      navigate("/registered-anc-records");
    } else {
      navigate("/registered-patients");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className=" p-0  rounded-2xl border border-slate-200 shadow-2xl flex flex-col"
      style={{ maxWidth: "min(920px, 90vw)" }}>
        {/* Fixed Header */}
        <DialogHeader className="bg-slate-50/90 px-6 py-4 border-b border-slate-200/80 shrink-0">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 px-2.5 text-slate-600 hover:text-slate-900 gap-1.5 text-[12.5px] cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>

              <span className="text-slate-300 font-light">|</span>

              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
                  {typeIcons[notification.type]}
                </div>
                <div>
                  <DialogTitle className="text-base font-bold text-slate-900">
                    Notification Details
                  </DialogTitle>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Badge className={`text-[11px] font-semibold px-2.5 py-0.5 ${priorityStyles[notification.priority]}`}>
                {notification.priority} Priority
              </Badge>

              {notification.unread ? (
                <Badge variant="outline" className="text-[11px] font-semibold bg-blue-50 text-blue-700 border-blue-200 px-2 py-0.5">
                  Unread
                </Badge>
              ) : (
                <Badge variant="outline" className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 px-2 py-0.5">
                  <CheckCircle2 className="h-3 w-3" />
                  Read
                </Badge>
              )}
            </div>
          </div>

          <DialogDescription className="text-xs text-muted-foreground mt-1 text-left pl-1">
            Received on <span className="font-medium text-slate-700">{notification.date}</span> at <span className="font-medium text-slate-700">{notification.time}</span>
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Body Content */}
        <div className="px-6 py-6 space-y-6 overflow-y-auto flex-1 max-h-[60vh]">
          {/* Notification Title */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 leading-snug">
              {notification.title}
            </h3>
          </div>

          {/* Full Description Section */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Full Description & Clinical Note
            </span>
            <div className="text-[13.5px] text-slate-700 leading-relaxed bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 shadow-2xs whitespace-pre-line">
              {notification.description}
            </div>
          </div>

          {/* Patient & Reference Metadata Grid */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Patient & Reference Details
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-[13px] bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs">
              {notification.patientName && (
                <div className="space-y-1">
                  <span className="text-[11px] text-slate-500 flex items-center gap-1.5 font-medium">
                    <User className="h-3.5 w-3.5 text-blue-600" /> Patient Name
                  </span>
                  <p className="font-bold text-slate-900 text-[14px]">
                    {notification.patientName}
                  </p>
                </div>
              )}

              {notification.patientId && (
                <div className="space-y-1">
                  <span className="text-[11px] text-slate-500 flex items-center gap-1.5 font-medium">
                    <UserCheck className="h-3.5 w-3.5 text-blue-600" /> UHID / Patient ID
                  </span>
                  <p className="font-bold text-slate-900 font-mono text-[14px]">
                    {notification.patientId}
                  </p>
                </div>
              )}

              {notification.department && (
                <div className="space-y-1">
                  <span className="text-[11px] text-slate-500 flex items-center gap-1.5 font-medium">
                    <Building className="h-3.5 w-3.5 text-blue-600" /> Department
                  </span>
                  <p className="font-semibold text-slate-800">
                    {notification.department}
                  </p>
                </div>
              )}

              {notification.referenceId && (
                <div className="space-y-1">
                  <span className="text-[11px] text-slate-500 flex items-center gap-1.5 font-medium">
                    <FileSpreadsheet className="h-3.5 w-3.5 text-blue-600" /> Reference No
                  </span>
                  <p className="font-semibold text-slate-800 font-mono">
                    {notification.referenceId}
                  </p>
                </div>
              )}

              {notification.createdBy && (
                <div className="space-y-1">
                  <span className="text-[11px] text-slate-500 flex items-center gap-1.5 font-medium">
                    <Info className="h-3.5 w-3.5 text-blue-600" /> Created / Triggered By
                  </span>
                  <p className="font-medium text-slate-800">
                    {notification.createdBy}
                  </p>
                </div>
              )}

              <div className="space-y-1">
                <span className="text-[11px] text-slate-500 flex items-center gap-1.5 font-medium">
                  <Clock className="h-3.5 w-3.5 text-blue-600" /> Date & Time
                </span>
                <p className="font-medium text-slate-800">
                  {notification.date} - {notification.time}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="px-6 py-4 bg-slate-50/90 border-t border-slate-200/80 shrink-0 flex items-center justify-between">
          <div>
            {notification.unread && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkRead}
                className="text-[13px] gap-1.5 border-blue-200 text-blue-700 hover:bg-blue-50 cursor-pointer font-medium"
              >
                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                Mark as Read
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-[13px] px-4 font-medium cursor-pointer"
            >
              Close
            </Button>
            {notification.referenceId && (
              <Button
                size="sm"
                onClick={handleNavigateToRecord}
                className="text-[13px] gap-1.5 text-white cursor-pointer px-4 font-medium"
                style={{ background: "var(--blue-btn)" }}
              >
                <ExternalLink className="h-4 w-4" />
                Open Related Record
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
