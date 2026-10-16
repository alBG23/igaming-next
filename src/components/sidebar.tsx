"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  LayoutDashboard,
  Users,
  BarChart2,
  LineChart,
  Settings,
  LogOut,
  Menu,
  Gamepad,
  Gift,
  Users2,
  CreditCard,
  Sparkles,
  ShieldCheck,
  MessageSquare,
  ExternalLink,
  Globe,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { DEFAULT_ADMIN_EMAIL } from "@/lib/constants"
import { useVendor, VENDORS } from "@/lib/vendor-context"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const navigationItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: MessageSquare, label: "Hermes Chat", href: "/chat" },
  { icon: Sparkles, label: "Promo Planner", href: "/promo-planner" },
  { icon: ShieldCheck, label: "Data Accuracy", href: "/data-accuracy" },
  { icon: Users, label: "Players", href: "/players" },
  { icon: BarChart2, label: "Acquisition", href: "/acquisition" },
  { icon: LineChart, label: "Cohort Analysis", href: "/cohorts" },
  { icon: CreditCard, label: "Payments", href: "/payments" },
  { icon: Gamepad, label: "Casino Games", href: "/casino-games" },
  { icon: Gift, label: "Bonuses", href: "/bonuses" },
  { icon: Users2, label: "Affiliates", href: "/affiliates" },
  { icon: Settings, label: "Settings", href: "/settings" },
]

export function Sidebar() {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { currentVendor, setVendorId, availableVendors } = useVendor()

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
    document.cookie = `sidebarOpen=${!sidebarOpen}; path=/`
  }

  return (
    <aside
      suppressHydrationWarning
      className={cn(
        "fixed left-0 z-50 flex h-full flex-col border-r bg-background transition-all duration-300",
        sidebarOpen ? "w-64" : "w-20"
      )}
    >
      <div className="flex h-16 items-center justify-between border-b px-4">
        {sidebarOpen ? (
          <div>
            <h1 className="text-lg font-semibold tracking-tight">iGaming Analytics</h1>
          </div>
        ) : (
          <h1 className="text-lg font-semibold">IA</h1>
        )}
        <Button
          id="sidebar-toggle-btn"
          aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Vendor Selector Combobox directly under iGaming Analytics */}
      {sidebarOpen ? (
        <div className="border-b bg-muted/20 px-3 py-2.5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
              Vendor Platform
            </span>
            <a
              href={currentVendor.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-primary hover:underline inline-flex items-center gap-0.5 font-medium"
              title={`Visit ${currentVendor.name} (${currentVendor.url})`}
            >
              <span>{currentVendor.name}</span>
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </div>
          <Select value={currentVendor.id} onValueChange={(val) => setVendorId(val)}>
            <SelectTrigger
              id="vendor-selector-combobox"
              aria-label="Select iGaming Vendor Platform"
              className="h-8 text-xs bg-background border-border/80"
            >
              <SelectValue placeholder="Select Vendor Platform">
                <div className="flex items-center justify-between w-full gap-2">
                  <span className="font-medium text-xs">{currentVendor.name}</span>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[9px] py-0 px-1 font-semibold",
                      currentVendor.status === "active"
                        ? "border-emerald-500/50 text-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/40"
                        : "text-muted-foreground"
                    )}
                  >
                    {currentVendor.badge}
                  </Badge>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {availableVendors.map((vendor) => (
                <SelectItem key={vendor.id} value={vendor.id}>
                  <div className="flex items-center justify-between w-full gap-2">
                    <span className="font-medium text-xs">{vendor.name}</span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[9px] py-0 px-1 font-semibold",
                        vendor.status === "active"
                          ? "border-emerald-500/50 text-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/40"
                          : "text-muted-foreground"
                      )}
                    >
                      {vendor.badge}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="mt-1 text-[10px] text-muted-foreground/80 truncate">
            {currentVendor.description}
          </p>
        </div>
      ) : (
        <div className="border-b p-2 flex flex-col items-center justify-center gap-1">
          <a
            href={currentVendor.url}
            target="_blank"
            rel="noopener noreferrer"
            title={`Active Vendor: ${currentVendor.name} (${currentVendor.url})`}
            className="flex items-center justify-center"
          >
            <Badge
              variant="outline"
              className="text-[10px] font-bold px-1.5 py-0.5 border-emerald-500/60 text-emerald-600 hover:bg-emerald-50/50 cursor-pointer"
            >
              {currentVendor.shortCode || "SS"}
            </Badge>
          </a>
        </div>
      )}
      <ScrollArea className="flex-1">
        <nav className="flex flex-col gap-1 p-2">
          {navigationItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                suppressHydrationWarning
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent",
                  sidebarOpen ? "justify-start" : "justify-center"
                )}
              >
                <Icon className="h-5 w-5" />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>
      </ScrollArea>
      <div className="mt-auto border-t p-4">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
          {sidebarOpen && (
            <div className="flex flex-col">
              <span className="text-sm font-medium">Admin</span>
              <a
                href={`mailto:${DEFAULT_ADMIN_EMAIL}`}
                className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
              >
                {DEFAULT_ADMIN_EMAIL}
              </a>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          className="mt-4 w-full justify-start gap-2 hover:bg-destructive/10 hover:text-destructive transition-colors"
          onClick={() => {
            try {
              localStorage.removeItem("supabase.auth.token");
              sessionStorage.clear();
              document.cookie = "sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            } catch {
              // Ignore cleanup errors
            }
            router.push("/dashboard");
          }}
          title="Sign out of administration session"
        >
          <LogOut className="h-4 w-4" />
          {sidebarOpen && <span>Logout</span>}
        </Button>
      </div>
    </aside>
  )
} 