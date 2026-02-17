'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns'
import { nl } from 'date-fns/locale'

export default function ProgressPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [entries, setEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
    fetchEntries()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
    } else {
      setUser(user)
    }
  }

  const fetchEntries = async () => {
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .order('created_at', { ascending: true })

    if (!error && data) {
      setEntries(data)
    }
    setLoading(false)
  }

  const emotionEmojis: any = {
    verdriet: '😢',
    boosheid: '😠',
    angst: '😰',
    vrede: '😌',
    gemengd: '🌊',
    neutraal: '😐'
  }

  const emotionColors: any = {
    verdriet: '#93C5FD',
    boosheid: '#FCA5A5',
    angst: '#FDE047',
    vrede: '#86EFAC',
    gemengd: '#C4B5FD',
    neutraal: '#D1D5DB'
  }

  // Calculate stats
  const totalEntries = entries.length
  const emotionCounts = entries.reduce((acc: any, entry) => {
    acc[entry.emotion] = (acc[entry.emotion] || 0) + 1
    return acc
  }, {})

  const mostCommonEmotion = Object.keys(emotionCounts).reduce((a, b) => 
    emotionCounts[a] > emotionCounts[b] ? a : b
  , 'neutraal')

  // Group by week
  const weeklyData = entries.reduce((acc: any, entry) => {
    const week = format(new Date(entry.created_at), 'w yyyy', { locale: nl })
    if (!acc[week]) acc[week] = []
    acc[week].push(entry)
    return acc
  }, {})

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-warm-gray">Laden...</div>
      </div>
    )
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

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="font-serif text-5xl font-light text-soft-black mb-4">
            Jouw progressie
          </h1>
          <p className="text-lg text-warm-gray">
            Een overzicht van je reis tot nu toe
          </p>
        </div>

        {entries.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-6">🌱</div>
            <h2 className="font-serif text-3xl font-light text-soft-black mb-4">
              Begin met schrijven
            </h2>
            <p className="text-warm-gray mb-8">
              Je progressie wordt zichtbaar zodra je begint met dagboeken
            </p>
            <Link
              href="/journal/new"
              className="inline-block px-8 py-4 bg-sage text-white rounded-full hover:bg-deep-sage transition-all"
            >
              Schrijf je eerste entry
            </Link>
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white/60 backdrop-blur-md rounded-3xl border border-sage/20 p-8">
                <div className="text-4xl mb-3">📝</div>
                <div className="text-4xl font-serif font-light text-soft-black mb-2">
                  {totalEntries}
                </div>
                <div className="text-warm-gray">
                  {totalEntries === 1 ? 'Entry geschreven' : 'Entries geschreven'}
                </div>
              </div>

              <div className="bg-white/60 backdrop-blur-md rounded-3xl border border-sage/20 p-8">
                <div className="text-4xl mb-3">{emotionEmojis[mostCommonEmotion]}</div>
                <div className="text-2xl font-serif font-light text-soft-black mb-2 capitalize">
                  {mostCommonEmotion}
                </div>
                <div className="text-warm-gray">Meest voorkomende emotie</div>
              </div>

              <div className="bg-white/60 backdrop-blur-md rounded-3xl border border-sage/20 p-8">
                <div className="text-4xl mb-3">📅</div>
                <div className="text-2xl font-serif font-light text-soft-black mb-2">
                  {format(new Date(entries[0].created_at), 'd MMM', { locale: nl })}
                </div>
                <div className="text-warm-gray">Begonnen op</div>
              </div>
            </div>

            {/* Emotion Distribution */}
            <div className="bg-white/60 backdrop-blur-md rounded-3xl border border-sage/20 p-8 mb-12">
              <h2 className="font-serif text-3xl font-light text-soft-black mb-8">
                Emotie verdeling
              </h2>
              <div className="space-y-4">
                {Object.entries(emotionCounts).map(([emotion, count]: any) => (
                  <div key={emotion}>
                    <div className="flex justify-between mb-2">
                      <span className="flex items-center gap-2 text-warm-gray capitalize">
                        <span className="text-2xl">{emotionEmojis[emotion]}</span>
                        {emotion}
                      </span>
                      <span className="text-warm-gray font-medium">{count}x</span>
                    </div>
                    <div className="w-full bg-mist rounded-full h-3">
                      <div
                        className="h-3 rounded-full transition-all duration-500"
                        style={{
                          width: `${(count / totalEntries) * 100}%`,
                          backgroundColor: emotionColors[emotion]
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white/60 backdrop-blur-md rounded-3xl border border-sage/20 p-8">
              <h2 className="font-serif text-3xl font-light text-soft-black mb-8">
                Tijdlijn
              </h2>
              <div className="space-y-6">
                {entries.slice().reverse().map((entry, index) => (
                  <Link
                    key={entry.id}
                    href={`/journal/${entry.id}`}
                    className="block p-6 bg-mist rounded-2xl hover:bg-white transition-all border border-sage/10 hover:border-sage/30"
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">{emotionEmojis[entry.emotion]}</div>
                      <div className="flex-1">
                        <div className="text-sm text-warm-gray mb-2">
                          {format(new Date(entry.created_at), 'EEEE d MMMM yyyy - HH:mm', { locale: nl })}
                        </div>
                        <p className="text-warm-gray line-clamp-2">{entry.content}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
