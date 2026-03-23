'use client'

import { useState } from 'react'
import { categories } from '@/data/categories'
import { cn } from '@/lib/utils'

interface FilterPanelProps {
  selectedGame: string | null
  onGameChange: (gameId: string | null) => void
  priceRange: string | null
  onPriceChange: (range: string | null) => void
  minRating: number | null
  onRatingChange: (rating: number | null) => void
}

const priceOptions = [
  { label: '0-50元', value: '0-50' },
  { label: '50-100元', value: '50-100' },
  { label: '100-500元', value: '100-500' },
  { label: '500元以上', value: '500+' },
]

const ratingOptions = [
  { label: '4.5分以上', value: 4.5 },
  { label: '4.7分以上', value: 4.7 },
  { label: '4.9分以上', value: 4.9 },
]

function FilterContent({
  selectedGame,
  onGameChange,
  priceRange,
  onPriceChange,
  minRating,
  onRatingChange,
}: FilterPanelProps) {
  return (
    <div className="space-y-6">
      {/* 游戏分类 */}
      <div>
        <h3 className="text-text-primary font-bold mb-3">游戏分类</h3>
        <div className="space-y-1">
          {categories.map((category) => {
            const isSelected = selectedGame === category.id
            return (
              <button
                key={category.id}
                onClick={() => onGameChange(isSelected ? null : category.id)}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 text-left',
                  isSelected
                    ? 'bg-accent-purple text-white'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-secondary'
                )}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 价格区间 */}
      <div>
        <h3 className="text-text-primary font-bold mb-3">价格区间</h3>
        <div className="space-y-1">
          {priceOptions.map((option) => {
            const isSelected = priceRange === option.value
            return (
              <button
                key={option.value}
                onClick={() => onPriceChange(isSelected ? null : option.value)}
                className={cn(
                  'w-full px-3 py-2 rounded-lg text-sm transition-all duration-200 text-left',
                  isSelected
                    ? 'bg-accent-purple text-white'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-secondary'
                )}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* 评分筛选 */}
      <div>
        <h3 className="text-text-primary font-bold mb-3">评分筛选</h3>
        <div className="space-y-1">
          {ratingOptions.map((option) => {
            const isSelected = minRating === option.value
            return (
              <button
                key={option.value}
                onClick={() => onRatingChange(isSelected ? null : option.value)}
                className={cn(
                  'w-full px-3 py-2 rounded-lg text-sm transition-all duration-200 text-left',
                  isSelected
                    ? 'bg-accent-purple text-white'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-secondary'
                )}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export function FilterPanel(props: FilterPanelProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Desktop filter panel */}
      <aside className="hidden md:block w-64 flex-shrink-0 bg-bg-card rounded-xl p-4 border border-border-default h-fit sticky top-4">
        <FilterContent {...props} />
      </aside>

      {/* Mobile: filter toggle button */}
      <div className="md:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-bg-card border border-border-default rounded-lg text-text-secondary hover:text-text-primary transition-colors text-sm"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="18" x2="20" y2="18" />
          </svg>
          筛选
        </button>

        {/* Mobile overlay */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/60"
              onClick={() => setMobileOpen(false)}
            />
            {/* Panel */}
            <div className="relative w-full max-w-sm bg-bg-card border-r border-border-default p-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-text-primary font-bold text-lg">筛选</h2>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="text-text-secondary hover:text-text-primary transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <FilterContent {...props} />
              <button
                onClick={() => setMobileOpen(false)}
                className="mt-6 w-full py-3 bg-accent-purple text-white rounded-lg font-medium hover:bg-accent-purple/90 transition-colors"
              >
                确认筛选
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
