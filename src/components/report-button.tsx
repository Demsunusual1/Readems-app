'use client';

import { useActionState, useState } from 'react';
import { Flag } from '@phosphor-icons/react';
import type { ReportTarget } from '@prisma/client';
import { submitReport, type AdminResult } from '@/app/admin/actions';
import '@/components/admin.css';

const reasons = [
  'Spam',
  'Harassment',
  'Hate speech',
  'Misinformation',
  'Sexual content',
  'Violence',
  'Copyright',
  'Other',
];

export function ReportButton({
  targetType,
  targetId,
  signedIn,
  label = 'Report',
}: {
  targetType: ReportTarget;
  targetId: string;
  signedIn: boolean;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<AdminResult | null, FormData>(
    submitReport.bind(null, targetType, targetId),
    null,
  );

  return (
    <div className="report-control">
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen((was) => !was)}
      >
        <Flag />
      </button>
      {open && (
        <div className="report-panel">
          {signedIn ? (
            <form action={action}>
              <label>
                <span>What is wrong with this?</span>
                <select name="reason" defaultValue={reasons[0]}>
                  {reasons.map((reason) => (
                    <option key={reason}>{reason}</option>
                  ))}
                </select>
              </label>
              <label>
                <span>Anything else we should know? (optional)</span>
                <textarea name="details" rows={3} maxLength={2000} />
              </label>
              <button type="submit" disabled={pending}>
                {pending ? 'Sending…' : 'Send report'}
              </button>
              {state?.message && (
                <p role="status" className={state.ok ? undefined : 'is-error'}>
                  {state.message}
                </p>
              )}
            </form>
          ) : (
            <p>Sign in to report this story.</p>
          )}
        </div>
      )}
    </div>
  );
}
