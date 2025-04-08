import { Inter } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"
import { Sidebar } from "@/components/sidebar"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ 
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

// Log environment variables (only in development)
if (process.env.NODE_ENV === 'development') {
  console.log('Environment Variables:')
  console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '***' + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.slice(-4) : 'missing')
}

export const metadata = {
  title: "iGaming Analytics Dashboard",
  description: "Analytics dashboard for iGaming platform",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={cn(inter.variable, "h-full")} suppressHydrationWarning>
      <body className="h-full">
        <ThemeProvider>
          <div className="flex h-full">
            <div className="w-64 shrink-0">
              <Sidebar />
            </div>
            <main className="flex-1 overflow-y-auto p-8">
              <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
                {children}
              </div>
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
} 