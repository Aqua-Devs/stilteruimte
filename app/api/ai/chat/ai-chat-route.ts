import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { messages, userId } = await request.json()

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

VOORBEELDEN VAN GOEDE VRAGEN:
- "Wil je me meer vertellen over [specifiek genoemd gevoel]?"
- "Wat zou je tegen jezelf willen zeggen op dit moment?"
- "Waar in je lichaam voel je dit?"
- "Is er een herinnering die je wilt delen?"

VERMIJD:
- Clichés ("tijd heelt alle wonden", "ze zou willen dat je gelukkig bent")
- Te veel vragen tegelijk
- Ongevraagde adviezen
- Oplossingen pushen
- Minimaliseren van pijn`,
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
