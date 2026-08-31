'use client';

import { InputHTMLAttributes, useState } from 'react';

export function PasswordField(props: InputHTMLAttributes<HTMLInputElement>) {
  const [visible, setVisible] = useState(false);
  return (
    <span className="password-wrap">
      <span className="field-icon" aria-hidden="true">
        ▣
      </span>
      <input {...props} type={visible ? 'text' : 'password'} />
      <button
        type="button"
        className="password-toggle"
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
        onClick={() => setVisible((value) => !value)}
      >
        {visible ? '◉' : '◎'}
      </button>
    </span>
  );
}
