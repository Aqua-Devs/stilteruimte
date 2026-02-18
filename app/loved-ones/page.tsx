'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface LovedOne {
  id: string
  name: string
  relationship: string
  date_of_birth: string | null
  date_of_death: string
  notes: string | null
}

const relationshipOptions = [
  'Moeder', 'Vader', 'Partner', 'Echtgenoot', 'Echtgenote',
  'Zoon', 'Dochter', 'Kind', 'Broer', 'Zus',
  'Oma', 'Opa', 'Vriend', 'Vriendin', 'Huisdier', 'Anders'
]

export default function LovedOnesPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [lovedOnes, setLovedOnes] = useState<LovedOne[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  // Form state
  const [name, setName] = useState('')
  const [relationship, setRelationship] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [dateOfDeath, setDateOfDeath] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    if (user) {
      fetchLovedOnes()
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
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setLovedOnes(data)
    }
  }

  const resetForm = () => {
    setName('')
    setRelationship('')
    setDateOfBirth('')
    setDateOfDeath('')
    setNotes('')
    setEditingId(null)
    setShowForm(false)
  }

  const handleEdit = (lovedOne: LovedOne) => {
    setName(lovedOne.name)
    setRelationship(lovedOne.relationship)
    setDateOfBirth(lovedOne.date_of_birth || '')
    setDateOfDeath(lovedOne.date_of_death)
    setNotes(lovedOne.notes || '')
    setEditingId(lovedOne.id)
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!name.trim() || !relationship || !dateOfDeath) {
      alert('Vul minimaal naam, relatie en sterfdag in')
      return
    }

    setSaving(true)

    if (editingId) {
      // Update
      const { error } = await supabase
        .from('loved_ones')
        .update({
          name: name.trim(),
          relationship,
          date_of_birth: dateOfBirth || null,
          date_of_death: dateOfDeath,
          notes: notes.trim() || null
        })
        .eq('id', editingId)

      if (!error) {
        await fetchLovedOnes()
        resetForm()
      }
    } else {
      // Insert
      const { error } = await supabase
        .from('loved_ones')
        .insert({
          user_id: user.id,
          name: name.trim(),
          relationship,
          date_of_birth: dateOfBirth || null,
          date_of_death: dateOfDeath,
          notes: notes.trim() || null
        })

      if (!error) {
        await fetchLovedOnes()
        resetForm()
      }
    }

    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Weet je zeker dat je deze dierbare wilt verwijderen? Dit verwijdert ook alle bijbehorende milestones.')) return

    const { error } = await supabase
      .from('loved_ones')
      .delete()
      .eq('id', id)

    if (!error) {
      await fetchLovedOnes()
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
            Jouw Dierbaren 💝
          </h1>
          <p className="text-lg text-warm-gray">
            Beheer informatie over de mensen die je verloren hebt
          </p>
        </div>

        {/* Add Button */}
        {!showForm && (
          <div className="mb-8 text-center">
            <button
              onClick={() => setShowForm(true)}
              className="px-8 py-4 bg-sage text-white rounded-full hover:bg-deep-sage transition-all"
            >
              + Voeg dierbare toe
            </button>
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="mb-12 bg-white/60 backdrop-blur-md rounded-3xl border border-sage/20 p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-serif font-light text-soft-black">
                {editingId ? 'Bewerk' : 'Nieuwe'} dierbare
              </h2>
              <button
                onClick={resetForm}
                className="text-warm-gray hover:text-soft-black"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-warm-gray mb-2">
                  Naam *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Naam van je dierbare"
                  className="w-full px-4 py-3 bg-white/60 border border-sage/20 rounded-2xl outline-none focus:ring-2 focus:ring-sage/50"
                />
              </div>

              {/* Relationship */}
              <div>
                <label className="block text-sm font-medium text-warm-gray mb-2">
                  Relatie *
                </label>
                <select
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className="w-full px-4 py-3 bg-white/60 border border-sage/20 rounded-2xl outline-none focus:ring-2 focus:ring-sage/50"
                >
                  <option value="">Kies relatie...</option>
                  {relationshipOptions.map(rel => (
                    <option key={rel} value={rel}>{rel}</option>
                  ))}
                </select>
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-warm-gray mb-2">
                  Geboortedatum (optioneel)
                </label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full px-4 py-3 bg-white/60 border border-sage/20 rounded-2xl outline-none focus:ring-2 focus:ring-sage/50"
                />
              </div>

              {/* Date of Death */}
              <div>
                <label className="block text-sm font-medium text-warm-gray mb-2">
                  Sterfdag *
                </label>
                <input
                  type="date"
                  value={dateOfDeath}
                  onChange={(e) => setDateOfDeath(e.target.value)}
                  className="w-full px-4 py-3 bg-white/60 border border-sage/20 rounded-2xl outline-none focus:ring-2 focus:ring-sage/50"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-warm-gray mb-2">
                  Notities (optioneel)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Herinneringen, belangrijke momenten..."
                  className="w-full px-4 py-3 bg-white/60 border border-sage/20 rounded-2xl outline-none focus:ring-2 focus:ring-sage/50 resize-none"
                  rows={3}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleSave}
                  disabled={saving || !name.trim() || !relationship || !dateOfDeath}
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

        {/* List */}
        {lovedOnes.length === 0 ? (
          <div className="text-center py-16 bg-white/40 backdrop-blur-md rounded-3xl border border-sage/10">
            <div className="text-6xl mb-4">💝</div>
            <p className="text-warm-gray text-lg mb-6">
              Voeg je eerste dierbare toe om milestones te kunnen tracken
            </p>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="px-8 py-4 bg-sage text-white rounded-full hover:bg-deep-sage transition-all"
              >
                Voeg dierbare toe
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {lovedOnes.map((lovedOne) => (
              <div
                key={lovedOne.id}
                className="bg-white/60 backdrop-blur-md rounded-3xl border border-sage/20 p-8"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-serif font-light text-soft-black mb-2">
                      {lovedOne.name}
                    </h3>
                    <p className="text-sage mb-1">{lovedOne.relationship}</p>
                    <p className="text-sm text-warm-gray">
                      {lovedOne.date_of_birth && (
                        <span>Geboren: {new Date(lovedOne.date_of_birth).toLocaleDateString('nl-NL')} • </span>
                      )}
                      Overleden: {new Date(lovedOne.date_of_death).toLocaleDateString('nl-NL')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(lovedOne)}
                      className="p-2 text-sage hover:bg-sage/10 rounded-full transition-all"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(lovedOne.id)}
                      className="p-2 text-warm-gray/40 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {lovedOne.notes && (
                  <div className="mt-4 p-4 bg-mist/50 rounded-2xl">
                    <p className="text-sm text-warm-gray">{lovedOne.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Info */}
        <div className="mt-12 p-6 bg-white/40 backdrop-blur-md rounded-2xl border border-sage/10">
          <div className="flex items-start gap-3">
            <div className="text-xl">💡</div>
            <div className="text-sm text-warm-gray">
              <p className="mb-2"><strong>Waarom dit toevoegen?</strong></p>
              <p>Door je dierbaren toe te voegen, kan de app automatisch belangrijke milestones tracken (sterfdagen, verjaardagen) en je helpen voorbereiden op moeilijke dagen. Je kunt ook specifieke milestones toevoegen zoals jubilea of andere belangrijke momenten.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
