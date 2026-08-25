# 🛡️ PhishGuard

**Gamified Phishing Awareness & Cybersecurity Training Platform**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?logo=supabase)](https://supabase.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38B2AC?logo=tailwind-css)](https://tailwindcss.com)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)](https://vercel.com)

> Train your team to spot phishing before it strikes. Interactive simulations, gamified learning, AI-powered threat detection, and real-time URL scanning — all in one platform.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🎮 **Phishing Simulations** | 6 attack types: Email, SMS, QR Code, BEC, Social Engineering, Vishing |
| 📚 **Learning Center** | Video modules with quizzes, XP rewards, and progress tracking |
| 🔍 **URL Scanner** | Rule-based phishing detector with 13+ threat indicators |
| 🤖 **AI Assistant** | Azure OpenAI-powered chatbot for security advice |
| 🏆 **Achievements** | Badges, streaks, leaderboard rankings |
| 📰 **News Feed** | Latest cybersecurity threat intelligence |
| 💬 **Community Forum** | Discussions, replies, and likes |
| 📊 **Dashboard** | Real-time stats, radar charts, activity heatmap |
| 🔐 **Auth** | Supabase email/password authentication with RLS |
| ⏰ **Keep-Alive Cron** | Vercel daily cron prevents Supabase free-tier auto-pause |

---

## 🖥️ Screenshots

> Landing Page · Dashboard · Simulations · URL Scanner

---

## 🚀 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org) (App Router + Turbopack)
- **Database & Auth**: [Supabase](https://supabase.com) (PostgreSQL + RLS)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com) + Custom dark theme
- **UI Components**: [shadcn/ui](https://ui.shadcn.com) + [Radix UI](https://radix-ui.com)
- **Charts**: [Recharts](https://recharts.org)
- **Icons**: [Lucide React](https://lucide.dev)
- **AI**: Azure OpenAI (GPT)
- **Deployment**: [Vercel](https://vercel.com) (Hobby — Free)

---

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) account (free)

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/PhishGuard.git
cd PhishGuard
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/openai/v1
AZURE_OPENAI_API_KEY=your_azure_openai_key
AZURE_OPENAI_DEPLOYMENT=gpt-4o

CRON_SECRET=your_random_secret_string
```

### 4. Set up the database
Run the SQL schema in your Supabase SQL Editor:
- Go to: `https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql/new`
- Copy and run the contents of `supabase_schema.sql` (create this from the template below)

### 5. Start the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗄️ Database Schema

The app uses the following Supabase tables:

| Table | Purpose |
|-------|---------|
| `profiles` | User stats, points, level, streak |
| `user_badges` | Achievement badges per user |
| `user_activity` | Activity log (simulations, modules) |
| `discussions` | Community forum posts |
| `discussion_replies` | Replies to discussions |
| `discussion_likes` | Like/unlike discussions |
| `contact_messages` | Contact form submissions |
| `cybersecurity_news` | News feed articles |
| `daily_challenges` | Daily quiz completions |

A PostgreSQL trigger (`handle_new_user`) automatically creates a profile and default badges when a user signs up.

---

## ☁️ Deploy to Vercel (Free)

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → Import project
3. Add all environment variables from `.env.local`
4. Deploy!

The included `vercel.json` sets up a **daily cron job** (`0 8 * * *`) that pings your Supabase project to prevent the free-tier auto-pause.

```json
{
  "crons": [
    {
      "path": "/api/keep-alive",
      "schedule": "0 8 * * *"
    }
  ]
}
```

---

## 📁 Project Structure

```
src/
├── app/
│   ├── (auth)/          # login, signup pages
│   ├── api/             # API routes (scan, chat, keep-alive)
│   ├── dashboard/       # User dashboard
│   ├── learn/           # Video learning modules
│   ├── simulations/     # Phishing simulations
│   ├── achievements/    # Badge gallery
│   ├── leaderboard/     # Rankings
│   ├── scan/            # URL scanner
│   ├── ai-assistant/    # AI chatbot
│   ├── discussions/     # Community forum
│   ├── news/            # Security news
│   └── daily-challenge/ # Daily quiz
├── components/
│   ├── sections/        # Page sections (Header, Footer)
│   └── ui/              # Reusable UI components
└── lib/
    ├── supabase.ts       # Client-side Supabase
    ├── supabase-server.ts # Server-side Supabase
    └── updateUserStats.ts # XP/stats updater
```

---

## 🔒 Security Notes

- All database tables use **Row Level Security (RLS)**
- API keys are stored in environment variables (never in code)
- The URL scanner runs entirely server-side
- Supabase auth uses JWT tokens with secure cookie storage

---

## 📄 License

MIT License — feel free to use, modify, and distribute.

---

## 🙏 Acknowledgements

- Built with ❤️ using Next.js, Supabase, and TailwindCSS
