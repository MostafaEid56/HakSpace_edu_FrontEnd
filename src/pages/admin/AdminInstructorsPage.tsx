import { useState } from 'react'
import { apiClient } from '../../api/client'
import { toast } from 'react-toastify'
import { GraduationCap, Plus, Edit2, Trash2, X, Linkedin, Github, Globe, ExternalLink } from 'lucide-react'
import { GENERAL_FIELDS, SPECIALIZATION_HIERARCHY } from '../../constants/specializations'

interface InstructorProfile {
  id: number
  userId: number
  fullName: string
  username: string
  email: string
  jobTitle?: string
  shortBio?: string
  bio?: string
  specialization?: string
  yearsExperience?: number
  profileImageUrl?: string
  linkedinUrl?: string
  githubUrl?: string
  facebookUrl?: string
  twitterUrl?: string
  websiteUrl?: string
  courses: { id: number; title: string; status: string }[]
}

interface User {
  id: number
  fullName: string
  username: string
  email: string
  isInstructor?: boolean
}

export default function AdminInstructorsPage() {
  const [instructors, setInstructors] = useState<InstructorProfile[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingInstructor, setEditingInstructor] = useState<InstructorProfile | null>(null)
  const [isPromoteOpen, setIsPromoteOpen] = useState(false)

  // Promote form
  const [selectedUserId, setSelectedUserId] = useState<number | ''>('')

  // Profile form
  const [jobTitle, setJobTitle] = useState('')
  const [shortBio, setShortBio] = useState('')
  const [bio, setBio] = useState('')
  const [generalSpecialization, setGeneralSpecialization] = useState('')
  const [specificSpecialization, setSpecificSpecialization] = useState('')
  const [yearsExperience, setYearsExperience] = useState(0)
  const [profileImageUrl, setProfileImageUrl] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [githubUrl, setGithubUrl] = useState('')
  const [facebookUrl, setFacebookUrl] = useState('')
  const [twitterUrl, setTwitterUrl] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchInstructors()
    fetchUsers()
  }, [])

  const fetchInstructors = async () => {
    setLoading(true)
    try {
      const res = await apiClient.get<InstructorProfile[]>('/api/admin/instructors')
      setInstructors(res.data)
    } catch {
      toast.error('Failed to load instructors.')
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const res = await apiClient.get<User[]>('/api/admin/community')
      setUsers(res.data)
    } catch { /* ignore */ }
  }

  const parseSpecialization = (spec?: string) => {
    if (!spec) return { general: '', specific: '' }
    const parts = spec.split(' → ')
    if (parts.length === 2) {
      return { general: parts[0].trim(), specific: parts[1].trim() }
    }
    return { general: '', specific: spec }
  }

  const openEditModal = (instructor: InstructorProfile) => {
    setEditingInstructor(instructor)
    setJobTitle(instructor.jobTitle || '')
    setShortBio(instructor.shortBio || '')
    setBio(instructor.bio || '')
    const parsed = parseSpecialization(instructor.specialization)
    setGeneralSpecialization(parsed.general)
    setSpecificSpecialization(parsed.specific)
    setYearsExperience(instructor.yearsExperience || 0)
    setProfileImageUrl(instructor.profileImageUrl || '')
    setLinkedinUrl(instructor.linkedinUrl || '')
    setGithubUrl(instructor.githubUrl || '')
    setFacebookUrl(instructor.facebookUrl || '')
    setTwitterUrl(instructor.twitterUrl || '')
    setWebsiteUrl(instructor.websiteUrl || '')
    setIsModalOpen(true)
  }

  const getCombinedSpecialization = () => {
    if (!generalSpecialization && !specificSpecialization) return ''
    if (!generalSpecialization) return specificSpecialization
    if (!specificSpecialization) return generalSpecialization
    return `${generalSpecialization} → ${specificSpecialization}`
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingInstructor) return
    setSaving(true)
    try {
      await apiClient.put(`/api/admin/instructors/${editingInstructor.userId}`, {
        jobTitle, shortBio, bio,
        specialization: getCombinedSpecialization(),
        yearsExperience,
        profileImageUrl, linkedinUrl, githubUrl, facebookUrl, twitterUrl, websiteUrl
      })
      toast.success('Instructor profile updated!')
      setIsModalOpen(false)
      fetchInstructors()
    } catch {
      toast.error('Failed to update instructor profile.')
    } finally {
      setSaving(false)
    }
  }

  const handlePromote = async () => {
    if (!selectedUserId) return
    setSaving(true)
    try {
      await apiClient.post(`/api/admin/instructors/${selectedUserId}/promote`, {
        jobTitle, shortBio, bio,
        specialization: getCombinedSpecialization(),
        yearsExperience,
        profileImageUrl, linkedinUrl, githubUrl, facebookUrl, twitterUrl, websiteUrl
      })
      toast.success('User promoted to Instructor!')
      setIsPromoteOpen(false)
      resetForm()
      fetchInstructors()
    } catch {
      toast.error('Failed to promote user.')
    } finally {
      setSaving(false)
    }
  }

  const handleDemote = async (userId: number, name: string) => {
    if (!window.confirm(`Remove instructor status from "${name}"?`)) return
    try {
      await apiClient.delete(`/api/admin/instructors/${userId}/demote`)
      toast.success('Instructor status removed.')
      fetchInstructors()
    } catch {
      toast.error('Failed to demote instructor.')
    }
  }

  const resetForm = () => {
    setJobTitle(''); setShortBio(''); setBio('')
    setGeneralSpecialization(''); setSpecificSpecialization('')
    setYearsExperience(0); setProfileImageUrl(''); setLinkedinUrl('')
    setGithubUrl(''); setFacebookUrl(''); setTwitterUrl(''); setWebsiteUrl('')
    setSelectedUserId('')
  }

  const nonInstructorUsers = users.filter(u => !instructors.some(i => i.userId === u.id))

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <GraduationCap className="text-brand-400" size={28} />
            Instructors
          </h1>
          <p className="text-zinc-400 mt-1 text-sm">Promote users to instructors and manage their profiles.</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsPromoteOpen(true) }}
          className="px-5 py-3 bg-brand-600 hover:bg-brand-500 rounded-xl text-sm font-bold text-white shadow-lg transition flex items-center gap-2"
        >
          <Plus size={18} /> Promote User to Instructor
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-16">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : instructors.length === 0 ? (
        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-12 text-center text-zinc-500 font-medium">
          No instructors yet. Promote a user to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {instructors.map(inst => (
            <div key={inst.id} className="bg-zinc-950 border border-zinc-800 hover:border-brand-500/40 rounded-2xl p-6 shadow-xl flex flex-col gap-4 transition group">
              {/* Header */}
              <div className="flex items-start gap-4">
                <div className="relative flex-shrink-0">
                  {inst.profileImageUrl ? (
                    <img src={inst.profileImageUrl} alt={inst.fullName} className="w-16 h-16 rounded-2xl object-cover border-2 border-zinc-700 group-hover:border-brand-500/60 transition" />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-600/30 to-brand-800/30 border-2 border-brand-500/30 flex items-center justify-center text-2xl font-black text-brand-400">
                      {inst.fullName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="absolute -bottom-1.5 -right-1.5 flex items-center gap-0.5 px-1.5 py-0.5 bg-brand-600 rounded-full text-[9px] font-black text-white tracking-wider border border-brand-400/40">
                    ✓ INST
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white text-base truncate">{inst.fullName}</h3>
                  <p className="text-xs text-zinc-500">@{inst.username}</p>
                  {inst.jobTitle && <p className="text-xs text-brand-400 font-semibold mt-0.5">{inst.jobTitle}</p>}
                </div>

                <div className="flex items-center gap-1">
                  <button onClick={() => openEditModal(inst)} className="p-2 text-zinc-400 hover:text-white transition" title="Edit Profile">
                    <Edit2 size={15} />
                  </button>
                  <button onClick={() => handleDemote(inst.userId, inst.fullName)} className="p-2 text-red-400 hover:text-red-300 transition" title="Remove Instructor Status">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Short bio */}
              {inst.shortBio && (
                <p className="text-zinc-400 text-xs leading-relaxed line-clamp-2">{inst.shortBio}</p>
              )}

              {/* Stats & Specialization */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                {inst.specialization && (
                  <span className="col-span-2 px-2.5 py-1 bg-brand-500/10 border border-brand-500/20 text-brand-400 rounded-lg font-semibold text-[11px]">
                    {inst.specialization}
                  </span>
                )}
                <span className="px-2 py-1 bg-zinc-900 rounded-lg text-zinc-400">
                  📚 {inst.courses?.length || 0} courses
                </span>
                {inst.yearsExperience != null && inst.yearsExperience > 0 && (
                  <span className="px-2 py-1 bg-zinc-900 rounded-lg text-zinc-400">
                    🎓 {inst.yearsExperience} yrs exp
                  </span>
                )}
              </div>

              {/* Social links */}
              <div className="flex items-center gap-2 pt-3 border-t border-zinc-900">
                {inst.linkedinUrl && <a href={inst.linkedinUrl} target="_blank" rel="noreferrer" className="p-1.5 text-zinc-500 hover:text-blue-400 transition"><Linkedin size={15} /></a>}
                {inst.githubUrl && <a href={inst.githubUrl} target="_blank" rel="noreferrer" className="p-1.5 text-zinc-500 hover:text-white transition"><Github size={15} /></a>}
                {inst.websiteUrl && <a href={inst.websiteUrl} target="_blank" rel="noreferrer" className="p-1.5 text-zinc-500 hover:text-brand-400 transition"><Globe size={15} /></a>}
                <a
                  href={`/instructors/${inst.username}`}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-brand-600/20 hover:bg-brand-600/30 border border-brand-500/30 text-brand-400 rounded-xl text-[11px] font-bold transition"
                >
                  <ExternalLink size={12} /> View Profile
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Promote Modal */}
      {isPromoteOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 md:p-8 max-w-xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Promote User to Instructor</h2>
              <button onClick={() => setIsPromoteOpen(false)} className="text-zinc-400 hover:text-white"><X size={20} /></button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-zinc-400 mb-1">Select User *</label>
                <select
                  value={selectedUserId}
                  onChange={e => setSelectedUserId(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-sm"
                >
                  <option value="">-- Select a user to promote --</option>
                  {nonInstructorUsers.map(u => (
                    <option key={u.id} value={u.id}>{u.fullName} (@{u.username})</option>
                  ))}
                </select>
              </div>
              <ProfileFields
                jobTitle={jobTitle} setJobTitle={setJobTitle}
                shortBio={shortBio} setShortBio={setShortBio}
                bio={bio} setBio={setBio}
                generalSpecialization={generalSpecialization} setGeneralSpecialization={setGeneralSpecialization}
                specificSpecialization={specificSpecialization} setSpecificSpecialization={setSpecificSpecialization}
                yearsExperience={yearsExperience} setYearsExperience={setYearsExperience}
                profileImageUrl={profileImageUrl} setProfileImageUrl={setProfileImageUrl}
                linkedinUrl={linkedinUrl} setLinkedinUrl={setLinkedinUrl}
                githubUrl={githubUrl} setGithubUrl={setGithubUrl}
                facebookUrl={facebookUrl} setFacebookUrl={setFacebookUrl}
                twitterUrl={twitterUrl} setTwitterUrl={setTwitterUrl}
                websiteUrl={websiteUrl} setWebsiteUrl={setWebsiteUrl}
              />
              <div className="flex justify-end gap-3 pt-4">
                <button onClick={() => setIsPromoteOpen(false)} className="px-4 py-2 bg-zinc-800 rounded-xl font-bold text-zinc-300 text-sm">Cancel</button>
                <button onClick={handlePromote} disabled={!selectedUserId || saving} className="px-5 py-2 bg-brand-600 hover:bg-brand-500 rounded-xl font-bold text-white text-sm disabled:opacity-50">
                  {saving ? 'Promoting...' : 'Promote to Instructor'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {isModalOpen && editingInstructor && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 md:p-8 max-w-xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Edit Instructor: {editingInstructor.fullName}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <ProfileFields
                jobTitle={jobTitle} setJobTitle={setJobTitle}
                shortBio={shortBio} setShortBio={setShortBio}
                bio={bio} setBio={setBio}
                generalSpecialization={generalSpecialization} setGeneralSpecialization={setGeneralSpecialization}
                specificSpecialization={specificSpecialization} setSpecificSpecialization={setSpecificSpecialization}
                yearsExperience={yearsExperience} setYearsExperience={setYearsExperience}
                profileImageUrl={profileImageUrl} setProfileImageUrl={setProfileImageUrl}
                linkedinUrl={linkedinUrl} setLinkedinUrl={setLinkedinUrl}
                githubUrl={githubUrl} setGithubUrl={setGithubUrl}
                facebookUrl={facebookUrl} setFacebookUrl={setFacebookUrl}
                twitterUrl={twitterUrl} setTwitterUrl={setTwitterUrl}
                websiteUrl={websiteUrl} setWebsiteUrl={setWebsiteUrl}
              />
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-zinc-800 rounded-xl font-bold text-zinc-300 text-sm">Cancel</button>
                <button type="submit" disabled={saving} className="px-5 py-2 bg-brand-600 hover:bg-brand-500 rounded-xl font-bold text-white text-sm">
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

/* Shared form fields component with two-level dependent specialization dropdowns */
function ProfileFields({
  jobTitle, setJobTitle, shortBio, setShortBio, bio, setBio,
  generalSpecialization, setGeneralSpecialization,
  specificSpecialization, setSpecificSpecialization,
  yearsExperience, setYearsExperience,
  profileImageUrl, setProfileImageUrl, linkedinUrl, setLinkedinUrl,
  githubUrl, setGithubUrl, facebookUrl, setFacebookUrl,
  twitterUrl, setTwitterUrl, websiteUrl, setWebsiteUrl
}: any) {
  const input = "w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-sm"
  const label = "block font-semibold text-zinc-400 mb-1"

  const availableSpecifics = generalSpecialization
    ? SPECIALIZATION_HIERARCHY[generalSpecialization] || ['Other']
    : []

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={label}>Job Title</label>
          <input className={input} placeholder="e.g. Java & Spring Boot Instructor" value={jobTitle} onChange={e => setJobTitle(e.target.value)} />
        </div>
        <div>
          <label className={label}>Years of Experience</label>
          <input className={input} type="number" min="0" value={yearsExperience} onChange={e => setYearsExperience(Number(e.target.value))} />
        </div>
      </div>

      {/* Two-level dependent specialization dropdowns */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={label}>General Specialization</label>
          <select
            className={input}
            value={generalSpecialization}
            onChange={e => {
              setGeneralSpecialization(e.target.value)
              setSpecificSpecialization('')
            }}
          >
            <option value="">[ Select General Specialization ▼ ]</option>
            {GENERAL_FIELDS.map(field => (
              <option key={field} value={field}>{field}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={label}>Specific Specialization</label>
          <select
            className={`${input} ${!generalSpecialization ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!generalSpecialization}
            value={specificSpecialization}
            onChange={e => setSpecificSpecialization(e.target.value)}
          >
            <option value="">[ Select Specific Specialization ▼ ]</option>
            {availableSpecifics.map(spec => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={label}>Short Bio (Max 500 chars)</label>
        <textarea className={`${input} resize-none`} rows={2} placeholder="Brief professional summary..." value={shortBio} onChange={e => setShortBio(e.target.value)} maxLength={500} />
      </div>
      <div>
        <label className={label}>Detailed Bio</label>
        <textarea className={`${input} resize-none`} rows={3} placeholder="Full background and teaching philosophy..." value={bio} onChange={e => setBio(e.target.value)} />
      </div>
      <div>
        <label className={label}>Profile Image URL</label>
        <input className={input} type="url" placeholder="https://..." value={profileImageUrl} onChange={e => setProfileImageUrl(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={label}>LinkedIn URL</label>
          <input className={input} type="url" placeholder="https://linkedin.com/in/..." value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)} />
        </div>
        <div>
          <label className={label}>GitHub URL</label>
          <input className={input} type="url" placeholder="https://github.com/..." value={githubUrl} onChange={e => setGithubUrl(e.target.value)} />
        </div>
        <div>
          <label className={label}>Facebook URL</label>
          <input className={input} type="url" placeholder="https://facebook.com/..." value={facebookUrl} onChange={e => setFacebookUrl(e.target.value)} />
        </div>
        <div>
          <label className={label}>Website / Twitter URL</label>
          <input className={input} type="url" placeholder="https://..." value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)} />
        </div>
      </div>
    </div>
  )
}
