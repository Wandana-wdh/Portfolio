/**
 * Database tests: runs the real migrations in PGlite (Postgres in WASM) on top of
 * a Supabase-like shim, then checks Row Level Security, publishing and the
 * owner functions as an anonymous visitor, a signed-in stranger and the owner.
 *
 *   npm run test:db
 */
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';

const OWNER = '11111111-1111-4111-8111-111111111111';
const STRANGER = '22222222-2222-4222-8222-222222222222';
const dir = new URL('../migrations/', import.meta.url);
let db;

/** Runs fn inside a transaction as the given API role (like a request through PostgREST). */
async function as(role, fn, sub = null) {
  return db.transaction(async (tx) => {
    await tx.exec(`set local role ${role}`);
    await tx.query(`select set_config('request.jwt.claims', $1, true)`, [JSON.stringify(sub ? { sub, role } : { role })]);
    return fn(tx);
  });
}
const anon = (fn) => as('anon', fn);
const owner = (fn) => as('authenticated', fn, OWNER);
const stranger = (fn) => as('authenticated', fn, STRANGER);
const rows = async (tx, sql, params) => (await tx.query(sql, params)).rows;
const one = async (tx, sql, params) => (await rows(tx, sql, params))[0];

/** Runs a statement expected to fail without aborting the surrounding transaction. */
async function failing(tx, sql, params) {
  await tx.exec("savepoint expected_failure");
  try {
    return await tx.query(sql, params);
  } finally {
    await tx.exec("rollback to savepoint expected_failure");
  }
}

async function rejects(promise, pattern, label) {
  await assert.rejects(promise, (e) => {
    assert.match(`${e.code ?? ''} ${e.message}`, pattern, label);
    return true;
  });
}

before(async () => {
  db = new PGlite();
  await db.exec(readFileSync(new URL('./supabase-shim.sql', import.meta.url), 'utf8'));
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.sql')).sort()) {
    await db.exec(readFileSync(new URL(file, dir), 'utf8'));
  }
  await db.exec(`
    insert into auth.users (id, email) values ('${OWNER}', 'owner@example.com'), ('${STRANGER}', 'someone@example.com');
    insert into public.site_owner (user_id) values ('${OWNER}');
  `);
});

// ------------------------------------------------------------------ import

