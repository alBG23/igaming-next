"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { testSupabaseConnection, testAllViews } from "@/lib/supabase"
import { AlertCircle, CheckCircle, XCircle } from "lucide-react"

interface ViewStatus {
  success: boolean
  hasData?: boolean
  error?: string
}

interface ViewResults {
  [key: string]: ViewStatus
}

export default function TestConnectionPage() {
  const [loading, setLoading] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking')
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [viewResults, setViewResults] = useState<ViewResults>({})

  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    try {
      setLoading(true)
      setConnectionStatus('checking')
      setConnectionError(null)

      // Test basic connection
      const { connected, error: connectionError } = await testSupabaseConnection()
      
      if (!connected || connectionError) {
        throw new Error(`Database connection failed: ${connectionError}`)
      }

      setConnectionStatus('connected')

      // Test all views
      const results = await testAllViews()
      setViewResults(results)

    } catch (err) {
      console.error('Connection test error:', err)
      setConnectionStatus('disconnected')
      setConnectionError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Database Connection Test</h1>

      <Card>
        <CardHeader>
          <CardTitle>Connection Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900" />
            ) : connectionStatus === 'connected' ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
            <span className="font-medium">
              {loading ? 'Checking connection...' : 
               connectionStatus === 'connected' ? 'Connected to database' : 
               'Connection failed'}
            </span>
          </div>
          {connectionError && (
            <div className="mt-2 text-sm text-red-600">
              Error: {connectionError}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>View Access Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(viewResults).map(([view, status]) => (
              <div key={view} className="flex items-start gap-2 border-b pb-2">
                <div className="mt-1">
                  {status.success ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <div>
                  <div className="font-medium">{view}</div>
                  {status.success ? (
                    <div className="text-sm text-green-600">
                      {status.hasData ? 'Data available' : 'View accessible but no data'}
                    </div>
                  ) : (
                    <div className="text-sm text-red-600">
                      {status.error}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 