'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function NewJournalPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [content, setContent] = useState('')
  const [emotion, setEmotion] = useState<'verdriet' | 'boosheid' | 'angst' | 'vrede' | 'gemengd' | 'neutraal'>('neutraal')
  const [saving, setSaving] = useState(false)
  const [smartPrompt, setSmartPrompt] = useState('')
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])
  const [aiLoading, setAiLoading] = useState(false)
  const [showAiPanel, setShowAiPanel] = useState(false)

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    if (user) {
      fetchSmartPrompt()
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

  const fetchSmartPrompt = async () => {
    try {
      const response = await fetch('/api/ai/smart-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      })
      
      if (response.ok) {
        const data = await response.json()
        setSmartPrompt(data.prompt)
      }
    } catch (error) {
      console.error('Error fetching prompt:', error)
    }
  }

  const handleAiAssist = async (action: 'continue' | 'expand' | 'reframe') => {
    if (!content.trim()) {
      alert('Schrijf eerst iets voordat je AI hulp vraagt')
      return
    }

    setAiLoading(true)
    setShowAiPanel(true)

    try {
      const response = await fetch('/api/ai/writing-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          content: content.trim(),
          emotion
        })
      })

      if (response.ok) {
        const data = await response.json()
        // Parse suggestions from markdown list format
        const suggestions = data.suggestions
          .split('\n')
          .filter((line: string) => line.trim().startsWith('-'))
          .map((line: string) => line.replace(/^-\s*/, '').trim())
        setAiSuggestions(suggestions)
      }
    } catch (error) {
      console.error('AI assist error:', error)
      alert('Er ging iets mis met de AI hulp')
    } finally {
      setAiLoading(false)
    }
  }

  const handleSave = async () => {
    if (!content.trim()) return

    setSaving(true)

    const { error } = await supabase
      .from('journal_entries')
      .insert([
        {
          user_id: user.id,
          content: content.trim(),
          emotion: emotion,
        },
      ])

    if (!error) {
      router.push('/dashboard')
    } else {
      alert('Er ging iets mis bij het opslaan. Probeer het opnieuw.')
      setSaving(false)
    }
  }

  const emotions = [
    { value: 'verdriet', label: 'Verdriet', emoji: 'ðŸ˜¢', color: 'bg-blue-100 hover:bg-blue-200 border-blue-300' },
    { value: 'boosheid', label: 'Boosheid', emoji: 'ðŸ˜ ', color: 'bg-red-100 hover:bg-red-200 border-red-300' },
    { value: 'angst', label: 'Angst', emoji: 'ðŸ˜°', color: 'bg-yellow-100 hover:bg-yellow-200 border-yellow-300' },
    { value: 'vrede', label: 'Vrede', emoji: 'ðŸ˜Œ', color: 'bg-green-100 hover:bg-green-200 border-green-300' },
    { value: 'gemengd', label: 'Gemengd', emoji: 'ðŸŒŠ', color: 'bg-purple-100 hover:bg-purple-200 border-purple-300' },
    { value: 'neutraal', label: 'Neutraal', emoji: 'ðŸ˜', color: 'bg-gray-100 hover:bg-gray-200 border-gray-300' },
  ]

  return (
    <div className="min-h-screen bg-cream">
      {/* Navigation */}
      <nav className="border-b border-sage/20 bg-white/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="font-serif text-2xl font-light text-soft-black tracking-[2px]">
            STILLE RUIMTE
          </Link>
          <Link href="/dashboard" className="text-warm-gray hover:text-deep-sage transition-colors">
            â† Terug naar dashboard
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="font-serif text-5xl font-light text-soft-black mb-4">
            Nieuw dagboek
          </h1>
          <p className="text-lg text-warm-gray">
            Neem de tijd die je nodig hebt. Er is geen haast.
          </p>
        </div>

        {/* Smart Prompt */}
        {smartPrompt && (
          <div className="mb-8 p-6 bg-gradient-to-br from-mist to-cream rounded-3xl border border-sage/20">
            <div className="flex items-start gap-3">
              <div className="text-3xl">âœ¨</div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-soft-black mb-2">
                  Prompt voor vandaag
                </h3>
                <p className="text-warm-gray italic text-lg">"{smartPrompt}"</p>
                <button
                  onClick={() => setContent(smartPrompt + '\n\n')}
                  className="mt-3 text-sm text-sage hover:text-deep-sage transition-colors"
                >
                  Gebruik als startpunt â†’
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Emotion Selector */}
        <div className="mb-8">
          <label className="block text-lg font-medium text-warm-gray mb-4">
            Hoe voel je je?
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {emotions.map((em) => (
              <button
                key={em.value}
                onClick={() => setEmotion(em.value as any)}
                className={`p-4 rounded-2xl border-2 transition-all ${
                  emotion === em.value 
                    ? `${em.color} border-opacity-100 shadow-md` 
                    : 'bg-white/50 border-sage/10 hover:border-sage/30'
                }`}
              >
                <div className="text-3xl mb-2">{em.emoji}</div>
                <div className="text-sm text-warm-gray">{em.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Journal Content */}
        <div className="bg-white/60 backdrop-blur-md rounded-3xl border border-sage/20 p-8 mb-6">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Schrijf hier je gedachten... Er is geen goede of foute manier om dit te doen. Wat je ook voelt, het is geldig."
            className="w-full min-h-[400px] bg-transparent border-none outline-none text-lg text-warm-gray resize-none placeholder:text-warm-gray/40"
          />
          
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-sage/20">
            <div className="flex gap-3">
              <button
                onClick={() => handleAiAssist('continue')}
                disabled={aiLoading || !content.trim()}
                className="px-4 py-2 bg-mist text-warm-gray rounded-full text-sm hover:bg-sage/10 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <span>ðŸ¤–</span>
                <span>Help doorschrijven</span>
              </button>
              <button
                onClick={() => handleAiAssist('expand')}
                disabled={aiLoading || !content.trim()}
                className="px-4 py-2 bg-mist text-warm-gray rounded-full text-sm hover:bg-sage/10 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <span>ðŸ’¡</span>
                <span>Verdiep gedachte</span>
              </button>
              <button
                onClick={() => handleAiAssist('reframe')}
                disabled={aiLoading || !content.trim()}
                className="px-4 py-2 bg-mist text-warm-gray rounded-full text-sm hover:bg-sage/10 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <span>ðŸ”„</span>
                <span>Andere perspectief</span>
              </button>
            </div>
            
            <div className="text-sm text-warm-gray/60">
              {content.length} karakters
            </div>
          </div>

          {/* AI Suggestions Panel */}
          {showAiPanel && (
            <div className="mt-6 p-6 bg-gradient-to-br from-mist to-cream rounded-2xl border border-sage/20">
              <div className="flex items-start gap-3">
                <div className="text-2xl">ðŸ¤–</div>
                <div className="flex-1">
                  <h4 className="font-medium text-soft-black mb-3">AI Suggesties</h4>
                  {aiLoading ? (
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-sage rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-sage rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-sage rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  ) : aiSuggestions.length > 0 ? (
                    <ul className="space-y-3">
                      {aiSuggestions.map((suggestion, index) => (
                        <li key={index} className="text-warm-gray">
                          <span className="text-sage mr-2">â€¢</span>
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  <button
                    onClick={() => setShowAiPanel(false)}
                    className="mt-4 text-sm text-sage hover:text-deep-sage"
                  >
                    Sluiten
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleSave}
            disabled={!content.trim() || saving}
            className="flex-1 py-4 bg-sage text-white rounded-full font-medium hover:bg-deep-sage transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Bezig met opslaan...' : 'dagboek opslaan'}
          </button>
          
          <Link
            href="/dashboard"
            className="px-8 py-4 bg-white/60 backdrop-blur-md border border-sage/20 text-warm-gray rounded-full font-medium hover:bg-white transition-all text-center"
          >
            Annuleren
          </Link>
        </div>

        {/* Privacy Note */}
        <div className="mt-8 p-6 bg-white/40 backdrop-blur-md rounded-2xl border border-sage/10">
          <div className="flex items-start gap-3">
            <div className="text-xl">ðŸ”’</div>
            <p className="text-sm text-warm-gray">
              Jouw entries zijn volledig privÃ© en worden versleuteld opgeslagen. De AI hulp gebruikt je entries alleen om betere suggesties te geven.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
