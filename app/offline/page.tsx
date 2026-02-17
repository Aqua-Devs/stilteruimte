'use client'

import Link from 'next/link'

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="text-6xl mb-6">📱</div>
        <h1 className="font-serif text-4xl font-light text-soft-black mb-4">
          Je bent offline
        </h1>
        <p className="text-lg text-warm-gray mb-8">
          Geen internetverbinding. Je opgeslagen entries zijn nog steeds beschikbaar zodra je weer online bent.
        </p>
        
        <div className="bg-white/60 backdrop-blur-md rounded-3xl border border-sage/20 p-6 mb-6">
          <h3 className="font-serif text-xl font-light text-soft-black mb-3">
            Wat je nog kunt doen:
          </h3>
          <ul className="text-left text-warm-gray space-y-2">
            <li>✓ Lokaal opgeslagen entries bekijken</li>
            <li>✓ Nieuwe entries schrijven (worden gesynchroniseerd)</li>
            <li>✓ Je progressie bekijken</li>
          </ul>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="px-8 py-4 bg-sage text-white rounded-full hover:bg-deep-sage transition-all"
        >
          Probeer opnieuw
        </button>

        <p className="mt-6 text-sm text-warm-gray/60">
          De app werkt automatisch weer zodra je verbinding hebt
        </p>
      </div>
    </div>
  )
}
