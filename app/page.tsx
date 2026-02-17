'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import RegisterSW from './RegisterSW'

export default function Home() {
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100', 'translate-y-0')
            entry.target.classList.remove('opacity-0', 'translate-y-12')
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -100px 0px' }
    )

    document.querySelectorAll('.scroll-reveal').forEach((el) => {
      observerRef.current?.observe(el)
    })

    return () => observerRef.current?.disconnect()
  }, [])

  return (
    <main className="relative overflow-hidden">
      {/* Background shapes */}
      <div className="fixed w-[600px] h-[600px] bg-sage rounded-full blur-[80px] opacity-15 -top-48 -right-36 animate-float" />
      <div className="fixed w-[500px] h-[500px] bg-clay rounded-full blur-[80px] opacity-15 -bottom-24 -left-24 animate-float" style={{ animationDelay: '5s' }} />
      <div className="fixed w-[400px] h-[400px] bg-deep-sage rounded-full blur-[80px] opacity-15 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-float" style={{ animationDelay: '10s' }} />

      {/* Navigation */}
      <nav className="relative z-50 px-[5%] py-8 flex justify-between items-center animate-[slideDown_0.8s_ease-out]">
        <div className="font-serif text-2xl font-light text-soft-black tracking-[2px]">
          STILLE RUIMTE
        </div>
        <ul className="hidden md:flex gap-10">
          {['Functies', 'AI Begeleiding', 'Over', 'Contact'].map((item) => (
            <li key={item}>
              <a
                href={`#${item.toLowerCase().replace(' ', '-')}`}
                className="text-warm-gray text-sm font-light hover:text-deep-sage transition-colors relative group"
              >
                {item}
                <span className="absolute bottom-[-5px] left-0 w-0 h-[1px] bg-sage transition-all duration-300 group-hover:w-full" />
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 min-h-[85vh] flex items-center px-[5%] py-16">
        <div className="max-w-[700px] animate-[fadeIn_1.2s_ease-out_0.3s_both]">
          <h1 className="font-serif text-6xl md:text-7xl font-light text-soft-black leading-[1.1] mb-8 tracking-tight">
            Een veilige plek voor je gedachten na verlies
          </h1>
          <p className="text-xl text-warm-gray mb-12 font-light opacity-0 animate-[fadeIn_1.2s_ease-out_0.8s_both]">
            Rouw heeft geen tijdslijn. Verwerkingstijd is persoonlijk. StilleRuimte begeleidt je zachtmoedig door je eigen reis, zonder druk of oordeel.
          </p>
          <Link
            href="/auth/signup"
            className="inline-block px-12 py-5 bg-sage text-white rounded-full text-base font-normal transition-all duration-400 hover:bg-deep-sage hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(156,168,150,0.3)] opacity-0 animate-[fadeIn_1.2s_ease-out_1.2s_both]"
          >
            Begin je reis (gratis)
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 px-[5%] py-32 bg-gradient-to-b from-transparent via-mist/30 to-transparent">
        <h2 className="font-serif text-5xl font-light text-center mb-4 text-soft-black">
          Jouw persoonlijke ruimte
        </h2>
        <p className="text-center text-lg text-warm-gray mb-20 max-w-[600px] mx-auto">
          Vier eenvoudige tools die je helpen bij emotionele verwerking, in jouw eigen tempo
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 max-w-7xl mx-auto">
          {[
            {
              icon: 'ðŸ“',
              title: 'PrivÃ© Dagboek',
              description: 'Schrijf wanneer je wilt. Geen druk, geen verwachtingen. Jouw gedachten blijven volledig privÃ© en veilig bij jou.',
              delay: '0.2s'
            },
            {
              icon: 'ðŸ’­',
              title: 'Zachte Reflectie',
              description: 'Optionele dagelijkse prompts die je helpen verkennen wat je voelt. Nooit opdringerig, altijd optioneel.',
              delay: '0.4s'
            },
            {
              icon: 'ðŸŒŠ',
              title: 'Emotie Tracking',
              description: 'Eenvoudig bijhouden hoe je je voelt. Visueel, zonder pressure. Zie patronen ontstaan in je eigen tijd.',
              delay: '0.6s'
            },
            {
              icon: 'ðŸŒ±',
              title: 'Jouw Progressie',
              description: 'Kijk terug op je reis wanneer je er klaar voor bent. Herken groei die je zelf misschien niet opmerkt.',
              delay: '0.8s'
            }
          ].map((feature, i) => (
            <div
              key={i}
              className="scroll-reveal opacity-0 translate-y-12 transition-all duration-800 bg-white/60 backdrop-blur-md p-12 rounded-[30px] border border-sage/20 hover:-translate-y-2.5 hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] hover:border-sage"
              style={{ animationDelay: feature.delay }}
            >
              <div className="w-[60px] h-[60px] bg-gradient-to-br from-sage to-deep-sage rounded-full flex items-center justify-center mb-6 text-2xl">
                {feature.icon}
              </div>
              <h3 className="font-serif text-2xl font-normal mb-4 text-soft-black">
                {feature.title}
              </h3>
              <p className="text-base leading-relaxed text-warm-gray">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* AI Features Section */}
      <section className="scroll-reveal opacity-0 translate-y-12 transition-all duration-800 relative z-10 px-[5%] py-32 bg-white">
        <div className="grid md:grid-cols-2 gap-20 max-w-7xl mx-auto items-center">
          <div className="relative h-[500px] bg-gradient-to-br from-mist to-cream rounded-[40px] flex items-center justify-center overflow-hidden">
            <div className="absolute w-[200%] h-[200%] opacity-10 animate-[slidePattern_20s_linear_infinite]"
              style={{
                backgroundImage: 'radial-gradient(circle, var(--sage) 1px, transparent 1px)',
                backgroundSize: '30px 30px'
              }}
            />
            <div className="text-8xl opacity-30">ðŸ¤</div>
          </div>

          <div>
            <h2 className="font-serif text-5xl font-light mb-6 text-soft-black">
              AI die Ã©cht luistert
            </h2>
            <p className="text-lg leading-relaxed mb-12 text-warm-gray">
              Geen therapie, geen oordeel. Onze AI begeleidt je zachtmoedig door moeilijke gedachten. Het stelt vervolgvragen, helpt patronen herkennen, en ondersteunt je bij het ontwarren van emotiesâ€”volledig op jouw voorwaarden.
            </p>
            <ul className="space-y-0">
              {[
                'Dagboek Companion die doorvraagt wanneer het helpt',
                'Voice-to-text voor als schrijven te zwaar voelt',
                'Emotie patroon herkenning over tijd',
                'Gepersonaliseerde reflectie prompts gebaseerd op jouw verhaal',
                'Hulp bij het schrijven van brieven aan je overledene',
                'Maandelijks progressie narratief in jouw eigen woorden',
                'Zachte reframing van destructieve denkpatronen'
              ].map((item, i) => (
                <li key={i} className="py-5 border-b border-sage/20 text-base text-warm-gray flex items-start gap-4">
                  <span className="text-sage font-semibold text-lg flex-shrink-0">âœ“</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="scroll-reveal opacity-0 translate-y-12 transition-all duration-800 relative z-10 px-[5%] py-32 bg-mist">
        <div className="max-w-4xl mx-auto p-16 bg-white rounded-[40px] shadow-[0_20px_60px_rgba(0,0,0,0.05)]">
          <p className="font-serif text-3xl font-light leading-relaxed text-soft-black mb-8 italic">
            <span className="text-7xl text-sage leading-none block mb-4">"</span>
            Na het verlies van mijn vader wist ik niet waar ik mijn gedachten moest laten. StilleRuimte gaf me een plek om alles op te schrijven zonder dat ik bang hoefde te zijn voor oordeel. De AI stelde precies de juiste vragen op momenten dat ik vast zat. Het voelde als iemand die echt luisterde.
          </p>
          <p className="text-base text-warm-gray font-normal">â€” Sarah, 34 jaar</p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="scroll-reveal opacity-0 translate-y-12 transition-all duration-800 relative z-10 px-[5%] py-40 text-center">
        <h2 className="font-serif text-6xl font-light mb-6 text-soft-black">
          Neem de tijd die je nodig hebt
        </h2>
        <p className="text-xl text-warm-gray mb-12 max-w-[600px] mx-auto">
          StilleRuimte is volledig gratis. Geen verborgen kosten, geen tijdslimiet. Begin vandaag met verwerkingstijd die bij jou past.
        </p>
        <Link
          href="/auth/signup"
          className="inline-block px-12 py-5 bg-sage text-white rounded-full text-base font-normal transition-all duration-400 hover:bg-deep-sage hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(156,168,150,0.3)]"
        >
          Begin gratis
        </Link>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-[5%] py-16 bg-soft-black text-white/60 text-center">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-8">
          <div className="font-serif text-2xl font-light tracking-[2px]">
            STILLE RUIMTE
          </div>
          <ul className="flex gap-8">
            {['Privacy', 'Voorwaarden', 'Contact', 'Over ons'].map((item) => (
              <li key={item}>
                <a href="#" className="hover:text-sage transition-colors">
                  {item}
                </a>
              </li>
            ))}
          </ul>
          <p>Â© 2026 StilleRuimte. Gemaakt met zorg.</p>
        </div>
      </footer>
          <RegisterSW />
    </main>
  )
}

// Keyframes animations
const style = document.createElement('style')
style.textContent = `
  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes slidePattern {
    from { transform: translate(0, 0); }
    to { transform: translate(30px, 30px); }
  }
`
if (typeof document !== 'undefined') {
  document.head.appendChild(style)
}

