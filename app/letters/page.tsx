'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function LettersPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [letters, setLetters] = useState<any[]>([])
  const [showNewLetter, setShowNewLetter] = useState(false)
  const [recipientName, setRecipientName] = useState('')
  const [content, setContent] = useState('')
  const [notes, setNotes] = useState('')
  const [sendDate, setSendDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiSuggestion, setAiSuggestion] = useState('')

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    if (user) {
      fetchLetters()
    }
  }, [user])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
    } else {
      setUser(user)
    }
  }

  const fetchLetters = async () => {
    const { data, error } = await supabase
      .from('letters')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setLetters(data)
    }
  }

  const handleAIHelp = async () => {
    if (!content.trim()) {
      alert('Schrijf eerst een begin voordat je AI hulp vraagt')
      return
    }

    setAiLoading(true)

    try {
      const response = await fetch('/api/ai/letter-help', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientName,
          currentContent: content
        })
      })

      if (response.ok) {
        const data = await response.json()
        setAiSuggestion(data.suggestion)
      }
    } catch (error) {
      console.error('AI help error:', error)
      alert('Er ging iets mis met AI hulp')
    } finally {
      setAiLoading(false)
    }
  }

  const handleSave = async () => {
    if (!recipientName.trim() || !content.trim()) {
      alert('Vul minimaal de naam en inhoud in')
      return
    }

    setSaving(true)

    const { error } = await supabase
      .from('letters')
      .insert({
        user_id: user.id,
        recipient_name: recipientName.trim(),
        content: content.trim(),
        notes: notes.trim() || null,
        send_date: sendDate || null
      })

    if (!error) {
      await fetchLetters()
      setShowNewLetter(false)
      setRecipientName('')
      setContent('')
      setNotes('')
      setSendDate('')
      setAiSuggestion('')
    } else {
      alert('Er ging iets mis bij het opslaan')
    }

    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Weet je zeker dat je deze brief wilt verwijderen?')) return

    const { error } = await supabase
      .from('letters')
      .delete()
      .eq('id', id)

    if (!error) {
      await fetchLetters()
    }
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Navigation */}
      <nav className="border-b border-sage/20 bg-white/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="font-serif text-2xl font-light text-soft-black tracking-[2px]">
            STILTE RUIMTE
          </Link>
          <Link href="/dashboard" className="text-warm-gray hover:text-deep-sage transition-colors">
            ← Terug naar dashboard
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="font-serif text-5xl font-light text-soft-black mb-4">
            Brieven aan {letters.length > 0 ? recipientName || 'je dierbare' : 'je dierbare'} ✉️
          </h1>
          <p className="text-lg text-warm-gray">
            Schrijf wat je altijd had willen zeggen. Deze brieven blijven bij jou.
          </p>
        </div>

        {/* New Letter Button */}
        {!showNewLetter && (
          <div className="mb-8 text-center">
            <button
              onClick={() => setShowNewLetter(true)}
              className="px-8 py-4 bg-sage text-white rounded-full hover:bg-deep-sage transition-all"
            >
              + Nieuwe brief schrijven
            </button>
          </div>
        )}

        {/* New Letter Form */}
        {showNewLetter && (
          <div className="mb-12 bg-white/60 backdrop-blur-md rounded-3xl border border-sage/20 p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-serif font-light text-soft-black">Nieuwe brief</h2>
              <button
                onClick={() => {
                  setShowNewLetter(false)
                  setContent('')
                  setRecipientName('')
                  setNotes('')
                  setSendDate('')
                  setAiSuggestion('')
                }}
                className="text-warm-gray hover:text-soft-black"
              >
                ✕
              </button>
            </div>

            {/* Recipient Name */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-warm-gray mb-2">
                Aan wie schrijf je?
              </label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Naam van je dierbare..."
                className="w-full px-4 py-3 bg-white/60 border border-sage/20 rounded-2xl outline-none focus:ring-2 focus:ring-sage/50"
              />
            </div>

            {/* Letter Content */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-warm-gray mb-2">
                Jouw brief
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Lieve...,

Ik wil je vertellen..."
                className="w-full min-h-[400px] px-4 py-3 bg-white/60 border border-sage/20 rounded-2xl outline-none focus:ring-2 focus:ring-sage/50 resize-none font-serif text-lg"
              />
            </div>

            {/* AI Help Button */}
            <div className="mb-6">
              <button
                onClick={handleAIHelp}
                disabled={aiLoading || !content.trim()}
                className="px-6 py-3 bg-mist text-warm-gray rounded-full hover:bg-sage/10 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <span>🤖</span>
                <span>{aiLoading ? 'AI denkt mee...' : 'AI hulp bij formuleren'}</span>
              </button>
            </div>

            {/* AI Suggestion */}
            {aiSuggestion && (
              <div className="mb-6 p-6 bg-gradient-to-br from-mist to-cream rounded-2xl border border-sage/20">
                <div className="flex items-start gap-3 mb-3">
                  <div className="text-2xl">💡</div>
                  <div className="flex-1">
                    <h4 className="font-medium text-soft-black mb-2">AI Suggestie</h4>
                    <p className="text-warm-gray whitespace-pre-wrap">{aiSuggestion}</p>
                  </div>
                </div>
                <button
                  onClick={() => setContent(content + '\n\n' + aiSuggestion)}
                  className="text-sm text-sage hover:text-deep-sage"
                >
                  Voeg toe aan brief
                </button>
              </div>
            )}

            {/* Optional Notes */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-warm-gray mb-2">
                Notities voor jezelf (optioneel)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Waarom schrijf je deze brief? Hoe voel je je?"
                className="w-full px-4 py-3 bg-white/60 border border-sage/20 rounded-2xl outline-none focus:ring-2 focus:ring-sage/50 resize-none"
                rows={3}
              />
            </div>

            {/* Send Date */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-warm-gray mb-2">
                Optioneel: Stuur deze brief naar jezelf op een bepaalde datum
              </label>
              <input
                type="date"
                value={sendDate}
                onChange={(e) => setSendDate(e.target.value)}
                className="px-4 py-3 bg-white/60 border border-sage/20 rounded-2xl outline-none focus:ring-2 focus:ring-sage/50"
              />
              <p className="text-xs text-warm-gray/60 mt-2">
                Op deze datum krijg je een email met je brief (als herinnering)
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={handleSave}
                disabled={saving || !recipientName.trim() || !content.trim()}
                className="flex-1 py-4 bg-sage text-white rounded-full hover:bg-deep-sage transition-all disabled:opacity-50"
              >
                {saving ? 'Bezig met opslaan...' : '📮 Brief verzegelen'}
              </button>
              <button
                onClick={() => {
                  setShowNewLetter(false)
                  setContent('')
                  setRecipientName('')
                  setNotes('')
                  setSendDate('')
                }}
                className="px-8 py-4 bg-mist text-warm-gray rounded-full hover:bg-gray-200 transition-all"
              >
                Annuleren
              </button>
            </div>
          </div>
        )}

        {/* Letters List */}
        {letters.length === 0 ? (
          <div className="text-center py-16 bg-white/40 backdrop-blur-md rounded-3xl border border-sage/10">
            <div className="text-6xl mb-4">✉️</div>
            <p className="text-warm-gray text-lg mb-6">
              Je hebt nog geen brieven geschreven
            </p>
            {!showNewLetter && (
              <button
                onClick={() => setShowNewLetter(true)}
                className="px-8 py-4 bg-sage text-white rounded-full hover:bg-deep-sage transition-all"
              >
                Schrijf je eerste brief
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {letters.map((letter) => (
              <div
                key={letter.id}
                className="bg-white/60 backdrop-blur-md rounded-3xl border border-sage/20 p-8"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-serif font-light text-soft-black mb-2">
                      Aan {letter.recipient_name}
                    </h3>
                    <p className="text-sm text-warm-gray">
                      Geschreven op {new Date(letter.created_at).toLocaleDateString('nl-NL', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(letter.id)}
                    className="text-warm-gray/40 hover:text-red-500 transition-colors"
                  >
                    🗑️
                  </button>
                </div>

                <div className="prose prose-lg max-w-none mb-4">
                  <p className="text-warm-gray whitespace-pre-wrap font-serif">
                    {letter.content}
                  </p>
                </div>

                {letter.notes && (
                  <div className="mt-4 p-4 bg-mist/50 rounded-2xl">
                    <p className="text-sm text-warm-gray italic">
                      <strong>Notitie:</strong> {letter.notes}
                    </p>
                  </div>
                )}

                {letter.send_date && !letter.is_sent && (
                  <div className="mt-4 p-4 bg-sage/10 rounded-2xl">
                    <p className="text-sm text-sage">
                      📅 Wordt naar je gemaild op: {new Date(letter.send_date).toLocaleDateString('nl-NL')}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Info */}
        <div className="mt-12 p-6 bg-white/40 backdrop-blur-md rounded-2xl border border-sage/10">
          <div className="flex items-start gap-3">
            <div className="text-xl">🔒</div>
            <div className="text-sm text-warm-gray">
              <p className="mb-2"><strong>Privacy & Veiligheid</strong></p>
              <p>Jouw brieven zijn volledig privé. Ze worden nooit verstuurd, tenzij je ervoor kiest ze naar jezelf te emailen op een bepaalde datum. Dit is een ritueel voor jou alleen.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
