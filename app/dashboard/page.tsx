'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase, JournalEntry } from '@/lib/supabase'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'
import WeatherWidget from '@/components/WeatherWidget'
import MilestonesWidget from '@/components/MilestonesWidget'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [entries, setEntries] = useState<JournalEntry[]>([])
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
      .order('created_at', { ascending: false })
      .limit(5)

    if (!error && data) {
      setEntries(data)
    }
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const emotionEmojis = {
    verdriet: String.fromCodePoint(0x1F622),
    boosheid: String.fromCodePoint(0x1F620),
    angst: String.fromCodePoint(0x1F630),
    vrede: String.fromCodePoint(0x1F60C),
    gemengd: String.fromCodePoint(0x1F30A),
    neutraal: String.fromCodePoint(0x1F610)
  }

  const emotionColors = {
    verdriet: 'bg-blue-100 border-blue-300',
    boosheid: 'bg-red-100 border-red-300',
    angst: 'bg-yellow-100 border-yellow-300',
    vrede: 'bg-green-100 border-green-300',
    gemengd: 'bg-purple-100 border-purple-300',
    neutraal: 'bg-gray-100 border-gray-300'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-warm-gray">Laden...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream">
      <nav className="border-b border-sage/20 bg-white/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="font-serif text-2xl font-light text-soft-black tracking-[2px]">
            STILTE RUIMTE
          </Link>
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-warm-gray hover:text-deep-sage transition-colors">Dashboard</Link>
            <Link href="/journal/new" className="text-warm-gray hover:text-deep-sage transition-colors">Nieuw dagboek</Link>
            <Link href="/journal" className="text-warm-gray hover:text-deep-sage transition-colors">Alle entries</Link>
            <Link href="/loved-ones" className="text-warm-gray hover:text-deep-sage transition-colors">Instellingen</Link>
            <button onClick={handleLogout} className="text-warm-gray hover:text-deep-sage transition-colors">Uitloggen</button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="font-serif text-5xl font-light text-soft-black mb-4">
            Welkom terug{user?.user_metadata?.name ? `, ${user.user_metadata.name}` : ''}
          </h1>
          <p className="text-xl text-warm-gray">Hoe voel je je vandaag?</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <Link href="/journal/new" className="bg-gradient-to-br from-sage to-deep-sage text-white p-8 rounded-3xl hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="text-4xl mb-4">{String.fromCodePoint(0x270F, 0xFE0F)}</div>
            <h3 className="font-serif text-2xl font-light mb-2">Schrijf in je dagboek</h3>
            <p className="text-white/80">Begin met schrijven</p>
          </Link>

          <Link href="/emotions" className="bg-white/80 backdrop-blur-md border border-sage/20 p-8 rounded-3xl hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="text-4xl mb-4">{String.fromCodePoint(0x1F30A)}</div>
            <h3 className="font-serif text-2xl font-light mb-2 text-soft-black">Emoties bijhouden</h3>
            <p className="text-warm-gray">Hoe voel je je nu?</p>
          </Link>

          <Link href="/progress" className="bg-white/80 backdrop-blur-md border border-sage/20 p-8 rounded-3xl hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="text-4xl mb-4">{String.fromCodePoint(0x1F331)}</div>
            <h3 className="font-serif text-2xl font-light mb-2 text-soft-black">Jouw progressie</h3>
            <p className="text-warm-gray">Bekijk je reis</p>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {user && <WeatherWidget userId={user.id} />}
          {user && <MilestonesWidget userId={user.id} />}
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Link href="/letters" className="bg-white/80 backdrop-blur-md border border-sage/20 p-8 rounded-3xl hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="text-4xl mb-4">{String.fromCodePoint(0x2709, 0xFE0F)}</div>
            <h3 className="font-serif text-2xl font-light mb-2 text-soft-black">Schrijf een brief</h3>
            <p className="text-warm-gray">Wat je altijd had willen zeggen</p>
          </Link>

          <Link href="/milestones" className="bg-white/80 backdrop-blur-md border border-sage/20 p-8 rounded-3xl hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="text-4xl mb-4">{String.fromCodePoint(0x1F4C5)}</div>
            <h3 className="font-serif text-2xl font-light mb-2 text-soft-black">Belangrijke Momenten</h3>
            <p className="text-warm-gray">Track sterfdagen en verjaardagen</p>
          </Link>

          <Link href="/loved-ones" className="bg-white/80 backdrop-blur-md border border-sage/20 p-8 rounded-3xl hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="text-4xl mb-4">{String.fromCodePoint(0x1F49D)}</div>
            <h3 className="font-serif text-2xl font-light mb-2 text-soft-black">Mijn Dierbaren</h3>
            <p className="text-warm-gray">Beheer meerdere overledenen</p>
          </Link>
        </div>

        <div className="bg-white/60 backdrop-blur-md border border-sage/20 rounded-3xl p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="font-serif text-3xl font-light text-soft-black">Recente entries</h2>
            <Link href="/journal" className="text-sage hover:text-deep-sage transition-colors">Bekijk alles â†’</Link>
          </div>

          {entries.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">{String.fromCodePoint(0x1F4DD)}</div>
              <p className="text-warm-gray text-lg mb-6">Je hebt nog geen entries geschreven</p>
              <Link href="/journal/new" className="inline-block px-8 py-4 bg-sage text-white rounded-full hover:bg-deep-sage transition-all">
                Schrijf je eerste entry
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {entries.map((entry) => (
                <Link key={entry.id} href={`/journal/${entry.id}`} className="block p-6 bg-white rounded-2xl border border-sage/10 hover:border-sage/30 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className={`w-12 h-12 rounded-full flex items-center justify-center text-xl border-2 ${emotionColors[entry.emotion]}`}>
                        {emotionEmojis[entry.emotion]}
                      </span>
                      <div>
                        <p className="text-sm text-warm-gray">{format(new Date(entry.created_at), 'EEEE d MMMM yyyy', { locale: nl })}</p>
                        <p className="text-xs text-warm-gray/60">{format(new Date(entry.created_at), 'HH:mm')}</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-warm-gray line-clamp-3">{entry.content}</p>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="mt-12 bg-gradient-to-br from-mist to-cream rounded-3xl p-10 border border-sage/20">
          <div className="flex items-start gap-6">
            <div className="text-5xl">{String.fromCodePoint(0x1F91D)}</div>
            <div className="flex-1">
              <h3 className="font-serif text-2xl font-light text-soft-black mb-3">AI Companion beschikbaar</h3>
              <p className="text-warm-gray mb-6">Wil je hulp bij het verwerken van je gedachten? Onze AI kan je zachtmoedig begeleiden door moeilijke momenten.</p>
              <Link href="/ai-companion" className="inline-block px-6 py-3 bg-sage text-white rounded-full hover:bg-deep-sage transition-all">Start een gesprek</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}