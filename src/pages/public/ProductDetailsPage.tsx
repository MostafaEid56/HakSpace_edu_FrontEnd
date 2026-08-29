import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ShoppingBag, CheckCircle, ShieldCheck } from 'lucide-react'
import { apiClient } from '../../api/client'
import Navbar from '../../components/Navbar'
import { toast } from 'react-toastify'

export default function ProductDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    try {
      const res = await apiClient.get(`/api/store/products/${id}`)
      setProduct(res.data)
      
      // Pre-fill user data if available in localStorage
      const userStr = localStorage.getItem('user')
      if (userStr) {
        const user = JSON.parse(userStr)
        setName(user.fullName || '')
        setPhone(user.phone || '')
        setEmail(user.email || '')
      }
    } catch (err) {
      toast.error('Product not found.')
      navigate('/store')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!product || product.stockQuantity <= 0) {
      toast.error(t('store.out_of_stock', 'Out of stock'))
      return
    }

    setSubmitting(true)
    try {
      // Build user payload if logged in
      const userStr = localStorage.getItem('user')
      let userObj = null
      if (userStr) {
        userObj = { id: JSON.parse(userStr).id }
      }

      await apiClient.post(`/api/store/products/${id}/purchase`, {
        name,
        phone,
        email,
        user: userObj
      })
      setSubmitted(true)
      toast.success(t('store.purchase_success', 'Purchase request submitted successfully!'))
    } catch (err: any) {
      const msg = err.response?.data?.message || ''
      if (msg.includes('out_of_stock')) {
        toast.error(t('store.out_of_stock_error', 'Sorry, this product just went out of stock.'))
        fetchProduct() // refresh stock
      } else {
        toast.error(t('store.purchase_error', 'Failed to submit purchase request.'))
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col font-sans">
        <Navbar />
        <div className="flex-grow flex justify-center items-center">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  if (!product) return null

  const isOutOfStock = product.stockQuantity <= 0

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col font-sans selection:bg-brand-500/30">
      <Navbar />

      <main className="flex-grow pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <button 
            onClick={() => navigate('/store')}
            className="flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors group w-fit"
          >
            <div className="p-2 rounded-full bg-zinc-900 group-hover:bg-zinc-800 transition-colors">
              <ArrowLeft size={16} />
            </div>
            <span className="font-semibold text-sm">{t('store.back_to_store', 'Back to Store')}</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Image Column */}
            <div className="space-y-4">
              <div className="bg-zinc-900 rounded-[2.5rem] p-4 border border-zinc-800/50 shadow-2xl overflow-hidden relative group">
                <div className="aspect-square rounded-[2rem] overflow-hidden bg-zinc-800 relative">
                  {product.imageUrl ? (
                    <img 
                      src={product.imageUrl} 
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-700">
                      <ShoppingBag size={80} />
                    </div>
                  )}
                  {isOutOfStock && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                      <span className="px-6 py-3 bg-red-600 text-white font-black text-xl uppercase tracking-widest rounded-2xl rotate-[-12deg] shadow-2xl border border-red-500/50">
                        {t('store.out_of_stock', 'Out of Stock')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Content Column */}
            <div className="flex flex-col">
              {product.category && (
                <span className="inline-block px-3 py-1 bg-brand-500/10 text-brand-400 text-xs uppercase tracking-wider font-bold rounded-xl mb-4 w-fit border border-brand-500/20">
                  {product.category.name}
                </span>
              )}
              
              <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-4">
                {product.name}
              </h1>
              
              <div className="text-3xl font-black text-brand-400 mb-6">
                {product.price} EGP
              </div>

              <div className="prose prose-invert max-w-none text-zinc-400 mb-8 leading-relaxed whitespace-pre-wrap">
                {product.description}
              </div>

              <div className="flex items-center gap-2 mb-8">
                <div className={`w-3 h-3 rounded-full ${isOutOfStock ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]'}`}></div>
                <span className={`font-bold ${isOutOfStock ? 'text-red-400' : 'text-green-400'}`}>
                  {isOutOfStock 
                    ? t('store.out_of_stock', 'Out of Stock') 
                    : `${t('store.available', 'Available')}: ${product.stockQuantity}`}
                </span>
              </div>

              {/* Purchase Form */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8 mt-auto shadow-xl">
                {submitted ? (
                  <div className="text-center py-8 space-y-4">
                    <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/20">
                      <CheckCircle className="text-green-400" size={32} />
                    </div>
                    <h3 className="text-2xl font-bold text-white">{t('store.request_received', 'Request Received!')}</h3>
                    <p className="text-zinc-400 max-w-sm mx-auto">
                      {t('store.request_received_desc', 'We have received your purchase request. Our team will contact you shortly to confirm the order.')}
                    </p>
                  </div>
                ) : (
                  <>
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                      <ShieldCheck className="text-brand-400" size={24} />
                      {t('store.request_purchase', 'Request Purchase')}
                    </h3>
                    
                    <form onSubmit={handleSubmit} className="space-y-4 text-sm">
                      <div>
                        <label className="block text-zinc-400 font-semibold mb-1.5">{t('store.full_name', 'Full Name')} *</label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={e => setName(e.target.value)}
                          className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 focus:border-brand-500 rounded-xl text-white outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-400 font-semibold mb-1.5">{t('store.phone', 'Phone Number')} *</label>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 focus:border-brand-500 rounded-xl text-white outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-400 font-semibold mb-1.5">{t('store.email', 'Email')} (Optional)</label>
                        <input
                          type="email"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 focus:border-brand-500 rounded-xl text-white outline-none transition-colors"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={submitting || isOutOfStock}
                        className="w-full py-4 mt-2 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:hover:bg-brand-600 rounded-xl text-white font-bold text-base transition-all shadow-lg shadow-brand-500/20 active:scale-[0.98] flex items-center justify-center gap-2"
                      >
                        {submitting ? (
                          <><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span> {t('store.submitting', 'Submitting...')}</>
                        ) : (
                          <><ShoppingBag size={20} /> {isOutOfStock ? t('store.out_of_stock', 'Out of Stock') : t('store.submit_request', 'Submit Purchase Request')}</>
                        )}
                      </button>
                    </form>
                  </>
                )}
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
