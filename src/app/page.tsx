import { BannerSlider } from '@/components/home/BannerSlider'
import { CategoryGrid } from '@/components/home/CategoryGrid'
import { FlashSale } from '@/components/home/FlashSale'
import { HotProducts } from '@/components/home/HotProducts'
import { NewArrivals } from '@/components/home/NewArrivals'
import { ReviewSlider } from '@/components/home/ReviewSlider'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <BannerSlider />
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
        <CategoryGrid />
        <FlashSale />
        <HotProducts />
        <NewArrivals />
        <ReviewSlider />
      </div>
    </div>
  )
}
