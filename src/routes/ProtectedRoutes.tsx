import { type ReactNode, useEffect, useRef } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { toast } from "@/components/ui/toast"
import { useAuthStore } from "@/store/useAuthStore"

interface ProtectedRoutesProps {
  children: ReactNode
  isAuthenticated?: boolean
  redirectTo?: string
  requiredRoles?: string[]
  loadingComponent?: ReactNode
}

const ProtectedRoutes = ({
  children,
  isAuthenticated,
  redirectTo = "/",
  requiredRoles = [],
  loadingComponent,
}: ProtectedRoutesProps) => {
  const location = useLocation()
  const { user, isAuthenticated: storeAuth } = useAuthStore()
  const authStatus = isAuthenticated !== undefined ? isAuthenticated : storeAuth
  const hasShownToast = useRef(false)

  const userRoles = user?.roles || ["user"]

  const hasRequiredRole =
    requiredRoles.length === 0 ||
    requiredRoles.some((role) => userRoles.includes(role))

  useEffect(() => {
    if (!authStatus && !hasShownToast.current) {
      toast.error("Please login to access this page")
      hasShownToast.current = true
    } else if (authStatus && !hasRequiredRole && !hasShownToast.current) {
      toast.error("You don't have permission to access this page")
      hasShownToast.current = true
    } else if (authStatus && hasRequiredRole) {
      hasShownToast.current = false
    }
  }, [authStatus, hasRequiredRole])

  if (!authStatus) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  if (!hasRequiredRole) {
    return <Navigate to="/dashboard" replace />
  }

  if (loadingComponent) {
    return <>{loadingComponent}</>
  }

  return <>{children}</>
}

export default ProtectedRoutes