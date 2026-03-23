'use client'

import { useState } from 'react'

const FAQ_ITEMS = [
  {
    id: 1,
    question: '充值多久到账？',
    answer:
      '正常情况下，充值会在5-30分钟内到账。高峰期或系统维护期间可能会有延迟，最长不超过24小时。如超时未到账，请联系客服处理。',
  },
  {
    id: 2,
    question: '支持哪些支付方式？',
    answer:
      '目前支持支付宝、微信支付和银行卡三种支付方式。所有支付渠道均经过安全加密处理，请放心使用。',
  },
  {
    id: 3,
    question: '充值失败怎么办？',
    answer:
      '如果充值失败，款项会在1-3个工作日内原路退回。如长时间未退回，请联系客服并提供订单号，我们会尽快为您处理。',
  },
  {
    id: 4,
    question: '可以退款吗？',
    answer:
      '虚拟商品一经充值成功，原则上不支持退款。如因系统原因导致充值异常，请联系客服，我们会核实后为您处理。',
  },
  {
    id: 5,
    question: '如何联系客服？',
    answer:
      '您可以通过以下方式联系我们：QQ客服（2847563901）、微信客服（speedcard_cs）、邮箱（support@speedcard.cn）。客服工作时间：周一至周日 9:00-22:00。',
  },
  {
    id: 6,
    question: '充值需要提供什么信息？',
    answer:
      '充值时只需提供您的游戏账号（如游戏ID、角色名等），无需提供密码。请务必确认账号信息准确，避免充值到错误账号。',
  },
  {
    id: 7,
    question: '账号信息安全吗？',
    answer:
      '我们严格保护用户隐私，所有数据均经过SSL加密传输。我们绝不会向第三方泄露您的个人信息和账号信息。',
  },
  {
    id: 8,
    question: '可以开发票吗？',
    answer:
      '支持开具电子发票。单笔订单满100元即可申请，请在订单完成后联系客服提供开票信息。',
  },
  {
    id: 9,
    question: '批量充值有优惠吗？',
    answer:
      '批量充值可享受额外折扣。单次购买满500元享95折，满1000元享9折。详情请联系客服咨询。',
  },
  {
    id: 10,
    question: '如何成为VIP会员？',
    answer:
      '累计消费满2000元自动升级为VIP会员，享受专属折扣和优先客服服务。VIP会员还可参与不定期的专属活动和抽奖。',
  },
]

const CONTACT_CARDS = [
  {
    id: 'qq',
    icon: '💬',
    label: 'QQ客服',
    value: '2847563901',
  },
  {
    id: 'wechat',
    icon: '📱',
    label: '微信客服',
    value: 'speedcard_cs',
  },
  {
    id: 'email',
    icon: '📧',
    label: '客服邮箱',
    value: 'support@speedcard.cn',
  },
]

function FaqItem({
  item,
  isOpen,
  onToggle,
}: {
  item: (typeof FAQ_ITEMS)[number]
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <div className="bg-bg-card rounded-lg border border-border-default mb-3 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-purple"
        aria-expanded={isOpen}
      >
        <span className="text-text-primary font-medium pr-4">{item.question}</span>
        <span
          className={`flex-shrink-0 text-text-secondary transition-transform duration-200 ${
            isOpen ? 'rotate-90' : ''
          }`}
          aria-hidden="true"
        >
          ▶
        </span>
      </button>

      {isOpen && (
        <div className="px-5 pb-4 animate-fade-in">
          <p className="text-text-secondary leading-relaxed">{item.answer}</p>
        </div>
      )}
    </div>
  )
}

export default function HelpPage() {
  const [openId, setOpenId] = useState<number | null>(null)

  function handleToggle(id: number) {
    setOpenId((prev) => (prev === id ? null : id))
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-10">
        {/* Page title */}
        <h1 className="text-3xl font-bold text-text-primary">帮助中心</h1>

        {/* FAQ section */}
        <section>
          <h2 className="text-xl font-semibold text-text-primary mb-5">常见问题</h2>
          <div>
            {FAQ_ITEMS.map((item) => (
              <FaqItem
                key={item.id}
                item={item}
                isOpen={openId === item.id}
                onToggle={() => handleToggle(item.id)}
              />
            ))}
          </div>
        </section>

        {/* Contact section */}
        <section>
          <h2 className="text-xl font-semibold text-text-primary mb-5">联系我们</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
            {CONTACT_CARDS.map((card) => (
              <div
                key={card.id}
                className="bg-bg-card rounded-xl p-6 border border-border-default text-center"
              >
                <div className="text-4xl mb-3">{card.icon}</div>
                <div className="text-text-primary font-medium mb-1">{card.label}</div>
                <div className="text-text-secondary text-sm break-all">{card.value}</div>
              </div>
            ))}
          </div>

          <p className="text-center text-text-secondary text-sm">
            客服时间：周一至周日 9:00-22:00
          </p>
        </section>
      </div>
    </div>
  )
}
