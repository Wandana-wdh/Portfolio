/**
 * Upgrade tests for 20261127000003_sections_and_portfolio.sql and
 * 20261127000004_events_roles_photos.sql: builds a database
 * the way a live site looks before the update (old schema, owner edits, uploads,
 * a deleted entry, a published version), applies the update, and checks that it
 * only adds what is missing — and that running it (or the initial import) again
 * changes nothing.
 *
 *   npm run test:db
 */
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';

const OWNER = '11111111-1111-4111-8111-111111111111';
const migration = (name) => readFileSync(new URL(`../migrations/${name}`, import.meta.url), 'utf8');
const SCHEMA = migration('20261126000001_cms_schema.sql');
const IMPORT = migration('20261126000002_import_content.sql');
const UPDATE = migration('20261127000003_sections_and_portfolio.sql');
const UPDATE4 = migration('20261127000004_events_roles_photos.sql');
const UPDATE5 = migration('20261127000005_status_research_covers_pptx.sql');
const PPTX = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
let db;

async function asOwner(fn) {
  return db.transaction(async (tx) => {
    await tx.exec('set local role authenticated');
    await tx.query(`select set_config('request.jwt.claims', $1, true)`, [JSON.stringify({ sub: OWNER, role: 'authenticated' })]);
    return fn(tx);
  });
}
const entries = async () =>
  (await db.query(`select collection, id, sort_order, visible, data from public.content_entries order by collection, sort_order, id`)).rows;
const entry = async (collection, id) =>
  (await db.query(`select * from public.content_entries where collection = $1 and id = $2`, [collection, id])).rows[0];
const published = async () => (await db.query(`select public.published_site() as s`)).rows[0].s;
const json = (v) => JSON.stringify(v);

