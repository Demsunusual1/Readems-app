'use server';

import { revalidatePath } from 'next/cache';
import type {
  AccountStatus,
  AdminRole,
  DealStatus,
  ReportTarget,
} from '@prisma/client';
import { getCurrentUser } from '@/lib/auth';
import {
  assignReport,
  createDeal,
  fileReport,
  resolveReport,
  setAccountStatus,
  setAdminRole,
  updateDealStatus,
  type ResolveAction,
} from '@/lib/admin';

export type AdminResult = { ok: boolean; message?: string };

async function requireSignedIn() {
  const user = await getCurrentUser();
  if (!user) throw new Error('Sign in first.');
  return user;
}

function failure(error: unknown): AdminResult {
  return {
    ok: false,
    message:
      error instanceof Error ? error.message : 'That did not work. Try again.',
  };
}

export async function changeAdminRole(
  userId: string,
  role: AdminRole,
): Promise<AdminResult> {
  try {
    const actor = await requireSignedIn();
    await setAdminRole(actor.id, userId, role);
    revalidatePath('/admin/users');
    return { ok: true, message: 'Role updated.' };
  } catch (error) {
    return failure(error);
  }
}

export async function changeAccountStatus(
  userId: string,
  status: AccountStatus,
): Promise<AdminResult> {
  try {
    const actor = await requireSignedIn();
    await setAccountStatus(actor.id, userId, status);
    revalidatePath('/admin/users');
    return {
      ok: true,
      message: status === 'SUSPENDED' ? 'Account suspended.' : 'Account back.',
    };
  } catch (error) {
    return failure(error);
  }
}

export async function takeReport(
  reportId: string,
  assigneeId: string,
): Promise<AdminResult> {
  try {
    const actor = await requireSignedIn();
    await assignReport(actor.id, reportId, assigneeId || null);
    revalidatePath('/admin/moderation');
    return { ok: true, message: assigneeId ? 'Assigned.' : 'Unassigned.' };
  } catch (error) {
    return failure(error);
  }
}

export async function decideReport(
  reportId: string,
  action: ResolveAction,
): Promise<AdminResult> {
  try {
    const actor = await requireSignedIn();
    await resolveReport(actor.id, reportId, action);
    // Restricting or removing content changes what readers see, so the public
    // pages have to be rebuilt as well as the queue.
    revalidatePath('/admin/moderation');
    revalidatePath('/admin');
    revalidatePath('/discover');
    revalidatePath('/community');
    return { ok: true, message: 'Report resolved.' };
  } catch (error) {
    return failure(error);
  }
}

export async function addDeal(
  _previous: AdminResult | null,
  formData: FormData,
): Promise<AdminResult> {
  try {
    const actor = await requireSignedIn();
    const dollars = Number(formData.get('value') ?? 0);
    if (!Number.isFinite(dollars) || dollars < 0)
      throw new Error('Enter the deal value in whole dollars.');
    await createDeal(actor.id, {
      name: String(formData.get('name') ?? ''),
      sponsor: String(formData.get('sponsor') ?? ''),
      category: String(formData.get('category') ?? ''),
      region: String(formData.get('region') ?? ''),
      valueCents: Math.round(dollars * 100),
      creatorSlots: Number(formData.get('creatorSlots') ?? 0),
      status: (formData.get('status') as DealStatus) || 'DRAFT',
    });
    revalidatePath('/admin/deals');
    return { ok: true, message: 'Deal created.' };
  } catch (error) {
    return failure(error);
  }
}

export async function changeDealStatus(
  dealId: string,
  status: DealStatus,
): Promise<AdminResult> {
  try {
    const actor = await requireSignedIn();
    await updateDealStatus(actor.id, dealId, status);
    revalidatePath('/admin/deals');
    return { ok: true, message: 'Deal updated.' };
  } catch (error) {
    return failure(error);
  }
}

export async function submitReport(
  targetType: ReportTarget,
  targetId: string,
  _previous: AdminResult | null,
  formData: FormData,
): Promise<AdminResult> {
  try {
    const user = await requireSignedIn();
    await fileReport(user.id, {
      targetType,
      targetId,
      reason: String(formData.get('reason') ?? ''),
      details: String(formData.get('details') ?? ''),
    });
    revalidatePath('/admin/moderation');
    return { ok: true, message: 'Thank you. A moderator will look at this.' };
  } catch (error) {
    return failure(error);
  }
}
