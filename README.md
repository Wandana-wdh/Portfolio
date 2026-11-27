# Wandana Herath — Portfolio

Live site: **https://wandana.vercel.app**

My personal portfolio: projects, education, volunteering and experience, events, certificates, research and writing. It has light and dark themes and responsive layouts. A private content dashboard at **`/admin`** lets me update everything in the browser and publish without touching code.

## Technology

| Area | Used for |
| --- | --- |
| **React 19 + TypeScript** | The site and the admin dashboard |
| **Vite** | Development server and production build |
| **Tailwind CSS 4** | Styling, themes and responsive layouts |
| **React Router** | Pages, data loading and the admin routes |
| **Motion** and **Lucide** | Animation and icons |
| **Supabase** | Content database (**PostgreSQL** with Row Level Security), owner sign-in (**Supabase Auth**) and uploads (**Supabase Storage**) |
| **GitHub + Vercel** | Source code, automatic builds and hosting |

```bash
npm install
npm run dev               # http://localhost:5173  (admin: /admin)
npm run lint              # code style and React rules
npm run test:db           # database tests: security, publishing, deletion, live-site updates
npm run build             # type-check + production build → dist/
npm run verify:supabase   # read-only security checks against the Supabase project
```

**Setting up Supabase, the owner account and Vercel** — see [SETUP.md](SETUP.md).
**Applying a database update to the live site** — see [SETUP.md → Updating a live site](SETUP.md#updating-a-live-site).

---

## Two ways things change

| Change | How it goes live |
| --- | --- |
| **Content** — text, projects, events, roles, certificates, photos, skills, order, visibility | Edit in **`/admin`** → **Save** → **Preview** → **Publish**. Live immediately; no code change or redeploy. |
| **Code or design** | Commit and push to GitHub. Vercel builds and deploys the `main` branch automatically. |
| **Database structure** (rare) | A code update adds a file to `supabase/migrations/`. Run it once in the Supabase SQL Editor, as described in [SETUP.md](SETUP.md#updating-a-live-site). |

## Save, Preview and Publish

1. **Save** stores a private **draft**. Nobody else can see drafts or newly uploaded files.
2. **Preview** (top bar) opens the whole site with your drafts, with a yellow banner. Only you see it, while signed in.
3. **Publish** (top bar) makes all saved drafts public at once. The top bar shows *Unpublished changes* until you do.

Hiding, reordering and deleting also take effect when you publish. Hiding an entry, or removing a photo or certificate, also removes its file from the public site.

## Editing content in /admin

Sign in at `https://wandana.vercel.app/admin`. Every list works the same way: **↑ ↓** reorder (the list order is the order on the site), **Hide** takes an entry off the site but keeps it in the admin, and **Delete** removes it permanently after showing where it is used. **Add** creates a new entry.

| What | Where in /admin |
| --- | --- |
| Hero, About text, portrait, links, CV | **Profile** |
| **Featured Projects** (homepage) | **Projects** → open a project → tick **Featured on the homepage**. Featured projects appear on the homepage in the order of the Projects list (keep CEMS at the top). All projects always appear on the Projects page. |
| Project details, cover, screenshots, links, presentation (.pptx) | **Projects** → open the project |
| **Status** badges (Completed / In Progress / Early-stage) | **Projects**, **Education** or **Research** → open the entry → **Status**. Choose *Not set* to hide the badge. |
| Research cover photo | **Research** → open the entry → **Cover photo (optional)** |
| **Tools and Technologies** | **Tools & Technologies** → open a group (e.g. *Frontend Development*) and add, remove or reorder skills. Groups can be added, hidden and reordered too. |
| Education | **Education** |
| Volunteering & Experience | **Volunteering & Experience** |
| Events & Participation | **Events & Participation** |
| Certificates, badges and letters | **Certificates** (or **New certificate with file** inside any editor) |
| Articles and research | **Articles**, **Research** |

### Add an event

1. **Events & Participation** → **Add event**.
2. Choose the **Type** (conference, bootcamp, meetup, workshop, …) and enter the **Event name**. The **Page URL** (`/events/…`) fills in by itself.
3. Optional: organiser, location, date, a **brief description** (shown on the card), a **longer recap** (shown on the event’s page), an event link and a participation certificate.
4. Optional: a **cover photo** and **gallery** photos (see below).
5. **Save** → **Preview** → **Publish**. Use ↑ ↓ in the list to place it.

### Add a volunteering or experience role

1. **Volunteering & Experience** → **Add role**.
2. Choose the **Type** (volunteering, ambassador, student role, internship, work), and enter the **Role** and **Organisation or event**.
3. Add a **Term** such as *2025/2026 term*, or start and end dates. If both are filled in, the term is shown.
4. Add a **Contribution summary** (card), and optionally a longer write-up, a link, certificates and photos.
5. **Save** → **Preview** → **Publish**.

### Set a status

Each project, Education entry and research entry can show a small status badge. A check-circle means **Completed**. A clock means **In Progress** (or **Early-stage**, for research). The text is always shown next to the icon.

1. Open the entry in **Projects**, **Education** or **Research**.
2. Choose a **Status**, or **Not set (no badge)** to hide it.
3. **Save** → **Preview** → **Publish**.

The badge appears on project cards (homepage and Projects page), project pages, Education entries and Undergraduate Research.

### Add a research cover photo

1. **Research** → open the entry → **Cover photo (optional)** → **Upload image**.
2. Fill in **Alt text** (required: what the photo shows). **Upload image** again to replace the photo, and **Remove** to take it off.
3. **Save** → **Preview** → **Publish**.

The cover appears beside the entry on the Research page and at the top of its page. Without a cover, the text uses the full width.

### Upload a project presentation (.pptx)

1. **Projects** → open the project (e.g. CEMS) → **Presentation (optional)** → **Upload .pptx**.
2. Only PowerPoint **.pptx** files up to 10 MB are accepted; anything else shows a clear error. Your current file stays in place if a replacement upload fails.
3. **Link text** is the button label. It starts as *Download Project Presentation*; change it if you like.
4. **Save** → **Preview** (the button works for you with the draft file) → **Publish**. The **Download** button then appears on the project page for every visitor. Cards stay compact; the button is only on the project page.
5. To replace the file, use **Replace file**. To remove it, use **Remove**, then save and publish. After publishing, the old file is no longer available to download.

### Upload, replace and reorder photos

Projects, events, roles and research use the same photo fields:

- **Cover photo** — **Upload image**. It appears on the card and at the top of the page. Upload a new one to replace it; if an upload fails, your current photo stays.
- **Gallery** — **Add photos** (you can select several at once). Give each one **Alt text** (required: what the photo shows) and an optional **Caption**. Use **↑ ↓** on a photo to reorder it and **Remove** to delete it.
- Uploads show a progress bar. JPG, PNG, WebP, GIF or AVIF up to 10 MB (certificates may also be PDFs, and project presentations are .pptx).
- Without a cover photo the card shows a generated graphic, so all cards stay the same size, and a page without gallery photos simply has no Photos section.
- Photos stay private until you publish.

## How the site gets its content

| Situation | Source |
| --- | --- |
| Supabase configured (`VITE_SUPABASE_URL` + `VITE_SUPABASE_PUBLISHABLE_KEY` in Vercel) | The latest **published** version in Supabase |
| Owner signed in and previewing (`?preview=1`) | The owner’s **drafts** |
| Not configured (e.g. a fresh local checkout) | The bundled files in `src/data/` |

`src/data/` is the **initial import** for a new Supabase project (`npm run db:generate-import` turns it into `supabase/migrations/…_import_content.sql`) and the offline fallback. Once the site is live, edit content in `/admin`, not in these files.

## Project structure

```
src/
  admin/          owner dashboard (loaded only on /admin): pages, editors, upload fields, Supabase API
  components/     public UI — ui/ · layout/ · cards/ · sections/ · contact/ · decor/
  pages/          public pages (incl. /events/:slug and /experience/:slug) and their data loaders
  services/       content source (static / published / preview) and read-only repository
  data/           initial content (import source + fallback)
  types/          content types — the same shapes are stored in the database
  lib/            helpers, labels, Supabase public settings
supabase/
  migrations/     schema, Row Level Security, storage, publishing, and content updates (run in order)
  tests/          database tests (PGlite with a Supabase-like shim)
scripts/          import generator, Supabase verification
public/images/    images used by the bundled content (e.g. the portfolio project screenshots)
```

Security: Row Level Security on every table and storage bucket. Only the account in `site_owner` can read drafts or change anything. The public reads only the published version and published files. No secret keys are in the frontend or the repository. See [SETUP.md → Security summary](SETUP.md#security-summary).

## Keep private data out of the repository

Never commit `.env.local`, Supabase secret keys, or the LinkedIn export (ZIP/CSV files). `.gitignore` blocks these as a safety net.
