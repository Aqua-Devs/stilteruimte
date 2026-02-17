'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
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
            Welkom terug
          </h2>
          <p className="text-warm-gray text-center mb-8">
            Log in om verder te gaan met je reis
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
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
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-sage text-white rounded-full font-medium hover:bg-deep-sage transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Bezig met inloggen...' : 'Inloggen'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/auth/signup" className="text-sage hover:text-deep-sage transition-colors">
              Nog geen account? Registreer hier
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
