import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { Plus, Edit2, Trash2, Users, Calendar, Clock, Armchair, CheckCircle, X, Search, Sparkles } from 'lucide-react'
import { apiClient } from '../../api/client'

interface Workshop {
  id: number
  title: string
  description: string
  imageUrl: string
  materialsLink?: string
  workshopDate?: string
  startTime?: string
  endTime?: string
  duration?: string
  instructorName: string
  price: number
  maxCapacity: number
  currentParticipants: number
  remainingSeats: number
  status: string
}

interface Registration {
  id: number
  fullName: string
  phone: string
  email: string
  city: string
  notes: string
  status: string
  createdAt: string
}

export default function AdminWorkshopsPage() {
  const { t } = useTranslation()
  const [workshops, setWorkshops] = useState<Workshop[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingWorkshop, setEditingWorkshop] = useState<Workshop | null>(null)
  
  // Registration modal state
  const [selectedWorkshopForRegs, setSelectedWorkshopForRegs] = useState<Workshop | null>(null)
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loadingRegs, setLoadingRegs] = useState(false)

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [workshopDate, setWorkshopDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [duration, setDuration] = useState('3 Hours')
  const [instructorName, setInstructorName] = useState('')
  const [price, setPrice] = useState(0)
  const [maxCapacity, setMaxCapacity] = useState(30)
  const [status, setStatus] = useState('ACTIVE')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchWorkshops()
  }, [])

  const fetchWorkshops = async () => {
    setLoading(true)
    try {
      const resp = await apiClient.get<Workshop[]>('/api/admin/workshops')
      setWorkshops(resp.data)
    } catch (err: any) {
      toast.error('Failed to load workshops.')
    } finally {
      setLoading(false)
    }
  }

  const openCreateModal = () => {
    setEditingWorkshop(null)
    setTitle('')
    setDescription('')
    setImageUrl('')
    setWorkshopDate('')
    setStartTime('')
    setEndTime('')
    setDuration('3 Hours')
    setInstructorName('')
    setPrice(0)
    setMaxCapacity(30)
    setStatus('ACTIVE')
    setIsModalOpen(true)
  }

  const openEditModal = (w: Workshop) => {
    setEditingWorkshop(w)
    setTitle(w.title)
    setDescription(w.description || '')
    setImageUrl(w.imageUrl || '')
    setWorkshopDate(w.workshopDate || '')
    setStartTime(w.startTime || '')
    setEndTime(w.endTime || '')
    setDuration(w.duration || '3 Hours')
    setInstructorName(w.instructorName || '')
    setPrice(w.price || 0)
    setMaxCapacity(w.maxCapacity || 30)
    setStatus(w.status || 'ACTIVE')
    setIsModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const payload = {
      title, description, imageUrl, workshopDate, startTime, endTime, duration, instructorName, price, maxCapacity, status
    }

    try {
      if (editingWorkshop) {
        await apiClient.put(`/api/admin/workshops/${editingWorkshop.id}`, payload)
        toast.success('Workshop updated successfully!')
      } else {
        await apiClient.post('/api/admin/workshops', payload)
        toast.success('Workshop created successfully!')
      }
      setIsModalOpen(false)
      fetchWorkshops()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save workshop.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this workshop?')) return
    try {
      await apiClient.delete(`/api/admin/workshops/${id}`)
      toast.success('Workshop deleted successfully!')
      fetchWorkshops()
    } catch (err: any) {
      toast.error('Failed to delete workshop.')
    }
  }

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await apiClient.patch(`/api/admin/workshops/${id}/status`, { status: newStatus })
      toast.success(`Workshop status changed to ${newStatus}`)
      fetchWorkshops()
    } catch (err: any) {
      toast.error('Failed to update status.')
    }
  }

  const openRegistrationsModal = async (w: Workshop) => {
    setSelectedWorkshopForRegs(w)
    setLoadingRegs(true)
    try {
      const resp = await apiClient.get<Registration[]>(`/api/admin/workshops/${w.id}/registrations`)
      setRegistrations(resp.data)
    } catch (err: any) {
      toast.error('Failed to load registrations.')
    } finally {
      setLoadingRegs(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">{t('admin_workshops.title')}</h1>
          <p className="text-zinc-400 mt-1 text-sm">{t('admin_workshops.subtitle')}</p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-5 py-3 bg-brand-600 hover:bg-brand-500 rounded-xl text-sm font-bold text-white shadow-lg transition flex items-center gap-2 self-start"
        >
          <Plus size={18} /> {t('admin_workshops.add_workshop')}
        </button>
      </div>

      {/* Grid of Admin Workshops */}
      {loading ? (
        <div className="text-center py-16">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : workshops.length === 0 ? (
        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-12 text-center text-zinc-500 font-medium">
          {t('workshops.no_workshops')}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workshops.map((w) => (
            <div key={w.id} className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 space-y-4 shadow-xl flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold text-white text-lg line-clamp-1">{w.title}</h3>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEditModal(w)} className="p-2 text-zinc-400 hover:text-white transition">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(w.id)} className="p-2 text-red-400 hover:text-red-300 transition">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <p className="text-zinc-400 text-xs line-clamp-2 leading-relaxed">{w.description}</p>

                {/* Status Switcher Dropdown */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-zinc-500">Status</label>
                  <select
                    value={w.status}
                    onChange={(e) => handleStatusChange(w.id, e.target.value)}
                    className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white font-bold focus:outline-none"
                  >
                    <option value="ACTIVE">{t('admin_workshops.status_ACTIVE')}</option>
                    <option value="COMING_SOON">{t('admin_workshops.status_COMING_SOON')}</option>
                    <option value="PENDING">{t('admin_workshops.status_PENDING')}</option>
                    <option value="IN_PROGRESS">{t('admin_workshops.status_IN_PROGRESS')}</option>
                    <option value="COMPLETED">{t('admin_workshops.status_COMPLETED')}</option>
                  </select>
                </div>

                {/* Info Pills */}
                <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-400 pt-2 border-t border-zinc-900">
                  <span>📅 {w.workshopDate || 'No date'}</span>
                  <span>⏰ {w.startTime || 'TBA'}</span>
                  <span className="col-span-2 text-brand-400 font-bold">
                    🪑 Capacity: {w.currentParticipants} / {w.maxCapacity} ({w.remainingSeats} left)
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-900 flex justify-between items-center">
                <span className="text-xs text-zinc-500 font-medium">{w.instructorName}</span>
                <button
                  onClick={() => openRegistrationsModal(w)}
                  className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-brand-400 text-xs font-bold rounded-xl border border-zinc-800 transition flex items-center gap-1.5"
                >
                  <Users size={14} /> Registrations ({w.currentParticipants})
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 md:p-8 max-w-xl w-full space-y-6 shadow-2xl">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">
                {editingWorkshop ? t('admin_workshops.edit_workshop') : t('admin_workshops.add_workshop')}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-zinc-400 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-400 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-sm resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-zinc-400 mb-1">Image URL</label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-400 mb-1">Instructor Name</label>
                  <input
                    type="text"
                    value={instructorName}
                    onChange={(e) => setInstructorName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-400 mb-1">Date</label>
                  <input
                    type="date"
                    value={workshopDate}
                    onChange={(e) => setWorkshopDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-400 mb-1">Start Time</label>
                  <input
                    type="text"
                    placeholder="18:00"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-400 mb-1">End Time</label>
                  <input
                    type="text"
                    placeholder="21:00"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-400 mb-1">Price (EGP)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-400 mb-1">Max Capacity</label>
                  <input
                    type="number"
                    value={maxCapacity}
                    onChange={(e) => setMaxCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-400 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-xs"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="COMING_SOON">COMING_SOON</option>
                    <option value="PENDING">PENDING</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="COMPLETED">COMPLETED</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-zinc-800 rounded-xl font-bold text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-500 rounded-xl font-bold text-white"
                >
                  Save Workshop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Registrations List Modal */}
      {selectedWorkshopForRegs && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 md:p-8 max-w-2xl w-full space-y-6 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white">{t('admin_workshops.registrations_title')}</h2>
                <p className="text-xs text-zinc-400">{selectedWorkshopForRegs.title}</p>
              </div>
              <button onClick={() => setSelectedWorkshopForRegs(null)} className="text-zinc-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            {loadingRegs ? (
              <div className="text-center py-8">
                <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            ) : registrations.length === 0 ? (
              <div className="text-center py-8 text-zinc-500 text-xs">
                {t('admin_workshops.no_registrations')}
              </div>
            ) : (
              <div className="space-y-3">
                {registrations.map((reg) => (
                  <div key={reg.id} className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                    <div>
                      <h4 className="font-bold text-white">{reg.fullName}</h4>
                      <p className="text-zinc-400">{reg.email} • {reg.phone}</p>
                      {reg.city && <p className="text-zinc-500 text-[10px]">City: {reg.city}</p>}
                      {reg.notes && <p className="text-brand-400 text-[11px] mt-1">Note: "{reg.notes}"</p>}
                    </div>

                    <div className="flex items-center gap-2 self-start md:self-auto">
                      <select
                        value={reg.status}
                        onChange={async (e) => {
                          const newStatus = e.target.value
                          try {
                            await apiClient.patch(`/api/admin/workshops/registrations/${reg.id}/status`, { status: newStatus })
                            toast.success(`Registration status updated to ${newStatus}`)
                            if (selectedWorkshopForRegs) openRegistrationsModal(selectedWorkshopForRegs)
                            fetchWorkshops()
                          } catch (err: any) {
                            toast.error(err.response?.data?.message || 'Failed to update registration status')
                          }
                        }}
                        className="px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white font-bold focus:outline-none"
                      >
                        <option value="NEW">NEW</option>
                        <option value="CONTACTED">CONTACTED</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="CLOSED">CLOSED</option>
                      </select>

                      <a
                        href={`https://wa.me/${reg.phone}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-green-600/20 text-green-400 border border-green-500/30 font-bold rounded-xl flex items-center gap-1.5"
                      >
                        WhatsApp
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
