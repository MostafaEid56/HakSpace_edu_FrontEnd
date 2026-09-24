import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { Search, Filter, MessageSquare, FileText, Globe, AlertTriangle, Trash2, X } from 'lucide-react'
import { apiClient } from '../../api/client'
import { MemberBadge, BadgeLevel } from '../../components/MemberBadge'
import InstructorBadge from '../../components/InstructorBadge'

interface MemberCourse {
  courseId: number
  courseTitle: string
  groupName?: string
  status: string // IN_PROGRESS, UPCOMING, COMPLETED
  certificateCode?: string
}

interface CommunityMember {
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
  joinedDate: string
  badge?: BadgeLevel
  isInstructor?: boolean
  courses: MemberCourse[]
}

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

export default function AdminCommunityPage() {
  const { t } = useTranslation()
  const [members, setMembers] = useState<CommunityMember[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSpecialization, setSelectedSpecialization] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMember, setSelectedMember] = useState<CommunityMember | null>(null)

  // Remove user confirmation modal state
  const [removeTarget, setRemoveTarget] = useState<CommunityMember | null>(null)
  const [removing, setRemoving] = useState(false)

  useEffect(() => {
    fetchCommunityMembers()
  }, [selectedSpecialization, searchQuery])

  const fetchCommunityMembers = async () => {
    setLoading(true)
    try {
      const resp = await apiClient.get<CommunityMember[]>('/api/admin/community', {
        params: {
          specialization: selectedSpecialization || undefined,
          query: searchQuery || undefined
        }
      })
      setMembers(resp.data)
    } catch (err: any) {
      console.error(err)
      toast.error(t('courses.error'))
    } finally {
      setLoading(false)
    }
  }

  const handleBadgeChange = async (userId: number, newBadge: BadgeLevel) => {
    try {
      await apiClient.put(`/api/admin/community/${userId}/badge`, { badge: newBadge })
      toast.success(t('added_success', 'Badge updated successfully!'))
      setMembers((prev) =>
        prev.map((m) => (m.id === userId ? { ...m, badge: newBadge } : m))
      )
    } catch (err: any) {
      console.error(err)
      toast.error(t('error_update', 'Failed to update badge'))
    }
  }

  const handleRemoveUser = async () => {
    if (!removeTarget) return
    setRemoving(true)
    try {
      await apiClient.delete(`/api/admin/community/users/${removeTarget.id}`)
      toast.success(t('admin_community.remove_user_success'))
      setMembers((prev) => prev.filter((m) => m.id !== removeTarget.id))
      setRemoveTarget(null)
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || t('admin_community.remove_user_error')
      toast.error(errMsg)
    } finally {
      setRemoving(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* ── Remove User Confirmation Modal ─────────────────────────────── */}
      {removeTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => !removing && setRemoveTarget(null)}
          />

          {/* Modal */}
          <div className="relative z-10 w-full max-w-md bg-zinc-950 border border-red-500/30 rounded-2xl shadow-2xl shadow-red-900/20 p-6 space-y-5">
            {/* Close button */}
            <button
              onClick={() => !removing && setRemoveTarget(null)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white transition"
              disabled={removing}
            >
              <X size={18} />
            </button>

            {/* Icon + Title */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="text-red-400" size={22} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">{t('admin_community.remove_user_confirm_title')}</h2>
                <p className="text-xs text-zinc-500 mt-0.5">{t('admin_community.remove_user_confirm_message')}</p>
              </div>
            </div>

            {/* User Info Card */}
            <div className="flex items-center gap-3 p-3 bg-zinc-900 border border-zinc-800 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-red-600/20 border border-red-500/30 text-red-400 font-extrabold flex items-center justify-center text-sm">
                {removeTarget.fullName?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-white text-sm truncate">{removeTarget.fullName}</p>
                <p className="text-xs text-zinc-500 truncate">@{removeTarget.username} · {removeTarget.email}</p>
              </div>
            </div>

            {/* Warning */}
            <div className="flex items-start gap-2 p-3 bg-red-500/5 border border-red-500/20 rounded-xl text-xs text-red-300 leading-relaxed">
              <AlertTriangle size={14} className="flex-shrink-0 mt-0.5 text-red-400" />
              <span>{t('admin_community.remove_user_confirm_warning')}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-1">
              <button
                id="cancel-remove-user-btn"
                onClick={() => setRemoveTarget(null)}
                disabled={removing}
                className="flex-1 px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white text-sm font-bold rounded-xl transition disabled:opacity-50"
              >
                {t('admin_community.cancel')}
              </button>
              <button
                id="confirm-remove-user-btn"
                onClick={handleRemoveUser}
                disabled={removing}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {removing ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Trash2 size={14} />
                )}
                {removing ? '...' : t('admin_community.remove_user_btn')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">{t('admin_community.title')}</h1>
        <p className="text-zinc-400 mt-1 text-sm">{t('admin_community.subtitle')}</p>
      </div>

      {/* Controls: Search + Specialization Filter */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('admin_community.search_placeholder')}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Filter size={16} className="text-brand-500" />
            <span className="font-bold">{t('admin_community.total_members')}:</span>
            <span className="px-2.5 py-1 bg-brand-500/10 border border-brand-500/30 text-brand-400 rounded-lg font-bold">
              {members.length}
            </span>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-zinc-900">
          <button
            onClick={() => setSelectedSpecialization('')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              selectedSpecialization === '' ? 'bg-brand-600 text-white shadow-md' : 'bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            {t('admin_community.all_specializations')}
          </button>
          {SPECIALIZATIONS.map((spec) => (
            <button
              key={spec}
              onClick={() => setSelectedSpecialization(spec === selectedSpecialization ? '' : spec)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                selectedSpecialization === spec ? 'bg-brand-600 text-white shadow-md' : 'bg-zinc-900 text-zinc-400 hover:text-white'
              }`}
            >
              {spec}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Community Members */}
      {loading ? (
        <div className="text-center py-16">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : members.length === 0 ? (
        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-12 text-center text-zinc-500 font-medium">
          {t('admin_community.no_members')}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((member) => (
            <div key={member.id} className="bg-zinc-950 border border-zinc-900 hover:border-zinc-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between transition group">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-brand-600/20 border border-brand-500/40 text-brand-400 font-extrabold flex items-center justify-center text-lg">
                      {member.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base group-hover:text-brand-400 transition">{member.fullName}</h3>
                      <p className="text-xs text-zinc-500">@{member.username}</p>
                    </div>
                  </div>

                  {member.specialization && (
                    <span className="px-2.5 py-1 bg-brand-500/10 border border-brand-500/30 text-brand-400 text-[11px] font-bold rounded-full">
                      {member.specialization}
                    </span>
                  )}
                </div>

                {/* Role / Instructor status toggle */}
                <div className="flex items-center justify-between gap-2 p-2.5 bg-zinc-900/80 border border-zinc-800 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase">Role:</span>
                    {member.isInstructor ? (
                      <InstructorBadge size="sm" />
                    ) : (
                      <span className="text-[11px] font-bold text-zinc-400 px-2 py-0.5 bg-zinc-800 rounded-full border border-zinc-700">Regular User</span>
                    )}
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        if (member.isInstructor) {
                          await apiClient.delete(`/api/admin/instructors/${member.id}/demote`)
                          toast.success('Removed instructor role')
                        } else {
                          await apiClient.post(`/api/admin/instructors/${member.id}/promote`)
                          toast.success('Promoted user to Instructor!')
                        }
                        fetchCommunityMembers()
                      } catch {
                        toast.error('Failed to change role')
                      }
                    }}
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition ${
                      member.isInstructor
                        ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
                        : 'bg-brand-500/10 border-brand-500/30 text-brand-300 hover:bg-brand-500/20'
                    }`}
                  >
                    {member.isInstructor ? 'Demote' : 'Promote to Instructor'}
                  </button>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1 border-t border-zinc-900/80">
                  <div className="flex items-center gap-2">
                    <MemberBadge badge={member.badge || 'SILVER'} size="sm" />
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase">Badge:</span>
                    <select
                      value={member.badge || 'SILVER'}
                      onChange={(e) => handleBadgeChange(member.id, e.target.value as BadgeLevel)}
                      className="bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-bold text-white px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    >
                      <option value="SILVER">🥈 Silver</option>
                      <option value="BRONZE">🥉 Bronze</option>
                      <option value="GOLD">🥇 Gold</option>
                    </select>
                  </div>
                </div>

                <p className="text-zinc-400 text-xs line-clamp-2 leading-relaxed">{member.bio || 'No bio provided.'}</p>

                {/* Courses badge summary */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    {t('admin_community.courses_count')}: {member.courses.length}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {member.courses.map((mc, idx) => (
                      <span
                        key={idx}
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                          mc.status === 'COMPLETED'
                            ? 'bg-green-500/10 border-green-500/30 text-green-400'
                            : mc.status === 'IN_PROGRESS'
                            ? 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                            : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                        }`}
                      >
                        {mc.courseTitle}
                      </span>
                    ))}
                    {member.courses.length === 0 && (
                      <span className="text-[10px] text-zinc-600 italic">No course enrollments</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-6 pt-4 border-t border-zinc-900 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {member.cvUrl && (
                    <a
                      href={member.cvUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 bg-zinc-900 hover:bg-zinc-800 text-brand-400 rounded-lg transition"
                      title="View CV"
                    >
                      <FileText size={16} />
                    </a>
                  )}
                  {member.portfolioUrl && (
                    <a
                      href={member.portfolioUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-lg transition"
                      title="View Portfolio"
                    >
                      <Globe size={16} />
                    </a>
                  )}

                  {/* Remove User button */}
                  <button
                    id={`remove-user-btn-${member.id}`}
                    onClick={() => setRemoveTarget(member)}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400 rounded-lg transition"
                    title={t('admin_community.remove_user')}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <a
                  href={`https://wa.me/${member.whatsapp || member.phone}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 text-green-400 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <MessageSquare size={14} /> {t('admin_community.whatsapp_contact')}
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

