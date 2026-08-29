import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react'
import { apiClient } from '../../api/client'

interface Product {
  id: number
  name: string
  price: number
}

interface StoreLead {
  id: number
  name: string
  phone: string
  email: string
  status: string
  product: Product
  createdAt: string
}

interface PageResponse {
  content: StoreLead[]
  totalPages: number
  totalElements: number
  number: number
}

export default function AdminStoreLeadsPage() {
  const { t } = useTranslation()
  const [leads, setLeads] = useState<StoreLead[]>([])
  const [loading, setLoading] = useState(true)
  
  // Pagination
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  useEffect(() => {
    fetchLeads(page)
  }, [page])

  const fetchLeads = async (pageNumber: number) => {
    setLoading(true)
    try {
      const res = await apiClient.get<PageResponse>(`/api/admin/store/leads?page=${pageNumber}&size=4`)
      setLeads(res.data.content)
      setTotalPages(res.data.totalPages)
      setTotalElements(res.data.totalElements)
    } catch (err) {
      toast.error('Failed to load store leads.')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await apiClient.patch(`/api/admin/store/leads/${id}/status`, { status: newStatus })
      toast.success(`Order status changed to ${newStatus}`)
      fetchLeads(page) // refresh
    } catch (err: any) {
      const msg = err.response?.data?.message || ''
      if (msg.includes('out_of_stock')) {
        toast.error('Cannot mark as PAID: Product is out of stock!')
      } else {
        toast.error('Failed to update status.')
      }
      fetchLeads(page) // Refresh to reset dropdown to previous state
    }
  }

  const handlePrevPage = () => {
    if (page > 0) setPage(page - 1)
  }

  const handleNextPage = () => {
    if (page < totalPages - 1) setPage(page + 1)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <ShoppingBag className="text-brand-500" size={32} />
          {t('store.store_leads', 'Store Orders')}
        </h1>
        <p className="text-zinc-400 mt-1 text-sm">Manage product purchase requests and stock</p>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : leads.length === 0 ? (
        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-12 text-center text-zinc-500 font-medium shadow-xl">
          No orders found.
        </div>
      ) : (
        <div className="space-y-4">
          {leads.map(lead => (
            <div key={lead.id} className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-white font-bold text-lg">{lead.name}</h3>
                <p className="text-zinc-400 text-sm">
                  {lead.phone} {lead.email ? `• ${lead.email}` : ''}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-1 bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 font-bold rounded-lg">
                    {lead.product.name}
                  </span>
                  <span className="text-brand-400 text-xs font-black">
                    {lead.product.price} EGP
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex flex-col text-right">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 mb-1">Status</span>
                  <select
                    value={lead.status}
                    onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                    className={`px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-bold focus:outline-none cursor-pointer
                      ${lead.status === 'NEW' ? 'text-blue-400' : ''}
                      ${lead.status === 'CONTACTED' ? 'text-yellow-400' : ''}
                      ${lead.status === 'PAID' ? 'text-green-400' : ''}
                      ${lead.status === 'CLOSED' ? 'text-zinc-500' : ''}
                    `}
                  >
                    <option value="NEW">NEW</option>
                    <option value="CONTACTED">CONTACTED</option>
                    <option value="PAID">PAID (Reduces Stock)</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </div>
                
                <a
                  href={`https://wa.me/${lead.phone}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-green-600/20 text-green-400 border border-green-500/30 font-bold rounded-xl text-xs hover:bg-green-600/30 transition self-end"
                >
                  WhatsApp
                </a>
              </div>
            </div>
          ))}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-zinc-950 border border-zinc-900 p-4 rounded-2xl shadow-xl mt-6">
              <span className="text-xs text-zinc-400 font-semibold">
                Showing {page * 4 + 1} to {Math.min((page + 1) * 4, totalElements)} of {totalElements}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevPage}
                  disabled={page === 0}
                  className="p-2 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 border border-zinc-800 rounded-lg text-zinc-400 transition"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-xs font-bold text-white px-2">
                  Page {page + 1} of {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={page >= totalPages - 1}
                  className="p-2 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 border border-zinc-800 rounded-lg text-zinc-400 transition"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
