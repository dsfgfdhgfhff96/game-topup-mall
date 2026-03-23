'use client'

import { useState, useEffect, useCallback } from 'react'
import { reviews } from '@/data/reviews'
import { StarRating } from '@/components/ui/StarRating'

const avatarColors = [
  'bg-accent-purple',
  'bg-accent-pink',
  'bg-accent-cyan',
  'bg-accent-gold',
  'bg-green-500',
  'bg-blue-500',
]

function getAvatarColor(name: string): string {
  const index = name.charCodeAt(0) % avatarColors.length
  return avatarColors[index]
}

// Pick a curated set of reviews (one from each major game category)
const featuredReviews = [
  reviews[0],  // 王者荣耀
  reviews[6],  // 原神
  reviews[12], // 和平精英
  reviews[16], // 英雄联盟
  reviews[20], // Steam
  reviews[26], // PUBG
]

export function ReviewSlider() {
  const [startIndex, setStartIndex] = useState(0)
  const visibleCount = 3

  const goToNext = useCallback(() => {
    setStartIndex((prev) => (prev + 1) % featuredReviews.length)
  }, [])

  useEffect(() => {
    const timer = setInterval(goToNext, 4000)
    return () => clearInterval(timer)
  }, [goToNext])

  const getVisibleReviews = () => {
    return Array.from({ length: visibleCount }, (_, i) => {
      const index = (startIndex + i) % featuredReviews.length
      return featuredReviews[index]
    })
  }

  const visibleReviews = getVisibleReviews()

  return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-text-primary">
          <span>💬</span> 用户评价
        </h2>
        <div className="flex-1 h-px bg-gradient-to-r from-accent-purple/50 to-transparent" />
      </div>

      {/* Desktop: 3 cards in a row */}
      <div className="hidden md:grid grid-cols-3 gap-4">
        {visibleReviews.map((review, i) => (
          <div
            key={`${review.id}-${startIndex}-${i}`}
            className="bg-bg-card rounded-xl border border-border-default p-5 space-y-3 transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full ${getAvatarColor(review.userName)} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}
              >
                {review.avatar}
              </div>
              <div>
                <p className="text-text-primary font-medium text-sm">{review.userName}</p>
                <StarRating rating={review.rating} size="sm" />
              </div>
            </div>
            <p className="text-text-secondary text-sm leading-relaxed line-clamp-3">
              {review.content}
            </p>
            <p className="text-text-secondary text-xs">{review.date}</p>
          </div>
        ))}
      </div>

      {/* Mobile: single card */}
      <div className="md:hidden">
        {(() => {
          const review = featuredReviews[startIndex]
          return (
            <div className="bg-bg-card rounded-xl border border-border-default p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full ${getAvatarColor(review.userName)} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}
                >
                  {review.avatar}
                </div>
                <div>
                  <p className="text-text-primary font-medium text-sm">{review.userName}</p>
                  <StarRating rating={review.rating} size="sm" />
                </div>
              </div>
              <p className="text-text-secondary text-sm leading-relaxed">{review.content}</p>
              <p className="text-text-secondary text-xs">{review.date}</p>
            </div>
          )
        })()}

        {/* Mobile dot indicators */}
        <div className="flex justify-center gap-2 mt-4">
          {featuredReviews.map((_, index) => (
            <button
              key={index}
              onClick={() => setStartIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === startIndex ? 'bg-accent-purple w-5' : 'bg-border-default'
              }`}
              aria-label={`查看第 ${index + 1} 条评价`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
