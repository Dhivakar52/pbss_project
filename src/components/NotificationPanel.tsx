import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Bell,
  CheckCheck,
  Inbox,
  FlaskConical,
  CalendarClock,
  User,
  Pill,
  Bed,
  Info,
  ListFilter,
  AlertTriangle,
  Stethoscope,
  LogOut,
  Siren,
  FileText,
  CheckCircle,
  Loader2,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotifications, type NotificationItem } from "@/context/NotificationContext";
import { NotificationDetailModal } from "./NotificationDetailModal";

const typeIcons: Record<NotificationItem["type"], React.ReactNode> = {
  critical_lab: <AlertTriangle className="h-4 w-4 text-red-600 animate-pulse" />,
  lab_result: <FlaskConical className="h-4 w-4 text-purple-600" />,
  appointment: <CalendarClock className="h-4 w-4 text-blue-600" />,
  patient: <User className="h-4 w-4 text-emerald-600" />,
  doctor: <Stethoscope className="h-4 w-4 text-indigo-600" />,
  prescription: <Pill className="h-4 w-4 text-amber-600" />,
  admission: <Bed className="h-4 w-4 text-cyan-600" />,
  discharge: <LogOut className="h-4 w-4 text-teal-600" />,
  emergency: <Siren className="h-4 w-4 text-red-600" />,
  document: <FileText className="h-4 w-4 text-slate-600" />,
  approval: <CheckCircle className="h-4 w-4 text-blue-600" />,
  system: <Info className="h-4 w-4 text-slate-600" />,
};

const typeBgs: Record<NotificationItem["type"], string> = {
  critical_lab: "bg-red-100",
  lab_result: "bg-purple-100",
  appointment: "bg-blue-100",
  patient: "bg-emerald-100",
  doctor: "bg-indigo-100",
  prescription: "bg-amber-100",
  admission: "bg-cyan-100",
  discharge: "bg-teal-100",
  emergency: "bg-red-100",
  document: "bg-slate-100",
  approval: "bg-blue-100",
  system: "bg-slate-100",
};

const priorityBadges: Record<NotificationItem["priority"], { label: string; className: string }> = {
  Critical: { label: "CRITICAL", className: "bg-red-600 text-white border-none" },
  High: { label: "HIGH", className: "bg-amber-500 text-white border-none" },
  Medium: { label: "MEDIUM", className: "bg-blue-500 text-white border-none" },
  Low: { label: "LOW", className: "bg-slate-400 text-white border-none" },
};

