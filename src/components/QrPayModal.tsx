'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { QRCodeSVG } from 'qrcode.react'
import { Modal } from '@/components/ui/Modal'
import { useCart } from '@/contexts/CartContext'
import { useOrderPolling } from '@/hooks/useOrderPolling'
import { formatPrice } from '@/lib/utils'

interface QrPayModalProps {
  isOpen: boolean
  onClose: () => void
  payUrl: string
  orderId: string
  orderNo: string
  totalPrice: number
}

export function QrPayModal({ isOpen, onClose, payUrl, orderId, orderNo, totalPrice }: QrPayModalProps) {
  const router = useRouter()
  const { clearCart } = useCart()
  const { isPaid, isExpired } = useOrderPolling(orderId, isOpen)

  useEffect(() => {
    if (isPaid) {
      clearCart()
      const timer = setTimeout(() => {
        onClose()
        router.push(`/pay/success?orderId=${orderId}`)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [isPaid, orderId, onClose, router, clearCart])

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="扫码支付">
      <div className="flex flex-col items-center gap-4">
        {/* 订单信息 */}
        <div className="text-center space-y-1">
          <p className="text-accent-gold text-3xl font-bold">{formatPrice(totalPrice)}</p>
          <p className="text-text-muted text-xs">订单号: {orderNo}</p>
        </div>

        {/* 二维码区域 */}
        {isPaid ? (
          <div className="w-64 h-64 flex flex-col items-center justify-center gap-3">
            <div className="w-16 h-16 rounded-full bg-accent-green/20 flex items-center justify-center">
              <span className="text-accent-green text-3xl">&#10003;</span>
            </div>
            <p className="text-accent-green font-semibold">支付成功</p>
            <p className="text-text-muted text-xs">正在跳转...</p>
          </div>
        ) : isExpired ? (
          <div className="w-64 h-64 flex flex-col items-center justify-center gap-3">
            <p className="text-text-muted text-lg">二维码已过期</p>
            <p className="text-text-muted text-xs">请关闭弹窗重新下单</p>
          </div>
        ) : (
          <div className="bg-white p-4 rounded-xl">
            <QRCodeSVG value={payUrl} size={224} level="M" />
          </div>
        )}

        {/* 提示 */}
        {!isPaid && !isExpired && (
          <div className="text-center space-y-2">
            <p className="text-text-primary text-sm font-medium">
              请使用支付宝扫描二维码完成付款
            </p>
            <p className="text-text-muted text-xs">
              支付完成后此页面会自动跳转
            </p>
          </div>
        )}

        {/* 备用链接 */}
        {!isPaid && !isExpired && (
          <button
            onClick={() => window.open(payUrl, '_blank')}
            className="text-accent-purple text-xs hover:underline"
          >
            无法扫码？点击此处打开支付宝
          </button>
        )}
      </div>
    </Modal>
  )
}
