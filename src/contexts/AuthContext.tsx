'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { User } from '@/types'

const STORAGE_KEY = 'speedcard_user'

interface AuthContextValue {
  user: User | null
  isLoggedIn: boolean
  login: (username: string, password: string) => void
  logout: () => void
  register: (username: string, password: string) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function buildUser(username: string): User {
  return {
    username,
    nickname: username,
    avatar: username[0].toUpperCase(),
    balance: 0,
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setUser(JSON.parse(stored) as User)
      }
    } catch {
      // ignore malformed storage
    }
  }, [])

  function persistUser(newUser: User): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser))
    setUser(newUser)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function login(username: string, _password: string): void {
    persistUser(buildUser(username))
  }

  function logout(): void {
    localStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function register(username: string, _password: string): void {
    persistUser(buildUser(username))
  }

  const value: AuthContextValue = {
    user,
    isLoggedIn: user !== null,
    login,
    logout,
    register,
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
