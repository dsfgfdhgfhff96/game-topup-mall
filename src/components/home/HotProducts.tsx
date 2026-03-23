import { getFeaturedProducts } from '@/data/products'
import { ProductCard } from '@/components/products/ProductCard'

export function HotProducts() {
  const hotProducts = getFeaturedProducts(12)

  return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-text-primary">
          <span>🔥</span> 热门商品
        </h2>
        <div className="flex-1 h-px bg-gradient-to-r from-accent-pink/50 to-transparent" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {hotProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}
