'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { differenceInDays, addYears, isPast } from 'date-fns'

interface Milestone {
  title: string
  date: string
  recurring: boolean
  loved_one: Array<{name: string}>
}

export default function MilestonesWidget({ userId }: { userId: string }) {
  const [nextMilestone, setNextMilestone] = useState<Milestone | null>(null)
  const [daysUntil, setDaysUntil] = useState<number>(0)

  useEffect(() => {
    fetchNextMilestone()
  }, [userId])

  const getNextOccurrence = (dateStr: string, isRecurring: boolean) => {
    const milestoneDate = new Date(dateStr)
    const today = new Date()
    
    if (!isRecurring) {
      return milestoneDate
    }

    let nextDate = new Date(today.getFullYear(), milestoneDate.getMonth(), milestoneDate.getDate())
    
    if (isPast(nextDate)) {
      nextDate = addYears(nextDate, 1)
    }
    
    return nextDate
  }

  const fetchNextMilestone = async () => {
    const { data, error } = await supabase
      .from('grief_milestones')
      .select(`
        title,
        date,
        recurring,
        loved_one:loved_ones(name)
      `)
      .eq('user_id', userId)

    if (!error && data && data.length > 0) {
      const now = new Date()
      const upcoming = data
        .map(m => ({
          ...m,
          nextDate: getNextOccurrence(m.date, m.recurring),
          daysUntil: differenceInDays(getNextOccurrence(m.date, m.recurring), now)
        }))
        .filter(m => m.daysUntil >= 0)
        .sort((a, b) => a.daysUntil - b.daysUntil)

      if (upcoming.length > 0) {
        setNextMilestone(upcoming[0])
        setDaysUntil(upcoming[0].daysUntil)
      }
    }
  }

  if (!nextMilestone) {
    return (
      <Link
        href="/milestones"
        className="block bg-gradient-to-br from-mist to-cream rounded-3xl border border-sage/20 p-8 hover:-translate-y-1 hover:shadow-lg transition-all"
      >
        <div className="flex items-start gap-4 mb-6">
          <div className="text-4xl">{String.fromCodePoint(0x1F4C5)}</div>
          <div className="flex-1">
            <h3 className="text-xl font-serif font-light text-soft-black mb-2">
              Belangrijke Momenten
            </h3>
            <p className="text-sm text-warm-gray">
              Track belangrijke momenten
            </p>
          </div>
        </div>
        <div className="text-center py-4">
          <p className="text-sm text-sage">Begin met het toevoegen van momenten {String.fromCodePoint(0x2192)}</p>
        </div>
      </Link>
    )
  }

  return (
    <Link
      href="/milestones"
      className="block bg-gradient-to-br from-sage/10 to-deep-sage/10 rounded-3xl border border-sage/20 p-8 hover:-translate-y-1 hover:shadow-lg transition-all"
    >
      <div className="flex items-start gap-4 mb-4">
        <div className="text-4xl">{String.fromCodePoint(0x1F4C5)}</div>
        <div className="flex-1">
          <h3 className="text-xl font-serif font-light text-soft-black mb-2">
            Belangrijke Momenten
          </h3>
          <p className="text-sm text-warm-gray mb-1">
            Binnenkort:
          </p>
        </div>
      </div>

      <div className="bg-white/60 backdrop-blur-md rounded-2xl p-6">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h4 className="font-medium text-soft-black mb-1">
              {nextMilestone.title}
            </h4>
            <p className="text-sm text-warm-gray">
              {nextMilestone.loved_one?.[0]?.name}
            </p>
          </div>
          <div className={`text-right ${daysUntil <= 7 ? 'text-sage' : 'text-warm-gray'}`}>
            <div className="text-2xl font-medium">
              {daysUntil === 0 ? String.fromCodePoint(0x2757) : daysUntil}
            </div>
            <div className="text-xs">
              {daysUntil === 0 ? 'Vandaag' : daysUntil === 1 ? 'dag' : 'dagen'}
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-sage mt-4 text-center">
        Klik om alle momenten te zien {String.fromCodePoint(0x2192)}
      </p>
    </Link>
  )
}