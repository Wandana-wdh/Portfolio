import type { ArtworkVariant, Project, ProjectCategory } from '@/types';
import { CredentialPicker } from '../components/CredentialPicker';
import { GalleryField, ImageField } from '../components/FileFields';
import { RepeatList } from '../components/RepeatList';
import { CheckboxField, FormSection, SelectField, StringListField, TextAreaField, TextField } from '../components/fields';
import { cleanList, orNull } from '../lib/listUtils';
import type { EntryData } from '../lib/collections';
import { SLUG_PATTERN, slugify, validator } from '../lib/validation';
import type { FormDefinition, FormProps } from './types';

type P = EntryData<Project>;

export const categoryOptions: Array<{ value: ProjectCategory; label: string }> = [
  { value: 'Web Application', label: 'Web Application' },
  { value: 'IoT & Cloud', label: 'IoT & Cloud' },
  { value: 'Mobile', label: 'Mobile' },
  { value: 'Other', label: 'Other' },
];

export const artworkOptions: Array<{ value: ArtworkVariant; label: string }> = [
  { value: 'grid', label: 'Skyline grid' },
  { value: 'pulse', label: 'Pulse line' },
  { value: 'circuit', label: 'Circuit' },
  { value: 'network', label: 'Network' },
  { value: 'lattice', label: 'Lattice' },
  { value: 'blocks', label: 'Blocks' },
  { value: 'waves', label: 'Waves' },
];

/** Keeps the slug in step with the title for new entries until it is edited by hand. */
export function titlePatch<T extends { title: string; slug: string }>(data: T, title: string, isNew: boolean): Partial<T> {
  const follow = isNew && (data.slug === '' || data.slug === slugify(data.title));
  return (follow ? { title, slug: slugify(title) } : { title }) as Partial<T>;
}

function Form({ data, update, errors, folder, onUploaded, credentials, isNew }: FormProps<P>) {
  return (
    <>
      <FormSection title="Basics">
        <TextField label="Title" required value={data.title} onChange={(t) => update(titlePatch(data, t, isNew))} error={errors.title} />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField label="Short name (optional)" value={data.shortTitle ?? ''} onChange={(v) => update({ shortTitle: v || undefined })} hint="Used in compact links, e.g. “CEMS”." />
          <TextField
            label="Page URL"
            required
            value={data.slug}
            onChange={(slug) => update({ slug })}
            error={errors.slug}
            hint={isNew ? `/projects/${data.slug || '…'}` : `/projects/${data.slug} — changing it breaks existing links to this page.`}
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          <SelectField label="Category" value={data.category} onChange={(category) => update({ category })} options={categoryOptions} />
          <TextField label="My role (optional)" value={data.role} onChange={(role) => update({ role })} placeholder="e.g. Team member" />
          <TextField label="Year (optional)" value={data.year} onChange={(year) => update({ year })} error={errors.year} placeholder="2026" />
        </div>
        <CheckboxField label="Team project" checked={data.team} onChange={(team) => update({ team })} hint="Shows a “Team” badge on the card." />
      </FormSection>

      <FormSection title="Summary and contribution">
        <TextAreaField
          label="Card summary"
          required
          rows={3}
          value={data.summary}
          onChange={(summary) => update({ summary })}
          error={errors.summary}
          hint={`Shown on the project card (about 3 lines; ${data.summary.length} characters).`}
        />
        <StringListField
          label="My contribution"
          values={data.contribution}
          onChange={(contribution) => update({ contribution })}
          itemLabel="contribution"
          addLabel="Add contribution"
          hint="What you personally did. Important for team projects."
        />
        <StringListField label="Overview paragraphs" multiline values={data.description} onChange={(description) => update({ description })} itemLabel="paragraph" addLabel="Add paragraph" />
        <StringListField label="Key features" values={data.highlights} onChange={(highlights) => update({ highlights })} itemLabel="feature" addLabel="Add feature" />
        <StringListField label="Technologies" values={data.tech} onChange={(tech) => update({ tech })} itemLabel="technology" addLabel="Add technology" hint="The first three appear on the card." />
      </FormSection>

      <FormSection title="Images" description="The cover appears on the card and at the top of the project page; photos appear in the page’s gallery.">
        <ImageField label="Cover image" value={data.cover} onChange={(cover) => update({ cover })} folder={folder} onUploaded={onUploaded} altError={errors['cover.alt']} allowUrl={false} />
        <SelectField label="Fallback graphic (when there is no cover)" value={data.artwork} onChange={(artwork) => update({ artwork })} options={artworkOptions} />
        <div>
          <p className="mb-3 text-sm font-medium">Photos</p>
          <GalleryField images={data.gallery} onChange={(gallery) => update({ gallery })} folder={folder} onUploaded={onUploaded} errors={errors} />
        </div>
      </FormSection>

      <FormSection title="Links">
        <RepeatList
          label="GitHub repositories"
          hint="Public repositories only — GitHub buttons appear when this list isn’t empty."
          items={data.repositories}
          onChange={(repositories) => update({ repositories })}
          create={() => ({ label: 'Source code', url: '' })}
          itemLabel="Repository"
          addLabel="Add repository"
          render={(repo, set, i) => (
            <>
              <TextField label="Label" value={repo.label} onChange={(label) => set({ label })} error={errors[`repositories.${i}.label`]} />
              <TextField label="URL" type="url" value={repo.url} onChange={(url) => set({ url })} error={errors[`repositories.${i}.url`]} placeholder="https://github.com/…" />
            </>
          )}
        />
        <TextField label="Live demo URL (optional)" type="url" value={data.liveUrl} onChange={(liveUrl) => update({ liveUrl })} error={errors.liveUrl} />
      </FormSection>

      <FormSection title="Certificates" description="For example the CEMS confirmation letter. The same certificate can also appear on Achievements and elsewhere.">
        <CredentialPicker label="Attached certificates" value={data.credentialIds} onChange={(credentialIds) => update({ credentialIds })} credentials={credentials} />
      </FormSection>
    </>
  );
}