before(async () => {
  db = new PGlite();
  await db.exec(readFileSync(new URL('./supabase-shim.sql', import.meta.url), 'utf8'));
  await db.exec(SCHEMA);
  // Recreate the schema as it was before this update: no "events" collection.
  await db.exec(`
    alter table public.content_entries drop constraint content_entries_collection_check;
    alter table public.content_entries add constraint content_entries_collection_check check (
      collection in ('profile', 'projects', 'credentials', 'articles', 'timeline', 'volunteering', 'skills', 'research'));
  `);
  await db.exec(`
    insert into auth.users (id, email) values ('${OWNER}', 'owner@example.com');
    insert into public.site_owner (user_id) values ('${OWNER}');
  `);

  // A live site: content as it was imported back then, then edited in /admin.
  const P = (data) => `$j$${JSON.stringify(data)}$j$::jsonb`;
  await db.exec(`
    insert into public.content_entries (collection, id, sort_order, visible, data) values
      ('profile', 'profile', 0, true, ${P({
        name: 'Wandana Herath', headline: 'Computer Science Undergraduate', supportingLine: 'University of Jaffna, Sri Lanka',
        intro: 'Hero intro (edited)', institution: 'University of Jaffna', location: 'Sri Lanka', availability: null,
        portrait: 'uploads/profile/profile/me.webp', cvUrl: 'uploads/profile/profile/cv.pdf', email: 'owner@example.com', socials: [], focusAreas: [],
        about: {
          intro: 'My edited About bio.', academicBackground: 'Academic text', developmentExperience: 'Old software development block',
          professionalInterests: ['Interest A (edited)', 'Interest B'], careerAspirations: 'My edited aspirations.',
        },
      })}),
      ('projects', 'cems', 0, true, ${P({ slug: 'civil-engineering-management-site', title: 'Civil Engineering Management System (CEMS)', cover: { src: 'uploads/projects/cems/cover.png', alt: 'CEMS' }, gallery: [], credentialIds: ['cems-confirmation-letter'], liveUrl: 'https://example.org/' })}),
      ('projects', 'edge-azure-iot', 1, true, ${P({ slug: 'edge-azure-iot-department-automation', title: 'Edge and Azure IoT', gallery: [], credentialIds: [] })}),
      ('credentials', 'cems-confirmation-letter', 0, true, ${P({ title: 'CEMS letter', issuer: 'Office', image: { src: 'uploads/credentials/cems/letter.png', alt: 'Letter' }, inAchievements: true })}),
      ('credentials', 'ieee-appreciation', 1, true, ${P({ title: 'IEEE Certificate of Appreciation', issuer: 'IEEE', image: { src: 'uploads/credentials/ieee/cert.png', alt: 'Certificate' }, inAchievements: true })}),
      ('credentials', 'joomla-workshop', 2, true, ${P({ title: 'Joomla CMS Training Workshop', issuer: 'Nenasala Sri Lanka', image: null, inAchievements: true })}),
      ('credentials', 'google-ai-essentials-v1', 3, true, ${P({ title: 'Google AI Essentials V1', issuer: 'Coursera', inAchievements: true })}),
      ('timeline', 'uoj-computer-science', 0, true, ${P({ kind: 'education', title: 'Computer Science', organisation: 'University of Jaffna', start: '2023', end: null, description: 'Edited description', highlights: [], credentialIds: [] })}),
      ('timeline', 'gce-advanced-level', 1, false, ${P({ kind: 'school', title: 'GCE Advanced Level (A/L)', organisation: null, start: null, end: null, description: null, highlights: [], credentialIds: [] })}),
      ('timeline', 'summer-internship', 2, true, ${P({ kind: 'internship', title: 'Software Intern', organisation: 'Example Ltd', start: '2026-06', end: null, description: null, highlights: [], credentialIds: ['joomla-workshop'] })}),
      ('volunteering', 'ieee-sb-finance-committee', 0, true, ${P({ role: 'Finance Committee Member', organisation: 'IEEE Student Branch, University of Jaffna', start: '2025-04', end: '2026-01', description: null, highlights: [], credentialIds: ['ieee-appreciation'] })}),
      ('skills', 'languages', 0, true, ${P({ title: 'Programming Languages', icon: 'code', skills: ['Java', 'typescript'] })}),
      ('skills', 'frontend', 1, true, ${P({ title: 'Frontend Development', icon: 'layout', skills: ['React', 'My own skill'] })}),
      ('skills', 'databases', 2, true, ${P({ title: 'Databases', icon: 'database', skills: ['MongoDB', 'MySQL'] })}),
      ('skills', 'tools', 3, true, ${P({ title: 'Development Tools', icon: 'wrench', skills: ['Git', 'GitHub'] })});
    -- (The "backend" skill group and the AWS meetup certificate were deleted in /admin.)
    insert into public.site_versions (content, files) values (public.build_snapshot() - 'events', '{}');
    insert into public.site_versions (content, files) values (public.build_snapshot() - 'events', '{}');
  `);
});

test('before the update, the "events" collection is not allowed', async () => {
  await assert.rejects(
    db.query(`insert into public.content_entries (collection, id, data) values ('events', 'x', '{"title":"x"}')`),
    /check constraint/,
  );
});

