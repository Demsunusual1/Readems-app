'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/auth';
import {
  blockPerson,
  changePassword,
  revokeSession,
  saveProfile,
  saveSettings,
  unblockPerson,
} from '@/lib/settings';

export type SettingsResult = { ok: boolean; message?: string };

async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error('Sign in to change your settings.');
  return user;
}

function failure(error: unknown): SettingsResult {
  return {
    ok: false,
    message:
      error instanceof Error ? error.message : 'That did not work. Try again.',
  };
}

export async function updateProfile(
  _previous: SettingsResult | null,
  formData: FormData,
): Promise<SettingsResult> {
  try {
    const user = await requireUser();
    await saveProfile(user.id, {
      fullName: String(formData.get('fullName') ?? ''),
      bio: String(formData.get('bio') ?? ''),
    });
    revalidatePath('/settings');
    return { ok: true, message: 'Profile saved.' };
  } catch (error) {
    return failure(error);
  }
}

export async function updatePreferences(
  _previous: SettingsResult | null,
  formData: FormData,
): Promise<SettingsResult> {
  try {
    const user = await requireUser();
    await saveSettings(user.id, {
      theme: String(formData.get('theme') ?? 'system') as
        | 'system'
        | 'light'
        | 'dark',
      language: String(formData.get('language') ?? 'English'),
      emailNotifications: formData.get('emailNotifications') === 'on',
      profilePublic: formData.get('profilePublic') === 'on',
      showReadingActivity: formData.get('showReadingActivity') === 'on',
    });
    revalidatePath('/settings');
    return { ok: true, message: 'Preferences saved.' };
  } catch (error) {
    return failure(error);
  }
}

export async function updatePassword(
  _previous: SettingsResult | null,
  formData: FormData,
): Promise<SettingsResult> {
  try {
    const user = await requireUser();
    await changePassword(
      user.id,
      String(formData.get('current') ?? ''),
      String(formData.get('next') ?? ''),
    );
    return { ok: true, message: 'Password changed.' };
  } catch (error) {
    return failure(error);
  }
}

export async function endSession(sessionId: string): Promise<SettingsResult> {
  try {
    const user = await requireUser();
    await revokeSession(user.id, sessionId);
    revalidatePath('/settings');
    return { ok: true };
  } catch (error) {
    return failure(error);
  }
}

export async function blockSomebody(
  _previous: SettingsResult | null,
  formData: FormData,
): Promise<SettingsResult> {
  try {
    const user = await requireUser();
    const username = String(formData.get('username') ?? '')
      .trim()
      .replace(/^@/, '');
    const { prisma } = await import('@/lib/prisma');
    const target = await prisma.user.findUnique({ where: { username } });
    if (!target) throw new Error('No account with that username.');
    await blockPerson(user.id, target.id);
    revalidatePath('/settings');
    return { ok: true, message: `${target.fullName} is blocked.` };
  } catch (error) {
    return failure(error);
  }
}

export async function unblockSomebody(
  personId: string,
): Promise<SettingsResult> {
  try {
    const user = await requireUser();
    await unblockPerson(user.id, personId);
    revalidatePath('/settings');
    return { ok: true };
  } catch (error) {
    return failure(error);
  }
}
