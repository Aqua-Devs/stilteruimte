'use client'

import { useState, useEffect } from 'react'

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    // Check if already installed
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches
    if (isInstalled) return

    // Check if dismissed recently
    const dismissed = localStorage.getItem('pwa-prompt-dismissed')
    if (dismissed) {
      const dismissedTime = parseInt(dismissed)
      const daysSince = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24)
      if (daysSince < 7) return // Don't show again for 7 days
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      
      // Show prompt after 30 seconds
      setTimeout(() => {
        setShowPrompt(true)
      }, 30000)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      console.log('PWA installed')
    }
    
    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString())
    setShowPrompt(false)
  }

  if (!showPrompt) return null

  return (
    <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:max-w-sm z-50 animate-[slideUp_0.5s_ease-out]">
      <div className="bg-white shadow-2xl rounded-3xl border border-sage/20 p-6">
        <div className="flex items-start gap-4">
          <div className="text-4xl">📱</div>
          <div className="flex-1">
            <h3 className="font-serif text-xl font-light text-soft-black mb-2">
              Installeer StilleRuimte
            </h3>
            <p className="text-sm text-warm-gray mb-4">
              Installeer de app op je telefoon voor snelle toegang en offline gebruik
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleInstall}
                className="flex-1 px-4 py-2 bg-sage text-white rounded-full text-sm hover:bg-deep-sage transition-all"
              >
                Installeer
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2 bg-mist text-warm-gray rounded-full text-sm hover:bg-gray-200 transition-all"
              >
                Later
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-warm-gray/40 hover:text-warm-gray transition-colors"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}
