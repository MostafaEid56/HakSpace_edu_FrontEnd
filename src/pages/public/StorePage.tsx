import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Store, ShoppingBag } from 'lucide-react'
import { apiClient } from '../../api/client'
import Navbar from '../../components/Navbar'

interface Category {
  id: number
  name: string
}

interface Product {
  id: number
  name: string
  description: string
  price: number
  stockQuantity: number
  imageUrl: string
  category?: Category
}

export default function StorePage() {
  const { t } = useTranslation()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [prodRes, catRes] = await Promise.all([
        apiClient.get<Product[]>('/api/store/products'),
        apiClient.get<Category[]>('/api/store/categories')
      ])
      setProducts(prodRes.data)
      setCategories(catRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = selectedCategory === 'ALL'
    ? products
    : products.filter(p => p.category?.id.toString() === selectedCategory)

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col font-sans">
      <Navbar />

      <main className="flex-grow pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 flex items-center justify-center gap-3">
              <Store className="text-brand-500" size={40} />
              {t('store.title', 'HakSpace Store')}
            </h1>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              {t('store.subtitle', 'Get the best accessories and tools for your learning journey.')}
            </p>
          </div>

          {/* Categories Filter */}
          {categories.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mb-12">
              <button
                onClick={() => setSelectedCategory('ALL')}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                  selectedCategory === 'ALL' 
                    ? 'bg-brand-600 text-white' 
                    : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                {t('store.all_categories', 'All Categories')}
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id.toString())}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                    selectedCategory === cat.id.toString()
                      ? 'bg-brand-600 text-white'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-zinc-900/50 rounded-3xl border border-zinc-800">
              <ShoppingBag className="mx-auto h-12 w-12 text-zinc-600 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">{t('store.no_products', 'No products found')}</h3>
              <p className="text-zinc-500">{t('store.no_products_desc', 'Check back later for new items.')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <Link
                  key={product.id}
                  to={`/store/${product.id}`}
                  className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden hover:border-brand-500/50 hover:shadow-2xl hover:shadow-brand-500/10 transition-all duration-300 group flex flex-col"
                >
                  <div className="aspect-square relative bg-zinc-800 overflow-hidden">
                    {product.imageUrl ? (
                      <img 
                        src={product.imageUrl} 
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-700">
                        <ShoppingBag size={48} />
                      </div>
                    )}
                    {product.stockQuantity === 0 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[2px]">
                        <span className="px-4 py-2 bg-red-600 text-white font-black text-sm uppercase tracking-wider rounded-xl rotate-[-12deg] shadow-2xl">
                          {t('store.out_of_stock', 'Out of Stock')}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-5 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <h3 className="text-lg font-bold text-white leading-tight group-hover:text-brand-400 transition-colors">
                        {product.name}
                      </h3>
                      <span className="text-brand-400 font-black whitespace-nowrap">
                        {product.price} EGP
                      </span>
                    </div>
                    
                    {product.category && (
                      <span className="inline-block px-2 py-1 bg-zinc-800 text-zinc-400 text-[10px] uppercase tracking-wider font-bold rounded-lg mb-3 w-fit">
                        {product.category.name}
                      </span>
                    )}

                    <div className="mt-auto pt-4 flex items-center justify-between border-t border-zinc-800/50">
                      <span className={`text-xs font-bold ${product.stockQuantity > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {product.stockQuantity > 0 
                          ? `${t('store.available', 'Available')}: ${product.stockQuantity}` 
                          : t('store.out_of_stock', 'Out of Stock')}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
