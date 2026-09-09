'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import type { ReportPriority, ReportStatus } from '@prisma/client';
import { decideReport, takeReport } from '@/app/admin/actions';

export type ReportCardData = {
  id: string;
  targetType: string;
  reason: string;
  details: string | null;
  status: ReportStatus;
  priority: ReportPriority;
  title: string;
  context: string | null;
  authorName: string | null;
  href: string | null;
  reporterName: string | null;
  assignedToId: string | null;
  resolvedByName: string | null;
  filed: string;
};

const typeLabels: Record<string, string> = {
  STORY: 'Story',
  CHAPTER: 'Chapter',
  COMMENT: 'Comment',
  POST: 'Post',
  POST_COMMENT: 'Post reply',
  REVIEW: 'Review',
  USER: 'Person',
};

export function AdminReportCard({
  report,
  moderators,
}: {
  report: ReportCardData;
  moderators: { id: string; fullName: string }[];
}) {
  const [status, setStatus] = useState(report.status);
  const [assignedToId, setAssignedToId] = useState(report.assignedToId ?? '');
  const [message, setMessage] = useState('');
  const [pending, startTransition] = useTransition();

  function decide(action: 'APPROVE' | 'RESTRICT' | 'REMOVE') {
    startTransition(async () => {
      const result = await decideReport(report.id, action);
      setMessage(result.message ?? '');
      if (result.ok)
        setStatus(
          action === 'APPROVE'
            ? 'APPROVED'
            : action === 'RESTRICT'
              ? 'RESTRICTED'
              : 'REMOVED',
        );
    });
  }

  return (
    <li className="admin-report">
      <div className="admin-report-head">
        <span className="admin-kind">
          {typeLabels[report.targetType] ?? report.targetType}
        </span>
        <span className={`admin-priority admin-priority-${report.priority}`}>
          {report.priority.toLowerCase()}
        </span>
        <span className="admin-tag">{status.toLowerCase()}</span>
      </div>
      <h3>
        {report.href && status !== 'REMOVED' ? (
          <Link href={report.href}>{report.title}</Link>
        ) : (
          report.title
        )}
      </h3>
      <p className="admin-report-meta">
        {report.authorName ? `by ${report.authorName}` : 'author unknown'}
        {report.context ? ` · ${report.context}` : ''} · reported {report.filed}
        {report.reporterName ? ` by ${report.reporterName}` : ''}
      </p>
      <p className="admin-report-reason">
        <b>{report.reason}</b>
        {report.details ? ` — ${report.details}` : ''}
      </p>
      <div className="admin-report-actions">
        <label>
          <span className="admin-visually-hidden">
            Assign this report to a moderator
          </span>
          <select
            value={assignedToId}
            disabled={pending}
            onChange={(event) => {
              const next = event.target.value;
              startTransition(async () => {
                const result = await takeReport(report.id, next);
                setMessage(result.message ?? '');
                if (result.ok) setAssignedToId(next);
              });
            }}
          >
            <option value="">Unassigned</option>
            {moderators.map((person) => (
              <option key={person.id} value={person.id}>
                {person.fullName}
              </option>
            ))}
          </select>
        </label>
        {status === 'OPEN' ? (
          <div className="admin-decisions">
            <button
              type="button"
              className="admin-approve"
              disabled={pending}
              onClick={() => decide('APPROVE')}
            >
              Approve
            </button>
            <button
              type="button"
              className="admin-restrict"
              disabled={pending}
              onClick={() => decide('RESTRICT')}
            >
              Restrict
            </button>
            <button
              type="button"
              className="admin-remove"
              disabled={pending}
              onClick={() => decide('REMOVE')}
            >
              Remove
            </button>
          </div>
        ) : (
          <p className="admin-report-done">
            {status.toLowerCase()}
            {report.resolvedByName ? ` by ${report.resolvedByName}` : ''}
          </p>
        )}
      </div>
      {message && (
        <p className="admin-status" role="status">
          {message}
        </p>
      )}
    </li>
  );
}
