-- =============================================================================
-- Update 5 (2026-11-27): status badges, research covers and project
-- presentations (.pptx).
--
-- Additive and safe on a live site; safe to run more than once:
--   * Storage: both buckets also accept PowerPoint (.pptx) files. Nothing else
--     about the buckets changes (still private drafts / public site, 10 MB).
--   * Content: sets the first statuses once (recorded in public.content_patches),
--     only on DRAFTS and only where no status has been set yet. Nothing public
--     changes until you Publish in /admin. Order, uploads and edits are kept.
--   * Research covers and presentations need no database change.
-- =============================================================================

-- ----------------------------------------------- storage: allow .pptx ------

update storage.buckets
  set allowed_mime_types = allowed_mime_types
    || array['application/vnd.openxmlformats-officedocument.presentationml.presentation']
  where id in ('drafts', 'site')
    and allowed_mime_types is not null
    and not ('application/vnd.openxmlformats-officedocument.presentationml.presentation' = any (allowed_mime_types));

-- ------------------------------------------------- patch bookkeeping ------
-- (Created by update 3; repeated here so this file also works on its own.)

create table if not exists public.content_patches (
  name text primary key,
  applied_at timestamptz not null default now()
);
alter table public.content_patches enable row level security;
revoke all on public.content_patches from anon, authenticated;

-- ---------------------------------------------- one-time status values ----

do $patch$
declare
  patch constant text := '2026-11-27-status';
begin
  if exists (select 1 from public.content_patches where name = patch) then
    raise notice 'Content update % was already applied; nothing changed.', patch;
    return;
  end if;

  -- CEMS: Completed.
  update public.content_entries
    set data = data || '{"status": "completed"}'::jsonb
    where collection = 'projects' and id = 'cems' and coalesce(data ->> 'status', '') = '';

  -- (Education shows no In Progress badge, so the current degree stays unset.)

  -- Completed school levels (A/L, O/L, Grade 5): Completed.
  update public.content_entries
    set data = data || '{"status": "completed"}'::jsonb
    where collection = 'timeline'
      and id in ('gce-advanced-level', 'gce-ordinary-level', 'grade-5-scholarship')
      and coalesce(data ->> 'status', '') = '';

  -- Current undergraduate research: Early-stage (only if no status is set).
  update public.content_entries
    set data = data || '{"status": "early-stage"}'::jsonb
    where collection = 'research' and id = 'zk-mangrove' and coalesce(data ->> 'status', '') = '';

  -- Everything else stays unset (no badge) until you choose a status in /admin.

  insert into public.content_patches (name) values (patch);
  raise notice 'Content update % applied to your drafts. Preview and publish in /admin.', patch;
end;
$patch$;
