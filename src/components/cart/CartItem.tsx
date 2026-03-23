'use client'

import type { CartItem as CartItemType } from '@/types'
import { formatPrice } from '@/lib/utils'

interface CartItemProps {
  item: CartItemType
  onUpdateQuantity: (productId: string, specId: string, qty: number) => void
  onRemove: (productId: string, specId: string) => void
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

export function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const gradient = gameGradients[item.gameId] ?? defaultGradient
  const subtotal = item.price * item.quantity

  function handleDecrement(): void {
    if (item.quantity > 1) {
      onUpdateQuantity(item.productId, item.specId, item.quantity - 1)
    }
  }

  function handleIncrement(): void {
    onUpdateQuantity(item.productId, item.specId, item.quantity + 1)
  }

  function handleRemove(): void {
    onRemove(item.productId, item.specId)
  }

  return (
    <div className="bg-bg-card rounded-xl p-4 border border-border-default flex items-center gap-4">
      {/* Thumbnail */}
      <div
        className={`w-20 h-20 rounded-lg bg-gradient-to-br ${gradient} flex-shrink-0 flex items-center justify-center`}
        aria-hidden="true"
      >
        <span className="text-white text-xs font-bold text-center px-1 leading-tight line-clamp-2">
          {item.gameName}
        </span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-text-muted text-sm truncate">{item.gameName}</p>
        <p className="text-text-primary font-medium truncate">{item.productName}</p>
        <p className="text-accent-purple text-sm truncate">{item.specLabel}</p>
        <p className="text-accent-gold text-sm mt-0.5">{formatPrice(item.price)}</p>
      </div>

      {/* Quantity controls */}
      <div className="flex items-center gap-1 border border-border-default rounded-lg overflow-hidden flex-shrink-0">
        <button
          onClick={handleDecrement}
          disabled={item.quantity <= 1}
          className="w-8 h-8 flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="减少数量"
        >
          −
        </button>
        <span className="w-8 text-center text-text-primary text-sm select-none">
          {item.quantity}
        </span>
        <button
          onClick={handleIncrement}
          className="w-8 h-8 flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition-colors"
          aria-label="增加数量"
        >
          +
        </button>
      </div>

      {/* Subtotal */}
      <div className="text-text-primary font-bold text-base w-20 text-right flex-shrink-0">
        {formatPrice(subtotal)}
      </div>

      {/* Delete */}
      <button
        onClick={handleRemove}
        className="text-text-muted hover:text-accent-red transition-colors flex-shrink-0 p-1"
        aria-label="删除商品"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  )
}