export const NotificationPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [filterTab, setFilterTab] = useState<"all" | "unread">("all");
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);

  const {
    notifications,
    unreadCount,
    loadingId,
    isMarkingAll,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const displayedNotifications = React.useMemo(() => {
    if (filterTab === "unread") {
      return notifications.filter((n) => n.unread);
    }
    return notifications;
  }, [notifications, filterTab]);

  const handleItemClick = (n: NotificationItem) => {
    if (n.unread) {
      markAsRead(n.id);
    }
    setSelectedNotification(n);
  };

  const handleSingleMarkRead = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    markAsRead(id);
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger >
          <Button variant="ghost" size="icon" className="relative cursor-pointer">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[10px] bg-red-600 hover:bg-red-700 border-none flex items-center justify-center font-bold">
                {unreadCount > 99 ? "99+" : unreadCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>

        {/* Custom Side Panel (Drawer Overlay from Right) */}
        <SheetContent
          side="right"
          className="w-full flex flex-col p-0 h-screen rounded-l-2xl shadow-2xl border-l"
           style={{ maxWidth: "min(560px, 90vw)" }}
        >
          {/* Header */}
          <SheetHeader className="border-b px-5 py-4 shrink-0 bg-slate-50/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                  <Bell className="h-4.5 w-4.5" />
                </div>
                <div>
                  <SheetTitle className="text-base font-bold text-slate-900">
                    Notifications
                  </SheetTitle>
                  <SheetDescription className="text-xs text-muted-foreground mt-0.5">
                    {unreadCount > 0
                      ? `${unreadCount} unread hospital alert${unreadCount > 1 ? "s" : ""}`
                      : "You're all caught up."}
                  </SheetDescription>
                </div>
              </div>

              {unreadCount > 0 && (
                <Badge variant="secondary" className="font-semibold text-[11px] bg-blue-100 text-blue-800">
                  {unreadCount} unread
                </Badge>
              )}
            </div>

            {/* Filter Tabs & Header Actions */}
            <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-slate-200/80">
              <div className="flex items-center gap-2">
                <Button
                  variant={filterTab === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterTab("all")}
                  className="h-7 text-[12px] px-3 font-medium cursor-pointer"
                  style={filterTab === "all" ? { background: "var(--blue-btn)", color: "white" } : {}}
                >
                  All ({notifications.length})
                </Button>
                <Button
                  variant={filterTab === "unread" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterTab("unread")}
                  className="h-7 text-[12px] px-3 font-medium cursor-pointer"
                  style={filterTab === "unread" ? { background: "var(--blue-btn)", color: "white" } : {}}
                >
                  Unread ({unreadCount})
                </Button>
              </div>

              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  disabled={isMarkingAll}
                  className="h-7 text-[11.5px] px-2 font-medium text-blue-700 hover:text-blue-800 cursor-pointer gap-1"
                >
                  {isMarkingAll ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <CheckCheck className="h-3.5 w-3.5 text-blue-600" />
                  )}
                  Mark All Read
                </Button>
              )}
            </div>
          </SheetHeader>

          {/* Notification List */}
          {displayedNotifications.length > 0 ? (
            <ScrollArea className="flex-1 h-full">
              <div className="flex flex-col gap-2.5 p-3.5">
                {displayedNotifications.map((n) => {
                  const isLoading = loadingId === n.id;
                  const priority = priorityBadges[n.priority];

                  return (
                    <div
                      key={n.id}
                      onClick={() => handleItemClick(n)}
                      className={cn(
                        "flex gap-3 rounded-xl border p-3.5 text-left transition-all hover:shadow-md cursor-pointer relative group",
                        n.unread
                          ? "bg-blue-50/50 border-blue-200/90 shadow-2xs"
                          : "bg-white border-slate-200/80 opacity-90"
                      )}
                    >
                      {/* Icon */}
                      <div
                        className={cn(
                          "flex size-9 flex-shrink-0 items-center justify-center rounded-lg mt-0.5",
                          typeBgs[n.type]
                        )}
                      >
                        {typeIcons[n.type]}
                      </div>

                      {/* Content */}
                      <div className="flex flex-1 flex-col gap-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <span
                            className={cn(
                              "text-[13px] leading-tight truncate text-slate-900",
                              n.unread ? "font-bold" : "font-medium"
                            )}
                          >
                            {n.title}
                          </span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <Badge className={cn("text-[9.5px] px-1.5 py-0 h-4 font-semibold uppercase tracking-wider", priority.className)}>
                              {priority.label}
                            </Badge>
                            {n.unread && (
                              <span className="size-2 rounded-full bg-blue-600 shrink-0" />
                            )}
                          </div>
                        </div>

                        <p className="text-slate-600 text-[12px] line-clamp-2 leading-relaxed">
                          {n.description}
                        </p>

                        <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100 text-[11px] text-slate-500">
                          <span>
                            {n.date} • {n.time}
                          </span>

                          <div className="flex items-center gap-2">
                            {n.patientName && (
                              <span className="font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded text-[10.5px]">
                                {n.patientName}
                              </span>
                            )}

                            {/* Mark as Read Action Button */}
                            {n.unread && (
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={isLoading}
                                onClick={(e) => handleSingleMarkRead(e, n.id)}
                                className="h-6 text-[10.5px] px-2 font-medium bg-white hover:bg-blue-50 text-blue-700 border-blue-200 cursor-pointer gap-1"
                              >
                                {isLoading ? (
                                  <Loader2 className="h-3 w-3 animate-spin text-blue-600" />
                                ) : (
                                  <>
                                    <Check className="h-3 w-3 text-blue-600" />
                                    Mark Read
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-2.5 p-8 text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <Inbox className="h-7 w-7" />
              </div>
              <p className="text-sm font-bold text-slate-800">No new notifications</p>
              <p className="text-xs text-slate-500 max-w-[240px]">
                {filterTab === "unread"
                  ? "You're all caught up. No unread alerts at this time."
                  : "Notification history is empty."}
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="border-t p-3.5 shrink-0 bg-slate-50/80 flex flex-col gap-2">
            <Button
              className="w-full gap-2 text-[12.5px] cursor-pointer"
              variant="outline"
              onClick={() => setFilterTab("all")}
            >
              <ListFilter className="h-3.5 w-3.5" />
              View All Notifications ({notifications.length})
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Complete Notification Details View Modal */}
      <NotificationDetailModal
        notification={selectedNotification}
        isOpen={Boolean(selectedNotification)}
        onClose={() => setSelectedNotification(null)}
      />
    </>
  );
};

export default NotificationPanel;