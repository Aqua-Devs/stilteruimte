'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'

export default function EmotionsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
    } else {
      setUser(user)
    }
  }

  const emotions = [
    { value: 'verdriet', label: 'Verdriet', emoji: '😢', color: 'bg-blue-100 hover:bg-blue-200 border-blue-300', description: 'Diep gevoel van verlies' },
    { value: 'boosheid', label: 'Boosheid', emoji: '😠', color: 'bg-red-100 hover:bg-red-200 border-red-300', description: 'Woede of frustratie' },
    { value: 'angst', label: 'Angst', emoji: '😰', color: 'bg-yellow-100 hover:bg-yellow-200 border-yellow-300', description: 'Onzekerheid of bezorgdheid' },
    { value: 'vrede', label: 'Vrede', emoji: '😌', color: 'bg-green-100 hover:bg-green-200 border-green-300', description: 'Rust en acceptatie' },
    { value: 'gemengd', label: 'Gemengd', emoji: '🌊', color: 'bg-purple-100 hover:bg-purple-200 border-purple-300', description: 'Meerdere emoties tegelijk' },
    { value: 'neutraal', label: 'Neutraal', emoji: '😐', color: 'bg-gray-100 hover:bg-gray-200 border-gray-300', description: 'Geen sterke emotie' },
  ]

  const handleSave = async () => {
    if (!selectedEmotion) return

    setSaving(true)

    const { error } = await supabase
      .from('journal_entries')
      .insert([
        {
          user_id: user.id,
          content: note || `Emotie check: ${format(new Date(), 'HH:mm')}`,
          emotion: selectedEmotion,
        },
      ])

    if (!error) {
      setSelectedEmotion(null)
      setNote('')
      alert('✅ Emotie opgeslagen!')
    } else {
      alert('Er ging iets mis. Probeer het opnieuw.')
    }
    setSaving(false)
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Navigation */}
      <nav className="border-b border-sage/20 bg-white/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="font-serif text-2xl font-light text-soft-black tracking-[2px]">
            STILLE RUIMTE
          </Link>
          <Link href="/dashboard" className="text-warm-gray hover:text-deep-sage transition-colors">
            ← Terug naar dashboard
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="font-serif text-5xl font-light text-soft-black mb-4">
            Hoe voel je je nu?
          </h1>
          <p className="text-lg text-warm-gray">
            Kies de emotie die het beste past bij hoe je je op dit moment voelt
          </p>
        </div>

        {/* Emotion Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {emotions.map((emotion) => (
            <button
              key={emotion.value}
              onClick={() => setSelectedEmotion(emotion.value)}
              className={`p-8 rounded-3xl border-2 transition-all text-left ${
                selectedEmotion === emotion.value
                  ? `${emotion.color} border-opacity-100 shadow-xl scale-105`
                  : 'bg-white/60 border-sage/10 hover:border-sage/30'
              }`}
            >
              <div className="text-5xl mb-4">{emotion.emoji}</div>
              <h3 className="font-serif text-2xl font-normal mb-2 text-soft-black">
                {emotion.label}
              </h3>
              <p className="text-sm text-warm-gray">{emotion.description}</p>
            </button>
          ))}
        </div>

        {/* Optional Note */}
        {selectedEmotion && (
          <div className="bg-white/60 backdrop-blur-md rounded-3xl border border-sage/20 p-8 mb-6">
            <label className="block text-lg font-medium text-warm-gray mb-4">
              Wil je er iets over vertellen? (optioneel)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Waarom voel je je zo? Wat gebeurde er?"
              className="w-full min-h-[120px] bg-transparent border border-sage/20 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-sage/50 text-warm-gray resize-none"
            />
          </div>
        )}

        {/* Save Button */}
        {selectedEmotion && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-5 bg-sage text-white rounded-full text-lg font-medium hover:bg-deep-sage transition-all disabled:opacity-50"
          >
            {saving ? 'Bezig met opslaan...' : 'Emotie opslaan'}
          </button>
        )}

        {/* Info Box */}
        <div className="mt-8 p-6 bg-mist rounded-2xl border border-sage/10">
          <div className="flex items-start gap-3">
            <div className="text-2xl">💡</div>
            <div>
              <h4 className="font-medium text-soft-black mb-2">Waarom emoties bijhouden?</h4>
              <p className="text-sm text-warm-gray">
                Het herkennen en benoemen van je emoties helpt bij verwerking. Over tijd zie je patronen 
                en kun je beter begrijpen wat triggers zijn en wanneer je vooruitgang boekt.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
