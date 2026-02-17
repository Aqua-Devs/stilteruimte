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
      <div className="fixed w-[600px] h-[600px] bg-sage rounded-full blur-[80px] opacity-15 -top-48 -right-36 animate-float" />
      <div className="fixed w-[500px] h-[500px] bg-clay rounded-full blur-[80px] opacity-15 -bottom-24 -left-24 animate-float" style={{ animationDelay: '5s' }} />
      <div className="fixed w-[400px] h-[400px] bg-deep-sage rounded-full blur-[80px] opacity-15 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-float" style={{ animationDelay: '10s' }} />

      <nav className="relative z-50 px-[5%] py-8 flex justify-between items-center animate-[slideDown_0.8s_ease-out]">
        <div className="font-serif text-2xl font-light text-soft-black tracking-[2px]">
          STILLE RUIMTE
        </div>
        <ul className="hidden md:flex gap-10 items-center">
          <li><a href="#functies" className="text-warm-gray text-sm font-light hover:text-deep-sage transition-colors relative group">Functies<span className="absolute bottom-[-5px] left-0 w-0 h-[1px] bg-sage transition-all duration-300 group-hover:w-full" /></a></li>
          <li><a href="#ai-begeleiding" className="text-warm-gray text-sm font-light hover:text-deep-sage transition-colors relative group">AI Begeleiding<span className="absolute bottom-[-5px] left-0 w-0 h-[1px] bg-sage transition-all duration-300 group-hover:w-full" /></a></li>
          <li><a href="#over" className="text-warm-gray text-sm font-light hover:text-deep-sage transition-colors relative group">Over<span className="absolute bottom-[-5px] left-0 w-0 h-[1px] bg-sage transition-all duration-300 group-hover:w-full" /></a></li>
          <li><a href="#contact" className="text-warm-gray text-sm font-light hover:text-deep-sage transition-colors relative group">Contact<span className="absolute bottom-[-5px] left-0 w-0 h-[1px] bg-sage transition-all duration-300 group-hover:w-full" /></a></li>
          <li><Link href="/auth/login" className="text-warm-gray text-sm font-light hover:text-deep-sage transition-colors">Inloggen</Link></li>
        </ul>
      </nav>

      <section className="relative z-10 min-h-[85vh] flex items-center px-[5%] py-16">
        <div className="max-w-[700px] animate-[fadeIn_1.2s_ease-out_0.3s_both]">
          <h1 className="font-serif text-6xl md:text-7xl font-light text-soft-black leading-[1.1] mb-8 tracking-tight">
            Een veilige plek voor je gedachten na verlies
          </h1>
          <p className="text-xl text-warm-gray mb-12 font-light opacity-0 animate-[fadeIn_1.2s_ease-out_0.8s_both]">
            Rouw heeft geen tijdslijn. Verwerkingstijd is persoonlijk. StilleRuimte begeleidt je zachtmoedig door je eigen reis, zonder druk of oordeel.
          </p>
          <div className="flex gap-4 opacity-0 animate-[fadeIn_1.2s_ease-out_1.2s_both]">
            <Link href="/auth/login" className="inline-block px-12 py-5 bg-white border-2 border-sage text-sage rounded-full text-base font-normal transition-all duration-400 hover:bg-sage hover:text-white hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(156,168,150,0.3)]">
              Inloggen
            </Link>
            <Link href="/auth/signup" className="inline-block px-12 py-5 bg-sage text-white rounded-full text-base font-normal transition-all duration-400 hover:bg-deep-sage hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(156,168,150,0.3)]">
              Maak account aan
            </Link>
          </div>
        </div>
      </section>

      <section className="relative z-10 px-[5%] py-32 bg-gradient-to-b from-transparent via-mist/30 to-transparent">
        <h2 className="font-serif text-5xl font-light text-center mb-4 text-soft-black">Jouw persoonlijke ruimte</h2>
        <p className="text-center text-lg text-warm-gray mb-20 max-w-[600px] mx-auto">Vier eenvoudige tools die je helpen bij emotionele verwerking, in jouw eigen tempo</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 max-w-7xl mx-auto">
          <div className="scroll-reveal opacity-0 translate-y-12 transition-all duration-800 bg-white/60 backdrop-blur-md p-12 rounded-[30px] border border-sage/20 hover:-translate-y-2.5 hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] hover:border-sage">
            <div className="w-[60px] h-[60px] bg-gradient-to-br from-sage to-deep-sage rounded-full flex items-center justify-center mb-6 text-2xl">📝</div>
            <h3 className="font-serif text-2xl font-normal mb-4 text-soft-black">Privé Dagboek</h3>
            <p className="text-base leading-relaxed text-warm-gray">Schrijf wanneer je wilt. Geen druk, geen verwachtingen. Jouw gedachten blijven volledig privé en veilig bij jou.</p>
          </div>
          <div className="scroll-reveal opacity-0 translate-y-12 transition-all duration-800 bg-white/60 backdrop-blur-md p-12 rounded-[30px] border border-sage/20 hover:-translate-y-2.5 hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] hover:border-sage">
            <div className="w-[60px] h-[60px] bg-gradient-to-br from-sage to-deep-sage rounded-full flex items-center justify-center mb-6 text-2xl">💭</div>
            <h3 className="font-serif text-2xl font-normal mb-4 text-soft-black">Zachte Reflectie</h3>
            <p className="text-base leading-relaxed text-warm-gray">Optionele dagelijkse prompts die je helpen verkennen wat je voelt. Nooit opdringerig, altijd optioneel.</p>
          </div>
          <div className="scroll-reveal opacity-0 translate-y-12 transition-all duration-800 bg-white/60 backdrop-blur-md p-12 rounded-[30px] border border-sage/20 hover:-translate-y-2.5 hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] hover:border-sage">
            <div className="w-[60px] h-[60px] bg-gradient-to-br from-sage to-deep-sage rounded-full flex items-center justify-center mb-6 text-2xl">🌊</div>
            <h3 className="font-serif text-2xl font-normal mb-4 text-soft-black">Emotie Tracking</h3>
            <p className="text-base leading-relaxed text-warm-gray">Eenvoudig bijhouden hoe je je voelt. Visueel, zonder pressure. Zie patronen ontstaan in je eigen tijd.</p>
          </div>
          <div className="scroll-reveal opacity-0 translate-y-12 transition-all duration-800 bg-white/60 backdrop-blur-md p-12 rounded-[30px] border border-sage/20 hover:-translate-y-2.5 hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] hover:border-sage">
            <div className="w-[60px] h-[60px] bg-gradient-to-br from-sage to-deep-sage rounded-full flex items-center justify-center mb-6 text-2xl">🌱</div>
            <h3 className="font-serif text-2xl font-normal mb-4 text-soft-black">Jouw Progressie</h3>
            <p className="text-base leading-relaxed text-warm-gray">Kijk terug op je reis wanneer je er klaar voor bent. Herken groei die je zelf misschien niet opmerkt.</p>
          </div>
        </div>
      </section>

      <section className="scroll-reveal opacity-0 translate-y-12 transition-all duration-800 relative z-10 px-[5%] py-32 bg-white">
        <div className="grid md:grid-cols-2 gap-20 max-w-7xl mx-auto items-center">
          <div className="relative h-[500px] bg-gradient-to-br from-mist to-cream rounded-[40px] flex items-center justify-center overflow-hidden">
            <div className="absolute w-[200%] h-[200%] opacity-10 animate-[slidePattern_20s_linear_infinite]" style={{backgroundImage: 'radial-gradient(circle, var(--sage) 1px, transparent 1px)', backgroundSize: '30px 30px'}} />
            <div className="text-8xl opacity-30">🤝</div>
          </div>
          <div>
            <h2 className="font-serif text-5xl font-light mb-6 text-soft-black">AI die écht luistert</h2>
            <p className="text-lg leading-relaxed mb-12 text-warm-gray">Geen therapie, geen oordeel. Onze AI begeleidt je zachtmoedig door moeilijke gedachten. Het stelt vervolgvragen, helpt patronen herkennen, en ondersteunt je bij het ontwarren van emoties—volledig op jouw voorwaarden.</p>
            <ul className="space-y-0">
              <li className="py-5 border-b border-sage/20 text-base text-warm-gray flex items-start gap-4"><span className="text-sage font-semibold text-lg flex-shrink-0">✓</span>Dagboek Companion die doorvraagt wanneer het helpt</li>
              <li className="py-5 border-b border-sage/20 text-base text-warm-gray flex items-start gap-4"><span className="text-sage font-semibold text-lg flex-shrink-0">✓</span>Voice-to-text voor als schrijven te zwaar voelt</li>
              <li className="py-5 border-b border-sage/20 text-base text-warm-gray flex items-start gap-4"><span className="text-sage font-semibold text-lg flex-shrink-0">✓</span>Emotie patroon herkenning over tijd</li>
              <li className="py-5 border-b border-sage/20 text-base text-warm-gray flex items-start gap-4"><span className="text-sage font-semibold text-lg flex-shrink-0">✓</span>Gepersonaliseerde reflectie prompts gebaseerd op jouw verhaal</li>
              <li className="py-5 border-b border-sage/20 text-base text-warm-gray flex items-start gap-4"><span className="text-sage font-semibold text-lg flex-shrink-0">✓</span>Hulp bij het schrijven van brieven aan je overledene</li>
              <li className="py-5 border-b border-sage/20 text-base text-warm-gray flex items-start gap-4"><span className="text-sage font-semibold text-lg flex-shrink-0">✓</span>Maandelijks progressie narratief in jouw eigen woorden</li>
              <li className="py-5 border-b border-sage/20 text-base text-warm-gray flex items-start gap-4"><span className="text-sage font-semibold text-lg flex-shrink-0">✓</span>Zachte reframing van destructieve denkpatronen</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="scroll-reveal opacity-0 translate-y-12 transition-all duration-800 relative z-10 px-[5%] py-32 bg-mist">
        <div className="max-w-4xl mx-auto p-16 bg-white rounded-[40px] shadow-[0_20px_60px_rgba(0,0,0,0.05)]">
          <p className="font-serif text-3xl font-light leading-relaxed text-soft-black mb-8 italic">
            <span className="text-7xl text-sage leading-none block mb-4">"</span>
            Na het verlies van mijn vader wist ik niet waar ik mijn gedachten moest laten. StilleRuimte gaf me een plek om alles op te schrijven zonder dat ik bang hoefde te zijn voor oordeel. De AI stelde precies de juiste vragen op momenten dat ik vast zat. Het voelde als iemand die echt luisterde.
          </p>
          <p className="text-base text-warm-gray font-normal">— Sarah, 34 jaar</p>
        </div>
      </section>

      <section className="scroll-reveal opacity-0 translate-y-12 transition-all duration-800 relative z-10 px-[5%] py-40 text-center">
        <h2 className="font-serif text-6xl font-light mb-6 text-soft-black">Neem de tijd die je nodig hebt</h2>
        <p className="text-xl text-warm-gray mb-12 max-w-[600px] mx-auto">StilleRuimte is volledig gratis. Geen verborgen kosten, geen tijdslimiet. Begin vandaag met verwerkingstijd die bij jou past.</p>
        <div className="flex gap-4 justify-center">
          <Link href="/auth/login" className="inline-block px-12 py-5 bg-white border-2 border-sage text-sage rounded-full text-base font-normal transition-all duration-400 hover:bg-sage hover:text-white hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(156,168,150,0.3)]">
            Inloggen
          </Link>
          <Link href="/auth/signup" className="inline-block px-12 py-5 bg-sage text-white rounded-full text-base font-normal transition-all duration-400 hover:bg-deep-sage hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(156,168,150,0.3)]">
            Maak account aan
          </Link>
        </div>
      </section>

      <footer className="relative z-10 px-[5%] py-16 bg-soft-black text-white/60 text-center">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-8">
          <div className="font-serif text-2xl font-light tracking-[2px]">STILLE RUIMTE</div>
          <ul className="flex gap-8">
            <li><a href="#" className="hover:text-sage transition-colors">Privacy</a></li>
            <li><a href="#" className="hover:text-sage transition-colors">Voorwaarden</a></li>
            <li><a href="#" className="hover:text-sage transition-colors">Contact</a></li>
            <li><a href="#" className="hover:text-sage transition-colors">Over ons</a></li>
          </ul>
          <p>© 2026 StilleRuimte. Gemaakt met zorg.</p>
        </div>
      </footer>
      <RegisterSW />
    </main>
  )
}