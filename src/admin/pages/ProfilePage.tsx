import { ExternalLink } from 'lucide-react';
import { useLoaderData } from 'react-router-dom';
import type { Profile, SocialLink, SocialPlatform } from '@/types';
import { Button } from '@/components/ui/Button';
import { useAdmin } from '../AdminContext';
import { DocumentField, ImageField } from '../components/FileFields';
import { RepeatList } from '../components/RepeatList';
import { FormSection, SelectField, StringListField, TextAreaField, TextField } from '../components/fields';
import { cleanList, orNull } from '../lib/listUtils';
import { getEntry } from '../lib/api';
import { useEntryEditor } from '../lib/useEntryEditor';
import { validator } from '../lib/validation';
import { SaveStatus, UnsavedChangesDialog } from './EntryEditorPage';

export async function loader() {
  const row = await getEntry<Profile>('profile', 'profile');
  if (!row) throw new Error('The profile is missing from the database. Run the import migration (see SETUP.md).');
  return { profile: row.data };
}

const platforms: Array<{ value: SocialPlatform; label: string }> = [
  { value: 'github', label: 'GitHub' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'medium', label: 'Medium' },
  { value: 'email', label: 'Email' },
  { value: 'website', label: 'Website' },
];

function validate(p: Profile) {
  const v = validator();
  v.check(Boolean(p.name.trim()), 'name', 'Enter your name.');
  v.check(Boolean(p.headline.trim()), 'headline', 'Enter a headline.');
  v.check(Boolean(p.intro.trim()), 'intro', 'Enter the hero introduction.');
  v.check(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(p.email.trim()), 'email', 'Enter a valid email address.');
  v.check(!p.portrait || Boolean(p.portrait.alt.trim()), 'portrait.alt', 'Describe the photo.');
  p.socials.forEach((s, i) => {
    v.check(Boolean(s.label.trim()), `socials.${i}.label`, 'Add a label.');
    v.check(s.platform === 'email' ? /^mailto:\S+@\S+/.test(s.href.trim()) : /^https?:\/\/\S+\.\S+/.test(s.href.trim()), `socials.${i}.href`, s.platform === 'email' ? 'Use mailto:you@example.com' : 'Enter the full URL (https://…).');
  });
  return v.errors;
}

function prepare(p: Profile): Profile {
  // The old "Software development" block is no longer shown; drop it from saved data.
  const { developmentExperience: _removed, ...aboutFields } = p.about as Profile['about'] & { developmentExperience?: string };
  void _removed;
  return {
    ...p,
    name: p.name.trim(),
    headline: p.headline.trim(),
    supportingLine: p.supportingLine.trim(),
    intro: p.intro.trim(),
    availability: orNull(p.availability),
    email: p.email.trim(),
    focusAreas: cleanList(p.focusAreas),
    socials: p.socials.map((s) => ({ ...s, label: s.label.trim(), href: s.href.trim(), handle: s.handle.trim() })),
    portrait: p.portrait ? { ...p.portrait, alt: p.portrait.alt.trim() } : null,
    about: {
      ...aboutFields,
      intro: p.about.intro.trim(),
      academicBackground: (p.about.academicBackground ?? '').trim(),
      careerAspirations: p.about.careerAspirations.trim(),
      professionalInterests: cleanList(p.about.professionalInterests),
    },
  };
}

