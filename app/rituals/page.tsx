'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface Ritual {
  id: string
  title: string
  description: string
  category: 'thuis' | 'natuur' | 'creatief' | 'sociaal' | 'spiritueel'
}

interface AIRitual {
  title: string
  description: string
  category: string
  why: string
}

const PREDEFINED_RITUALS: Ritual[] = [
  // THUIS (10)
  { id: 'home_1', title: 'Steek een kaars aan', description: 'Steek elke avond een kaars aan in hun naam', category: 'thuis' },
  { id: 'home_2', title: 'Kook hun favoriete maaltijd', description: 'Bereid het gerecht waar ze van hielden', category: 'thuis' },
  { id: 'home_3', title: 'Luister hun favoriete muziek', description: 'Speel de nummers die ze graag hoorden', category: 'thuis' },
  { id: 'home_4', title: 'Bekijk oude foto\'s', description: 'Neem de tijd om herinneringen te koesteren', category: 'thuis' },
  { id: 'home_5', title: 'Draag hun kleding of sieraden', description: 'Voel je verbonden door hun spullen te dragen', category: 'thuis' },
  { id: 'home_6', title: 'Lees hun favoriete boek', description: 'Ontdek wat zij las en waarom', category: 'thuis' },
  { id: 'home_7', title: 'Kijk hun favoriete film', description: 'Ervaar wat hen raakte', category: 'thuis' },
  { id: 'home_8', title: 'Zet een plekje voor hen', description: 'Dek een extra bord bij het diner', category: 'thuis' },
  { id: 'home_9', title: 'Praat hardop tegen hen', description: 'Vertel over je dag alsof ze luisteren', category: 'thuis' },
  { id: 'home_10', title: 'Reorganiseer hun spullen', description: 'Creëer een speciale plek voor herinneringen', category: 'thuis' },

  // NATUUR (10)
  { id: 'nature_1', title: 'Plant een boom', description: 'Laat iets groeien in hun naam', category: 'natuur' },
  { id: 'nature_2', title: 'Plant bloemen', description: 'Creëer een levend eerbetoon', category: 'natuur' },
  { id: 'nature_3', title: 'Bezoek hun favoriete natuurplek', description: 'Wandel waar jullie samen wandelden', category: 'natuur' },
  { id: 'nature_4', title: 'Verzamel stenen bij water', description: 'Neem een steen mee voor elk jaar samen', category: 'natuur' },
  { id: 'nature_5', title: 'Kijk naar de zonsondergang', description: 'Vind rust in de overgang van dag naar nacht', category: 'natuur' },
  { id: 'nature_6', title: 'Maak hun wandelroute', description: 'Loop de paden die zij liepen', category: 'natuur' },
  { id: 'nature_7', title: 'Bezoek hun rustplaats', description: 'Breng bloemen of een brief', category: 'natuur' },
  { id: 'nature_8', title: 'Laat een ballon op', description: 'Stuur een boodschap naar de hemel', category: 'natuur' },
  { id: 'nature_9', title: 'Strooi bloemblaadjes in water', description: 'Laat symbolisch los in stromend water', category: 'natuur' },
  { id: 'nature_10', title: 'Kijk naar de sterren', description: 'Zoek hun ster aan de hemel', category: 'natuur' },

  // CREATIEF (10)
  { id: 'creative_1', title: 'Schrijf een brief', description: 'Vertel wat je niet kon zeggen', category: 'creatief' },
  { id: 'creative_2', title: 'Maak een fotoboek', description: 'Verzamel jullie mooiste momenten', category: 'creatief' },
  { id: 'creative_3', title: 'Teken of schilder', description: 'Verbeeld je emoties in kunst', category: 'creatief' },
  { id: 'creative_4', title: 'Schrijf een gedicht', description: 'Vang je gevoelens in woorden', category: 'creatief' },
  { id: 'creative_5', title: 'Creëer een playlist', description: 'Muziek die jullie verbindt', category: 'creatief' },
  { id: 'creative_6', title: 'Maak een memory box', description: 'Verzamel kleine herinneringen', category: 'creatief' },
  { id: 'creative_7', title: 'Creëer iets met hun spullen', description: 'Geef nieuwe betekenis aan oude dingen', category: 'creatief' },
  { id: 'creative_8', title: 'Schrijf hun levensverhaal', description: 'Bewaar hun verhaal voor altijd', category: 'creatief' },
  { id: 'creative_9', title: 'Maak een video montage', description: 'Breng herinneringen tot leven', category: 'creatief' },
  { id: 'creative_10', title: 'Borduur of brei in hun naam', description: 'Creëer iets blijvends met je handen', category: 'creatief' },

  // SOCIAAL (10)
  { id: 'social_1', title: 'Vertel verhalen over hen', description: 'Deel herinneringen met anderen', category: 'sociaal' },
  { id: 'social_2', title: 'Organiseer een herdenking', description: 'Breng mensen samen om te gedenken', category: 'sociaal' },
  { id: 'social_3', title: 'Doneer aan hun goede doel', description: 'Zet hun passie voort', category: 'sociaal' },
  { id: 'social_4', title: 'Steun iemand anders in rouw', description: 'Geef wat je hebt geleerd door', category: 'sociaal' },
  { id: 'social_5', title: 'Deel herinneringen met familie', description: 'Versterk de band door verhalen', category: 'sociaal' },
  { id: 'social_6', title: 'Bezoek hun vrienden', description: 'Verbind met wie hen kende', category: 'sociaal' },
  { id: 'social_7', title: 'Doe hun favoriete goede daad', description: 'Leef hun waarden na', category: 'sociaal' },
  { id: 'social_8', title: 'Vier hun verjaardag samen', description: 'Blijf hun leven vieren', category: 'sociaal' },
  { id: 'social_9', title: 'Start een fundraiser', description: 'Creëer iets goeds in hun naam', category: 'sociaal' },
  { id: 'social_10', title: 'Sluit je aan bij rouwgroep', description: 'Vind steun bij anderen', category: 'sociaal' },

  // SPIRITUEEL (10)
  { id: 'spiritual_1', title: 'Bid of mediteer', description: 'Zoek innerlijke vrede', category: 'spiritueel' },
  { id: 'spiritual_2', title: 'Bezoek hun gebedsplaats', description: 'Ga naar waar zij hun kracht vonden', category: 'spiritueel' },
  { id: 'spiritual_3', title: 'Lees spirituele teksten', description: 'Vind troost in wijsheid', category: 'spiritueel' },
  { id: 'spiritual_4', title: 'Doe een cultureel ritueel', description: 'Eer hen volgens traditie', category: 'spiritueel' },
  { id: 'spiritual_5', title: 'Bid voor hun ziel', description: 'Stuur hen liefde en licht', category: 'spiritueel' },
  { id: 'spiritual_6', title: 'Breng een symbolisch offer', description: 'Geef iets met betekenis', category: 'spiritueel' },
  { id: 'spiritual_7', title: 'Houd een stilte moment', description: 'Eer hen in gemeenschappelijke stilte', category: 'spiritueel' },
  { id: 'spiritual_8', title: 'Schrijf een gebed', description: 'Vind je eigen woorden voor het goddelijke', category: 'spiritueel' },
  { id: 'spiritual_9', title: 'Steek wierook aan', description: 'Laat geur je herinneringen oproepen', category: 'spiritueel' },
  { id: 'spiritual_10', title: 'Bezoek een heilige plek', description: 'Zoek verbinding op een betekenisvolle plek', category: 'spiritueel' },
]

