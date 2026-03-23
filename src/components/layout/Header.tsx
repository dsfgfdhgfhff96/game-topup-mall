'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'

const NAV_LINKS = [
  { label: '首页', href: '/' },
  { label: '全部商品', href: '/products' },
  { label: '帮助中心', href: '/help' },
] as const

function SearchIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
      />
    </svg>
  )
}

function CartIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.5 7h13M7 13L5.4 5M10 21a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm8 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"
      />
    </svg>
  )
}

interface SearchBoxProps {
  onSearch?: () => void
  className?: string
}

function SearchBox({ onSearch, className = '' }: SearchBoxProps) {
  const [value, setValue] = useState('')
  const router = useRouter()

  const handleSearch = useCallback(() => {
    const trimmed = value.trim()
    if (trimmed) {
      router.push(`/products?q=${encodeURIComponent(trimmed)}`)
      onSearch?.()
    }
  }, [value, router, onSearch])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        handleSearch()
      }
    },
    [handleSearch],
  )

  return (
    <div className={`relative flex items-center ${className}`}>
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="搜索商品..."
        className="
          w-full rounded-lg border border-border-default bg-bg-card
          px-3 py-1.5 pr-8 text-sm text-text-primary placeholder:text-text-muted
          focus:border-accent-purple focus:outline-none focus:ring-1 focus:ring-accent-purple
        "
      />
      <button
        type="button"
        onClick={handleSearch}
        aria-label="搜索"
        className="absolute right-2 text-text-secondary hover:text-accent-purple transition-colors"
      >
        <SearchIcon />
      </button>
    </div>
  )
}

interface NavLinksProps {
  pathname: string
  className?: string
}

function NavLinks({ pathname, className = '' }: NavLinksProps) {
  return (
    <nav className={className} aria-label="主导航">
      {NAV_LINKS.map(({ label, href }) => (
        <Link
          key={href}
          href={href}
          className={`
            text-sm font-medium transition-colors hover:text-accent-purple
            ${pathname === href ? 'text-accent-purple' : 'text-text-secondary'}
          `}
        >
          {label}
        </Link>
      ))}
    </nav>
  )
}

interface CartButtonProps {
  totalItems: number
}

function CartButton({ totalItems }: CartButtonProps) {
  return (
    <Link href="/cart" aria-label={`购物车，共 ${totalItems} 件`} className="relative text-text-secondary hover:text-accent-purple transition-colors">
      <CartIcon />
      {totalItems > 0 && (
        <span className="
          absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center
          rounded-full bg-accent-purple text-[10px] font-bold text-white
        ">
          {totalItems > 99 ? '99+' : totalItems}
        </span>
      )}
    </Link>
  )
}

interface UserAreaProps {
  isLoggedIn: boolean
  nickname?: string
}

function UserArea({ isLoggedIn, nickname }: UserAreaProps) {
  if (isLoggedIn && nickname) {
    return (
      <Link href="/user" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
        <span className="
          flex h-7 w-7 items-center justify-center rounded-full
          bg-gradient-to-br from-accent-purple to-accent-cyan
          text-xs font-bold text-white select-none
        ">
          {nickname[0].toUpperCase()}
        </span>
        <span className="hidden text-sm font-medium text-text-primary md:inline">
          {nickname}
        </span>
      </Link>
    )
  }

  return (
    <Link
      href="/user"
      className="
        rounded-lg border border-accent-purple px-3 py-1 text-sm font-medium
        text-accent-purple transition-colors hover:bg-accent-purple hover:text-white
      "
    >
      登录
    </Link>
  )
}

interface MobileDrawerProps {
  isOpen: boolean
  pathname: string
  onClose: () => void
}

function MobileDrawer({ isOpen, pathname, onClose }: MobileDrawerProps) {
  if (!isOpen) return null

  return (
    <div className="border-t border-border-default bg-bg-primary px-4 pb-4 md:hidden">
      <NavLinks
        pathname={pathname}
        className="flex flex-col gap-3 pt-4"
      />
      <SearchBox className="mt-4" onSearch={onClose} />
    </div>
  )
}

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const { totalItems } = useCart()
  const { isLoggedIn, user } = useAuth()

  const toggleMobile = useCallback(() => {
    setMobileOpen((prev) => !prev)
  }, [])

  const closeMobile = useCallback(() => {
    setMobileOpen(false)
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-bg-primary/90 backdrop-blur-md border-b border-border-default">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-1" aria-label="极速卡 - 首页">
          <span className="text-lg">⚡</span>
          <span className="text-xl font-bold bg-gradient-to-r from-accent-purple to-accent-cyan bg-clip-text text-transparent">
            极速卡
          </span>
        </Link>

        {/* PC nav */}
        <NavLinks
          pathname={pathname}
          className="hidden md:flex items-center gap-6 ml-6"
        />

        {/* Spacer */}
        <div className="flex-1" />

        {/* PC search */}
        <SearchBox className="hidden md:flex w-48 lg:w-64" />

        {/* Cart */}
        <CartButton totalItems={totalItems} />

        {/* User */}
        <UserArea isLoggedIn={isLoggedIn} nickname={user?.nickname} />

        {/* Mobile hamburger */}
        <button
          type="button"
          aria-label={mobileOpen ? '关闭菜单' : '打开菜单'}
          aria-expanded={mobileOpen}
          onClick={toggleMobile}
          className="ml-2 text-text-secondary hover:text-text-primary transition-colors md:hidden"
        >
          <span className="text-2xl leading-none select-none">{mobileOpen ? '✕' : '☰'}</span>
        </button>
      </div>

      {/* Mobile drawer */}
      <MobileDrawer isOpen={mobileOpen} pathname={pathname} onClose={closeMobile} />
    </header>
  )
}
