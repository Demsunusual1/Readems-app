import Link from 'next/link';
import type { ReportPriority, ReportStatus } from '@prisma/client';
import { listModerators, listReports } from '@/lib/admin';
import { relativeTime } from '@/lib/time';
import { AdminReportCard } from '@/components/admin-report-card';

export const metadata = {
  title: 'Moderation | Readems Admin',
  description: 'Reports people have filed, and what was decided.',
};

const statuses: { value: ReportStatus; label: string }[] = [
  { value: 'OPEN', label: 'Open' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'RESTRICTED', label: 'Restricted' },
  { value: 'REMOVED', label: 'Removed' },
];

const priorities: ReportPriority[] = ['HIGH', 'MEDIUM', 'LOW'];

const first = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value[0] : value) || undefined;

type Search = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminModerationPage({
  searchParams,
}: {
  searchParams: Search;
}) {
  const params = await searchParams;
  const status = (first(params.status) as ReportStatus | undefined) ?? 'OPEN';
  const priority = first(params.priority) as ReportPriority | undefined;
  const page = Number(first(params.page) ?? 1) || 1;

  const [queue, open, high, moderators] = await Promise.all([
    listReports({ status, priority, page, pageSize: 20 }),
    listReports({ status: 'OPEN', pageSize: 1 }),
    listReports({ status: 'OPEN', priority: 'HIGH', pageSize: 1 }),
    listModerators(),
  ]);

  const link = (next: Record<string, string | number | undefined>) => {
    const search = new URLSearchParams();
    const merged = { status, priority, page: 1, ...next };
    for (const [key, value] of Object.entries(merged))
      if (value !== undefined && String(value) !== '')
        search.set(key, String(value));
    return `/admin/moderation?${search.toString()}`;
  };

  return (
    <>
      <section className="admin-hero">
        <h1>Moderation</h1>
        <p>Reports people filed, and what a moderator decided about them.</p>
        <dl className="admin-hero-stats">
          <div>
            <dt>Open</dt>
            <dd>{open.total}</dd>
          </div>
          <div>
            <dt>High priority</dt>
            <dd>{high.total}</dd>
          </div>
          <div>
            <dt>Moderators</dt>
            <dd>{moderators.length}</dd>
          </div>
        </dl>
      </section>

      <main className="admin-main">
        <nav className="admin-tabs" aria-label="Report status">
          {statuses.map((item) => (
            <Link
              key={item.value}
              href={link({ status: item.value })}
              className={status === item.value ? 'is-active' : undefined}
              aria-current={status === item.value ? 'page' : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <nav className="admin-chips" aria-label="Priority">
          <Link
            href={link({ priority: undefined })}
            className={priority ? undefined : 'is-active'}
          >
            All priorities
          </Link>
          {priorities.map((item) => (
            <Link
              key={item}
              href={link({ priority: item })}
              className={priority === item ? 'is-active' : undefined}
            >
              {item.toLowerCase()}
            </Link>
          ))}
        </nav>

        <article className="admin-card">
          <div className="admin-card-head">
            <h2>
              {queue.total} {queue.total === 1 ? 'report' : 'reports'}
            </h2>
            <span className="admin-pill">
              Page {queue.page} of {queue.pageCount}
            </span>
          </div>
          {queue.rows.length ? (
            <ul className="admin-reports">
              {queue.rows.map((row) => (
                <AdminReportCard
                  key={row.id}
                  moderators={moderators}
                  report={{
                    id: row.id,
                    targetType: row.targetType,
                    reason: row.reason,
                    details: row.details,
                    status: row.status,
                    priority: row.priority,
                    title: row.title,
                    context: row.context,
                    authorName: row.authorName,
                    href: row.href,
                    reporterName: row.reporterName,
                    assignedToId: row.assignedToId,
                    resolvedByName: row.resolvedByName,
                    filed: relativeTime(row.createdAt),
                  }}
                />
              ))}
            </ul>
          ) : (
            <p className="admin-empty">Nothing here. The queue is clear.</p>
          )}
          <div className="admin-pager">
            {queue.page > 1 && (
              <Link href={link({ page: queue.page - 1 })}>Previous</Link>
            )}
            {queue.page < queue.pageCount && (
              <Link href={link({ page: queue.page + 1 })}>Next</Link>
            )}
          </div>
        </article>

        <p className="admin-note">
          Approve leaves the content alone. Restrict hides it from readers and
          can be undone in the database. Remove deletes it; a reported account
          is suspended rather than deleted, because deleting it would take every
          story and comment with it.
        </p>
      </main>
    </>
  );
}
