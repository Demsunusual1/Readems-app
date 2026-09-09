import Link from 'next/link';
import type { DealStatus } from '@prisma/client';
import { getCurrentUser } from '@/lib/auth';
import {
  dealCategories,
  dealRegions,
  formatMoney,
  isAdmin,
  listDeals,
} from '@/lib/admin';
import { AdminDealForm } from '@/components/admin-deal-form';
import { AdminDealRow } from '@/components/admin-deal-row';

export const metadata = {
  title: 'Brand deals | Readems Admin',
  description: 'Partnerships on the books, and what they are worth.',
};

const statuses: DealStatus[] = ['DRAFT', 'PENDING', 'LIVE', 'COMPLETED'];

const dates = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

const range = (startsAt: Date | null, endsAt: Date | null) => {
  if (!startsAt && !endsAt) return null;
  if (startsAt && endsAt)
    return `${dates.format(startsAt)} – ${dates.format(endsAt)}`;
  return startsAt
    ? `from ${dates.format(startsAt)}`
    : `until ${dates.format(endsAt!)}`;
};

const first = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value[0] : value) || undefined;

type Search = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminDealsPage({
  searchParams,
}: {
  searchParams: Search;
}) {
  const params = await searchParams;
  const status = first(params.status) as DealStatus | undefined;
  const page = Number(first(params.page) ?? 1) || 1;

  const [viewer, deals, everything] = await Promise.all([
    getCurrentUser(),
    listDeals({ status, page, pageSize: 20 }),
    listDeals({ pageSize: 1 }),
  ]);
  const canEdit = isAdmin(viewer, 'ADMIN');

  const link = (next: Record<string, string | number | undefined>) => {
    const search = new URLSearchParams();
    const merged = { status, page: 1, ...next };
    for (const [key, value] of Object.entries(merged))
      if (value !== undefined && String(value) !== '')
        search.set(key, String(value));
    return `/admin/deals?${search.toString()}`;
  };

  return (
    <>
      <section className="admin-hero">
        <h1>Deals and partnerships</h1>
        <p>Every figure here adds up the deals stored on this platform.</p>
        <dl className="admin-hero-stats">
          <div>
            <dt>Deals</dt>
            <dd>{everything.total}</dd>
          </div>
          <div>
            <dt>Live</dt>
            <dd>{everything.counts.LIVE ?? 0}</dd>
          </div>
          <div>
            <dt>Total value</dt>
            <dd>{formatMoney(everything.totalValueCents)}</dd>
          </div>
          <div>
            <dt>Creator slots</dt>
            <dd>{everything.creatorSlots}</dd>
          </div>
        </dl>
      </section>

      <main className="admin-main">
        <nav className="admin-tabs" aria-label="Deal status">
          <Link
            href={link({ status: undefined })}
            className={status ? undefined : 'is-active'}
          >
            All
          </Link>
          {statuses.map((value) => (
            <Link
              key={value}
              href={link({ status: value })}
              className={status === value ? 'is-active' : undefined}
            >
              {value.toLowerCase()}
            </Link>
          ))}
        </nav>

        <article className="admin-card">
          <div className="admin-card-head">
            <h2>
              {deals.total} {deals.total === 1 ? 'deal' : 'deals'}
            </h2>
            <span className="admin-pill">
              {formatMoney(deals.totalValueCents)} in this view
            </span>
          </div>
          {deals.rows.length ? (
            <ul className="admin-deals">
              {deals.rows.map((row) => (
                <AdminDealRow
                  key={row.id}
                  canEdit={canEdit}
                  deal={{
                    id: row.id,
                    name: row.name,
                    sponsor: row.sponsor,
                    category: row.category,
                    region: row.region,
                    status: row.status,
                    value: formatMoney(row.valueCents),
                    creatorSlots: row.creatorSlots,
                    dates: range(row.startsAt, row.endsAt),
                    createdBy: row.createdBy?.fullName ?? null,
                  }}
                />
              ))}
            </ul>
          ) : (
            <p className="admin-empty">
              No deals yet. The first one you add appears here.
            </p>
          )}
          <div className="admin-pager">
            {deals.page > 1 && (
              <Link href={link({ page: deals.page - 1 })}>Previous</Link>
            )}
            {deals.page < deals.pageCount && (
              <Link href={link({ page: deals.page + 1 })}>Next</Link>
            )}
          </div>
        </article>

        {canEdit && (
          <article className="admin-card">
            <AdminDealForm categories={dealCategories} regions={dealRegions} />
          </article>
        )}

        <p className="admin-note">
          Deal value is the amount recorded on each deal, added up. Readems
          measures no spend or return against these deals, so there is no
          performance figure to report.
        </p>
      </main>
    </>
  );
}
