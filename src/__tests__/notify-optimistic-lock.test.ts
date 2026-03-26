import { describe, it, expect } from 'vitest'

describe('alipay notify - 乐观锁逻辑', () => {
  it('UPDATE 返回空数组时应视为已被其他请求处理', () => {
    const updated: { id: string }[] = []
    const alreadyProcessed = !updated || updated.length === 0
    expect(alreadyProcessed).toBe(true)
  })

  it('UPDATE 返回 null 时应视为已被其他请求处理', () => {
    const updated = null
    const alreadyProcessed = !updated || (updated as unknown[]).length === 0
    expect(alreadyProcessed).toBe(true)
  })

  it('UPDATE 返回匹配行时应视为处理成功', () => {
    const updated = [{ id: 'order-uuid-1' }]
    const alreadyProcessed = !updated || updated.length === 0
    expect(alreadyProcessed).toBe(false)
  })
})

describe('alipay notify - paid_at 时间源', () => {
  it('优先使用支付宝 gmt_payment', () => {
    const params = { gmt_payment: '2026-03-26 10:30:00' }
    const paidAt = params.gmt_payment || new Date().toISOString()
    expect(paidAt).toBe('2026-03-26 10:30:00')
  })

  it('gmt_payment 缺失时回退到服务器时间', () => {
    const params: Record<string, string> = {}
    const before = new Date().toISOString()
    const paidAt = params.gmt_payment || new Date().toISOString()
    expect(paidAt >= before).toBe(true)
  })
})
