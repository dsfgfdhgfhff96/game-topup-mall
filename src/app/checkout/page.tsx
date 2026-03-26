'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/Toast'
import { Button } from '@/components/ui/Button'
import { QrPayModal } from '@/components/QrPayModal'
import { useDeviceType } from '@/hooks/useDeviceType'
import { formatPrice } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase/client'

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function BackLink() {
  return (
    <Link
      href="/cart"
      className="inline-flex items-center gap-1 text-text-secondary hover:text-text-primary transition-colors text-sm"
    >
      <span>&larr;</span>
      <span>返回购物车</span>
    </Link>
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart()
  const { isLoggedIn, user } = useAuth()
  const { showToast } = useToast()
  const router = useRouter()

  const { isMobile } = useDeviceType()
  const [gameAccount, setGameAccount] = useState('')
  const [accountError, setAccountError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [qrModalOpen, setQrModalOpen] = useState(false)
  const [paymentInfo, setPaymentInfo] = useState<{
    payUrl: string; orderId: string; orderNo: string; totalPrice: number
  } | null>(null)

  // -------------------------------------------------------------------------
  // Guard: not logged in
  // -------------------------------------------------------------------------
  if (!isLoggedIn) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-8 min-h-[60vh] flex flex-col items-center justify-center gap-6">
        <div className="text-center space-y-3">
          <p className="text-4xl">&#128274;</p>
          <p className="text-text-primary text-lg font-medium">请先登录后再进行结账</p>
        </div>
        <Button variant="primary" size="md" onClick={() => router.push('/user')}>
          去登录
        </Button>
      </main>
    )
  }

  // -------------------------------------------------------------------------
  // Guard: not verified
  // -------------------------------------------------------------------------
  if (!user?.is_verified) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-8 min-h-[60vh] flex flex-col items-center justify-center gap-6">
        <div className="text-center space-y-3">
          <p className="text-4xl">&#128100;</p>
          <p className="text-text-primary text-lg font-medium">请先完成实名认证</p>
          <p className="text-text-muted text-sm">根据相关法规，下单前需要完成实名认证</p>
        </div>
        <Button variant="primary" size="md" onClick={() => router.push('/user')}>
          去认证
        </Button>
      </main>
    )
  }

  // -------------------------------------------------------------------------
  // Guard: empty cart
  // -------------------------------------------------------------------------
  if (items.length === 0) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-8 min-h-[60vh] flex flex-col items-center justify-center gap-6">
        <div className="text-center space-y-3">
          <p className="text-4xl">&#128722;</p>
          <p className="text-text-primary text-lg font-medium">购物车为空，请先选购商品</p>
        </div>
        <Button variant="primary" size="md" onClick={() => router.push('/products')}>
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
    if (accountError && value.trim()) setAccountError('')
  }

  async function handleSubmit() {
    if (!gameAccount.trim()) {
      setAccountError('请输入您的游戏账号')
      showToast('请填写游戏账号', 'error')
      return
    }

    setSubmitting(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setSubmitting(false)
        showToast('登录已过期，请重新登录', 'error')
        router.push('/user')
        return
      }

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            specId: item.specId,
            quantity: item.quantity,
            productName: item.productName,
            gameName: item.gameName,
            specLabel: item.specLabel,
            price: item.price,
          })),
          gameAccount: gameAccount.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok && response.status !== 202) {
        showToast(data.error || '创建订单失败', 'error')
        setSubmitting(false)
        return
      }

      if (data.payUrl && !isMobile) {
        // PC 端：弹出二维码扫码支付（不清空购物车，避免触发空购物车 guard）
        setPaymentInfo({
          payUrl: data.payUrl,
          orderId: data.orderId,
          orderNo: data.orderNo,
          totalPrice,
        })
        setQrModalOpen(true)
        setSubmitting(false)
      } else if (data.payUrl) {
        // 移动端：先跳转支付宝，再清空购物车（避免 clearCart 触发重渲染导致空购物车 guard 闪现）
        showToast('正在跳转支付宝...', 'info')
        window.location.href = data.payUrl
        // 跳转已触发，延迟清空购物车（页面即将卸载，不会触发重渲染）
        setTimeout(() => clearCart(), 100)
      } else {
        // 支付宝不可用时，直接跳转订单页
        showToast(data.error || '订单已创建', 'info')
        router.push(`/order/${data.orderId}`)
        setTimeout(() => clearCart(), 100)
      }
    } catch {
      showToast('网络错误，请稍后重试', 'error')
      setSubmitting(false)
    }
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6 space-y-2">
        <BackLink />
        <h1 className="text-2xl font-bold text-text-primary">确认订单</h1>
      </div>

      <div className="space-y-6">
        {/* 订单商品摘要 */}
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
                    <p className="text-text-primary font-medium text-sm truncate">{item.gameName}</p>
                    <p className="text-text-secondary text-xs truncate">
                      {item.productName} &middot; {item.specLabel}
                    </p>
                  </div>
                  <div className="ml-4 flex items-center gap-4 shrink-0">
                    <span className="text-text-secondary text-sm">&times;{item.quantity}</span>
                    <span className="text-text-primary font-medium text-sm w-20 text-right">
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                </li>
              )
            })}
          </ul>
        </section>

        {/* 充值账号 */}
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
          <p className="text-xs text-text-muted">请确保账号正确，充值后无法退款</p>
        </section>

        {/* 支付方式 - 仅支付宝 */}
        <section className="bg-bg-card rounded-xl p-4 space-y-3">
          <h2 className="text-base font-semibold text-text-primary">支付方式</h2>
          <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-accent-purple bg-accent-purple/10">
            <span className="text-2xl">&#128153;</span>
            <span className="text-sm font-medium text-accent-purple">支付宝</span>
            <span className="ml-auto text-xs text-accent-green">&#10003; 已选择</span>
          </div>
        </section>

        {/* 金额汇总 */}
        <section className="bg-bg-card rounded-xl p-4">
          <h2 className="text-base font-semibold text-text-primary mb-4">金额汇总</h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">商品总价</span>
              <span className="text-text-primary">{formatPrice(totalPrice)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">优惠金额</span>
              <span className="text-accent-green">-&yen;0.00</span>
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

        {/* 提交按钮 */}
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              正在跳转支付宝...
            </span>
          ) : (
            '立即支付'
          )}
        </Button>
      </div>

      {/* PC 端二维码支付弹窗 */}
      {paymentInfo && (
        <QrPayModal
          isOpen={qrModalOpen}
          onClose={() => setQrModalOpen(false)}
          payUrl={paymentInfo.payUrl}
          orderId={paymentInfo.orderId}
          orderNo={paymentInfo.orderNo}
          totalPrice={paymentInfo.totalPrice}
        />
      )}
    </main>
  )
}
