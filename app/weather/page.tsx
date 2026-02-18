'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, subMonths, addMonths } from 'date-fns'
import { nl } from 'date-fns/locale'

type Weather = 'storm' | 'rain' | 'cloudy' | 'partly_sunny' | 'sunny'

interface WeatherEntry {
  id: string
  weather: Weather
  note: string | null
  created_at: string
}

const weatherOptions = [
  { value: 'storm' as Weather, emoji: '⛈️', label: 'Storm', desc: 'Overweldigend zwaar' },
  { value: 'rain' as Weather, emoji: '🌧️', label: 'Regen', desc: 'Verdrietig, tranen' },
  { value: 'cloudy' as Weather, emoji: '⛅', label: 'Bewolkt', desc: 'Grijs, zwaar' },
  { value: 'partly_sunny' as Weather, emoji: '🌤️', label: 'Half bewolkt', desc: 'Ups en downs' },
  { value: 'sunny' as Weather, emoji: '☀️', label: 'Zonnig', desc: 'Licht, draaglijk' },
]

export default function WeatherPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [todayWeather, setTodayWeather] = useState<Weather | null>(null)
  const [todayNote, setTodayNote] = useState('')
  const [showNoteInput, setShowNoteInput] = useState(false)
  const [saving, setSaving] = useState(false)
  const [weatherHistory, setWeatherHistory] = useState<WeatherEntry[]>([])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    if (user) {
      fetchWeatherHistory()
    }
  }, [user, currentMonth])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
    } else {
      setUser(user)
    }
  }

  const fetchWeatherHistory = async () => {
    setLoading(true)
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)

    const { data, error } = await supabase
      .from('grief_weather')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', format(start, 'yyyy-MM-dd'))
      .lte('created_at', format(end, 'yyyy-MM-dd'))
      .order('created_at', { ascending: false })

    if (!error && data) {
      setWeatherHistory(data)
      
      // Check if today's weather exists
      const today = format(new Date(), 'yyyy-MM-dd')
      const todayEntry = data.find(entry => entry.created_at === today)
      if (todayEntry) {
        setTodayWeather(todayEntry.weather as Weather)
        setTodayNote(todayEntry.note || '')
      }
    }
    setLoading(false)
  }

  const handleWeatherSelect = async (weather: Weather) => {
    setTodayWeather(weather)
    setShowNoteInput(true)
  }

  const handleSave = async () => {
    if (!todayWeather) return

    setSaving(true)
    const today = format(new Date(), 'yyyy-MM-dd')

    const { error } = await supabase
      .from('grief_weather')
      .upsert({
        user_id: user.id,
        weather: todayWeather,
        note: todayNote.trim() || null,
        created_at: today,
      }, {
        onConflict: 'user_id,created_at'
      })

    if (!error) {
      await fetchWeatherHistory()
      setShowNoteInput(false)
    }
    setSaving(false)
  }

  const getWeatherForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return weatherHistory.find(entry => entry.created_at === dateStr)
  }

  const getDaysInMonth = () => {
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)
    return eachDayOfInterval({ start, end })
  }

  const getWeatherEmoji = (weather: Weather) => {
    return weatherOptions.find(w => w.value === weather)?.emoji || '❓'
  }

  const getWeatherStats = () => {
    const counts: Record<Weather, number> = {
      storm: 0,
      rain: 0,
      cloudy: 0,
      partly_sunny: 0,
      sunny: 0
    }

    weatherHistory.forEach(entry => {
      counts[entry.weather as Weather]++
    })

    return counts
  }

  const stats = getWeatherStats()
  const totalDays = weatherHistory.length
  const days = getDaysInMonth()

  return (
    <div className="min-h-screen bg-cream">
      {/* Navigation */}
      <nav className="border-b border-sage/20 bg-white/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="font-serif text-2xl font-light text-soft-black tracking-[2px]">
            STILTE RUIMTE
          </Link>
          <Link href="/dashboard" className="text-warm-gray hover:text-deep-sage transition-colors">
            ← Terug
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="font-serif text-5xl font-light text-soft-black mb-4">
            Jouw Rouwweer 🌦️
          </h1>
          <p className="text-lg text-warm-gray">
            Hoe voelt je dag vandaag? Kies je weer, zonder uitleg nodig.
          </p>
        </div>

        {/* Today's Check-in */}
        <div className="mb-12 bg-white/60 backdrop-blur-md rounded-3xl border border-sage/20 p-8">
          <h2 className="text-2xl font-serif font-light text-soft-black mb-6">
            Vandaag: {format(new Date(), 'd MMMM yyyy', { locale: nl })}
          </h2>

          {!todayWeather ? (
            <>
              <p className="text-warm-gray mb-6">Kies je weer voor vandaag:</p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {weatherOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleWeatherSelect(option.value)}
                    className="p-6 bg-mist rounded-2xl hover:bg-sage/10 hover:border-sage transition-all border-2 border-transparent flex flex-col items-center gap-3"
                  >
                    <div className="text-5xl">{option.emoji}</div>
                    <div className="text-sm font-medium text-soft-black">{option.label}</div>
                    <div className="text-xs text-warm-gray text-center">{option.desc}</div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center">
              <div className="text-8xl mb-4">{getWeatherEmoji(todayWeather)}</div>
              <p className="text-xl text-warm-gray mb-6">
                Je weer vandaag: <span className="font-medium text-soft-black">
                  {weatherOptions.find(w => w.value === todayWeather)?.label}
                </span>
              </p>

              {showNoteInput ? (
                <div className="max-w-md mx-auto">
                  <textarea
                    value={todayNote}
                    onChange={(e) => setTodayNote(e.target.value)}
                    placeholder="Optioneel: voeg een notitie toe over hoe je je voelt..."
                    className="w-full p-4 bg-white/60 border border-sage/20 rounded-2xl outline-none focus:ring-2 focus:ring-sage/50 resize-none mb-4"
                    rows={3}
                  />
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-8 py-3 bg-sage text-white rounded-full hover:bg-deep-sage transition-all disabled:opacity-50"
                    >
                      {saving ? 'Bezig...' : 'Opslaan'}
                    </button>
                    <button
                      onClick={() => setShowNoteInput(false)}
                      className="px-8 py-3 bg-mist text-warm-gray rounded-full hover:bg-gray-200 transition-all"
                    >
                      Annuleren
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setTodayWeather(null)}
                  className="text-sage hover:text-deep-sage transition-colors"
                >
                  Wijzig weer
                </button>
              )}
            </div>
          )}
        </div>

        {/* Stats */}
        {totalDays > 0 && (
          <div className="mb-12 bg-white/60 backdrop-blur-md rounded-3xl border border-sage/20 p-8">
            <h2 className="text-2xl font-serif font-light text-soft-black mb-6">
              Deze maand ({totalDays} {totalDays === 1 ? 'dag' : 'dagen'})
            </h2>
            <div className="grid grid-cols-5 gap-4">
              {weatherOptions.map((option) => (
                <div key={option.value} className="text-center">
                  <div className="text-4xl mb-2">{option.emoji}</div>
                  <div className="text-2xl font-medium text-soft-black">{stats[option.value]}</div>
                  <div className="text-xs text-warm-gray">{option.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Calendar */}
        <div className="bg-white/60 backdrop-blur-md rounded-3xl border border-sage/20 p-8">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-2 hover:bg-sage/10 rounded-full transition-all"
            >
              ←
            </button>
            <h2 className="text-2xl font-serif font-light text-soft-black">
              {format(currentMonth, 'MMMM yyyy', { locale: nl })}
            </h2>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              disabled={currentMonth >= new Date()}
              className="p-2 hover:bg-sage/10 rounded-full transition-all disabled:opacity-30"
            >
              →
            </button>
          </div>

          {/* Day names */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-warm-gray py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Empty cells for days before month starts */}
            {Array.from({ length: (days[0].getDay() + 6) % 7 }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {/* Days */}
            {days.map((day) => {
              const weatherEntry = getWeatherForDate(day)
              const isToday = isSameDay(day, new Date())
              const isFuture = day > new Date()

              return (
                <div
                  key={day.toISOString()}
                  className={`
                    aspect-square p-2 rounded-2xl border-2 flex flex-col items-center justify-center
                    ${isToday ? 'border-sage bg-sage/5' : 'border-transparent'}
                    ${isFuture ? 'opacity-30' : ''}
                    ${weatherEntry ? 'bg-white' : 'bg-mist/30'}
                  `}
                >
                  <div className="text-xs text-warm-gray mb-1">{format(day, 'd')}</div>
                  {weatherEntry && (
                    <div className="text-2xl" title={weatherEntry.note || ''}>
                      {getWeatherEmoji(weatherEntry.weather as Weather)}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Info */}
        <div className="mt-8 p-6 bg-white/40 backdrop-blur-md rounded-2xl border border-sage/10">
          <div className="flex items-start gap-3">
            <div className="text-xl">💡</div>
            <div className="text-sm text-warm-gray">
              <p className="mb-2"><strong>Waarom Rouwweer?</strong></p>
              <p>Soms is het moeilijk om te verwoorden hoe je je voelt. Met één klik deel je je "weer" - geen woorden nodig. Kijk terug en zie patronen, of deel je storm met iemand die om je geeft.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
