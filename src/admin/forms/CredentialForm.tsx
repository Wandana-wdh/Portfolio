import type { Credential, CredentialType } from '@/types';
import { credentialTypeLabel } from '@/lib/labels';
import { DocumentField, ImageField } from '../components/FileFields';
import { RepeatList } from '../components/RepeatList';
import { CheckboxField, FormSection, SelectField, TextAreaField, TextField } from '../components/fields';
import { orNull } from '../lib/listUtils';
import type { EntryData } from '../lib/collections';
import { validator } from '../lib/validation';
import type { FormDefinition, FormProps } from './types';

type C = EntryData<Credential>;

const typeOptions = (Object.keys(credentialTypeLabel) as CredentialType[]).map((value) => ({ value, label: credentialTypeLabel[value] }));

function Form({ data, update, errors, folder, onUploaded }: FormProps<C>) {
  return (
    <>
      <FormSection title="Details">
        <TextField label="Title" required value={data.title} onChange={(title) => update({ title })} error={errors.title} />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField label="Issuer" required value={data.issuer} onChange={(issuer) => update({ issuer })} error={errors.issuer} placeholder="e.g. Postman" />
          <SelectField label="Type" value={data.type} onChange={(type) => update({ type })} options={typeOptions} />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField label="Issue date" value={data.issueDate} onChange={(issueDate) => update({ issueDate })} error={errors.issueDate} placeholder="2025-10" hint="YYYY, YYYY-MM or YYYY-MM-DD." />
          <TextField label="Credential ID (optional)" value={data.credentialId} onChange={(credentialId) => update({ credentialId })} />
        </div>
        <TextField
          label="Verification link (optional)"
          type="url"
          value={data.verifyUrl}
          onChange={(verifyUrl) => update({ verifyUrl })}
          error={errors.verifyUrl}
          placeholder="https://…"
          hint="The official page that proves the credential — not an image link."
        />
        <TextAreaField label="Note (optional)" rows={2} value={data.note} onChange={(note) => update({ note })} />
        <CheckboxField
          label="List on the Achievements page"
          checked={data.inAchievements}
          onChange={(inAchievements) => update({ inAchievements })}
          hint="Turn off for certificates that should only appear where they are attached (e.g. a school certificate in My Journey)."
        />
      </FormSection>

      <FormSection title="Certificate file" description="Upload a PDF or image of the certificate. It stays private until you publish, and is removed from the public site if you hide or delete this certificate and publish.">
        <DocumentField
          label="Certificate document"
          value={data.document}
          onChange={(document) => update({ document })}
          folder={folder}
          onUploaded={onUploaded}
          kinds={['pdf', 'image']}
          defaultLabel="View certificate"
          labelError={errors['document.label']}
        />
        <ImageField
          label="Badge or preview image (optional)"
          hint="Shown on the certificate card. Upload one or paste a link to an official badge image."
          value={data.image}
          onChange={(image) => update({ image })}
          folder={folder}
          onUploaded={onUploaded}
          altError={errors['image.alt']}
          aspect="aspect-[2/1]"
        />
      </FormSection>

      <FormSection title="Included courses (optional)" description="For specializations — shown as an expandable list under the certificate.">
        <RepeatList
          label="Courses"
          items={data.courses}
          onChange={(courses) => update({ courses })}
          create={() => ({ title: '', issueDate: null, credentialId: null, verifyUrl: null })}
          itemLabel="Course"
          addLabel="Add course"
          render={(course, set, i) => (
            <>
              <TextField label="Course title" value={course.title} onChange={(title) => set({ title })} error={errors[`courses.${i}.title`]} className="sm:col-span-2" />
              <TextField label="Verification link" type="url" value={course.verifyUrl} onChange={(verifyUrl) => set({ verifyUrl })} error={errors[`courses.${i}.verifyUrl`]} />
              <TextField label="Credential ID" value={course.credentialId} onChange={(credentialId) => set({ credentialId })} />
            </>
          )}
        />
      </FormSection>
    </>
  );
}

export const credentialForm: FormDefinition<C> = {
  Form,
  validate(d) {
    const v = validator();
    v.check(Boolean(d.title.trim()), 'title', 'Enter a title.');
    v.check(Boolean(d.issuer.trim()), 'issuer', 'Enter who issued it.');
    v.date(d.issueDate, 'issueDate');
    v.url(d.verifyUrl, 'verifyUrl', 'The verification link');
    v.check(!d.image || Boolean(d.image.alt.trim()), 'image.alt', 'Describe the image.');
    v.check(!d.document || Boolean(d.document.label.trim()), 'document.label', 'Add link text.');
    d.courses.forEach((c, i) => {
      v.check(Boolean(c.title.trim()), `courses.${i}.title`, 'Enter the course title.');
      v.url(c.verifyUrl, `courses.${i}.verifyUrl`);
    });
    return v.errors;
  },
  prepare: (d) => ({
    ...d,
    title: d.title.trim(),
    issuer: d.issuer.trim(),
    issueDate: orNull(d.issueDate),
    credentialId: orNull(d.credentialId),
    verifyUrl: orNull(d.verifyUrl),
    note: orNull(d.note),
    image: d.image ? { ...d.image, alt: d.image.alt.trim() } : null,
    document: d.document ? { ...d.document, label: d.document.label.trim() } : null,
    courses: d.courses.map((c) => ({
      title: c.title.trim(),
      issueDate: orNull(c.issueDate),
      credentialId: orNull(c.credentialId),
      verifyUrl: orNull(c.verifyUrl),
    })),
  }),
};
