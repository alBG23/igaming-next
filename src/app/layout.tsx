import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Bell,
  TrendingUp,
  Settings,
  LineChart,
  Brain,
  Menu,
  X,
  Gauge,
  Database,
  Server,
  Calendar,
  Calculator,
  FileWarning,
  DollarSign,
  FileText,
  Lock,
  CloudIcon,
  LogOut
} from "lucide-react"
import Link from "next/link"
import { cookies } from "next/headers"
import { Sidebar } from "@/components/sidebar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "iGaming Analytics",
  description: "Your comprehensive analytics dashboard",
}

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", page: "dashboard" },
  { icon: DollarSign, label: "P&L Dashboard", page: "pnl-dashboard" },
  { icon: Users, label: "Acquisition", page: "acquisition" },
  { icon: BarChart3, label: "Payments", page: "payments" },
  { icon: LineChart, label: "Player Analysis", page: "player-analysis" },
  { icon: Calendar, label: "Cohort Analysis", page: "cohort-analysis" },
  { icon: Calculator, label: "Player Value", page: "player-value" },
  { icon: Brain, label: "AI Insights", page: "ai-insights" },
  { icon: TrendingUp, label: "Benchmarking", page: "benchmarking" },
  { icon: Bell, label: "Alerts", page: "alerts" },
  { icon: FileText, label: "Custom Reports", page: "custom-reports" },
  { icon: Gauge, label: "Platform Health", page: "platform-health" },
  { icon: FileWarning, label: "Data Validation", page: "data-validation" },
  { icon: Database, label: "DB Schema", page: "schema-discovery" },
  { icon: Database, label: "Data Import", page: "data-import" },
  { icon: Server, label: "Middleware API Guide", page: "middleware-api-guide" },
  { icon: CloudIcon, label: "Azure Integration", page: "azure-integration" },
  { icon: Lock, label: "Env Variables Guide", page: "env-variables" },
  { icon: Settings, label: "Integrations", page: "integrations" },
  { icon: Server, label: "Production Setup", page: "production-setup" }
]

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const sidebarOpen = cookieStore.get("sidebarOpen")?.value === "true"

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <div className="flex h-screen bg-background">
          <Sidebar />
          <main
            className={cn(
              "flex-1 transition-all duration-300",
              sidebarOpen ? "ml-64" : "ml-20"
            )}
          >
            {children}
          </main>
        </div>
      </body>
    </html>
  )
} 