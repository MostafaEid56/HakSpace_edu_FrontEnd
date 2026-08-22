import { GraduationCap } from 'lucide-react'

interface InstructorBadgeProps {
  size?: 'sm' | 'md' | 'lg'
}

export default function InstructorBadge({ size = 'md' }: InstructorBadgeProps) {
  const styles = {
    sm: 'px-2 py-0.5 text-[10px] gap-0.5',
    md: 'px-2.5 py-1 text-[11px] gap-1',
    lg: 'px-3 py-1.5 text-xs gap-1.5',
  }

  const iconSizes = { sm: 10, md: 12, lg: 14 }

  return (
    <span
      className={`inline-flex items-center font-black uppercase tracking-widest rounded-full border transition
        bg-gradient-to-r from-brand-600/20 to-amber-500/10
        border-brand-500/40
        text-brand-300
        shadow-sm hover:shadow-brand-500/20 hover:border-brand-400/60
        ${styles[size]}`}
    >
      <GraduationCap size={iconSizes[size]} className="text-brand-400" />
      INSTRUCTOR
    </span>
  )
}