test('import: drafts and the first published version preserve order, URLs and visibility', async () => {
  const site = await anon((tx) => one(tx, 'select public.published_site() as s')).then((r) => r.s);
  const c = site.content;
  assert.equal(site.version, 1);
  assert.equal(c.profile.headline, 'Computer Science Undergraduate');
  assert.deepEqual(c.projects.map((p) => p.slug), [
    'civil-engineering-management-system',
    'hospital-e-channeling-system',
    'edge-azure-iot-department-automation',
    'personal-portfolio-website',
  ]);
  assert.equal(c.projects[3].liveUrl, 'https://wandana.vercel.app');
  assert.deepEqual(c.projects[3].repositories, []);
  assert.equal(c.credentials.length, 9, 'hidden V1 is not published');
  assert.equal(c.credentials[0].id, 'cems-confirmation-letter');
  assert.equal(c.credentials[8].id, 'joomla-workshop');
  assert.ok(!c.credentials.some((x) => x.id === 'google-ai-essentials-v1'));
  assert.ok(c.credentials.every((x) => x.visible === true));
  assert.deepEqual(c.volunteering[0].credentialIds, ['ieee-appreciation']);
  assert.equal(c.volunteering[0].type, 'volunteering');
  assert.deepEqual(c.timeline.map((t) => t.id), ['uoj-computer-science', 'gce-advanced-level', 'gce-ordinary-level', 'grade-5-scholarship']);
  assert.deepEqual(c.events.map((e) => [e.id, e.type, e.credentialIds]), [
    ['yarl-dreamin-25', 'conference', []],
    ['yarlinsight-2', 'bootcamp', []],
    ['aws-meetup-yarl-salesforce-ohana', 'meetup', []],
    ['aws-career-meetup', 'meetup', ['aws-meetup-level-up-cloud']],
    ['joomla-cms-workshop', 'workshop', ['joomla-workshop']],
  ]);
  assert.ok(c.events.every((e) => e.slug === e.id && Array.isArray(e.gallery) && e.cover === null), 'events have pages and empty galleries');
  assert.deepEqual(c.volunteering.map((v) => [v.id, v.term]), [['ieee-sb-finance-committee', '2025/2026 term'], ['jamborieee-2025-finance-volunteer', null]]);
  assert.deepEqual(c.projects.filter((p) => p.featured).map((p) => p.id), ['cems', 'hospital-e-channeling', 'edge-azure-iot', 'personal-portfolio']);
  assert.equal(c.projects[3].title, 'Personal Portfolio & Content Dashboard');
  assert.deepEqual(c.projects.map((p) => p.status ?? null), ['completed', null, null, null], 'only CEMS has a project status');
  assert.deepEqual(c.timeline.map((t) => t.status), ['in-progress', 'completed', 'completed', 'completed']);
  assert.equal(c.research[0].status, 'early-stage');
  const mimes = (await anon((tx) => rows(tx, 'select allowed_mime_types as m from storage.buckets'))).map((r) => r.m);
  assert.ok(mimes.length === 2 && mimes.every((m) => m.includes('application/vnd.openxmlformats-officedocument.presentationml.presentation')), 'both buckets accept .pptx');
  assert.equal(c.profile.about.developmentExperience, undefined);
  const allSkills = c.skills.flatMap((g) => g.skills.map((x) => x.toLowerCase()));
  assert.equal(new Set(allSkills).size, allSkills.length, 'no duplicate skills');
  assert.equal(c.articles[0].url, 'https://medium.com/@wandanaherath.wdh/trust-without-trusting-f8ef1e744176');
  const drafts = await owner((tx) => rows(tx, `select id, visible from public.admin_entries() where collection = 'credentials'`));
  assert.equal(drafts.length, 10, 'owner sees the hidden draft too');
  assert.equal(drafts.find((d) => d.id === 'google-ai-essentials-v1').visible, false);
});

// ------------------------------------------------------------------ anonymous

test('anonymous visitors can only read the latest published site', async () => {
  await rejects(anon((tx) => rows(tx, 'select * from public.content_entries')), /permission denied/, 'drafts table');
  await rejects(anon((tx) => rows(tx, 'select * from public.site_versions')), /permission denied/, 'version history');
  await rejects(anon((tx) => rows(tx, 'select * from public.site_owner')), /permission denied/, 'owner table');
  for (const fn of ['admin_entries()', 'draft_snapshot()', 'publish_plan()', 'publish_site()', 'build_snapshot()', 'is_owner()']) {
    await rejects(anon((tx) => rows(tx, `select public.${fn}`)), /permission denied/, fn);
  }
  await rejects(
    anon((tx) => rows(tx, `select public.save_entry('credentials', 'x', '{"title":"x"}'::jsonb)`)),
    /permission denied/,
    'save_entry',
  );
  assert.equal((await anon((tx) => rows(tx, 'select * from storage.objects'))).length, 0, 'cannot list files');
  await rejects(
    anon((tx) => rows(tx, `insert into storage.objects (bucket_id, name) values ('drafts', 'uploads/x.pdf')`)),
    /row-level security/,
    'cannot upload drafts',
  );
  await rejects(
    anon((tx) => rows(tx, `insert into storage.objects (bucket_id, name) values ('site', 'uploads/x.pdf')`)),
    /row-level security/,
    'cannot upload public files',
  );
});

// ------------------------------------------------------------------ stranger

