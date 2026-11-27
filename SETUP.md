# Setting up the owner admin (Supabase + Vercel)


After these steps you edit the portfolio at **`/admin`** and publish changes instantly — no source edits, no redeploys. You only redeploy once, after adding the two environment variables.

It takes about 20 minutes. You need a free [Supabase](https://supabase.com) account and the Vercel project that hosts the site.

---

## 1. Create the Supabase project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**.
2. Pick a name (e.g. `portfolio`), set a strong database password (store it in a password manager), choose the region closest to you (e.g. *Southeast Asia (Singapore)*), and create the project.

## 2. Create the database and storage

In the project, open **SQL Editor → New query**, then run these files from this repository **in order** (paste the whole file, click **Run**):

1. `supabase/migrations/20261126000001_cms_schema.sql` — tables, Row Level Security, storage buckets and publishing functions.
2. `supabase/migrations/20261126000002_import_content.sql` — imports the portfolio (same URLs, project order, certificate order and visibility) and publishes it as version 1. On a project that already has content it does nothing.
3. `supabase/migrations/20261127000003_sections_and_portfolio.sql` — Education, Volunteering & Experience and Events & Participation (on a new project it only updates the schema, because step 2 already imported everything).
4. `supabase/migrations/20261127000004_events_roles_photos.sql` — event and role pages with photos, featured projects (on a new project it changes nothing, because step 2 already imported everything).

Each should finish with “Success. No rows returned”. Running them again is safe.

> **Already set up?** Don’t start again — see [Updating a live site](#updating-a-live-site).

> Prefer the command line? `npx supabase login`, `npx supabase init` (keeps the existing `supabase/migrations`), `npx supabase link --project-ref <ref>`, then `npx supabase db push`.

Check: **Storage** now shows two buckets — `drafts` (private) and `site` (public).

## 3. Turn off public sign-up

**Authentication → Sign In / Providers**:

- **Allow new users to sign up** → **off**, then **Save**.
- Keep the **Email** provider enabled (it is used for password sign-in).

Even if sign-up were left on, other accounts still could not edit anything — every table, function and storage bucket only accepts the approved owner — but turning it off keeps strangers from creating accounts at all.

## 4. Create your owner account

1. **Authentication → Users → Add user → Create new user**.
2. Enter your email and a strong, unique password. Tick **Auto Confirm User**. Click **Create user**.
3. Approve that account as the site owner. In **SQL Editor**, run (with your email):

   ```sql
   insert into public.site_owner (user_id)
   select id from auth.users where email = 'you@example.com';
   ```

   It should report `INSERT 0 1`. Only this account can sign in to `/admin`.

To change the password later: **Authentication → Users → (your user) → Reset password / Send password recovery**, or delete and recreate the user and run the insert again.

## 5. Copy the two public settings

**Project Settings → API Keys**:

| Setting | Where |
| --- | --- |
| `VITE_SUPABASE_URL` | Project URL, e.g. `https://abcdefghijkl.supabase.co` (Project Settings → Data API) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | **Publishable key** (`sb_publishable_…`). Older projects: the **anon** key. |

**Never** use the **secret** key (`sb_secret_…`) or the **service_role** key in this project. Anything starting with `VITE_` is sent to every visitor’s browser. The publishable key is safe to share: Row Level Security limits it to reading the published site.

## 6. Try it locally (optional but recommended)

```bash
cp .env.example .env.local      # then fill in the two values
npm run dev                     # http://localhost:5173/admin
npm run verify:supabase         # read-only security checks against your project
```

To include the owner checks: `OWNER_EMAIL=you@example.com OWNER_PASSWORD='…' npm run verify:supabase`.
Expected result: **All checks passed.** `.env.local` is ignored by git — never commit it.

## 7. Connect Vercel

1. Vercel → your project → **Settings → Environment Variables**.
2. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` (Production and Preview).
3. **Deployments → … → Redeploy** (this one redeploy is needed because Vite reads the variables at build time).
4. In Supabase, **Authentication → URL Configuration → Site URL**: set your Vercel address (`https://wandana.vercel.app`).

## 8. Your first edit

1. Open `https://<your-site>/admin` → sign in with the owner email and password.
2. **Certificates** → open *CEMS — Project Confirmation Letter* → **Upload PDF or image** → choose the approved letter → wait for the progress bar → **Save changes**.
3. Click **Preview** (top bar). A new tab shows the whole site with your drafts and a yellow banner — only you can see this.
4. Click **Publish → Publish now**. The live site updates immediately.

---

## Updating a live site

Some code updates add a new file to `supabase/migrations/`. Run **only the new files you haven’t run yet, in number order**, once each, in **SQL Editor → New query → Run**. These update files only add what is missing, and they never overwrite your edits, uploads, visibility settings or certificate links. Don’t re-run the earlier files: there’s no need, and the import file skips itself on a site that already has content.

### Which updates have I run?

In the SQL Editor run `select * from public.content_patches;`

- *relation "public.content_patches" does not exist* → run update 3, then update 4.
- Only `2026-11-27-sections` → run update 4.
- Both `2026-11-27-sections` and `2026-11-27-events-roles-photos` → nothing to run.

### Update 4 (27 Nov 2026): `20261127000004_events_roles_photos.sql`

Needed for the Events & Participation and Volunteering & Experience photo cards, the new events and roles, and the featured portfolio project. Run update 3 first if you haven’t (update 4 stops with a message if update 3 is missing).

1. In Supabase, open **SQL Editor → New query**, paste the whole of `supabase/migrations/20261127000004_events_roles_photos.sql`, and click **Run**. The messages show *Content update 2026-11-27-events-roles-photos applied to your drafts*.
2. Push the code to GitHub and wait for the Vercel deployment to finish. You can do this before or after step 1.
3. Open `/admin` → **Preview** → check the homepage, an event page and a role page → **Publish**.

What it does — **only to your drafts**:

- **Featured Projects:** marks the three projects currently on your homepage as featured, plus the portfolio project. You choose which projects are featured with the *Featured on the homepage* checkbox from now on.
- **Portfolio project:** renames it *Personal Portfolio & Content Dashboard*, sets the new card summary and marks it featured. Its overview is replaced with the short owner-workflow text only if you haven’t edited it. Its photos, links and position are kept. If you deleted it, it is added back at the end.
- **Events & Participation:** adds *Yarl Dreamin’ 25*, *YarlInsight 2.0* and *AWS Meetup with Yarl Salesforce Ohana* at the top, without dates or links. Existing events get a page URL, a type, and empty cover, gallery and recap fields; your text, photos and certificates are kept. An event whose name you already use is skipped.
- **Volunteering & Experience:** every role gets a page URL and empty cover, gallery and write-up fields. The IEEE role gets the *2025/2026 term* and the wording *Served on the finance committee of the IEEE Student Branch at the University of Jaffna.* Its dates and Certificate of Appreciation link are kept. Adds *Event Volunteer (Finance), JamborIEEE 2025* unless a JamborIEEE role exists. Your other roles (e.g. CodeSprint X 2025 Event Ambassador) aren’t changed.
- **Tools & Technologies:** replaces the longer labels added by update 3 (*Authentication (Supabase Auth)*, *File Storage (Supabase Storage)*, *Vercel Deployment*) with *Supabase Auth*, *Supabase Storage* and *Vercel*. It renames *Databases* to *Database & Backend Services* and *Development Tools* to *Tooling & Deployment*, only if you haven’t renamed them. It adds any missing React, TypeScript, Tailwind CSS, Supabase, PostgreSQL, Vite, Git/GitHub and Vercel entries without duplicates.

Running it again changes nothing.

### Update 3 (27 Nov 2026): `20261127000003_sections_and_portfolio.sql`

Apply it **before or right after** pushing this code to GitHub, and publish only when both are done:

1. In Supabase, open **SQL Editor → New query**, paste the whole of `supabase/migrations/20261127000003_sections_and_portfolio.sql`, and click **Run**. It should finish with “Success”. The messages show *Content update 2026-11-27-sections applied to your drafts*.
2. Push the code to GitHub and wait for the Vercel deployment to finish.
3. Open `/admin`. The top bar shows *Unpublished changes*. Click **Preview**, check the homepage and About page, then **Publish**.

What it does — **only to your drafts**, so the public site doesn’t change until you publish:

- Allows the new **Events & Participation** list and adds the AWS career meetup and the Joomla CMS workshop to it, linked to their existing certificates. The AWS meetup’s organiser is left blank, because it isn’t confirmed.
- Gives your IEEE role a type (*Volunteering*) in **Volunteering & Experience**. Its dates and Certificate of Appreciation link are kept.
- Moves any internship or experience entries out of Education into Volunteering & Experience. Normally there are none.
- Appends **Personal Portfolio Website** after your existing projects. CEMS stays first and your order is kept.
- Adds the new skills to your existing skill groups, skipping any skill you already list and any group you’ve deleted.
- Removes the old “Software development” text from your About data. Your bio, interests, aspirations and academic background stay exactly as they are.

Running it a second time changes nothing (it records itself in `public.content_patches`). If you edit or delete any of the added entries afterwards, running it again won’t bring them back.

> Using the Supabase CLI instead? `npx supabase db push` also works. If the CLI wasn’t used for the earlier files, it will run them again too, which is harmless: the schema file can be repeated and the import skips itself.

---

## How it works (in short)

- **Drafts vs. published.** Every save is a private draft. **Publish** copies the files the drafts use into the public `site` bucket and stores a snapshot. Visitors only ever read the latest snapshot.
- **Hide vs. delete.** *Hide* keeps the entry (show it again any time); after you publish, it and its files are no longer public. *Delete* is permanent and first shows everywhere the entry is used.
- **Reordering.** The order in each list is the order on the site — use the ↑ ↓ buttons, then publish.
- **Photos on events and roles.** Each event and role has its own page. A cover photo appears on the card and the page, and gallery photos (with captions and alt text) appear on the page. Without a cover the card shows a generated graphic, and an empty gallery isn’t shown.
- **One certificate, many places.** Attach a certificate to projects, Education, Volunteering & Experience or Events & Participation from those editors. Tick an existing one, or use **New certificate with file** to upload a PDF or image and attach it in one step. It is one record, so editing or replacing it in **Certificates** updates every place. Turn off *List on the Achievements page* for certificates that should only appear where they are attached (e.g. school certificates under Education).
- **Certificate buttons.** Education shows a *View certificate* button only when the attached certificate has a file. Event and role pages link to the file, or to the certificate on the Achievements page when there is no file.
- **Replacing a file** uploads it to a new location first; your current file stays in place if the upload fails, and is removed only after you save.
- **Uploads**: PDF, JPG, PNG, WebP, GIF or AVIF, up to 10 MB each. Remove personal details (index/ID numbers, addresses) from certificates before uploading.

## Security summary

- Row Level Security on every table and on storage; only the account listed in `site_owner` can read drafts, write content, upload, publish or delete files.
- The public can call one function, `published_site()`, and download published files by exact URL. Drafts, history, hidden entries and draft files are never readable.
- The admin route also redirects signed-out visitors to the login page and signs out any non-owner account.
- No secret keys exist in the frontend or the repository.

## Troubleshooting

| Problem | Fix |
| --- | --- |
| `/admin` says “Admin isn’t connected yet” | The two `VITE_` variables are missing in this environment — add them and redeploy (step 7). |
| “This account is not approved to edit the site” | Run the `site_owner` insert from step 4 with the exact email you sign in with. |
| “Incorrect email or password” | Reset the password in Authentication → Users. |
| The public site says it couldn’t load content | Free Supabase projects pause after a week without activity — open the dashboard and **Restore** the project. |
| Publishing reports files that couldn’t be copied | Retry **Publish**; nothing changes on the public site until it succeeds. |
| Changes don’t appear on the site | Did you **Publish**? Saving alone only updates drafts (check the status in the top bar). |
| “This section needs the latest database update” | Run the newest file in `supabase/migrations` — see [Updating a live site](#updating-a-live-site). |

## Tests in this repository

```bash
npm run test:db          # runs the real migrations in an in-memory Postgres: RLS, publishing, deletion, and
                         # upgrading a live-like site with update 3 (edits kept, safe to re-run)
npm run verify:supabase  # read-only checks against your real project (step 6)
```
