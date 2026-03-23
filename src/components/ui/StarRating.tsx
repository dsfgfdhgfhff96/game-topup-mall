'use client'

import { cn } from '@/lib/utils'

type StarSize = 'sm' | 'md'

interface StarRatingProps {
  rating: number
  size?: StarSize
  showNumber?: boolean
  className?: string
}

const sizeClasses: Record<StarSize, string> = {
  sm: 'text-sm',
  md: 'text-base',
}

function renderStars(rating: number): string[] {
  const stars: string[] = []
  const rounded = Math.round(rating * 2) / 2 // round to nearest 0.5

  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rounded)) {
      stars.push('★')
    } else if (i - 0.5 === rounded) {
      // half star — treat as filled for simplicity (Unicode has no half-star)
      stars.push('★')
    } else {
      stars.push('☆')
    }
  }
  return stars
}

export function StarRating({
  rating,
  size = 'md',
  showNumber = false,
  className,
}: StarRatingProps) {
  const clampedRating = Math.max(0, Math.min(5, rating))
  const stars = renderStars(clampedRating)

  return (
    <span className={cn('inline-flex items-center gap-1', className)}>
      <span
        className={cn('text-accent-gold tracking-tight', sizeClasses[size])}
        aria-label={`评分 ${clampedRating} 分（满分 5 分）`}
      >
        {stars.join('')}
      </span>
      {showNumber && (
        <span className={cn('text-text-secondary', sizeClasses[size])}>
          {clampedRating.toFixed(1)}
        </span>
      )}
    </span>
  )
}
