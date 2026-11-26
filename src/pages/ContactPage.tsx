import { Briefcase, FolderGit2, Users } from 'lucide-react';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { useProfile } from '@/hooks/useProfile';
import { ContactForm } from '@/components/contact/ContactForm';
import { ContactLinks } from '@/components/contact/ContactLinks';
import { Section } from '@/components/ui/Container';
import { PageHeader } from '@/components/ui/PageHeader';
import { Reveal } from '@/components/ui/Reveal';

const reasons = [
  { icon: Briefcase, title: 'Internships', text: 'Software and IT internship opportunities.' },
  { icon: FolderGit2, title: 'Projects', text: 'Collaborating on software projects and ideas.' },
  { icon: Users, title: 'Community', text: 'Fellow students, mentors and tech communities.' },
];

export default function ContactPage() {
  const profile = useProfile();
  useDocumentMeta({
    title: 'Contact',
    description: `Get in touch with ${profile.name} about software and IT internships or projects.`,
  });

  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Let’s start a conversation"
        description="Whether you are a recruiter, researcher, potential collaborator or fellow student, I would be glad to hear from you."
      />

      <Section className="pt-14 sm:pt-16 lg:pt-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div className="space-y-10">
            <Reveal>
              <h2 className="font-mono text-xs uppercase tracking-[0.16em] text-fg-subtle">Reach me directly</h2>
              <div className="mt-4">
                <ContactLinks profile={profile} />
              </div>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="font-mono text-xs uppercase tracking-[0.16em] text-fg-subtle">Happy to talk about</h2>
              <ul className="mt-4 space-y-4">
                {reasons.map((r) => (
                  <li key={r.title} className="flex gap-4">
                    <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
                      <r.icon className="size-5" aria-hidden />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold">{r.title}</span>
                      <span className="block text-sm text-fg-muted">{r.text}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
          <Reveal delay={0.1}>
            <ContactForm to={profile.email} />
          </Reveal>
        </div>
      </Section>
    </>
  );
}
