import * as React from "react"
import { cn } from "@/lib/utils"
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Trash2,
  AlertCircle,
  X,
} from "lucide-react"

export type ToastVariant = "success" | "error" | "warning" | "info" | "delete" | "validation"

export interface ToastMessage {
  id: string
  title?: string
  description?: string
  variant?: ToastVariant
  duration?: number
}

type ToastListener = (toasts: ToastMessage[]) => void

class ToastManager {
  private toasts: ToastMessage[] = []
  private listeners: Set<ToastListener> = new Set()
  private recentMessages: Set<string> = new Set()

  subscribe(listener: ToastListener) {
    this.listeners.add(listener)
    listener(this.toasts)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private notifyListeners() {
    this.listeners.forEach((l) => l([...this.toasts]))
  }

  show(props: { title?: string; description?: string; variant?: ToastVariant; duration?: number }) {
    const key = `${props.variant || "info"}:${props.title || ""}:${props.description || ""}`
    if (this.recentMessages.has(key)) {
      return
    }

    this.recentMessages.add(key)
    setTimeout(() => {
      this.recentMessages.delete(key)
    }, 1500)

    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
    const duration = props.duration ?? 3500

    const newToast: ToastMessage = {
      id,
      title: props.title,
      description: props.description,
      variant: props.variant || "info",
      duration,
    }

    // Keep max 5 active toasts
    this.toasts = [newToast, ...this.toasts.slice(0, 4)]
    this.notifyListeners()

    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(id)
      }, duration)
    }
  }

  dismiss(id: string) {
    this.toasts = this.toasts.filter((t) => t.id !== id)
    this.notifyListeners()
  }

  success(title: string, description?: string) {
    this.show({ title, description, variant: "success" })
  }

  error(title: string, description?: string) {
    this.show({ title, description, variant: "error" })
  }

  warning(title: string, description?: string) {
    this.show({ title, description, variant: "warning" })
  }

  info(title: string, description?: string) {
    this.show({ title, description, variant: "info" })
  }

  delete(title: string, description?: string) {
    this.show({ title, description, variant: "delete" })
  }

  validation(title: string, description?: string) {
    this.show({ title, description, variant: "validation" })
  }
}

export const toastManager = new ToastManager()

export const toast = {
  success: (title: string, description?: string) => toastManager.success(title, description),
  error: (title: string, description?: string) => toastManager.error(title, description),
  warning: (title: string, description?: string) => toastManager.warning(title, description),
  info: (title: string, description?: string) => toastManager.info(title, description),
  delete: (title: string, description?: string) => toastManager.delete(title, description),
  validation: (title: string, description?: string) => toastManager.validation(title, description),
  dismiss: (id: string) => toastManager.dismiss(id),
}

export function useToast() {
  const [toasts, setToasts] = React.useState<ToastMessage[]>([])

  React.useEffect(() => {
    return toastManager.subscribe(setToasts)
  }, [])

  return {
    toasts,
    toast,
    dismiss: (id: string) => toastManager.dismiss(id),
  }
}

const variantStyles: Record<ToastVariant, { bg: string; border: string; text: string; icon: React.ReactNode }> = {
  success: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-900",
    icon: <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />,
  },
  error: {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-900",
    icon: <XCircle className="h-5 w-5 text-red-600 shrink-0" />,
  },
  warning: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-900",
    icon: <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />,
  },
  info: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-900",
    icon: <Info className="h-5 w-5 text-blue-600 shrink-0" />,
  },
  delete: {
    bg: "bg-rose-50",
    border: "border-rose-200",
    text: "text-rose-900",
    icon: <Trash2 className="h-5 w-5 text-rose-600 shrink-0" />,
  },
  validation: {
    bg: "bg-yellow-50",
    border: "border-yellow-300",
    text: "text-yellow-900",
    icon: <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0" />,
  },
}

export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <div
      aria-live="polite"
      className="fixed top-4 right-4 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((t) => {
        const style = variantStyles[t.variant || "info"]
        return (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-lg border p-3.5 shadow-lg transition-all duration-300 animate-in fade-in-0 slide-in-from-top-3",
              style.bg,
              style.border,
              style.text
            )}
          >
            {style.icon}
            <div className="flex-1 min-w-0 pt-0.5">
              {t.title && <div className="text-sm font-semibold leading-tight">{t.title}</div>}
              {t.description && (
                <div className="text-xs opacity-90 mt-0.5 leading-normal">{t.description}</div>
              )}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              className="rounded-md p-1 opacity-60 hover:opacity-100 transition-opacity focus:outline-none shrink-0"
              aria-label="Close toast"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
