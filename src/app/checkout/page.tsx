'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/Toast'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { formatPrice, generateOrderNo } from '@/lib/utils'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Payment method definition
// ---------------------------------------------------------------------------

type PaymentMethodId = 'alipay' | 'wechat' | 'bank'

interface PaymentMethod {
  id: PaymentMethodId
  name: string
  icon: string
}

const PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'alipay', name: '支付宝', icon: '💙' },
  { id: 'wechat', name: '微信支付', icon: '💚' },
  { id: 'bank', name: '银行卡', icon: '🏦' },
]

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function BackLink() {
  return (
    <Link
      href="/cart"
      className="inline-flex items-center gap-1 text-text-secondary hover:text-text-primary transition-colors text-sm"
    >
      <span>←</span>
      <span>返回购物车</span>
    </Link>
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart()
  const { isLoggedIn } = useAuth()
  const { showToast } = useToast()
  const router = useRouter()

  const [gameAccount, setGameAccount] = useState('')
  const [accountError, setAccountError] = useState('')
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethodId>('alipay')
  const [successModalOpen, setSuccessModalOpen] = useState(false)
  const [orderNo, setOrderNo] = useState('')

  // -------------------------------------------------------------------------
  // Guard: not logged in
  // -------------------------------------------------------------------------
  if (!isLoggedIn) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-8 min-h-[60vh] flex flex-col items-center justify-center gap-6">
        <div className="text-center space-y-3">
          <p className="text-4xl">🔒</p>
          <p className="text-text-primary text-lg font-medium">请先登录后再进行结账</p>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={() => router.push('/user')}
        >
          去登录
        </Button>
      </main>
    )
  }

  // -------------------------------------------------------------------------
  // Guard: empty cart
  // -------------------------------------------------------------------------
  if (items.length === 0 && !successModalOpen) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-8 min-h-[60vh] flex flex-col items-center justify-center gap-6">
        <div className="text-center space-y-3">
          <p className="text-4xl">🛒</p>
          <p className="text-text-primary text-lg font-medium">购物车为空，请先选购商品</p>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={() => router.push('/products')}
        >
          去购物
        </Button>
      </main>
    )
  }

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------
  function handleAccountChange(value: string) {
    setGameAccount(value)
    if (accountError && value.trim()) {
      setAccountError('')
    }
  }

  function handleSubmit() {
    if (!gameAccount.trim()) {
      setAccountError('请输入您的游戏账号')
      showToast('请填写游戏账号', 'error')
      return
    }

    const no = generateOrderNo()
    setOrderNo(no)
    setSuccessModalOpen(true)
    clearCart()
  }

  function handleCloseModal() {
    setSuccessModalOpen(false)
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      {/* Page header */}
      <div className="mb-6 space-y-2">
        <BackLink />
        <h1 className="text-2xl font-bold text-text-primary">确认订单</h1>
      </div>

      <div className="space-y-6">
        {/* ---------------------------------------------------------------- */}
        {/* Section 1: 订单商品摘要                                           */}
        {/* ---------------------------------------------------------------- */}
        <section className="bg-bg-card rounded-xl p-4">
          <h2 className="text-base font-semibold text-text-primary mb-4">订单商品</h2>
          <ul className="divide-y divide-border-default">
            {items.map((item) => {
              const subtotal = item.price * item.quantity
              return (
                <li
                  key={`${item.productId}-${item.specId}`}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <p className="text-text-primary font-medium text-sm truncate">
                      {item.gameName}
                    </p>
                    <p className="text-text-secondary text-xs truncate">
                      {item.productName} · {item.specLabel}
                    </p>
                  </div>
                  <div className="ml-4 flex items-center gap-4 shrink-0">
                    <span className="text-text-secondary text-sm">×{item.quantity}</span>
                    <span className="text-text-primary font-medium text-sm w-20 text-right">
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                </li>
              )
            })}
          </ul>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Section 2: 充值账号                                               */}
        {/* ---------------------------------------------------------------- */}
        <section className="bg-bg-card rounded-xl p-4 space-y-3">
          <h2 className="text-base font-semibold text-text-primary">充值账号</h2>
          <div>
            <input
              type="text"
              value={gameAccount}
              onChange={(e) => handleAccountChange(e.target.value)}
              placeholder="请输入您的游戏账号"
              className={cn(
                'w-full bg-bg-secondary border rounded-lg px-4 py-2.5 text-sm text-text-primary',
                'placeholder:text-text-muted outline-none',
                'focus:ring-2 focus:ring-accent-purple/50 transition-all duration-200',
                accountError
                  ? 'border-accent-red focus:ring-accent-red/50'
                  : 'border-border-default',
              )}
            />
            {accountError && (
              <p className="mt-1.5 text-xs text-accent-red">{accountError}</p>
            )}
          </div>
          <p className="text-xs text-text-muted">
            请确保账号正确，充值后无法退款
          </p>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Section 3: 支付方式                                               */}
        {/* ---------------------------------------------------------------- */}
        <section className="bg-bg-card rounded-xl p-4 space-y-3">
          <h2 className="text-base font-semibold text-text-primary">支付方式</h2>
          <div className="grid grid-cols-3 gap-3">
            {PAYMENT_METHODS.map((method) => {
              const isSelected = selectedPayment === method.id
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setSelectedPayment(method.id)}
                  className={cn(
                    'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200',
                    'hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-accent-purple/50',
                    isSelected
                      ? 'border-accent-purple bg-accent-purple/10'
                      : 'border-border-default bg-bg-card',
                  )}
                  aria-pressed={isSelected}
                  aria-label={method.name}
                >
                  <span className="text-2xl">{method.icon}</span>
                  <span
                    className={cn(
                      'text-sm font-medium',
                      isSelected ? 'text-accent-purple' : 'text-text-secondary',
                    )}
                  >
                    {method.name}
                  </span>
                </button>
              )
            })}
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Section 4: 金额汇总                                               */}
        {/* ---------------------------------------------------------------- */}
        <section className="bg-bg-card rounded-xl p-4">
          <h2 className="text-base font-semibold text-text-primary mb-4">金额汇总</h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">商品总价</span>
              <span className="text-text-primary">{formatPrice(totalPrice)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">优惠金额</span>
              <span className="text-accent-green">-¥0.00</span>
            </div>
            <div className="h-px bg-border-default my-3" />
            <div className="flex justify-between items-center">
              <span className="text-text-secondary font-medium">应付金额</span>
              <span className="text-accent-gold text-2xl font-bold">
                {formatPrice(totalPrice)}
              </span>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Submit button                                                     */}
        {/* ---------------------------------------------------------------- */}
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={handleSubmit}
        >
          提交订单
        </Button>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Success Modal                                                       */}
      {/* ------------------------------------------------------------------ */}
      <Modal
        isOpen={successModalOpen}
        onClose={handleCloseModal}
      >
        <div className="flex flex-col items-center text-center gap-4 pt-2 pb-2">
          {/* Green checkmark */}
          <div className="w-16 h-16 rounded-full bg-accent-green/20 flex items-center justify-center">
            <span className="text-accent-green text-3xl font-bold">✓</span>
          </div>

          {/* Title */}
          <h3 className="text-2xl font-bold text-text-primary">支付成功！</h3>

          {/* Order info */}
          <div className="space-y-1.5 text-sm text-text-secondary">
            <p>
              订单号：<span className="text-text-primary font-medium">{orderNo}</span>
            </p>
            <p>
              支付金额：
              <span className="text-accent-gold font-semibold">
                {formatPrice(totalPrice)}
              </span>
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 w-full mt-2">
            <Button
              variant="secondary"
              size="md"
              className="flex-1"
              onClick={() => router.push('/user')}
            >
              查看订单
            </Button>
            <Button
              variant="primary"
              size="md"
              className="flex-1"
              onClick={() => router.push('/')}
            >
              继续购物
            </Button>
          </div>
        </div>
      </Modal>
    </main>
  )
}
