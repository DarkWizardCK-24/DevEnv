# DevEnv

Terminal-styled environment variable vault for developers. Organize `.env` variables by project, mask sensitive values, add inline notes per key, and export ready-to-use `.env` files instantly. Cloud-synced to Supabase when signed in with GitHub. Part of the **DevEco** ecosystem — twelve connected developer tools, one unified Supabase backend.

---

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Auth + DB | Supabase (GitHub OAuth + Postgres) |
| Icons | React Icons (Remix set) |
| Font | JetBrains Mono |

---

## Features

- **Project vault** — group environment variables into named projects (e.g. `backend`, `mobile`, `staging`)
- **Variable masking** — toggle visibility on sensitive values like API keys and secrets
- **Inline notes** — attach a description to any variable key for team context
- **Import `.env`** — paste an existing `.env` file and parse it instantly
- **Export `.env`** — download a project's variables as a ready-to-use `.env` file
- **Cloud sync** — sign in with GitHub to persist all projects to Supabase
- **Single-login SSO** — shared auth with the DevFolio ecosystem, no re-login required

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3008](http://localhost:3008).

### Environment variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_DEVFOLIO_URL=https://your-devfolio-url.vercel.app
```

### Supabase setup

1. Run the shared `schema.sql` from the DevFolio repo in the Supabase SQL Editor
2. Enable GitHub provider in **Authentication → Providers**
3. Add `http://localhost:3008/api/auth/callback` to **Authentication → URL Configuration → Redirect URLs**

---

## Routes

| Route | Description |
|---|---|
| `/` | Projects list — create, open, and delete env vaults |
| `/project/[id]` | Variable editor — add, mask, annotate, import, export |
| `/api/auth/callback` | OAuth callback — redeems SSO ticket or exchanges code |

---

## Project Structure

```
DevEnv/
├── app/
│   ├── layout.tsx               # root layout — fonts, navbar
│   ├── page.tsx                 # projects list
│   ├── globals.css              # design tokens
│   ├── project/
│   │   └── [id]/page.tsx        # variable editor
│   └── api/auth/
│       └── callback/route.ts    # SSO ticket redemption + OAuth callback
├── components/
│   ├── layout/                  # Navbar
│   ├── auth/                    # AuthButton
│   └── QuickImportModal.tsx     # .env file import dialog
├── lib/
│   ├── supabase.ts              # browser Supabase client
│   ├── supabase-server.ts       # server Supabase client (cookie-based)
│   └── db.ts                    # project + variable CRUD, export helpers
├── middleware.ts                 # session refresh on every request
└── proxy.ts                     # underlying session middleware handler
```

---

## Data Schema

```
env_projects
├── id           UUID
├── user_id      UUID → profiles
├── name         TEXT
├── description  TEXT
├── vars         JSONB  ([{ key, value, masked, note }])
├── created_at   TIMESTAMPTZ
└── updated_at   TIMESTAMPTZ
```

---

## DevEco Ecosystem

DevEnv is part of a twelve-app ecosystem sharing one Supabase project and one GitHub login.

| App | Description |
|---|---|
| **DevFolio** | Developer portfolio hub — central auth provider |
| **DevBlog** | Write & publish dev posts |
| **DevResume** | Generate PDF resume |
| **DevRoadmap** | Skill learning tracks |
| **DevCalendar** | Schedule & goals |
| **DevTimer** | Pomodoro focus timer |
| **DevNotes** | Markdown notes |
| **DevStatus** | Project status pages |
| **DevEnv** | Environment vault — this repo |
| **DevWidgets** | Embeddable widgets |
| **DevShare** | Share & showcase code snippets |
| **DevPulse** | Dev activity & pulse tracker |

---

## Design System

Terminal / Linux / GitHub-inspired aesthetic.

| Token | Hex | Use |
|---|---|---|
| `bg` | `#05070F` | scaffold background |
| `surface` | `#0B1020` | nav, cards |
| `neon-cyan` | `#00E5FF` | primary accents |
| `neon-green` | `#00FFA3` | success, exported values |
| `neon-blue` | `#4D8CFF` | secondary |
| `neon-purple` | `#8A5BFF` | masked value indicator |
| `neon-red` | `#FF3D71` | errors, destructive actions |
| `neon-amber` | `#FFB547` | warnings |

---

## Roadmap

- [x] Project-based variable organization
- [x] Value masking toggle
- [x] Inline notes per key
- [x] Import from `.env` file
- [x] Export to `.env` file
- [x] Supabase cloud sync with RLS
- [x] SSO with DevFolio ecosystem
- [ ] Variable diff view across environments (dev / staging / prod)
- [ ] Team sharing with scoped access
- [ ] Encrypted at-rest storage option

---

## License

MIT
