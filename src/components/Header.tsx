import { Fragment, useState, useMemo } from "react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  UserPlus,
  LogOut,
  ChevronDown,
  Sun,
  Moon,
  Search,
  X,
  Menu,
} from "lucide-react"
import { NavLink, useLocation, useNavigate } from "react-router-dom"
import { useTheme } from "@/context/ThemeContext"
import { useAuthStore } from "@/store/useAuthStore"
import { toast } from "@/components/ui/toast"
import { getMenuConfig, type MenuItem } from "@/config/menu.config"
import Logo from "@/assets/images/logo.png"
import { cn } from "@/lib/utils"

interface HeaderProps {
  breadcrumbItems?: {
    label: string
    href?: string
  }[]
}

// ✅ Segments that should render fully uppercase (HIS module abbreviations).
const ACRONYMS = new Set(["op", "ip", "mrd", "anc", "uhid", "abha", "vip", "kin", "opd", "ipd"])

// Helper function to format breadcrumb labels
const formatLabel = (str: string): string => {
  const lowerStr = str.toLowerCase()
  if (ACRONYMS.has(lowerStr)) {
    return str.toUpperCase()
  }

  const wordMap: Record<string, string> = {
    'diagnosisentry': 'Diagnosisentry',
    'patientregistration': 'Patient Registration',
    'appointmentschedule': 'Appointment Schedule',
    'billingreport': 'Billing Report',
    'labtest': 'Lab Test',
    'bloodtest': 'Blood Test',
    'opconsultation': 'OP Consultation',
    'ippatient': 'IP Patient',
    'mrdrecord': 'MRD Record',
    'registration': 'Registration',
    'diagnosis': 'Diagnosis',
    'entry': 'Entry',
    'patient': 'Patient',
    'appointment': 'Appointment',
    'billing': 'Billing',
    'report': 'Report',
    'students': 'Student Master',
    'reports': 'Reports & Analytics',
    'charts': 'Analytics Charts',
    'admission': 'Admission',
    'dashboard': 'Dashboard',
  }

  if (wordMap[lowerStr]) {
    return wordMap[lowerStr]
  }

  const parts = str.split('-')
  if (parts.length > 1) {
    return parts
      .map(part => {
        const partLower = part.toLowerCase()
        if (ACRONYMS.has(partLower)) {
          return part.toUpperCase()
        }
        return part.charAt(0).toUpperCase() + part.slice(1)
      })
      .join(' ')
  }

  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function Header({
  breadcrumbItems = []
}: HeaderProps) {
  const { theme, toggleTheme } = useTheme()
  const { user, logout } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()
  const [search, setSearch] = useState("")
  const [mobileOpen, setMobileOpen] = useState(false)

  const isSearching = search.trim().length > 0

  const activeMenuConfig = useMemo(() => {
    return getMenuConfig(user?.role)
  }, [user?.role])

  // Checks if a url matches the current route or sub-route
  const isUrlActive = (url: string) => {
    if (location.pathname === url) return true;
    if (url === "/dashboard" && location.pathname === "/dashboard") return true;
    if (url === "/admission" && (location.pathname === "/admission" || location.pathname.startsWith("/admission/"))) return true;
    if (url.startsWith("/admin") && location.pathname.startsWith(url)) return true;
    return false;
  }

  // Checks if any child of a parent item is active
  const isParentActive = (item: MenuItem) =>
    item.items?.some((sub) => isUrlActive(sub.url))

  // Filtered menu for search
  const filteredMenu = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return activeMenuConfig

    return activeMenuConfig
      .map((item) => {
        const titleMatches = item.title.toLowerCase().includes(q)
        if (!item.items) {
          return titleMatches ? item : null
        }
        const matchingSubs = item.items.filter((sub) =>
          sub.title.toLowerCase().includes(q)
        )
        if (titleMatches) {
          return item
        }
        if (matchingSubs.length > 0) {
          return { ...item, items: matchingSubs }
        }
        return null
      })
      .filter(Boolean) as typeof activeMenuConfig
  }, [search, activeMenuConfig])

  // Parse the pathname and generate breadcrumbs
  const generateBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(segment => segment !== '')

    if (pathSegments.length === 0) {
      return [{ label: "Dashboard", href: undefined }]
    }

    const breadcrumbs: { label: string; href?: string }[] = []
    let currentPath = ''

    for (let i = 0; i < pathSegments.length; i++) {
      const segment = pathSegments[i]
      currentPath += `/${segment}`

      const label = formatLabel(segment)
      const isLast = i === pathSegments.length - 1

      breadcrumbs.push({
        label,
        href: isLast ? undefined : currentPath,
      })
    }

    return breadcrumbs
  }

  const items = breadcrumbItems.length > 0 ? breadcrumbItems : generateBreadcrumbs()

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/')
  }

  const profileMenuItems = [
    { label: "Profile", icon: UserPlus, url: "/profile" },
  ]

  const getUserInitials = () => {
    if (user?.name) {
      return user.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    if (user?.userId) {
      return user.userId.charAt(0).toUpperCase()
    }
    return 'U'
  }

  const getUserName = () => {
    return user?.name || user?.userId || 'User'
  }

  const getUserEmail = () => {
    return user?.userId || 'user@example.com'
  }

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Primary Top Header Bar with Cyan Blue Gradient & Lime Green Accent Line */}
      <div
        className="flex h-16 items-center justify-between px-4 sm:px-6 text-white"
        style={{
          background: "var(--app-gradient)",
        }}
      >
        {/* Left Section: Mobile Menu Trigger & Logo */}
        <div className="flex items-center gap-3">
          {/* Mobile Sheet Navigation Trigger */}
          <div className="flex xl:hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger
                render={
                  <button
                    type="button"
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors focus:outline-none"
                    aria-label="Open Navigation Menu"
                  >
                    <Menu className="h-5 w-5" />
                  </button>
                }
              />
              <SheetContent
                side="left"
                className="w-72 p-4 text-white border-r border-white/20 border-b-4 border-[#8dc63f]"
                style={{
                  background: "var(--app-gradient)",
                }}
              >
                <SheetHeader className="pb-3 border-b border-white/20 mb-3">
                  <SheetTitle className="text-white font-bold flex items-center gap-2.5">
                    <img src={Logo} className="h-8 w-auto object-contain shrink-0" alt="Logo" />
                    <div className="hidden md:flex flex-col leading-tight text-left">
                      <span className="text-xs font-extrabold uppercase tracking-wide">
                        Padma Seshadri Bala Bhavan
                      </span>
                      <span className="text-[10px] font-semibold text-white/90 uppercase">
                        Senior Secondary School
                      </span>
                    </div>
                  </SheetTitle>
                </SheetHeader>

                {/* Mobile Search */}
                <div className="relative flex items-center mb-4">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/70" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search menu..."
                    className="h-8 w-full rounded-md border border-white/20 bg-white/10 pl-8 pr-7 text-xs text-white placeholder:text-white/70 outline-none focus:border-white"
                  />
                  {isSearching && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Mobile Menu Items */}
                <div className="space-y-1 overflow-y-auto max-h-[calc(100vh-160px)]">
                  {filteredMenu.map((item) => {
                    if (!item.items) {
                      const isActive = isUrlActive(item.url)
                      return (
                        <NavLink
                          key={item.title}
                          to={item.url}
                          onClick={() => setMobileOpen(false)}
                          className={cn(
                            "flex items-center gap-2.5 px-3 py-2.5 rounded-md text-xs font-semibold transition-colors",
                            isActive
                              ? "bg-white/20 text-white font-bold"
                              : "text-white/90 hover:bg-white/10"
                          )}
                        >
                          <item.icon className="h-4 w-4 shrink-0" />
                          <span>{item.title}</span>
                          {item.badge && (
                            <Badge className="ml-auto text-[10px] bg-white/20 text-white border-white/30">
                              {item.badge}
                            </Badge>
                          )}
                        </NavLink>
                      )
                    }

                    const parentActive = isParentActive(item)
                    return (
                      <div key={item.title} className="space-y-1">
                        <div
                          className={cn(
                            "flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-bold text-white/80 uppercase tracking-wider mt-2",
                            parentActive && "text-white"
                          )}
                        >
                          <item.icon className="h-4 w-4 shrink-0 text-white/80" />
                          <span>{item.title}</span>
                        </div>
                        <div className="pl-4 space-y-1 border-l border-white/20 ml-3">
                          {item.items.map((sub) => {
                            const subActive = isUrlActive(sub.url)
                            return (
                              <NavLink
                                key={sub.title}
                                to={sub.url}
                                onClick={() => setMobileOpen(false)}
                                className={cn(
                                  "flex items-center gap-2 px-3 py-2 rounded-md text-xs transition-colors",
                                  subActive
                                    ? "bg-white/20 text-white font-bold"
                                    : "text-white/80 hover:bg-white/10"
                                )}
                              >
                                <sub.icon className="h-3.5 w-3.5 shrink-0" />
                                <span>{sub.title}</span>
                              </NavLink>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* School Logo & Title */}
          <NavLink to={user?.role === 'admin' ? "/dashboard" : "/admission"} className="flex items-center gap-3 shrink-0 group">
            <img
              src={Logo}
              className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
              alt="PADMA SESHADRI BALA BHAVAN Logo"
            />
            <div className="hidden md:flex flex-col leading-tight text-white select-none">
              <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wide drop-shadow-xs">
                Padma Seshadri Bala Bhavan
              </span>
              <span className="text-[10px] sm:text-[11px] font-semibold tracking-wider text-white/90 uppercase">
                Senior Secondary School
              </span>
            </div>
          </NavLink>
        </div>

        {/* Right Section: Search, Theme Toggle & Profile Dropdown */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Search (Desktop) */}
          <div className="hidden lg:flex relative items-center">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/70" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search menu..."
              className="h-8 w-44 lg:w-56 rounded-full border border-white/20 bg-white/10 pl-8 pr-7 text-xs text-white placeholder:text-white/70 outline-none focus:border-white focus:bg-white/20 transition-all"
            />
            {isSearching && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/70 hover:text-white cursor-pointer"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/20 cursor-pointer"
            aria-label="Toggle theme"
          >
            {theme === "light" ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </button>

          <Separator orientation="vertical" className="h-6 bg-white/20 hidden sm:block mx-0.5" />

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-full p-1 pl-1.5 pr-2.5 bg-white/10 hover:bg-white/20 border border-white/20 transition-colors cursor-pointer"
                >
                  <Avatar className="h-7 w-7">
                    <AvatarImage
                      src={user?.avatar || ""}
                      alt={getUserName()}
                    />
                    <AvatarFallback className="bg-white text-[#0088b6] font-bold text-xs">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-semibold hidden md:inline text-white">
                    {getUserName()}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-white/80" />
                </button>
              }
            />
            <DropdownMenuContent align="end" className="w-56 p-1.5 shadow-xl rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="p-2">
                  <div className="flex items-center gap-2.5">
                    <Avatar className="h-9 w-9">
                      <AvatarImage
                        src={user?.avatar || ""}
                        alt={getUserName()}
                      />
                      <AvatarFallback className="bg-[#0088b6] text-white font-semibold">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-0.5 overflow-hidden">
                      <p className="text-xs font-bold leading-none truncate text-slate-900 dark:text-white">{getUserName()}</p>
                      <p className="text-[11px] leading-none text-slate-500 dark:text-slate-400 truncate">
                        {getUserEmail()}
                      </p>
                    </div>
                  </div>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                {profileMenuItems.map((item) => (
                  <DropdownMenuItem
                    key={item.label}
                    onClick={() => navigate(item.url)}
                    className="cursor-pointer rounded-lg text-xs py-2"
                  >
                    <item.icon className="mr-2 h-4 w-4 text-slate-500" />
                    {item.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  className="cursor-pointer rounded-lg text-xs py-2 text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30 font-medium"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Secondary Row: Horizontal Navigation Menu Bar (Below Top Header) */}
      <div className="bg-white hidden md:flex dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 h-11 flex items-center overflow-x-auto max-w-full shadow-2xs scrollbar-none">
        {/* Navigation Links */}
        <nav className="flex items-center gap-2 overflow-x-auto whitespace-nowrap py-1">
          {filteredMenu.map((item) => {
            // Single link item (no submenus)
            if (!item.items) {
              const isActive = isUrlActive(item.url)
              return (
                <NavLink
                  key={item.title}
                  to={item.url}
                  className={cn(
                    "flex items-center gap-1.5 text-xs sm:text-sm font-semibold transition-all py-1.5 px-3 rounded-md relative shrink-0",
                    isActive
                      ? "text-[#0088b6] bg-blue-50 dark:bg-blue-950/50 dark:text-sky-400 font-bold"
                      : "text-slate-700 dark:text-slate-300 hover:text-[#0088b6] hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0 opacity-80" />
                  <span>{item.title}</span>
                  {item.badge && (
                    <Badge className="ml-1 text-[10px] bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 px-1.5 py-0">
                      {item.badge}
                    </Badge>
                  )}
                </NavLink>
              )
            }

            // Parent item with dropdown arrow
            const parentActive = isParentActive(item)
            return (
              <DropdownMenu key={item.title}>
                <DropdownMenuTrigger
                  render={
                    <button
                      type="button"
                      className={cn(
                        "flex items-center gap-1.5 text-xs sm:text-sm font-semibold transition-all py-1.5 px-3 rounded-md cursor-pointer outline-none shrink-0",
                        parentActive
                          ? "text-[#0088b6] bg-blue-50 dark:bg-blue-950/50 dark:text-sky-400 font-bold"
                          : "text-slate-700 dark:text-slate-300 hover:text-[#0088b6] hover:bg-slate-100 dark:hover:bg-slate-800"
                      )}
                    >
                      <item.icon className="h-4 w-4 shrink-0 opacity-80" />
                      <span>{item.title}</span>
                      {item.badge && (
                        <Badge className="ml-1 text-[10px] bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 px-1.5 py-0">
                          {item.badge}
                        </Badge>
                      )}
                      <ChevronDown className="h-4 w-4 shrink-0 opacity-60 ml-0.5" />
                    </button>
                  }
                />
                <DropdownMenuContent align="start" className="w-56 p-1.5 shadow-xl rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 mb-1">
                    {item.title}
                  </div>
                  {item.items.map((sub) => {
                    const subActive = isUrlActive(sub.url)
                    return (
                      <DropdownMenuItem
                        key={sub.title}
                        className={cn(
                          "p-0 cursor-pointer rounded-lg my-0.5",
                          subActive && "bg-blue-50 dark:bg-blue-950/40"
                        )}
                        render={
                          <NavLink
                            to={sub.url}
                            className={cn(
                              "flex items-center gap-2.5 px-3 py-2 text-xs w-full transition-colors rounded-lg",
                              subActive
                                ? "font-semibold text-[#0088b6] dark:text-sky-400"
                                : "text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
                            )}
                          >
                            <sub.icon className="h-3.5 w-3.5 shrink-0" />
                            <span>{sub.title}</span>
                          </NavLink>
                        }
                      />
                    )
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            )
          })}
        </nav>
      </div>

      {/* Row 3: Dedicated Breadcrumb Bar (Shown only when NOT on main Dashboard / Admission page) */}
      {
        location.pathname !== "/dashboard" && location.pathname !== "/admission" && items.length > 1 && (
          <div className="flex h-9 items-center px-4 sm:px-6 bg-slate-100/70 dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800 text-xs overflow-x-auto max-w-full shadow-2xs scrollbar-none">
            <Breadcrumb className="whitespace-nowrap">
              <BreadcrumbList>
                {items.map((item, index) => (
                  <Fragment key={index}>
                    <BreadcrumbItem>
                      {index === items.length - 1 ? (
                        <BreadcrumbPage className="font-semibold text-[#0088b6] dark:text-sky-400">
                          {item.label}
                        </BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink href={item.href || "/"} className="text-slate-500 hover:text-slate-900 dark:hover:text-white">
                          {item.label}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {index < items.length - 1 && <BreadcrumbSeparator />}
                  </Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        )
      }
    </header >
  )
}

