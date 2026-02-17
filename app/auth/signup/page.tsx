'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
        },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-cream">
      <div className="fixed w-[400px] h-[400px] bg-sage rounded-full blur-[80px] opacity-15 top-0 right-0 animate-float" />
      <div className="fixed w-[300px] h-[300px] bg-clay rounded-full blur-[80px] opacity-15 bottom-0 left-0 animate-float" style={{ animationDelay: '5s' }} />
      
      <div className="relative z-10 w-full max-w-md">
        <Link href="/" className="block text-center mb-8">
          <h1 className="font-serif text-3xl font-light text-soft-black tracking-[2px]">
            STILLE RUIMTE
          </h1>
        </Link>

        <div className="bg-white/80 backdrop-blur-md p-10 rounded-[30px] border border-sage/20 shadow-xl">
          <h2 className="font-serif text-3xl font-light text-soft-black mb-2 text-center">
            Begin je reis
          </h2>
          <p className="text-warm-gray text-center mb-8">
            Maak een gratis account aan
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-warm-gray mb-2">
                Naam (optioneel)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-sage/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sage/50 bg-white/50"
                placeholder="Hoe mogen we je noemen?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-warm-gray mb-2">
                E-mailadres
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-sage/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sage/50 bg-white/50"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-warm-gray mb-2">
                Wachtwoord
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-sage/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sage/50 bg-white/50"
                required
                minLength={6}
              />
              <p className="text-xs text-warm-gray/60 mt-1">Minimaal 6 karakters</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-sage text-white rounded-full font-medium hover:bg-deep-sage transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Account aanmaken...' : 'Gratis registreren'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/auth/login" className="text-sage hover:text-deep-sage transition-colors">
              Heb je al een account? Log hier in
            </Link>
          </div>

          <p className="text-xs text-warm-gray/60 text-center mt-8">
            Door te registreren ga je akkoord met onze{' '}
            <Link href="#" className="text-sage hover:underline">voorwaarden</Link>
            {' '}en{' '}
            <Link href="#" className="text-sage hover:underline">privacybeleid</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
