import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'StilleRuimte - Een veilige plek voor je gedachten na verlies',
  description: 'Verwerkingstijd is persoonlijk. StilleRuimte begeleidt je zachtmoedig door je rouwproces, zonder druk of oordeel.',
  keywords: 'rouwverwerking, dagboek, emotionele verwerking, grief support, verlies',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  )
}
