import { MessageCircle } from 'lucide-react'
export default function WhatsAppButton() {
  const number = import.meta.env.VITE_WHATSAPP_NUMBER || '201096916225'
  return (
    <button onClick={() => window.open(`https://wa.me/${number}`, '_blank')} 
      className="fixed bottom-6 right-6 w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition">
      <MessageCircle size={28} />
    </button>
  )
}