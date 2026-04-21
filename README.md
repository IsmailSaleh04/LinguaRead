# LinguaRead

**Learn languages by reading what you love.**

LinguaRead is a language-learning web app built on the idea that immersive reading is the most natural path to fluency. Pick an article from Wikipedia on any topic you care about, read it in your target language, click any word you don't know for an instant translation, and watch your vocabulary grow session by session.

---

## Video Preview

![Video](public/video/LinguaRead-video-preview.mov)

---

## Features

- **Wikipedia article search** — search any topic and read it in your target language
- **Personalised recommendations** — articles are matched to your CEFR proficiency level and preferred topics
- **Interactive reading** — click any highlighted word for translation, pronunciation, and one-tap "mark as known"
- **Automatic vocabulary tracking** — words progress through *unknown → learning → known* based on how you interact with them
- **Reading sessions** — scroll progress, time spent, and words learned are recorded per session
- **Progress dashboard** — streaks, total known words, articles read, and daily activity charts
- **Multi-language support** — 11 languages; switch your active language at any time
- **Topic preferences** — choose interest categories (Technology, Science, History, …) to steer recommendations
- **Settings** — daily reading goal, sound effects, speaking mode, and daily reminders

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js](https://nextjs.org/) 16 (App Router) |
| Language | TypeScript 5 |
| UI | React 19, Tailwind CSS 4 |
| Icons | Lucide React |
| Database | PostgreSQL via `pg` |
| Auth | JWT (`jose`) + bcrypt |
| HTML parsing | Cheerio |
| Translation API | [MyMemory](https://mymemory.translated.net/) (free tier) |
| Content source | Wikipedia REST API |

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login, register, onboarding
│   ├── (dashboard)/     # Dashboard, reading, vocabulary, progress, settings …
│   ├── api/             # All Next.js route handlers
│   └── page.tsx         # Landing page
├── components/          # Reusable UI components
├── contexts/            # AuthContext, LanguageContext
├── lib/
│   ├── api/             # Client-side API wrappers
│   ├── hooks/           # useProgress, useVocabulary, useReadingSession …
│   └── utils/           # Formatters, constants
└── db/
    └── db.ts            # PostgreSQL connection pool
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 20
- PostgreSQL running locally (default: `localhost:5432`)

### 1. Clone and install

```bash
git clone https://github.com/your-username/linguaread.git
cd linguaread
npm install
```

### 2. Environment variables

Create a `.env.local` file in the project root:

```env
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here

# Optional — defaults to localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 3. Database setup

Create the database and run the schema:

```bash
createdb langpilot
psql -d langpilot -f schema.sql   # or however your migrations are structured
```

Update the connection config in `src/db/db.ts` if your PostgreSQL credentials differ from the defaults.

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |

---

## How It Works

1. **Register** and choose your native language.
2. **Onboarding** — pick a target language, your current CEFR level, and a few interest topics.
3. **Discover articles** — the reading page surfaces Wikipedia articles matched to your level, or you can search for anything.
4. **Read** — words in the article are highlighted. Click one to see its translation and hear it spoken. Mark it as known when you're confident.
5. **Track progress** — the dashboard shows your streak, known-word count, and daily activity over the past week, month, or year.

---

## Dependencies

```json
{
  "bcryptjs": "^2.4.3",
  "cheerio": "^1.2.0",
  "jose": "^5.1.0",
  "lucide-react": "^0.563.0",
  "next": "^16.1.4",
  "pg": "^8.11.0",
  "react": "19.2.0",
  "react-dom": "19.2.0"
}
```

---

## License

MIT