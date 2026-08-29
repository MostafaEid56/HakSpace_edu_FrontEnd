import { Link, useNavigate } from 'react-router-dom'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { useTranslation } from 'react-i18next'
import logoImg from '../assets/hak_00000.png'
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
            className="h-10 sm:h-12 md:h-14 w-auto object-contain rounded-lg py-1.5"
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
            to="/workshops"
            className="text-sm font-semibold text-zinc-400 hover:text-white transition"
          >
            {t('nav.workshops')}
          </Link>

          <Link
            to="/store"
            className="text-sm font-semibold text-zinc-400 hover:text-white transition"
          >
            {t('store.title', 'Store')}
          </Link>

          <Link
            to="/verify-certificate"
            className="text-sm font-semibold text-zinc-400 hover:text-white transition"
          >
            {t('certificate.verify_nav')}
          </Link>

          {user ? (
            <>
              {user.role === 'ADMIN' ? (
                <Link
                  to="/admin/dashboard"
                  className="text-sm font-semibold text-brand-400 hover:text-brand-300 transition flex items-center gap-1"
                >
                  {t('nav.adminPanel')} <ArrowUpRight size={14} />
                </Link>
              ) : (
                <Link
                  to="/profile"
                  className="text-sm font-semibold text-brand-400 hover:text-brand-300 transition"
                >
                  {t('nav.profile')}
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
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="px-4 py-2 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/50 rounded-xl text-sm font-semibold transition text-white"
              >
                {t('nav.login')}
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-brand-600 hover:bg-brand-500 rounded-xl text-sm font-bold transition text-white shadow-lg shadow-brand-900/20"
              >
                {t('nav.joinUs')}
              </Link>
            </div>
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
            to="/workshops"
            onClick={() => setIsMenuOpen(false)}
            className="text-base font-semibold text-zinc-300 hover:text-white transition px-2 py-1"
          >
            {t('nav.workshops')}
          </Link>

          <Link
            to="/store"
            onClick={() => setIsMenuOpen(false)}
            className="text-base font-semibold text-zinc-300 hover:text-white transition px-2 py-1"
          >
            {t('store.title', 'Store')}
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
              {user.role === 'ADMIN' ? (
                <Link
                  to="/admin/dashboard"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-base font-semibold text-brand-400 hover:text-brand-300 transition flex items-center gap-1 px-2 py-1"
                >
                  {t('nav.adminPanel')} <ArrowUpRight size={16} />
                </Link>
              ) : (
                <Link
                  to="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-base font-semibold text-brand-400 hover:text-brand-300 transition px-2 py-1"
                >
                  {t('nav.profile')}
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
            <div className="flex flex-col gap-2 pt-2 border-t border-zinc-900">
              <Link
                to="/login"
                onClick={() => setIsMenuOpen(false)}
                className="w-full text-center px-4 py-3 border border-zinc-800 hover:bg-zinc-900/50 rounded-xl text-base font-semibold transition text-white"
              >
                {t('nav.login')}
              </Link>
              <Link
                to="/register"
                onClick={() => setIsMenuOpen(false)}
                className="w-full text-center px-4 py-3 bg-brand-600 hover:bg-brand-500 rounded-xl text-base font-bold transition text-white"
              >
                {t('nav.joinUs')}
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
