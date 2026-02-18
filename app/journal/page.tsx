'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'

const emotions = [
  { value: 'all', label: 'Alle', emoji: '' },
  { value: 'verdriet', label: 'Verdriet', emoji: String.fromCodePoint(0x1F622) },
  { value: 'boosheid', label: 'Boosheid', emoji: String.fromCodePoint(0x1F620) },
  { value: 'angst', label: 'Angst', emoji: String.fromCodePoint(0x1F630) },
  { value: 'vrede', label: 'Vrede', emoji: String.fromCodePoint(0x1F60C) },
  { value: 'gemengd', label: 'Gemengd', emoji: String.fromCodePoint(0x1F30A) },
  { value: 'neutraal', label: 'Neutraal', emoji: String.fromCodePoint(0x1F610) },
]

const emotionColors = {
  verdriet: 'bg-blue-100 border-blue-300',
  boosheid: 'bg-red-100 border-red-300',
  angst: 'bg-yellow-100 border-yellow-300',
  vrede: 'bg-green-100 border-green-300',
  gemengd: 'bg-purple-100 border-purple-300',
  neutraal: 'bg-gray-100 border-gray-300',
}

export default function JournalPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [entries, setEntries] = useState<any[]>([])
  const [filteredEntries, setFilteredEntries] = useState<any[]>([])
  const [selectedEmotion, setSelectedEmotion] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    if (user) {
      fetchEntries()
    }
  }, [user])

  useEffect(() => {
    if (selectedEmotion === 'all') {
      setFilteredEntries(entries)
    } else {
      setFilteredEntries(entries.filter(e => e.emotion === selectedEmotion))
    }
  }, [selectedEmotion, entries])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
    } else {
      setUser(user)
    }
  }

  const fetchEntries = async () => {
    setLoading(true)
    
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setEntries(data)
      setFilteredEntries(data)
    } else {
      console.error('Error fetching entries:', error)
    }
    
    setLoading(false)
  }

  const getEmotionEmoji = (emotion: string) => {
    const em = emotions.find(e => e.value === emotion)
    return em?.emoji || String.fromCodePoint(0x1F4DD)
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-cream">
      <nav className="border-b border-sage/20 bg-white/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="font-serif text-2xl font-light text-soft-black tracking-[2px]">
            STILTE RUIMTE
          </Link>
          <div className="flex items-center gap-6">
            <Link 
              href="/journal/new"
              className="px-6 py-2 bg-sage text-white rounded-full hover:bg-deep-sage transition-all"
            >
              + Nieuwe dagboek
            </Link>
            <Link href="/dashboard" className="text-warm-gray hover:text-deep-sage transition-colors">
              {String.fromCodePoint(0x2190)} Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-12 text-center">
          <h1 className="font-serif text-5xl font-light text-soft-black mb-4">
            Jouw dagboek
          </h1>
          <p className="text-lg text-warm-gray">
            Alle dagboeken op {String.fromCodePoint(0x00E9, 0x00E9)}n plek
          </p>
        </div>

        {/* Emotion Filters */}
        <div className="mb-8 flex flex-wrap gap-3 justify-center">
          {emotions.map((emotion) => (
            <button
              key={emotion.value}
              onClick={() => setSelectedEmotion(emotion.value)}
              className={`px-6 py-3 rounded-full border-2 transition-all ${
                selectedEmotion === emotion.value
                  ? 'bg-sage text-white border-sage'
                  : 'bg-white text-warm-gray border-sage/20 hover:border-sage/40'
              }`}
            >
              {emotion.emoji && <span className="mr-2">{emotion.emoji}</span>}
              {emotion.label} ({
                emotion.value === 'all' 
                  ? entries.length 
                  : entries.filter(e => e.emotion === emotion.value).length
              })
            </button>
          ))}
        </div>

        {/* Entries */}
        {loading ? (
          <div className="text-center py-16">
            <p className="text-warm-gray">Laden...</p>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="text-center py-16 bg-white/40 backdrop-blur-md rounded-3xl border border-sage/10">
            <div className="text-6xl mb-4">{String.fromCodePoint(0x1F4DD)}</div>
            <p className="text-warm-gray text-lg mb-6">
              {selectedEmotion === 'all' 
                ? 'Nog geen dagboeken'
                : `Nog geen dagboeken met ${emotions.find(e => e.value === selectedEmotion)?.label.toLowerCase()}`
              }
            </p>
            <p className="text-warm-gray mb-6">
              Begin met schrijven om je gedachten vast te leggen
            </p>
            <Link
              href="/journal/new"
              className="inline-block px-8 py-4 bg-sage text-white rounded-full hover:bg-deep-sage transition-all"
            >
              Schrijf je eerste dagboek
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredEntries.map((entry) => (
              <Link
                key={entry.id}
                href={`/journal/${entry.id}`}
                className="block bg-white/60 backdrop-blur-md rounded-3xl border border-sage/20 p-8 hover:shadow-lg transition-all"
              >
                <div className="flex items-start gap-4 mb-4">
                  <span className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl border-2 ${emotionColors[entry.emotion as keyof typeof emotionColors]}`}>
                    {getEmotionEmoji(entry.emotion)}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-lg text-soft-black font-medium">
                          {format(new Date(entry.created_at), 'EEEE d MMMM yyyy', { locale: nl })}
                        </p>
                        <p className="text-sm text-warm-gray">
                          {format(new Date(entry.created_at), 'HH:mm')}
                        </p>
                      </div>
                      <span className="px-4 py-2 bg-sage/10 text-sage rounded-full text-sm">
                        {emotions.find(e => e.value === entry.emotion)?.label}
                      </span>
                    </div>
                    <p className="text-warm-gray line-clamp-3 mt-3">
                      {entry.content}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Stats */}
        {entries.length > 0 && (
          <div className="mt-12 text-center p-8 bg-gradient-to-br from-mist to-cream rounded-3xl border border-sage/20">
            <div className="text-5xl mb-4">{String.fromCodePoint(0x1F4D6)}</div>
            <h3 className="text-2xl font-serif font-light text-soft-black mb-2">
              Je hebt {entries.length} {entries.length === 1 ? 'dagboek' : 'dagboeken'} geschreven
            </h3>
            <p className="text-warm-gray">Blijf doorgaan met je reis</p>
          </div>
        )}
      </div>
    </div>
  )
}