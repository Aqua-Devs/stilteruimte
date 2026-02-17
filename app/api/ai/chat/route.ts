import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export async function POST(request: Request) {
  try {
    const { messages, userId } = await request.json()

    // Fetch user's recent entries for context
    const { data: recentEntries } = await supabase
      .from('journal_entries')
      .select('content, emotion, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5)

    // Build context summary
    let contextSummary = ''
    if (recentEntries && recentEntries.length > 0) {
      contextSummary = '\n\nRECENTE CONTEXT VAN GEBRUIKER:\n'
      recentEntries.forEach((entry, index) => {
        const daysAgo = Math.floor((Date.now() - new Date(entry.created_at).getTime()) / (1000 * 60 * 60 * 24))
        contextSummary += `${daysAgo} dagen geleden (emotie: ${entry.emotion}): "${entry.content.substring(0, 150)}..."\n`
      })
    }

    // Build conversation history
    const conversationHistory = messages.map((msg: any) => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content
    }))

    // Call Anthropic API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1024,
        system: `Je bent een zachtmoedige AI companion voor rouwverwerking. Je helpt mensen die rouwen om een verlies.

GEDRAGSREGELS:
- Wees empathisch, geduldig en non-judgmental
- Stel zachte, open vragen die helpen bij verwerking
- Herken en benoem emoties zonder te pathologiseren
- Moedig gezonde verwerking aan, maar forceer niets
- Bied geen therapie of medisch advies - verwijs naar professionals bij zware symptomen
- Gebruik een warme, natuurlijke Nederlandse schrijfstijl
- Houd antwoorden kort (2-4 zinnen), tenzij diepgang nodig is
- Focus op het hier en nu, niet op oplossingen pushen
- Gebruik de context van eerdere entries om patronen te herkennen

VOORBEELDEN VAN GOEDE VRAGEN:
- "Wil je me meer vertellen over [specifiek genoemd gevoel]?"
- "Wat zou je tegen jezelf willen zeggen op dit moment?"
- "Waar in je lichaam voel je dit?"
- "Is er een herinnering die je wilt delen?"
- "Ik zie dat je [patroon uit context], hoe voel je je daar nu over?"

VERMIJD:
- Clichés ("tijd heelt alle wonden", "ze zou willen dat je gelukkig bent")
- Te veel vragen tegelijk
- Ongevraagde adviezen
- Oplossingen pushen
- Minimaliseren van pijn

${contextSummary}`,
        messages: conversationHistory
      })
    })

    if (!response.ok) {
      throw new Error('Anthropic API error')
    }

    const data = await response.json()
    const aiMessage = data.content[0].text

    return NextResponse.json({ message: aiMessage })

  } catch (error) {
    console.error('AI Chat Error:', error)
    return NextResponse.json(
      { error: 'Er ging iets mis met de AI verbinding' },
      { status: 500 }
    )
  }
}
