'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const emotions = [
  { value: 'verdriet', label: 'Verdriet', emoji: String.fromCodePoint(0x1F622) },
  { value: 'boosheid', label: 'Boosheid', emoji: String.fromCodePoint(0x1F620) },
  { value: 'angst', label: 'Angst', emoji: String.fromCodePoint(0x1F630) },
  { value: 'vrede', label: 'Vrede', emoji: String.fromCodePoint(0x1F60C) },
  { value: 'gemengd', label: 'Gemengd', emoji: String.fromCodePoint(0x1F30A) },
  { value: 'neutraal', label: 'Neutraal', emoji: String.fromCodePoint(0x1F610) },
]

export default function NewJournalPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [content, setContent] = useState('')
  const [emotion, setEmotion] = useState('')
  const [saving, setSaving] = useState(false)
  const [dailyPrompt, setDailyPrompt] = useState('')

  useEffect(() => {
    checkUser()
    fetchDailyPrompt()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
    } else {
      setUser(user)
    }
  }

  const fetchDailyPrompt = async () => {
    try {
      const response = await fetch('/api/ai/smart-prompt')
      if (response.ok) {
        const data = await response.json()
        setDailyPrompt(data.prompt)
      }
    } catch (error) {
      console.error('Error fetching prompt:', error)
    }
  }

  const handleSave = async () => {
    if (!content.trim() || !emotion) {
      alert('Vul minimaal je gedachten en emotie in')
      return
    }

    setSaving(true)

    const { error } = await supabase
      .from('journal_entries')
      .insert({
        user_id: user.id,
        content: content.trim(),
        emotion
      })

    if (!error) {
      router.push('/journal')
    } else {
      alert('Er ging iets mis bij het opslaan')
    }

    setSaving(false)
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-cream">
      <nav className="border-b border-sage/20 bg-white/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="font-serif text-2xl font-light text-soft-black tracking-[2px]">
            STILTE RUIMTE
          </Link>
          <Link href="/dashboard" className="text-warm-gray hover:text-deep-sage transition-colors">
            {String.fromCodePoint(0x2190)} Terug naar dashboard
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-12 text-center">
          <h1 className="font-serif text-5xl font-light text-soft-black mb-4">
            Nieuw dagboek
          </h1>
          <p className="text-lg text-warm-gray">
            Neem de tijd die je nodig hebt. Er is geen haast.
          </p>
        </div>

        {dailyPrompt && (
          <div className="mb-8 p-6 bg-gradient-to-br from-mist to-cream rounded-3xl border border-sage/20">
            <div className="flex items-start gap-3">
              <div className="text-2xl">{String.fromCodePoint(0x1F4A1)}</div>
              <div>
                <h3 className="font-medium text-soft-black mb-2">Prompt voor vandaag</h3>
                <p className="text-warm-gray italic">"{dailyPrompt}"</p>
                <button
                  onClick={() => setContent(dailyPrompt + '\n\n')}
                  className="text-sm text-sage hover:text-deep-sage mt-2"
                >
                  Gebruik als startpunt {String.fromCodePoint(0x2191)}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mb-8">
          <label className="block text-sm font-medium text-warm-gray mb-4">
            Hoe voel je je?
          </label>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {emotions.map((em) => (
              <button
                key={em.value}
                onClick={() => setEmotion(em.value)}
                className={`p-6 rounded-2xl border-2 transition-all ${
                  emotion === em.value
                    ? 'border-sage bg-sage/10'
                    : 'border-sage/20 hover:border-sage/40'
                }`}
              >
                <div className="text-4xl mb-2">{em.emoji}</div>
                <div className="text-sm text-soft-black">{em.label}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <label className="block text-sm font-medium text-warm-gray mb-4">
            Schrijf hier je gedachten...
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Er is geen goede of foute manier om dit te doen. Wat je ook voelt, het is geldig."
            className="w-full min-h-[400px] p-6 bg-white/60 border border-sage/20 rounded-3xl outline-none focus:ring-2 focus:ring-sage/50 resize-none font-serif text-lg"
          />
          <div className="mt-2 text-sm text-warm-gray">
            {content.length} karakters
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleSave}
            disabled={saving || !content.trim() || !emotion}
            className="flex-1 py-4 bg-sage text-white rounded-full hover:bg-deep-sage transition-all disabled:opacity-50 text-lg"
          >
            {saving ? 'Bezig met opslaan...' : 'Dagboek opslaan'}
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-8 py-4 bg-mist text-warm-gray rounded-full hover:bg-gray-200 transition-all"
          >
            Annuleren
          </button>
        </div>

        <div className="mt-12 p-6 bg-white/40 backdrop-blur-md rounded-2xl border border-sage/10">
          <div className="flex items-start gap-3">
            <div className="text-xl">{String.fromCodePoint(0x1F4DD)}</div>
            <div className="text-sm text-warm-gray">
              <p className="mb-2"><strong>Jouw entries zijn volledig privÃ©</strong></p>
              <p>en wordt nooit met anderen gedeeld. Alleen jij hebt toegang.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}