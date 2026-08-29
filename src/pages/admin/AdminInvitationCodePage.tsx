import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { Key, RefreshCw, CheckCircle2, Copy, ShieldCheck } from 'lucide-react'
import { apiClient } from '../../api/client'

interface InvitationCodeInfo {
  id: number
  code: String
  status: string
  createdAt: string
}

export default function AdminInvitationCodePage() {
  const { t } = useTranslation()
  const [codeInfo, setCodeInfo] = useState<InvitationCodeInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchActiveCode()
  }, [])

  const fetchActiveCode = async () => {
    setLoading(true)
    try {
      const resp = await apiClient.get<InvitationCodeInfo>('/api/admin/invitation-code')
      setCodeInfo(resp.data)
    } catch (err) {
      console.error(err)
      toast.error('Failed to load active invitation code.')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateNewCode = async () => {
    const confirmed = window.confirm(
      t('invitation_code.confirm_generate', 'Generating a new invitation code will immediately invalidate the current code. Do you want to continue?')
    )
    if (!confirmed) return

    setGenerating(true)
    try {
      const resp = await apiClient.post<InvitationCodeInfo>('/api/admin/invitation-code/generate')
      setCodeInfo(resp.data)
      toast.success(t('invitation_code.generated_success', 'New invitation code generated successfully!'))
    } catch (err) {
      console.error(err)
      toast.error('Failed to generate new invitation code.')
    } finally {
      setGenerating(false)
    }
  }

  const handleCopy = () => {
    if (!codeInfo) return
    navigator.clipboard.writeText(String(codeInfo.code))
    setCopied(true)
    toast.info('Invitation code copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <Key className="text-brand-500" size={28} />
          {t('invitation_code.title')}
        </h1>
        <p className="text-zinc-400 mt-1 text-sm">{t('invitation_code.subtitle')}</p>
      </div>

      {/* Main Card */}
      <div className="max-w-2xl bg-zinc-950 border border-zinc-900 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : codeInfo ? (
          <>
            <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                {t('invitation_code.status')}
              </span>
              <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-extrabold rounded-full flex items-center gap-1.5">
                <CheckCircle2 size={14} />
                {t('invitation_code.active')}
              </span>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                {t('invitation_code.current_code')}
              </span>
              <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-2xl p-4 md:p-6">
                <span className="text-3xl md:text-4xl font-extrabold font-mono tracking-widest text-brand-400 select-all">
                  {codeInfo.code}
                </span>
                <button
                  onClick={handleCopy}
                  className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-bold transition flex items-center gap-2"
                >
                  <Copy size={16} />
                  {copied ? 'Copied!' : 'Copy Code'}
                </button>
              </div>
            </div>

            <div className="text-xs text-zinc-500 flex items-center gap-2 pt-2">
              <ShieldCheck size={16} className="text-brand-500" />
              <span>Only one code is active at any time. Generating a new code immediately invalidates this code.</span>
            </div>

            <div className="pt-4 border-t border-zinc-900">
              <button
                onClick={handleGenerateNewCode}
                disabled={generating}
                className="w-full py-4 bg-brand-600 hover:bg-brand-500 active:scale-98 text-white font-extrabold rounded-2xl transition shadow-xl shadow-brand-900/30 flex items-center justify-center gap-2 text-sm"
              >
                {generating ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <RefreshCw size={18} />
                    {t('invitation_code.generate_btn')}
                  </>
                )}
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}
