'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'

type Weather = 'storm' | 'rain' | 'cloudy' | 'partly_sunny' | 'sunny'

const weatherOptions = [
  { value: 'storm' as Weather, emoji: String.fromCodePoint(0x26C8, 0xFE0F), label: 'Storm' },
  { value: 'rain' as Weather, emoji: String.fromCodePoint(0x1F327, 0xFE0F), label: 'Regen' },
  { value: 'cloudy' as Weather, emoji: String.fromCodePoint(0x26C5), label: 'Bewolkt' },
  { value: 'partly_sunny' as Weather, emoji: String.fromCodePoint(0x1F324, 0xFE0F), label: 'Half bewolkt' },
  { value: 'sunny' as Weather, emoji: String.fromCodePoint(0x2600, 0xFE0F), label: 'Zonnig' },
]

export default function WeatherWidget({ userId }: { userId: string }) {
  const [todayWeather, setTodayWeather] = useState<Weather | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchTodayWeather()
  }, [userId])

  const fetchTodayWeather = async () => {
    const today = format(new Date(), 'yyyy-MM-dd')
    
    const { data } = await supabase
      .from('grief_weather')
      .select('weather')
      .eq('user_id', userId)
      .eq('created_at', today)
      .single()

    if (data) {
      setTodayWeather(data.weather as Weather)
    }
  }

  const handleQuickCheck = async (weather: Weather) => {
    setSaving(true)
    const today = format(new Date(), 'yyyy-MM-dd')

    await supabase
      .from('grief_weather')
      .upsert({
        user_id: userId,
        weather,
        created_at: today,
      }, {
        onConflict: 'user_id,created_at'
      })

    setTodayWeather(weather)
    setSaving(false)
  }

  const getWeatherEmoji = (weather: Weather) => {
    return weatherOptions.find(w => w.value === weather)?.emoji || String.fromCodePoint(0x2753)
  }

  return (
    <Link 
      href="/weather"
      className="block bg-gradient-to-br from-mist to-cream rounded-3xl border border-sage/20 p-8 hover:-translate-y-1 hover:shadow-lg transition-all"
    >
      <div className="flex items-start gap-4 mb-6">
        <div className="text-4xl">{String.fromCodePoint(0x1F327, 0xFE0F)}</div>
        <div className="flex-1">
          <h3 className="text-xl font-serif font-light text-soft-black mb-2">
            Jouw Rouwweer
          </h3>
          <p className="text-sm text-warm-gray">
            Hoe voelt je dag vandaag?
          </p>
        </div>
      </div>

      {!todayWeather ? (
        <div className="grid grid-cols-5 gap-2">
          {weatherOptions.map((option) => (
            <button
              key={option.value}
              onClick={(e) => {
                e.preventDefault()
                handleQuickCheck(option.value)
              }}
              disabled={saving}
              className="aspect-square bg-white rounded-xl hover:bg-sage/10 transition-all flex items-center justify-center text-2xl disabled:opacity-50"
              title={option.label}
            >
              {option.emoji}
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <div className="text-6xl mb-3">{getWeatherEmoji(todayWeather)}</div>
          <p className="text-sm text-warm-gray">
            Je weer vandaag: <span className="font-medium text-soft-black">
              {weatherOptions.find(w => w.value === todayWeather)?.label}
            </span>
          </p>
          <p className="text-xs text-sage mt-2">Klik om details te zien {String.fromCodePoint(0x2192)}</p>
        </div>
      )}
    </Link>
  )
}