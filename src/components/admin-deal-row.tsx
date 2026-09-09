'use client';

import { useState, useTransition } from 'react';
import type { DealStatus } from '@prisma/client';
import { changeDealStatus } from '@/app/admin/actions';

const statuses: DealStatus[] = ['DRAFT', 'PENDING', 'LIVE', 'COMPLETED'];

export function AdminDealRow({
  deal,
  canEdit,
}: {
  deal: {
    id: string;
    name: string;
    sponsor: string;
    category: string;
    region: string;
    status: DealStatus;
    value: string;
    creatorSlots: number;
    dates: string | null;
    createdBy: string | null;
  };
  canEdit: boolean;
}) {
  const [status, setStatus] = useState(deal.status);
  const [message, setMessage] = useState('');
  const [pending, startTransition] = useTransition();

  return (
    <li className="admin-deal">
      <div className="admin-deal-what">
        <b>{deal.name}</b>
        <small>
          {deal.sponsor} · {deal.category} · {deal.region}
        </small>
        <small>
          {deal.dates ?? 'No dates set'} · {deal.creatorSlots}{' '}
          {deal.creatorSlots === 1 ? 'creator slot' : 'creator slots'}
          {deal.createdBy ? ` · added by ${deal.createdBy}` : ''}
        </small>
      </div>
      <div className="admin-deal-value">
        <b>{deal.value}</b>
        <small>Deal value</small>
      </div>
      {canEdit ? (
        <label className="admin-deal-status">
          <span className="admin-visually-hidden">Status for {deal.name}</span>
          <select
            value={status}
            disabled={pending}
            onChange={(event) => {
              const next = event.target.value as DealStatus;
              startTransition(async () => {
                const result = await changeDealStatus(deal.id, next);
                setMessage(result.message ?? '');
                if (result.ok) setStatus(next);
              });
            }}
          >
            {statuses.map((value) => (
              <option key={value} value={value}>
                {value.toLowerCase()}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <span className="admin-tag">{status.toLowerCase()}</span>
      )}
      {message && (
        <p className="admin-status" role="status">
          {message}
        </p>
      )}
    </li>
  );
}
