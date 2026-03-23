'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getProductById } from '@/data/products'
import { getReviewsByProduct } from '@/data/reviews'
import { useCart } from '@/contexts/CartContext'
import { useToast } from '@/components/ui/Toast'
import { StarRating } from '@/components/ui/StarRating'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatPrice, cn } from '@/lib/utils'
import type { ProductSpec } from '@/types'

// ─── Game gradient mapping ────────────────────────────────────────────────────

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

function getGradient(gameId: string): string {
  return gameGradients[gameId] ?? 'from-gray-700 to-gray-900'
}

// ─── Tag variant helper ───────────────────────────────────────────────────────

type BadgeVariant = 'hot' | 'new' | 'sale' | 'default'

function tagVariant(tag: string): BadgeVariant {
  if (tag === '热门') return 'hot'
  if (tag === '新品') return 'new'
  if (tag === '限时') return 'sale'
  return 'default'
}

// ─── Collapsible notice section ───────────────────────────────────────────────

const NOTICE_ITEMS = [
  { label: '充值说明', content: '请确保您提供的游戏账号正确无误' },
  { label: '到账时间', content: '一般5-30分钟内到账，高峰期可能延迟' },
  { label: '注意事项', content: '虚拟商品一经售出，非商品质量问题不支持退款' },
  { label: '客服支持', content: '如有问题请联系在线客服或发送邮件至 support@speedcard.cn' },
]

