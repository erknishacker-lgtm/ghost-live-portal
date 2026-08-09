import { Resend } from 'resend';

let client: Resend | null = null;

function getClient(): Resend | null {
  if (client) return client;
  const apiKey = process.env.RESEND_API_KEY;
  // Also treat obvious placeholders as "not configured" so a forgotten
  // .env.example-style value degrades to logging instead of a doomed,
  // silently-swallowed API call.
  if (!apiKey || apiKey.includes('placeholder') || apiKey === 're_...') {
    return null; // no real key — caller logs to console instead
  }
  client = new Resend(apiKey);
  return client;
}

function baseUrl(): string {
  return (process.env.APP_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
}

async function send(to: string, subject: string, html: string, devLogLabel: string) {
  const resend = getClient();
  if (!resend) {
    console.info(`[email:dev] ${devLogLabel} → ${to}\n${html.match(/href="([^"]+)"/)?.[1] ?? ''}`);
    return;
  }
  // resend.emails.send() does NOT throw on API-level failures — it resolves
  // with { data, error }. Missing this check means a bad key/unverified
  // domain/rate limit fails completely silently.
  const result = await resend.emails.send({ from: process.env.EMAIL_FROM || 'Ghost Live <no-reply@louzadadigitalhub.com>', to, subject, html });
  if (result.error) {
    throw new Error(`Resend: ${result.error.message || result.error.name || 'falha ao enviar'}`);
  }
}

export async function sendSetPasswordEmail(to: string, name: string | null, token: string, licenseKey: string, plan: string) {
  const link = `${baseUrl()}/set-password?token=${encodeURIComponent(token)}`;

  await send(
    to,
    'Bem-vindo à Ghost Live — ative seu acesso',
    `
      <div style="font-family:Inter,-apple-system,sans-serif;background:#0a0a0a;color:#f5f5f5;padding:32px">
        <h1 style="font-size:20px">Olá${name ? `, ${name}` : ''}.</h1>
        <p>Sua assinatura Ghost Live (plano <strong>${plan}</strong>) foi confirmada.</p>
        <p>Sua chave de licença:</p>
        <p style="font:600 16px/1 ui-monospace,monospace;background:#141414;padding:12px 16px;border-radius:8px;letter-spacing:1px">${licenseKey}</p>
        <p>Pra acessar o portal e a extensão, defina sua senha:</p>
        <p><a href="${link}" style="display:inline-block;background:#fff;color:#0a0a0a;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:700">Definir senha</a></p>
        <p style="color:#9a9a9a;font-size:12px">Esse link expira em 48 horas. Se você não fez essa compra, ignore este e-mail.</p>
      </div>
    `,
    'set-password'
  );
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const link = `${baseUrl()}/set-password?token=${encodeURIComponent(token)}`;

  await send(
    to,
    'Redefinir sua senha — Ghost Live',
    `
      <div style="font-family:Inter,-apple-system,sans-serif;background:#0a0a0a;color:#f5f5f5;padding:32px">
        <h1 style="font-size:20px">Redefinir senha</h1>
        <p>Recebemos um pedido pra redefinir sua senha. Clique abaixo pra continuar:</p>
        <p><a href="${link}" style="display:inline-block;background:#fff;color:#0a0a0a;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:700">Redefinir senha</a></p>
        <p style="color:#9a9a9a;font-size:12px">Esse link expira em 48 horas. Se você não pediu isso, ignore este e-mail.</p>
      </div>
    `,
    'password-reset'
  );
}
