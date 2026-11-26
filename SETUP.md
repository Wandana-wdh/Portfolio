# Setting up the owner admin (Supabase + Vercel)


After these steps you edit the portfolio at **`/admin`** and publish changes instantly — no source edits, no redeploys. You only redeploy once, after adding the two environment variables.

It takes about 20 minutes. You need a free [Supabase](https://supabase.com) account and the Vercel project that hosts the site.

---

## 1. Create the Supabase project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**.
2. Pick a name (e.g. `portfolio`), set a strong database password (store it in a password manager), choose the region closest to you (e.g. *Southeast Asia (Singapore)*), and create the project.

## 2. Create the database and storage

In the project, open **SQL Editor → New query**, then run these two files from this repository **in order** (paste the whole file, click **Run**):

1. `supabase/migrations/20261126000001_cms_schema.sql` — tables, Row Level Security, storage buckets and publishing functions.
2. `supabase/migrations/20261126000002_import_content.sql` — imports your current portfolio (same URLs, project order, certificate order and visibility) and publishes it as version 1.

Each should finish with “Success. No rows returned”. Running them again is safe.

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
4. In Supabase, **Authentication → URL Configuration → Site URL**: set your Vercel address (e.g. `https://wandana-herath.vercel.app`).

## 8. Your first edit

1. Open `https://<your-site>/admin` → sign in with the owner email and password.
2. **Certificates** → open *CEMS — Project Confirmation Letter* → **Upload PDF or image** → choose the approved letter → wait for the progress bar → **Save changes**.
3. Click **Preview** (top bar). A new tab shows the whole site with your drafts and a yellow banner — only you can see this.
4. Click **Publish → Publish now**. The live site updates immediately.

---

## How it works (in short)

- **Drafts vs. published.** Every save is a private draft. **Publish** copies the files the drafts use into the public `site` bucket and stores a snapshot. Visitors only ever read the latest snapshot.
- **Hide vs. delete.** *Hide* keeps the entry (show it again any time); after you publish, it and its files are no longer public. *Delete* is permanent and first shows everywhere the entry is used.
- **Reordering.** The order in each list is the order on the site — use the ↑ ↓ buttons, then publish.
- **One certificate, many places.** Attach a certificate to projects, My Journey or Volunteering from those editors. It is one record, so editing or replacing it updates every place. Turn off *List on the Achievements page* for certificates that should only appear where they are attached (e.g. school certificates).
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

## Tests in this repository

```bash
npm run test:db          # runs the real migrations in an in-memory Postgres and tests RLS, publishing and deletion
npm run verify:supabase  # read-only checks against your real project (step 6)
```
