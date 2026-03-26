import { describe, it, expect } from 'vitest'
import { z } from 'zod'

// 与 checkout/route.ts 中保持一致的 schema 定义
const checkoutItemSchema = z.object({
  productId: z.string().min(1),
  specId: z.string().min(1),
  quantity: z.number().int().min(1).max(99),
  productName: z.string(),
  gameName: z.string(),
  specLabel: z.string(),
  price: z.number().min(0),
})

const checkoutBodySchema = z.object({
  items: z.array(checkoutItemSchema).min(1, '购物车为空'),
  gameAccount: z.string().min(1, '请填写游戏账号').max(100),
})

describe('checkout - zod 请求体校验', () => {
  const validItem = {
    productId: 'prod-1',
    specId: 'spec-1',
    quantity: 2,
    productName: '月卡',
    gameName: '原神',
    specLabel: '60元',
    price: 60,
  }

  it('合法请求体应通过校验', () => {
    const body = { items: [validItem], gameAccount: 'player123' }
    const result = checkoutBodySchema.safeParse(body)
    expect(result.success).toBe(true)
  })

  it('空 items 数组应拒绝', () => {
    const body = { items: [], gameAccount: 'player123' }
    const result = checkoutBodySchema.safeParse(body)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('购物车为空')
    }
  })

  it('缺少 gameAccount 应拒绝', () => {
    const body = { items: [validItem] }
    const result = checkoutBodySchema.safeParse(body)
    expect(result.success).toBe(false)
  })

  it('空 gameAccount 应拒绝', () => {
    const body = { items: [validItem], gameAccount: '' }
    const result = checkoutBodySchema.safeParse(body)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('请填写游戏账号')
    }
  })

  it('gameAccount 超过 100 字符应拒绝', () => {
    const body = { items: [validItem], gameAccount: 'x'.repeat(101) }
    const result = checkoutBodySchema.safeParse(body)
    expect(result.success).toBe(false)
  })

  it('quantity 为 0 应拒绝', () => {
    const body = {
      items: [{ ...validItem, quantity: 0 }],
      gameAccount: 'player123',
    }
    const result = checkoutBodySchema.safeParse(body)
    expect(result.success).toBe(false)
  })

  it('quantity 为负数应拒绝', () => {
    const body = {
      items: [{ ...validItem, quantity: -1 }],
      gameAccount: 'player123',
    }
    const result = checkoutBodySchema.safeParse(body)
    expect(result.success).toBe(false)
  })

  it('quantity 超过 99 应拒绝', () => {
    const body = {
      items: [{ ...validItem, quantity: 100 }],
      gameAccount: 'player123',
    }
    const result = checkoutBodySchema.safeParse(body)
    expect(result.success).toBe(false)
  })

  it('quantity 为小数应拒绝', () => {
    const body = {
      items: [{ ...validItem, quantity: 1.5 }],
      gameAccount: 'player123',
    }
    const result = checkoutBodySchema.safeParse(body)
    expect(result.success).toBe(false)
  })

  it('price 为负数应拒绝', () => {
    const body = {
      items: [{ ...validItem, price: -10 }],
      gameAccount: 'player123',
    }
    const result = checkoutBodySchema.safeParse(body)
    expect(result.success).toBe(false)
  })

  it('空 productId 应拒绝', () => {
    const body = {
      items: [{ ...validItem, productId: '' }],
      gameAccount: 'player123',
    }
    const result = checkoutBodySchema.safeParse(body)
    expect(result.success).toBe(false)
  })

  it('多余字段应被安全忽略（不报错）', () => {
    const body = {
      items: [{ ...validItem, extraField: 'hacker' }],
      gameAccount: 'player123',
      malicious: true,
    }
    const result = checkoutBodySchema.safeParse(body)
    expect(result.success).toBe(true)
  })

  it('非对象输入应拒绝', () => {
    expect(checkoutBodySchema.safeParse(null).success).toBe(false)
    expect(checkoutBodySchema.safeParse('string').success).toBe(false)
    expect(checkoutBodySchema.safeParse(123).success).toBe(false)
  })
})
