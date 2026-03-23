'use client'

import {
  createContext,
  useCallback,
  useContext,
  useId,
  useRef,
  useState,
  ReactNode,
} from 'react'
import { cn } from '@/lib/utils'

type ToastType = 'success' | 'error' | 'info'

interface ToastItem {
  id: string
  message: string
  type: ToastType
  /** true while the item is animating out */
  leaving: boolean
}

interface ToastContextValue {
  showToast: (message: string, type: ToastType) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const typeClasses: Record<ToastType, string> = {
  success: 'bg-accent-green text-white',
  error: 'bg-accent-red text-white',
  info: 'bg-accent-purple text-white',
}

const typeIcons: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
}

const DISMISS_DELAY = 3000
const ANIMATION_DURATION = 300

interface ToastItemViewProps {
  toast: ToastItem
}

function ToastItemView({ toast }: ToastItemViewProps) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg min-w-[240px] max-w-xs',
        'transition-all duration-300 ease-in-out',
        typeClasses[toast.type],
        toast.leaving
          ? 'opacity-0 translate-x-4'
          : 'opacity-100 translate-x-0',
      )}
    >
      <span className="text-lg font-bold shrink-0">{typeIcons[toast.type]}</span>
      <span className="text-sm font-medium">{toast.message}</span>
    </div>
  )
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())
  const baseId = useId()
  const counterRef = useRef(0)

  const removeToast = useCallback((id: string) => {
    // start leave animation
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)),
    )
    // remove after animation finishes
    const timer = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
      timersRef.current.delete(id)
    }, ANIMATION_DURATION)
    timersRef.current.set(id, timer)
  }, [])

  const showToast = useCallback(
    (message: string, type: ToastType) => {
      counterRef.current += 1
      const id = `${baseId}-${counterRef.current}`
      const newToast: ToastItem = { id, message, type, leaving: false }

      setToasts((prev) => [...prev, newToast])

      const dismissTimer = setTimeout(() => {
        removeToast(id)
      }, DISMISS_DELAY)

      timersRef.current.set(`dismiss-${id}`, dismissTimer)
    },
    [baseId, removeToast],
  )

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast container */}
      <div
        className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none"
        aria-label="通知"
      >
        {toasts.map((toast) => (
          <ToastItemView key={toast.id} toast={toast} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast must be used inside <ToastProvider>')
  }
  return ctx
}
