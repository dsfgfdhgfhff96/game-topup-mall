/**
 * 格式化价格，输出如 ¥68.00
 */
export function formatPrice(price: number): string {
  return `¥${price.toFixed(2)}`
}

/**
 * 合并 CSS 类名，过滤掉 falsy 值
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

/**
 * 生成订单号：SPD + 时间戳 + 随机4位数
 */
export function generateOrderNo(): string {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 9000) + 1000
  return `SPD${timestamp}${random}`
}
