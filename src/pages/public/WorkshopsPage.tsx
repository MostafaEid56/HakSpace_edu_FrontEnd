import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../../api/client'
import { Calendar, Clock, User, ArrowRight, Armchair, Sparkles, AlertCircle, CheckCircle, PlayCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Navbar from '../../components/Navbar'

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

const fetchWorkshops = async (): Promise<Workshop[]> => {
  const response = await apiClient.get('/api/workshops')
  return response.data
}

export default function WorkshopsPage() {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL')

  const { data: workshops, isLoading, error } = useQuery<Workshop[]>({
    queryKey: ['workshops'],
    queryFn: fetchWorkshops,
  })

  const featuredWorkshop = workshops?.find((w) => w.status === 'ACTIVE' || w.status === 'COMING_SOON') || workshops?.[0]

  const filteredWorkshops = workshops?.filter((w) => {
    if (selectedStatusFilter === 'ALL') return true
    return w.status === selectedStatusFilter
  })

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 pt-32 pb-16 space-y-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between">
          <div>
            <span className="px-3.5 py-1.5 bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-bold rounded-full inline-flex items-center gap-1.5 mb-3">
              <Sparkles size={14} /> {t('workshops.title')}
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
              {t('workshops.title')}
            </h1>
            <p className="text-zinc-400 text-lg max-w-xl">
              {t('workshops.subtitle')}
            </p>
          </div>
          <button 
            onClick={() => navigate('/')} 
            className="mt-4 md:mt-0 text-sm font-semibold text-zinc-400 hover:text-white transition flex items-center gap-1 group"
          >
            {t('course_details.back')} <ArrowRight size={16} className={`transition-transform ${i18n.language === 'ar' ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Featured / Next Workshop Section */}
        {featuredWorkshop && (
          <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 border border-brand-500/40 rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

            <div className="grid md:grid-cols-12 gap-8 items-center relative z-10">
              <div className="md:col-span-7 space-y-5">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="px-3 py-1 bg-brand-600 text-white text-xs font-extrabold rounded-full tracking-wide uppercase shadow-lg">
                    {t('workshops.featured')}
                  </span>
                  <StatusBadge status={featuredWorkshop.status} />
                </div>

                <h2 className="text-2xl md:text-4xl font-extrabold text-white leading-tight">
                  {featuredWorkshop.title}
                </h2>

                <p className="text-zinc-300 text-sm md:text-base line-clamp-3 leading-relaxed">
                  {featuredWorkshop.description}
                </p>

                {/* Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2 text-xs text-zinc-300">
                  {featuredWorkshop.workshopDate && (
                    <div className="flex items-center gap-2 bg-zinc-800/80 px-3.5 py-2.5 rounded-xl border border-zinc-700/60">
                      <Calendar size={16} className="text-brand-400" />
                      <div>
                        <span className="text-[10px] uppercase text-zinc-400 block font-bold">{t('workshops.date')}</span>
                        <span className="font-bold">{featuredWorkshop.workshopDate}</span>
                      </div>
                    </div>
                  )}

                  {featuredWorkshop.startTime && (
                    <div className="flex items-center gap-2 bg-zinc-800/80 px-3.5 py-2.5 rounded-xl border border-zinc-700/60">
                      <Clock size={16} className="text-brand-400" />
                      <div>
                        <span className="text-[10px] uppercase text-zinc-400 block font-bold">{t('workshops.time')}</span>
                        <span className="font-bold">{featuredWorkshop.startTime} {featuredWorkshop.endTime ? `- ${featuredWorkshop.endTime}` : ''}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 bg-zinc-800/80 px-3.5 py-2.5 rounded-xl border border-zinc-700/60 col-span-2 md:col-span-1">
                    <Armchair size={16} className="text-brand-400" />
                    <div>
                      <span className="text-[10px] uppercase text-zinc-400 block font-bold">{t('workshops.capacity')}</span>
                      <span className="font-bold text-brand-400">{featuredWorkshop.remainingSeats} / {featuredWorkshop.maxCapacity} {t('workshops.remaining_seats')}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex flex-wrap items-center gap-4">
                  <button
                    onClick={() => navigate(`/workshops/${featuredWorkshop.id}`)}
                    disabled={featuredWorkshop.status !== 'ACTIVE' || featuredWorkshop.remainingSeats <= 0}
                    className={`px-8 py-3.5 rounded-2xl font-extrabold text-sm transition shadow-xl flex items-center gap-2 ${
                      featuredWorkshop.status === 'ACTIVE' && featuredWorkshop.remainingSeats > 0
                        ? 'bg-brand-600 hover:bg-brand-500 text-white shadow-brand-900/40 active:scale-95'
                        : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                    }`}
                  >
                    {featuredWorkshop.status !== 'ACTIVE'
                      ? t(`admin_workshops.status_${featuredWorkshop.status}`)
                      : featuredWorkshop.remainingSeats <= 0
                      ? t('workshops.fully_booked')
                      : t('workshops.register')}
                  </button>
                </div>
              </div>

              <div className="md:col-span-5">
                <div className="h-64 md:h-80 rounded-2xl overflow-hidden border border-zinc-800 relative bg-zinc-900 shadow-2xl">
                  <img
                    src={featuredWorkshop.imageUrl || 'https://images.unsplash.com/photo-1677442136019-21780efad99a'}
                    alt={featuredWorkshop.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center text-xs font-semibold text-zinc-300">
                    <span className="bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5">
                      <User size={14} className="text-brand-400" /> {featuredWorkshop.instructorName}
                    </span>
                    <span className="bg-brand-600/90 text-white font-bold px-3 py-1.5 rounded-full">
                      {featuredWorkshop.price === 0 ? t('workshops.free') : `${featuredWorkshop.price} EGP`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-4">
          <h3 className="text-2xl font-bold text-white">{t('workshops.other_workshops')}</h3>
          <div className="flex flex-wrap gap-2 bg-zinc-900/80 p-1.5 rounded-2xl border border-zinc-800">
            {['ALL', 'ACTIVE', 'COMING_SOON', 'PENDING', 'IN_PROGRESS', 'COMPLETED'].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatusFilter(st)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  selectedStatusFilter === st ? 'bg-brand-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {st === 'ALL' ? t('common.all', 'All') : t(`admin_workshops.status_${st}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Loading / Error States */}
        {isLoading && (
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4 animate-pulse">
                <div className="bg-zinc-800 h-48 rounded-xl w-full"></div>
                <div className="h-6 bg-zinc-800 rounded w-3/4"></div>
                <div className="h-4 bg-zinc-800 rounded w-full"></div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="bg-red-950/20 border border-red-900/50 rounded-2xl p-8 text-center max-w-lg mx-auto">
            <h3 className="text-xl font-bold text-red-400 mb-2">{t('workshops.error')}</h3>
          </div>
        )}

        {filteredWorkshops && filteredWorkshops.length === 0 && (
          <div className="text-center py-16 bg-zinc-900/40 border border-zinc-800 rounded-3xl text-zinc-500 font-medium">
            {t('workshops.no_workshops')}
          </div>
        )}

        {/* Grid of Workshops */}
        {filteredWorkshops && filteredWorkshops.length > 0 && (
          <div className="grid md:grid-cols-3 gap-8">
            {filteredWorkshops.map((workshop) => (
              <div 
                key={workshop.id} 
                onClick={() => navigate(`/workshops/${workshop.id}`)} 
                className="group bg-zinc-900 border border-zinc-800/80 rounded-2xl overflow-hidden cursor-pointer hover:border-brand-500/50 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-48 overflow-hidden bg-zinc-950">
                    <img 
                      src={workshop.imageUrl || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97'} 
                      alt={workshop.title}
                      className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 right-3">
                      <StatusBadge status={workshop.status} />
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center text-xs font-semibold text-zinc-300">
                      <span className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1">
                        <Clock size={12} className="text-brand-500" /> {workshop.duration || '3 Hours'}
                      </span>
                      <span className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1">
                        <User size={12} className="text-brand-400" /> {workshop.instructorName}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 space-y-3">
                    <h3 className="text-xl font-bold group-hover:text-brand-500 transition line-clamp-1">
                      {workshop.title}
                    </h3>
                    <p className="text-zinc-400 text-xs line-clamp-2 leading-relaxed">
                      {workshop.description}
                    </p>

                    <div className="pt-2 flex items-center justify-between text-xs border-t border-zinc-800/60">
                      <span className="text-zinc-400 font-medium">
                        {workshop.workshopDate ? `📅 ${workshop.workshopDate}` : ''}
                      </span>
                      {workshop.remainingSeats > 0 ? (
                        <span className="text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                          {workshop.remainingSeats} {t('workshops.remaining_seats')}
                        </span>
                      ) : (
                        <span className="text-red-400 font-semibold bg-red-500/10 border border-red-500/30 px-2 py-0.5 rounded-md">
                          {t('workshops.fully_booked')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0 flex items-center justify-between">
                  <span className="text-lg font-bold text-white">
                    {workshop.price === 0 ? t('workshops.free') : `${workshop.price} EGP`}
                  </span>
                  <button className="px-4 py-2 bg-zinc-800 group-hover:bg-brand-600 group-hover:text-white rounded-xl text-xs font-bold transition">
                    {t('workshops.view_details')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const { t } = useTranslation()

  let colorClass = 'bg-zinc-500/10 border-zinc-500/30 text-zinc-400'
  if (status === 'ACTIVE') colorClass = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
  if (status === 'COMING_SOON') colorClass = 'bg-blue-500/10 border-blue-500/30 text-blue-400'
  if (status === 'PENDING') colorClass = 'bg-amber-500/10 border-amber-500/30 text-amber-400'
  if (status === 'IN_PROGRESS') colorClass = 'bg-purple-500/10 border-purple-500/30 text-purple-400'

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md ${colorClass}`}>
      {t(`admin_workshops.status_${status}`)}
    </span>
  )
}
