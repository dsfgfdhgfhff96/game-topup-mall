'use client'

import Link from 'next/link'
import { Product } from '@/types'
import { Badge } from '@/components/ui/Badge'
import { StarRating } from '@/components/ui/StarRating'
import { formatPrice } from '@/lib/utils'

interface ProductCardProps {
  product: Product
}

const gameGradients: Record<string, string> = {
  wangzhe: 'from-orange-600 to-red-600',
  yuanshen: 'from-blue-500 to-indigo-600',
  heping: 'from-green-600 to-emerald-500',
  lol: 'from-yellow-500 to-amber-600',
  steam: 'from-blue-800 to-gray-900',
  pubg: 'from-orange-500 to-yellow-600',
  minecraft: 'from-green-700 to-lime-600',
  roblox: 'from-pink-500 to-purple-500',
  tianya: 'from-purple-600 to-blue-500',
  jianwang: 'from-cyan-500 to-blue-600',
}

const defaultGradient = 'from-gray-600 to-gray-800'

function formatSales(sales: number): string {
  if (sales >= 10000) {
    return `${(sales / 10000).toFixed(1)}万`
  }
  return sales.toLocaleString('zh-CN')
}

function getTagVariant(tag: string): 'hot' | 'new' | 'sale' | 'default' {
  if (tag === '热门') return 'hot'
  if (tag === '新品') return 'new'
  if (tag === '限时') return 'sale'
  return 'default'
}

export function ProductCard({ product }: ProductCardProps) {
  const gradient = gameGradients[product.gameId] ?? defaultGradient

  return (
    <Link href={`/products/${product.id}`} className="block group">
      <div className="bg-bg-card rounded-xl border border-border-default transition-all duration-300 hover:scale-[1.02] hover:border-accent-purple hover:shadow-[0_0_20px_rgba(108,92,231,0.3)] overflow-hidden">
        {/* Top gradient section */}
        <div
          className={`relative h-40 bg-gradient-to-br ${gradient} flex flex-col items-center justify-center p-4`}
        >
          <span className="absolute top-2 left-2 text-xs bg-black/30 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
            {product.gameName}
          </span>
          <p className="text-white text-xl font-bold text-center leading-tight drop-shadow-lg line-clamp-2 mt-4">
            {product.name}
          </p>
        </div>

        {/* Bottom content section */}
        <div className="p-4 space-y-2">
          <p className="text-text-primary font-medium truncate text-sm">{product.name}</p>

          <div className="flex items-center gap-2">
            <StarRating rating={product.rating} size="sm" />
            <span className="text-text-secondary text-xs">已售 {formatSales(product.sales)}</span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-accent-gold text-xl font-bold">
              {formatPrice(product.defaultPrice)}
            </span>
            <span className="text-text-secondary text-xs line-through">
              {formatPrice(product.originalPrice)}
            </span>
          </div>

          {product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {product.tags.map((tag) => (
                <Badge key={tag} variant={getTagVariant(tag)}>
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
