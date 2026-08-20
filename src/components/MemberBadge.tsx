import React from 'react'
import { Award, Shield, Crown } from 'lucide-react'

export type BadgeLevel = 'SILVER' | 'BRONZE' | 'GOLD'

interface MemberBadgeProps {
  badge?: BadgeLevel | string
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

export const MemberBadge: React.FC<MemberBadgeProps> = ({
  badge = 'SILVER',
  size = 'md',
  showLabel = true,
  className = '',
}) => {
  const normalizedBadge = (badge || 'SILVER').toUpperCase() as BadgeLevel

  const getBadgeStyle = () => {
    switch (normalizedBadge) {
      case 'GOLD':
        return {
          label: 'Gold',
          icon: Crown,
          container:
            'bg-gradient-to-r from-amber-500/20 via-yellow-400/20 to-amber-500/20 border-amber-400/50 text-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.25)]',
          iconColor: 'text-amber-400',
          badgeText: 'GOLD MEMBER',
        }
      case 'BRONZE':
        return {
          label: 'Bronze',
          icon: Shield,
          container:
            'bg-gradient-to-r from-amber-800/20 via-orange-600/20 to-amber-800/20 border-orange-500/50 text-amber-200 shadow-[0_0_15px_rgba(249,115,22,0.2)]',
          iconColor: 'text-orange-400',
          badgeText: 'BRONZE MEMBER',
        }
      case 'SILVER':
      default:
        return {
          label: 'Silver',
          icon: Award,
          container:
            'bg-gradient-to-r from-slate-400/20 via-zinc-300/20 to-slate-400/20 border-slate-300/50 text-slate-200 shadow-[0_0_15px_rgba(203,213,225,0.2)]',
          iconColor: 'text-slate-300',
          badgeText: 'SILVER MEMBER',
        }
    }
  }

  const config = getBadgeStyle()
  const IconComponent = config.icon

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3.5 py-1.5 text-sm gap-2',
  }

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  }

  return (
    <span
      className={`inline-flex items-center font-extrabold rounded-full border backdrop-blur-md transition-all duration-300 hover:scale-105 ${sizeClasses[size]} ${config.container} ${className}`}
    >
      <IconComponent size={iconSizes[size]} className={config.iconColor} />
      {showLabel && <span>{config.label}</span>}
    </span>
  )
}
