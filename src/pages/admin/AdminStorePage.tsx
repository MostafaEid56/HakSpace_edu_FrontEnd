import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { Store, Plus, Edit2, Trash2, X, Tag, Package, Upload, Loader2 } from 'lucide-react'
import { apiClient } from '../../api/client'

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

export default function AdminStorePage() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<'PRODUCTS' | 'CATEGORIES'>('PRODUCTS')
  
  // Data
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  // Modals
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  
  // Edit State
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  // Form State
  const [catName, setCatName] = useState('')
  const [prodName, setProdName] = useState('')
  const [prodDesc, setProdDesc] = useState('')
  const [prodPrice, setProdPrice] = useState(0)
  const [prodStock, setProdStock] = useState(0)
  const [prodImage, setProdImage] = useState('')
  const [prodCategoryId, setProdCategoryId] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [prodRes, catRes] = await Promise.all([
        apiClient.get<Product[]>('/api/admin/store/products'),
        apiClient.get<Category[]>('/api/admin/store/categories')
      ])
      setProducts(prodRes.data)
      setCategories(catRes.data)
    } catch (err) {
      toast.error('Failed to load store data.')
    } finally {
      setLoading(false)
    }
  }

  // Categories Handlers
  const openCategoryModal = (cat: Category | null = null) => {
    setEditingCategory(cat)
    setCatName(cat ? cat.name : '')
    setIsCategoryModalOpen(true)
  }

  const saveCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!catName.trim()) return
    setSaving(true)
    try {
      if (editingCategory) {
        await apiClient.put(`/api/admin/store/categories/${editingCategory.id}`, { name: catName })
        toast.success('Category updated')
      } else {
        await apiClient.post('/api/admin/store/categories', { name: catName })
        toast.success('Category created')
      }
      setIsCategoryModalOpen(false)
      fetchData()
    } catch (err) {
      toast.error('Failed to save category')
    } finally {
      setSaving(false)
    }
  }

  const deleteCategory = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return
    try {
      await apiClient.delete(`/api/admin/store/categories/${id}`)
      toast.success('Category deleted')
      fetchData()
    } catch (err) {
      toast.error('Cannot delete category. It might be in use.')
    }
  }

  // Products Handlers
  const openProductModal = (prod: Product | null = null) => {
    setEditingProduct(prod)
    setProdName(prod ? prod.name : '')
    setProdDesc(prod ? prod.description : '')
    setProdPrice(prod ? prod.price : 0)
    setProdStock(prod ? prod.stockQuantity : 0)
    setProdImage(prod ? prod.imageUrl : '')
    setProdCategoryId(prod?.category ? prod.category.id.toString() : '')
    setIsProductModalOpen(true)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    const formData = new FormData()
    formData.append('file', file)
    setUploadingImage(true)

    try {
      const res = await apiClient.post<{ imageUrl: string }>('/api/admin/store/products/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setProdImage(res.data.imageUrl)
      toast.success('Image uploaded successfully!')
    } catch (err) {
      toast.error('Failed to upload image')
    } finally {
      setUploadingImage(false)
    }
  }

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const payload = {
      name: prodName,
      description: prodDesc,
      price: prodPrice,
      stockQuantity: prodStock,
      imageUrl: prodImage,
      category: prodCategoryId ? { id: parseInt(prodCategoryId) } : null
    }

    try {
      if (editingProduct) {
        await apiClient.put(`/api/admin/store/products/${editingProduct.id}`, payload)
        toast.success('Product updated')
      } else {
        await apiClient.post('/api/admin/store/products', payload)
        toast.success('Product created')
      }
      setIsProductModalOpen(false)
      fetchData()
    } catch (err) {
      toast.error('Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  const deleteProduct = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return
    try {
      await apiClient.delete(`/api/admin/store/products/${id}`)
      toast.success('Product deleted')
      fetchData()
    } catch (err) {
      toast.error('Failed to delete product')
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Store className="text-brand-500" size={32} />
            {t('store.admin_store', 'Store Management')}
          </h1>
          <p className="text-zinc-400 mt-1 text-sm">{t('store.admin_subtitle', 'Manage products and categories')}</p>
        </div>

        <div className="flex bg-zinc-900 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('PRODUCTS')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'PRODUCTS' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <Package size={16} /> Products
          </button>
          <button
            onClick={() => setActiveTab('CATEGORIES')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'CATEGORIES' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <Tag size={16} /> Categories
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : activeTab === 'PRODUCTS' ? (
        // PRODUCTS TAB
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              onClick={() => openProductModal()}
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 rounded-xl text-sm font-bold text-white shadow-lg transition flex items-center gap-2"
            >
              <Plus size={16} /> Add Product
            </button>
          </div>

          {products.length === 0 ? (
            <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-12 text-center text-zinc-500 font-medium">
              No products found. Add one to get started.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map(p => (
                <div key={p.id} className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 bg-zinc-900 rounded-xl overflow-hidden shrink-0">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-700"><Package size={24} /></div>
                      )}
                    </div>
                    <div className="flex-grow min-w-0">
                      <h3 className="text-white font-bold text-lg truncate" title={p.name}>{p.name}</h3>
                      <p className="text-brand-400 font-black">{p.price} EGP</p>
                      {p.category && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-zinc-900 text-zinc-400 text-[10px] uppercase font-bold rounded-md">
                          {p.category.name}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      <button onClick={() => openProductModal(p)} className="p-2 text-zinc-400 hover:text-white bg-zinc-900 rounded-lg transition"><Edit2 size={14}/></button>
                      <button onClick={() => deleteProduct(p.id)} className="p-2 text-red-400 hover:text-red-300 bg-red-500/10 rounded-lg transition"><Trash2 size={14}/></button>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-zinc-900 flex justify-between items-center text-sm">
                    <span className="text-zinc-500 font-medium">Stock:</span>
                    <span className={`font-black ${p.stockQuantity > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {p.stockQuantity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        // CATEGORIES TAB
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              onClick={() => openCategoryModal()}
              className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-sm font-bold text-white shadow-lg transition flex items-center gap-2"
            >
              <Plus size={16} /> Add Category
            </button>
          </div>

          {categories.length === 0 ? (
            <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-12 text-center text-zinc-500 font-medium">
              No categories found.
            </div>
          ) : (
            <div className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden shadow-xl">
              <table className="w-full text-left text-sm text-zinc-400">
                <thead className="bg-zinc-900/50 text-xs uppercase text-zinc-500">
                  <tr>
                    <th className="px-6 py-4 font-bold">Category Name</th>
                    <th className="px-6 py-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {categories.map(c => (
                    <tr key={c.id} className="hover:bg-zinc-900/30 transition-colors">
                      <td className="px-6 py-4 font-bold text-white">{c.name}</td>
                      <td className="px-6 py-4 flex justify-end gap-2">
                        <button onClick={() => openCategoryModal(c)} className="p-2 text-zinc-400 hover:text-white transition"><Edit2 size={16} /></button>
                        <button onClick={() => deleteCategory(c.id)} className="p-2 text-red-400 hover:text-red-300 transition"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 md:p-8 max-w-xl w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={() => setIsProductModalOpen(false)} className="text-zinc-400 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={saveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-zinc-400 mb-1">Product Name *</label>
                <input required value={prodName} onChange={e=>setProdName(e.target.value)} className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white outline-none focus:border-brand-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-zinc-400 mb-1">Price (EGP) *</label>
                  <input type="number" required min="0" step="0.01" value={prodPrice} onChange={e=>setProdPrice(Number(e.target.value))} className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white outline-none focus:border-brand-500" />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-400 mb-1">Stock Quantity *</label>
                  <input type="number" required min="0" value={prodStock} onChange={e=>setProdStock(Number(e.target.value))} className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white outline-none focus:border-brand-500" />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-zinc-400 mb-1">Category</label>
                <select value={prodCategoryId} onChange={e=>setProdCategoryId(e.target.value)} className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white outline-none focus:border-brand-500">
                  <option value="">-- No Category --</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-zinc-400 mb-1">Product Image (Upload or URL)</label>
                <div className="flex gap-2 items-center">
                  <label className="cursor-pointer px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-white font-semibold flex items-center gap-2 transition shrink-0">
                    {uploadingImage ? <Loader2 size={16} className="animate-spin text-brand-500" /> : <Upload size={16} className="text-brand-500" />}
                    <span>{uploadingImage ? 'Uploading...' : 'Upload Image'}</span>
                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageUpload} disabled={uploadingImage} className="hidden" />
                  </label>
                  <input type="url" value={prodImage} onChange={e=>setProdImage(e.target.value)} placeholder="https://res.cloudinary.com/..." className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white outline-none focus:border-brand-500" />
                </div>
                {prodImage && (
                  <div className="mt-2 flex items-center gap-3 bg-zinc-900/50 p-2 rounded-xl border border-zinc-800">
                    <img src={prodImage} alt="Preview" className="w-12 h-12 object-cover rounded-lg" />
                    <span className="text-[11px] text-zinc-400 truncate flex-grow">{prodImage}</span>
                    <button type="button" onClick={() => setProdImage('')} className="text-red-400 hover:text-red-300 p-1"><X size={14} /></button>
                  </div>
                )}
              </div>
              <div>
                <label className="block font-semibold text-zinc-400 mb-1">Description</label>
                <textarea rows={3} value={prodDesc} onChange={e=>setProdDesc(e.target.value)} className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white outline-none focus:border-brand-500 resize-none" />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsProductModalOpen(false)} className="px-4 py-2 bg-zinc-800 rounded-xl font-bold text-zinc-300">Cancel</button>
                <button type="submit" disabled={saving} className="px-5 py-2 bg-brand-600 hover:bg-brand-500 rounded-xl font-bold text-white">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">{editingCategory ? 'Edit Category' : 'Add Category'}</h2>
              <button onClick={() => setIsCategoryModalOpen(false)} className="text-zinc-400 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={saveCategory} className="space-y-4 text-sm">
              <div>
                <label className="block font-semibold text-zinc-400 mb-1">Category Name *</label>
                <input required autoFocus value={catName} onChange={e=>setCatName(e.target.value)} className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white outline-none focus:border-brand-500" />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="px-4 py-2 bg-zinc-800 rounded-xl font-bold text-zinc-300">Cancel</button>
                <button type="submit" disabled={saving} className="px-5 py-2 bg-brand-600 hover:bg-brand-500 rounded-xl font-bold text-white">Save Category</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