test('the update adds the new content to drafts only and keeps every edit', async () => {
  const before = await entries();
  const publishedBefore = await published();

  await db.exec(UPDATE);

  // Nothing public changed.
  assert.deepEqual(await published(), publishedBefore);

  // About: only the old block is removed.
  const profile = (await entry('profile', 'profile')).data;
  assert.equal(profile.about.developmentExperience, undefined);
  const { developmentExperience: _drop, ...aboutBefore } = before.find((e) => e.collection === 'profile').data.about;
  void _drop;
  assert.deepEqual(profile.about, aboutBefore, 'bio, interests and aspirations are unchanged');
  assert.equal(profile.portrait, 'uploads/profile/profile/me.webp');

  // Projects: CEMS and the existing order unchanged, portfolio appended last.
  const projects = (await entries()).filter((e) => e.collection === 'projects');
  assert.deepEqual(projects.map((p) => p.id), ['cems', 'edge-azure-iot', 'personal-portfolio']);
  assert.deepEqual(projects[0], before.find((e) => e.id === 'cems'), 'CEMS row untouched');
  const portfolio = projects[2];
  assert.equal(portfolio.visible, true);
  assert.equal(portfolio.data.slug, 'personal-portfolio-website');
  assert.equal(portfolio.data.liveUrl, 'https://wandana.vercel.app');
  assert.deepEqual(portfolio.data.repositories, [], 'no repository link (the repository is private)');
  assert.deepEqual(portfolio.data.tech, ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'Supabase', 'PostgreSQL', 'GitHub', 'Vercel']);
  assert.equal(
    portfolio.data.summary,
    'A responsive portfolio for my projects, education, certificates, and writing, with a private editor for updating content and publishing changes.',
  );

  // Education keeps university/school entries (incl. hidden ones); the internship moves to Experience.
  const timeline = (await entries()).filter((e) => e.collection === 'timeline');
  assert.deepEqual(timeline.map((t) => [t.id, t.visible]), [['uoj-computer-science', true], ['gce-advanced-level', false]]);
  assert.deepEqual(timeline[0], before.find((e) => e.id === 'uoj-computer-science'));

  const experience = (await entries()).filter((e) => e.collection === 'volunteering');
  assert.deepEqual(experience.map((v) => v.id), ['ieee-sb-finance-committee', 'summer-internship']);
  const ieee = experience[0].data;
  assert.equal(ieee.type, 'volunteering');
  assert.equal(ieee.url, null);
  assert.equal(ieee.start, '2025-04');
  assert.equal(ieee.end, '2026-01');
  assert.deepEqual(ieee.credentialIds, ['ieee-appreciation'], 'Certificate of Appreciation link kept');
  assert.equal(experience[1].data.type, 'internship');
  assert.equal(experience[1].data.role, 'Software Intern');
  assert.deepEqual(experience[1].data.credentialIds, ['joomla-workshop']);

  // Events: linked to certificates that still exist; nothing unconfirmed is filled in.
  const events = (await entries()).filter((e) => e.collection === 'events');
  assert.deepEqual(events.map((e) => e.id), ['aws-career-meetup', 'joomla-cms-workshop']);
  assert.deepEqual(events[0].data.credentialIds, [], 'deleted AWS certificate is not linked');
  assert.equal(events[0].data.organiser, null);
  assert.deepEqual(events[1].data.credentialIds, ['joomla-workshop']);
  assert.equal(events[1].data.date, '2023-01');

  // Skills: appended to existing groups, no duplicates (any case), deleted groups not recreated.
  const skills = Object.fromEntries((await entries()).filter((e) => e.collection === 'skills').map((s) => [s.id, s.data.skills]));
  assert.deepEqual(skills.frontend, ['React', 'My own skill', 'Tailwind CSS', 'Responsive Web Design'], 'TypeScript already listed (as "typescript")');
  assert.deepEqual(skills.languages, ['Java', 'typescript']);
  assert.deepEqual(skills.databases, ['MongoDB', 'MySQL', 'PostgreSQL', 'Supabase']);
  assert.deepEqual(skills.tools, ['Git', 'GitHub', 'Vite', 'Vercel Deployment']);
  assert.equal(skills.backend, undefined);

  // Certificates (uploads, visibility, order) untouched.
  assert.deepEqual(
    (await entries()).filter((e) => e.collection === 'credentials'),
    before.filter((e) => e.collection === 'credentials'),
  );

  // Publishing includes the new sections.
  const result = await asOwner((tx) => tx.query(`select public.draft_snapshot() as s`));
  const snap = result.rows[0].s;
  assert.deepEqual(snap.events.map((e) => e.id), ['aws-career-meetup', 'joomla-cms-workshop']);
  assert.ok(!snap.timeline.some((t) => t.id === 'gce-advanced-level'), 'hidden entries stay out of the snapshot');
});

