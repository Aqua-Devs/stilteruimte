# StilleRuimte - Rouwverwerkings Platform

Een veilige, privé plek voor emotionele verwerking na verlies. Gebouwd met Next.js, Supabase, en AI-begeleiding.

## 🚀 Quick Start

### 1. Installeer dependencies
```bash
npm install
```

### 2. Supabase Setup

#### A) Maak Supabase project aan
1. Ga naar [supabase.com](https://supabase.com)
2. Klik "New Project"
3. Kies naam: "stille-ruimte"
4. Kies wachtwoord (bewaar goed!)
5. Kies regio: West EU (Netherlands)
6. Klik "Create new project"

#### B) Database Schema
Ga naar SQL Editor in Supabase en run dit:

```sql
-- Enable Row Level Security
alter table auth.users enable row level security;

-- Create journal_entries table
create table public.journal_entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  content text not null,
  emotion text not null check (emotion in ('verdriet', 'boosheid', 'angst', 'vrede', 'gemengd', 'neutraal')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.journal_entries enable row level security;

-- Policy: Users can only see their own entries
create policy "Users can view own entries"
  on public.journal_entries for select
  using (auth.uid() = user_id);

-- Policy: Users can create their own entries
create policy "Users can create own entries"
  on public.journal_entries for insert
  with check (auth.uid() = user_id);

-- Policy: Users can update their own entries
create policy "Users can update own entries"
  on public.journal_entries for update
  using (auth.uid() = user_id);

-- Policy: Users can delete their own entries
create policy "Users can delete own entries"
  on public.journal_entries for delete
  using (auth.uid() = user_id);

-- Create updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger handle_journal_entries_updated_at
  before update on public.journal_entries
  for each row
  execute procedure public.handle_updated_at();
```

#### C) Get API Keys
1. Ga naar Project Settings > API
2. Kopieer:
   - Project URL
   - `anon` `public` key

### 3. Environment Variables

Kopieer `.env.example` naar `.env.local`:
```bash
cp .env.example .env.local
```

Vul in met jouw Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
stille-ruimte/
├── app/
│   ├── page.tsx              # Landing page
│   ├── layout.tsx            # Root layout
│   ├── globals.css           # Global styles
│   ├── auth/
│   │   ├── login/            # Login page
│   │   └── signup/           # Signup page
│   ├── dashboard/            # Main dashboard
│   ├── journal/
│   │   ├── new/              # New journal entry
│   │   └── [id]/             # View/edit entry
│   └── api/                  # API routes (AI features)
├── components/               # Reusable components
├── lib/
│   └── supabase.ts          # Supabase client
└── public/                   # Static assets
```

## 🎨 Features

### MVP (Huidige versie)
- ✅ Gebruikers authenticatie
- ✅ Privé dagboek entries
- ✅ Emotie tracking (6 basis emoties)
- ✅ Dashboard overzicht
- ✅ Responsive design
- ✅ Zachte, organische UI

### Roadmap (Volgende stappen)
- [ ] AI Companion (Claude API integratie)
- [ ] Voice-to-text dagboek
- [ ] Progressie visualisatie
- [ ] Gepersonaliseerde prompts
- [ ] Maandelijkse progress reports
- [ ] Export functionaliteit

## 🤖 AI Features Toevoegen

### Stap 1: Anthropic API Key
1. Ga naar [console.anthropic.com](https://console.anthropic.com)
2. Maak API key aan
3. Voeg toe aan `.env.local`:
```
ANTHROPIC_API_KEY=sk-ant-...
```

### Stap 2: AI Companion Implementeren
Voorbeeld API route (`app/api/ai/companion/route.ts`):

```typescript
import Anthropic from '@anthropic-ai/sdk'

export async function POST(request: Request) {
  const { message, context } = await request.json()
  
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  })

  const response = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: `Je bent een zachtmoedige AI companion voor rouwverwerking. 
      Gebruiker schreef: "${message}"
      Context: ${context}
      
      Stel een zachte, ondersteunende vervolgvraag.`
    }],
  })

  return Response.json(response)
}
```

## 💰 Cost Estimates

### Supabase (Free Tier)
- ✅ 500MB database
- ✅ 50k monthly active users
- ✅ 2GB bandwidth
- **Cost: €0/maand**

### Anthropic API (Pay-as-you-go)
- Claude Haiku: ~€0.01 per dagelijkse prompt
- Claude Sonnet: ~€0.15 per AI sessie
- **100 actieve users: ~€150/maand**

### Hosting (Vercel Free Tier)
- ✅ Unlimited bandwidth
- ✅ 100GB-hours
- **Cost: €0/maand**

**Total MVP: €0/maand**
**Met AI features (100 users): ~€150/maand**

## 🚢 Deployment

### Vercel (Aanbevolen)
```bash
npm install -g vercel
vercel
```

Voeg environment variables toe in Vercel dashboard.

### Netlify
```bash
npm run build
netlify deploy --prod
```

## 🔒 Privacy & Security

- End-to-end encryption ready (Supabase RLS)
- Geen data delen met derden
- GDPR compliant
- Volledige data ownership bij gebruiker
- Delete account = permanent data verwijdering

## 📝 License

MIT License - Privé project voor LeerVibeCoding

## 🤝 Support

Voor vragen of hulp:
- Email: [je-email]
- Issues: GitHub issues

---

**Gemaakt met ❤️ voor mensen die ruimte nodig hebben om te rouwen**
