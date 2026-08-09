# Ghost Live — Portal

Área de membros + API de licenciamento da Ghost Live. Substitui o backend proprietário que a extensão usava antes.

## Rodando localmente

```bash
cp .env.example .env
npm install
docker compose up -d db      # só o Postgres, se não quiser rodar o app em Docker também
npx prisma migrate deploy    # aplica o schema no banco
npm run dev
```

Acesse `http://localhost:3000`.

## Rodando tudo via Docker

```bash
cp .env.example .env
docker compose up --build
```

## Testando o contrato da extensão manualmente

Depois de rodar `npx prisma migrate deploy`, crie uma licença de teste:

```bash
npx prisma studio
```

Crie um `User` (email) e um `License` (license_key no formato `GL-XXXX-XXXX-XXXX-XXXX`, plan, status=`active`) apontando pra esse usuário. Depois teste a ativação:

```bash
curl -X POST http://localhost:3000/api/v1/license/activate \
  -H "content-type: application/json" \
  -d '{"email":"teste@exemplo.com","license_key":"GL-XXXX-XXXX-XXXX-XXXX","device_id":"dev-123","device_name":"Chrome no macOS","app_version":"7.17.46","extension_version":"7.17.46","platform":"macOS"}'
```

## Deploy no EasyPanel

1. Criar um serviço Postgres (one-click) no EasyPanel — copiar a `DATABASE_URL` interna gerada.
2. Criar um serviço de app a partir deste repositório/Dockerfile, configurar as env vars de `.env.example`.
3. Apontar um domínio (o mesmo app serve tanto o portal quanto `/api/v1/*` usado pela extensão).
4. O `entrypoint.sh` roda `prisma migrate deploy` automaticamente a cada deploy/restart — não precisa rodar migração manualmente em produção.

## Estrutura

- `app/api/v1/*` — API que a extensão chama (contrato idêntico ao antigo `license-client.js`, ver `lib/licensing/core.ts`).
- `app/api/webhooks/stripe` — provisionamento de licença após compra (Fase 2, ainda não implementado).
- `app/api/portal/*` — API usada pelas telas do portal (Fase 2/3, ainda não implementado).
- `lib/licensing/core.ts` — lógica central de ativação/verificação/desativação de dispositivo, único lugar que aplica a regra de "1 dispositivo por licença".
- `prisma/schema.prisma` — schema do banco.
