import type { EventEntry, ExperienceType, TimelineEntry, TimelineKind, VolunteeringEntry } from '@/types';
import { experienceTypeLabel, timelineKindLabel } from '@/lib/labels';
import { CredentialPicker } from '../components/CredentialPicker';
import { FormSection, SelectField, StringListField, TextAreaField, TextField } from '../components/fields';
import { cleanList, orNull } from '../lib/listUtils';
import type { EntryData } from '../lib/collections';
import { validator } from '../lib/validation';
import type { FormDefinition, FormProps } from './types';

type T = EntryData<TimelineEntry>;
type V = EntryData<VolunteeringEntry>;
type E = EntryData<EventEntry>;

const kindOptions = (Object.keys(timelineKindLabel) as TimelineKind[]).map((value) => ({ value, label: timelineKindLabel[value] }));
const experienceOptions = (Object.keys(experienceTypeLabel) as ExperienceType[]).map((value) => ({ value, label: experienceTypeLabel[value] }));

const reuseHint = 'Tick an existing certificate, or add a new one with its file. A certificate is one shared record — replace its file once in Certificates and every place it’s attached updates.';

// ------------------------------------------------------------------ Education

function EducationFormFields({ data, update, errors, credentials }: FormProps<T>) {
  return (
    <>
      <FormSection title="Education">
        <div className="grid gap-5 sm:grid-cols-[12rem_1fr]">
          <SelectField label="Level" value={data.kind === 'education' ? 'education' : 'school'} onChange={(kind) => update({ kind })} options={kindOptions} />
          <TextField label="Title" required value={data.title} onChange={(title) => update({ title })} error={errors.title} placeholder="e.g. GCE Advanced Level (A/L)" />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField label="Institution (optional)" value={data.organisation} onChange={(organisation) => update({ organisation })} placeholder="e.g. University of Jaffna" />
          <TextField label="Location (optional)" value={data.location} onChange={(location) => update({ location })} />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField label="Start (optional)" value={data.start} onChange={(start) => update({ start })} error={errors.start} placeholder="2023" hint="YYYY or YYYY-MM. Leave empty if unsure." />
          <TextField label="End (optional)" value={data.end} onChange={(end) => update({ end })} error={errors.end} hint="With a start date, leave empty for “Present”." />
        </div>
        <TextAreaField label="Short description (optional)" rows={3} value={data.description} onChange={(description) => update({ description })} />
        <StringListField label="Highlights (optional)" values={data.highlights} onChange={(highlights) => update({ highlights })} itemLabel="highlight" addLabel="Add highlight" />
      </FormSection>
      <FormSection
        title="Certificate or results document (optional)"
        description="The site shows a “View certificate” button only when the attached certificate has a file. Turn off “List on the Achievements page” for school certificates so they appear only under Education."
      >
        <CredentialPicker
          label="Attached certificates"
          hint={reuseHint}
          value={data.credentialIds}
          onChange={(credentialIds) => update({ credentialIds })}
          credentials={credentials}
          create={{ type: 'certificate', inAchievements: false }}
        />
      </FormSection>
    </>
  );
}

export const timelineForm: FormDefinition<T> = {
  Form: EducationFormFields,
  validate(d) {
    const v = validator();
    v.check(Boolean(d.title.trim()), 'title', 'Enter a title.');
    v.date(d.start, 'start');
    v.date(d.end, 'end');
    return v.errors;
  },
  prepare: (d) => ({
    ...d,
    kind: d.kind === 'education' ? 'education' : 'school',
    title: d.title.trim(),
    organisation: orNull(d.organisation),
    location: orNull(d.location),
    start: orNull(d.start),
    end: orNull(d.end),
    description: orNull(d.description),
    highlights: cleanList(d.highlights ?? []),
    credentialIds: d.credentialIds ?? [],
  }),
};

// ------------------------------------------------------------------ Volunteering & Experience

function ExperienceFormFields({ data, update, errors, credentials }: FormProps<V>) {
  return (
    <>
      <FormSection title="Role">
        <div className="grid gap-5 sm:grid-cols-[12rem_1fr]">
          <SelectField label="Type" value={data.type ?? 'volunteering'} onChange={(type) => update({ type })} options={experienceOptions} />
          <TextField label="Role" required value={data.role} onChange={(role) => update({ role })} error={errors.role} placeholder="e.g. Finance Committee Member" />
        </div>
        <TextField label="Organisation" required value={data.organisation} onChange={(organisation) => update({ organisation })} error={errors.organisation} />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField label="Start (optional)" value={data.start} onChange={(start) => update({ start })} error={errors.start} placeholder="2025-04" hint="YYYY or YYYY-MM. Leave empty if unsure." />
          <TextField label="End (optional)" value={data.end} onChange={(end) => update({ end })} error={errors.end} placeholder="2026-01" hint="With a start date, leave empty for “Present”." />
        </div>
        <TextAreaField
          label="Contribution (optional)"
          rows={3}
          value={data.description}
          onChange={(description) => update({ description })}
          hint="A short description of what you did. Only add duties or outcomes you can support."
        />
        <StringListField label="Highlights (optional)" values={data.highlights ?? []} onChange={(highlights) => update({ highlights })} itemLabel="highlight" addLabel="Add highlight" />
      </FormSection>
      <FormSection title="Evidence (optional)">
        <TextField
          label="Link (optional)"
          type="url"
          value={data.url}
          onChange={(url) => update({ url })}
          error={errors.url}
          placeholder="https://…"
          hint="E.g. a programme page or post about the role."
        />
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
  validate(d) {
    const v = validator();
    v.check(Boolean(d.role.trim()), 'role', 'Enter the role.');
    v.check(Boolean(d.organisation.trim()), 'organisation', 'Enter the organisation.');
    v.date(d.start, 'start');
    v.date(d.end, 'end');
    v.url(d.url, 'url');
    return v.errors;
  },
  prepare: (d) => ({
    ...d,
    type: d.type ?? 'volunteering',
    role: d.role.trim(),
    organisation: d.organisation.trim(),
    start: orNull(d.start),
    end: orNull(d.end),
    description: orNull(d.description),
    highlights: cleanList(d.highlights ?? []),
    url: orNull(d.url),
    credentialIds: d.credentialIds ?? [],
  }),
};

// ------------------------------------------------------------------ Events & Participation

function EventFormFields({ data, update, errors, credentials }: FormProps<E>) {
  return (
    <>
      <FormSection title="Event">
        <TextField label="Event name" required value={data.title} onChange={(title) => update({ title })} error={errors.title} placeholder="e.g. Joomla CMS Training Workshop" />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField label="Organiser (optional)" value={data.organiser} onChange={(organiser) => update({ organiser })} hint="Leave empty if you’re not sure." />
          <TextField label="Date (optional)" value={data.date} onChange={(date) => update({ date })} error={errors.date} placeholder="2026-02" hint="YYYY, YYYY-MM or YYYY-MM-DD." />
        </div>
        <TextAreaField label="Short description (optional)" rows={3} value={data.description} onChange={(description) => update({ description })} />
      </FormSection>
      <FormSection title="Link and certificate (optional)">
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
  validate(d) {
    const v = validator();
    v.check(Boolean(d.title.trim()), 'title', 'Enter the event name.');
    v.date(d.date, 'date');
    v.url(d.url, 'url', 'The event link');
    return v.errors;
  },
  prepare: (d) => ({
    ...d,
    title: d.title.trim(),
    organiser: orNull(d.organiser),
    date: orNull(d.date),
    description: orNull(d.description),
    url: orNull(d.url),
    credentialIds: d.credentialIds ?? [],
  }),
};
