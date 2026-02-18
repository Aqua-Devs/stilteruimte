import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { recipientName, currentContent } = await request.json()

    const prompt = `De gebruiker schrijft een brief aan ${recipientName}, iemand die is overleden.

Hun huidige brief:
"${currentContent}"

Help ze door:
1. Een zachte suggestie voor hoe ze verder kunnen schrijven
2. OF een andere manier om een gedachte te formuleren
3. Wees empathisch, geen clichés
4. Respecteer de intimiteit van de brief
5. Geef 2-3 korte suggesties (elk 1-2 zinnen)

Format als:
- [Suggestie 1]
- [Suggestie 2]
- [Suggestie 3]`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 500,
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
    const suggestion = data.content[0].text

    return NextResponse.json({ suggestion })

  } catch (error) {
    console.error('Letter AI help error:', error)
    return NextResponse.json(
      { error: 'Er ging iets mis met de AI hulp' },
      { status: 500 }
    )
  }
}
