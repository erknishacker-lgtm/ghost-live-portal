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
  const result = await resend.emails.send({ from: process.env.EMAIL_FROM || 'Ghost Live <no-reply@zghost.uk>', to, subject, html });
  if (result.error) {
    throw new Error(`Resend: ${result.error.message || result.error.name || 'falha ao enviar'}`);
  }
}

/**
 * Table-based shell for email-client compatibility (Outlook's Word engine
 * in particular ignores flex/grid and is picky about anything not driven
 * by <table>). Everything inside `bodyHtml` should stick to inline styles.
 */
function emailShell(bodyHtml: string, preheader: string): string {
  const logoUrl = `${baseUrl()}/ghost-logo.png`;
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Ghost Live</title>
</head>
<body style="margin:0;padding:0;background-color:#000000;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${preheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#000000;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="width:560px;max-width:100%;">
          <tr>
            <td align="center" style="padding-bottom:28px;">
              <img src="${logoUrl}" width="48" height="48" alt="Ghost Live" style="display:block;width:48px;height:48px;">
              <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:16px;font-weight:800;color:#ffffff;letter-spacing:.3px;margin-top:10px;">GHOST LIVE</div>
            </td>
          </tr>
          <tr>
            <td style="background-color:#141414;border:1px solid #2a2a2a;border-radius:14px;padding:36px 32px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#f5f5f5;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top:24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:12px;color:#666666;">
              Ghost Live · <a href="${baseUrl()}" style="color:#9a9a9a;text-decoration:underline;">live.zghost.uk</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function button(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 4px;">
    <tr>
      <td align="center" bgcolor="#ffffff" style="border-radius:10px;">
        <a href="${href}" style="display:inline-block;padding:14px 26px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:14px;font-weight:700;color:#0a0a0a;text-decoration:none;border-radius:10px;">${label}</a>
      </td>
    </tr>
  </table>`;
}

export async function sendSetPasswordEmail(to: string, name: string | null, token: string, licenseKey: string, plan: string) {
  const link = `${baseUrl()}/set-password?token=${encodeURIComponent(token)}`;
  const firstName = name?.trim().split(' ')[0];

  const body = `
    <h1 style="margin:0 0 6px;font-size:20px;font-weight:800;color:#ffffff;">Olá${firstName ? `, ${firstName}` : ''}.</h1>
    <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#c9c9c9;">
      Sua assinatura Ghost Live (plano <strong style="color:#ffffff;">${plan}</strong>) foi confirmada. Aqui está sua chave de licença:
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr>
        <td style="background-color:#0a0a0a;border:1px solid #2a2a2a;border-radius:10px;padding:16px 18px;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:17px;font-weight:700;color:#ffffff;letter-spacing:1px;">
          ${licenseKey}
        </td>
      </tr>
    </table>
    <p style="margin:0 0 4px;font-size:14px;line-height:1.6;color:#c9c9c9;">
      Pra acessar o portal e ativar a extensão, defina sua senha:
    </p>
    ${button(link, 'Definir senha')}
    <p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:#666666;">
      Esse link expira em 48 horas. Se você não fez essa compra, pode ignorar este e-mail.
    </p>
  `;

  await send(to, 'Bem-vindo à Ghost Live — ative seu acesso', emailShell(body, `Sua chave: ${licenseKey}`), 'set-password');
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const link = `${baseUrl()}/set-password?token=${encodeURIComponent(token)}`;

  const body = `
    <h1 style="margin:0 0 6px;font-size:20px;font-weight:800;color:#ffffff;">Redefinir senha</h1>
    <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#c9c9c9;">
      Recebemos um pedido pra redefinir sua senha. Clique abaixo pra continuar:
    </p>
    ${button(link, 'Redefinir senha')}
    <p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:#666666;">
      Esse link expira em 48 horas. Se você não pediu isso, pode ignorar este e-mail.
    </p>
  `;

  await send(to, 'Redefinir sua senha — Ghost Live', emailShell(body, 'Redefina sua senha da Ghost Live'), 'password-reset');
}