export const projectForm: FormDefinition<P> = {
  Form,
  validate(d, { takenSlugs }) {
    const v = validator();
    v.check(Boolean(d.title.trim()), 'title', 'Enter a title.');
    v.check(SLUG_PATTERN.test(d.slug), 'slug', 'Use lowercase letters, numbers and single hyphens, e.g. my-project.');
    v.check(!takenSlugs.includes(d.slug), 'slug', 'Another project already uses this URL.');
    v.check(Boolean(d.summary.trim()), 'summary', 'Enter a short summary for the card.');
    v.check(!d.year || /^\d{4}$/.test(d.year.trim()), 'year', 'Use a four-digit year.');
    v.check(!d.cover || Boolean(d.cover.alt.trim()), 'cover.alt', 'Describe the cover image.');
    d.gallery.forEach((img, i) => v.check(Boolean(img.alt.trim()), `gallery.${i}.alt`, 'Describe this photo.'));
    d.repositories.forEach((r, i) => {
      v.check(Boolean(r.label.trim()), `repositories.${i}.label`, 'Add a label.');
      v.check(/^https?:\/\/\S+\.\S+/.test(r.url.trim()), `repositories.${i}.url`, 'Enter the full repository URL (https://…).');
    });
    v.url(d.liveUrl, 'liveUrl');
    return v.errors;
  },
  prepare: (d) => ({
    ...d,
    title: d.title.trim(),
    shortTitle: d.shortTitle?.trim() || undefined,
    summary: d.summary.trim(),
    description: cleanList(d.description),
    contribution: cleanList(d.contribution),
    highlights: cleanList(d.highlights),
    tech: cleanList(d.tech),
    role: orNull(d.role),
    year: orNull(d.year),
    liveUrl: orNull(d.liveUrl),
    cover: d.cover ? { ...d.cover, alt: d.cover.alt.trim() } : null,
    gallery: d.gallery.map((g) => ({
      ...g,
      alt: g.alt.trim(),
      caption: g.caption?.trim() || undefined,
      description: g.description?.trim() || undefined,
    })),
    repositories: d.repositories.map((r) => ({ label: r.label.trim(), url: r.url.trim() })),
  }),
};
