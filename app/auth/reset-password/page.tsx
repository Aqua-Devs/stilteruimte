'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Wachtwoorden komen niet overeen')
      return
    }

    if (password.length < 6) {
      setError('Wachtwoord moet minimaal 6 karakters zijn')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.updateUser({
      password: password
    })

    if (error) {
      setError('Er ging iets mis. Probeer het opnieuw.')
      setLoading(false)
    } else {
      setSuccess(true)
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-6">
        <div className="max-w-md w-full">
          <div className="text-center mb-12">
            <h1 className="font-serif text-4xl font-light text-soft-black tracking-[2px] mb-12">
              STILLE RUIMTE
            </h1>
          </div>

          <div className="bg-white/60 backdrop-blur-md rounded-3xl p-8 border-2 border-sage text-center">
            <div className="text-6xl mb-6">{String.fromCodePoint(0x2705)}</div>
            <h2 className="font-serif text-3xl font-light text-soft-black mb-4">
              Wachtwoord gewijzigd!
            </h2>
            <p className="text-warm-gray mb-8">
              Je wachtwoord is succesvol gewijzigd. Je wordt doorgestuurd naar het dashboard...
            </p>
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
            Nieuw wachtwoord
          </h2>
          <p className="text-warm-gray text-center mb-8">
            Kies een nieuw wachtwoord voor je account
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-warm-gray mb-2">
                Nieuw wachtwoord
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border-2 border-sage/30 rounded-2xl outline-none focus:ring-2 focus:ring-sage/50 text-white placeholder-warm-gray/50"
                placeholder="Minimaal 6 karakters"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-warm-gray mb-2">
                Bevestig wachtwoord
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border-2 border-sage/30 rounded-2xl outline-none focus:ring-2 focus:ring-sage/50 text-white placeholder-warm-gray/50"
                placeholder="Herhaal je wachtwoord"
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
              {loading ? 'Bezig met opslaan...' : 'Wachtwoord wijzigen'}
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
