import {
  Home,
  ShieldCheck,
  Users,
  FileText,
  LayoutDashboard,
  type LucideIcon,
} from "lucide-react"
import { lazy } from "react"

export interface SubMenuItem {
  title: string
  url: string
  icon: LucideIcon
}

export interface MenuItem {
  title: string
  url: string
  icon: LucideIcon
  badge?: string
  items?: SubMenuItem[]
}

export const getMenuConfig = (role?: string): MenuItem[] => {
  if (role === 'admin') {
    return [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Admin",
        url: "/admin/students",
        icon: ShieldCheck,
        items: [
          {
            title: "Student",
            url: "/admin/students",
            icon: Users,
          },
          {
            title: "Report",
            url: "/admin/reports",
            icon: FileText,
          },
        ],
      },
    ]
  }

  return [
    {
      title: "Admission",
      url: "/admission",
      icon: Home
    },
  ]
}

export const menuConfig: MenuItem[] = getMenuConfig()

// Routes configuration (public and protected)
export const getRoutes = () => {
  return [
    // ============ PUBLIC ROUTES ============
    {
      path: "/",
      name: "Login",
      component: lazy(() => import("@/pages/Login")),
      exact: true,
      protected: false,
    },
    {
      path: "/create",
      name: "CreateAccount",
      component: lazy(() => import("@/pages/CreateAccount")),
      exact: true,
      protected: false,
    },
    {
      path: "/verify-otp",
      name: "VerifyOtp",
      component: lazy(() => import("@/pages/VerifyOtp")),
      exact: true,
      protected: false,
    },

    // ============ PROTECTED ROUTES ============
    {
      path: "/dashboard",
      name: "Dashboard",
      component: lazy(() => import("@/pages/Admin/AdminCharts").then(m => ({ default: m.AdminCharts }))),
      exact: true,
      protected: true,
    },
    {
      path: "/admission",
      name: "Admission",
      component: lazy(() => import("@/pages/Home/HomeModule")),
      exact: true,
      protected: true,
    },
    {
      path: "/admission/application-details/:id",
      name: "AdmissionApplicationDetails",
      component: lazy(() => import("@/pages/Home/HomeModule")),
      exact: true,
      protected: true,
    },
    {
      path: "/admission/:stepSlug/:id",
      name: "AdmissionStepWithId",
      component: lazy(() => import("@/pages/Home/HomeModule")),
      exact: true,
      protected: true,
    },
    {
      path: "/admission/:stepSlug",
      name: "AdmissionStep",
      component: lazy(() => import("@/pages/Home/HomeModule")),
      exact: true,
      protected: true,
    },
    {
      path: "/admission/:id",
      name: "AdmissionWithId",
      component: lazy(() => import("@/pages/Home/HomeModule")),
      exact: true,
      protected: true,
    },

    // ============ ADMIN PROTECTED ROUTES ============
    {
      path: "/admin/students",
      name: "AdminStudents",
      component: lazy(() => import("@/pages/Admin/AdminStudents").then(m => ({ default: m.AdminStudents }))),
      exact: true,
      protected: true,
    },
    {
      path: "/admin/reports",
      name: "AdminReports",
      component: lazy(() => import("@/pages/Admin/AdminReports").then(m => ({ default: m.AdminReports }))),
      exact: true,
      protected: true,
    },
  ]
}