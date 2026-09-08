import { LegalPage } from '@/components/legal-page';

const sections = [
  [
    'Information we use',
    'Readems uses the account, profile, preference, and reading information you provide to operate and personalize the service.',
  ],
  [
    'How it is protected',
    'We limit access to account information and use appropriate technical safeguards. Passwords are stored as secure hashes.',
  ],
  [
    'Your choices',
    'You can update profile visibility and reading preferences from Settings. You may also request account support from the Help page.',
  ],
] as const;

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro="How Readems handles account and reading information."
      sections={sections}
    />
  );
}