test('running the update again, or the initial import, changes nothing', async () => {
  // The owner keeps editing after the update…
  await db.exec(`
    update public.content_entries set data = jsonb_set(data, '{skills}', '["Git", "GitHub"]') where collection = 'skills' and id = 'tools';
    delete from public.content_entries where collection = 'events' and id = 'aws-career-meetup';
    delete from public.content_entries where collection = 'projects' and id = 'personal-portfolio';
  `);
  const before = json(await entries());
  const versions = (await db.query('select count(*)::int as n from public.site_versions')).rows[0].n;

  await db.exec(UPDATE);
  await db.exec(IMPORT);
  await db.exec(SCHEMA);

  assert.equal(json(await entries()), before, 'deleted entries are not brought back, edits are kept');
  assert.equal((await db.query('select count(*)::int as n from public.site_versions')).rows[0].n, versions);
  assert.equal((await db.query(`select count(*)::int as n from public.content_patches`)).rows[0].n, 1);
});

test('the update stays private: clients cannot read the patch log', async () => {
  for (const role of ['anon', 'authenticated']) {
    await assert.rejects(
      db.transaction(async (tx) => {
        await tx.exec(`set local role ${role}`);
        await tx.query('select * from public.content_patches');
      }),
      /permission denied/,
    );
  }
});

test('on a new project, the import and both updates together give the same content', async () => {
  const fresh = new PGlite();
  await fresh.exec(readFileSync(new URL('./supabase-shim.sql', import.meta.url), 'utf8'));
  await fresh.exec(SCHEMA);
  await fresh.exec(IMPORT);
  const rowsOf = async () => (await fresh.query(`select collection, id, sort_order, visible, data from public.content_entries order by 1, 3, 2`)).rows;
  const imported = await rowsOf();

  await assert.rejects(fresh.exec(UPDATE4), /Run supabase\/migrations\/20261127000003/, 'update 4 needs update 3 first');
  assert.deepEqual(await rowsOf(), imported, 'the refused update changed nothing');

  await fresh.exec(UPDATE);
  await fresh.exec(UPDATE4);
  await fresh.exec(UPDATE5);
  assert.deepEqual(await rowsOf(), imported, 'the updates find everything already imported');
  const site = (await fresh.query('select public.published_site() as s')).rows[0].s.content;
  assert.equal(site.projects[0].id, 'cems');
  assert.equal(site.projects.at(-1).title, 'Personal Portfolio & Content Dashboard');
  assert.deepEqual(site.projects.filter((p) => p.featured).map((p) => p.id), ['cems', 'hospital-e-channeling', 'edge-azure-iot', 'personal-portfolio']);
  assert.deepEqual(site.events.map((e) => e.id), ['yarl-dreamin-25', 'yarlinsight-2', 'aws-meetup-yarl-salesforce-ohana', 'aws-career-meetup', 'joomla-cms-workshop']);
  assert.deepEqual(site.volunteering.map((v) => v.id), ['ieee-sb-finance-committee', 'jamborieee-2025-finance-volunteer']);
  await fresh.close();
});

// ------------------------------------------------------------------ update 4

