import Link from 'next/link'
import { categories } from '@/data/categories'

export function CategoryGrid() {
  const displayCategories = categories.slice(0, 8)

  return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-text-primary">游戏分类</h2>
        <div className="flex-1 h-px bg-gradient-to-r from-accent-purple/50 to-transparent" />
      </div>

      <div className="grid grid-cols-4 gap-3 md:gap-4">
        {displayCategories.map((category) => (
          <Link
            key={category.id}
            href={`/products?game=${category.id}`}
            className="group"
          >
            <div className="flex flex-col items-center gap-2 p-3 md:p-4 rounded-xl border border-border-default bg-bg-card hover:border-accent-purple hover:brightness-110 transition-all duration-200 hover:scale-105">
              <div
                className={`w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center`}
              >
                <span className="text-2xl md:text-3xl">{category.icon}</span>
              </div>
              <span className="text-xs md:text-sm text-text-primary font-medium text-center leading-tight">
                {category.name}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