test('a signed-in account that is not the owner cannot read or change anything', async () => {
  assert.equal((await stranger((tx) => one(tx, 'select public.is_owner() as v'))).v, false);
  assert.equal((await stranger((tx) => rows(tx, 'select * from public.content_entries'))).length, 0);
  assert.equal((await stranger((tx) => rows(tx, 'select * from public.admin_entries()'))).length, 0);
  assert.equal((await stranger((tx) => rows(tx, 'select * from public.site_versions'))).length, 0);
  await rejects(stranger((tx) => rows(tx, `select public.save_entry('credentials', 'x', '{"title":"x"}'::jsonb)`)), /42501|owner/);
  await rejects(stranger((tx) => rows(tx, `select public.publish_site()`)), /42501|owner/);
  await rejects(stranger((tx) => rows(tx, `select public.draft_snapshot()`)), /42501|owner/);
  await rejects(stranger((tx) => rows(tx, `select public.delete_entry('credentials', 'joomla-workshop')`)), /42501|owner/);
  await rejects(
    stranger((tx) => rows(tx, `insert into public.content_entries (collection, id, data) values ('credentials', 'x', '{"title":"x"}')`)),
    /row-level security/,
  );
  const updated = await stranger((tx) => rows(tx, `update public.content_entries set visible = false returning id`));
  assert.equal(updated.length, 0, 'updates silently match nothing');
  await rejects(
    stranger((tx) => rows(tx, `insert into storage.objects (bucket_id, name) values ('drafts', 'uploads/x.pdf')`)),
    /row-level security/,
  );
  await rejects(stranger((tx) => rows(tx, `insert into public.site_owner values ('${STRANGER}')`)), /permission denied/, 'cannot promote itself');
});

// ------------------------------------------------------------------ owner editing

test('owner: save, add, reorder, hide and validation', async () => {
  await owner(async (tx) => {
    const saved = await one(tx, `select * from public.save_entry('credentials', 'test-cert', $1::jsonb)`, [
      JSON.stringify({ title: 'Test Certificate', issuer: 'Tester', type: 'certificate', id: 'ignored', visible: false }),
    ]);
    assert.equal(saved.sort_order, 10, 'new entries are appended');
    assert.equal(saved.visible, true);
    assert.equal(saved.data.id, undefined, 'id/visible are columns, not data');

    const ids = (await rows(tx, `select id from public.admin_entries() where collection = 'credentials'`)).map((r) => r.id);
    const reordered = ['test-cert', ...ids.filter((i) => i !== 'test-cert')];
    await tx.query(`select public.reorder_entries('credentials', $1)`, [reordered]);
    const after = (await rows(tx, `select id from public.admin_entries() where collection = 'credentials'`)).map((r) => r.id);
    assert.deepEqual(after, reordered);
    await rejects(failing(tx, `select public.reorder_entries('credentials', $1)`, [reordered.slice(1)]), /out of date/);

    await tx.query(`select public.set_entry_visibility('credentials', 'test-cert', false)`);
    assert.equal((await one(tx, `select visible from public.content_entries where id = 'test-cert'`)).visible, false);
    await rejects(failing(tx, `select public.set_entry_visibility('profile', 'profile', false)`), /cannot be hidden/);
    throw new Error('rollback');
  }).catch((e) => assert.equal(e.message, 'rollback'));

  await rejects(
    owner((tx) => tx.query(`select public.save_entry('projects', 'dup', '{"title":"Dup","slug":"hospital-e-channeling-system"}'::jsonb)`)),
    /duplicate key|23505/,
    'slugs (page URLs) are unique',
  );
  await rejects(owner((tx) => tx.query(`select public.save_entry('projects', 'bad', '{"title":"Bad","slug":"Bad Slug"}'::jsonb)`)), /slug_format/);
  await rejects(owner((tx) => tx.query(`select public.save_entry('credentials', 'untitled', '{"title":"  "}'::jsonb)`)), /has_title/);
  await rejects(owner((tx) => tx.query(`select public.save_entry('credentials', 'Bad ID', '{"title":"x"}'::jsonb)`)), /check constraint/);
  await rejects(owner((tx) => tx.query(`select public.delete_entry('profile', 'profile')`)), /cannot be deleted/);
});

