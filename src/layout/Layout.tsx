import { Header } from "../components/Header"
import { Outlet } from "react-router-dom"

interface LayoutProps {
  children?: React.ReactNode
  user?: {
    name: string
    email: string
    avatar?: string
    initials?: string
  }
  notificationCount?: number
  breadcrumbItems?: {
    label: string
    href?: string
  }[]
}

export function Layout({
  children,
  breadcrumbItems = []
}: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen w-full bg-background">
      <Header breadcrumbItems={breadcrumbItems} />
      <main className="flex-1 p-4 md:p-6 layerBg">{children || <Outlet />}</main>
    </div>
  )
}

