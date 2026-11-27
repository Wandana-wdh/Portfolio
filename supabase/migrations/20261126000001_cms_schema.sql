-- =============================================================================
-- Portfolio CMS — schema, Row Level Security, storage and publishing.
--
-- Model
--   content_entries  Draft content (owner only). One row per entry; `data` holds
--                    the entry exactly as the site's TypeScript types describe it.
--   site_versions    Immutable published snapshots. The public site reads only the
--                    latest one, through published_site().
--   storage 'drafts' Private bucket for uploads (owner only).
--   storage 'site'   Public bucket. publish_site() requires every file referenced
--                    by the snapshot to exist here; the admin copies them from
--                    'drafts' before publishing and removes unreferenced files after.
--   site_owner       The single approved owner account (managed in the SQL editor).
--
-- Uploaded file references are strings that start with "uploads/".
-- =============================================================================

-- ----------------------------------------------------------------- owner ----

create table if not exists public.site_owner (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.site_owner enable row level security;
-- No policies: clients can neither read nor change who the owner is.
revoke all on public.site_owner from anon, authenticated;

create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.site_owner where user_id = (select auth.uid()));
$$;

create or replace function public.assert_owner()
returns void
language plpgsql
stable
security invoker
set search_path = ''
as $$
begin
  if not public.is_owner() then
    raise exception 'Only the site owner can do this.' using errcode = '42501';
  end if;
end;
$$;

-- --------------------------------------------------------------- content ----

