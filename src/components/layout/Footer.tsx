import Link from 'next/link'

const QUICK_LINKS = [
  { label: '首页', href: '/' },
  { label: '全部商品', href: '/products' },
  { label: '帮助中心', href: '/help' },
  { label: '用户中心', href: '/user' },
] as const

const PAYMENT_METHODS = ['支付宝', '微信支付', '银行卡', '花呗'] as const

const CONTACT_ITEMS = [
  { label: '客服邮箱', value: 'support@speedcard.cn' },
  { label: '客服时间', value: '周一至周日 9:00-22:00' },
  { label: '地址', value: '广东省深圳市南山区科技园' },
] as const

interface FooterColumnProps {
  title: string
  children: React.ReactNode
}

function FooterColumn({ title, children }: FooterColumnProps) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
      {children}
    </div>
  )
}

function AboutColumn() {
  return (
    <FooterColumn title="关于我们">
      <div className="flex items-center gap-1">
        <span className="text-base">⚡</span>
        <span className="font-bold bg-gradient-to-r from-accent-purple to-accent-cyan bg-clip-text text-transparent">
          极速卡
        </span>
      </div>
      <p className="text-sm text-text-secondary leading-relaxed">
        专业的游戏充值平台，安全快速，价格优惠
      </p>
    </FooterColumn>
  )
}

function QuickLinksColumn() {
  return (
    <FooterColumn title="快速链接">
      <ul className="flex flex-col gap-2">
        {QUICK_LINKS.map(({ label, href }) => (
          <li key={href}>
            <Link
              href={href}
              className="text-sm text-text-secondary transition-colors hover:text-text-primary"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </FooterColumn>
  )
}

function PaymentColumn() {
  return (
    <FooterColumn title="支付方式">
      <ul className="flex flex-col gap-2">
        {PAYMENT_METHODS.map((method) => (
          <li key={method} className="text-sm text-text-secondary">
            {method}
          </li>
        ))}
      </ul>
    </FooterColumn>
  )
}

function ContactColumn() {
  return (
    <FooterColumn title="联系我们">
      <ul className="flex flex-col gap-2">
        {CONTACT_ITEMS.map(({ label, value }) => (
          <li key={label} className="text-sm text-text-secondary">
            <span className="text-text-muted">{label}：</span>
            {value}
          </li>
        ))}
      </ul>
    </FooterColumn>
  )
}

export default function Footer() {
  return (
    <footer className="bg-bg-card border-t border-border-default">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* 4-column grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <AboutColumn />
          <QuickLinksColumn />
          <PaymentColumn />
          <ContactColumn />
        </div>

        {/* Bottom bar */}
        <div className="mt-10 border-t border-border-default pt-6 flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
          <p className="text-xs text-text-secondary">
            © 2026 极速卡 版权所有
          </p>
          <p className="text-xs text-text-secondary">
            粤ICP备2024183726号
          </p>
        </div>
      </div>
    </footer>
  )
}
