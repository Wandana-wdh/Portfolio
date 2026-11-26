import type { Article, ArticleCategory, ResearchProject, ResearchStatus, SkillGroup, SkillIcon } from '@/types';
import { researchStatusLabel } from '@/lib/labels';
import { ImageField } from '../components/FileFields';
import { CheckboxField, FormSection, SelectField, StringListField, TextAreaField, TextField } from '../components/fields';
import { cleanList, orNull } from '../lib/listUtils';
import type { EntryData } from '../lib/collections';
import { SLUG_PATTERN, validator } from '../lib/validation';
import { titlePatch } from './ProjectForm';
import type { FormDefinition, FormProps } from './types';

// ------------------------------------------------------------------ articles

type A = EntryData<Article>;

const categories: ArticleCategory[] = ['Cryptography', 'Software Engineering', 'Web Development', 'Cloud', 'Cybersecurity', 'Career'];

function ArticleFormFields({ data, update, errors, folder, onUploaded, isNew }: FormProps<A>) {
  return (
    <>
      <FormSection title="Article">
        <TextField label="Title" required value={data.title} onChange={(t) => update(titlePatch(data, t, isNew))} error={errors.title} />
        <TextAreaField label="Summary" required rows={3} value={data.excerpt} onChange={(excerpt) => update({ excerpt })} error={errors.excerpt} />
        <TextField
          label="Medium link"
          type="url"
          value={data.url}
          onChange={(url) => update({ url })}
          error={errors.url}
          placeholder="https://medium.com/@wandanaherath.wdh/…"
          hint="The direct story link. Leave empty to show “View my Medium profile” instead of “Read on Medium”."
        />
        <div className="grid gap-5 sm:grid-cols-3">
          <SelectField label="Category" value={data.category} onChange={(category) => update({ category })} options={categories.map((c) => ({ value: c, label: c }))} />
          <TextField label="Published (optional)" value={data.publishedAt} onChange={(publishedAt) => update({ publishedAt })} error={errors.publishedAt} placeholder="2026-11-25" />
          <TextField
            label="Reading time, minutes (optional)"
            type="number"
            value={data.readingMinutes?.toString() ?? ''}
            onChange={(v) => update({ readingMinutes: v ? Number(v) : null })}
            error={errors.readingMinutes}
          />
        </div>
        <TextField label="Page URL" required value={data.slug} onChange={(slug) => update({ slug })} error={errors.slug} hint={`/articles/${data.slug || '…'}`} />
        <StringListField label="Tags (optional)" values={data.tags} onChange={(tags) => update({ tags })} itemLabel="tag" addLabel="Add tag" />
      </FormSection>
      <FormSection title="Cover image">
        <ImageField label="Cover" value={data.cover} onChange={(cover) => update({ cover })} folder={folder} onUploaded={onUploaded} altError={errors['cover.alt']} aspect="aspect-[16/9]" />
      </FormSection>
    </>
  );
}

export const articleForm: FormDefinition<A> = {
  Form: ArticleFormFields,
  validate(d, { takenSlugs }) {
    const v = validator();
    v.check(Boolean(d.title.trim()), 'title', 'Enter a title.');
    v.check(Boolean(d.excerpt.trim()), 'excerpt', 'Enter a short summary.');
    v.check(SLUG_PATTERN.test(d.slug), 'slug', 'Use lowercase letters, numbers and single hyphens.');
    v.check(!takenSlugs.includes(d.slug), 'slug', 'Another article already uses this URL.');
    v.url(d.url, 'url', 'The Medium link');
    v.date(d.publishedAt, 'publishedAt');
    v.check(d.readingMinutes === null || (Number.isInteger(d.readingMinutes) && d.readingMinutes > 0), 'readingMinutes', 'Use a whole number of minutes.');
    v.check(!d.cover || Boolean(d.cover.alt.trim()), 'cover.alt', 'Describe the cover image.');
    return v.errors;
  },
  prepare: (d) => ({
    ...d,
    title: d.title.trim(),
    excerpt: d.excerpt.trim(),
    url: orNull(d.url),
    publishedAt: orNull(d.publishedAt),
    tags: cleanList(d.tags),
    cover: d.cover ? { ...d.cover, alt: d.cover.alt.trim() } : null,
  }),
};

// ------------------------------------------------------------------ research

type R = EntryData<ResearchProject>;

const statusOptions = (Object.keys(researchStatusLabel) as ResearchStatus[]).map((value) => ({ value, label: researchStatusLabel[value] }));

