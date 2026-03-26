'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { formatPrice } from '@/lib/utils'
import { supabase } from '@/lib/supabase/client'
import type { Order } from '@/types'

function PaySuccessContent() {
  const searchParams = useSearchParams()
  const { isLoggedIn, loading: authLoading } = useAuth()

  const orderId = searchParams.get('orderId')

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)
  const [pollTimedOut, setPollTimedOut] = useState(false)

  const fetchOrder = useCallback(async () => {
    if (!orderId) {
      setLoading(false)
      return
    }
    setLoading(true)
    const { data, error } = await supabase
      .from('orders')
      .select('*, items:order_items(*)')
      .eq('id', orderId)
      .single()

    if (!error && data) {
      setOrder({
        ...data,
        total_price: Number(data.total_price),
        items: data.items?.map((i: Record<string, unknown>) => ({
          ...i,
          price: Number(i.price),
        })),
      } as Order)
    }
    setLoading(false)
  }, [orderId])

  useEffect(() => {
    if (!authLoading && isLoggedIn) {
      fetchOrder()
    } else if (!authLoading) {
      setLoading(false)
    }
  }, [authLoading, isLoggedIn, fetchOrder])

  // 轮询订单状态（支付回调可能有延迟，5 分钟超时）
  useEffect(() => {
    if (!order || order.status !== 'pending_payment' || pollTimedOut) return

    const POLL_TIMEOUT = 5 * 60 * 1000
    const startTime = Date.now()

    const interval = setInterval(async () => {
      if (Date.now() - startTime > POLL_TIMEOUT) {
        setPollTimedOut(true)
        clearInterval(interval)
        return
      }

      const { data } = await supabase
        .from('orders')
        .select('*, items:order_items(*)')
        .eq('id', orderId)
        .single()

      if (data && data.status !== 'pending_payment') {
        setOrder({
          ...data,
          total_price: Number(data.total_price),
          items: data.items?.map((i: Record<string, unknown>) => ({
            ...i,
            price: Number(i.price),
          })),
        } as Order)
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [order, orderId, pollTimedOut])

  async function copyToClipboard(text: string, index: number) {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedIdx(index)
      setTimeout(() => setCopiedIdx(null), 2000)
    } catch {
      // ignore
    }
  }

  if (authLoading || loading) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-12 flex justify-center">
        <span className="inline-block w-8 h-8 border-2 border-accent-purple/30 border-t-accent-purple rounded-full animate-spin" />
      </main>
    )
  }

  if (!isLoggedIn) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-12 min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <p className="text-text-primary text-lg">请先登录查看订单</p>
        <Link href="/user">
          <Button variant="primary">去登录</Button>
        </Link>
      </main>
    )
  }

  if (!orderId || !order) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-12 min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <p className="text-text-muted text-lg">订单不存在或无权查看</p>
        <Link href="/user">
          <Button variant="secondary">返回用户中心</Button>
        </Link>
      </main>
    )
  }

  const isPaid = order.status === 'paid' || order.status === 'completed'
  const isPending = order.status === 'pending_payment'
  const isCancelled = order.status === 'cancelled'

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      {/* 支付结果 */}
      <div className="text-center mb-8">
        {isPaid ? (
          <>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent-green/20 flex items-center justify-center">
              <span className="text-accent-green text-3xl">&#10003;</span>
            </div>
            <h1 className="text-2xl font-bold text-text-primary mb-2">支付成功</h1>
            <p className="text-text-muted">卡密已自动发放，请查看下方信息</p>
          </>
        ) : isCancelled ? (
          <>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent-red/20 flex items-center justify-center">
              <span className="text-accent-red text-3xl">&#10007;</span>
            </div>
            <h1 className="text-2xl font-bold text-text-primary mb-2">订单已取消</h1>
            <p className="text-text-muted">订单超时未支付已自动取消，请重新下单</p>
          </>
        ) : isPending ? (
          <>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent-gold/20 flex items-center justify-center">
              <span className="inline-block w-6 h-6 border-2 border-accent-gold/30 border-t-accent-gold rounded-full animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary mb-2">等待支付确认</h1>
            <p className="text-text-muted">正在确认支付结果，请稍候...</p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent-cyan/20 flex items-center justify-center">
              <span className="text-accent-cyan text-3xl">&#8505;</span>
            </div>
            <h1 className="text-2xl font-bold text-text-primary mb-2">订单状态</h1>
            <p className="text-text-muted">当前状态：{order.status}</p>
          </>
        )}
      </div>

      <div className="space-y-6">
        {/* 订单信息 */}
        <section className="bg-bg-card rounded-xl p-4 space-y-3">
          <h2 className="text-base font-semibold text-text-primary">订单信息</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-text-muted">订单号</p>
              <p className="text-text-primary font-medium">{order.order_no}</p>
            </div>
            <div>
              <p className="text-text-muted">支付金额</p>
              <p className="text-accent-gold font-semibold">{formatPrice(order.total_price)}</p>
            </div>
            <div>
              <p className="text-text-muted">充值账号</p>
              <p className="text-text-primary">{order.game_account}</p>
            </div>
            {order.alipay_trade_no && (
              <div>
                <p className="text-text-muted">支付宝交易号</p>
                <p className="text-text-primary text-xs">{order.alipay_trade_no}</p>
              </div>
            )}
          </div>
        </section>

        {/* 卡密信息 */}
        {isPaid && order.items && order.items.length > 0 && (
          <section className="bg-bg-card rounded-xl p-4">
            <h2 className="text-base font-semibold text-text-primary mb-4">卡密信息</h2>
            <div className="divide-y divide-border-default">
              {order.items.map((item, idx) => (
                <div key={item.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-text-primary font-medium text-sm">{item.product_name}</p>
                    <span className="text-text-muted text-xs">
                      {item.game_name} &middot; {item.spec_label}
                    </span>
                  </div>
                  {item.card_code ? (
                    <div className="bg-bg-secondary rounded-lg p-3 flex items-center justify-between gap-2">
                      <p className="text-sm text-accent-green font-mono break-all">{item.card_code}</p>
                      <button
                        onClick={() => copyToClipboard(item.card_code!, idx)}
                        className="shrink-0 px-3 py-1 text-xs rounded-lg bg-accent-purple/20 text-accent-purple hover:bg-accent-purple/30 transition-colors"
                      >
                        {copiedIdx === idx ? '已复制' : '复制'}
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-accent-gold">卡密发放中，请稍候...</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 等待中提示 */}
        {isPending && !pollTimedOut && (
          <div className="bg-accent-gold/10 border border-accent-gold/30 rounded-xl p-4 text-center">
            <p className="text-sm text-accent-gold">
              正在等待支付宝回调确认，通常需要几秒钟...
            </p>
          </div>
        )}

        {/* 轮询超时提示 */}
        {isPending && pollTimedOut && (
          <div className="bg-accent-red/10 border border-accent-red/30 rounded-xl p-4 text-center space-y-2">
            <p className="text-sm text-accent-red font-medium">
              等待支付确认超时
            </p>
            <p className="text-xs text-text-muted">
              如您已完成支付，请刷新页面查看最新状态。如仍未到账，请联系客服处理。
            </p>
            <button
              onClick={() => { setPollTimedOut(false); fetchOrder() }}
              className="mt-2 px-4 py-1.5 text-xs rounded-lg bg-accent-purple/20 text-accent-purple hover:bg-accent-purple/30 transition-colors"
            >
              刷新订单状态
            </button>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex gap-3">
          <Link href={`/order/${order.id}`} className="flex-1">
            <Button variant="secondary" size="md" className="w-full">
              查看订单详情
            </Button>
          </Link>
          <Link href="/products" className="flex-1">
            <Button variant="primary" size="md" className="w-full">
              继续购物
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}

export default function PaySuccessPage() {
  return (
    <Suspense fallback={
      <main className="max-w-3xl mx-auto px-4 py-12 flex justify-center">
        <span className="inline-block w-8 h-8 border-2 border-accent-purple/30 border-t-accent-purple rounded-full animate-spin" />
      </main>
    }>
      <PaySuccessContent />
    </Suspense>
  )
}
