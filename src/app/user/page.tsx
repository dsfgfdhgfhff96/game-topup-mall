'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/Toast'
import { Button } from '@/components/ui/Button'
import { formatPrice } from '@/lib/utils'
import { mockOrders } from '@/data/orders'

// ─── Types ────────────────────────────────────────────────────────────────────

type AuthTab = 'login' | 'register'

interface LoginFormState {
  username: string
  password: string
}

interface RegisterFormState {
  username: string
  password: string
  confirmPassword: string
}

interface FieldErrors {
  [key: string]: string
}

// ─── Status badge ─────────────────────────────────────────────────────────────

const statusConfig: Record<string, { label: string; className: string }> = {
  已完成: {
    label: '已完成',
    className: 'bg-accent-green/20 text-accent-green border border-accent-green/30',
  },
  待发货: {
    label: '待发货',
    className: 'bg-accent-gold/20 text-accent-gold border border-accent-gold/30',
  },
  处理中: {
    label: '处理中',
    className: 'bg-accent-purple/20 text-accent-purple border border-accent-purple/30',
  },
}

function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] ?? {
    label: status,
    className: 'bg-bg-secondary text-text-muted border border-border-default',
  }
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${config.className}`}>
      {config.label}
    </span>
  )
}

// ─── Login form ───────────────────────────────────────────────────────────────

function LoginForm() {
  const { login } = useAuth()
  const { showToast } = useToast()

  const [form, setForm] = useState<LoginFormState>({ username: '', password: '' })
  const [errors, setErrors] = useState<FieldErrors>({})

  function updateField(field: keyof LoginFormState, value: string): void {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  function validate(): boolean {
    const newErrors: FieldErrors = {}
    if (!form.username.trim()) {
      newErrors.username = '请输入用户名'
    }
    if (!form.password) {
      newErrors.password = '请输入密码'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleSubmit(e: React.FormEvent): void {
    e.preventDefault()
    if (!validate()) return
    login(form.username.trim(), form.password)
    showToast('登录成功', 'success')
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-text-secondary">用户名</label>
        <input
          type="text"
          value={form.username}
          onChange={(e) => updateField('username', e.target.value)}
          placeholder="请输入用户名"
          className="w-full px-4 py-2.5 rounded-lg bg-bg-secondary border border-border-default text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-purple transition-colors"
        />
        {errors.username && (
          <p className="text-xs text-accent-red">{errors.username}</p>
        )}
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
        {errors.password && (
          <p className="text-xs text-accent-red">{errors.password}</p>
        )}
      </div>

      <Button type="submit" variant="primary" className="w-full mt-2">
        登录
      </Button>
    </form>
  )
}

// ─── Register form ────────────────────────────────────────────────────────────

function RegisterForm() {
  const { register } = useAuth()
  const { showToast } = useToast()

  const [form, setForm] = useState<RegisterFormState>({
    username: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<FieldErrors>({})

  function updateField(field: keyof RegisterFormState, value: string): void {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  function validate(): boolean {
    const newErrors: FieldErrors = {}
    if (!form.username.trim()) {
      newErrors.username = '请输入用户名'
    }
    if (!form.password) {
      newErrors.password = '请输入密码'
    } else if (form.password.length < 6) {
      newErrors.password = '密码长度不能少于6位'
    }
    if (!form.confirmPassword) {
      newErrors.confirmPassword = '请确认密码'
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = '两次输入的密码不一致'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleSubmit(e: React.FormEvent): void {
    e.preventDefault()
    if (!validate()) return
    register(form.username.trim(), form.password)
    showToast('注册成功', 'success')
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-text-secondary">用户名</label>
        <input
          type="text"
          value={form.username}
          onChange={(e) => updateField('username', e.target.value)}
          placeholder="请输入用户名"
          className="w-full px-4 py-2.5 rounded-lg bg-bg-secondary border border-border-default text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-purple transition-colors"
        />
        {errors.username && (
          <p className="text-xs text-accent-red">{errors.username}</p>
        )}
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
        {errors.password && (
          <p className="text-xs text-accent-red">{errors.password}</p>
        )}
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
        {errors.confirmPassword && (
          <p className="text-xs text-accent-red">{errors.confirmPassword}</p>
        )}
      </div>

      <Button type="submit" variant="primary" className="w-full mt-2">
        注册
      </Button>
    </form>
  )
}

// ─── Auth panel (not logged in) ───────────────────────────────────────────────

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

      {/* Tab switcher */}
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

// ─── User info card ───────────────────────────────────────────────────────────

interface UserCardProps {
  username: string
  nickname: string
  avatar: string
  balance: number
  onLogout: () => void
}

function UserCard({ username, nickname, avatar, balance, onLogout }: UserCardProps) {
  return (
    <div className="bg-bg-card rounded-xl p-6 border border-border-default flex flex-col sm:flex-row items-start sm:items-center gap-5">
      {/* Avatar */}
      <div className="w-16 h-16 rounded-full bg-accent-purple flex items-center justify-center text-white text-2xl font-bold shrink-0 select-none">
        {avatar}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-lg font-semibold text-text-primary truncate">{nickname || username}</p>
        {nickname !== username && (
          <p className="text-sm text-text-muted truncate">@{username}</p>
        )}
        <p className="text-sm text-text-secondary mt-1">
          账户余额：
          <span className="text-accent-gold font-semibold">{formatPrice(balance)}</span>
        </p>
      </div>

      {/* Logout */}
      <Button variant="danger" size="sm" onClick={onLogout} className="shrink-0">
        退出登录
      </Button>
    </div>
  )
}

// ─── Order history ────────────────────────────────────────────────────────────

function OrderHistory() {
  if (mockOrders.length === 0) {
    return (
      <section>
        <h2 className="text-xl font-bold text-text-primary mb-4">我的订单</h2>
        <p className="text-text-muted text-center py-12">暂无订单记录</p>
      </section>
    )
  }

  return (
    <section>
      <h2 className="text-xl font-bold text-text-primary mb-4">我的订单</h2>
      <div className="flex flex-col gap-4">
        {mockOrders.map((order) => (
          <div
            key={order.id}
            className="bg-bg-card rounded-xl p-4 border border-border-default"
          >
            {/* Order header */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div>
                <p className="text-xs text-text-muted">订单号：{order.orderNo}</p>
                <p className="text-xs text-text-muted mt-0.5">{order.date}</p>
              </div>
              <StatusBadge status={order.status} />
            </div>

            {/* Items */}
            <div className="flex flex-col gap-1.5 mb-3">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <span className="text-text-primary">
                    {item.productName}
                    <span className="text-text-muted ml-2">({item.specLabel})</span>
                    <span className="text-text-muted ml-1">×{item.quantity}</span>
                  </span>
                  <span className="text-text-secondary ml-4 shrink-0">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="flex justify-end border-t border-border-default pt-3">
              <p className="text-sm text-text-secondary">
                总金额：
                <span className="text-accent-gold font-semibold text-base ml-1">
                  {formatPrice(order.totalPrice)}
                </span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── Dashboard (logged in) ────────────────────────────────────────────────────

function Dashboard() {
  const { user, logout } = useAuth()
  const { showToast } = useToast()

  function handleLogout(): void {
    logout()
    showToast('已退出登录', 'info')
  }

  if (!user) return null

  return (
    <div className="flex flex-col gap-8">
      <UserCard
        username={user.username}
        nickname={user.nickname}
        avatar={user.avatar}
        balance={user.balance}
        onLogout={handleLogout}
      />
      <OrderHistory />
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function UserPage() {
  const { isLoggedIn } = useAuth()

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
