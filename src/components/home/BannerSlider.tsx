'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { banners } from '@/data/banners'

export function BannerSlider() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % banners.length)
  }, [])

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length)
  }, [])

  useEffect(() => {
    const timer = setInterval(goToNext, 5000)
    return () => clearInterval(timer)
  }, [goToNext])

  const currentBanner = banners[currentIndex]

  return (
    <div className="relative w-full h-[250px] md:h-[400px] overflow-hidden group">
      {/* Background gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-r ${currentBanner.gradient} transition-all duration-700`}
      />

      {/* Decorative circles */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center text-center px-8 md:px-16 z-10">
        <h2 className="text-white text-2xl md:text-4xl font-bold mb-3 drop-shadow-lg">
          {currentBanner.title}
        </h2>
        <p className="text-white/80 text-sm md:text-base mb-6 max-w-xl">
          {currentBanner.subtitle}
        </p>
        <Link
          href={currentBanner.buttonLink}
          className="bg-white text-gray-900 font-bold px-6 py-2.5 rounded-full hover:bg-accent-gold hover:text-white transition-colors duration-200 text-sm md:text-base"
        >
          {currentBanner.buttonText}
        </Link>
      </div>

      {/* Left arrow */}
      <button
        onClick={goToPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 backdrop-blur-sm"
        aria-label="上一张"
      >
        &#8249;
      </button>

      {/* Right arrow */}
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 backdrop-blur-sm"
        aria-label="下一张"
      >
        &#8250;
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all duration-200 ${
              index === currentIndex
                ? 'bg-white w-6'
                : 'bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`跳转到第 ${index + 1} 张`}
          />
        ))}
      </div>
    </div>
  )
}
