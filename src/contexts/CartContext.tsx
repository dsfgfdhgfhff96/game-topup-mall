'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { CartItem } from '@/types'

const STORAGE_KEY = 'speedcard_cart'

interface CartContextValue {
  items: CartItem[]
  totalItems: number
  totalPrice: number
  addItem: (item: CartItem) => void
  removeItem: (productId: string, specId: string) => void
  updateQuantity: (productId: string, specId: string, quantity: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

function isSameEntry(a: CartItem, productId: string, specId: string): boolean {
  return a.productId === productId && a.specId === specId
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setItems(JSON.parse(stored) as CartItem[])
      }
    } catch {
      // ignore malformed storage
    }
  }, [])

  function persist(newItems: CartItem[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems))
    setItems(newItems)
  }

  function addItem(item: CartItem): void {
    setItems((prev) => {
      const existing = prev.find((i) => isSameEntry(i, item.productId, item.specId))
      const next = existing
        ? prev.map((i) =>
            isSameEntry(i, item.productId, item.specId)
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          )
        : [...prev, { ...item }]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  function removeItem(productId: string, specId: string): void {
    const next = items.filter((i) => !isSameEntry(i, productId, specId))
    persist(next)
  }

  function updateQuantity(productId: string, specId: string, quantity: number): void {
    if (quantity <= 0) {
      removeItem(productId, specId)
      return
    }
    const next = items.map((i) =>
      isSameEntry(i, productId, specId) ? { ...i, quantity } : i
    )
    persist(next)
  }

  function clearCart(): void {
    persist([])
  }

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  const value: CartContextValue = {
    items,
    totalItems,
    totalPrice,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return ctx
}
