'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) {
      setError('Er ging iets mis. Probeer het opnieuw.')
      setLoading(false)
    } else {
      setSent(true)
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-6">
        <div className="max-w-md w-full">
          <div className="text-center mb-12">
            <h1 className="font-serif text-4xl font-light text-soft-black tracking-[2px] mb-12">
              STILLE RUIMTE
            </h1>
          </div>

          <div className="bg-white/60 backdrop-blur-md rounded-3xl p-8 border-2 border-sage text-center">
            <div className="text-6xl mb-6">{String.fromCodePoint(0x2709, 0xFE0F)}</div>
            <h2 className="font-serif text-3xl font-light text-soft-black mb-4">
              Check je email
            </h2>
            <p className="text-warm-gray mb-8">
              We hebben een wachtwoord reset link gestuurd naar:
            </p>
            <p className="text-sage font-medium mb-8">{email}</p>
            <p className="text-sm text-warm-gray mb-8">
              Klik op de link in de email om je wachtwoord opnieuw in te stellen.
            </p>
            <Link
              href="/auth/login"
              className="inline-block px-8 py-3 bg-sage text-white rounded-full hover:bg-deep-sage transition-all"
            >
              Terug naar inloggen
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl font-light text-soft-black tracking-[2px] mb-12">
            STILLE RUIMTE
          </h1>
        </div>

        <div className="bg-soft-black/90 backdrop-blur-md rounded-3xl p-8 border-2 border-sage">
          <h2 className="font-serif text-3xl font-light text-white mb-2 text-center">
            Wachtwoord vergeten?
          </h2>
          <p className="text-warm-gray text-center mb-8">
            Vul je emailadres in en we sturen je een reset link
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-warm-gray mb-2">
                E-mailadres
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border-2 border-sage/30 rounded-2xl outline-none focus:ring-2 focus:ring-sage/50 text-white placeholder-warm-gray/50"
                placeholder="naam@email.com"
                required
              />
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-sage text-white rounded-full hover:bg-deep-sage transition-all disabled:opacity-50 text-lg font-medium"
            >
              {loading ? 'Bezig met versturen...' : 'Stuur reset link'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/auth/login"
              className="text-sm text-sage hover:text-deep-sage transition-colors"
            >
              {String.fromCodePoint(0x2190)} Terug naar inloggen
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
