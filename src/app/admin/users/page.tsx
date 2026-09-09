import Link from 'next/link';
import type { AccountStatus, AdminRole, UserRole } from '@prisma/client';
import { getCurrentUser } from '@/lib/auth';
import { isAdmin, listUsers } from '@/lib/admin';
import { AdminUserRow } from '@/components/admin-user-row';

export const metadata = {
  title: 'People | Readems Admin',
  description: 'Everybody with a Readems account.',
};

const number = new Intl.NumberFormat('en-GB');
const joined = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

const first = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value[0] : value) || undefined;

type Search = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Search;
}) {
  const params = await searchParams;
  const query = first(params.query);
  const adminRole = first(params.adminRole) as AdminRole | undefined;
  const status = first(params.status) as AccountStatus | undefined;
  const role = first(params.role) as UserRole | undefined;
  const page = Number(first(params.page) ?? 1) || 1;

  const viewer = await getCurrentUser();
  const [people, admins, moderators, suspended] = await Promise.all([
    listUsers({ query, adminRole, status, role, page, pageSize: 20 }),
    listUsers({ adminRole: 'ADMIN', pageSize: 1 }),
    listUsers({ adminRole: 'MODERATOR', pageSize: 1 }),
    listUsers({ status: 'SUSPENDED', pageSize: 1 }),
  ]);

  const link = (next: Record<string, string | number | undefined>) => {
    const search = new URLSearchParams();
    const merged = { query, adminRole, status, role, page, ...next };
    for (const [key, value] of Object.entries(merged))
      if (value !== undefined && String(value) !== '')
        search.set(key, String(value));
    return `/admin/users?${search.toString()}`;
  };

  return (
    <>
      <section className="admin-hero">
        <h1>People</h1>
        <p>Roles, moderators and suspended accounts.</p>
        <dl className="admin-hero-stats">
          <div>
            <dt>Accounts</dt>
            <dd>{number.format(people.total)}</dd>
          </div>
          <div>
            <dt>Admins</dt>
            <dd>{number.format(admins.total)}</dd>
          </div>
          <div>
            <dt>Moderators</dt>
            <dd>{number.format(moderators.total)}</dd>
          </div>
          <div>
            <dt>Suspended</dt>
            <dd>{number.format(suspended.total)}</dd>
          </div>
        </dl>
      </section>

      <main className="admin-main">
        <form className="admin-filters" action="/admin/users" method="get">
          <label>
            <span className="admin-visually-hidden">
              Search by name, username or email
            </span>
            <input
              type="search"
              name="query"
              defaultValue={query ?? ''}
              placeholder="Search by name, username or email"
            />
          </label>
          <label>
            <span className="admin-visually-hidden">Admin role</span>
            <select name="adminRole" defaultValue={adminRole ?? ''}>
              <option value="">All roles</option>
              <option value="NONE">Member</option>
              <option value="MODERATOR">Moderator</option>
              <option value="ADMIN">Admin</option>
              <option value="SUPER_ADMIN">Super admin</option>
            </select>
          </label>
          <label>
            <span className="admin-visually-hidden">Account status</span>
            <select name="status" defaultValue={status ?? ''}>
              <option value="">Any status</option>
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </label>
          <button type="submit">Filter</button>
        </form>

        <article className="admin-card">
          <div className="admin-card-head">
            <h2>
              {people.total === 1
                ? '1 account'
                : `${number.format(people.total)} accounts`}
            </h2>
            <span className="admin-pill">
              Page {people.page} of {people.pageCount}
            </span>
          </div>
          {people.rows.length ? (
            <ul className="admin-users">
              {people.rows.map((row) => (
                <AdminUserRow
                  key={row.id}
                  canSetRole={isAdmin(viewer, 'SUPER_ADMIN')}
                  canSuspend={isAdmin(viewer, 'ADMIN') && row.id !== viewer?.id}
                  user={{
                    id: row.id,
                    fullName: row.fullName,
                    username: row.username,
                    email: row.email,
                    role: row.role,
                    adminRole: row.adminRole,
                    accountStatus: row.accountStatus,
                    stories: row.stories,
                    joined: joined.format(row.createdAt),
                  }}
                />
              ))}
            </ul>
          ) : (
            <p className="admin-empty">Nobody matches that search.</p>
          )}
          <div className="admin-pager">
            {people.page > 1 && (
              <Link href={link({ page: people.page - 1 })}>Previous</Link>
            )}
            {people.page < people.pageCount && (
              <Link href={link({ page: people.page + 1 })}>Next</Link>
            )}
          </div>
        </article>
      </main>
    </>
  );
}
