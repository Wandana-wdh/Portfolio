import type { EventEntry, EventType, ExperienceType, GalleryImage, ImageAsset, VolunteeringEntry } from '@/types';
import { eventTypeLabel, experienceTypeLabel } from '@/lib/labels';
import { CredentialPicker } from '../components/CredentialPicker';
import { GalleryField, ImageField } from '../components/FileFields';
import { FormSection, SelectField, StringListField, TextAreaField, TextField } from '../components/fields';
import { cleanList, orNull } from '../lib/listUtils';
import type { EntryData } from '../lib/collections';
import { SLUG_PATTERN, slugify, validator, type Errors } from '../lib/validation';
import type { FormDefinition, FormProps } from './types';

type V = EntryData<VolunteeringEntry>;
type E = EntryData<EventEntry>;

const experienceOptions = (Object.keys(experienceTypeLabel) as ExperienceType[]).map((value) => ({ value, label: experienceTypeLabel[value] }));
const eventOptions = (Object.keys(eventTypeLabel) as EventType[]).map((value) => ({ value, label: eventTypeLabel[value] }));

const reuseHint = 'Tick an existing certificate, or add a new one with its file. A certificate is one shared record — replace its file once in Certificates and every place it’s attached updates.';

/** For new entries the page URL follows the name until it is edited by hand. */
function followSlug(data: { slug: string }, previousName: string, name: string, isNew: boolean): { slug?: string } {
  return isNew && (data.slug === '' || data.slug === slugify(previousName)) ? { slug: slugify(name) } : {};
}

function PhotosSection({
  cover,
  gallery,
  onCover,
  onGallery,
  folder,
  onUploaded,
  errors,
}: {
  cover: ImageAsset | null;
  gallery: GalleryImage[];
  onCover: (cover: ImageAsset | null) => void;
  onGallery: (gallery: GalleryImage[]) => void;
  folder: string;
  onUploaded: (path: string) => void;
  errors: Errors;
}) {
  return (
    <FormSection
      title="Photos (optional)"
      description="The cover appears on the card and at the top of the page; photos appear in the page’s gallery. Without a cover the card shows a generated graphic, and an empty gallery is not shown. Photos stay private until you publish."
    >
      <ImageField label="Cover photo" value={cover} onChange={onCover} folder={folder} onUploaded={onUploaded} altError={errors['cover.alt']} allowUrl={false} />
      <div>
        <p className="mb-3 text-sm font-medium">Gallery</p>
        <GalleryField images={gallery} onChange={onGallery} folder={folder} onUploaded={onUploaded} errors={errors} />
      </div>
    </FormSection>
  );
}

function checkPhotos(v: ReturnType<typeof validator>, d: { cover: ImageAsset | null; gallery: GalleryImage[] }) {
  v.check(!d.cover || Boolean(d.cover.alt.trim()), 'cover.alt', 'Describe the cover photo.');
  d.gallery.forEach((img, i) => v.check(Boolean(img.alt.trim()), `gallery.${i}.alt`, 'Describe this photo.'));
}

const cleanPhotos = (d: { cover: ImageAsset | null; gallery: GalleryImage[] }) => ({
  cover: d.cover ? { ...d.cover, alt: d.cover.alt.trim() } : null,
  gallery: d.gallery.map((g) => ({ ...g, alt: g.alt.trim(), caption: g.caption?.trim() || undefined, description: g.description?.trim() || undefined })),
});

// ------------------------------------------------------------------ Volunteering & Experience