const categoryEmojis = {
  thuis: String.fromCodePoint(0x1F3E0),
  natuur: String.fromCodePoint(0x1F333),
  creatief: String.fromCodePoint(0x1F3A8),
  sociaal: String.fromCodePoint(0x1F91D),
  spiritueel: String.fromCodePoint(0x1F54A, 0xFE0F),
}

const categoryLabels = {
  thuis: 'Thuis',
  natuur: 'Natuur',
  creatief: 'Creatief',
  sociaal: 'Sociaal',
  spiritueel: 'Spiritueel',
}

export default function RitualsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [lovedOnes, setLovedOnes] = useState<any[]>([])
  const [selectedLovedOne, setSelectedLovedOne] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [completions, setCompletions] = useState<any[]>([])
  const [customRituals, setCustomRituals] = useState<any[]>([])
  const [aiRituals, setAiRituals] = useState<AIRitual[]>([])
  const [loadingAI, setLoadingAI] = useState(false)
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [selectedRitual, setSelectedRitual] = useState<Ritual | null>(null)
  const [completionNotes, setCompletionNotes] = useState('')

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    if (user) {
      fetchLovedOnes()
      fetchCompletions()
      fetchCustomRituals()
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
    const { data } = await supabase
      .from('loved_ones')
      .select('*')
      .eq('user_id', user.id)

    if (data) setLovedOnes(data)
  }

  const fetchCompletions = async () => {
    const { data } = await supabase
      .from('ritual_completions')
      .select('*')
      .eq('user_id', user.id)

    if (data) setCompletions(data)
  }

  const fetchCustomRituals = async () => {
    const { data } = await supabase
      .from('custom_rituals')
      .select('*')
      .eq('user_id', user.id)

    if (data) setCustomRituals(data)
  }

  const fetchAISuggestions = async () => {
    if (!user) return

    setLoadingAI(true)

    try {
      const response = await fetch('/api/ai/ritual-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          lovedOneId: selectedLovedOne || null
        })
      })

      if (response.ok) {
        const data = await response.json()
        setAiRituals(data.rituals)
      }
    } catch (error) {
      console.error('AI suggestions error:', error)
    } finally {
      setLoadingAI(false)
    }
  }

  const handleCompleteRitual = async () => {
    if (!selectedRitual) return

    const { error } = await supabase
      .from('ritual_completions')
      .insert({
        user_id: user.id,
        loved_one_id: selectedLovedOne || null,
        ritual_id: selectedRitual.id,
        notes: completionNotes.trim() || null
      })

    if (!error) {
      await fetchCompletions()
      setShowCompleteModal(false)
      setSelectedRitual(null)
      setCompletionNotes('')
    }
  }

  const isCompleted = (ritualId: string) => {
    return completions.some(c => c.ritual_id === ritualId)
  }

  const filteredRituals = PREDEFINED_RITUALS.filter(r => 
    selectedCategory === 'all' || r.category === selectedCategory
  )

  return (
    <div className="min-h-screen bg-cream">
      <nav className="border-b border-sage/20 bg-white/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="font-serif text-2xl font-light text-soft-black tracking-[2px]">
            STILTE RUIMTE
          </Link>
          <Link href="/dashboard" className="text-warm-gray hover:text-deep-sage transition-colors">
            {String.fromCodePoint(0x2190)} Terug naar dashboard
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="font-serif text-5xl font-light text-soft-black mb-4">
            Rituelen om te Eren {String.fromCodePoint(0x1F338)}
          </h1>
          <p className="text-lg text-warm-gray">
            50+ manieren om je dierbare te herinneren en te eren
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap gap-4 justify-center">
          {lovedOnes.length > 0 && (
            <select
              value={selectedLovedOne}
              onChange={(e) => setSelectedLovedOne(e.target.value)}
              className="px-6 py-3 bg-white border border-sage/20 rounded-full outline-none"
            >
              <option value="">Alle dierbaren</option>
              {lovedOnes.map(lo => (
                <option key={lo.id} value={lo.id}>{lo.name}</option>
              ))}
            </select>
          )}

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-6 py-3 bg-white border border-sage/20 rounded-full outline-none"
          >
            <option value="all">Alle categorieën</option>
            <option value="thuis">{categoryEmojis.thuis} Thuis</option>
            <option value="natuur">{categoryEmojis.natuur} Natuur</option>
            <option value="creatief">{categoryEmojis.creatief} Creatief</option>
            <option value="sociaal">{categoryEmojis.sociaal} Sociaal</option>
            <option value="spiritueel">{categoryEmojis.spiritueel} Spiritueel</option>
          </select>
        </div>

        {/* AI Suggestions Button */}
        <div className="mb-12 text-center">
          <button
            onClick={fetchAISuggestions}
            disabled={loadingAI}
            className="px-8 py-4 bg-gradient-to-br from-sage to-deep-sage text-white rounded-full hover:shadow-xl transition-all disabled:opacity-50"
          >
            {loadingAI ? 'AI denkt mee...' : `${String.fromCodePoint(0x2728)} AI Persoonlijke Suggesties`}
          </button>
          <p className="text-sm text-warm-gray mt-2">
            Gebaseerd op je dagboeken en brieven
          </p>
        </div>

        {/* AI Suggested Rituals */}
        {aiRituals.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-serif font-light text-soft-black mb-6 text-center">
              {String.fromCodePoint(0x2728)} Persoonlijk voor Jou
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {aiRituals.map((ritual, idx) => (
                <div
                  key={idx}
                  className="bg-gradient-to-br from-sage/5 to-deep-sage/5 rounded-3xl border-2 border-sage/30 p-8"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="text-3xl">{categoryEmojis[ritual.category as keyof typeof categoryEmojis]}</div>
                    <div>
                      <h3 className="text-xl font-medium text-soft-black mb-2">{ritual.title}</h3>
                      <span className="text-xs text-sage uppercase tracking-wide">
                        {categoryLabels[ritual.category as keyof typeof categoryLabels]}
                      </span>
                    </div>
                  </div>
                  <p className="text-warm-gray mb-3">{ritual.description}</p>
                  <div className="p-3 bg-white/60 rounded-xl">
                    <p className="text-sm text-sage italic">
                      <strong>Waarom dit past:</strong> {ritual.why}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Predefined Rituals */}
        <div>
          <h2 className="text-3xl font-serif font-light text-soft-black mb-8 text-center">
            Alle Rituelen ({filteredRituals.length})
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRituals.map((ritual) => (
              <div
                key={ritual.id}
                className={`bg-white/60 backdrop-blur-md rounded-3xl border border-sage/20 p-8 transition-all hover:shadow-lg ${
                  isCompleted(ritual.id) ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="text-3xl">{categoryEmojis[ritual.category]}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-medium text-soft-black mb-2">{ritual.title}</h3>
                    <span className="text-xs text-sage uppercase tracking-wide">
                      {categoryLabels[ritual.category]}
                    </span>
                  </div>
                  {isCompleted(ritual.id) && (
                    <div className="text-2xl">{String.fromCodePoint(0x2714, 0xFE0F)}</div>
                  )}
                </div>
                <p className="text-warm-gray mb-4">{ritual.description}</p>
                {!isCompleted(ritual.id) && (
                  <button
                    onClick={() => {
                      setSelectedRitual(ritual)
                      setShowCompleteModal(true)
                    }}
                    className="w-full py-3 bg-sage text-white rounded-full hover:bg-deep-sage transition-all"
                  >
                    Markeer als gedaan
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Completion Stats */}
        <div className="mt-12 text-center p-8 bg-gradient-to-br from-mist to-cream rounded-3xl border border-sage/20">
          <div className="text-5xl mb-4">{String.fromCodePoint(0x1F4AF)}</div>
          <h3 className="text-2xl font-serif font-light text-soft-black mb-2">
            Je Voortgang
          </h3>
          <p className="text-3xl font-bold text-sage">
            {completions.length} / {PREDEFINED_RITUALS.length}
          </p>
          <p className="text-warm-gray mt-2">rituelen voltooid</p>
        </div>
      </div>

      {/* Complete Modal */}
      {showCompleteModal && selectedRitual && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-serif font-light text-soft-black mb-4">
              {selectedRitual.title}
            </h3>
            <p className="text-warm-gray mb-6">{selectedRitual.description}</p>
            
            <label className="block text-sm font-medium text-warm-gray mb-2">
              Hoe was het? (optioneel)
            </label>
            <textarea
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
              placeholder="Wat voelde je? Wat betekende dit voor je?"
              className="w-full px-4 py-3 bg-cream border border-sage/20 rounded-2xl outline-none focus:ring-2 focus:ring-sage/50 resize-none mb-6"
              rows={4}
            />

            <div className="flex gap-4">
              <button
                onClick={handleCompleteRitual}
                className="flex-1 py-3 bg-sage text-white rounded-full hover:bg-deep-sage transition-all"
              >
                Opslaan
              </button>
              <button
                onClick={() => {
                  setShowCompleteModal(false)
                  setSelectedRitual(null)
                  setCompletionNotes('')
                }}
                className="px-8 py-3 bg-mist text-warm-gray rounded-full hover:bg-gray-200 transition-all"
              >
                Annuleren
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
