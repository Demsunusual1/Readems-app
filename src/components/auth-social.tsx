import { AppleLogo, GoogleLogo } from '@phosphor-icons/react/dist/ssr';

export function AuthSocial() {
  return (
    <div className="auth-social">
      <div className="auth-divider">
        <span>Or continue with</span>
      </div>
      <div className="auth-social-buttons">
        <button type="button" disabled aria-describedby="social-unavailable">
          <GoogleLogo aria-hidden="true" />
          Continue with Google
        </button>
        <button type="button" disabled aria-describedby="social-unavailable">
          <AppleLogo weight="fill" aria-hidden="true" />
          Continue with Apple
        </button>
      </div>
      <p id="social-unavailable">
        Social sign-in is coming soon. Please use email and password.
      </p>
    </div>
  );
}
