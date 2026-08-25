import React, { useEffect, useState } from 'react'
import { useNavigate, Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { User, Mail, Phone, Briefcase, FileText, Globe, ExternalLink, BookOpen, CheckCircle, Clock, PlayCircle, Edit3, X, Save, Sparkles, Award, Share2, Copy, Lock } from 'lucide-react'
import Navbar from '../../components/Navbar'
import { useAuthStore } from '../../store/authStore'
import { apiClient } from '../../api/client'
import { MemberBadge, BadgeLevel } from '../../components/MemberBadge'

interface CourseSummary {
  id: number
  title: string
  description: string
  imageUrl: string
  duration: string
  instructorName: string
  price: number
  status: string
  groupName?: string
  schedule?: string
  enrollmentDate?: string
  completionDate?: string
  certificateCode?: string
}

interface WorkshopSummary {
  id: number
  title: string
  description: string
  imageUrl: string
  workshopDate: string
  startTime: string
  endTime: string
  duration?: string
  instructorName: string
  price: number
  maxCapacity: number
  currentParticipants: number
  remainingSeats: number
  status: string
  registrationDate?: string
}

interface UserProfileData {
  id: number
  fullName: string
  username: string
  email: string
  specialization: string
  phone: string
  whatsapp: string
  bio: string
  cvUrl?: string
  portfolioUrl?: string
  role: string
  badge?: BadgeLevel | string
}

interface DashboardResponse {
  profile: UserProfileData
  registeredCourses?: CourseSummary[]
  inProgressCourses: CourseSummary[]
  upcomingCourses: CourseSummary[]
  completedCourses: CourseSummary[]
  availableCourses: CourseSummary[]
  inProgressWorkshops?: WorkshopSummary[]
  upcomingWorkshops?: WorkshopSummary[]
  completedWorkshops?: WorkshopSummary[]
  availableWorkshops?: WorkshopSummary[]
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const { username: paramUsername } = useParams<{ username?: string }>()
  const { t, i18n } = useTranslation()
  const { user: authUser, token, updateUser } = useAuthStore()

  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [activeTab, setActiveTab] = useState<'registered' | 'in_progress' | 'completed' | 'available'>('completed')
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<Partial<UserProfileData>>({})
  const [saving, setSaving] = useState(false)

  const isSelf = !paramUsername || (authUser?.username && authUser.username.toLowerCase() === paramUsername.toLowerCase())

  useEffect(() => {
    if (!paramUsername && !token) {
      navigate('/login')
      return
    }
    fetchProfile()
  }, [paramUsername, token])

  const fetchProfile = async () => {
    setLoading(true)
    setNotFound(false)
    try {
      const endpoint = paramUsername ? `/api/user/profile/${paramUsername}` : '/api/user/profile'
      const resp = await apiClient.get<DashboardResponse>(endpoint)
      setDashboardData(resp.data)
      setEditForm(resp.data.profile)
      if (isSelf) {
        updateUser(resp.data.profile)
        setActiveTab('registered')
      } else {
        setActiveTab('completed')
      }
    } catch (err: any) {
      console.error(err)
      if (err?.response?.status === 404) {
        setNotFound(true)
      } else {
        toast.error(t('courses.error'))
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCopyShareLink = () => {
    const username = dashboardData?.profile?.username || authUser?.username
    if (!username) return
    const publicUrl = `${window.location.origin}/profile/${username}`
    navigator.clipboard.writeText(publicUrl)
    toast.success(t('profile.link_copied', 'Profile link copied to clipboard!'))
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const resp = await apiClient.put<UserProfileData>('/api/user/profile', editForm)
      toast.success(t('added_success', 'Profile updated successfully!'))
      setDashboardData((prev) => prev ? { ...prev, profile: resp.data } : null)
      updateUser(resp.data)
      setIsEditing(false)
    } catch (err: any) {
      console.error(err)
      toast.error(t('error_update', 'Failed to update profile'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white pt-28 flex justify-center">
        <Navbar />
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-black text-white pt-28 px-4 text-center">
        <Navbar />
        <div className="max-w-md mx-auto py-16 space-y-4">
          <h2 className="text-3xl font-extrabold text-white">404</h2>
          <p className="text-zinc-400">User profile not found.</p>
          <Link to="/" className="inline-block px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl">
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  const profile = dashboardData?.profile || authUser

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-16 px-4">
      <Navbar />

      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header / Profile Card */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-600/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
            <div className="flex items-start gap-4 md:gap-6">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-brand-600/20 border border-brand-500/40 text-brand-400 flex items-center justify-center font-black text-2xl md:text-3xl shadow-inner flex-shrink-0">
                {profile?.fullName ? profile.fullName.charAt(0).toUpperCase() : 'U'}
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl md:text-3xl font-extrabold text-white">{profile?.fullName}</h1>
                  <MemberBadge badge={profile?.badge || 'SILVER'} size="md" />
                  {profile?.specialization && (
                    <span className="px-3 py-1 bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-bold rounded-full">
                      {profile.specialization}
                    </span>
                  )}
                </div>

                <p className="text-zinc-400 text-sm font-medium">@{profile?.username}</p>

                {isSelf && (
                  <div className="space-y-2 pt-1">
                    <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400">
                      {profile?.email && (
                        <span className="flex items-center gap-1.5"><Mail size={14} className="text-brand-500" /> {profile.email}</span>
                      )}
                      {profile?.phone && (
                        <span className="flex items-center gap-1.5"><Phone size={14} className="text-brand-500" /> {profile.phone}</span>
                      )}
                      {profile?.whatsapp && (
                        <a href={`https://wa.me/${profile.whatsapp}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-green-400 hover:underline">
                          WhatsApp: {profile.whatsapp}
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-amber-400/90 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl max-w-xl">
                      <Lock size={13} className="flex-shrink-0 text-amber-400" />
                      <span>
                        <strong>Private Information</strong> — Your phone number, WhatsApp number, and email address are visible only to you and are hidden when your profile is shared.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 self-start">
              <button
                onClick={handleCopyShareLink}
                className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 rounded-xl text-sm font-bold text-white transition flex items-center gap-2 shadow-lg shadow-brand-900/20"
                title="Share Profile"
              >
                <Share2 size={16} /> Share Profile
              </button>

              {isSelf && (
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl text-sm font-bold text-white transition flex items-center gap-2"
                >
                  {isEditing ? <X size={16} /> : <Edit3 size={16} />}
                  {isEditing ? t('cancel') : t('profile.edit_profile')}
                </button>
              )}
            </div>
          </div>

          {/* Bio & Resume Links */}
          <div className="mt-6 pt-6 border-t border-zinc-800/80 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">{t('profile.bio')}</h3>
              <p className="text-zinc-300 text-sm leading-relaxed">{profile?.bio || 'No bio provided.'}</p>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">{t('profile.links')}</h3>
              <div className="flex flex-wrap gap-2">
                {profile?.cvUrl ? (
                  <a href={profile.cvUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-bold rounded-xl text-brand-400 transition">
                    <FileText size={14} /> {t('profile.view_cv')} <ExternalLink size={12} />
                  </a>
                ) : (
                  <span className="text-xs text-zinc-500 italic">No CV link</span>
                )}

                {profile?.portfolioUrl && (
                  <a href={profile.portfolioUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-bold rounded-xl text-zinc-300 transition">
                    <Globe size={14} /> {t('profile.view_portfolio')} <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Edit Modal / Expandable Panel */}
        {isEditing && (
          <form onSubmit={handleSaveProfile} className="bg-zinc-900 border border-brand-500/30 rounded-3xl p-6 space-y-4 shadow-xl">
            <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Edit3 size={18} className="text-brand-500" /> {t('profile.edit_profile')}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1">{t('register.full_name')}</label>
                <input
                  type="text"
                  value={editForm.fullName || ''}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1">{t('register.specialization')}</label>
                <input
                  type="text"
                  value={editForm.specialization || ''}
                  onChange={(e) => setEditForm({ ...editForm, specialization: e.target.value })}
                  className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1">{t('register.phone')}</label>
                <input
                  type="text"
                  value={editForm.phone || ''}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1">{t('register.whatsapp')}</label>
                <input
                  type="text"
                  value={editForm.whatsapp || ''}
                  onChange={(e) => setEditForm({ ...editForm, whatsapp: e.target.value })}
                  className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1">{t('register.bio')}</label>
                <textarea
                  rows={2}
                  value={editForm.bio || ''}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1">{t('register.cv_url')}</label>
                <input
                  type="url"
                  value={editForm.cvUrl || ''}
                  onChange={(e) => setEditForm({ ...editForm, cvUrl: e.target.value })}
                  className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1">{t('register.portfolio_url')}</label>
                <input
                  type="url"
                  value={editForm.portfolioUrl || ''}
                  onChange={(e) => setEditForm({ ...editForm, portfolioUrl: e.target.value })}
                  className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-sm font-semibold text-zinc-300"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 bg-brand-600 hover:bg-brand-500 rounded-xl text-sm font-bold text-white flex items-center gap-2"
              >
                <Save size={16} /> {t('save')}
              </button>
            </div>
          </form>
        )}

        {/* Course Categorized Tabs */}
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BookOpen size={22} className="text-brand-500" /> {t('profile.courses_tab')}
            </h2>

            <div className="flex flex-wrap gap-2 bg-zinc-900/80 p-1.5 rounded-2xl border border-zinc-800">
              {isSelf && (
                <button
                  onClick={() => setActiveTab('registered')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    activeTab === 'registered' ? 'bg-brand-600 text-white shadow-lg' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Clock size={14} /> Registered Courses ({dashboardData?.registeredCourses?.length || 0})
                </button>
              )}

              <button
                onClick={() => setActiveTab('in_progress')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'in_progress' ? 'bg-brand-600 text-white shadow-lg' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <PlayCircle size={14} /> Current Courses ({(dashboardData?.inProgressCourses?.length || 0) + (dashboardData?.upcomingCourses?.length || 0)})
              </button>

              <button
                onClick={() => setActiveTab('completed')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'completed' ? 'bg-brand-600 text-white shadow-lg' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <CheckCircle size={14} /> {t('profile.tab_completed')} ({dashboardData?.completedCourses?.length || 0})
              </button>

              <button
                onClick={() => setActiveTab('available')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'available' ? 'bg-brand-600 text-white shadow-lg' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <BookOpen size={14} /> {t('profile.tab_available')} ({dashboardData?.availableCourses?.length || 0})
              </button>
            </div>
          </div>

          {/* Tab Content Display */}
          {isSelf && activeTab === 'registered' && (
            <RenderCourseGrid
              courses={dashboardData?.registeredCourses || []}
              emptyMessage="No pending registered courses."
              badgeColor="bg-amber-500/10 border-amber-500/30 text-amber-400"
              statusLabel="REGISTERED / PENDING"
            />
          )}

          {activeTab === 'in_progress' && (
            <RenderCourseGrid
              courses={[...(dashboardData?.inProgressCourses || []), ...(dashboardData?.upcomingCourses || [])]}
              emptyMessage={t('profile.no_in_progress')}
              badgeColor="bg-purple-500/10 border-purple-500/30 text-purple-400"
              statusLabel="ENROLLED"
            />
          )}

          {activeTab === 'completed' && (
            <RenderCourseGrid
              courses={dashboardData?.completedCourses || []}
              emptyMessage={t('profile.no_completed')}
              badgeColor="bg-green-500/10 border-green-500/30 text-green-400"
              statusLabel="COMPLETED"
              showCertificate
            />
          )}

          {activeTab === 'available' && (
            <RenderCourseGrid
              courses={dashboardData?.availableCourses || []}
              emptyMessage={t('courses.no_courses')}
              badgeColor="bg-brand-500/10 border-brand-500/30 text-brand-400"
              statusLabel={t('courses.available')}
              isAvailableCatalog
            />
          )}
        </div>

        {/* User Workshops Section */}
        <div className="space-y-6 pt-6 border-t border-zinc-800">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles size={22} className="text-brand-500" /> {t('workshops.title')} ({ (dashboardData?.upcomingWorkshops?.length || 0) + (dashboardData?.inProgressWorkshops?.length || 0) + (dashboardData?.completedWorkshops?.length || 0) })
            </h2>
            <Link to="/workshops" className="text-xs text-brand-400 hover:underline font-bold">
              View All Workshops &rarr;
            </Link>
          </div>

          <RenderWorkshopGrid
            workshops={[
              ...(dashboardData?.upcomingWorkshops || []),
              ...(dashboardData?.inProgressWorkshops || []),
              ...(dashboardData?.completedWorkshops || []),
            ]}
          />
        </div>

        {/* Certificates Section */}
        {(dashboardData?.completedCourses?.some((c) => c.certificateCode)) && (
          <div className="space-y-6 pt-6 border-t border-zinc-800">
            <div className="flex items-center gap-2">
              <Award size={22} className="text-amber-400" />
              <h2 className="text-xl font-bold text-white">
                My Certificates ({dashboardData.completedCourses.filter((c) => c.certificateCode).length})
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {dashboardData.completedCourses
                .filter((c) => c.certificateCode)
                .map((course) => (
                  <Link
                    key={course.certificateCode}
                    to={`/verify-certificate?id=${course.certificateCode}`}
                    className="group bg-zinc-900 border border-zinc-800 hover:border-amber-500/40 rounded-2xl p-5 flex items-center gap-4 transition-all duration-200 shadow-lg hover:shadow-amber-900/20 hover:shadow-xl"
                  >
                    {/* Badge icon */}
                    <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Award size={28} className="text-amber-400" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold text-sm leading-tight line-clamp-2 group-hover:text-amber-300 transition-colors">
                        {course.title}
                      </p>
                      <p className="text-[11px] text-zinc-500 mt-1 font-mono truncate">
                        {course.certificateCode}
                      </p>
                      {course.completionDate && (
                        <p className="text-[10px] text-zinc-600 mt-0.5">
                          Completed: {course.completionDate}
                        </p>
                      )}
                    </div>

                    <div className="flex-shrink-0 text-zinc-600 group-hover:text-amber-400 transition-colors">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function RenderCourseGrid({
  courses,
  emptyMessage,
  badgeColor,
  statusLabel,
  showCertificate = false,
  isAvailableCatalog = false,
}: {
  courses: CourseSummary[]
  emptyMessage: string
  badgeColor: string
  statusLabel: string
  showCertificate?: boolean
  isAvailableCatalog?: boolean
}) {
  const { t } = useTranslation()

  if (courses.length === 0) {
    return (
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-12 text-center text-zinc-500 font-medium">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <div key={course.id} className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl overflow-hidden transition shadow-lg flex flex-col justify-between">
          <div>
            <div className="h-44 relative overflow-hidden bg-zinc-950">
              <img
                src={course.imageUrl || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80'}
                alt={course.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3">
                <span className={`px-3 py-1 border text-xs font-bold rounded-full backdrop-blur-md ${badgeColor}`}>
                  {statusLabel}
                </span>
              </div>
            </div>

            <div className="p-5 space-y-3">
              <h3 className="font-bold text-lg text-white line-clamp-1">{course.title}</h3>
              <p className="text-zinc-400 text-xs line-clamp-2 leading-relaxed">{course.description}</p>

              {course.groupName && (
                <div className="text-xs text-brand-400 font-semibold bg-brand-500/10 border border-brand-500/20 px-3 py-1.5 rounded-lg inline-block">
                  Group: {course.groupName} {course.schedule ? `(${course.schedule})` : ''}
                </div>
              )}

              {showCertificate && course.certificateCode && (
                <div className="text-xs text-green-400 font-semibold bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-lg flex items-center justify-between">
                  <span>Code: {course.certificateCode}</span>
                  <Link to={`/verify-certificate?id=${course.certificateCode}`} className="underline text-white hover:text-green-300">
                    Verify
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="p-5 pt-0 border-t border-zinc-800/60 mt-4 flex items-center justify-between text-xs text-zinc-400">
            <span>{course.duration}</span>
            <Link
              to={`/courses/${course.id}`}
              className="px-3.5 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl transition"
            >
              {isAvailableCatalog ? t('courses.enroll') : t('courses.view_details')}
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}

function RenderWorkshopGrid({ workshops }: { workshops: WorkshopSummary[] }) {
  if (workshops.length === 0) {
    return (
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 text-center text-zinc-500 text-xs">
        No workshop registrations found yet.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {workshops.map((w) => (
        <div key={w.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col justify-between">
          <div>
            <div className="h-36 relative overflow-hidden bg-zinc-950">
              <img src={w.imageUrl || 'https://images.unsplash.com/photo-1677442136019-21780efad99a'} alt={w.title} className="w-full h-full object-cover" />
              <div className="absolute top-2.5 right-2.5">
                <span className="px-2.5 py-0.5 bg-brand-500/20 border border-brand-500/30 text-brand-400 text-[10px] font-bold rounded-full backdrop-blur-md">
                  {w.status}
                </span>
              </div>
            </div>
            <div className="p-4 space-y-2">
              <h4 className="font-bold text-white text-sm line-clamp-1">{w.title}</h4>
              <p className="text-zinc-400 text-xs line-clamp-2">{w.description}</p>
              <div className="text-[11px] text-zinc-400 pt-1">
                <span>📅 Date: {w.workshopDate || 'TBA'}</span>
              </div>
            </div>
          </div>

          <div className="p-4 pt-0 flex justify-between items-center text-xs">
            <span className="text-zinc-500 text-[11px]">{w.duration || '3 Hours'}</span>
            <Link to={`/workshops/${w.id}`} className="px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl">
              View Details
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}
