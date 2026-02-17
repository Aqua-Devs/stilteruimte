'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'

type Message = {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function AICompanionPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hoi, ik ben hier om je te ondersteunen. Je mag alles met me delen, zonder oordeel. Waar zit je mee?',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
    } else {
      setUser(user)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      // Call AI API
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          userId: user.id
        })
      })

      if (!response.ok) {
        throw new Error('AI response failed')
      }

      const data = await response.json()

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('AI error:', error)
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, er ging iets mis. Probeer het opnieuw.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-sage/20 bg-white/50 backdrop-blur-md flex-shrink-0">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="font-serif text-2xl font-light text-soft-black tracking-[2px]">
            STILLE RUIMTE
          </Link>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-warm-gray">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              AI Companion
            </div>
            <Link href="/dashboard" className="text-warm-gray hover:text-deep-sage transition-colors">
              ← Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Chat Container */}
      <div className="flex-1 overflow-hidden flex flex-col max-w-4xl w-full mx-auto">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start gap-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === 'user' 
                    ? 'bg-sage text-white' 
                    : 'bg-gradient-to-br from-mist to-cream border border-sage/20'
                }`}>
                  {message.role === 'user' ? '👤' : '🤝'}
                </div>

                {/* Message Bubble */}
                <div>
                  <div className={`p-4 rounded-3xl ${
                    message.role === 'user'
                      ? 'bg-sage text-white rounded-tr-sm'
                      : 'bg-white/60 backdrop-blur-md text-warm-gray rounded-tl-sm border border-sage/10'
                  }`}>
                    <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  </div>
                  <p className={`text-xs text-warm-gray/60 mt-1 px-2 ${
                    message.role === 'user' ? 'text-right' : 'text-left'
                  }`}>
                    {format(message.timestamp, 'HH:mm')}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="flex items-start gap-3 max-w-[80%]">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-mist to-cream border border-sage/20">
                  🤝
                </div>
                <div className="p-4 rounded-3xl rounded-tl-sm bg-white/60 backdrop-blur-md border border-sage/10">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-sage rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-sage rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-sage rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-sage/20 bg-white/50 backdrop-blur-md p-6 flex-shrink-0">
          <div className="flex gap-4 items-end">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Typ hier je gedachten..."
              className="flex-1 min-h-[60px] max-h-[200px] bg-white/60 border border-sage/20 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-sage/50 resize-none text-warm-gray"
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="px-8 py-3 bg-sage text-white rounded-full font-medium hover:bg-deep-sage transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              Verstuur
            </button>
          </div>
          <p className="text-xs text-warm-gray/60 mt-3 text-center">
            💡 Tip: Druk op Enter om te versturen, Shift+Enter voor een nieuwe regel
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-mist border-t border-sage/20 py-4 flex-shrink-0">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-sm text-warm-gray text-center">
            🔒 Alle gesprekken zijn privé en versleuteld. De AI begeleidt je zachtmoedig, maar vervangt geen professionele hulp.
          </p>
        </div>
      </div>
    </div>
  )
}