export function Component() {
  const { profile } = useLoaderData() as Awaited<ReturnType<typeof loader>>;
  const { refreshStatus } = useAdmin();
  const editor = useEntryEditor<Profile>({ collection: 'profile', id: 'profile', initial: profile, onSaved: refreshStatus });
  const { data, update, errors } = editor;
  const about = (patch: Partial<Profile['about']>) => update({ about: { ...data.about, ...patch } });
  const folder = 'profile/profile';

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Content</p>
          <h1 className="mt-2 text-3xl font-semibold">Profile</h1>
          <p className="mt-2 text-sm text-fg-muted">Your photo, hero and About text, public links and CV.</p>
        </div>
        <a href="/?preview=1" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline">
          Preview on site
          <ExternalLink className="size-3.5" aria-hidden />
        </a>
      </div>

      <form
        className="mt-8 space-y-6 pb-28"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          void editor.save(validate, prepare);
        }}
      >
        <FormSection title="Hero">
          <TextField label="Name" required value={data.name} onChange={(name) => update({ name })} error={errors.name} />
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField label="Headline" required value={data.headline} onChange={(headline) => update({ headline })} error={errors.headline} />
            <TextField label="Supporting line" value={data.supportingLine} onChange={(supportingLine) => update({ supportingLine })} />
          </div>
          <TextAreaField label="Introduction" required rows={3} value={data.intro} onChange={(intro) => update({ intro })} error={errors.intro} />
          <TextField label="Availability pill (optional)" value={data.availability} onChange={(availability) => update({ availability })} hint="Leave empty to hide it." />
          <ImageField
            label="Portrait photo"
            value={data.portrait}
            onChange={(portrait) => update({ portrait })}
            folder={folder}
            onUploaded={editor.trackUpload}
            altError={errors['portrait.alt']}
            allowUrl={false}
            aspect="aspect-[4/5] max-w-xs"
          />
        </FormSection>

        <FormSection title="About">
          <TextAreaField label="About introduction" rows={6} value={data.about.intro} onChange={(intro) => about({ intro })} />
          <TextAreaField
            label="Academic background (optional)"
            rows={3}
            value={data.about.academicBackground}
            onChange={(academicBackground) => about({ academicBackground })}
            hint="Leave empty to hide this row in the About panel."
          />
          <StringListField
            label="Professional interests"
            values={data.about.professionalInterests}
            onChange={(professionalInterests) => about({ professionalInterests })}
            itemLabel="interest"
            addLabel="Add interest"
          />
          <TextAreaField label="Career aspirations" rows={3} value={data.about.careerAspirations} onChange={(careerAspirations) => about({ careerAspirations })} />
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField label="Institution" value={data.institution} onChange={(institution) => update({ institution })} />
            <TextField label="Location" value={data.location} onChange={(location) => update({ location })} />
          </div>
        </FormSection>

        <FormSection title="Contact and links">
          <TextField label="Email for the contact form" type="email" required value={data.email} onChange={(email) => update({ email })} error={errors.email} />
          <RepeatList
            label="Public links"
            items={data.socials}
            onChange={(socials) => update({ socials })}
            create={(): SocialLink => ({ platform: 'website', label: '', href: 'https://', handle: '' })}
            itemLabel="Link"
            addLabel="Add link"
            render={(s, set, i) => (
              <>
                <SelectField label="Type" value={s.platform} onChange={(platform) => set({ platform })} options={platforms} />
                <TextField label="Label" value={s.label} onChange={(label) => set({ label })} error={errors[`socials.${i}.label`]} />
                <TextField label="URL" value={s.href} onChange={(href) => set({ href })} error={errors[`socials.${i}.href`]} />
                <TextField label="Shown as" value={s.handle} onChange={(handle) => set({ handle })} hint="e.g. github.com/username" />
              </>
            )}
          />
        </FormSection>

        <FormSection title="CV" description="Upload your CV as a PDF. The Download CV button is unavailable until a CV is published.">
          <DocumentField
            label="CV (PDF)"
            showLabel={false}
            value={data.cvUrl ? { label: 'CV', href: data.cvUrl } : null}
            onChange={(v) => update({ cvUrl: v?.href ?? null })}
            folder={folder}
            onUploaded={editor.trackUpload}
          />
        </FormSection>

        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-canvas/95 backdrop-blur">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-end gap-4 px-4 py-3 sm:px-6">
            <SaveStatus state={editor.state} dirty={editor.dirty} />
            <Button type="submit" size="sm" disabled={editor.state.kind === 'saving' || !editor.dirty}>
              Save profile
            </Button>
          </div>
        </div>
      </form>
      <UnsavedChangesDialog blocker={editor.blocker} />
    </div>
  );
}
