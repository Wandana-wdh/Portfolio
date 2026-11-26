# Wandana Herath — Portfolio

Personal portfolio built with React, TypeScript, Vite, Tailwind CSS, React Router, Motion and Lucide, with an owner-only admin backed by Supabase (Postgres, Auth, Storage).

```bash
npm install
npm run dev               # http://localhost:5173  (admin: /admin)
npm run lint              # code style and React rules
npm run build             # type-check + production build → dist/
npm run test:db           # database tests: RLS, publishing, deletion (in-memory Postgres)
npm run verify:supabase   # read-only security checks against your Supabase project
```

**First time?** Follow [SETUP.md](SETUP.md) to create the Supabase project, your owner account and the Vercel settings.

---

## Editing content (after setup)

Sign in at **`/admin`**. Everything is edited in the browser:

| Section | What you can change |
| --- | --- |
| Profile | Photo, hero text, About text, public links, CV (PDF) |
| Projects | Title, summary, contribution, technologies, cover, GitHub links, photos with captions and alt text, attached certificates, order |
| Certificates | Title, issuer, date, type, credential ID, verification link, image and/or PDF, courses, whether it is listed on Achievements, order |
| My Journey / Volunteering | Education, school milestones, IEEE volunteering, attached certificates |
| Articles | Title, summary, cover, Medium link, date, reading time |
| Research | Description, status, questions, areas |
| Skills | Skill groups |

How changes go live:

1. **Save** — stores a private draft (nobody else can see it).
2. **Preview** — opens the site with your drafts; only you see it, with a yellow banner.
3. **Publish** — makes the drafts live immediately. No code changes or redeploys.

Lists work the same everywhere: **↑ ↓** reorder (the order is the order on the site), **Hide** removes an entry from the public site after publishing but keeps it in the admin, **Delete** is permanent and first shows where the entry is used.

## How the site gets its content

| Situation | Source |
| --- | --- |
| Supabase configured (`VITE_SUPABASE_URL` + `VITE_SUPABASE_PUBLISHABLE_KEY`) | The latest **published** version in Supabase |
| Owner signed in and previewing (`?preview=1`) | The owner’s **drafts** |
| Not configured (e.g. a fresh local checkout) | The bundled files in `src/data/` |

`src/data/` is the **initial import** (turned into `supabase/migrations/…_import_content.sql` by `npm run db:generate-import`) and the offline fallback. After setup, edit content in `/admin`, not in these files.

## Architecture

```
src/
  admin/          owner admin (lazy-loaded, includes supabase-js): pages, forms, upload fields, API
  components/     public UI — ui/ · layout/ · cards/ · sections/ · contact/ · decor/
  pages/          public routes + loaders.ts
  services/       content source (static / published / preview) and the read-only repository
  data/           initial content (import source + fallback)
  types/          content types — the same shapes are stored in the database
  lib/            helpers, labels, Supabase public config
supabase/
  migrations/     schema + RLS + storage + publish functions, and the content import
  tests/          database tests (PGlite with a Supabase-like shim)
scripts/          import generator, Supabase verification
```

Security model: Row Level Security on every table and storage bucket; only the account in `site_owner` can read drafts or write anything; the public reads one function (`published_site()`) and published files. See [SETUP.md](SETUP.md#security-summary).

## Code changes and deployment

Content changes need no deployment. For code or design changes: commit, push, and Vercel rebuilds automatically (`vercel.json` handles client-side routes and basic security headers).

## Keep private data out of the repository

Never commit `.env.local`, Supabase secret keys, or the LinkedIn export (ZIP/CSV files). `.gitignore` blocks these as a safety net.
