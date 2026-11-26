-- =============================================================================
-- Update 3 (2026-11-27): Education, Volunteering & Experience, Events &
-- Participation, the Personal Portfolio Website project, new skills, and the
-- removed "Software development" About block.
--
-- Safe on a live site, and safe to run more than once:
--   * The schema changes can be repeated.
--   * The content changes run only once (recorded in public.content_patches) and
--     only change DRAFTS. Nothing public changes until you Publish in /admin.
--   * Existing entries, uploads, visibility settings and certificate links are
--     kept. Nothing is overwritten; entries are only added when missing.
--
-- Do NOT re-run 20261126000002_import_content.sql on a live site (it now skips
-- itself when the site already has content, but there is no reason to run it).
-- =============================================================================

-- ------------------------------------------------------- patch bookkeeping --

create table if not exists public.content_patches (
  name text primary key,
  applied_at timestamptz not null default now()
);

alter table public.content_patches enable row level security;
-- No policies: only the SQL editor (or migrations) can read or change it.
revoke all on public.content_patches from anon, authenticated;

-- ------------------------------------------------- new collection: events --

do $schema$
declare
  c record;
begin
  -- Replace the list of allowed collections (the check that names 'research').
  for c in
    select conname
    from pg_constraint
    where conrelid = 'public.content_entries'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) like '%''research''%'
  loop
    execute format('alter table public.content_entries drop constraint %I', c.conname);
  end loop;
end;
$schema$;

alter table public.content_entries
  add constraint content_entries_collection_check check (
    collection in ('profile', 'projects', 'credentials', 'articles', 'timeline', 'volunteering', 'events', 'skills', 'research')
  );

