import { Banner } from '@/types'

export const banners: Banner[] = [
  {
    id: 'banner-001',
    title: '王者荣耀 赛季充值狂欢',
    subtitle: '本赛季专属折扣，点券最低9折，限时活动即将结束',
    buttonText: '立即充值',
    buttonLink: '/products?game=wangzhe',
    gradient: 'from-orange-500 via-red-500 to-purple-600',
  },
  {
    id: 'banner-002',
    title: 'Steam 春季特卖 全场低至7折',
    subtitle: '热门游戏全线打折，钱包充值享额外优惠，囤码正当时',
    buttonText: '去抢购',
    buttonLink: '/products?game=steam',
    gradient: 'from-blue-900 via-blue-700 to-slate-800',
  },
  {
    id: 'banner-003',
    title: '原神 新版本限定礼包',
    subtitle: '新版本上线，创世结晶限时特惠，限定联动皮肤同步开售',
    buttonText: '查看详情',
    buttonLink: '/products?game=yuanshen',
    gradient: 'from-blue-600 via-indigo-500 to-purple-600',
  },
]
