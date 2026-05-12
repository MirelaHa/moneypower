# MoneyPower 💰
Simulatorul de educație financiară pentru tineri — PWA deployabilă pe Vercel.

---

## 🚀 Pași pentru deploy
  
### 1. Supabase — Baza de date

1. Mergi la **https://supabase.com** și deschide proiectul tău
2. Click pe **SQL Editor** în meniul din stânga
3. Copiază tot conținutul din `supabase-schema.sql` și rulează-l (butonul **Run**)
4. Mergi la **Settings > API** și copiază:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

### 2. GitHub — Încarcă codul   

1. Mergi la **https://github.com/new**
2. Nume repository: `moneypower`
3. Private sau Public — la alegere
4. Click **Create repository**
5. Pe pagina care apare, urmează instrucțiunile **"upload an existing file"**
6. Încarcă toate fișierele din acest folder (drag & drop)
7. Click **Commit changes**

### 3. Vercel — Deploy

1. Mergi la **https://vercel.com/new**
2. Click **Import** lângă repository-ul `moneypower`
3. La **Environment Variables** adaugă:
   - `VITE_SUPABASE_URL` = URL-ul din Supabase
   - `VITE_SUPABASE_ANON_KEY` = cheia anon din Supabase
4. Click **Deploy** — în 2 minute site-ul e live!

### 4. Domeniu custom (moneypower.ro)

În Vercel, după deploy:
1. Click pe proiect > **Settings > Domains**
2. Adaugă `moneypower.ro` și `www.moneypower.ro`
3. Vercel îți arată 2 recorduri DNS de adăugat

În panoul ROTLD:
1. Intră în contul tău ROTLD
2. Mergi la **DNS Management** pentru `moneypower.ro`
3. Adaugă recordurile exacte pe care le-a dat Vercel:
   - **A record**: `@` → IP-ul Vercel
   - **CNAME record**: `www` → `cname.vercel-dns.com`
4. Salvează — propagarea DNS durează 1-24 ore

---

## 📁 Structura proiectului

```
moneypower/
├── src/
│   ├── components/
│   │   └── UI.jsx          # Componente reutilizabile
│   ├── pages/
│   │   ├── Auth.jsx        # Login / Register
│   │   ├── Dashboard.jsx   # Profilul utilizatorului
│   │   ├── Game.jsx        # Jocul propriu-zis
│   │   ├── AIFeedback.jsx  # Analiza AI după joc
│   │   ├── Leaderboard.jsx # Clasament global
│   │   └── Challenges.jsx  # Challengeuri săptămânale
│   ├── lib/
│   │   ├── supabase.js     # Client Supabase + funcții
│   │   └── data.js         # Scenarii + challengeuri
│   ├── App.jsx             # Routing principal
│   └── main.jsx            # Entry point
├── index.html
├── vite.config.js          # Config Vite + PWA
├── package.json
├── supabase-schema.sql     # Schema baza de date
└── .env.example            # Template variabile de mediu
```
