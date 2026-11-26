/**
 * Read-only checks against your real Supabase project (makes no changes).
 *
 *   npm run verify:supabase
 *   OWNER_EMAIL=you@example.com OWNER_PASSWORD=... npm run verify:supabase   (also checks owner access)
 *
 * Reads VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY (or VITE_SUPABASE_ANON_KEY)
 * from the environment or .env.local.
 */
import { existsSync, readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

for (const file of ['.env.local', '.env']) {
  if (!existsSync(file)) continue;
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const url = (process.env.VITE_SUPABASE_URL ?? '').replace(/\/+$/, '');
const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? process.env.VITE_SUPABASE_ANON_KEY ?? '';
if (!url || !key) {
  console.error('Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY (in .env.local or the environment) first.');
  process.exit(1);
}
if (/service_role|sb_secret_/.test(key) || (key.startsWith('eyJ') && JSON.parse(Buffer.from(key.split('.')[1], 'base64url')).role === 'service_role')) {
  console.error('STOP: the key is a secret/service_role key. Use the publishable (or anon) key — never ship the secret key.');
  process.exit(1);
}

let failed = 0;
const check = (ok, label, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failed++;
};
const headers = { apikey: key, 'Content-Type': 'application/json', ...(key.startsWith('eyJ') ? { Authorization: `Bearer ${key}` } : {}) };
const anon = createClient(url, key, { auth: { persistSession: false } });

console.log(`Checking ${url}\n`);

// --- public site
const { data: site, error: siteError } = await anon.rpc('published_site');
check(!siteError && site?.content?.profile, 'the published site is readable', siteError?.message ?? `version ${site?.version}`);
if (site?.content) {
  check(Array.isArray(site.content.projects) && site.content.projects.length > 0, 'published content includes projects', `${site.content.projects?.length ?? 0} projects, ${site.content.credentials?.length ?? 0} certificates`);
  check(!JSON.stringify(site.content).includes('"visible":false'), 'no hidden entries in the public JSON');
}

// --- drafts and admin functions are private
const table = await fetch(`${url}/rest/v1/content_entries?select=id&limit=1`, { headers });
const tableBody = await table.text();
check(table.status === 401 || table.status === 403 || /permission denied/.test(tableBody), 'draft content table is not readable anonymously', `HTTP ${table.status}`);
const history = await fetch(`${url}/rest/v1/site_versions?select=id&limit=1`, { headers });
check(history.status === 401 || history.status === 403 || /permission denied/.test(await history.text()), 'publish history is not readable anonymously', `HTTP ${history.status}`);
for (const fn of ['admin_entries', 'draft_snapshot', 'publish_site']) {
  const { error } = await anon.rpc(fn);
  check(Boolean(error), `${fn}() is refused for anonymous visitors`, error?.message);
}
const { error: saveError } = await anon.rpc('save_entry', { p_collection: 'credentials', p_id: 'verify-probe', p_data: { title: 'x' } });
check(Boolean(saveError), 'anonymous writes are refused', saveError?.message);

// --- storage
const { data: signed } = await anon.storage.from('drafts').createSignedUrls(['uploads/does-not-matter.pdf'], 60);
check(!signed?.[0]?.signedUrl, 'cannot create signed URLs for draft files anonymously');
const { data: draftList } = await anon.storage.from('drafts').list('uploads');
check(!draftList || draftList.length === 0, 'draft files cannot be listed anonymously');
const { data: siteList } = await anon.storage.from('site').list('uploads');
check(!siteList || siteList.length === 0, 'public bucket cannot be listed anonymously (files are reachable only by exact URL)');

// --- sign-up disabled
const settings = await fetch(`${url}/auth/v1/settings`, { headers }).then((r) => r.json()).catch(() => null);
check(settings?.disable_signup === true, 'public sign-up is disabled', settings ? `disable_signup=${settings.disable_signup}` : 'could not read auth settings');

// --- owner (optional)
if (process.env.OWNER_EMAIL && process.env.OWNER_PASSWORD) {
  const owner = createClient(url, key, { auth: { persistSession: false } });
  const { error } = await owner.auth.signInWithPassword({ email: process.env.OWNER_EMAIL, password: process.env.OWNER_PASSWORD });
  check(!error, 'owner can sign in', error?.message);
  if (!error) {
    const { data: isOwner } = await owner.rpc('is_owner');
    check(isOwner === true, 'the account is registered as the site owner', isOwner ? '' : 'run the site_owner insert from SETUP.md');
    const { data: entries, error: entriesError } = await owner.rpc('admin_entries');
    check(!entriesError && entries?.length > 0, 'owner can read drafts', entriesError?.message ?? `${entries?.length} entries`);
    const { data: plan, error: planError } = await owner.rpc('publish_plan');
    check(!planError, 'owner can prepare a publish', planError?.message ?? `${plan?.files?.length ?? 0} files referenced`);
    await owner.auth.signOut();
  }
} else {
  console.log('\n(skip) owner checks — set OWNER_EMAIL and OWNER_PASSWORD to include them');
}

console.log(failed ? `\n${failed} check(s) failed.` : '\nAll checks passed.');
process.exit(failed ? 1 : 0);
