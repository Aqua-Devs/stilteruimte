import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { action, content, emotion } = await request.json()

    let prompt = ''
    
    switch (action) {
      case 'continue':
        prompt = `De gebruiker schrijft in hun rouwdagboek en wil hulp met doorschrijven. Hun huidige tekst is:

"${content}"

Hun emotie: ${emotion}

Geef 2-3 suggesties voor hoe ze verder kunnen schrijven. Wees empathisch en help ze dieper te gaan. Formateer als:
- [Suggestie 1]
- [Suggestie 2]
- [Suggestie 3]`
        break
        
      case 'expand':
        prompt = `De gebruiker wil deze gedachte uitwerken:

"${content}"

Hun emotie: ${emotion}

Help ze deze gedachte dieper te verkennen met 2-3 vervolgvragen of invalshoeken. Formateer als:
- [Vraag/invalshoek 1]
- [Vraag/invalshoek 2]
- [Vraag/invalshoek 3]`
        break
        
      case 'reframe':
        prompt = `De gebruiker schreef dit in hun dagboek:

"${content}"

Dit klinkt als een moeilijke gedachte. Bied een zachte, alternatieve manier aan om naar deze situatie te kijken, zonder te minimaliseren. Geef 1-2 reframings.`
        break
        
      default:
        throw new Error('Invalid action')
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 512,
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
    const suggestions = data.content[0].text

    return NextResponse.json({ suggestions })

  } catch (error) {
    console.error('AI Writing Assistant Error:', error)
    return NextResponse.json(
      { error: 'Er ging iets mis met de AI' },
      { status: 500 }
    )
  }
}
