'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'

export default function JournalPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [dagboeken, setdagboeken] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    checkUser()
    fetchdagboeken()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
    } else {
      setUser(user)
    }
  }

  const fetchdagboeken = async () => {
    const { data, error } = await supabase
      .from('journal_dagboeken')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setdagboeken(data)
    }
    setLoading(false)
  }

  const emotionEmojis: any = {
    verdriet: 'ðŸ˜¢',
    boosheid: 'ðŸ˜ ',
    angst: 'ðŸ˜°',
    vrede: 'ðŸ˜Œ',
    gemengd: 'ðŸŒŠ',
    neutraal: 'ðŸ˜'
  }

  const emotionColors: any = {
    verdriet: 'bg-blue-100 border-blue-300',
    boosheid: 'bg-red-100 border-red-300',
    angst: 'bg-yellow-100 border-yellow-300',
    vrede: 'bg-green-100 border-green-300',
    gemengd: 'bg-purple-100 border-purple-300',
    neutraal: 'bg-gray-100 border-gray-300'
  }

  const filtereddagboeken = filter === 'all' 
    ? dagboeken 
    : dagboeken.filter(e => e.emotion === filter)

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
          <div className="flex items-center gap-6">
            <Link href="/journal/new" className="px-6 py-3 bg-sage text-white rounded-full hover:bg-deep-sage transition-all">
              + Nieuwe dagboek
            </Link>
            <Link href="/dashboard" className="text-warm-gray hover:text-deep-sage transition-colors">
              â† Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="font-serif text-5xl font-light text-soft-black mb-4">
            Jouw dagboek
          </h1>
          <p className="text-lg text-warm-gray">
            Alle dagboeken op Ã©Ã©n plek
          </p>
        </div>

        {/* Filter */}
        <div className="flex flex-wrap gap-3 mb-8">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-3 rounded-full transition-all ${
              filter === 'all'
                ? 'bg-sage text-white'
                : 'bg-white/60 text-warm-gray hover:bg-white'
            }`}
          >
            Alle ({dagboeken.length})
          </button>
          {['verdriet', 'boosheid', 'angst', 'vrede', 'gemengd', 'neutraal'].map((emotion) => {
            const count = dagboeken.filter(e => e.emotion === emotion).length
            return (
              <button
                key={emotion}
                onClick={() => setFilter(emotion)}
                className={`px-6 py-3 rounded-full transition-all capitalize ${
                  filter === emotion
                    ? 'bg-sage text-white'
                    : 'bg-white/60 text-warm-gray hover:bg-white'
                }`}
              >
                {emotionEmojis[emotion]} {emotion} ({count})
              </button>
            )
          })}
        </div>

        {/* dagboeken */}
        {filtereddagboeken.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-6">ðŸ“</div>
            <h2 className="font-serif text-3xl font-light text-soft-black mb-4">
              {filter === 'all' ? 'Nog geen dagboeken' : `Geen dagboeken met ${filter}`}
            </h2>
            <p className="text-warm-gray mb-8">
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
          <div className="space-y-4">
            {filtereddagboeken.map((dagboek) => (
              <Link
                key={dagboek.id}
                href={`/journal/${dagboek.id}`}
                className="block p-6 bg-white/60 backdrop-blur-md rounded-2xl border border-sage/10 hover:border-sage/30 hover:shadow-lg transition-all"
              >
                <div className="flex items-start gap-4">
                  <span className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl border-2 flex-shrink-0 ${emotionColors[dagboek.emotion]}`}>
                    {emotionEmojis[dagboek.emotion]}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-warm-gray">
                        {format(new Date(dagboek.created_at), 'EEEE d MMMM yyyy', { locale: nl })}
                      </p>
                      <p className="text-xs text-warm-gray/60">
                        {format(new Date(dagboek.created_at), 'HH:mm')}
                      </p>
                    </div>
                    <p className="text-warm-gray line-clamp-3 leading-relaxed">
                      {dagboek.content}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
