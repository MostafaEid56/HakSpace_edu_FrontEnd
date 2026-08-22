import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../../api/client'
import Navbar from '../../components/Navbar'
import InstructorBadge from '../../components/InstructorBadge'
import {
  ArrowLeft, Star, Users, Clock, BookOpen,
  Linkedin, Github, Globe, Facebook, Twitter,
  GraduationCap, Award, Briefcase
} from 'lucide-react'

interface CourseItem {
  id: number
  title: string
  description: string
  imageUrl: string
  duration: string
  price: number
  status: string
  rating: number
  studentCount: number
}

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
  courses: CourseItem[]
}

export default function InstructorProfilePage() {
  const { username } = useParams<{ username: string }>()
  const navigate = useNavigate()

  const { data: instructor, isLoading, error } = useQuery<InstructorProfile>({
    queryKey: ['instructor', username],
    queryFn: async () => {
      const res = await apiClient.get(`/api/instructors/${username}`)
      return res.data
    },
    enabled: !!username,
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <Navbar />
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !instructor) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white pt-32 px-4 text-center">
        <Navbar />
        <div className="max-w-md mx-auto bg-zinc-900 border border-zinc-800 rounded-2xl p-8 space-y-4">
          <GraduationCap size={40} className="text-zinc-600 mx-auto" />
          <h2 className="text-2xl font-bold">Instructor Not Found</h2>
          <p className="text-zinc-400 text-sm">The instructor profile you're looking for doesn't exist.</p>
          <button onClick={() => navigate('/courses')} className="px-6 py-2 bg-brand-600 rounded-xl text-sm font-bold">
            Browse Courses
          </button>
        </div>
      </div>
    )
  }

  const socialLinks = [
    { url: instructor.linkedinUrl, icon: <Linkedin size={18} />, label: 'LinkedIn', color: 'hover:text-blue-400' },
    { url: instructor.githubUrl, icon: <Github size={18} />, label: 'GitHub', color: 'hover:text-white' },
    { url: instructor.facebookUrl, icon: <Facebook size={18} />, label: 'Facebook', color: 'hover:text-blue-500' },
    { url: instructor.twitterUrl, icon: <Twitter size={18} />, label: 'Twitter', color: 'hover:text-sky-400' },
    { url: instructor.websiteUrl, icon: <Globe size={18} />, label: 'Website', color: 'hover:text-brand-400' },
  ].filter(s => s.url)

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-24">
      <Navbar />

      {/* Ambient gradient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand-600/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 pt-28">
        {/* Back nav */}
        <button
          onClick={() => navigate(-1)}
          className="mb-8 text-sm font-semibold text-zinc-400 hover:text-white transition flex items-center gap-2 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          Back
        </button>

        {/* ── Hero Section ── */}
        <div className="relative rounded-3xl overflow-hidden border border-zinc-800/60 bg-gradient-to-br from-zinc-900/80 via-zinc-950/90 to-black/80 backdrop-blur-xl shadow-2xl mb-8">
          {/* Hero glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-600/10 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[60px] pointer-events-none" />

          <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center gap-8">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              {instructor.profileImageUrl ? (
                <img
                  src={instructor.profileImageUrl}
                  alt={instructor.fullName}
                  className="w-32 h-32 md:w-40 md:h-40 rounded-3xl object-cover border-2 border-brand-500/30 shadow-2xl shadow-brand-900/40"
                />
              ) : (
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-gradient-to-br from-brand-600/40 to-amber-600/20 border-2 border-brand-500/30 flex items-center justify-center shadow-2xl">
                  <span className="text-5xl font-black text-brand-300">
                    {instructor.fullName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              {/* Glow ring on avatar */}
              <div className="absolute inset-0 rounded-3xl ring-1 ring-brand-500/20 ring-offset-2 ring-offset-transparent" />
            </div>

            {/* Info */}
            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <InstructorBadge size="md" />
                {instructor.yearsExperience != null && instructor.yearsExperience > 0 && (
                  <span className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full text-[11px] font-bold">
                    <Award size={11} /> {instructor.yearsExperience} yrs experience
                  </span>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                {instructor.fullName}
              </h1>

              {instructor.jobTitle && (
                <p className="text-brand-400 font-semibold text-lg">{instructor.jobTitle}</p>
              )}

              {instructor.specialization && (
                <p className="text-zinc-400 text-sm flex items-center gap-2">
                  <Briefcase size={14} className="text-zinc-500" />
                  {instructor.specialization}
                </p>
              )}

              {instructor.shortBio && (
                <p className="text-zinc-300 text-sm leading-relaxed max-w-2xl">{instructor.shortBio}</p>
              )}

              {/* Social Links */}
              {socialLinks.length > 0 && (
                <div className="flex items-center gap-2 pt-1">
                  {socialLinks.map((s, i) => (
                    <a
                      key={i}
                      href={s.url!}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={s.label}
                      className={`p-2 rounded-xl bg-zinc-800/60 border border-zinc-700/50 text-zinc-400 ${s.color} transition hover:border-zinc-600 hover:bg-zinc-800`}
                    >
                      {s.icon}
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Stats pills */}
            <div className="flex md:flex-col gap-3 self-start md:self-center flex-wrap">
              <div className="px-4 py-3 bg-zinc-800/60 border border-zinc-700/50 rounded-2xl text-center min-w-[80px]">
                <p className="text-2xl font-extrabold text-white">{instructor.courses?.length || 0}</p>
                <p className="text-[11px] text-zinc-500 font-semibold uppercase tracking-wider">Courses</p>
              </div>
              {instructor.yearsExperience != null && instructor.yearsExperience > 0 && (
                <div className="px-4 py-3 bg-zinc-800/60 border border-zinc-700/50 rounded-2xl text-center min-w-[80px]">
                  <p className="text-2xl font-extrabold text-white">{instructor.yearsExperience}+</p>
                  <p className="text-[11px] text-zinc-500 font-semibold uppercase tracking-wider">Years</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Bio Section ── */}
        {instructor.bio && (
          <div className="bg-zinc-900/60 border border-zinc-800/60 backdrop-blur-sm rounded-3xl p-6 md:p-8 mb-8 shadow-xl">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <BookOpen size={18} className="text-brand-400" /> About {instructor.fullName}
            </h2>
            <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-line">{instructor.bio}</p>
          </div>
        )}

        {/* ── Courses Section ── */}
        <div>
          <h2 className="text-2xl font-extrabold text-white mb-6 flex items-center gap-3">
            <GraduationCap className="text-brand-400" size={22} />
            Courses by {instructor.fullName}
            <span className="ml-2 px-3 py-1 bg-brand-500/10 border border-brand-500/30 text-brand-400 rounded-full text-sm font-bold">
              {instructor.courses?.length || 0}
            </span>
          </h2>

          {!instructor.courses?.length ? (
            <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-12 text-center text-zinc-500">
              No courses published yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {instructor.courses.map(course => (
                <div
                  key={course.id}
                  onClick={() => navigate(`/courses/${course.id}`)}
                  className="group cursor-pointer bg-zinc-900/60 border border-zinc-800/60 hover:border-brand-500/40 rounded-2xl overflow-hidden shadow-xl transition-all duration-200 hover:shadow-brand-900/20 hover:-translate-y-0.5"
                >
                  {/* Course thumbnail */}
                  <div className="h-40 overflow-hidden relative bg-zinc-800">
                    {course.imageUrl ? (
                      <img
                        src={course.imageUrl}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-brand-900/40 to-zinc-800 flex items-center justify-center">
                        <GraduationCap size={40} className="text-brand-600/50" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                      course.status === 'ACTIVE'
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-zinc-800/80 border-zinc-700 text-zinc-400'
                    }`}>
                      {course.status}
                    </span>
                  </div>

                  {/* Course info */}
                  <div className="p-5 space-y-3">
                    <h3 className="font-bold text-white text-sm leading-snug group-hover:text-brand-400 transition line-clamp-2">
                      {course.title}
                    </h3>

                    {course.description && (
                      <p className="text-zinc-500 text-xs leading-relaxed line-clamp-2">{course.description}</p>
                    )}

                    <div className="flex items-center justify-between text-xs text-zinc-500 pt-2 border-t border-zinc-800">
                      <span className="flex items-center gap-1">
                        <Clock size={12} className="text-zinc-600" />
                        {course.duration || 'TBA'}
                      </span>
                      {course.rating != null && course.rating > 0 && (
                        <span className="flex items-center gap-1">
                          <Star size={12} className="text-yellow-400 fill-yellow-400" />
                          {course.rating.toFixed(1)}
                        </span>
                      )}
                      <span className="font-bold text-brand-400">
                        {course.price === 0 ? 'Free' : `${course.price} EGP`}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
