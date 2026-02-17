import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export async function POST(request: Request) {
  try {
    const { userId } = await request.json()

    // Fetch user's recent entries to understand patterns
    const { data: recentEntries } = await supabase
      .from('journal_entries')
      .select('content, emotion, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)

    if (!recentEntries || recentEntries.length === 0) {
      // No entries yet - return gentle starter prompts
      const starterPrompts = [
        "Wat voelt het zwaarst vandaag?",
        "Is er iets dat je graag had willen zeggen?",
        "Welke herinnering kwam vandaag boven?",
        "Hoe zou je je gevoel nu omschrijven?",
        "Wat mis je het meest?"
      ]
      const randomPrompt = starterPrompts[Math.floor(Math.random() * starterPrompts.length)]
      return NextResponse.json({ prompt: randomPrompt, reasoning: 'Algemene start prompt' })
    }

    // Analyze patterns
    const emotionCounts: any = {}
    const recentThemes: string[] = []
    
    recentEntries.forEach(entry => {
      emotionCounts[entry.emotion] = (emotionCounts[entry.emotion] || 0) + 1
      recentThemes.push(entry.content.substring(0, 200))
    })

    const dominantEmotion = Object.keys(emotionCounts).reduce((a, b) => 
      emotionCounts[a] > emotionCounts[b] ? a : b
    )

    const daysSinceStart = Math.floor(
      (Date.now() - new Date(recentEntries[recentEntries.length - 1].created_at).getTime()) / (1000 * 60 * 60 * 24)
    )

    // Build context for AI
    const context = `
Gebruiker schrijft ${daysSinceStart} dagen in hun rouwdagboek.
Dominante emotie: ${dominantEmotion}
Emotie verdeling: ${JSON.stringify(emotionCounts)}

Laatste entries (thema's):
${recentThemes.map((theme, i) => `${i + 1}. "${theme}..."`).join('\n')}

Genereer 1 gepersonaliseerde dagelijkse schrijfprompt die:
1. Aansluit bij hun huidige rouwfase (${daysSinceStart} dagen)
2. Rekening houdt met hun dominante emotie (${dominantEmotion})
3. Voortbouwt op thema's die ze eerder noemden
4. Niet te zwaar is, maar wel betekenisvol
5. Een open vraag is die tot reflectie uitnodigt

Geef ALLEEN de prompt zelf, geen uitleg. Max 15 woorden.
`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 100,
        messages: [{
          role: 'user',
          content: context
        }]
      })
    })

    if (!response.ok) {
      throw new Error('Anthropic API error')
    }

    const data = await response.json()
    const prompt = data.content[0].text.trim().replace(/^["']|["']$/g, '')

    return NextResponse.json({ 
      prompt,
      reasoning: `Gebaseerd op ${recentEntries.length} entries, dominante emotie: ${dominantEmotion}`
    })

  } catch (error) {
    console.error('Smart Prompt Error:', error)
    return NextResponse.json(
      { error: 'Er ging iets mis' },
      { status: 500 }
    )
  }
}