function PurchaseNotice() {
  const [open, setOpen] = useState(false)

  return (
    <div className="border border-border-default rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-5 py-4 bg-bg-secondary hover:brightness-105 transition-all"
        aria-expanded={open}
      >
        <span className="text-text-primary font-semibold">购买须知</span>
        <span className="text-text-secondary text-lg select-none">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <ul className="px-5 py-4 space-y-3 bg-bg-primary">
          {NOTICE_ITEMS.map((item) => (
            <li key={item.label} className="text-sm text-text-secondary">
              <span className="text-text-primary font-medium">{item.label}：</span>
              {item.content}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ─── Page props ───────────────────────────────────────────────────────────────

interface PageProps {
  params: { id: string }
}

// ─── Main page component ──────────────────────────────────────────────────────

export default function ProductDetailPage({ params }: PageProps) {
  const product = getProductById(params.id)

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-text-primary">
        <p className="text-2xl font-bold">商品不存在</p>
        <Link href="/" className="text-accent-purple hover:underline">
          返回首页
        </Link>
      </div>
    )
  }

  return <ProductDetail productId={params.id} />
}

// ─── Inner component (uses hooks) ────────────────────────────────────────────

function ProductDetail({ productId }: { productId: string }) {
  const product = getProductById(productId)!
  const reviews = getReviewsByProduct(productId)
  const { addItem } = useCart()
  const { showToast } = useToast()
  const router = useRouter()

  const [selectedSpec, setSelectedSpec] = useState<ProductSpec>(product.specs[0])
  const [quantity, setQuantity] = useState(1)

  const gradient = getGradient(product.gameId)
  const discountPct = Math.round((1 - selectedSpec.price / selectedSpec.originalPrice) * 100)

  function handleQuantityChange(delta: number) {
    setQuantity((prev) => Math.min(99, Math.max(1, prev + delta)))
  }

  function buildCartItem() {
    return {
      productId: product.id,
      specId: selectedSpec.id,
      quantity,
      productName: product.name,
      gameName: product.gameName,
      specLabel: selectedSpec.label,
      price: selectedSpec.price,
      gameId: product.gameId,
    }
  }

  function handleAddToCart() {
    addItem(buildCartItem())
    showToast('已添加到购物车', 'success')
  }

  function handleBuyNow() {
    addItem(buildCartItem())
    router.push('/checkout')
  }

  return (
    <main className="min-h-screen bg-bg-primary text-text-primary">
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* ── Product area: two-column on PC, stacked on mobile ── */}
        <div className="flex flex-col md:flex-row gap-6 mb-8">

          {/* Left column: visual display */}
          <div className="w-full md:w-1/2">
            <div
              className={cn(
                'relative h-[400px] rounded-2xl bg-gradient-to-br overflow-hidden flex flex-col items-center justify-center p-6',
                gradient,
              )}
            >
              {/* Game name badge – top left */}
              <span className="absolute top-4 left-4 bg-black/30 text-white text-xs font-medium px-3 py-1 rounded-full backdrop-blur-sm">
                {product.gameName}
              </span>

              {/* Product name */}
              <h1 className="text-white text-2xl font-bold text-center drop-shadow-lg mb-3">
                {product.name}
              </h1>

              {/* Product description */}
              <p className="text-white/80 text-sm text-center max-w-xs leading-relaxed">
                {product.description}
              </p>
            </div>
          </div>

          {/* Right column: purchase panel */}
          <div className="w-full md:w-1/2 md:p-6 flex flex-col gap-4">

            {/* Product name */}
            <h2 className="text-2xl font-bold text-text-primary">{product.name}</h2>

            {/* Rating + sales */}
            <div className="flex items-center gap-3">
              <StarRating rating={product.rating} showNumber size="sm" />
              <span className="text-sm text-text-secondary">已售 {product.sales.toLocaleString()}</span>
            </div>

            {/* Price area */}
            <div className="flex items-end gap-3 flex-wrap">
              <span className="text-3xl text-accent-gold font-bold">
                {formatPrice(selectedSpec.price)}
              </span>
              <span className="text-sm text-text-muted line-through mb-1">
                {formatPrice(selectedSpec.originalPrice)}
              </span>
              {discountPct > 0 && (
                <span className="mb-1 bg-accent-red/10 text-accent-red text-xs font-medium px-2 py-0.5 rounded-full">
                  省{discountPct}%
                </span>
              )}
            </div>

            {/* Spec selector */}
            <div>
              <p className="text-sm text-text-secondary mb-2 font-medium">面值选择</p>
              <div className="flex flex-wrap gap-2">
                {product.specs.map((spec) => (
                  <button
                    key={spec.id}
                    type="button"
                    onClick={() => setSelectedSpec(spec)}
                    className={cn(
                      'border rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
                      spec.id === selectedSpec.id
                        ? 'border-accent-purple bg-accent-purple/20 text-text-primary'
                        : 'border-border-default bg-bg-secondary text-text-secondary hover:border-accent-purple/50',
                    )}
                  >
                    {spec.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity selector */}
            <div>
              <p className="text-sm text-text-secondary mb-2 font-medium">数量</p>
              <div className="inline-flex items-center border border-border-default rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  aria-label="减少数量"
                  className="w-10 h-10 flex items-center justify-center text-text-primary hover:bg-bg-secondary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  −
                </button>
                <span className="w-12 text-center text-text-primary font-medium select-none">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= 99}
                  aria-label="增加数量"
                  className="w-10 h-10 flex items-center justify-center text-text-primary hover:bg-bg-secondary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 pt-2">
              <Button variant="secondary" className="flex-1" onClick={handleAddToCart}>
                加入购物车
              </Button>
              <Button variant="primary" className="flex-1" onClick={handleBuyNow}>
                立即购买
              </Button>
            </div>

            {/* Tags */}
            {product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {product.tags.map((tag) => (
                  <Badge key={tag} variant={tagVariant(tag)}>
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Purchase notice ── */}
        <div className="mb-8">
          <PurchaseNotice />
        </div>

        {/* ── User reviews ── */}
        <section>
          <h3 className="text-xl font-bold text-text-primary mb-4">
            用户评价
            <span className="ml-2 text-sm font-normal text-text-secondary">
              ({reviews.length} 条)
            </span>
          </h3>

          {reviews.length === 0 ? (
            <p className="text-text-secondary text-sm">暂无评价</p>
          ) : (
            <ul className="space-y-4">
              {reviews.map((review) => (
                <li
                  key={review.id}
                  className="bg-bg-secondary border border-border-default rounded-xl p-4 flex gap-4"
                >
                  {/* Avatar */}
                  <div className="shrink-0 w-10 h-10 rounded-full bg-accent-purple/20 flex items-center justify-center text-accent-purple font-bold text-sm">
                    {review.avatar}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                      <span className="font-medium text-text-primary text-sm">{review.userName}</span>
                      <span className="text-text-muted text-xs">{review.date}</span>
                    </div>
                    <StarRating rating={review.rating} size="sm" className="mb-2" />
                    <p className="text-sm text-text-secondary leading-relaxed">{review.content}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  )
}
