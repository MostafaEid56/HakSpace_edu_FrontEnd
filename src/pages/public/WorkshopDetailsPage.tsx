import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { apiClient } from '../../api/client'
import { toast } from 'react-toastify'
import { Calendar, Clock, User, ArrowLeft, Send, Sparkles, Armchair, AlertCircle, CheckCircle, Award } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Navbar from '../../components/Navbar'
import { useAuthStore } from '../../store/authStore'

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

const fetchWorkshopById = async (id: string): Promise<Workshop> => {
  const res = await apiClient.get(`/api/workshops/${id}`)
  return res.data
}

const submitWorkshopRegistration = async (data: any) => {
  const res = await apiClient.post('/api/workshops/register', data)
  return res.data
}

export default function WorkshopDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const { user } = useAuthStore()
  const [success, setSuccess] = useState(false)

  const [fullName, setFullName] = useState(user?.fullName || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [email, setEmail] = useState(user?.email || '')
  const [city, setCity] = useState('')
  const [contactMethod, setContactMethod] = useState('WHATSAPP')
  const [contactTime, setContactTime] = useState('ANYTIME')
  const [notes, setNotes] = useState('')

  const { data: workshop, isLoading, error } = useQuery<Workshop>({
    queryKey: ['workshop', id],
    queryFn: () => fetchWorkshopById(id!),
    enabled: !!id,
  })

  // ── Duplicate-registration check ──────────────────────────────────────────
  const { data: myWorkshops } = useQuery<any[]>({
    queryKey: ['myWorkshopRegistrations'],
    queryFn: async () => {
      const res = await apiClient.get('/api/user/profile')
      const all = [
        ...(res.data.upcomingWorkshops || []),
        ...(res.data.inProgressWorkshops || []),
        ...(res.data.completedWorkshops || []),
      ]
      return all
    },
    enabled: !!user,
  })

  const alreadyRegistered = myWorkshops?.some((w: any) => String(w.id) === String(id)) ?? false

  const mutation = useMutation({
    mutationFn: submitWorkshopRegistration,
    onSuccess: () => {
      setSuccess(true)
      toast.success(t('added_success', 'Registered successfully for the workshop!'))
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || ''
      if (msg.includes('duplicate') || msg.includes('already')) {
        toast.error('You have already registered for this workshop.')
      } else {
        toast.error(msg || 'Failed to submit workshop registration.')
      }
    },
  })

  const isAvailableForRegistration = workshop?.status === 'ACTIVE' && (workshop?.remainingSeats || 0) > 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (alreadyRegistered) {
      toast.error('You have already registered for this workshop.')
      return
    }

    if (!isAvailableForRegistration) {
      toast.error('Registration is currently closed for this workshop.')
      return
    }

    if (!fullName || !phone || !email) {
      toast.error('Please fill in all required fields.')
      return
    }

    mutation.mutate({
      fullName,
      phone,
      email,
      city,
      contactMethod,
      contactTime,
      notes,
      workshopId: Number(id),
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Navbar />
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error || !workshop) {
    return (
      <div className="min-h-screen bg-black text-white pt-32 px-4 text-center">
        <Navbar />
        <div className="max-w-md mx-auto bg-zinc-900 border border-zinc-800 rounded-2xl p-8 space-y-4">
          <AlertCircle size={40} className="text-red-400 mx-auto" />
          <h2 className="text-2xl font-bold">{t('workshops.error')}</h2>
          <button onClick={() => navigate('/workshops')} className="px-6 py-2 bg-brand-600 rounded-xl text-sm font-bold">
            Back to Workshops
          </button>
        </div>
      </div>
    )
  }

  const fillPct = Math.min(100, Math.round(((workshop.currentParticipants || 0) / (workshop.maxCapacity || 1)) * 100))

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-16 px-4">
      <Navbar />

      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Back navigation */}
        <button
          onClick={() => navigate('/workshops')}
          className="text-sm font-semibold text-zinc-400 hover:text-white transition flex items-center gap-2"
        >
          <ArrowLeft size={16} className={i18n.language === 'ar' ? 'rotate-180' : ''} /> Back to Workshops
        </button>

        {/* Hero Section */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-md grid md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7 space-y-4">
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                workshop.status === 'ACTIVE'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              }`}>
                {t(`admin_workshops.status_${workshop.status}`)}
              </span>
              <span className="text-xs text-zinc-400 font-semibold flex items-center gap-1">
                <User size={14} className="text-brand-400" /> {workshop.instructorName}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
              {workshop.title}
            </h1>

            <p className="text-zinc-300 text-sm leading-relaxed">{workshop.description}</p>

            {/* Capacity Progress Bar */}
            <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800/80 space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-zinc-400 flex items-center gap-1.5">
                  <Armchair size={14} className="text-brand-400" /> Capacity Tracker:
                </span>
                <span className={workshop.remainingSeats > 0 ? 'text-emerald-400' : 'text-red-400'}>
                  {workshop.remainingSeats > 0
                    ? `${workshop.remainingSeats} Seats Remaining (${workshop.currentParticipants}/${workshop.maxCapacity})`
                    : 'Fully Booked'}
                </span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    fillPct >= 100 ? 'bg-red-500' : fillPct >= 75 ? 'bg-amber-500' : 'bg-brand-500'
                  }`}
                  style={{ width: `${fillPct}%` }}
                />
              </div>
            </div>

            {/* Workshop Schedule Info */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div className="bg-zinc-800/60 p-3 rounded-xl border border-zinc-700/50">
                <span className="text-[10px] text-zinc-400 font-bold uppercase block">{t('workshops.date')}</span>
                <span className="font-bold text-white">{workshop.workshopDate || 'TBA'}</span>
              </div>
              <div className="bg-zinc-800/60 p-3 rounded-xl border border-zinc-700/50">
                <span className="text-[10px] text-zinc-400 font-bold uppercase block">{t('workshops.time')}</span>
                <span className="font-bold text-white">{workshop.startTime || '18:00'} {workshop.endTime ? `- ${workshop.endTime}` : ''}</span>
              </div>
              <div className="bg-zinc-800/60 p-3 rounded-xl border border-zinc-700/50 col-span-2 md:col-span-1">
                <span className="text-[10px] text-zinc-400 font-bold uppercase block">{t('workshops.price')}</span>
                <span className="font-bold text-brand-400">{workshop.price === 0 ? t('workshops.free') : `${workshop.price} EGP`}</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-5">
            <div className="h-64 md:h-80 rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl relative">
              <img src={workshop.imageUrl || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97'} alt={workshop.title} className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        {/* Registration Form / Success Banner */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 md:p-8 shadow-2xl">
          {alreadyRegistered ? (
            <div className="text-center py-10 space-y-4">
              <CheckCircle size={56} className="text-emerald-400 mx-auto" />
              <h2 className="text-2xl font-extrabold text-white">You're Already Registered!</h2>
              <p className="text-zinc-400 text-sm max-w-md mx-auto">
                You have already submitted a registration for <strong>{workshop.title}</strong>. Our team will contact you to confirm your seat.
              </p>
              <button onClick={() => navigate('/profile')} className="px-6 py-3 bg-brand-600 hover:bg-brand-500 rounded-xl font-bold text-sm">
                View My Profile
              </button>
            </div>
          ) : success ? (
            <div className="text-center py-10 space-y-4">
              <CheckCircle size={56} className="text-emerald-400 mx-auto" />
              <h2 className="text-2xl font-extrabold text-white">Registration Request Received!</h2>
              <p className="text-zinc-400 text-sm max-w-md mx-auto">
                Thank you for registering for <strong>{workshop.title}</strong>. Our team will contact you shortly on WhatsApp to confirm your seat.
              </p>
              <button onClick={() => navigate('/profile')} className="px-6 py-3 bg-brand-600 hover:bg-brand-500 rounded-xl font-bold text-sm">
                View My Dashboard
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <Send size={20} className="text-brand-500" /> {t('workshops.register')}
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  {user ? 'Your user profile details have been automatically filled.' : 'Fill in your details below to register for this live workshop.'}
                </p>
              </div>

              {!isAvailableForRegistration && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-400 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle size={18} />
                  <span>
                    {workshop.remainingSeats <= 0
                      ? 'This workshop is fully booked.'
                      : `Registration is currently not active for this workshop (Status: ${workshop.status}).`}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1">{t('register.full_name')} *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={!isAvailableForRegistration}
                    className="w-full px-4 py-3 bg-zinc-800/80 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1">{t('register.email')} *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={!isAvailableForRegistration}
                    className="w-full px-4 py-3 bg-zinc-800/80 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1">{t('register.phone')} *</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={!isAvailableForRegistration}
                    className="w-full px-4 py-3 bg-zinc-800/80 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    disabled={!isAvailableForRegistration}
                    className="w-full px-4 py-3 bg-zinc-800/80 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1">Notes / Questions for Instructor</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    disabled={!isAvailableForRegistration}
                    className="w-full px-4 py-3 bg-zinc-800/80 border border-zinc-700 rounded-xl text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!isAvailableForRegistration || mutation.isPending}
                className={`w-full py-4 rounded-2xl font-extrabold text-sm transition flex items-center justify-center gap-2 ${
                  isAvailableForRegistration
                    ? 'bg-brand-600 hover:bg-brand-500 active:scale-95 text-white shadow-xl shadow-brand-900/30'
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                }`}
              >
                {mutation.isPending ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : isAvailableForRegistration ? (
                  t('workshops.register')
                ) : (
                  t('workshops.fully_booked')
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
