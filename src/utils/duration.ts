/**
 * Utility to convert course duration from weeks to months, or keep existing month formatting.
 * Assumes 4 weeks = 1 month.
 */
export function formatDuration(duration: string | undefined | null, lang: string): string {
  if (!duration) return ''

  // Regex to match a number and any form of week/weeks (English or Arabic)
  const weeksRegex = /(\d+(?:\.\d+)?)\s*(?:[wW]eeks?|[wW]k|أسبوع|أسبوعا|أسبوعاً)/i
  const match = duration.match(weeksRegex)

  if (match) {
    const weeks = parseFloat(match[1])
    const months = weeks / 4
    // Format the number to remove unnecessary decimals (e.g. 3.0 -> 3)
    const formattedMonths = Number(months.toFixed(1)).toString()

    if (lang === 'ar') {
      if (months === 1) return 'شهر واحد'
      if (months === 2) return 'شهران'
      if (months > 2 && months <= 10) return `${formattedMonths} أشهر`
      return `${formattedMonths} شهر`
    } else {
      return months === 1 ? '1 Month' : `${formattedMonths} Months`
    }
  }

  // Check if it already contains months
  const monthsRegex = /(\d+(?:\.\d+)?)\s*(?:[mM]onths?|[mM]o|شهر|أشهر)/i
  const monthMatch = duration.match(monthsRegex)
  if (monthMatch) {
    const months = parseFloat(monthMatch[1])
    const formattedMonths = Number(months.toFixed(1)).toString()

    if (lang === 'ar') {
      if (months === 1) return 'شهر واحد'
      if (months === 2) return 'شهران'
      if (months > 2 && months <= 10) return `${formattedMonths} أشهر`
      return `${formattedMonths} شهر`
    } else {
      return months === 1 ? '1 Month' : `${formattedMonths} Months`
    }
  }

  return duration
}

/**
 * Utility to format installment frequency and duration into localized text.
 */
export function formatFrequency(freq: string | undefined | null, lang: string): string {
  if (!freq) return lang === 'ar' ? 'شهرياً' : 'Monthly'

  const clean = freq.trim()
  const isArabic = lang === 'ar'

  if (/^monthly$/i.test(clean)) {
    return isArabic ? 'شهرياً' : 'Monthly'
  }
  if (/^weekly$/i.test(clean)) {
    return isArabic ? 'أسبوعياً' : 'Weekly'
  }

  // Check if freq is pure number or number + unit
  const numMatch = clean.match(/(\d+(?:\.\d+)?)\s*(.*)/)
  if (numMatch) {
    const num = parseFloat(numMatch[1])
    const unit = numMatch[2].toLowerCase()

    if (!unit || unit.includes('month') || unit.includes('شهر')) {
      if (isArabic) {
        if (num === 1) return 'شهر واحد'
        if (num === 2) return 'شهران'
        if (num > 2 && num <= 10) return `${num} أشهر`
        return `${num} شهر`
      } else {
        return num === 1 ? '1 Month' : `${num} Months`
      }
    }
  }

  return clean
}