create table if not exists public.content_entries (
  collection text not null check (
    collection in ('profile', 'projects', 'credentials', 'articles', 'timeline', 'volunteering', 'events', 'skills', 'research')
  ),
  id text not null check (id ~ '^[a-z0-9][a-z0-9-]{0,79}$'),
  sort_order integer not null default 0,
  visible boolean not null default true,
  data jsonb not null check (jsonb_typeof(data) = 'object'),
  updated_at timestamptz not null default now(),
  primary key (collection, id),
  constraint profile_is_singleton check (collection <> 'profile' or id = 'profile'),
  constraint slug_format check (not (data ? 'slug') or (data ->> 'slug') ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint has_title check (
    collection in ('profile', 'volunteering') or length(btrim(coalesce(data ->> 'title', ''))) > 0
  ),
  constraint volunteering_has_role check (
    collection <> 'volunteering' or length(btrim(coalesce(data ->> 'role', ''))) > 0
  )
);

-- Page URLs (/projects/<slug>, /articles/<slug>, /research/<slug>) must be unique.
create unique index if not exists content_entries_slug_key
  on public.content_entries (collection, (data ->> 'slug'))
  where data ? 'slug';

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists content_entries_touch on public.content_entries;
create trigger content_entries_touch
  before update on public.content_entries
  for each row execute function public.touch_updated_at();

alter table public.content_entries enable row level security;

drop policy if exists "Owner manages content" on public.content_entries;
create policy "Owner manages content"
  on public.content_entries
  for all
  to authenticated
  using ((select public.is_owner()))
  with check ((select public.is_owner()));

revoke all on public.content_entries from anon;
grant select, insert, update, delete on public.content_entries to authenticated;

-- -------------------------------------------------------------- versions ----

create table if not exists public.site_versions (
  id bigint generated always as identity primary key,
  published_at timestamptz not null default now(),
  published_by uuid,
  content jsonb not null,
  files text[] not null default '{}'
);

alter table public.site_versions enable row level security;

drop policy if exists "Owner reads publish history" on public.site_versions;
create policy "Owner reads publish history"
  on public.site_versions
  for select
  to authenticated
  using ((select public.is_owner()));

-- Writes happen only inside publish_site(); the public reads via published_site().
revoke all on public.site_versions from anon, authenticated;
grant select on public.site_versions to authenticated;

-- ------------------------------------------------------------- snapshots ----

-- Builds the public view of the current drafts: visible entries only, in order,
-- with `id` and `visible` folded back into each entry.
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

-- Every uploaded-file reference ("uploads/...") anywhere inside a JSON document.
create or replace function public.referenced_files(doc jsonb)
returns text[]
language sql
immutable
set search_path = ''
as $$
  select coalesce(array_agg(distinct f order by f), '{}')
  from (
    select v #>> '{}' as f
    from jsonb_path_query(doc, 'lax $.** ? (@.type() == "string" && @ starts with "uploads/")') as v
  ) refs;
$$;

-- Latest published site — the only thing anonymous visitors can read.
create or replace function public.published_site()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object('version', v.id, 'publishedAt', v.published_at, 'content', v.content)
  from public.site_versions v
  order by v.id desc
  limit 1;
$$;

-- --------------------------------------------------------- owner actions ----

create or replace function public.admin_entries()
returns setof public.content_entries
language sql
stable
security invoker
set search_path = ''
as $$
  select * from public.content_entries
  where public.is_owner()
  order by collection, sort_order, id;
$$;

create or replace function public.draft_snapshot()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  perform public.assert_owner();
  return public.build_snapshot();
end;
$$;

create or replace function public.save_entry(p_collection text, p_id text, p_data jsonb, p_visible boolean default null)
returns public.content_entries
language plpgsql
security invoker
set search_path = ''
as $$
declare
  saved public.content_entries;
begin
  perform public.assert_owner();
  insert into public.content_entries as e (collection, id, sort_order, visible, data)
  values (
    p_collection,
    p_id,
    coalesce((select max(sort_order) + 1 from public.content_entries where collection = p_collection), 0),
    coalesce(p_visible, true),
    p_data - 'id' - 'visible'
  )
  on conflict (collection, id) do update
    set data = excluded.data,
        visible = coalesce(p_visible, e.visible)
  returning * into saved;
  return saved;
end;
$$;

create or replace function public.set_entry_visibility(p_collection text, p_id text, p_visible boolean)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  perform public.assert_owner();
  if p_collection = 'profile' then
    raise exception 'The profile cannot be hidden.';
  end if;
  update public.content_entries set visible = p_visible where collection = p_collection and id = p_id;
  if not found then
    raise exception 'Entry %/% not found.', p_collection, p_id using errcode = 'P0002';
  end if;
end;
$$;

-- Sets the display order of a whole collection. p_ids must list every entry once.
create or replace function public.reorder_entries(p_collection text, p_ids text[])
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  expected integer;
begin
  perform public.assert_owner();
  select count(*) into expected from public.content_entries where collection = p_collection;
  if expected <> cardinality(p_ids) or (select count(distinct x) from unnest(p_ids) x) <> expected then
    raise exception 'The order is out of date. Reload and try again.' using errcode = 'P0001';
  end if;
  update public.content_entries e
    set sort_order = o.pos
    from unnest(p_ids) with ordinality as o(id, pos)
    where e.collection = p_collection and e.id = o.id;
end;
$$;

-- Where a credential is referenced (projects, education, experience, events, ...).
create or replace function public.credential_usages(p_id text)
returns table (collection text, id text, title text, visible boolean)
language sql
stable
security invoker
set search_path = ''
as $$
  select e.collection, e.id, coalesce(e.data ->> 'title', e.data ->> 'role', e.id), e.visible
  from public.content_entries e
  where public.is_owner()
    and coalesce(e.data -> 'credentialIds', '[]'::jsonb) ? p_id
  order by e.collection, e.sort_order;
$$;

-- Permanently deletes an entry. Deleting a credential also removes it from every
-- entry that referenced it. Returns the deleted data so the caller can remove its files.
create or replace function public.delete_entry(p_collection text, p_id text)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  removed jsonb;
begin
  perform public.assert_owner();
  if p_collection = 'profile' then
    raise exception 'The profile cannot be deleted.';
  end if;
  delete from public.content_entries where collection = p_collection and id = p_id returning data into removed;
  if removed is null then
    raise exception 'Entry %/% not found.', p_collection, p_id using errcode = 'P0002';
  end if;
  if p_collection = 'credentials' then
    update public.content_entries
      set data = jsonb_set(data, '{credentialIds}', (data -> 'credentialIds') - p_id)
      where coalesce(data -> 'credentialIds', '[]'::jsonb) ? p_id;
  end if;
  return removed;
end;
$$;

-- Files the current drafts would publish, and which of them are not yet in the
-- public bucket (the admin copies those before calling publish_site()).
create or replace function public.publish_plan()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  files text[];
begin
  perform public.assert_owner();
  files := public.referenced_files(public.build_snapshot());
  return jsonb_build_object(
    'files', to_jsonb(files),
    'missing', to_jsonb(coalesce((
      select array_agg(f order by f) from unnest(files) f
      where not exists (select 1 from storage.objects o where o.bucket_id = 'site' and o.name = f)
    ), '{}'))
  );
end;
$$;

create or replace function public.publish_site()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  snap jsonb;
  files text[];
  missing text[];
  new_id bigint;
  published timestamptz;
begin
  perform public.assert_owner();
  snap := public.build_snapshot();
  if jsonb_typeof(snap -> 'profile') is distinct from 'object' then
    raise exception 'The profile is missing — save it before publishing.';
  end if;
  files := public.referenced_files(snap);
  select coalesce(array_agg(f order by f), '{}') into missing
  from unnest(files) f
  where not exists (select 1 from storage.objects o where o.bucket_id = 'site' and o.name = f);
  if cardinality(missing) > 0 then
    raise exception 'Some files have not been copied to the public site yet: %', array_to_string(missing, ', ')
      using errcode = 'P0001', hint = 'missing_files';
  end if;
  insert into public.site_versions (content, files, published_by)
  values (snap, files, auth.uid())
  returning id, published_at into new_id, published;
  return jsonb_build_object('version', new_id, 'publishedAt', published, 'files', to_jsonb(files));
end;
$$;

-- Public files no longer referenced by the latest published version.
create or replace function public.stale_public_files()
returns text[]
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  perform public.assert_owner();
  return coalesce((
    select array_agg(o.name order by o.name)
    from storage.objects o
    where o.bucket_id = 'site'
      and o.name <> all (coalesce((select v.files from public.site_versions v order by v.id desc limit 1), '{}'))
  ), '{}');
end;
$$;

-- Draft uploads no entry refers to any more (older than an hour, so uploads in
-- progress are never included).
create or replace function public.unused_draft_files()
returns text[]
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  used text[];
begin
  perform public.assert_owner();
  select coalesce(array_agg(distinct f), '{}') into used
  from public.content_entries e, unnest(public.referenced_files(e.data)) f;
  return coalesce((
    select array_agg(o.name order by o.name)
    from storage.objects o
    where o.bucket_id = 'drafts'
      and o.created_at < now() - interval '1 hour'
      and o.name <> all (used)
  ), '{}');
end;
$$;

-- --------------------------------------------------------- function access --

revoke execute on all functions in schema public from public, anon;

grant execute on function public.published_site() to anon, authenticated;
grant execute on function public.is_owner() to authenticated;
grant execute on function public.assert_owner() to authenticated;
grant execute on function public.admin_entries() to authenticated;
grant execute on function public.draft_snapshot() to authenticated;
grant execute on function public.save_entry(text, text, jsonb, boolean) to authenticated;
grant execute on function public.set_entry_visibility(text, text, boolean) to authenticated;
grant execute on function public.reorder_entries(text, text[]) to authenticated;
grant execute on function public.credential_usages(text) to authenticated;
grant execute on function public.delete_entry(text, text) to authenticated;
grant execute on function public.publish_plan() to authenticated;
grant execute on function public.publish_site() to authenticated;
grant execute on function public.stale_public_files() to authenticated;
grant execute on function public.unused_draft_files() to authenticated;
revoke execute on function public.build_snapshot() from authenticated;
revoke execute on function public.referenced_files(jsonb) from authenticated;

-- --------------------------------------------------------------- storage ----

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('drafts', 'drafts', false, 10485760,
   array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'application/pdf',
         'application/vnd.openxmlformats-officedocument.presentationml.presentation']),
  ('site', 'site', true, 10485760,
   array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'application/pdf',
         'application/vnd.openxmlformats-officedocument.presentationml.presentation'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Drafts: private to the owner. Site: anyone can download by URL (public bucket),
-- but only the owner can list, add, replace or remove files.
drop policy if exists "Owner manages draft files" on storage.objects;
create policy "Owner manages draft files"
  on storage.objects
  for all
  to authenticated
  using (bucket_id = 'drafts' and (select public.is_owner()))
  with check (bucket_id = 'drafts' and (select public.is_owner()));

drop policy if exists "Owner manages published files" on storage.objects;
create policy "Owner manages published files"
  on storage.objects
  for all
  to authenticated
  using (bucket_id = 'site' and (select public.is_owner()))
  with check (bucket_id = 'site' and (select public.is_owner()));
