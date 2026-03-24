'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/Toast'
import { Button } from '@/components/ui/Button'
import { formatPrice } from '@/lib/utils'
import { supabase } from '@/lib/supabase/client'
import type { Order, OrderStatus } from '@/types'

// ─── Types ────────────────────────────────────────────────────────────────────

type AuthTab = 'login' | 'register'

interface FieldErrors {
  [key: string]: string
}

// ─── Status config ───────────────────────────────────────────────────────────

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: '待支付',
  paid: '已支付',
  completed: '已完成',
  refund_requested: '退款申请中',
  refunded: '已退款',
  cancelled: '已取消',
}

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending_payment: 'bg-accent-gold/20 text-accent-gold border border-accent-gold/30',
  paid: 'bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30',
  completed: 'bg-accent-green/20 text-accent-green border border-accent-green/30',
  refund_requested: 'bg-accent-red/20 text-accent-red border border-accent-red/30',
  refunded: 'bg-gray-500/20 text-gray-400 border border-gray-500/30',
  cancelled: 'bg-gray-500/20 text-gray-400 border border-gray-500/30',
}

function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[status] ?? ''}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  )
}

// ─── Login form ───────────────────────────────────────────────────────────────

function LoginForm() {
  const { login } = useAuth()
  const { showToast } = useToast()

  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitting, setSubmitting] = useState(false)

  function updateField(field: string, value: string): void {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  function validate(): boolean {
    const newErrors: FieldErrors = {}
    if (!form.email.trim()) newErrors.email = '请输入邮箱'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = '邮箱格式不正确'
    if (!form.password) newErrors.password = '请输入密码'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    const result = await login(form.email.trim(), form.password)
    setSubmitting(false)
    if (result.error) {
      showToast(result.error, 'error')
    } else {
      showToast('登录成功', 'success')
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-text-secondary">邮箱</label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => updateField('email', e.target.value)}
          placeholder="请输入邮箱"
          className="w-full px-4 py-2.5 rounded-lg bg-bg-secondary border border-border-default text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-purple transition-colors"
        />
        {errors.email && <p className="text-xs text-accent-red">{errors.email}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-text-secondary">密码</label>
        <input
          type="password"
          value={form.password}
          onChange={(e) => updateField('password', e.target.value)}
          placeholder="请输入密码"
          className="w-full px-4 py-2.5 rounded-lg bg-bg-secondary border border-border-default text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-purple transition-colors"
        />
        {errors.password && <p className="text-xs text-accent-red">{errors.password}</p>}
      </div>

      <Button type="submit" variant="primary" className="w-full mt-2" disabled={submitting}>
        {submitting ? '登录中...' : '登录'}
      </Button>
    </form>
  )
}

// ─── Register form ────────────────────────────────────────────────────────────

function RegisterForm() {
  const { register } = useAuth()
  const { showToast } = useToast()

  const [form, setForm] = useState({ email: '', nickname: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitting, setSubmitting] = useState(false)

  function updateField(field: string, value: string): void {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  function validate(): boolean {
    const newErrors: FieldErrors = {}
    if (!form.email.trim()) newErrors.email = '请输入邮箱'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = '邮箱格式不正确'
    if (!form.password) newErrors.password = '请输入密码'
    else if (form.password.length < 6) newErrors.password = '密码长度不能少于6位'
    if (!form.confirmPassword) newErrors.confirmPassword = '请确认密码'
    else if (form.password !== form.confirmPassword) newErrors.confirmPassword = '两次输入的密码不一致'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    const result = await register(form.email.trim(), form.password, form.nickname.trim() || undefined)
    setSubmitting(false)
    if (result.error) {
      showToast(result.error, 'error')
    } else {
      showToast('注册成功', 'success')
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-text-secondary">邮箱</label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => updateField('email', e.target.value)}
          placeholder="请输入邮箱"
          className="w-full px-4 py-2.5 rounded-lg bg-bg-secondary border border-border-default text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-purple transition-colors"
        />
        {errors.email && <p className="text-xs text-accent-red">{errors.email}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-text-secondary">昵称（选填）</label>
        <input
          type="text"
          value={form.nickname}
          onChange={(e) => updateField('nickname', e.target.value)}
          placeholder="请输入昵称"
          className="w-full px-4 py-2.5 rounded-lg bg-bg-secondary border border-border-default text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-purple transition-colors"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-text-secondary">密码</label>
        <input
          type="password"
          value={form.password}
          onChange={(e) => updateField('password', e.target.value)}
          placeholder="请输入密码（至少6位）"
          className="w-full px-4 py-2.5 rounded-lg bg-bg-secondary border border-border-default text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-purple transition-colors"
        />
        {errors.password && <p className="text-xs text-accent-red">{errors.password}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-text-secondary">确认密码</label>
        <input
          type="password"
          value={form.confirmPassword}
          onChange={(e) => updateField('confirmPassword', e.target.value)}
          placeholder="请再次输入密码"
          className="w-full px-4 py-2.5 rounded-lg bg-bg-secondary border border-border-default text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-purple transition-colors"
        />
        {errors.confirmPassword && <p className="text-xs text-accent-red">{errors.confirmPassword}</p>}
      </div>

      <Button type="submit" variant="primary" className="w-full mt-2" disabled={submitting}>
        {submitting ? '注册中...' : '注册'}
      </Button>
    </form>
  )
}

// ─── Auth panel ───────────────────────────────────────────────────────────────

function AuthPanel() {
  const [activeTab, setActiveTab] = useState<AuthTab>('login')

  const tabs: { key: AuthTab; label: string }[] = [
    { key: 'login', label: '登录' },
    { key: 'register', label: '注册' },
  ]

  return (
    <div className="bg-bg-card rounded-xl p-8 max-w-md mx-auto border border-border-default">
      <h1 className="text-2xl font-bold text-center text-text-primary mb-8">
        欢迎来到极速卡
      </h1>
      <div className="flex mb-8 border-b border-border-default">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={[
              'flex-1 pb-3 text-base font-medium transition-colors',
              activeTab === tab.key
                ? 'text-accent-purple border-b-2 border-accent-purple -mb-px'
                : 'text-text-muted hover:text-text-primary',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {activeTab === 'login' ? <LoginForm /> : <RegisterForm />}
    </div>
  )
}

// ─── Verification module ─────────────────────────────────────────────────────

function validateIdCard(idCard: string): boolean {
  if (idCard.length !== 18) return false
  const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
  const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2']
  const body = idCard.slice(0, 17)
  if (!/^\d{17}$/.test(body)) return false
  let sum = 0
  for (let i = 0; i < 17; i++) {
    sum += parseInt(body[i]) * weights[i]
  }
  return checkCodes[sum % 11] === idCard[17].toUpperCase()
}

function VerificationPanel() {
  const { user, updateVerification } = useAuth()
  const { showToast } = useToast()

  const [form, setForm] = useState({ realName: '', idCard: '' })
  const [errors, setErrors] = useState<FieldErrors>({})
  const [verifying, setVerifying] = useState(false)

  if (!user) return null

  if (user.is_verified) {
    return (
      <section className="bg-bg-card rounded-xl p-6 border border-border-default">
        <h2 className="text-lg font-semibold text-text-primary mb-4">实名认证</h2>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent-green/20 flex items-center justify-center">
            <span className="text-accent-green text-lg">&#10003;</span>
          </div>
          <div>
            <p className="text-text-primary font-medium">已认证</p>
            <p className="text-sm text-text-muted">
              {user.real_name} | 身份证尾号 {user.id_card_last4}
            </p>
          </div>
        </div>
      </section>
    )
  }

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    const newErrors: FieldErrors = {}
    if (!form.realName.trim()) newErrors.realName = '请输入真实姓名'
    else if (form.realName.trim().length < 2) newErrors.realName = '姓名至少2个字'
    if (!form.idCard.trim()) newErrors.idCard = '请输入身份证号'
    else if (!validateIdCard(form.idCard.trim())) newErrors.idCard = '身份证号格式不正确'
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    setVerifying(true)
    // 1.5 秒模拟验证动画
    await new Promise((r) => setTimeout(r, 1500))
    const result = await updateVerification(form.realName.trim(), form.idCard.trim())
    setVerifying(false)

    if (result.error) {
      showToast(result.error, 'error')
    } else {
      showToast('实名认证成功', 'success')
    }
  }

  return (
    <section className="bg-bg-card rounded-xl p-6 border border-border-default">
      <h2 className="text-lg font-semibold text-text-primary mb-4">实名认证</h2>
      <p className="text-sm text-text-muted mb-4">完成实名认证后即可下单购买</p>
      <form onSubmit={handleVerify} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-text-secondary">真实姓名</label>
          <input
            type="text"
            value={form.realName}
            onChange={(e) => updateField('realName', e.target.value)}
            placeholder="请输入真实姓名"
            className="w-full px-4 py-2.5 rounded-lg bg-bg-secondary border border-border-default text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-purple transition-colors"
          />
          {errors.realName && <p className="text-xs text-accent-red">{errors.realName}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-text-secondary">身份证号</label>
          <input
            type="text"
            value={form.idCard}
            onChange={(e) => updateField('idCard', e.target.value)}
            placeholder="请输入18位身份证号"
            maxLength={18}
            className="w-full px-4 py-2.5 rounded-lg bg-bg-secondary border border-border-default text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-purple transition-colors"
          />
          {errors.idCard && <p className="text-xs text-accent-red">{errors.idCard}</p>}
        </div>
        <Button type="submit" variant="primary" className="w-full" disabled={verifying}>
          {verifying ? (
            <span className="flex items-center justify-center gap-2">
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              验证中...
            </span>
          ) : (
            '提交认证'
          )}
        </Button>
      </form>
    </section>
  )
}

// ─── User card ────────────────────────────────────────────────────────────────

function UserCard() {
  const { user, logout } = useAuth()
  const { showToast } = useToast()

  if (!user) return null

  async function handleLogout() {
    await logout()
    showToast('已退出登录', 'info')
  }

  return (
    <div className="bg-bg-card rounded-xl p-6 border border-border-default flex flex-col sm:flex-row items-start sm:items-center gap-5">
      <div className="w-16 h-16 rounded-full bg-accent-purple flex items-center justify-center text-white text-2xl font-bold shrink-0 select-none">
        {user.avatar_url}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-lg font-semibold text-text-primary truncate">{user.nickname}</p>
        <p className="text-sm text-text-muted truncate">{user.email}</p>
      </div>
      <Button variant="danger" size="sm" onClick={handleLogout} className="shrink-0">
        退出登录
      </Button>
    </div>
  )
}

// ─── Order history ────────────────────────────────────────────────────────────

type OrderFilter = 'all' | 'pending_payment' | 'completed' | 'refund_requested'

function OrderHistory() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<OrderFilter>('all')
  const [refundOrderId, setRefundOrderId] = useState<string | null>(null)
  const [refundReason, setRefundReason] = useState('')
  const [submittingRefund, setSubmittingRefund] = useState(false)

  const fetchOrders = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data, error } = await supabase
      .from('orders')
      .select('*, items:order_items(*)')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setOrders(data.map((o) => ({
        ...o,
        total_price: Number(o.total_price),
        items: o.items?.map((i: Record<string, unknown>) => ({ ...i, price: Number(i.price) })),
      })) as Order[])
    }
    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter((o) => o.status === filter)

  async function handleRefund(orderId: string) {
    if (!refundReason.trim()) {
      showToast('请填写退款原因', 'error')
      return
    }
    setSubmittingRefund(true)
    const { error } = await supabase
      .from('orders')
      .update({ refund_reason: refundReason.trim(), status: 'refund_requested' })
      .eq('id', orderId)

    setSubmittingRefund(false)
    if (error) {
      showToast('提交失败，请稍后重试', 'error')
    } else {
      showToast('退款申请已提交', 'success')
      setRefundOrderId(null)
      setRefundReason('')
      fetchOrders()
    }
  }

  const filters: { key: OrderFilter; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'pending_payment', label: '待支付' },
    { key: 'completed', label: '已完成' },
    { key: 'refund_requested', label: '退款中' },
  ]

  if (loading) {
    return (
      <section>
        <h2 className="text-xl font-bold text-text-primary mb-4">我的订单</h2>
        <div className="flex justify-center py-12">
          <span className="inline-block w-6 h-6 border-2 border-accent-purple/30 border-t-accent-purple rounded-full animate-spin" />
        </div>
      </section>
    )
  }

  return (
    <section>
      <h2 className="text-xl font-bold text-text-primary mb-4">我的订单</h2>

      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              filter === f.key
                ? 'bg-accent-purple text-white'
                : 'bg-bg-secondary text-text-muted hover:text-text-primary'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <p className="text-text-muted text-center py-12">暂无订单记录</p>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-bg-card rounded-xl p-4 border border-border-default">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div>
                  <p className="text-xs text-text-muted">订单号：{order.order_no}</p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {new Date(order.created_at).toLocaleString('zh-CN')}
                  </p>
                </div>
                <StatusBadge status={order.status} />
              </div>

              <div className="flex flex-col gap-1.5 mb-3">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <span className="text-text-primary">
                      {item.product_name}
                      <span className="text-text-muted ml-2">({item.spec_label})</span>
                      <span className="text-text-muted ml-1">&times;{item.quantity}</span>
                    </span>
                    <span className="text-text-secondary ml-4 shrink-0">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-between border-t border-border-default pt-3 gap-2">
                <div className="flex gap-2">
                  <Link href={`/order/${order.id}`}>
                    <Button variant="secondary" size="sm">查看详情</Button>
                  </Link>
                  {order.status === 'completed' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setRefundOrderId(order.id)}
                    >
                      申请退款
                    </Button>
                  )}
                </div>
                <p className="text-sm text-text-secondary">
                  总金额：
                  <span className="text-accent-gold font-semibold text-base ml-1">
                    {formatPrice(order.total_price)}
                  </span>
                </p>
              </div>

              {/* Refund form */}
              {refundOrderId === order.id && (
                <div className="mt-3 pt-3 border-t border-border-default space-y-3">
                  <textarea
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    placeholder="请填写退款原因"
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-lg bg-bg-secondary border border-border-default text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-purple transition-colors text-sm resize-none"
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleRefund(order.id)}
                      disabled={submittingRefund}
                    >
                      {submittingRefund ? '提交中...' : '提交申请'}
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setRefundOrderId(null)
                        setRefundReason('')
                      }}
                    >
                      取消
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function Dashboard() {
  return (
    <div className="flex flex-col gap-8">
      <UserCard />
      <VerificationPanel />
      <OrderHistory />
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function UserPage() {
  const { isLoggedIn, loading } = useAuth()

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-8 flex justify-center">
        <span className="inline-block w-8 h-8 border-2 border-accent-purple/30 border-t-accent-purple rounded-full animate-spin" />
      </main>
    )
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      {isLoggedIn ? (
        <>
          <h1 className="text-2xl font-bold text-text-primary mb-6">用户中心</h1>
          <Dashboard />
        </>
      ) : (
        <AuthPanel />
      )}
    </main>
  )
}
