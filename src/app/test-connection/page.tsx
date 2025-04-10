"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { testSupabaseConnection, testAllViews } from "@/lib/supabase"
import { AlertCircle, CheckCircle, XCircle } from "lucide-react"
import { createClient } from '@supabase/supabase-js'

interface ViewStatus {
  success: boolean
  hasData?: boolean
  error?: string
}

interface ViewResults {
  [key: string]: ViewStatus
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const dynamic = 'force-dynamic'

export default async function TestConnectionPage() {
  try {
    // Test 1: Check if we can connect to Supabase
    const { data: testData, error: testError } = await supabase
      .rpc('get_tables')

    if (testError) {
      throw testError
    }

    // Test 2: Check database permissions
    const { data: roleData, error: roleError } = await supabase
      .rpc('get_current_role')

    if (roleError) {
      throw roleError
    }

    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">Connection Test</h1>
        <div className="space-y-4">
          <div className="p-4 bg-green-100 rounded-lg">
            <h2 className="font-semibold">Connection Successful!</h2>
            <p>Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
            <p>Current Role: {roleData}</p>
          </div>
          <div className="p-4 bg-blue-100 rounded-lg">
            <h2 className="font-semibold">Available Tables:</h2>
            <pre className="mt-2 p-2 bg-white rounded">
              {JSON.stringify(testData, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Connection Test Error:', error)
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">Connection Test</h1>
        <div className="p-4 bg-red-100 rounded-lg">
          <h2 className="font-semibold text-red-800">Connection Failed</h2>
          <p className="mt-2 text-red-600">
            Error: {error instanceof Error ? error.message : 'Unknown error'}
          </p>
          <div className="mt-4">
            <h3 className="font-semibold">Configuration:</h3>
            <p>Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
            <p>Anon Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.slice(0, 10)}...</p>
          </div>
        </div>
      </div>
    )
  }
} 