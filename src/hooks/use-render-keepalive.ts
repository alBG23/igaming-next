'use client'

import { useEffect, useRef } from 'react'

interface KeepAliveOptions {
  /**
   * Interval in milliseconds between keepalive pings.
   * Render free tier spins down after 15 minutes of inactivity (900,000 ms).
   * Default: 10 minutes (600,000 ms) to keep the service reliably awake.
   */
  intervalMs?: number
  /**
   * Whether to ping when the document tab is in the background.
   * Default: true.
   */
  pingInBackground?: boolean
}

/**
 * useRenderKeepAlive — Client-side Hook for Render Free Tier 100% Uptime.
 * Periodically sends a lightweight heartbeat ping to `/api/keepalive`
 * while the application is mounted, preventing Render instances from sleeping.
 */
export function useRenderKeepAlive(options: KeepAliveOptions = {}) {
  const {
    intervalMs = 10 * 60 * 1000, // 10 minutes
    pingInBackground = true
  } = options

  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    let isCancelled = false

    const ping = async () => {
      if (!pingInBackground && typeof document !== 'undefined' && document.hidden) {
        return
      }

      try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 5000)
        await fetch('/api/keepalive', {
          method: 'GET',
          cache: 'no-store',
          signal: controller.signal
        })
        clearTimeout(timeout)
      } catch (err) {
        // Silently ignore ping errors
      }
    }

    // Initial ping on mount
    ping()

    // Recurring ping
    timerRef.current = setInterval(ping, intervalMs)

    return () => {
      isCancelled = true
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [intervalMs, pingInBackground])
}
