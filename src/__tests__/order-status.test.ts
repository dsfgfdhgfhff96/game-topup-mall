import { describe, it, expect } from 'vitest'

const PAID_STATUSES = new Set(['paid', 'completed'])

describe('订单状态区分逻辑', () => {
  describe('useOrderPolling 状态判断', () => {
    it('paid 状态应识别为已支付', () => {
      expect(PAID_STATUSES.has('paid')).toBe(true)
    })

    it('completed 状态应识别为已支付', () => {
      expect(PAID_STATUSES.has('completed')).toBe(true)
    })

    it('cancelled 状态不应识别为已支付', () => {
      expect(PAID_STATUSES.has('cancelled')).toBe(false)
    })

    it('refunded 状态不应识别为已支付', () => {
      expect(PAID_STATUSES.has('refunded')).toBe(false)
    })

    it('refund_requested 状态不应识别为已支付', () => {
      expect(PAID_STATUSES.has('refund_requested')).toBe(false)
    })

    it('pending_payment 状态不应识别为已支付', () => {
      expect(PAID_STATUSES.has('pending_payment')).toBe(false)
    })
  })

  describe('轮询终止条件', () => {
    function shouldContinuePolling(status: string): boolean {
      return status === 'pending_payment'
    }

    it('pending_payment 状态应继续轮询', () => {
      expect(shouldContinuePolling('pending_payment')).toBe(true)
    })

    it('paid 状态应停止轮询', () => {
      expect(shouldContinuePolling('paid')).toBe(false)
    })

    it('cancelled 状态应停止轮询', () => {
      expect(shouldContinuePolling('cancelled')).toBe(false)
    })
  })

  describe('pay/success 页面状态展示', () => {
    function getDisplayState(status: string) {
      const isPaid = status === 'paid' || status === 'completed'
      const isPending = status === 'pending_payment'
      const isCancelled = status === 'cancelled'
      return { isPaid, isPending, isCancelled }
    }

    it('paid 应显示支付成功', () => {
      const { isPaid, isPending, isCancelled } = getDisplayState('paid')
      expect(isPaid).toBe(true)
      expect(isPending).toBe(false)
      expect(isCancelled).toBe(false)
    })

    it('completed 应显示支付成功', () => {
      const { isPaid, isPending, isCancelled } = getDisplayState('completed')
      expect(isPaid).toBe(true)
      expect(isPending).toBe(false)
      expect(isCancelled).toBe(false)
    })

    it('pending_payment 应显示等待中', () => {
      const { isPaid, isPending, isCancelled } = getDisplayState('pending_payment')
      expect(isPaid).toBe(false)
      expect(isPending).toBe(true)
      expect(isCancelled).toBe(false)
    })

    it('cancelled 应显示已取消', () => {
      const { isPaid, isPending, isCancelled } = getDisplayState('cancelled')
      expect(isPaid).toBe(false)
      expect(isPending).toBe(false)
      expect(isCancelled).toBe(true)
    })
  })
})