test('update 4 adds events, roles and the featured portfolio project to drafts and keeps every edit', async () => {
  // The owner kept editing after update 3: a role of their own, a photo on an
  // event, their own wording on the IEEE role and a renamed skill group.
  await db.exec(`
    insert into public.content_entries (collection, id, sort_order, visible, data) values
      ('volunteering', 'codesprint-x-2025-ambassador', 2, true,
        '{"type":"ambassador","role":"Event Ambassador","organisation":"CodeSprint X 2025","start":null,"end":null,"description":"Promoted the event.","highlights":[],"url":null,"credentialIds":[]}');
    update public.content_entries
      set data = data || '{"cover":{"src":"uploads/events/joomla/photo.webp","alt":"Workshop"},"description":"My own Joomla text"}'
      where collection = 'events' and id = 'joomla-cms-workshop';
    update public.content_entries
      set data = data || '{"description":"Finance committee. I received a Certificate of Appreciation."}'
      where collection = 'volunteering' and id = 'ieee-sb-finance-committee';
    update public.content_entries set data = data || '{"title":"Data stores"}' where collection = 'skills' and id = 'databases';
  `);
  const before = await entries();
  const publishedBefore = await published();

  await db.exec(UPDATE4);
  assert.deepEqual(await published(), publishedBefore, 'nothing public changes until publishing');
  const after = await entries();
  const get = (collection, id) => after.find((e) => e.collection === collection && e.id === id);
  const was = (collection, id) => before.find((e) => e.collection === collection && e.id === id);

  // Projects: the homepage's current three (here: two visible) become featured; the
  // portfolio project (deleted in the earlier test) is added back, featured, last.
  const projects = after.filter((e) => e.collection === 'projects');
  assert.deepEqual(projects.map((p) => [p.id, p.data.featured ?? false]), [['cems', true], ['edge-azure-iot', true], ['personal-portfolio', true]]);
  assert.equal(get('projects', 'personal-portfolio').data.title, 'Personal Portfolio & Content Dashboard');
  assert.deepEqual({ ...get('projects', 'cems').data, featured: undefined }, { ...was('projects', 'cems').data, featured: undefined }, 'CEMS otherwise untouched');

  // Events: three new ones first; the existing one keeps its photo, text and certificate.
  const events = after.filter((e) => e.collection === 'events');
  assert.deepEqual(events.map((e) => e.id), ['yarl-dreamin-25', 'yarlinsight-2', 'aws-meetup-yarl-salesforce-ohana', 'joomla-cms-workshop']);
  const joomla = get('events', 'joomla-cms-workshop').data;
  assert.equal(joomla.cover.src, 'uploads/events/joomla/photo.webp');
  assert.equal(joomla.description, 'My own Joomla text');
  assert.deepEqual(joomla.credentialIds, ['joomla-workshop']);
  assert.equal(joomla.slug, 'joomla-cms-workshop');
  assert.equal(joomla.type, 'workshop');
  assert.deepEqual(joomla.gallery, []);
  const yarl = get('events', 'yarl-dreamin-25').data;
  assert.equal(yarl.type, 'conference');
  assert.equal(yarl.location, 'Jaffna');
  assert.equal(yarl.date, null, 'no invented dates');
  assert.equal(yarl.url, null, 'no invented links');
  assert.equal(get('events', 'yarlinsight-2').data.organiser, 'IEEE Student Branch, University of Jaffna');

  // Roles: IEEE gets the new wording and term, keeps dates and certificate; CodeSprint untouched.
  const roles = after.filter((e) => e.collection === 'volunteering');
  assert.deepEqual(roles.map((v) => v.id), ['ieee-sb-finance-committee', 'summer-internship', 'codesprint-x-2025-ambassador', 'jamborieee-2025-finance-volunteer']);
  const ieee = get('volunteering', 'ieee-sb-finance-committee').data;
  assert.equal(ieee.term, '2025/2026 term');
  assert.equal(ieee.description, 'Served on the finance committee of the IEEE Student Branch at the University of Jaffna.');
  assert.ok(!ieee.description.includes('Certificate of Appreciation'));
  assert.deepEqual(ieee.credentialIds, ['ieee-appreciation'], 'certificate link kept');
  assert.equal(ieee.start, '2025-04');
  const codesprint = get('volunteering', 'codesprint-x-2025-ambassador').data;
  assert.equal(codesprint.role, 'Event Ambassador');
  assert.equal(codesprint.description, 'Promoted the event.');
  assert.equal(codesprint.slug, 'codesprint-x-2025-ambassador');
  const jambor = get('volunteering', 'jamborieee-2025-finance-volunteer').data;
  assert.equal(jambor.role, 'Event Volunteer (Finance)');
  assert.equal(jambor.organisation, 'JamborIEEE 2025');

  // Tools and Technologies: short labels, no duplicates, renamed group title kept.
  const skills = Object.fromEntries(after.filter((e) => e.collection === 'skills').map((g) => [g.id, g.data]));
  assert.equal(skills.databases.title, 'Data stores', 'a group title you renamed is kept');
  assert.deepEqual(skills.databases.skills, ['MongoDB', 'MySQL', 'PostgreSQL', 'Supabase', 'Supabase Auth', 'Supabase Storage']);
  assert.equal(skills.tools.title, 'Tooling & Deployment', 'the original group title is renamed');
  assert.deepEqual(skills.tools.skills, ['Git', 'GitHub', 'Vite', 'Vercel']);
  assert.deepEqual(skills.frontend.skills, ['React', 'My own skill', 'Tailwind CSS', 'Responsive Web Design'], 'TypeScript is already listed (as "typescript")');
  const all = Object.values(skills).flatMap((g) => g.skills.map((x) => x.toLowerCase()));
  assert.equal(new Set(all).size, all.length, 'no duplicate skills');
  assert.ok(!all.includes('authentication (supabase auth)') && !all.includes('vercel deployment'));

  // Certificates and Education untouched.
  for (const c of ['credentials', 'timeline']) {
    assert.deepEqual(after.filter((e) => e.collection === c), before.filter((e) => e.collection === c));
  }
});