test('owner: one certificate in several places, usages, and delete removes references', async () => {
  await owner(async (tx) => {
    await tx.query(`select public.save_entry('timeline', 'uoj-computer-science', data || '{"credentialIds":["cems-confirmation-letter"]}'::jsonb)
                    from public.content_entries where collection = 'timeline' and id = 'uoj-computer-science'`);
    await tx.query(`select public.save_entry('events', 'aws-career-meetup', data || '{"credentialIds":["aws-meetup-level-up-cloud","cems-confirmation-letter"]}'::jsonb)
                    from public.content_entries where collection = 'events' and id = 'aws-career-meetup'`);
    const usages = await rows(tx, `select collection, id, title from public.credential_usages('cems-confirmation-letter')`);
    assert.deepEqual(usages.map((u) => `${u.collection}/${u.id}`).sort(), ['events/aws-career-meetup', 'projects/cems', 'timeline/uoj-computer-science']);
    assert.equal(usages.find((u) => u.collection === 'events').title, 'Level Up on the Cloud: Building Your AWS Career');

    const removed = await one(tx, `select public.delete_entry('credentials', 'cems-confirmation-letter') as d`);
    assert.equal(removed.d.title, 'CEMS — Project Confirmation Letter', 'returns the deleted data (for file clean-up)');
    const left = await rows(tx, `select id from public.content_entries where data -> 'credentialIds' ? 'cems-confirmation-letter'`);
    assert.equal(left.length, 0, 'references removed from project, education and event');
    assert.deepEqual(
      (await one(tx, `select data -> 'credentialIds' as ids from public.content_entries where collection = 'events' and id = 'aws-career-meetup'`)).ids,
      ['aws-meetup-level-up-cloud'],
      'other links on the event are kept',
    );
    const snap = await one(tx, `select public.draft_snapshot() as s`);
    assert.deepEqual(snap.s.projects.find((p) => p.id === 'cems').credentialIds, []);
    throw new Error('rollback');
  }).catch((e) => assert.equal(e.message, 'rollback'));
});

test('owner: events and experience can be added, reordered, hidden and deleted', async () => {
  await owner(async (tx) => {
    const saved = await one(tx, `select * from public.save_entry('events', 'cloud-day', $1::jsonb)`, [
      JSON.stringify({ slug: 'cloud-day', title: 'Cloud Day', type: 'meetup', organiser: null, location: null, date: '2026-05', description: null, recap: [], url: 'https://example.org', cover: null, gallery: [], credentialIds: [] }),
    ]);
    assert.equal(saved.sort_order, 5, 'appended after the five imported events');
    const ids = (await rows(tx, `select id from public.admin_entries() where collection = 'events'`)).map((r) => r.id);
    await tx.query(`select public.reorder_entries('events', $1)`, [['cloud-day', ...ids.filter((i) => i !== 'cloud-day')]]);
    await tx.query(`select public.set_entry_visibility('events', 'joomla-cms-workshop', false)`);
    let snap = (await one(tx, 'select public.draft_snapshot() as s')).s;
    assert.equal(snap.events[0].id, 'cloud-day', 'order kept');
    assert.ok(!snap.events.some((e) => e.id === 'joomla-cms-workshop'), 'hidden left out');
    await rejects(
      failing(tx, `select public.save_entry('events', 'copy', '{"title":"Copy","slug":"yarlinsight-2"}'::jsonb)`),
      /duplicate key|23505/,
      'event page URLs are unique',
    );
    await tx.query(`select public.delete_entry('events', 'cloud-day')`);
    await rejects(failing(tx, `select public.save_entry('events', 'untitled', '{"title":""}'::jsonb)`), /has_title/, 'events need a name');

    await tx.query(`select public.save_entry('volunteering', 'campus-ambassador', $1::jsonb)`, [
      JSON.stringify({ type: 'ambassador', role: 'Campus Ambassador', organisation: 'Example', start: null, end: null, description: null, highlights: [], url: null, credentialIds: [] }),
    ]);
    await rejects(failing(tx, `select public.save_entry('volunteering', 'no-role', '{"role":" "}'::jsonb)`), /volunteering_has_role/);
    snap = (await one(tx, 'select public.draft_snapshot() as s')).s;
    assert.deepEqual(snap.volunteering.map((v) => v.id), ['ieee-sb-finance-committee', 'jamborieee-2025-finance-volunteer', 'campus-ambassador']);
    throw new Error('rollback');
  }).catch((e) => assert.equal(e.message, 'rollback'));
  await rejects(stranger((tx) => rows(tx, `select public.save_entry('events', 'x', '{"title":"x"}'::jsonb)`)), /42501|owner/);
});

// ------------------------------------------------------------------ publishing

