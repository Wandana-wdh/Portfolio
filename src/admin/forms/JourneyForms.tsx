import type { TimelineEntry, TimelineKind, VolunteeringEntry } from '@/types';
import { timelineKindLabel } from '@/lib/labels';
import { CredentialPicker } from '../components/CredentialPicker';
import { FormSection, SelectField, StringListField, TextAreaField, TextField } from '../components/fields';
import { cleanList, orNull } from '../lib/listUtils';
import type { EntryData } from '../lib/collections';
import { validator } from '../lib/validation';
import type { FormDefinition, FormProps } from './types';

type T = EntryData<TimelineEntry>;
type V = EntryData<VolunteeringEntry>;

const kindOptions = (Object.keys(timelineKindLabel) as TimelineKind[]).map((value) => ({ value, label: timelineKindLabel[value] }));

const attachHint =
  'Attach certificates from Certificates (add one there first). For a school certificate, turn off “List on the Achievements page” in its settings so it only appears here.';

function TimelineFormFields({ data, update, errors, credentials }: FormProps<T>) {
  return (
    <>
      <FormSection title="Milestone">
        <div className="grid gap-5 sm:grid-cols-[12rem_1fr]">
          <SelectField label="Type" value={data.kind} onChange={(kind) => update({ kind })} options={kindOptions} />
          <TextField label="Title" required value={data.title} onChange={(title) => update({ title })} error={errors.title} placeholder="e.g. GCE Advanced Level (A/L)" />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField label="School / organisation (optional)" value={data.organisation} onChange={(organisation) => update({ organisation })} />
          <TextField label="Location (optional)" value={data.location} onChange={(location) => update({ location })} />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField label="Start (optional)" value={data.start} onChange={(start) => update({ start })} error={errors.start} placeholder="2023" hint="YYYY or YYYY-MM." />
          <TextField label="End (optional)" value={data.end} onChange={(end) => update({ end })} error={errors.end} placeholder="Leave empty for “Present”" hint="Leave empty while ongoing." />
        </div>
        <TextAreaField label="Description (optional)" rows={3} value={data.description} onChange={(description) => update({ description })} />
        <StringListField label="Highlights (optional)" values={data.highlights} onChange={(highlights) => update({ highlights })} itemLabel="highlight" addLabel="Add highlight" />
      </FormSection>
      <FormSection title="Certificates">
        <CredentialPicker label="Attached certificates" hint={attachHint} value={data.credentialIds} onChange={(credentialIds) => update({ credentialIds })} credentials={credentials} />
      </FormSection>
    </>
  );
}

function VolunteeringFormFields({ data, update, errors, credentials }: FormProps<V>) {
  return (
    <>
      <FormSection title="Role">
        <TextField label="Role" required value={data.role} onChange={(role) => update({ role })} error={errors.role} placeholder="e.g. Finance Committee Member" />
        <TextField label="Organisation" required value={data.organisation} onChange={(organisation) => update({ organisation })} error={errors.organisation} />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField label="Start (optional)" value={data.start} onChange={(start) => update({ start })} error={errors.start} placeholder="2025-04" />
          <TextField label="End (optional)" value={data.end} onChange={(end) => update({ end })} error={errors.end} placeholder="2026-01" />
        </div>
        <TextAreaField
          label="Description (optional)"
          rows={3}
          value={data.description}
          onChange={(description) => update({ description })}
          hint="Only add duties or outcomes you can support."
        />
        <StringListField label="Highlights (optional)" values={data.highlights} onChange={(highlights) => update({ highlights })} itemLabel="highlight" addLabel="Add highlight" />
      </FormSection>
      <FormSection title="Certificates">
        <CredentialPicker label="Attached certificates" hint="E.g. the IEEE Certificate of Appreciation." value={data.credentialIds} onChange={(credentialIds) => update({ credentialIds })} credentials={credentials} />
      </FormSection>
    </>
  );
}

export const timelineForm: FormDefinition<T> = {
  Form: TimelineFormFields,
  validate(d) {
    const v = validator();
    v.check(Boolean(d.title.trim()), 'title', 'Enter a title.');
    v.date(d.start, 'start');
    v.date(d.end, 'end');
    return v.errors;
  },
  prepare: (d) => ({
    ...d,
    title: d.title.trim(),
    organisation: orNull(d.organisation),
    location: orNull(d.location),
    start: orNull(d.start),
    end: orNull(d.end),
    description: orNull(d.description),
    highlights: cleanList(d.highlights),
  }),
};

export const volunteeringForm: FormDefinition<V> = {
  Form: VolunteeringFormFields,
  validate(d) {
    const v = validator();
    v.check(Boolean(d.role.trim()), 'role', 'Enter the role.');
    v.check(Boolean(d.organisation.trim()), 'organisation', 'Enter the organisation.');
    v.date(d.start, 'start');
    v.date(d.end, 'end');
    return v.errors;
  },
  prepare: (d) => ({
    ...d,
    role: d.role.trim(),
    organisation: d.organisation.trim(),
    start: orNull(d.start),
    end: orNull(d.end),
    description: orNull(d.description),
    highlights: cleanList(d.highlights),
  }),
};
