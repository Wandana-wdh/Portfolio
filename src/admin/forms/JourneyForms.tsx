import type { TimelineEntry, TimelineKind } from '@/types';
import { timelineKindLabel } from '@/lib/labels';
import { CredentialPicker } from '../components/CredentialPicker';
import { FormSection, SelectField, StringListField, TextAreaField, TextField } from '../components/fields';
import { cleanList, orNull } from '../lib/listUtils';
import type { EntryData } from '../lib/collections';
import { validator } from '../lib/validation';
import { educationStatusOptions } from '../lib/statusOptions';
import type { FormDefinition, FormProps } from './types';

type T = EntryData<TimelineEntry>;

const kindOptions = (Object.keys(timelineKindLabel) as TimelineKind[]).map((value) => ({ value, label: timelineKindLabel[value] }));

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
        <SelectField
          label="Status"
          value={data.status === 'completed' ? 'completed' : ''}
          onChange={(status) => update({ status: status || null })}
          options={educationStatusOptions}
          hint="Completed shows a check-circle badge. Leave it unset for current study — the dates already show “Present”."
        />
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
    status: d.status === 'completed' ? 'completed' : null,
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