test('publishing: drafts stay private, files must be public first, hidden files are cleaned up', async () => {
  const pdf = 'uploads/credentials/postman-student-expert/aaaa-postman.pdf';

  // Owner edits a draft and attaches a PDF (uploaded to the private drafts bucket).
  await owner(async (tx) => {
    await tx.query(`insert into storage.objects (bucket_id, name) values ('drafts', $1)`, [pdf]);
    await tx.query(
      `select public.save_entry('credentials', 'postman-student-expert',
         data || jsonb_build_object('title', 'Postman Student Expert (edited)', 'document', jsonb_build_object('label', 'Certificate (PDF)', 'href', $1::text)))
       from public.content_entries where collection = 'credentials' and id = 'postman-student-expert'`,
      [pdf],
    );
  });

  // Draft privacy: the public still sees the last published version.
  let site = (await anon((tx) => one(tx, 'select public.published_site() as s'))).s;
  assert.equal(site.content.credentials[1].title, 'Postman API Fundamentals Student Expert');
  assert.equal((await anon((tx) => rows(tx, `select * from storage.objects where bucket_id = 'drafts'`))).length, 0);

  // Publishing refuses while a referenced file is not in the public bucket.
  const plan = (await owner((tx) => one(tx, 'select public.publish_plan() as p'))).p;
  assert.deepEqual(plan.missing, [pdf]);
  await rejects(owner((tx) => tx.query('select public.publish_site()')), /not been copied/);

  // After copying to the public bucket, publishing succeeds.
  await owner((tx) => tx.query(`insert into storage.objects (bucket_id, name) values ('site', $1)`, [pdf]));
  const published = (await owner((tx) => one(tx, 'select public.publish_site() as r'))).r;
  assert.equal(published.version, 2);
  assert.deepEqual(published.files, [pdf]);
  site = (await anon((tx) => one(tx, 'select public.published_site() as s'))).s;
  assert.equal(site.version, 2);
  assert.equal(site.content.credentials[1].title, 'Postman Student Expert (edited)');
  assert.equal(site.content.credentials[1].document.href, pdf);
  assert.deepEqual((await owner((tx) => one(tx, 'select public.stale_public_files() as f'))).f, []);

  // Hiding the certificate and publishing makes its public file stale (the admin deletes it).
  await owner((tx) => tx.query(`select public.set_entry_visibility('credentials', 'postman-student-expert', false)`));
  site = (await anon((tx) => one(tx, 'select public.published_site() as s'))).s;
  assert.ok(site.content.credentials.some((c) => c.id === 'postman-student-expert'), 'hide is a draft until published');
  await owner((tx) => tx.query('select public.publish_site()'));
  site = (await anon((tx) => one(tx, 'select public.published_site() as s'))).s;
  assert.ok(!site.content.credentials.some((c) => c.id === 'postman-student-expert'), 'hidden entry is not public');
  assert.ok(!JSON.stringify(site.content).includes(pdf), 'nothing in the public JSON points at the file');
  assert.deepEqual((await owner((tx) => one(tx, 'select public.stale_public_files() as f'))).f, [pdf]);
  const deleted = await owner((tx) => rows(tx, `delete from storage.objects where bucket_id = 'site' and name = $1 returning name`, [pdf]));
  assert.equal(deleted.length, 1, 'owner can remove the stale public file');

  // Old versions are not readable by the public.
  await rejects(anon((tx) => rows(tx, 'select content from public.site_versions where id = 2')), /permission denied/);
});

test('housekeeping: unused draft uploads are listed for clean-up', async () => {
  await db.exec(`insert into storage.objects (bucket_id, name, created_at) values
    ('drafts', 'uploads/projects/cems/old-orphan.webp', now() - interval '2 hours'),
    ('drafts', 'uploads/projects/cems/just-uploaded.webp', now())`);
  const unused = (await owner((tx) => one(tx, 'select public.unused_draft_files() as f'))).f;
  assert.ok(unused.includes('uploads/projects/cems/old-orphan.webp'));
  assert.ok(!unused.includes('uploads/projects/cems/just-uploaded.webp'), 'recent uploads are never listed');
  assert.ok(!unused.includes('uploads/credentials/postman-student-expert/aaaa-postman.pdf'), 'files still used by a draft are kept');
});