function ExperienceFormFields({ data, update, errors, credentials, folder, onUploaded, isNew }: FormProps<V>) {
  return (
    <>
      <FormSection title="Role">
        <div className="grid gap-5 sm:grid-cols-[12rem_1fr]">
          <SelectField label="Type" value={data.type ?? 'volunteering'} onChange={(type) => update({ type })} options={experienceOptions} />
          <TextField
            label="Role"
            required
            value={data.role}
            onChange={(role) => update({ role, ...followSlug(data, data.role, role, isNew) })}
            error={errors.role}
            placeholder="e.g. Event Volunteer (Finance)"
          />
        </div>
        <TextField label="Organisation or event" required value={data.organisation} onChange={(organisation) => update({ organisation })} error={errors.organisation} placeholder="e.g. JamborIEEE 2025" />
        <TextField
          label="Page URL"
          required
          value={data.slug}
          onChange={(slug) => update({ slug })}
          error={errors.slug}
          hint={isNew ? `/experience/${data.slug || '…'}` : `/experience/${data.slug} — changing it breaks existing links to this page.`}
        />
        <TextField label="Term (optional)" value={data.term} onChange={(term) => update({ term })} placeholder="e.g. 2025/2026 term" hint="Shown instead of the dates when filled in." />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField label="Start (optional)" value={data.start} onChange={(start) => update({ start })} error={errors.start} placeholder="2025-04" hint="YYYY or YYYY-MM. Leave empty if unsure." />
          <TextField label="End (optional)" value={data.end} onChange={(end) => update({ end })} error={errors.end} placeholder="2026-01" hint="With a start date, leave empty for “Present”." />
        </div>
        <TextAreaField
          label="Contribution summary"
          rows={3}
          value={data.description}
          onChange={(description) => update({ description })}
          hint="A sentence or two for the card and the top of the page. Only add duties or outcomes you can support."
        />
        <StringListField label="Longer write-up (optional)" multiline values={data.recap ?? []} onChange={(recap) => update({ recap })} itemLabel="paragraph" addLabel="Add paragraph" hint="Shown on the role’s page." />
        <StringListField label="Highlights (optional)" values={data.highlights ?? []} onChange={(highlights) => update({ highlights })} itemLabel="highlight" addLabel="Add highlight" />
      </FormSection>
      <PhotosSection
        cover={data.cover ?? null}
        gallery={data.gallery ?? []}
        onCover={(cover) => update({ cover })}
        onGallery={(gallery) => update({ gallery })}
        folder={folder}
        onUploaded={onUploaded}
        errors={errors}
      />
      <FormSection title="Evidence (optional)" description="Shown on the role’s page.">
        <TextField label="Link (optional)" type="url" value={data.url} onChange={(url) => update({ url })} error={errors.url} placeholder="https://…" hint="E.g. a programme page or post about the role." />
        <CredentialPicker
          label="Attached certificates"
          hint={reuseHint}
          value={data.credentialIds ?? []}
          onChange={(credentialIds) => update({ credentialIds })}
          credentials={credentials}
          create={{ type: 'appreciation', inAchievements: true }}
        />
      </FormSection>
    </>
  );
}

export const volunteeringForm: FormDefinition<V> = {
  Form: ExperienceFormFields,
  validate(d, { takenSlugs }) {
    const v = validator();
    v.check(Boolean(d.role.trim()), 'role', 'Enter the role.');
    v.check(Boolean(d.organisation.trim()), 'organisation', 'Enter the organisation or event.');
    v.check(SLUG_PATTERN.test(d.slug ?? ''), 'slug', 'Use lowercase letters, numbers and single hyphens, e.g. event-volunteer.');
    v.check(!takenSlugs.includes(d.slug), 'slug', 'Another role already uses this URL.');
    v.date(d.start, 'start');
    v.date(d.end, 'end');
    v.url(d.url, 'url');
    checkPhotos(v, { cover: d.cover ?? null, gallery: d.gallery ?? [] });
    return v.errors;
  },
  prepare: (d) => ({
    ...d,
    type: d.type ?? 'volunteering',
    role: d.role.trim(),
    organisation: d.organisation.trim(),
    term: orNull(d.term),
    start: orNull(d.start),
    end: orNull(d.end),
    description: orNull(d.description),
    recap: cleanList(d.recap ?? []),
    highlights: cleanList(d.highlights ?? []),
    url: orNull(d.url),
    credentialIds: d.credentialIds ?? [],
    ...cleanPhotos({ cover: d.cover ?? null, gallery: d.gallery ?? [] }),
  }),
};

