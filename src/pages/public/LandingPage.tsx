import { useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../../api/client'
import { useAuthStore } from '../../store/authStore'
import { ArrowRight, Clock } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Navbar from '../../components/Navbar'
import { formatDuration } from '../../utils/duration'
import logoImg from '../../assets/hak_00000.png'
import omaraEsportsLogo from '../../assets/omara-logo.png'
import omaraStudioLogo from '../../assets/omara studio_00000.png'
import iqraaLogo from '../../assets/iqraa_00000.png'

interface Course {
  id: number
  title: string
  description: string
  imageUrl: string
  duration: string
  instructorName: string
  price: number
  rating: number
  studentCount: number
  groups: { id: number; groupName: string; isAvailable: boolean }[]
}

const fetchCourses = async (): Promise<Course[]> => {
  const response = await apiClient.get('/api/courses')
  return response.data
}

export default function LandingPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { t, i18n } = useTranslation()

  const { data: courses, isLoading } = useQuery<Course[]>({
    queryKey: ['featuredCourses'],
    queryFn: fetchCourses,
  })

  // Take first 3 courses as featured
  const featuredCourses = courses ? courses.slice(0, 3) : []

  return (
    <div className="min-h-screen bg-black text-white selection:bg-brand-500 selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-40 pb-20 relative overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-brand-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute top-10 left-10 w-72 h-72 bg-rose-500/5 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="max-w-4xl mx-auto text-center px-6 relative">
          <span className="px-3.5 py-1.5 bg-brand-500/10 text-brand-400 rounded-full text-xs font-bold uppercase tracking-widest border border-brand-500/20 inline-block mb-6 animate-pulse">
            {t('landing.badge')}
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
            {t('landing.hero_title_1')} <br className="hidden md:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 via-rose-400 to-rose-600">
              {t('landing.hero_title_2')}
            </span>
          </h1>
          <p className="text-zinc-400 text-sm md:text-base max-w-2xl mx-auto mb-10 leading-relaxed whitespace-pre-line">
            {t('landing.hero_subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <button
              onClick={() => navigate('/courses')}
              className="w-full sm:w-auto bg-brand-600 hover:bg-brand-500 active:scale-95 text-white px-8 py-4 rounded-xl font-bold transition shadow-lg shadow-brand-900/30 flex items-center justify-center gap-2 group text-base"
            >
              {t('landing.explore_catalog')} <ArrowRight size={18} className={`transition-transform ${i18n.language === 'ar' ? 'group-hover:-translate-x-1 rotate-180' : 'group-hover:translate-x-1'}`} />
            </button>
            <button
              onClick={() => navigate('/verify-certificate')}
              className="w-full sm:w-auto bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-white px-8 py-4 rounded-xl font-bold transition flex items-center justify-center gap-2 group text-base border border-zinc-700"
            >
              {t('certificate.verify_nav')}
            </button>
          </div>
        </div>
      </section>

      {/* Stats Showcase Banner */}
      <section className="py-12 border-y border-zinc-900 bg-zinc-950/20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <h3 className="text-3xl md:text-4xl font-extrabold text-white">20%</h3>
            <p className="text-zinc-500 text-xs md:text-sm font-semibold uppercase tracking-wider mt-1">{t('landing.stats_employment')}</p>
          </div>
          <div>
            <h3 className="text-3xl md:text-4xl font-extrabold text-white">1,490</h3>
            <p className="text-zinc-500 text-xs md:text-sm font-semibold uppercase tracking-wider mt-1">{t('landing.stats_graduates')}</p>
          </div>
          <div>
            <h3 className="text-3xl md:text-4xl font-extrabold text-white">4.9/5</h3>
            <p className="text-zinc-500 text-xs md:text-sm font-semibold uppercase tracking-wider mt-1">{t('landing.stats_satisfaction')}</p>
          </div>
          <div>
            <h3 className="text-3xl md:text-4xl font-extrabold text-white">+26</h3>
            <p className="text-zinc-500 text-xs md:text-sm font-semibold uppercase tracking-wider mt-1">{t('landing.stats_courses')}</p>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-16 px-6 max-w-7xl mx-auto border-b border-zinc-900/50">
        <div className="text-center mb-10">
          <p className="text-sm md:text-base font-semibold text-zinc-500 uppercase tracking-widest">{t('landing.partners_title')}</p>
        </div>
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-12 sm:gap-16 md:gap-24 sm:justify-center items-center pb-6 -mx-6 px-6 sm:mx-0 sm:px-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>

          <a href="https://www.facebook.com/omr.co2" target="_blank" rel="noopener noreferrer" className="snap-center shrink-0 flex flex-col items-center gap-4 group w-[220px] sm:w-auto">
            <img src={omaraEsportsLogo} alt="Omara Esports" className="h-24 md:h-32 object-contain opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" />
            <span className="text-zinc-400 group-hover:text-white font-bold text-lg transition-colors">Omara E-Sports</span>
          </a>

          <a href="https://www.instagram.com/xbomara" target="_blank" rel="noopener noreferrer" className="snap-center shrink-0 flex flex-col items-center gap-4 group w-[220px] sm:w-auto">
            <img src={omaraStudioLogo} alt="Omara Studio" className="h-24 md:h-32 object-contain opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" />
            <span className="text-zinc-400 group-hover:text-white font-bold text-lg transition-colors">Omara Studio</span>
          </a>

          <a href="https://www.facebook.com/Dar.Eqraa" target="_blank" rel="noopener noreferrer" className="snap-center shrink-0 flex flex-col items-center gap-4 group w-[220px] sm:w-auto">
            <img src={iqraaLogo} alt="Iqraa w tallem" className="h-24 md:h-32 object-contain opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" />
            <span className="text-zinc-400 group-hover:text-white font-bold text-lg transition-colors">إقرأ وتعلم</span>
          </a>

        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">{t('landing.featured_title')}</h2>
            <p className="text-zinc-400">{t('landing.featured_subtitle')}</p>
          </div>
          <button
            onClick={() => navigate('/courses')}
            className="mt-4 md:mt-0 text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1.5 transition text-sm group"
          >
            {t('landing.view_all')} <ArrowRight size={16} className={`transition-transform ${i18n.language === 'ar' ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl h-80 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {featuredCourses.map((course) => (
              <div
                key={course.id}
                onClick={() => navigate(`/courses/${course.id}`)}
                className="group bg-zinc-900 border border-zinc-850 hover:border-brand-500/40 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
              >
                <div className="relative h-44 overflow-hidden bg-zinc-850">
                  <img
                    src={course.imageUrl || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97'}
                    alt={course.title}
                    className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent"></div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-brand-500 transition line-clamp-1">
                      {course.title}
                    </h3>
                    <p className="text-zinc-400 text-xs mb-4 line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-zinc-800">
                    <span className="text-lg font-black text-white">{course.price} {t('common.currency')}</span>
                    <span className="text-xs text-zinc-400 flex items-center gap-1">
                      <Clock size={12} className="text-brand-500" /> {formatDuration(course.duration, i18n.language)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Location Section */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8 items-center bg-zinc-950/40 border border-zinc-900 rounded-3xl p-4 md:p-8">
          <div className="flex-1 w-full rounded-2xl overflow-hidden border border-zinc-800 h-[350px]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3506.3249096007444!2d30.800828774951853!3d28.499870790093553!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x145b07000b222899%3A0xb40c0f20aee2fb5a!2sHAK%20SPACE!5e0!3m2!1sen!2seg!4v1784412306560!5m2!1sen!2seg"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
          <div className="md:w-1/3 flex flex-col justify-center text-center md:text-right" dir="rtl">
            <h3 className="text-xl md:text-2xl font-bold mb-4 text-white">عنوان مقرنا </h3>
            <p className="text-zinc-400 leading-relaxed font-medium">
              المنيا / بنى مزار / الشارع المقابل لمدرسة الاعدادية بنات / بجانب استديو عزو
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950/20 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="HakSpace" className="h-10 sm:h-12 w-auto object-contain rounded-md" />
            <span className="text-zinc-600 text-xs">© 2026 HakSpace. {t('landing.footer_rights')}</span>
          </div>


        </div>
      </footer>
    </div>
  )
}