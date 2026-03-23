'use client'

import { useState, useEffect } from 'react'
import { getLimitedProducts } from '@/data/products'
import { ProductCard } from '@/components/products/ProductCard'

function getEndTime(): Date {
  const now = new Date()
  const end = new Date(now)
  end.setHours(23, 59, 59, 0)
  // If less than 2 hours remain, extend to tomorrow
  if (end.getTime() - now.getTime() < 2 * 60 * 60 * 1000) {
    end.setDate(end.getDate() + 1)
    end.setHours(23, 59, 59, 0)
  }
  return end
}

function formatCountdown(ms: number): { hours: string; minutes: string; seconds: string } {
  if (ms <= 0) return { hours: '00', minutes: '00', seconds: '00' }
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return {
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0'),
  }
}

export function FlashSale() {
  const [endTime] = useState<Date>(getEndTime)
  const [remaining, setRemaining] = useState<number>(() => endTime.getTime() - Date.now())

  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining(endTime.getTime() - Date.now())
    }, 1000)
    return () => clearInterval(timer)
  }, [endTime])

  const { hours, minutes, seconds } = formatCountdown(remaining)
  const limitedProducts = getLimitedProducts(4)

  return (
    <section>
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-xl md:text-2xl font-bold text-text-primary">
            <span className="text-accent-gold">⚡</span> 限时特惠
          </h2>
          <div className="h-px w-4 bg-gradient-to-r from-accent-gold/50 to-transparent" />
        </div>

        <div className="flex items-center gap-1 ml-auto">
          <span className="text-text-secondary text-sm mr-1">距结束</span>
          {[hours, minutes, seconds].map((unit, i) => (
            <span key={i} className="flex items-center gap-1">
              <span className="bg-bg-secondary text-accent-gold font-mono text-base font-bold px-2 py-1 rounded-md min-w-[2rem] text-center">
                {unit}
              </span>
              {i < 2 && <span className="text-accent-gold font-bold">:</span>}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {limitedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}
