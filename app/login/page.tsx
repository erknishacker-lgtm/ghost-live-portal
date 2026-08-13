import LoginForm from './login-form';

// Nonce-based CSP (see middleware.ts) requires per-request dynamic
// rendering — a statically-cached page would bake in a stale nonce that
// never matches the header on later requests, blocking hydration.
export const dynamic = 'force-dynamic';

export default function LoginPage() {
  return <LoginForm />;
}