test('running update 4 again changes nothing, even after more edits', async () => {
  await db.exec(`
    delete from public.content_entries where collection = 'events' and id = 'yarlinsight-2';
    delete from public.content_entries where collection = 'volunteering' and id = 'jamborieee-2025-finance-volunteer';
    update public.content_entries set data = data || '{"featured": false}' where collection = 'projects' and id = 'edge-azure-iot';
  `);
  const before = json(await entries());
  await db.exec(UPDATE4);
  await db.exec(UPDATE);
  await db.exec(IMPORT);
  assert.equal(json(await entries()), before, 'deleted entries stay deleted and settings are kept');
});

// ------------------------------------------------------------------ update 5

test('update 5 sets the first statuses on drafts only, allows .pptx, and keeps every edit', async () => {
  // A status the owner already chose, and a research entry like the live one.
  await db.exec(`
    update public.content_entries set data = data || '{"status": "completed"}' where collection = 'timeline' and id = 'uoj-computer-science';
    insert into public.content_entries (collection, id, sort_order, visible, data) values
      ('research', 'zk-mangrove', 0, true, '{"slug":"zk-mangrove","title":"ZK-Mangrove","summary":"x","status":"early-stage","cover":null}'),
      ('research', 'other-study', 1, true, '{"slug":"other-study","title":"Other study","summary":"y","status":null}');
  `);
  const buckets = async () => (await db.query(`select id, allowed_mime_types as m from storage.buckets order by id`)).rows;
  // The live buckets were created before .pptx was allowed.
  await db.exec(`update storage.buckets set allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'application/pdf']`);
  assert.ok((await buckets()).every((b) => !b.m.includes(PPTX)), 'before: no .pptx');
  const before = await entries();
  const publishedBefore = await published();

  await db.exec(UPDATE5);
  assert.deepEqual(await published(), publishedBefore, 'nothing public changes until publishing');
  const after = await entries();
  const status = (c, id) => after.find((e) => e.collection === c && e.id === id)?.data.status ?? null;

  assert.equal(status('projects', 'cems'), 'completed');
  assert.equal(status('projects', 'edge-azure-iot'), null, 'unknown statuses stay unset');
  assert.equal(status('projects', 'personal-portfolio'), null);
  assert.equal(status('timeline', 'uoj-computer-science'), 'completed', 'a status the owner chose is kept');
  assert.equal(status('timeline', 'gce-advanced-level'), 'completed', 'school levels are completed');
  assert.equal(status('research', 'zk-mangrove'), 'early-stage');
  assert.equal(status('research', 'other-study'), null);

  // Only the status key changed; order, uploads and everything else are kept.
  const strip = (rows) => rows.map((e) => ({ ...e, data: { ...e.data, status: undefined } }));
  assert.deepEqual(JSON.parse(JSON.stringify(strip(after))), JSON.parse(JSON.stringify(strip(before))));

  const b = await buckets();
  assert.ok(b.every((x) => x.m.includes(PPTX)), '.pptx allowed in both buckets');
  assert.ok(b.every((x) => x.m.includes('application/pdf') && x.m.includes('image/png')), 'existing types kept');

  const again = json(await entries());
  await db.exec(UPDATE5);
  await db.exec(SCHEMA);
  assert.equal(json(await entries()), again, 'running it again changes nothing');
  assert.equal((await buckets()).every((x) => x.m.filter((t) => t === PPTX).length === 1), true, 'no duplicate .pptx type');
});
