import { LegalPage } from '@/components/legal-page';

const sections = [
  [
    'Using Readems',
    'Use Readems to read, write, publish, and connect respectfully. Keep your account information accurate and protect your login details.',
  ],
  [
    'Your stories',
    'You retain ownership of the original stories you publish. You give Readems permission to display and distribute them through the service.',
  ],
  [
    'Community conduct',
    'Do not publish illegal, abusive, deceptive, or rights-infringing content. Accounts that harm readers or creators may be restricted.',
  ],
] as const;

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      intro="The basic rules for using the Readems reading and writing community."
      sections={sections}
    />
  );
}
