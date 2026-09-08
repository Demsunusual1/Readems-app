import { LegalPage } from '@/components/legal-page';

const sections = [
  [
    'Account access',
    'If you cannot sign in, confirm your email address and password, then try again. Password recovery will be added before public launch.',
  ],
  [
    'Reading and publishing',
    'Readers can discover stories, manage their library, and save progress. Creators can create stories, edit chapters, and manage publishing.',
  ],
  [
    'Need more help?',
    'Contact the Readems team with the email address connected to your account and a short description of the issue.',
  ],
] as const;

export default function HelpPage() {
  return (
    <LegalPage
      title="Help & Support"
      intro="Guidance for your Readems account, reading, and publishing experience."
      sections={sections}
    />
  );
}
