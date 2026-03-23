import { Order } from '@/types'

export const mockOrders: Order[] = [
  {
    id: 'order-001',
    orderNo: 'SPD17380032001482',
    date: '2026-03-15 14:32:08',
    items: [
      {
        productName: '原神创世结晶充值',
        specLabel: '980创世结晶',
        quantity: 1,
        price: 95.8,
      },
    ],
    totalPrice: 95.8,
    status: '已完成',
    payMethod: '支付宝',
  },
  {
    id: 'order-002',
    orderNo: 'SPD17379018573294',
    date: '2026-03-12 09:18:44',
    items: [
      {
        productName: '王者荣耀点券充值',
        specLabel: '880点券',
        quantity: 1,
        price: 83.8,
      },
      {
        productName: '王者荣耀战令通行证',
        specLabel: '豪华战令',
        quantity: 1,
        price: 56.8,
      },
    ],
    totalPrice: 140.6,
    status: '已完成',
    payMethod: '微信支付',
  },
  {
    id: 'order-003',
    orderNo: 'SPD17378004921836',
    date: '2026-03-20 16:05:22',
    items: [
      {
        productName: 'Steam 钱包充值码',
        specLabel: '200元钱包',
        quantity: 1,
        price: 188,
      },
    ],
    totalPrice: 188,
    status: '待发货',
    payMethod: '支付宝',
  },
  {
    id: 'order-004',
    orderNo: 'SPD17376512874061',
    date: '2026-03-21 20:47:33',
    items: [
      {
        productName: '和平精英 UC 充值',
        specLabel: '600 UC',
        quantity: 2,
        price: 57.8,
      },
    ],
    totalPrice: 115.6,
    status: '处理中',
    payMethod: '微信支付',
  },
  {
    id: 'order-005',
    orderNo: 'SPD17375398412750',
    date: '2026-03-05 11:29:56',
    items: [
      {
        productName: '英雄联盟 RP 充值',
        specLabel: '1580 RP',
        quantity: 1,
        price: 99.5,
      },
      {
        productName: '英雄联盟传说宝箱',
        specLabel: '宝箱 × 5',
        quantity: 1,
        price: 40,
      },
    ],
    totalPrice: 139.5,
    status: '已完成',
    payMethod: '支付宝',
  },
]

export function getOrderById(id: string): Order | undefined {
  return mockOrders.find((o) => o.id === id)
}
