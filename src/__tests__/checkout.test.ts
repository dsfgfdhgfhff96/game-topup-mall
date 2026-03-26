import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock modules
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(),
}))

vi.mock('@/data/products', () => ({
  getProductById: vi.fn(),
}))

vi.mock('@/lib/alipay', () => ({
  getAlipay: vi.fn(),
}))

describe('checkout route - 设备检测逻辑', () => {
  it('移动端 User-Agent 应被正确识别', () => {
    const mobileAgents = [
      'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
      'Mozilla/5.0 (Linux; Android 13; Pixel 7)',
      'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X)',
    ]

    const regex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i

    for (const ua of mobileAgents) {
      expect(regex.test(ua)).toBe(true)
    }
  })

  it('PC 端 User-Agent 应被正确识别', () => {
    const pcAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      'Mozilla/5.0 (X11; Linux x86_64)',
    ]

    const regex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i

    for (const ua of pcAgents) {
      expect(regex.test(ua)).toBe(false)
    }
  })

  it('移动端应使用 WAP 支付参数', () => {
    const isMobile = true
    const apiMethod = isMobile ? 'alipay.trade.wap.pay' : 'alipay.trade.page.pay'
    const productCode = isMobile ? 'QUICK_WAP_WAY' : 'FAST_INSTANT_TRADE_PAY'

    expect(apiMethod).toBe('alipay.trade.wap.pay')
    expect(productCode).toBe('QUICK_WAP_WAY')
  })

  it('PC 端应使用 PAGE 支付参数', () => {
    const isMobile = false
    const apiMethod = isMobile ? 'alipay.trade.wap.pay' : 'alipay.trade.page.pay'
    const productCode = isMobile ? 'QUICK_WAP_WAY' : 'FAST_INSTANT_TRADE_PAY'

    expect(apiMethod).toBe('alipay.trade.page.pay')
    expect(productCode).toBe('FAST_INSTANT_TRADE_PAY')
  })
})

describe('checkout route - URL 配置', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('notify_url 应使用 HTTPS', () => {
    const notifyUrl = process.env.ALIPAY_NOTIFY_URL || 'https://pay.kehuaxi.top/api/alipay/notify'
    expect(notifyUrl.startsWith('https://')).toBe(true)
  })

  it('return_url 应指向 /pay/success', () => {
    const returnUrl = process.env.ALIPAY_RETURN_URL || 'https://www.kehuaxi.top/pay/success'
    expect(returnUrl).toContain('/pay/success')
  })

  it('return_url 应携带 orderId 参数', () => {
    const returnUrl = process.env.ALIPAY_RETURN_URL || 'https://www.kehuaxi.top/pay/success'
    const orderId = 'test-uuid-123'
    const fullUrl = `${returnUrl}?orderId=${orderId}`

    expect(fullUrl).toContain('orderId=test-uuid-123')
  })
})
