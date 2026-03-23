'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { products } from '@/data/products'
import { Product } from '@/types'
import { ProductCard } from '@/components/products/ProductCard'
import { FilterPanel } from '@/components/products/FilterPanel'
import { SortBar } from '@/components/products/SortBar'

const PAGE_SIZE = 20

function parsePriceRange(range: string | null): { min: number; max: number } | null {
  if (!range) return null
  if (range === '500+') return { min: 500, max: Infinity }
  const parts = range.split('-')
  if (parts.length !== 2) return null
  const min = parseFloat(parts[0])
  const max = parseFloat(parts[1])
  if (isNaN(min) || isNaN(max)) return null
  return { min, max }
}

function filterProducts(
  allProducts: Product[],
  selectedGame: string | null,
  searchQuery: string,
  priceRange: string | null,
  minRating: number | null
): Product[] {
  return allProducts.filter((product) => {
    if (selectedGame && product.gameId !== selectedGame) return false

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      const matchesName = product.name.toLowerCase().includes(q)
      const matchesGame = product.gameName.toLowerCase().includes(q)
      const matchesDesc = product.description.toLowerCase().includes(q)
      if (!matchesName && !matchesGame && !matchesDesc) return false
    }

    if (priceRange) {
      const parsed = parsePriceRange(priceRange)
      if (parsed) {
        if (product.defaultPrice < parsed.min || product.defaultPrice > parsed.max) return false
      }
    }

    if (minRating !== null && product.rating < minRating) return false

    return true
  })
}

function sortProducts(filtered: Product[], sort: string): Product[] {
  const copy = [...filtered]
  switch (sort) {
    case 'sales':
      return copy.sort((a, b) => b.sales - a.sales)
    case 'price-asc':
      return copy.sort((a, b) => a.defaultPrice - b.defaultPrice)
    case 'price-desc':
      return copy.sort((a, b) => b.defaultPrice - a.defaultPrice)
    case 'rating':
      return copy.sort((a, b) => b.rating - a.rating)
    default:
      return copy
  }
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}) {
  if (totalPages <= 1) return null

  const pages: (number | '...')[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (currentPage > 3) pages.push('...')
    const start = Math.max(2, currentPage - 1)
    const end = Math.min(totalPages - 1, currentPage + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    if (currentPage < totalPages - 2) pages.push('...')
    pages.push(totalPages)
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 rounded-lg text-sm bg-bg-secondary text-text-secondary hover:text-text-primary hover:bg-bg-card disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
      >
        上一页
      </button>

      {pages.map((page, idx) =>
        page === '...' ? (
          <span key={`ellipsis-${idx}`} className="px-2 text-text-secondary">
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page as number)}
            className={`w-9 h-9 rounded-lg text-sm font-medium transition-all duration-200 ${
              currentPage === page
                ? 'bg-accent-purple text-white'
                : 'bg-bg-secondary text-text-secondary hover:text-text-primary hover:bg-bg-card'
            }`}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 rounded-lg text-sm bg-bg-secondary text-text-secondary hover:text-text-primary hover:bg-bg-card disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
      >
        下一页
      </button>
    </div>
  )
}

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [selectedGame, setSelectedGame] = useState<string | null>(
    searchParams.get('game')
  )
  const [searchQuery] = useState<string>(searchParams.get('q') ?? '')
  const [sort, setSort] = useState<string>(searchParams.get('sort') ?? 'default')
  const [priceRange, setPriceRange] = useState<string | null>(null)
  const [minRating, setMinRating] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  const updateUrl = useCallback(
    (newGame: string | null, newSort: string) => {
      const params = new URLSearchParams()
      if (newGame) params.set('game', newGame)
      if (searchQuery) params.set('q', searchQuery)
      if (newSort && newSort !== 'default') params.set('sort', newSort)
      const query = params.toString()
      router.replace(`/products${query ? `?${query}` : ''}`)
    },
    [router, searchQuery]
  )

  const handleGameChange = useCallback(
    (gameId: string | null) => {
      setSelectedGame(gameId)
      setCurrentPage(1)
      updateUrl(gameId, sort)
    },
    [sort, updateUrl]
  )

  const handleSortChange = useCallback(
    (newSort: string) => {
      setSort(newSort)
      setCurrentPage(1)
      updateUrl(selectedGame, newSort)
    },
    [selectedGame, updateUrl]
  )

  const handlePriceChange = useCallback((range: string | null) => {
    setPriceRange(range)
    setCurrentPage(1)
  }, [])

  const handleRatingChange = useCallback((rating: number | null) => {
    setMinRating(rating)
    setCurrentPage(1)
  }, [])

  const handleResetFilters = useCallback(() => {
    setSelectedGame(null)
    setPriceRange(null)
    setMinRating(null)
    setSort('default')
    setCurrentPage(1)
    router.replace('/products')
  }, [router])

  const filtered = useMemo(
    () => filterProducts(products, selectedGame, searchQuery, priceRange, minRating),
    [selectedGame, searchQuery, priceRange, minRating]
  )

  const sorted = useMemo(() => sortProducts(filtered, sort), [filtered, sort])

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE)

  const pageProducts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return sorted.slice(start, start + PAGE_SIZE)
  }, [sorted, currentPage])

  // Reset to page 1 if current page is out of range after filter change
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1)
    }
  }, [currentPage, totalPages])

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-screen-xl mx-auto px-4 py-8">
        {/* Page title */}
        <div className="mb-6">
          <h1 className="text-text-primary text-2xl font-bold">
            {searchQuery ? `搜索"${searchQuery}"` : '全部商品'}
          </h1>
          {searchQuery && (
            <p className="text-text-secondary text-sm mt-1">
              搜索结果：{filtered.length} 件商品
            </p>
          )}
        </div>

        <div className="flex gap-6">
          {/* Filter panel */}
          <FilterPanel
            selectedGame={selectedGame}
            onGameChange={handleGameChange}
            priceRange={priceRange}
            onPriceChange={handlePriceChange}
            minRating={minRating}
            onRatingChange={handleRatingChange}
          />

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Sort bar */}
            <div className="mb-6 bg-bg-card rounded-xl p-4 border border-border-default">
              <div className="flex flex-wrap items-center gap-3 mb-3 md:hidden">
                {/* Mobile filter button is rendered inside FilterPanel */}
              </div>
              <SortBar
                currentSort={sort}
                onSortChange={handleSortChange}
                resultCount={sorted.length}
              />
            </div>

            {/* Product grid or empty state */}
            {pageProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h2 className="text-text-primary text-xl font-bold mb-2">
                  没有找到相关商品
                </h2>
                <p className="text-text-secondary text-sm mb-6">
                  试试调整筛选条件，或重置所有筛选
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-6 py-2.5 bg-accent-purple text-white rounded-lg font-medium hover:bg-accent-purple/90 transition-colors"
                >
                  重置筛选
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {pageProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
