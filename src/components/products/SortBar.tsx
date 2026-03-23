'use client'

import { cn } from '@/lib/utils'

interface SortBarProps {
  currentSort: string
  onSortChange: (sort: string) => void
  resultCount: number
}

const sortOptions = [
  { label: '综合', value: 'default' },
  { label: '销量优先', value: 'sales' },
  { label: '价格升序', value: 'price-asc' },
  { label: '价格降序', value: 'price-desc' },
  { label: '评分优先', value: 'rating' },
]

export function SortBar({ currentSort, onSortChange, resultCount }: SortBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      {/* Sort buttons */}
      <div className="flex flex-wrap gap-2">
        {sortOptions.map((option) => {
          const isSelected = currentSort === option.value
          return (
            <button
              key={option.value}
              onClick={() => onSortChange(option.value)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                isSelected
                  ? 'bg-accent-purple text-white'
                  : 'bg-bg-secondary text-text-secondary hover:text-text-primary hover:bg-bg-card'
              )}
            >
              {option.label}
            </button>
          )
        })}
      </div>

      {/* Result count */}
      <p className="text-text-secondary text-sm">
        共{' '}
        <span className="text-text-primary font-semibold">{resultCount}</span>{' '}
        件商品
      </p>
    </div>
  )
}
