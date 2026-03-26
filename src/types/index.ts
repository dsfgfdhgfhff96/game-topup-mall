export interface ProductSpec {
  id: string
  label: string        // e.g. '6元宝'
  price: number        // 实际价格
  originalPrice: number // 原价
}

export interface Product {
  id: string
  gameId: string
  gameName: string
  name: string
  description: string
  image: string
  specs: ProductSpec[]
  defaultPrice: number
  originalPrice: number
  sales: number        // 1000-50000
  rating: number       // 4.5-5.0
  reviewCount: number
  stock: string        // '充足' or specific number
  tags: string[]       // '热门'/'限时'/'新品'
  category: string
}

export interface Category {
  id: string
  name: string
  icon: string         // emoji
  color: string        // gradient color
  description: string
}

export interface Review {
  id: string
  productId: string
  userName: string
  avatar: string       // first letter or emoji
  rating: number
  content: string
  date: string
}

export interface Banner {
  id: string
  title: string
  subtitle: string
  buttonText: string
  buttonLink: string
  gradient: string     // CSS gradient
}

export interface CartItem {
  productId: string
  specId: string
  quantity: number
  productName: string
  gameName: string
  specLabel: string
  price: number
  gameId: string
}

// ===== 订单相关类型 =====

export type OrderStatus = 'pending_payment' | 'paid' | 'completed' | 'refund_requested' | 'refunded' | 'cancelled' | 'blocked'

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product_name: string
  game_name: string
  spec_id: string
  spec_label: string
  price: number
  quantity: number
  card_code?: string
}

export interface Order {
  id: string
  order_no: string
  user_id: string
  status: OrderStatus
  total_price: number
  pay_method: string
  game_account: string
  alipay_trade_no?: string
  alipay_buyer_id?: string
  alipay_buyer_logon_id?: string
  client_ip?: string
  refund_reason?: string
  paid_at?: string
  created_at: string
  updated_at: string
  items?: OrderItem[]
}

// ===== 用户类型 =====

export interface User {
  id: string
  email: string
  nickname: string
  avatar_url: string
  is_verified: boolean
  real_name?: string       // 脱敏后，如 "张**"
  id_card_last4?: string
  verified_at?: string
}
