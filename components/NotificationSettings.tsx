'use client'

import { useState, useEffect } from 'react'

export default function NotificationSettings() {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [notificationTime, setNotificationTime] = useState('20:00')

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }

    // Check if already subscribed
    checkSubscription()
  }, [])

  const checkSubscription = async () => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      setIsSubscribed(!!subscription)
    }
  }

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      alert('Je browser ondersteunt geen notificaties')
      return
    }

    const result = await Notification.requestPermission()
    setPermission(result)

    if (result === 'granted') {
      await subscribeToPush()
    }
  }

  const subscribeToPush = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      alert('Push notificaties worden niet ondersteund')
      return
    }

    try {
      const registration = await navigator.serviceWorker.ready
      
      // In production, you'd get this from your backend
      const vapidPublicKey = 'YOUR_VAPID_PUBLIC_KEY'
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      })

      // Send subscription to your backend
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription,
          notificationTime
        })
      })

      setIsSubscribed(true)
      alert('✅ Dagelijkse herinneringen geactiveerd!')
    } catch (error) {
      console.error('Subscription failed:', error)
      alert('Er ging iets mis. Probeer het opnieuw.')
    }
  }

  const unsubscribe = async () => {
    if (!('serviceWorker' in navigator)) return

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      
      if (subscription) {
        await subscription.unsubscribe()
        
        // Notify backend
        await fetch('/api/notifications/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: subscription.endpoint })
        })
      }

      setIsSubscribed(false)
      alert('Herinneringen uitgeschakeld')
    } catch (error) {
      console.error('Unsubscribe failed:', error)
    }
  }

  return (
    <div className="bg-white/60 backdrop-blur-md rounded-3xl border border-sage/20 p-8">
      <div className="flex items-start gap-4">
        <div className="text-4xl">🔔</div>
        <div className="flex-1">
          <h3 className="font-serif text-2xl font-light text-soft-black mb-2">
            Dagelijkse herinneringen
          </h3>
          <p className="text-warm-gray mb-6">
            Ontvang een zachte herinnering om te schrijven, op een tijd die jou uitkomt
          </p>

          {permission === 'default' && (
            <button
              onClick={requestPermission}
              className="px-6 py-3 bg-sage text-white rounded-full hover:bg-deep-sage transition-all"
            >
              Activeer herinneringen
            </button>
          )}

          {permission === 'denied' && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-700">
              Je hebt notificaties geblokkeerd. Wijzig dit in je browser instellingen om herinneringen te ontvangen.
            </div>
          )}

          {permission === 'granted' && !isSubscribed && (
            <div>
              <label className="block text-sm font-medium text-warm-gray mb-2">
                Herinnering tijd
              </label>
              <div className="flex gap-3 items-center mb-4">
                <input
                  type="time"
                  value={notificationTime}
                  onChange={(e) => setNotificationTime(e.target.value)}
                  className="px-4 py-2 border border-sage/30 rounded-2xl outline-none focus:ring-2 focus:ring-sage/50"
                />
                <button
                  onClick={subscribeToPush}
                  className="px-6 py-2 bg-sage text-white rounded-full hover:bg-deep-sage transition-all"
                >
                  Opslaan
                </button>
              </div>
            </div>
          )}

          {permission === 'granted' && isSubscribed && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-green-600 text-sm font-medium">
                  Herinneringen actief om {notificationTime}
                </span>
              </div>
              <button
                onClick={unsubscribe}
                className="px-6 py-2 bg-mist text-warm-gray rounded-full hover:bg-gray-200 transition-all text-sm"
              >
                Uitschakelen
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Helper function for VAPID key conversion
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}