-- The published snapshot now includes "events" (CREATE OR REPLACE keeps the
-- function's existing permissions).
create or replace function public.build_snapshot()
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  with lists as (
    select
      collection,
      jsonb_agg(data || jsonb_build_object('id', id, 'visible', visible) order by sort_order, id) as items
    from public.content_entries
    where visible and collection <> 'profile'
    group by collection
  )
  select jsonb_build_object(
    'profile', (select data from public.content_entries where collection = 'profile' and id = 'profile'),
    'projects', coalesce((select items from lists where collection = 'projects'), '[]'::jsonb),
    'credentials', coalesce((select items from lists where collection = 'credentials'), '[]'::jsonb),
    'articles', coalesce((select items from lists where collection = 'articles'), '[]'::jsonb),
    'timeline', coalesce((select items from lists where collection = 'timeline'), '[]'::jsonb),
    'volunteering', coalesce((select items from lists where collection = 'volunteering'), '[]'::jsonb),
    'events', coalesce((select items from lists where collection = 'events'), '[]'::jsonb),
    'skills', coalesce((select items from lists where collection = 'skills'), '[]'::jsonb),
    'research', coalesce((select items from lists where collection = 'research'), '[]'::jsonb)
  );
$$;

revoke execute on function public.build_snapshot() from public, anon, authenticated;

-- ------------------------------------------------- one-time content update --

do $patch$
declare
  patch constant text := '2026-11-27-sections';
  next_order integer;
  addition record;
begin
  if exists (select 1 from public.content_patches where name = patch) then
    raise notice 'Content update % was already applied; nothing changed.', patch;
    return;
  end if;
  if not exists (select 1 from public.content_entries where collection = 'profile') then
    raise notice 'No site content yet. Run the initial import first, then run this file again.';
    return;
  end if;

  -- 1. About: remove the old "Software development" text (no longer shown).
  update public.content_entries
    set data = data #- '{about,developmentExperience}'
    where collection = 'profile' and (data -> 'about') ? 'developmentExperience';

  -- 2. Education holds university and school entries only. Any internship or
  --    experience entries are moved to Volunteering & Experience (same id,
  --    visibility, dates, description and certificate links).
  select coalesce(max(sort_order) + 1, 0) into next_order
    from public.content_entries where collection = 'volunteering';
  insert into public.content_entries (collection, id, sort_order, visible, data)
  select
    'volunteering',
    t.id,
    next_order + (row_number() over (order by t.sort_order, t.id))::integer - 1,
    t.visible,
    jsonb_build_object(
      'type', case when t.data ->> 'kind' = 'internship' then 'internship' else 'work' end,
      'role', t.data ->> 'title',
      'organisation', coalesce(t.data ->> 'organisation', ''),
      'start', t.data -> 'start',
      'end', t.data -> 'end',
      'description', t.data -> 'description',
      'highlights', coalesce(t.data -> 'highlights', '[]'::jsonb),
      'url', null,
      'credentialIds', coalesce(t.data -> 'credentialIds', '[]'::jsonb)
    )
  from public.content_entries t
  where t.collection = 'timeline' and t.data ->> 'kind' in ('internship', 'experience')
  on conflict (collection, id) do nothing;

  delete from public.content_entries t
  where t.collection = 'timeline'
    and t.data ->> 'kind' in ('internship', 'experience')
    and exists (select 1 from public.content_entries v where v.collection = 'volunteering' and v.id = t.id);

  -- 3. Volunteering & Experience: add the new fields to existing roles
  --    (type "Volunteering", no link). Everything else is kept as it is.
  update public.content_entries
    set data = jsonb_build_object('type', 'volunteering', 'url', null) || data
    where collection = 'volunteering' and not (data ? 'type' and data ? 'url');

  -- 4. Events & Participation: the AWS career meetup and the Joomla CMS
  --    workshop, linked to their existing certificates when those exist.
  select coalesce(max(sort_order) + 1, 0) into next_order
    from public.content_entries where collection = 'events';
  insert into public.content_entries (collection, id, sort_order, visible, data)
  select v.collection, v.entry_id, next_order + v.pos, true,
    jsonb_build_object(
      'title', v.title,
      'organiser', v.organiser,
      'date', v.date,
      'description', null,
      'url', null,
      'credentialIds',
        case when exists (select 1 from public.content_entries c where c.collection = 'credentials' and c.id = v.credential)
          then jsonb_build_array(v.credential) else '[]'::jsonb end
    )
  from (values
    ('events', 'aws-career-meetup', 0, 'Level Up on the Cloud: Building Your AWS Career', null::text, '2026-02', 'aws-meetup-level-up-cloud'),
    ('events', 'joomla-cms-workshop', 1, 'Joomla CMS Training Workshop', 'Nenasala Sri Lanka', '2023-01', 'joomla-workshop')
  ) as v(collection, entry_id, pos, title, organiser, date, credential)
  on conflict (collection, id) do nothing;

  -- 5. Projects: append "Personal Portfolio Website" after your current
  --    projects (CEMS and your order are unchanged), unless a project with that
  --    title or URL already exists.
  insert into public.content_entries (collection, id, sort_order, visible, data)
  select 'projects', 'personal-portfolio',
    coalesce((select max(sort_order) + 1 from public.content_entries where collection = 'projects'), 0),
    true,
    $json${"slug":"personal-portfolio-website","title":"Personal Portfolio Website","summary":"A responsive portfolio for my projects, education, certificates, and writing, with a private editor for updating content and publishing changes.","description":["This website is my personal portfolio. Visitors can browse my projects, education, certificates, volunteering, events and articles on responsive pages with light and dark themes. The frontend is built with React, TypeScript, Vite and Tailwind CSS.","Behind the public pages is a private editor that only my account can sign in to, using Supabase Auth. I sign in, edit an entry and save it as a draft, preview the whole site with my drafts, and publish when it is ready. Publishing updates the live site without changing code or redeploying.","From the editor I can upload certificates as PDFs or images, and project photos with captions and alt text. Uploads stay private in Supabase Storage until I publish. Content is stored in a PostgreSQL database on Supabase, with Row Level Security so that only the owner account can change it.","I connected the GitHub repository to Vercel, so changes pushed to GitHub are built and deployed automatically, and configured the Vercel project with the Supabase project URL and publishable key so the site loads its published content from Supabase."],"category":"Web Application","tech":["React","TypeScript","Vite","Tailwind CSS","Supabase","PostgreSQL","GitHub","Vercel"],"highlights":["Responsive pages with light and dark themes","Owner-only sign-in with Supabase Auth","Save, preview and publish workflow","Certificate and photo uploads with Supabase Storage","Row Level Security on the database and file storage","Content updates without redeploying"],"contribution":["Connected the GitHub repository to Vercel for automatic deployments.","Set up the Supabase project: ran the database migrations, created the owner account and turned off public sign-up.","Configured the site’s Supabase settings in Vercel, and keep the content up to date through the private editor."],"role":null,"team":false,"year":"2026","cover":{"src":"/images/projects/personal-portfolio/cover.webp","alt":"Homepage of the portfolio website in dark mode, showing the hero introduction and a featured project card","width":1600,"height":900},"gallery":[{"src":"/images/projects/personal-portfolio/projects-page.webp","alt":"Projects page in light mode with three equal-size project cards and category filters","width":1600,"height":900,"caption":"Projects page in light mode"},{"src":"/images/projects/personal-portfolio/education-mobile.webp","alt":"The Education section on a phone, showing university and school entries on a vertical timeline","width":1600,"height":900,"caption":"Education section on a phone"},{"src":"/images/projects/personal-portfolio/admin-project-editor.webp","alt":"The private editor in dark mode, editing a project’s title, page URL, category and year","width":1600,"height":900,"caption":"Editing a project in the private editor"},{"src":"/images/projects/personal-portfolio/admin-certificate-upload.webp","alt":"The New certificate dialog with title, issuer, type, issue date, a PDF or image upload and the List on the Achievements page switch","width":1600,"height":900,"caption":"Adding a certificate with its file"},{"src":"/images/projects/personal-portfolio/admin-publish.webp","alt":"The Publish changes dialog explaining that saved drafts will replace the public site","width":1600,"height":900,"caption":"Publishing saved drafts"}],"artwork":"lattice","repositories":[],"liveUrl":"https://wandana.vercel.app","credentialIds":[]}$json$::jsonb
  where not exists (
    select 1 from public.content_entries
    where collection = 'projects'
      and (data ->> 'slug' = 'personal-portfolio-website' or lower(data ->> 'title') = 'personal portfolio website')
  )
  on conflict (collection, id) do nothing;

  -- 6. Skills: add to the existing groups, skipping any skill already listed
  --    in any group (case-insensitive) and any group that no longer exists.
  for addition in
    select * from (values
      (1, 'frontend', 'TypeScript'),
      (2, 'frontend', 'Tailwind CSS'),
      (3, 'frontend', 'Responsive Web Design'),
      (4, 'backend', 'Authentication (Supabase Auth)'),
      (5, 'backend', 'File Storage (Supabase Storage)'),
      (6, 'databases', 'PostgreSQL'),
      (7, 'databases', 'Supabase'),
      (8, 'tools', 'Vite'),
      (9, 'tools', 'Vercel Deployment')
    ) as a(pos, group_id, skill)
    order by pos
  loop
    if not exists (
      select 1
      from public.content_entries e,
        jsonb_array_elements_text(case when jsonb_typeof(e.data -> 'skills') = 'array' then e.data -> 'skills' else '[]'::jsonb end) s
      where e.collection = 'skills' and lower(btrim(s)) = lower(addition.skill)
    ) then
      update public.content_entries
        set data = jsonb_set(
          data, '{skills}',
          (case when jsonb_typeof(data -> 'skills') = 'array' then data -> 'skills' else '[]'::jsonb end) || to_jsonb(addition.skill)
        )
        where collection = 'skills' and id = addition.group_id;
    end if;
  end loop;

  insert into public.content_patches (name) values (patch);
  raise notice 'Content update % applied to your drafts. Preview and publish in /admin.', patch;
end;
$patch$;
