'use client';

import { useState, useTransition } from 'react';
import type { AccountStatus, AdminRole } from '@prisma/client';
import { changeAccountStatus, changeAdminRole } from '@/app/admin/actions';

const roles: AdminRole[] = ['NONE', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN'];
const roleLabels: Record<AdminRole, string> = {
  NONE: 'Member',
  MODERATOR: 'Moderator',
  ADMIN: 'Admin',
  SUPER_ADMIN: 'Super admin',
};

export function AdminUserRow({
  user,
  canSetRole,
  canSuspend,
}: {
  user: {
    id: string;
    fullName: string;
    username: string;
    email: string;
    role: string;
    adminRole: AdminRole;
    accountStatus: AccountStatus;
    stories: number;
    joined: string;
  };
  canSetRole: boolean;
  canSuspend: boolean;
}) {
  const [adminRole, setAdminRole] = useState(user.adminRole);
  const [status, setStatus] = useState(user.accountStatus);
  const [message, setMessage] = useState('');
  const [pending, startTransition] = useTransition();

  return (
    <li className="admin-user">
      <div className="admin-user-who">
        <b>{user.fullName}</b>
        <small>{user.email}</small>
        <small>
          @{user.username} · {user.role.toLowerCase()} · {user.stories}{' '}
          {user.stories === 1 ? 'story' : 'stories'} · joined {user.joined}
        </small>
      </div>
      <div className="admin-user-controls">
        <span
          className={
            status === 'SUSPENDED' ? 'admin-tag admin-tag-bad' : 'admin-tag'
          }
        >
          {status === 'SUSPENDED' ? 'Suspended' : 'Active'}
        </span>
        {canSetRole ? (
          <label>
            <span className="admin-visually-hidden">
              Admin role for {user.fullName}
            </span>
            <select
              value={adminRole}
              disabled={pending}
              onChange={(event) => {
                const next = event.target.value as AdminRole;
                startTransition(async () => {
                  const result = await changeAdminRole(user.id, next);
                  setMessage(result.message ?? '');
                  if (result.ok) setAdminRole(next);
                });
              }}
            >
              {roles.map((role) => (
                <option key={role} value={role}>
                  {roleLabels[role]}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <span className="admin-tag">{roleLabels[adminRole]}</span>
        )}
        {canSuspend && (
          <button
            type="button"
            className="admin-ghost"
            disabled={pending}
            onClick={() => {
              const next: AccountStatus =
                status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
              startTransition(async () => {
                const result = await changeAccountStatus(user.id, next);
                setMessage(result.message ?? '');
                if (result.ok) setStatus(next);
              });
            }}
          >
            {status === 'SUSPENDED' ? 'Restore' : 'Suspend'}
          </button>
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
