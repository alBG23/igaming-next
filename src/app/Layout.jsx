

import React, { useState } from "react";
import { Link } from "react-router-dom";
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
  CloudIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import FloatingChat from "./components/FloatingChat";
import ExportProjectModal from "./components/ExportProjectModal";

export default function Layout({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const handleLogout = () => {
    // Implement your own logout logic
    console.log('Implement your own logout logic here');
  };

  const createPageUrl = (pageName) => {
    // Simple URL creation without auth params
    return `/${pageName}`;
  };

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", page: "Dashboard" },
    { icon: DollarSign, label: "P&L Dashboard", page: "PnLDashboard" },
    { icon: Users, label: "Acquisition", page: "Acquisition" },
    { icon: BarChart3, label: "Payments", page: "Payments" },
    { icon: LineChart, label: "Player Analysis", page: "PlayerAnalysis" },
    { icon: Calendar, label: "Cohort Analysis", page: "CohortAnalysis" },
    { icon: Calculator, label: "Player Value", page: "PlayerValueMatrix" },
    { icon: Brain, label: "AI Insights", page: "AIInsights" },
    { icon: TrendingUp, label: "Benchmarking", page: "Benchmarking" },
    { icon: Bell, label: "Alerts", page: "AlertsManagement" },
    { icon: FileText, label: "Custom Reports", page: "CustomReports" },
    { icon: Gauge, label: "Platform Health", page: "PlatformHealth" },
    { icon: FileWarning, label: "Data Validation", page: "DataValidation" },
    { icon: Database, label: "DB Schema", page: "SchemaDiscovery" },
    { icon: Database, label: "Data Import", page: "DataImport" },
    { icon: Server, label: "Middleware API Guide", page: "MiddlewareAPIGuide" },
    { icon: CloudIcon, label: "Azure Integration", page: "AzureIntegrationGuide" },
    { icon: Lock, label: "Env Variables Guide", page: "EnvironmentVariablesGuide" },
    { icon: Settings, label: "Integrations", page: "Integrations" },
    { icon: Server, label: "Production Setup", page: "ProductionSetupGuide" }
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={cn(
        "fixed top-0 left-0 z-50 h-full w-64 bg-white border-r transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0 flex flex-col",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between p-4 border-b">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-600" />
            iGaming Analytics
          </h1>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        <ScrollArea className="flex-1 py-2">
          <div className="p-2">
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = currentPageName === item.page;
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.page}
                    to={createPageUrl(item.page)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                      isActive 
                        ? "bg-indigo-50 text-indigo-900"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className={cn(
                      "w-5 h-5",
                      isActive ? "text-indigo-600" : "text-gray-500"
                    )} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </ScrollArea>

        <div className="p-4 border-t">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-9 w-9 bg-indigo-100 text-indigo-700">
              <AvatarFallback>DU</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">Demo User</p>
              <p className="text-xs text-gray-500">user@example.com</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full flex items-center gap-2"
            onClick={handleLogout}
          >
            Sign out
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
          
          <div className="flex-1 md:ml-4">
            <h1 className="text-xl font-semibold md:hidden">
              {currentPageName?.replace(/([A-Z])/g, ' $1').trim()}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>
            <Avatar className="h-8 w-8 md:hidden">
              <AvatarFallback className="bg-indigo-100 text-indigo-700">
                DU
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
      
      <FloatingChat />
    </div>
  );
}

