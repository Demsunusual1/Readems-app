'use client';

import { useActionState } from 'react';
import { addDeal, type AdminResult } from '@/app/admin/actions';

export function AdminDealForm({
  categories,
  regions,
}: {
  categories: readonly string[];
  regions: readonly string[];
}) {
  const [state, action, pending] = useActionState<AdminResult | null, FormData>(
    addDeal,
    null,
  );

  return (
    <form className="admin-deal-form" action={action}>
      <h2>New brand deal</h2>
      <label>
        <span>Name</span>
        <input name="name" required maxLength={120} />
      </label>
      <label>
        <span>Sponsor</span>
        <input name="sponsor" required maxLength={120} />
      </label>
      <label>
        <span>Category</span>
        <select name="category" defaultValue={categories[0]}>
          {categories.map((category) => (
            <option key={category}>{category}</option>
          ))}
        </select>
      </label>
      <label>
        <span>Region</span>
        <select name="region" defaultValue={regions[0]}>
          {regions.map((region) => (
            <option key={region}>{region}</option>
          ))}
        </select>
      </label>
      <label>
        <span>Value in dollars</span>
        <input name="value" type="number" min={0} step="1" defaultValue={0} />
      </label>
      <label>
        <span>Creator slots</span>
        <input
          name="creatorSlots"
          type="number"
          min={0}
          step="1"
          defaultValue={0}
        />
      </label>
      <label>
        <span>Status</span>
        <select name="status" defaultValue="DRAFT">
          <option value="DRAFT">Draft</option>
          <option value="PENDING">Pending</option>
          <option value="LIVE">Live</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </label>
      <button type="submit" disabled={pending}>
        {pending ? 'Saving…' : 'Create deal'}
      </button>
      {state?.message && (
        <p className="admin-status" role="status">
          {state.message}
        </p>
      )}
    </form>
  );
}