// ------------------------------------------------------------------ Events & Participation

function EventFormFields({ data, update, errors, credentials, folder, onUploaded, isNew }: FormProps<E>) {
  return (
    <>
      <FormSection title="Event">
        <div className="grid gap-5 sm:grid-cols-[12rem_1fr]">
          <SelectField label="Type" value={data.type ?? 'other'} onChange={(type) => update({ type })} options={eventOptions} />
          <TextField
            label="Event name"
            required
            value={data.title}
            onChange={(title) => update({ title, ...followSlug(data, data.title, title, isNew) })}
            error={errors.title}
            placeholder="e.g. YarlInsight 2.0"
          />
        </div>
        <TextField
          label="Page URL"
          required
          value={data.slug}
          onChange={(slug) => update({ slug })}
          error={errors.slug}
          hint={isNew ? `/events/${data.slug || '…'}` : `/events/${data.slug} — changing it breaks existing links to this page.`}
        />
        <div className="grid gap-5 sm:grid-cols-3">
          <TextField label="Organiser (optional)" value={data.organiser} onChange={(organiser) => update({ organiser })} hint="Leave empty if you’re not sure." />
          <TextField label="Location (optional)" value={data.location} onChange={(location) => update({ location })} placeholder="e.g. Jaffna" />
          <TextField label="Date (optional)" value={data.date} onChange={(date) => update({ date })} error={errors.date} placeholder="2026-02" hint="YYYY, YYYY-MM or YYYY-MM-DD." />
        </div>
        <TextAreaField label="Brief description" rows={3} value={data.description} onChange={(description) => update({ description })} hint="Shown on the card (about 3 lines) and at the top of the event’s page." />
        <StringListField label="Longer recap (optional)" multiline values={data.recap ?? []} onChange={(recap) => update({ recap })} itemLabel="paragraph" addLabel="Add paragraph" hint="Shown on the event’s page." />
      </FormSection>
      <PhotosSection
        cover={data.cover ?? null}
        gallery={data.gallery ?? []}
        onCover={(cover) => update({ cover })}
        onGallery={(gallery) => update({ gallery })}
        folder={folder}
        onUploaded={onUploaded}
        errors={errors}
      />
      <FormSection title="Link and certificate (optional)" description="Shown on the event’s page.">
        <TextField label="Event link (optional)" type="url" value={data.url} onChange={(url) => update({ url })} error={errors.url} placeholder="https://…" />
        <CredentialPicker
          label="Participation certificate"
          hint={reuseHint}
          value={data.credentialIds ?? []}
          onChange={(credentialIds) => update({ credentialIds })}
          credentials={credentials}
          create={{ type: 'event-participation', inAchievements: true }}
        />
      </FormSection>
    </>
  );
}

export const eventForm: FormDefinition<E> = {
  Form: EventFormFields,
  validate(d, { takenSlugs }) {
    const v = validator();
    v.check(Boolean(d.title.trim()), 'title', 'Enter the event name.');
    v.check(SLUG_PATTERN.test(d.slug ?? ''), 'slug', 'Use lowercase letters, numbers and single hyphens, e.g. yarlinsight-2.');
    v.check(!takenSlugs.includes(d.slug), 'slug', 'Another event already uses this URL.');
    v.date(d.date, 'date');
    v.url(d.url, 'url', 'The event link');
    checkPhotos(v, { cover: d.cover ?? null, gallery: d.gallery ?? [] });
    return v.errors;
  },
  prepare: (d) => ({
    ...d,
    type: d.type ?? 'other',
    title: d.title.trim(),
    organiser: orNull(d.organiser),
    location: orNull(d.location),
    date: orNull(d.date),
    description: orNull(d.description),
    recap: cleanList(d.recap ?? []),
    url: orNull(d.url),
    credentialIds: d.credentialIds ?? [],
    ...cleanPhotos({ cover: d.cover ?? null, gallery: d.gallery ?? [] }),
  }),
};
