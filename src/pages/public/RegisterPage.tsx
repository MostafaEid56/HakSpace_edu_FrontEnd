import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { Eye, EyeOff, User, Mail, Lock, Phone, Briefcase, FileText, Globe, Code, ArrowRight } from 'lucide-react'
import Navbar from '../../components/Navbar'
import { apiClient } from '../../api/client'
import { useAuthStore } from '../../store/authStore'
import logoImg from '../../assets/FinalLogo.png'

const SPECIALIZATIONS = [
  'Frontend Developer',
  'Backend Developer',
  'Fullstack Developer',
  'Mobile Developer',
  'UI/UX Designer',
  'Data Scientist / AI',
  'DevOps / Cloud',
  'Cybersecurity',
  'Other'
]

export default function RegisterPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const loginStore = useAuthStore((state) => state.login)

  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    specialization: '',
    phone: '',
    whatsapp: '',
    bio: '',
    cvUrl: '',
    portfolioUrl: '',
  })

  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast.error(t('register.password_mismatch'))
      return
    }

    if (!formData.fullName || !formData.username || !formData.email || !formData.password || !formData.specialization || !formData.phone || !formData.bio) {
      toast.error(t('blacklist.validation_required'))
      return
    }

    setLoading(true)
    try {
      // 1. Call Register endpoint
      const response = await apiClient.post('/api/auth/register', {
        fullName: formData.fullName,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        specialization: formData.specialization,
        phone: formData.phone,
        whatsapp: formData.whatsapp || formData.phone,
        bio: formData.bio,
        cvUrl: formData.cvUrl || null,
        portfolioUrl: formData.portfolioUrl || null,
      })

      toast.success(t('register.success'))

      // 2. Automatically log in user after registration
      const loginResp = await apiClient.post('/api/auth/login', {
        login: formData.email,
        password: formData.password
      })

      const { token, user } = loginResp.data
      loginStore(token, user)

      navigate('/profile')
    } catch (err: any) {
      console.error(err)
      const message = err.response?.data?.message || err.message || t('blacklist.error_add')
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-16 px-4">
      <Navbar />
      
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <img src={logoImg} alt="HakSpace" className="h-14 w-auto object-contain mx-auto mb-4" />
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{t('register.title')}</h1>
          <p className="text-zinc-400 mt-2 text-sm sm:text-base">{t('register.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm">
          
          {/* Section 1: Account Info */}
          <div>
            <h2 className="text-lg font-bold text-brand-400 mb-4 pb-2 border-b border-zinc-800 flex items-center gap-2">
              <User size={20} /> {t('register.account_section')}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">{t('register.full_name')}</label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder={t('register.full_name_placeholder')}
                  className="w-full px-4 py-3 bg-zinc-800/80 border border-zinc-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">{t('register.username')}</label>
                <input
                  type="text"
                  name="username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  placeholder={t('register.username_placeholder')}
                  className="w-full px-4 py-3 bg-zinc-800/80 border border-zinc-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">{t('register.email')}</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={t('register.email_placeholder')}
                  className="w-full px-4 py-3 bg-zinc-800/80 border border-zinc-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">{t('register.password')}</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder={t('register.password_placeholder')}
                    className="w-full px-4 py-3 bg-zinc-800/80 border border-zinc-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition text-sm pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">{t('register.confirm_password')}</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder={t('register.confirm_password_placeholder')}
                  className="w-full px-4 py-3 bg-zinc-800/80 border border-zinc-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition text-sm"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Community Profile */}
          <div>
            <h2 className="text-lg font-bold text-brand-400 mb-4 pb-2 border-b border-zinc-800 flex items-center gap-2">
              <Briefcase size={20} /> {t('register.profile_section')}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">{t('register.specialization')}</label>
                <select
                  name="specialization"
                  required
                  value={formData.specialization}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-zinc-800/80 border border-zinc-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition text-sm"
                >
                  <option value="" disabled>{t('register.select_specialization')}</option>
                  {SPECIALIZATIONS.map((spec) => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">{t('register.phone')}</label>
                <input
                  type="text"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder={t('register.phone_placeholder')}
                  className="w-full px-4 py-3 bg-zinc-800/80 border border-zinc-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">{t('register.whatsapp')}</label>
                <input
                  type="text"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  placeholder={t('register.whatsapp_placeholder')}
                  className="w-full px-4 py-3 bg-zinc-800/80 border border-zinc-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">{t('register.bio')}</label>
                <textarea
                  name="bio"
                  rows={3}
                  required
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder={t('register.bio_placeholder')}
                  className="w-full px-4 py-3 bg-zinc-800/80 border border-zinc-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition text-sm resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">{t('register.cv_url')}</label>
                <input
                  type="url"
                  name="cvUrl"
                  value={formData.cvUrl}
                  onChange={handleChange}
                  placeholder={t('register.cv_placeholder')}
                  className="w-full px-4 py-3 bg-zinc-800/80 border border-zinc-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">{t('register.portfolio_url')}</label>
                <input
                  type="url"
                  name="portfolioUrl"
                  value={formData.portfolioUrl}
                  onChange={handleChange}
                  placeholder={t('register.portfolio_placeholder')}
                  className="w-full px-4 py-3 bg-zinc-800/80 border border-zinc-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition text-sm"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-brand-600 hover:bg-brand-500 active:scale-98 font-bold text-white rounded-xl transition shadow-lg shadow-brand-900/30 flex justify-center items-center gap-2 text-base"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                {t('register.submit')} <ArrowRight size={18} />
              </>
            )}
          </button>

          <div className="text-center pt-2 text-sm text-zinc-400">
            {t('register.already_have_account')}{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-bold underline ml-1">
              {t('register.login_link')}
            </Link>
          </div>

        </form>
      </div>
    </div>
  )
}
