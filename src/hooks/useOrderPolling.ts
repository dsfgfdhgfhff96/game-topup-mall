import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'

const POLL_INTERVAL = 3000
const POLL_TIMEOUT = 15 * 60 * 1000

const PAID_STATUSES = new Set(['paid', 'completed'])

interface OrderPollingResult {
  isPaid: boolean
  isCancelled: boolean
  status: string | null
  isExpired: boolean
}

export function useOrderPolling(orderId: string | null, enabled: boolean): OrderPollingResult {
  const [isPaid, setIsPaid] = useState(false)
  const [isCancelled, setIsCancelled] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [isExpired, setIsExpired] = useState(false)
  const startTimeRef = useRef<number>(0)

  useEffect(() => {
    if (!enabled || !orderId) return

    startTimeRef.current = Date.now()
    setIsPaid(false)
    setIsCancelled(false)
    setIsExpired(false)
    setStatus(null)

    const interval = setInterval(async () => {
      if (Date.now() - startTimeRef.current > POLL_TIMEOUT) {
        setIsExpired(true)
        clearInterval(interval)
        return
      }

      const { data } = await supabase
        .from('orders')
        .select('status')
        .eq('id', orderId)
        .single()

      if (data && data.status !== 'pending_payment') {
        setStatus(data.status)
        if (PAID_STATUSES.has(data.status)) {
          setIsPaid(true)
        } else {
          setIsCancelled(true)
        }
        clearInterval(interval)
      }
    }, POLL_INTERVAL)

    return () => clearInterval(interval)
  }, [orderId, enabled])

  return { isPaid, isCancelled, status, isExpired }
}
