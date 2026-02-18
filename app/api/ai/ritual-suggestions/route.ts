import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: Request) {
  try {
    const { userId, lovedOneId } = await request.json()

    // Fetch user's journals
    const { data: journals } = await supabase
      .from('journal_entries')
      .select('content, emotion, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)

    // Fetch user's letters
    const { data: letters } = await supabase
      .from('letters')
      .select('content, recipient_name, notes')
      .eq('user_id', userId)
      .limit(5)

    // Fetch loved one info if specified
    let lovedOne = null
    if (lovedOneId) {
      const { data } = await supabase
        .from('loved_ones')
        .select('name, relationship, notes')
        .eq('id', lovedOneId)
        .single()
      lovedOne = data
    }

    // Build context for AI
    const journalContext = journals?.map(j => 
      `${j.emotion}: ${j.content.substring(0, 300)}`
    ).join('\n\n') || ''

    const letterContext = letters?.map(l => 
      `Brief aan ${l.recipient_name}: ${l.content.substring(0, 300)}`
    ).join('\n\n') || ''

    const lovedOneContext = lovedOne 
      ? `Dierbare: ${lovedOne.name} (${lovedOne.relationship}). ${lovedOne.notes || ''}`
      : ''

    const prompt = `Je bent een empathische rouwbegeleider. Analyseer deze persoonlijke informatie en suggereer 5 UNIEKE, PERSOONLIJKE rituelen om hun dierbare te eren.

${lovedOneContext}

Recente dagboeken:
${journalContext}

Brieven:
${letterContext}

Geef 5 rituelen die:
1. Specifiek zijn voor DEZE persoon (niet generiek)
2. Aansluiten bij wat ze schrijven over hun dierbare
3. Gebaseerd zijn op hun emoties en herinneringen
4. Praktisch uitvoerbaar zijn
5. Verschillende categorieën dekken (thuis, natuur, creatief, sociaal, spiritueel)

Format elk ritueel als JSON:
{
  "title": "Kort ritueel titel",
  "description": "Uitgebreide beschrijving waarom DIT ritueel bij DEZE persoon past",
  "category": "thuis|natuur|creatief|sociaal|spiritueel",
  "why": "Waarom past dit bij wat ze geschreven hebben"
}

Geef ALLEEN een JSON array van 5 rituelen, geen extra tekst.`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    })

    if (!response.ok) {
      throw new Error('Anthropic API error')
    }

    const data = await response.json()
    const aiResponse = data.content[0].text

    // Parse JSON from AI response
    const jsonMatch = aiResponse.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      throw new Error('Could not parse AI response')
    }

    const rituals = JSON.parse(jsonMatch[0])

    return NextResponse.json({ rituals })

  } catch (error) {
    console.error('AI ritual suggestion error:', error)
    return NextResponse.json(
      { error: 'Er ging iets mis met de AI suggesties' },
      { status: 500 }
    )
  }
}
