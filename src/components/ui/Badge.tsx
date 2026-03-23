'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type BadgeVariant = 'hot' | 'new' | 'sale' | 'default'

interface BadgeProps {
  variant?: BadgeVariant
  children: ReactNode
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  hot: 'bg-accent-pink text-white',
  new: 'bg-accent-cyan text-white',
  sale: 'bg-accent-gold text-black',
  default: 'bg-bg-secondary text-text-secondary',
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center text-xs px-2 py-0.5 rounded-full font-medium',
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}
