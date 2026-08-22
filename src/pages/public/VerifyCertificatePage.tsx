import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { apiClient } from '../../api/client'
import { toast } from 'react-toastify'
import { Award, CheckCircle, Search, ArrowLeft, Printer, ShieldCheck, ShieldAlert } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { formatDuration } from '../../utils/duration'
import Navbar from '../../components/Navbar'
import logoImg from '../../assets/Logo.jpg'

interface Certificate {
  certificateId: string
  studentName: string
  courseName: string
  instructorName?: string
  courseDuration?: string
  startDate?: string
  issueDate: string
}

interface BlockedCertificate {
  blocked: true
  reason: string
}

export default function VerifyCertificatePage() {
  const { t, i18n } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const [inputVal, setInputVal] = useState('')
  const [loading, setLoading] = useState(false)
  const [certificate, setCertificate] = useState<Certificate | null>(null)
  const [blocked, setBlocked] = useState<BlockedCertificate | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  const urlId = searchParams.get('id')

  useEffect(() => {
    if (urlId) {
      setInputVal(urlId)
      fetchCertificate(urlId)
    }
  }, [urlId])

  const fetchCertificate = async (id: string) => {
    if (!id.trim()) return
    setLoading(true)
    setErrorMsg('')
    setCertificate(null)
    setBlocked(null)
    try {
      const res = await apiClient.get(`/api/certificates/${id.trim()}`)
      if (res.data.blocked) {
        setBlocked(res.data)
      } else {
        setCertificate(res.data)
      }
    } catch (err: any) {
      setErrorMsg(t('certificate.not_found'))
      toast.error(t('certificate.not_found'))
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputVal.trim()) {
      setSearchParams({ id: inputVal.trim() })
      fetchCertificate(inputVal)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Hide Navbar when printing */}
      <div className="print:hidden">
        <Navbar />
      </div>

      <div className="max-w-[1280px] mx-auto w-full px-4 pt-28 pb-16 flex-grow flex flex-col justify-start print:pt-0 print:pb-0">
        
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="mb-8 text-sm font-semibold text-zinc-400 hover:text-white transition flex items-center gap-2 group print:hidden"
        >
          <ArrowLeft size={16} className={`transition-transform ${i18n.language === 'ar' ? 'group-hover:translate-x-1 rotate-180' : 'group-hover:-translate-x-1'}`} /> 
          {i18n.language === 'ar' ? 'الرئيسية' : 'Home'}
        </button>

        {/* Input Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden mb-8 print:hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-500/10 rounded-full blur-2xl" />
          
          <div className="text-center max-w-lg mx-auto mb-6">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white mb-2">
              {t('certificate.title')}
            </h1>
            <p className="text-zinc-400 text-sm">
              {t('certificate.subtitle')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
            <div className="relative flex-grow">
              <input
                type="text"
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                placeholder={t('certificate.input_placeholder')}
                className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-2xl text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <Search className="absolute left-3.5 top-3.5 text-zinc-500" size={18} />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-brand-600 hover:bg-brand-500 active:scale-95 text-white font-bold rounded-2xl transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                t('certificate.verify_button')
              )}
            </button>
          </form>

          {errorMsg && (
            <p className="text-red-400 text-sm text-center mt-4 font-semibold">
              {errorMsg}
            </p>
          )}
        </div>

        {/* Blocked Certificate Message */}
        {blocked && (
          <div className="space-y-6">
            <div className="bg-red-950/20 border-2 border-red-800/50 rounded-2xl p-8 md:p-12 shadow-2xl text-center relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-500/10 rounded-full blur-3xl" />
              <div className="relative z-10 space-y-6">
                <div className="w-20 h-20 bg-red-900/30 rounded-full flex items-center justify-center mx-auto border-2 border-red-800/30">
                  <ShieldAlert size={40} className="text-red-500" />
                </div>
                <div>
                  <h2 className="text-3xl md:text-4xl font-extrabold text-red-500 mb-2">
                    {t('certificate.blocked_title')}
                  </h2>
                  <p className="text-zinc-400 text-lg">
                    {t('certificate.blocked_message')}
                  </p>
                </div>
                <div className="max-w-md mx-auto bg-black/30 border border-red-900/30 rounded-xl p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-red-400 mb-1">
                    {t('certificate.blocked_reason')}
                  </p>
                  <p className="text-zinc-300 text-base font-semibold">
                    {blocked.reason}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Certificate Display Area */}
        {certificate && (
          <div className="space-y-6">
            {/* Print trigger */}
            <div className="flex justify-end gap-3 print:hidden">
              <button
                onClick={handlePrint}
                className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-750 text-white font-semibold rounded-xl text-sm transition flex items-center gap-2 border border-zinc-700"
              >
                <Printer size={16} />
                {i18n.language === 'ar' ? 'طباعة / حفظ كـ PDF' : 'Print / Save PDF'}
              </button>
            </div>

            {/* Exact New Certificate Design Stage */}
            <div className="certificate-container w-full overflow-x-auto pb-4 flex justify-center print:overflow-visible">
              <div
                className="certificate relative w-[1200px] min-w-[1200px] h-[675px] bg-gradient-to-br from-[#161616] via-[#0c0c0c] to-[#050505] text-white overflow-hidden shadow-2xl print:m-0 print:shadow-none"
                style={{
                  fontFamily: "'Arial', 'Helvetica Neue', sans-serif",
                  lineHeight: 'normal'
                }}
              >
                {/* Diagonal Side Panel */}
                <div
                  className="side-panel absolute top-0 left-0 w-[305px] h-full bg-gradient-to-br from-[#222] via-[#141414] to-[#0a0a0a] z-10"
                  style={{ clipPath: 'polygon(0 0, 100% 0, 78% 100%, 0% 100%)' }}
                />

                {/* Watermark */}
                <div
                  className="watermark absolute top-1/2 left-[148px] w-[850px] text-center font-black text-[150px] tracking-[2px] text-white/5 whitespace-nowrap z-10 pointer-events-none select-none"
                  style={{ transform: 'translate(-50%, -50%) rotate(90deg)', transformOrigin: 'center center', fontFamily: "'Arial Black', Arial, sans-serif" }}
                >
                  HAKSPACE
                </div>

                {/* Logo Box */}
                <div className="logo-box absolute top-[30px] left-[38px] w-[230px] h-[210px] z-30 flex flex-col items-center justify-center p-2 text-center">
                  <img src={logoImg} alt="HakSpace" className="w-auto h-28 object-contain rounded-xl mb-2" />
                  <div className="text-[16px] font-black tracking-[2px] text-white uppercase leading-tight" style={{ fontFamily: "'Arial Black', Arial, sans-serif" }}>
                    HAK SPACE
                  </div>
                  <div className="text-[11px] font-bold tracking-[4px] text-[#e12525] uppercase mt-0.5">
                    COMMUNITY
                  </div>
                </div>

                {/* Certificate ID Box */}
                <div className="cert-id-box absolute top-[34px] right-[36px] px-[18px] py-[12px] z-30 text-left">
                  <div className="row1 text-[14px] font-bold mb-[6px] text-white whitespace-nowrap">
                    Certificate ID : <span className="value font-normal" id="certificateId">{certificate.certificateId}</span>
                  </div>
                  <div className="row2 text-[11px] font-bold text-white whitespace-nowrap">
                    Verify Online : <a href="http://haksc.com/verify-certificate" id="verifyLink" className="font-normal text-white underline hover:text-zinc-300">http://haksc.com/verify-certificate</a>
                  </div>
                </div>

                {/* Title */}
                <div className="title-block absolute top-[100px] left-[335px] z-30 text-left">
                  <div className="line1 text-[66px] font-black text-[#e12525] tracking-[1px] leading-none">Certificate</div>
                  <div className="line2 text-[50px] font-black text-white tracking-[1px] leading-[1.15]">Of Completion</div>
                </div>

                {/* Given To */}
                <div className="given-to absolute top-[275px] left-[335px] text-[26px] font-normal text-[#eaeaea] z-30">
                  This Certificate Is Given To
                </div>

                {/* Student Name */}
                <div className="student-name absolute top-[325px] left-[335px] right-[60px] text-[52px] font-bold text-white z-30 border-b-2 border-white/15 pb-[14px] min-h-[70px] text-left">
                  {certificate.studentName}
                </div>

                {/* Course Name & Duration */}
                <div className="course-line absolute top-[415px] left-[335px] right-[60px] text-[19px] text-[#cfcfcf] z-30 leading-[1.5] text-left">
                  <div>
                    For successfully completing the course{' '}
                    <span className="course-name text-white font-bold">{certificate.courseName}</span>
                  </div>
                  {(() => {
                    let displayDuration = certificate.courseDuration ? formatDuration(certificate.courseDuration, 'en') : ''
                    if (!displayDuration && certificate.startDate && certificate.issueDate) {
                      const start = new Date(certificate.startDate)
                      const end = new Date(certificate.issueDate)
                      const diffTime = Math.abs(end.getTime() - start.getTime())
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                      const months = Math.max(1, Math.round(diffDays / 30))
                      displayDuration = months === 1 ? '1 Month' : `${months} Months`
                    }
                    return displayDuration ? (
                      <div className="text-[16px] text-[#b0b0b0] mt-1">
                        Duration: {displayDuration}
                      </div>
                    ) : null
                  })()}
                </div>

                {/* Signature Block */}
                <div className="signature-block absolute bottom-[40px] left-[38px] w-[280px] z-30 text-left">
                  <div className="label text-[15px] font-extrabold mb-[6px] text-white">Ceo's Signature</div>
                  <div className="sig text-[34px] text-[#f2f2f2] border-b border-white/30 pb-[6px] min-h-[40px]" style={{ fontFamily: "'Brush Script MT', 'Segoe Script', cursive" }}>
                    Ahmed Bin Omara
                  </div>
                </div>

                {/* Instructor Block */}
                <div className="instructor-block absolute bottom-[40px] left-[335px] w-[340px] z-30 text-left">
                  <div className="label text-[26px] font-extrabold text-[#e12525] mb-[8px]">Instructor</div>
                  <div className="value text-[17px] text-[#eee] border-t border-white/25 pt-[8px] min-h-[20px]">
                    {certificate.instructorName || 'HakSpace Instructor'}
                  </div>
                </div>

                {/* Date Block (Certificate Creation Date) */}
                <div className="date-block absolute bottom-[40px] right-[120px] w-[220px] z-30 text-left">
                  <div className="label text-[26px] font-extrabold text-[#e12525] mb-[8px]">Date</div>
                  <div className="value text-[17px] text-[#eee] border-t border-white/25 pt-[8px] min-h-[20px] whitespace-nowrap">
                    {new Date(certificate.issueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

      </div>

      <style>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 0;
          }
          *, *::before, *::after {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          html, body, #root {
            width: 100% !important;
            height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background-color: #050505 !important;
            overflow: hidden !important;
          }
          .print\\:hidden, nav, header, footer, button, form {
            display: none !important;
          }
          .certificate-container {
            width: 100vw !important;
            height: 100vh !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            padding: 0 !important;
            margin: 0 !important;
            background: #050505 !important;
          }
          .certificate {
            width: 1200px !important;
            height: 675px !important;
            min-width: 1200px !important;
            transform: scale(0.92) !important;
            transform-origin: center center !important;
            box-shadow: none !important;
            margin: 0 auto !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}</style>
    </div>
  )
}
