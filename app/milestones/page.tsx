'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { differenceInDays, format, isFuture, isPast, addYears } from 'date-fns'
import { nl } from 'date-fns/locale'

interface LovedOne {
  id: string
  name: string
  relationship: string
}

interface Milestone {
  id: string
  loved_one_id: string
  loved_one?: LovedOne
  milestone_type: string
  title: string
  date: string
  ritual_notes: string | null
  recurring: boolean
  notify_days_before: number
}

const milestoneTypes = [
  { value: 'death_anniversary', label: 'Sterfdag', emoji: '🕯️' },
  { value: 'birthday', label: 'Verjaardag', emoji: '🎂' },
  { value: 'wedding_anniversary', label: 'Trouwdag', emoji: '💍' },
  { value: 'first_without', label: 'Eerste [gebeurtenis] zonder', emoji: '💔' },
  { value: 'other', label: 'Andere', emoji: '📅' }
]

export default function MilestonesPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [lovedOnes, setLovedOnes] = useState<LovedOne[]>([])
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  // Form state
  const [lovedOneId, setLovedOneId] = useState('')
  const [milestoneType, setMilestoneType] = useState('')
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [ritualNotes, setRitualNotes] = useState('')
  const [recurring, setRecurring] = useState(false)
  const [notifyDaysBefore, setNotifyDaysBefore] = useState(7)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    if (user) {
      fetchLovedOnes()
      fetchMilestones()
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

  const fetchLovedOnes = async () => {
    const { data, error } = await supabase
      .from('loved_ones')
      .select('id, name, relationship')
      .eq('user_id', user.id)

    if (!error && data) {
      setLovedOnes(data)
    }
  }

  const fetchMilestones = async () => {
    const { data, error } = await supabase
      .from('grief_milestones')
      .select(`
        *,
        loved_one:loved_ones(id, name, relationship)
      `)
      .eq('user_id', user.id)
      .order('date', { ascending: true })

    if (!error && data) {
      setMilestones(data)
    }
  }

  const resetForm = () => {
    setLovedOneId('')
    setMilestoneType('')
    setTitle('')
    setDate('')
    setRitualNotes('')
    setRecurring(false)
    setNotifyDaysBefore(7)
    setEditingId(null)
    setShowForm(false)
  }

  const handleEdit = (milestone: Milestone) => {
    setLovedOneId(milestone.loved_one_id)
    setMilestoneType(milestone.milestone_type)
    setTitle(milestone.title)
    setDate(milestone.date)
    setRitualNotes(milestone.ritual_notes || '')
    setRecurring(milestone.recurring)
    setNotifyDaysBefore(milestone.notify_days_before)
    setEditingId(milestone.id)
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!lovedOneId || !milestoneType || !title.trim() || !date) {
      alert('Vul alle verplichte velden in')
      return
    }

    setSaving(true)

    if (editingId) {
      const { error } = await supabase
        .from('grief_milestones')
        .update({
          loved_one_id: lovedOneId,
          milestone_type: milestoneType,
          title: title.trim(),
          date,
          ritual_notes: ritualNotes.trim() || null,
          recurring,
          notify_days_before: notifyDaysBefore
        })
        .eq('id', editingId)

      if (!error) {
        await fetchMilestones()
        resetForm()
      }
    } else {
      const { error } = await supabase
        .from('grief_milestones')
        .insert({
          user_id: user.id,
          loved_one_id: lovedOneId,
          milestone_type: milestoneType,
          title: title.trim(),
          date,
          ritual_notes: ritualNotes.trim() || null,
          recurring,
          notify_days_before: notifyDaysBefore
        })

      if (!error) {
        await fetchMilestones()
        resetForm()
      }
    }

    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Weet je zeker dat je deze milestone wilt verwijderen?')) return

    const { error } = await supabase
      .from('grief_milestones')
      .delete()
      .eq('id', id)

    if (!error) {
      await fetchMilestones()
    }
  }

  const getNextOccurrence = (dateStr: string, isRecurring: boolean) => {
    const milestoneDate = new Date(dateStr)
    const today = new Date()
    
    if (!isRecurring) {
      return milestoneDate
    }

    // For recurring, find next occurrence this year or next year
    let nextDate = new Date(today.getFullYear(), milestoneDate.getMonth(), milestoneDate.getDate())
    
    if (isPast(nextDate)) {
      nextDate = addYears(nextDate, 1)
    }
    
    return nextDate
  }

  const getDaysUntil = (dateStr: string, isRecurring: boolean) => {
    const nextDate = getNextOccurrence(dateStr, isRecurring)
    return differenceInDays(nextDate, new Date())
  }

  const upcomingMilestones = milestones
    .filter(m => {
      const daysUntil = getDaysUntil(m.date, m.recurring)
      return daysUntil >= 0 && daysUntil <= 60
    })
    .sort((a, b) => getDaysUntil(a.date, a.recurring) - getDaysUntil(b.date, b.recurring))

  return (
    <div className="min-h-screen bg-cream">
      {/* Navigation */}
      <nav className="border-b border-sage/20 bg-white/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="font-serif text-2xl font-light text-soft-black tracking-[2px]">
            STILTE RUIMTE
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/loved-ones" className="text-warm-gray hover:text-deep-sage transition-colors">
              Beheer dierbaren
            </Link>
            <Link href="/dashboard" className="text-warm-gray hover:text-deep-sage transition-colors">
              ← Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="font-serif text-5xl font-light text-soft-black mb-4">
            Belangrijke Momenten 📅
          </h1>
          <p className="text-lg text-warm-gray">
            Track en bereid je voor op belangrijke data
          </p>
        </div>

        {/* No loved ones warning */}
        {lovedOnes.length === 0 && (
          <div className="mb-8 p-6 bg-yellow-50 border border-yellow-200 rounded-3xl">
            <div className="flex items-start gap-3">
              <div className="text-2xl">⚠️</div>
              <div>
                <p className="text-soft-black font-medium mb-2">Je hebt nog geen dierbaren toegevoegd</p>
                <p className="text-warm-gray text-sm mb-4">
                  Voeg eerst je dierbaren toe om milestones te kunnen tracken
                </p>
                <Link
                  href="/loved-ones"
                  className="inline-block px-6 py-2 bg-sage text-white rounded-full hover:bg-deep-sage transition-all"
                >
                  Voeg dierbare toe
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Upcoming Milestones */}
        {upcomingMilestones.length > 0 && (
          <div className="mb-12 bg-gradient-to-br from-sage/10 to-deep-sage/10 rounded-3xl border border-sage/20 p-8">
            <h2 className="text-2xl font-serif font-light text-soft-black mb-6">
              Binnenkort 🔔
            </h2>
            <div className="space-y-4">
              {upcomingMilestones.map((milestone) => {
                const daysUntil = getDaysUntil(milestone.date, milestone.recurring)
                const nextDate = getNextOccurrence(milestone.date, milestone.recurring)
                
                return (
                  <div
                    key={milestone.id}
                    className="bg-white/60 backdrop-blur-md rounded-2xl p-6 flex items-start justify-between"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">
                          {milestoneTypes.find(t => t.value === milestone.milestone_type)?.emoji}
                        </span>
                        <div>
                          <h3 className="font-medium text-soft-black">{milestone.title}</h3>
                          <p className="text-sm text-warm-gray">
                            {milestone.loved_one?.name} • {format(nextDate, 'd MMMM yyyy', { locale: nl })}
                          </p>
                        </div>
                      </div>
                      {milestone.ritual_notes && (
                        <p className="text-sm text-warm-gray ml-11 mt-2">
                          💡 {milestone.ritual_notes}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-medium ${daysUntil <= 7 ? 'text-sage' : 'text-warm-gray'}`}>
                        {daysUntil === 0 ? 'Vandaag!' : daysUntil === 1 ? 'Morgen' : `${daysUntil} dagen`}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Add Button */}
        {!showForm && lovedOnes.length > 0 && (
          <div className="mb-8 text-center">
            <button
              onClick={() => setShowForm(true)}
              className="px-8 py-4 bg-sage text-white rounded-full hover:bg-deep-sage transition-all"
            >
              + Voeg milestone toe
            </button>
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="mb-12 bg-white/60 backdrop-blur-md rounded-3xl border border-sage/20 p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-serif font-light text-soft-black">
                {editingId ? 'Bewerk' : 'Nieuwe'} milestone
              </h2>
              <button onClick={resetForm} className="text-warm-gray hover:text-soft-black">✕</button>
            </div>

            <div className="space-y-4">
              {/* Loved One */}
              <div>
                <label className="block text-sm font-medium text-warm-gray mb-2">
                  Voor wie? *
                </label>
                <select
                  value={lovedOneId}
                  onChange={(e) => setLovedOneId(e.target.value)}
                  className="w-full px-4 py-3 bg-white/60 border border-sage/20 rounded-2xl outline-none focus:ring-2 focus:ring-sage/50"
                >
                  <option value="">Kies een dierbare...</option>
                  {lovedOnes.map(lo => (
                    <option key={lo.id} value={lo.id}>{lo.name} ({lo.relationship})</option>
                  ))}
                </select>
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-warm-gray mb-2">
                  Type milestone *
                </label>
                <select
                  value={milestoneType}
                  onChange={(e) => setMilestoneType(e.target.value)}
                  className="w-full px-4 py-3 bg-white/60 border border-sage/20 rounded-2xl outline-none focus:ring-2 focus:ring-sage/50"
                >
                  <option value="">Kies type...</option>
                  {milestoneTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.emoji} {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-warm-gray mb-2">
                  Titel *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Bijv: Eerste verjaardag zonder mama"
                  className="w-full px-4 py-3 bg-white/60 border border-sage/20 rounded-2xl outline-none focus:ring-2 focus:ring-sage/50"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-warm-gray mb-2">
                  Datum *
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 bg-white/60 border border-sage/20 rounded-2xl outline-none focus:ring-2 focus:ring-sage/50"
                />
              </div>

              {/* Recurring */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="recurring"
                  checked={recurring}
                  onChange={(e) => setRecurring(e.target.checked)}
                  className="w-5 h-5 text-sage focus:ring-sage/50"
                />
                <label htmlFor="recurring" className="text-sm text-warm-gray">
                  Jaarlijks terugkerend (bijv. verjaardag, sterfdag)
                </label>
              </div>

              {/* Ritual Notes */}
              <div>
                <label className="block text-sm font-medium text-warm-gray mb-2">
                  Ritueel / Wat ga je doen? (optioneel)
                </label>
                <textarea
                  value={ritualNotes}
                  onChange={(e) => setRitualNotes(e.target.value)}
                  placeholder="Bijv: Bloemen brengen naar graf, favoriete maaltijd koken, herinneringsvideo maken..."
                  className="w-full px-4 py-3 bg-white/60 border border-sage/20 rounded-2xl outline-none focus:ring-2 focus:ring-sage/50 resize-none"
                  rows={3}
                />
              </div>

              {/* Notify Days Before */}
              <div>
                <label className="block text-sm font-medium text-warm-gray mb-2">
                  Herinner me x dagen van tevoren
                </label>
                <select
                  value={notifyDaysBefore}
                  onChange={(e) => setNotifyDaysBefore(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-white/60 border border-sage/20 rounded-2xl outline-none focus:ring-2 focus:ring-sage/50"
                >
                  <option value="1">1 dag</option>
                  <option value="3">3 dagen</option>
                  <option value="7">1 week</option>
                  <option value="14">2 weken</option>
                  <option value="30">1 maand</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleSave}
                  disabled={saving || !lovedOneId || !milestoneType || !title.trim() || !date}
                  className="flex-1 py-3 bg-sage text-white rounded-full hover:bg-deep-sage transition-all disabled:opacity-50"
                >
                  {saving ? 'Bezig...' : (editingId ? 'Opslaan' : 'Toevoegen')}
                </button>
                <button
                  onClick={resetForm}
                  className="px-8 py-3 bg-mist text-warm-gray rounded-full hover:bg-gray-200 transition-all"
                >
                  Annuleren
                </button>
              </div>
            </div>
          </div>
        )}

        {/* All Milestones */}
        {milestones.length === 0 ? (
          <div className="text-center py-16 bg-white/40 backdrop-blur-md rounded-3xl border border-sage/10">
            <div className="text-6xl mb-4">📅</div>
            <p className="text-warm-gray text-lg mb-6">
              {lovedOnes.length === 0 
                ? 'Voeg eerst je dierbaren toe om milestones te tracken'
                : 'Je hebt nog geen milestones toegevoegd'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-2xl font-serif font-light text-soft-black">
              Alle Milestones
            </h2>
            {milestones.map((milestone) => {
              const nextDate = getNextOccurrence(milestone.date, milestone.recurring)
              const daysUntil = getDaysUntil(milestone.date, milestone.recurring)
              
              return (
                <div
                  key={milestone.id}
                  className="bg-white/60 backdrop-blur-md rounded-3xl border border-sage/20 p-8"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-3xl">
                          {milestoneTypes.find(t => t.value === milestone.milestone_type)?.emoji}
                        </span>
                        <div>
                          <h3 className="text-xl font-serif font-light text-soft-black">
                            {milestone.title}
                          </h3>
                          <p className="text-sm text-warm-gray">
                            {milestone.loved_one?.name} • {format(nextDate, 'd MMMM yyyy', { locale: nl })}
                            {milestone.recurring && ' • Jaarlijks terugkerend'}
                          </p>
                        </div>
                      </div>

                      {milestone.ritual_notes && (
                        <div className="ml-12 p-4 bg-mist/50 rounded-2xl">
                          <p className="text-sm text-warm-gray">
                            <strong>Ritueel:</strong> {milestone.ritual_notes}
                          </p>
                        </div>
                      )}

                      {daysUntil >= 0 && daysUntil <= milestone.notify_days_before && (
                        <div className="ml-12 mt-3 p-3 bg-sage/10 rounded-2xl">
                          <p className="text-sm text-sage">
                            🔔 {daysUntil === 0 ? 'Vandaag!' : `Over ${daysUntil} ${daysUntil === 1 ? 'dag' : 'dagen'}`}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(milestone)}
                        className="p-2 text-sage hover:bg-sage/10 rounded-full transition-all"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(milestone.id)}
                        className="p-2 text-warm-gray/40 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
