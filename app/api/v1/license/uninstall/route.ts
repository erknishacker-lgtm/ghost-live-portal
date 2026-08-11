import { NextResponse } from 'next/server';
import { uninstallDeviceByToken } from '@/lib/licensing/core';

export const runtime = 'nodejs';

function page(): string {
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Ghost Live</title>
<style>
  body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0a0a0a;color:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;text-align:center;padding:24px;box-sizing:border-box}
  .card{max-width:420px}
  h1{font-size:20px;margin:0 0 10px}
  p{color:#9a9a9a;font-size:14px;line-height:1.5;margin:0 0 20px}
  a{display:inline-block;padding:10px 18px;border-radius:8px;background:#fff;color:#0a0a0a;text-decoration:none;font-weight:700;font-size:13px}
</style>
</head>
<body>
  <div class="card">
    <h1>Extensão desinstalada</h1>
    <p>Este dispositivo foi desconectado da sua licença. Se foi engano, é só reinstalar a Ghost Live e entrar novamente com seu e-mail e chave.</p>
    <a href="https://live.zghost.uk">Voltar ao portal</a>
  </div>
</body>
</html>`;
}

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get('token') || '';
  if (token) {
    await uninstallDeviceByToken(token).catch((error) => {
      console.error('[license/uninstall]', error);
    });
  }
  return new NextResponse(page(), { headers: { 'content-type': 'text/html; charset=utf-8' } });
}
