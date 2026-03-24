'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { User } from '@/types'
import type { Session, AuthError } from '@supabase/supabase-js'

interface AuthContextValue {
  user: User | null
  isLoggedIn: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<{ error?: string }>
  logout: () => Promise<void>
  register: (email: string, password: string, nickname?: string) => Promise<{ error?: string }>
  updateVerification: (realName: string, idCard: string) => Promise<{ error?: string }>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function buildUser(session: Session): User {
  const meta = session.user.user_metadata ?? {}
  const email = session.user.email ?? ''
  const nickname = meta.nickname || email.split('@')[0]
  return {
    id: session.user.id,
    email,
    nickname,
    avatar_url: nickname[0]?.toUpperCase() ?? '?',
    is_verified: meta.is_verified === true,
    real_name: meta.real_name,
    id_card_last4: meta.id_card_last4,
    verified_at: meta.verified_at,
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session ? buildUser(session) : null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session ? buildUser(session) : null)
      },
    )

    return () => subscription.unsubscribe()
  }, [])

  const login = useCallback(async (email: string, password: string): Promise<{ error?: string }> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: mapAuthError(error) }
    return {}
  }, [])

  const register = useCallback(async (email: string, password: string, nickname?: string): Promise<{ error?: string }> => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nickname: nickname || email.split('@')[0],
          is_verified: false,
        },
      },
    })
    if (error) return { error: mapAuthError(error) }
    return {}
  }, [])

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
  }, [])

  const updateVerification = useCallback(async (realName: string, idCard: string): Promise<{ error?: string }> => {
    const maskedName = realName[0] + '*'.repeat(realName.length - 1)
    const last4 = idCard.slice(-4)

    const { error } = await supabase.auth.updateUser({
      data: {
        real_name: maskedName,
        id_card_last4: last4,
        is_verified: true,
        verified_at: new Date().toISOString(),
      },
    })

    if (error) return { error: '认证失败，请稍后重试' }

    setUser((prev) =>
      prev
        ? {
            ...prev,
            is_verified: true,
            real_name: maskedName,
            id_card_last4: last4,
            verified_at: new Date().toISOString(),
          }
        : null,
    )

    return {}
  }, [])

  const value: AuthContextValue = {
    user,
    isLoggedIn: user !== null,
    loading,
    login,
    logout,
    register,
    updateVerification,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}

function mapAuthError(error: AuthError): string {
  const msg = error.message.toLowerCase()
  if (msg.includes('invalid login credentials')) return '邮箱或密码错误'
  if (msg.includes('user already registered')) return '该邮箱已被注册'
  if (msg.includes('invalid email')) return '邮箱格式不正确'
  if (msg.includes('password')) return '密码长度至少6位'
  return '操作失败，请稍后重试'
}
