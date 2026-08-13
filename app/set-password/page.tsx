import SetPasswordForm from './set-password-form';

// See app/login/page.tsx for why nonce-based CSP requires this.
export const dynamic = 'force-dynamic';

export default function SetPasswordPage() {
  return <SetPasswordForm />;
}