function ResearchFormFields({ data, update, errors, isNew }: FormProps<R>) {
  return (
    <>
      <FormSection title="Research">
        <div className="grid gap-5 sm:grid-cols-[1fr_14rem]">
          <TextField label="Title" required value={data.title} onChange={(t) => update(titlePatch(data, t, isNew))} error={errors.title} />
          <SelectField label="Status" value={data.status} onChange={(status) => update({ status })} options={statusOptions} />
        </div>
        <TextAreaField label="Short description" required rows={3} value={data.summary} onChange={(summary) => update({ summary })} error={errors.summary} hint="Shown on the Research page and at the top of the research page." />
        <StringListField label="Description paragraphs" multiline values={data.description} onChange={(description) => update({ description })} itemLabel="paragraph" addLabel="Add paragraph" />
        <StringListField label="Questions I’m exploring" values={data.questions} onChange={(questions) => update({ questions })} itemLabel="question" addLabel="Add question" />
        <StringListField label="Methodology (optional)" values={data.methodology} onChange={(methodology) => update({ methodology })} itemLabel="step" addLabel="Add step" />
      </FormSection>
      <FormSection title="Details">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField label="Institution" value={data.institution} onChange={(institution) => update({ institution })} />
          <TextField label="Supervisor (optional)" value={data.supervisor} onChange={(supervisor) => update({ supervisor })} />
        </div>
        <TextField label="Started (optional)" value={data.startDate} onChange={(startDate) => update({ startDate })} error={errors.startDate} placeholder="2025-06" />
        <StringListField label="Research areas" values={data.areas} onChange={(areas) => update({ areas })} itemLabel="area" addLabel="Add area" />
        <StringListField label="Tags" values={data.tags} onChange={(tags) => update({ tags })} itemLabel="tag" addLabel="Add tag" />
        <TextField label="Page URL" required value={data.slug} onChange={(slug) => update({ slug })} error={errors.slug} hint={`/research/${data.slug || '…'}`} />
      </FormSection>
    </>
  );
}

export const researchForm: FormDefinition<R> = {
  Form: ResearchFormFields,
  validate(d, { takenSlugs }) {
    const v = validator();
    v.check(Boolean(d.title.trim()), 'title', 'Enter a title.');
    v.check(Boolean(d.summary.trim()), 'summary', 'Enter a short description.');
    v.check(SLUG_PATTERN.test(d.slug), 'slug', 'Use lowercase letters, numbers and single hyphens.');
    v.check(!takenSlugs.includes(d.slug), 'slug', 'Another research entry already uses this URL.');
    v.date(d.startDate, 'startDate');
    return v.errors;
  },
  prepare: (d) => ({
    ...d,
    title: d.title.trim(),
    summary: d.summary.trim(),
    description: cleanList(d.description),
    questions: cleanList(d.questions),
    methodology: cleanList(d.methodology),
    areas: cleanList(d.areas),
    tags: cleanList(d.tags),
    supervisor: orNull(d.supervisor),
    startDate: orNull(d.startDate),
  }),
};

// ------------------------------------------------------------------ skills

type S = EntryData<SkillGroup>;

const iconOptions: Array<{ value: SkillIcon; label: string }> = [
  { value: 'code', label: 'Code' },
  { value: 'layout', label: 'Layout (frontend)' },
  { value: 'server', label: 'Server (backend)' },
  { value: 'database', label: 'Database' },
  { value: 'cloud', label: 'Cloud' },
  { value: 'test', label: 'Checklist (testing)' },
  { value: 'wrench', label: 'Wrench (tools)' },
];

function SkillFormFields({ data, update, errors }: FormProps<S>) {
  return (
    <FormSection title="Skill group">
      <div className="grid gap-5 sm:grid-cols-[1fr_14rem]">
        <TextField label="Title" required value={data.title} onChange={(title) => update({ title })} error={errors.title} />
        <SelectField label="Icon" value={data.icon} onChange={(icon) => update({ icon })} options={iconOptions} />
      </div>
      <TextField label="Description" value={data.description} onChange={(description) => update({ description })} />
      <StringListField label="Skills" values={data.skills} onChange={(skills) => update({ skills })} itemLabel="skill" addLabel="Add skill" />
      <CheckboxField label="Highlight this group" checked={Boolean(data.emphasised)} onChange={(emphasised) => update({ emphasised: emphasised || undefined })} hint="Spans two columns on wide screens." />
    </FormSection>
  );
}

export const skillForm: FormDefinition<S> = {
  Form: SkillFormFields,
  validate(d) {
    const v = validator();
    v.check(Boolean(d.title.trim()), 'title', 'Enter a title.');
    return v.errors;
  },
  prepare: (d) => ({ ...d, title: d.title.trim(), description: d.description.trim(), skills: cleanList(d.skills) }),
};
