import type { Metadata, Viewport } from 'next'
import './globals.css'
import PWAInstallPrompt from '@/components/PWAInstallPrompt'
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration'

export const metadata: Metadata = {
  title: 'StilleRuimte - Een veilige plek voor je gedachten na verlies',
  description: 'Verwerkingstijd is persoonlijk. StilleRuimte begeleidt je zachtmoedig door je rouwproces, zonder druk of oordeel.',
  keywords: 'rouwverwerking, dagboek, emotionele verwerking, grief support, verlies',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'StilleRuimte'
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#9CA896'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="nl">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="StilleRuimte" />
        <meta name="mobile-web-app-capable" content="yes" />
              <script dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/service-worker.js')
                  .then(function(r) { console.log('✅ SW registered:', r); })
                  .catch(function(e) { console.log('❌ SW error:', e); });
              });
            }
          `
        }} />
      </head>
      <body>
        {children}
        <PWAInstallPrompt />
        <ServiceWorkerRegistration />
      </body>
    </html>
  )
}

