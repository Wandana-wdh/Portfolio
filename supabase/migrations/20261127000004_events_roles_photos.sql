-- =============================================================================
-- Update 4 (2026-11-27): Events & Participation and Volunteering & Experience as
-- photo cards with their own pages, the featured "Personal Portfolio & Content
-- Dashboard" project, new events and roles, and the Tools and Technologies groups.
--
-- Run AFTER 20261127000003_sections_and_portfolio.sql (it stops with a message
-- if update 3 hasn't been applied yet).
--
-- Safe on a live site, and safe to run more than once:
--   * No schema changes — only content, and only DRAFTS. Nothing public changes
--     until you Publish in /admin.
--   * Runs once (recorded in public.content_patches). Entries are only added when
--     missing (matched by name), so nothing is duplicated, and your edits,
--     uploads, visibility settings and certificate links are kept.
-- =============================================================================

do $patch$
declare
  patch constant text := '2026-11-27-events-roles-photos';
  first_order integer;
  addition record;
begin
  -- Update 3 creates public.content_patches, so check for the table first.
  if to_regclass('public.content_patches') is null then
    raise exception 'Run supabase/migrations/20261127000003_sections_and_portfolio.sql first, then run this file again.';
  end if;
  if not exists (select 1 from public.content_patches where name = '2026-11-27-sections') then
    raise exception 'Run supabase/migrations/20261127000003_sections_and_portfolio.sql first, then run this file again.';
  end if;
  if exists (select 1 from public.content_patches where name = patch) then
    raise notice 'Content update % was already applied; nothing changed.', patch;
    return;
  end if;

  -- 1. Featured Projects. The homepage used to show the first three visible
  --    projects; mark those as featured so the homepage keeps them (only when no
  --    project has a featured setting yet).
  if not exists (select 1 from public.content_entries where collection = 'projects' and data ? 'featured') then
    update public.content_entries
      set data = data || '{"featured": true}'::jsonb
      where collection = 'projects'
        and id in (
          select id from public.content_entries
          where collection = 'projects' and visible
          order by sort_order, id
          limit 3
        );
  end if;

  -- 2. The portfolio project: new name and card summary, featured. Its overview
  --    is replaced only if it is still the text added by update 3 (an overview
  --    you've edited is kept). Cover, photos, order and links are kept.
  if exists (
    select 1 from public.content_entries
    where collection = 'projects' and (id = 'personal-portfolio' or data ->> 'slug' = 'personal-portfolio-website')
  ) then
    update public.content_entries
      set data = data
        || jsonb_build_object('title', 'Personal Portfolio & Content Dashboard', 'summary', 'A responsive portfolio for my projects, education, certificates, and writing, with a private dashboard for editing content and publishing updates.', 'featured', true)
        || case when data -> 'description' = $json$["This website is my personal portfolio. Visitors can browse my projects, education, certificates, volunteering, events and articles on responsive pages with light and dark themes. The frontend is built with React, TypeScript, Vite and Tailwind CSS.","Behind the public pages is a private editor that only my account can sign in to, using Supabase Auth. I sign in, edit an entry and save it as a draft, preview the whole site with my drafts, and publish when it is ready. Publishing updates the live site without changing code or redeploying.","From the editor I can upload certificates as PDFs or images, and project photos with captions and alt text. Uploads stay private in Supabase Storage until I publish. Content is stored in a PostgreSQL database on Supabase, with Row Level Security so that only the owner account can change it.","I connected the GitHub repository to Vercel, so changes pushed to GitHub are built and deployed automatically, and configured the Vercel project with the Supabase project URL and publishable key so the site loads its published content from Supabase."]$json$::jsonb
             then jsonb_build_object('description', $json$["A responsive portfolio for my projects, education, volunteering, events, certificates and writing, with light and dark themes. It is built with React, TypeScript, Vite and Tailwind CSS.","Behind the public pages is a private content dashboard. I sign in with Supabase Auth, edit content, upload certificates and photos to Supabase Storage, save my changes as drafts, preview the whole site with those drafts, and publish when it is ready — without changing code or redeploying.","Content is stored in PostgreSQL on Supabase, with Row Level Security so that only my account can change it. I connected the GitHub repository to Vercel, which builds and deploys code changes automatically."]$json$::jsonb)
             else '{}'::jsonb end
      where collection = 'projects' and (id = 'personal-portfolio' or data ->> 'slug' = 'personal-portfolio-website');
  else
    insert into public.content_entries (collection, id, sort_order, visible, data)
    select 'projects', 'personal-portfolio',
      coalesce((select max(sort_order) + 1 from public.content_entries where collection = 'projects'), 0),
      true, $json${"featured":true,"slug":"personal-portfolio-website","title":"Personal Portfolio & Content Dashboard","summary":"A responsive portfolio for my projects, education, certificates, and writing, with a private dashboard for editing content and publishing updates.","description":["A responsive portfolio for my projects, education, volunteering, events, certificates and writing, with light and dark themes. It is built with React, TypeScript, Vite and Tailwind CSS.","Behind the public pages is a private content dashboard. I sign in with Supabase Auth, edit content, upload certificates and photos to Supabase Storage, save my changes as drafts, preview the whole site with those drafts, and publish when it is ready — without changing code or redeploying.","Content is stored in PostgreSQL on Supabase, with Row Level Security so that only my account can change it. I connected the GitHub repository to Vercel, which builds and deploys code changes automatically."],"category":"Web Application","tech":["React","TypeScript","Vite","Tailwind CSS","Supabase","PostgreSQL","GitHub","Vercel"],"highlights":["Responsive pages with light and dark themes","Owner-only sign-in with Supabase Auth","Save, preview and publish workflow","Certificate and photo uploads with Supabase Storage","Row Level Security on the database and file storage","Content updates without redeploying"],"contribution":["Connected the GitHub repository to Vercel for automatic deployments.","Set up the Supabase project: ran the database migrations, created the owner account and turned off public sign-up.","Configured the site’s Supabase settings in Vercel, and keep the content up to date through the private editor."],"role":null,"team":false,"year":"2026","cover":{"src":"/images/projects/personal-portfolio/cover.webp","alt":"Homepage of the portfolio website in dark mode, showing the hero introduction and a featured project card","width":1600,"height":900},"gallery":[{"src":"/images/projects/personal-portfolio/projects-page.webp","alt":"Projects page in light mode with three equal-size project cards and category filters","width":1600,"height":900,"caption":"Projects page in light mode"},{"src":"/images/projects/personal-portfolio/education-mobile.webp","alt":"The Education section on a phone, showing university and school entries on a vertical timeline","width":1600,"height":900,"caption":"Education section on a phone"},{"src":"/images/projects/personal-portfolio/admin-project-editor.webp","alt":"The private editor in dark mode, editing a project’s title, page URL, category and year","width":1600,"height":900,"caption":"Editing a project in the private editor"},{"src":"/images/projects/personal-portfolio/admin-certificate-upload.webp","alt":"The New certificate dialog with title, issuer, type, issue date, a PDF or image upload and the List on the Achievements page switch","width":1600,"height":900,"caption":"Adding a certificate with its file"},{"src":"/images/projects/personal-portfolio/admin-publish.webp","alt":"The Publish changes dialog explaining that saved drafts will replace the public site","width":1600,"height":900,"caption":"Publishing saved drafts"}],"artwork":"lattice","repositories":[],"liveUrl":"https://wandana.vercel.app","credentialIds":[]}$json$::jsonb
    on conflict do nothing;
  end if;

  -- 3. Tools and Technologies. Replace the longer labels added by update 3 with
  --    the short ones, rename two groups (only if you haven't renamed them), then
  --    add any missing skills — skipping skills already listed in any group
  --    (case-insensitive) and groups you've deleted.
  update public.content_entries
    set data = jsonb_set(data, '{skills}', coalesce((
      select jsonb_agg(s order by i)
      from jsonb_array_elements(data -> 'skills') with ordinality as x(s, i)
      where s #>> '{}' not in ('Authentication (Supabase Auth)', 'File Storage (Supabase Storage)', 'Vercel Deployment')
    ), '[]'::jsonb))
    where collection = 'skills'
      and jsonb_typeof(data -> 'skills') = 'array'
      and (data -> 'skills') ?| array['Authentication (Supabase Auth)', 'File Storage (Supabase Storage)', 'Vercel Deployment'];

  update public.content_entries
    set data = data || '{"title": "Database & Backend Services"}'::jsonb
      || case when data ->> 'description' = 'Document and relational data.'
           then '{"description": "Databases and hosted backend services."}'::jsonb else '{}'::jsonb end
    where collection = 'skills' and id = 'databases' and data ->> 'title' = 'Databases';
  update public.content_entries
    set data = data || '{"title": "Tooling & Deployment"}'::jsonb
    where collection = 'skills' and id = 'tools' and data ->> 'title' = 'Development Tools';

  for addition in
    select * from (values
      (1, 'frontend', 'React', null::text[]),
      (2, 'frontend', 'TypeScript', null),
      (3, 'frontend', 'Tailwind CSS', null),
      (4, 'databases', 'PostgreSQL', null),
      (5, 'databases', 'Supabase', null),
      (6, 'databases', 'Supabase Auth', null),
      (7, 'databases', 'Supabase Storage', null),
      (8, 'tools', 'Git', array['git', 'git/github']),
      (9, 'tools', 'GitHub', array['github', 'git/github']),
      (10, 'tools', 'Vite', null),
      (11, 'tools', 'Vercel', null)
    ) as a(pos, group_id, skill, same_as)
    order by pos
  loop
    if not exists (
      select 1
      from public.content_entries e,
        jsonb_array_elements_text(case when jsonb_typeof(e.data -> 'skills') = 'array' then e.data -> 'skills' else '[]'::jsonb end) s
      where e.collection = 'skills'
        and (lower(btrim(s)) = lower(addition.skill) or lower(btrim(s)) = any (coalesce(addition.same_as, '{}')))
    ) then
      update public.content_entries
        set data = jsonb_set(
          data, '{skills}',
          (case when jsonb_typeof(data -> 'skills') = 'array' then data -> 'skills' else '[]'::jsonb end) || to_jsonb(addition.skill)
        )
        where collection = 'skills' and id = addition.group_id;
    end if;
  end loop;

  -- 4. Events & Participation: every event gets a page URL, type, location,
  --    cover, gallery and recap (existing values are kept).
  update public.content_entries
    set data = jsonb_build_object(
        'slug', id,
        'type', case id when 'aws-career-meetup' then 'meetup' when 'joomla-cms-workshop' then 'workshop' else 'other' end,
        'location', null,
        'recap', '[]'::jsonb,
        'cover', null,
        'gallery', '[]'::jsonb
      ) || data
    where collection = 'events' and not (data ?& array['slug', 'type', 'location', 'recap', 'cover', 'gallery']);

  --    New events go first, in this order (your existing events keep their order
  --    after them). An event whose name you already use is skipped. The AWS
  --    Meetup with Yarl Salesforce Ohana is a separate entry from the AWS
  --    career meetup.
  select coalesce(min(sort_order), 0) into first_order from public.content_entries where collection = 'events';
  insert into public.content_entries (collection, id, sort_order, visible, data)
  select 'events', v.id, first_order - 3 + v.pos, true, v.data
  from (values
    ('yarl-dreamin-25', 0, $json${"recap":[],"cover":null,"gallery":[],"url":null,"credentialIds":[],"slug":"yarl-dreamin-25","title":"Yarl Dreamin’ 25","type":"conference","organiser":null,"location":"Jaffna","date":null,"description":"I joined the Salesforce community in Jaffna for sessions on Agentforce, Apex trigger frameworks, data quality, and real-time integrations. I also had the chance to meet fellow Trailblazers and exchange ideas about how they use Salesforce in their work."}$json$::jsonb),
    ('yarlinsight-2', 1, $json${"recap":[],"cover":null,"gallery":[],"url":null,"credentialIds":[],"slug":"yarlinsight-2","title":"YarlInsight 2.0","type":"bootcamp","organiser":"IEEE Student Branch, University of Jaffna","location":null,"date":null,"description":"I took part in a two-day, hands-on bootcamp on full-stack web development with MongoDB, Express.js, React, and Node.js. I learned from industry mentors and worked alongside other students as we explored practical development approaches."}$json$::jsonb),
    ('aws-meetup-yarl-salesforce-ohana', 2, $json${"recap":[],"cover":null,"gallery":[],"url":null,"credentialIds":[],"slug":"aws-meetup-yarl-salesforce-ohana","title":"AWS Meetup with Yarl Salesforce Ohana","type":"meetup","organiser":null,"location":null,"date":null,"description":"I joined a hands-on AWS meetup with sessions led by Gnanakeethan B. and Parathan Thiyagalingam. It was a chance to learn more about cloud computing and connect with others exploring AWS."}$json$::jsonb)
  ) as v(id, pos, data)
  where not exists (
    select 1 from public.content_entries e
    where e.collection = 'events' and lower(btrim(e.data ->> 'title')) = lower(btrim(v.data ->> 'title'))
  )
  on conflict do nothing;

  -- 5. Volunteering & Experience: every role gets a page URL, term, cover,
  --    gallery and write-up (existing values are kept).
  update public.content_entries
    set data = jsonb_build_object(
        'slug', id,
        'type', 'volunteering',
        'term', null,
        'url', null,
        'highlights', '[]'::jsonb,
        'credentialIds', '[]'::jsonb,
        'cover', null,
        'gallery', '[]'::jsonb,
        'recap', '[]'::jsonb
      ) || data
    where collection = 'volunteering'
      and not (data ?& array['slug', 'type', 'term', 'url', 'highlights', 'credentialIds', 'cover', 'gallery', 'recap']);

  --    IEEE finance committee: your latest wording and the 2025/2026 term. Its
  --    dates, photos and Certificate of Appreciation link are kept.
  update public.content_entries
    set data = data || jsonb_build_object('term', '2025/2026 term', 'description', 'Served on the finance committee of the IEEE Student Branch at the University of Jaffna.')
    where collection = 'volunteering'
      and (id = 'ieee-sb-finance-committee'
           or (lower(btrim(data ->> 'role')) = 'finance committee member' and data ->> 'organisation' ilike '%ieee%'));

  --    JamborIEEE 2025 finance volunteer, unless a JamborIEEE role already exists.
  --    Other roles (e.g. CodeSprint X 2025 Event Ambassador) are not touched.
  insert into public.content_entries (collection, id, sort_order, visible, data)
  select 'volunteering', 'jamborieee-2025-finance-volunteer',
    coalesce((select max(sort_order) + 1 from public.content_entries where collection = 'volunteering'), 0),
    true, $json${"slug":"jamborieee-2025-finance-volunteer","type":"volunteering","role":"Event Volunteer (Finance)","organisation":"JamborIEEE 2025","term":null,"start":null,"end":null,"description":"Supported the finance team at an IEEE event that brought together students from six universities.","highlights":[],"url":null,"credentialIds":[],"cover":null,"gallery":[],"recap":[]}$json$::jsonb
  where not exists (
    select 1 from public.content_entries
    where collection = 'volunteering' and (data ->> 'organisation' ilike '%jamborieee%' or data ->> 'role' ilike '%jamborieee%')
  )
  on conflict do nothing;

  insert into public.content_patches (name) values (patch);
  raise notice 'Content update % applied to your drafts. Preview and publish in /admin.', patch;
end;
$patch$;
