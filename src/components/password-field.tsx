'use client';

import { Eye, EyeSlash, LockKey } from '@phosphor-icons/react';
import { InputHTMLAttributes, useState } from 'react';
import { Input } from './ui/input';

export function PasswordField(props: InputHTMLAttributes<HTMLInputElement>) {
  const [visible, setVisible] = useState(false);
  return (
    <Input
      {...props}
      type={visible ? 'text' : 'password'}
      leadingIcon={<LockKey size={21} />}
      trailing={
        <button
          type="button"
          className="password-toggle"
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          onClick={() => setVisible((value) => !value)}
        >
          {visible ? (
            <EyeSlash aria-hidden="true" />
          ) : (
            <Eye aria-hidden="true" />
          )}
        </button>
      }
    />
  );
}
