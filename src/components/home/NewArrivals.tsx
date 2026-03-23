'use client'

import { useRef } from 'react'
import { getNewProducts } from '@/data/products'
import { ProductCard } from '@/components/products/ProductCard'

export function NewArrivals() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const newProducts = getNewProducts(8)

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' })
    }
  }

  return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-text-primary">
          <span>✨</span> 新品上架
        </h2>
        <div className="flex-1 h-px bg-gradient-to-r from-accent-cyan/50 to-transparent" />

        <div className="flex gap-2">
          <button
            onClick={scrollLeft}
            className="w-8 h-8 rounded-full bg-bg-secondary border border-border-default flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-accent-purple transition-colors duration-200"
            aria-label="向左滚动"
          >
            &#8249;
          </button>
          <button
            onClick={scrollRight}
            className="w-8 h-8 rounded-full bg-bg-secondary border border-border-default flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-accent-purple transition-colors duration-200"
            aria-label="向右滚动"
          >
            &#8250;
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {newProducts.map((product) => (
          <div key={product.id} className="min-w-[260px] snap-start flex-shrink-0">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  )
}
