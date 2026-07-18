import { Link, useNavigate } from 'react-router-dom'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { useTranslation } from 'react-i18next'
import logoImg from '../assets/FinalLogo.png'
import LanguageSwitcher from './LanguageSwitcher'

export default function Navbar() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { t } = useTranslation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 inset-x-0 h-20 bg-black/70 backdrop-blur-md border-b border-zinc-900 z-50">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <img
            src={logoImg}
            alt="HakSpace Logo"
            className="h-8 sm:h-10 w-auto object-contain rounded-lg"
          />
        </Link>

        {/* Mobile menu button */}
        <div className="flex sm:hidden items-center gap-4">
          <LanguageSwitcher />
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-zinc-400 hover:text-white transition p-2"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden sm:flex items-center gap-4">
          <LanguageSwitcher />

          <Link
            to="/courses"
            className="text-sm font-semibold text-zinc-400 hover:text-white transition"
          >
            {t('nav.courses')}
          </Link>

          <Link
            to="/verify-certificate"
            className="text-sm font-semibold text-zinc-400 hover:text-white transition"
          >
            {t('certificate.verify_nav')}
          </Link>

          {user ? (
            <>
              {user.role === 'ADMIN' && (
                <Link
                  to="/admin/dashboard"
                  className="text-sm font-semibold text-brand-400 hover:text-brand-300 transition flex items-center gap-1"
                >
                  {t('nav.adminPanel')} <ArrowUpRight size={14} />
                </Link>
              )}
              <button
                onClick={() => { logout(); navigate('/') }}
                className="px-4 py-2 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/50 rounded-xl text-sm font-semibold transition text-white"
              >
                {t('nav.logout')}
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-semibold transition shadow-lg shadow-brand-900/20"
            >
              {t('nav.login')}
            </Link>
          )}
        </nav>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isMenuOpen && (
        <div className="sm:hidden absolute top-20 left-0 w-full bg-zinc-950 border-b border-zinc-900 shadow-xl py-4 px-4 flex flex-col gap-4">
          <Link
            to="/courses"
            onClick={() => setIsMenuOpen(false)}
            className="text-base font-semibold text-zinc-300 hover:text-white transition px-2 py-1"
          >
            {t('nav.courses')}
          </Link>

          <Link
            to="/verify-certificate"
            onClick={() => setIsMenuOpen(false)}
            className="text-base font-semibold text-zinc-300 hover:text-white transition px-2 py-1"
          >
            {t('certificate.verify_nav')}
          </Link>

          {user ? (
            <>
              {user.role === 'ADMIN' && (
                <Link
                  to="/admin/dashboard"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-base font-semibold text-brand-400 hover:text-brand-300 transition flex items-center gap-1 px-2 py-1"
                >
                  {t('nav.adminPanel')} <ArrowUpRight size={16} />
                </Link>
              )}
              <button
                onClick={() => { setIsMenuOpen(false); logout(); navigate('/') }}
                className="w-full text-left px-4 py-3 border border-zinc-800 hover:bg-zinc-900/50 rounded-xl text-base font-semibold transition text-white mt-2"
              >
                {t('nav.logout')}
              </button>
            </>
          ) : (
            <Link
              to="/login"
              onClick={() => setIsMenuOpen(false)}
              className="w-full text-center px-5 py-3 mt-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-base font-semibold transition shadow-lg shadow-brand-900/20"
            >
              {t('nav.login')}
            </Link>
          )}
        </div>
      )}
    </header>
  )
}
