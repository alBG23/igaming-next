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
} from "lucide-react"
import Link from "next/link"

const navigationItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Users, label: "Players", href: "/players" },
  { icon: BarChart2, label: "Acquisition", href: "/acquisition" },
  { icon: LineChart, label: "Cohort Analysis", href: "/cohort-analysis" },
  { icon: Gamepad, label: "Casino Games", href: "/casino-games" },
  { icon: Gift, label: "Bonuses", href: "/bonuses" },
  { icon: Users2, label: "Affiliates", href: "/affiliates" },
  { icon: Settings, label: "Settings", href: "/settings" },
]

export function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
    document.cookie = `sidebarOpen=${!sidebarOpen}; path=/`
  }

  return (
    <aside
      className={cn(
        "fixed left-0 z-50 flex h-full flex-col border-r bg-background transition-all duration-300",
        sidebarOpen ? "w-64" : "w-20"
      )}
    >
      <div className="flex h-16 items-center justify-between border-b px-4">
        {sidebarOpen ? (
          <h1 className="text-lg font-semibold">iGaming Analytics</h1>
        ) : (
          <h1 className="text-lg font-semibold">IA</h1>
        )}
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          <Menu className="h-5 w-5" />
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <nav className="flex flex-col gap-1 p-2">
          {navigationItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
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
              <span className="text-xs text-muted-foreground">
                admin@example.com
              </span>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          className="mt-4 w-full justify-start gap-2"
          onClick={() => {
            // Handle logout
          }}
        >
          <LogOut className="h-4 w-4" />
          {sidebarOpen && <span>Logout</span>}
        </Button>
      </div>
    </aside>
  )
} 