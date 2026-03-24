// Mock 订单数据已弃用，订单数据现在从 Supabase 数据库读取。
// 保留此文件以兼容可能的外部引用。

export const mockOrders: never[] = []

export function getOrderById(): undefined {
  return undefined
}
