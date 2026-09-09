'use client';

import { useActionState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { Settings } from '@/lib/settings';
import {
  blockSomebody,
  endSession,
  unblockSomebody,
  updatePassword,
  updatePreferences,
  updateProfile,
} from '@/app/settings/actions';

const when = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'UTC',
});

export function SettingsSections({
  profile,
  settings,
  languages,
  sessions,
  blocked,
}: {
  profile: { fullName: string; bio: string; username: string };
  settings: Settings;
  languages: string[];
  sessions: { id: string; createdAt: string; expiresAt: string }[];
  blocked: { id: string; name: string; username: string }[];
}) {
  const [profileState, saveProfileAction] = useActionState(updateProfile, null);
  const [prefsState, savePrefs] = useActionState(updatePreferences, null);
  const [passwordState, savePassword] = useActionState(updatePassword, null);
  const [blockState, submitBlock] = useActionState(blockSomebody, null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <>
      <section className="settings-card">
        <h2>Account</h2>
        <p>Personal information shown on your profile.</p>
        <form action={saveProfileAction}>
          <label htmlFor="settings-name">Display name</label>
          <input
            id="settings-name"
            name="fullName"
            defaultValue={profile.fullName}
            required
            maxLength={80}
          />
          <label htmlFor="settings-bio">Short bio</label>
          <textarea
            id="settings-bio"
            name="bio"
            rows={3}
            maxLength={240}
            defaultValue={profile.bio}
          />
          <p className="settings-hint">
            Your link is readems.com/u/{profile.username}
          </p>
          <button type="submit">Save profile</button>
          {profileState?.message && (
            <p role="status" className={profileState.ok ? undefined : 'error'}>
              {profileState.message}
            </p>
          )}
        </form>
      </section>

      <section className="settings-card">
        <h2>Appearance, language and privacy</h2>
        <form action={savePrefs}>
          <label htmlFor="settings-theme">Reading theme</label>
          <select
            id="settings-theme"
            name="theme"
            defaultValue={settings.theme}
          >
            <option value="system">Match my device</option>
            <option value="light">Paper</option>
            <option value="dark">Night</option>
          </select>
          <p className="settings-hint">
            This sets how a chapter opens for you. The reader’s own theme button
            still changes it for the device you are on.
          </p>

          <label htmlFor="settings-language">Preferred language</label>
          <select
            id="settings-language"
            name="language"
            defaultValue={settings.language}
          >
            {languages.map((language) => (
              <option key={language} value={language}>
                {language}
              </option>
            ))}
          </select>
          <p className="settings-hint">
            Readems is written in English today. Your choice is stored for when
            more languages arrive.
          </p>

          <label className="settings-toggle">
            <input
              type="checkbox"
              name="profilePublic"
              defaultChecked={settings.profilePublic}
            />
            Show my profile to other readers
          </label>
          <label className="settings-toggle">
            <input
              type="checkbox"
              name="showReadingActivity"
              defaultChecked={settings.showReadingActivity}
            />
            Show what I am reading on my profile
          </label>
          <label className="settings-toggle">
            <input
              type="checkbox"
              name="emailNotifications"
              defaultChecked={settings.emailNotifications}
            />
            Email me about activity
          </label>
          <p className="settings-hint">
            No email provider is configured yet, so nothing is sent. The
            preference is kept for when it is.
          </p>

          <button type="submit">Save preferences</button>
          {prefsState?.message && (
            <p role="status" className={prefsState.ok ? undefined : 'error'}>
              {prefsState.message}
            </p>
          )}
        </form>
      </section>

      <section className="settings-card">
        <h2>Security</h2>
        <form action={savePassword}>
          <label htmlFor="current-password">Current password</label>
          <input
            id="current-password"
            name="current"
            type="password"
            autoComplete="current-password"
            required
          />
          <label htmlFor="new-password">New password</label>
          <input
            id="new-password"
            name="next"
            type="password"
            autoComplete="new-password"
            required
            minLength={12}
          />
          <button type="submit">Change password</button>
          {passwordState?.message && (
            <p role="status" className={passwordState.ok ? undefined : 'error'}>
              {passwordState.message}
            </p>
          )}
        </form>

        <h3>Signed in on</h3>
        <ul className="settings-sessions">
          {sessions.map((session) => (
            <li key={session.id}>
              <span>
                Started {when.format(new Date(session.createdAt))}
                <small>
                  Expires {when.format(new Date(session.expiresAt))}
                </small>
              </span>
              <button
                type="button"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    await endSession(session.id);
                    router.refresh();
                  })
                }
              >
                Sign out
              </button>
            </li>
          ))}
        </ul>
        <p className="settings-hint">
          Signing out a session ends it everywhere it was being used, including
          this one if it is the session you are using now.
        </p>
      </section>

      <section className="settings-card">
        <h2>Blocked users</h2>
        <p>
          Blocking ends any following between you and stops them following you
          again.
        </p>
        <form action={submitBlock}>
          <label htmlFor="block-username">Username to block</label>
          <input id="block-username" name="username" placeholder="username" />
          <button type="submit">Block</button>
          {blockState?.message && (
            <p role="status" className={blockState.ok ? undefined : 'error'}>
              {blockState.message}
            </p>
          )}
        </form>
        {blocked.length === 0 ? (
          <p className="settings-hint">You have not blocked anybody.</p>
        ) : (
          <ul className="settings-blocked">
            {blocked.map((person) => (
              <li key={person.id}>
                <span>
                  {person.name} <small>@{person.username}</small>
                </span>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      await unblockSomebody(person.id);
                      router.refresh();
                    })
                  }
                >
                  Unblock
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="settings-card">
        <h2>Downloads and storage</h2>
        <p>
          Offline reading is not available yet, so nothing is stored on this
          device and there is nothing to clear.
        </p>
      </section>
    </>
  );
}
