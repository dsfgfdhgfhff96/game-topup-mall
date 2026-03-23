'use client'

import { useRouter } from 'next/navigation'
import { useCart } from '@/contexts/CartContext'
import { CartItem } from '@/components/cart/CartItem'
import { Button } from '@/components/ui/Button'
import { formatPrice } from '@/lib/utils'

function EmptyCart() {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center py-24 gap-6">
      <span className="text-8xl select-none" aria-hidden="true">
        🛒
      </span>
      <p className="text-text-muted text-xl">购物车空空如也</p>
      <Button variant="primary" onClick={() => router.push('/products')}>
        去逛逛
      </Button>
    </div>
  )
}

export default function CartPage() {
  const router = useRouter()
  const { items, totalItems, totalPrice, updateQuantity, removeItem, clearCart } = useCart()

  if (items.length === 0) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-text-primary mb-6">购物车</h1>
        <EmptyCart />
      </main>
    )
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-text-primary mb-6">
        购物车
        <span className="text-text-muted text-base font-normal ml-2">({totalItems} 件)</span>
      </h1>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Cart items list */}
        <div className="flex-1 flex flex-col gap-3 w-full">
          {items.map((item) => (
            <CartItem
              key={`${item.productId}-${item.specId}`}
              item={item}
              onUpdateQuantity={updateQuantity}
              onRemove={removeItem}
            />
          ))}
        </div>

        {/* Summary panel – sticky on PC, fixed bar on mobile */}
        <aside className="w-full lg:w-72 flex-shrink-0">
          {/* Mobile: fixed bottom bar */}
          <div className="fixed bottom-0 left-0 right-0 z-30 bg-bg-card border-t border-border-default px-4 py-3 flex items-center justify-between gap-3 lg:hidden">
            <div className="min-w-0">
              <p className="text-text-muted text-xs">
                已选商品{' '}
                <span className="text-text-primary font-semibold">{totalItems}</span> 件
              </p>
              <p className="text-accent-gold text-lg font-bold leading-tight">
                {formatPrice(totalPrice)}
              </p>
            </div>
            <Button
              variant="primary"
              size="md"
              onClick={() => router.push('/checkout')}
              className="flex-shrink-0"
            >
              去结算
            </Button>
          </div>

          {/* PC: sticky card */}
          <div className="hidden lg:block sticky top-24 bg-bg-card rounded-xl border border-border-default p-6 space-y-4">
            <h2 className="text-text-primary font-semibold text-lg">订单摘要</h2>

            <div className="flex items-center justify-between text-sm">
              <span className="text-text-muted">已选商品</span>
              <span className="text-text-primary font-medium">{totalItems} 件</span>
            </div>

            <div className="border-t border-border-default pt-4">
              <div className="flex items-baseline justify-between">
                <span className="text-text-secondary text-sm">商品总价</span>
                <span className="text-accent-gold text-2xl font-bold">
                  {formatPrice(totalPrice)}
                </span>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={() => router.push('/checkout')}
            >
              去结算
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="w-full text-text-muted hover:text-accent-red"
              onClick={clearCart}
            >
              清空购物车
            </Button>
          </div>
        </aside>
      </div>

      {/* Mobile bottom padding so content isn't hidden behind fixed bar */}
      <div className="h-20 lg:hidden" aria-hidden="true" />
    </main>
  )
}
