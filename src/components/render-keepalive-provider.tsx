'use client'

import React from 'react'
import { useRenderKeepAlive } from '@/hooks/use-render-keepalive'

/**
 * RenderKeepAliveProvider — Mounts the useRenderKeepAlive hook at application root.
 * Guarantees zero-cost 100% uptime by pinging the Render service every 10 minutes.
 */
export function RenderKeepAliveProvider({ children }: { children?: React.ReactNode }) {
  useRenderKeepAlive({
    intervalMs: 10 * 60 * 1000, // Ping every 10 min (before 15 min idle threshold)
    pingInBackground: true
  })

  return <>{children}</>
}
