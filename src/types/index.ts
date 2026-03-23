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

export interface Order {
  id: string
  orderNo: string
  date: string
  items: { productName: string; specLabel: string; quantity: number; price: number }[]
  totalPrice: number
  status: string       // '已完成'/'待发货'/'处理中'
  payMethod: string
}

export interface User {
  username: string
  nickname: string
  avatar: string
  balance: number
}
