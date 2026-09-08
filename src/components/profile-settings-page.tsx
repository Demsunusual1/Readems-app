'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import {
  Bell,
  CaretRight,
  CheckCircle,
  DownloadSimple,
  GlobeHemisphereWest,
  LockSimple,
  PaintBrush,
  PencilSimple,
  Question,
  ShieldCheck,
  SignOut,
  User,
  UserMinus,
} from '@phosphor-icons/react';
import './profile-settings-page.css';

const settings = [
  ['Account', 'Personal information and email', User, 'blue', '#account'],
  [
    'Appearance & Reading Theme',
    'Customize look and reading experience',
    PaintBrush,
    'purple',
    '#appearance',
  ],
  [
    'Notifications',
    'Manage emails and push preferences',
    Bell,
    'blue',
    '/notifications',
  ],
  [
    'Privacy',
    'Control your privacy settings',
    ShieldCheck,
    'purple',
    '#privacy',
  ],
  [
    'Blocked Users',
    'Manage users you’ve blocked',
    UserMinus,
    'navy',
    '#blocked-users',
  ],
  [
    'Language',
    'Choose your preferred language',
    GlobeHemisphereWest,
    'blue',
    '#language',
  ],
  [
    'Downloads & Storage',
    'Manage offline content and storage',
    DownloadSimple,
    'purple',
    '#downloads',
  ],
  [
    'Security',
    'Password, 2FA, and login activity',
    LockSimple,
    'blue',
    '#security',
  ],
  [
    'Help & Support',
    'Get help and contact support',
    Question,
    'purple',
    '#support',
  ],
] as const;

export function ProfileSettingsPage({
  user,
}: {
  user: {
    fullName: string;
    email: string;
    role: string;
    avatarUrl: string | null;
  };
}) {
  const [dark, setDark] = useState(false);
  const avatar = user.avatarUrl || '/readems/community-daniel.png';
  const role =
    user.role === 'CREATOR'
      ? 'Verified Creator'
      : user.role === 'BOTH'
        ? 'Creator & Reader'
        : 'Reader';

  return (
    <main className={`profile-settings-page ${dark ? 'dark-theme' : ''}`}>
      <section className="profile-settings-hero">
        <div className="profile-constellation" />
        <Link
          className="profile-home"
          href={
            user.role === 'CREATOR' ? '/creator/dashboard' : '/reader/dashboard'
          }
          aria-label="Readems home"
        >
          <Image src="/readems/logo.png" alt="Readems" width={62} height={62} />
        </Link>
        <h1>Profile &amp; Settings</h1>
        <p>
          Manage your account, preferences,
          <br />
          and reading experience
        </p>
        <span className="profile-quill" aria-hidden="true">
          ❯
        </span>
      </section>

      <section className="profile-settings-body">
        <article className="profile-identity-card">
          <Image src={avatar} alt="" width={132} height={132} unoptimized />
          <div>
            <h2>
              {user.fullName || 'Daniel Effiong'} <CheckCircle weight="fill" />
            </h2>
            <p>{user.email}</p>
            <span>{role}</span>
          </div>
          <a href="#account">
            <PencilSimple /> Edit
          </a>
        </article>

        <section className="profile-setting-list" aria-label="Profile settings">
          {settings.map(([title, description, Icon, tone, href]) => (
            <Link
              href={href}
              key={title}
              id={href.startsWith('#') ? href.slice(1) : undefined}
              onClick={
                title === 'Appearance & Reading Theme'
                  ? (event) => {
                      event.preventDefault();
                      setDark((value) => !value);
                    }
                  : undefined
              }
            >
              <span className={`profile-setting-icon ${tone}`}>
                <Icon />
              </span>
              <span className="profile-setting-copy">
                <strong>{title}</strong>
                <small>{description}</small>
              </span>
              {title === 'Appearance & Reading Theme' && (
                <i className="theme-indicator" />
              )}
              {title === 'Language' && <em>English</em>}
              <CaretRight className="profile-setting-caret" />
            </Link>
          ))}
          <form action="/api/logout" method="post">
            <button type="submit">
              <span className="profile-setting-icon logout">
                <SignOut />
              </span>
              <span className="profile-setting-copy">
                <strong>Logout</strong>
                <small>Sign out of your account</small>
              </span>
              <CaretRight className="profile-setting-caret" />
            </button>
          </form>
        </section>

        <footer className="profile-settings-footer">
          <span>✎</span>
          <div>
            <strong>Read. Write. Inspire.</strong>
            <small>A global community of readers and writers.</small>
          </div>
        </footer>
      </section>
    </main>
  );
}
