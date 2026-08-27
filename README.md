# ForgeAI — AI Website-to-Product Agent

Compact full-stack MVP matching the technical assessment.

## Stack
- Next.js + React + TypeScript
- CSS (kept in one file to reduce project complexity)
- Supabase Auth + PostgreSQL
- OpenAI Responses API
- Vercel-ready

## Setup

1. Install Node.js 20+.
2. Open this folder in VS Code.
3. Run:
   ```bash
   npm install
   ```
4. Create a Supabase project.
5. Open Supabase SQL Editor and run `supabase/schema.sql`.
6. Copy `.env.example` to `.env.local` and fill:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
   OPENAI_API_KEY=...
   OPENAI_MODEL=gpt-5.4
   ```
7. Start:
   ```bash
   npm run dev
   ```
8. Open http://localhost:3000

## Important
The current MVP asks the LLM to analyze the URL as contextual input. A true visual website-analysis bonus should add a URL fetch/screenshot service (Playwright/browser worker) and then pass extracted text/images to the model.

## Assessment mapping
- Landing page: `/`
- Authentication: `/login`
- Protected dashboard: `/dashboard`
- AI analyzer/builder: `/api/ai`
- Database persistence: Supabase `projects`
- Natural-language modification: dashboard "Modify with AI"
- Deployment: Vercel
