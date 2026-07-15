# Deploying ScriptProof to your own server (Ubuntu + nginx + PM2)

This guide targets a VPS like `srv1545707` that already runs Node apps behind nginx.
It deploys the web app + worker under `pci.flexypdf.com` (adjust the domain to match your
DNS A record). Run everything as your normal user (`flexyuser`) unless a step says `sudo`.

> The web app and worker are one repo. The worker has **no public port** in production —
> only the web app is exposed through nginx.

## 0. Prerequisites (once)

```bash
node -v          # must be v22+. If not: use nvm to install 22
npm  -v
sudo -v          # you can sudo
```

Install pnpm and PM2 globally if missing:

```bash
npm install -g pnpm@10 pm2
```

## 1. Clone the repo

```bash
cd ~
git clone https://github.com/Kishan3864/PCI.git pci
cd pci
```

## 2. Install dependencies + the crawler browser

```bash
pnpm install --frozen-lockfile
# Chromium + all system libs the worker's crawler/PDF need:
pnpm --filter worker exec playwright install --with-deps chromium
```

## 3. PostgreSQL database

If Postgres is already installed, skip the install line.

```bash
sudo apt-get update && sudo apt-get install -y postgresql
sudo -u postgres psql -c "CREATE USER scriptproof WITH PASSWORD 'CHANGE_ME_STRONG';"
sudo -u postgres psql -c "CREATE DATABASE scriptproof OWNER scriptproof;"
```

## 4. Environment file

```bash
cp .env.example .env
nano .env
```

Fill it in (production values):

```ini
# Database
DATABASE_URL=postgres://scriptproof:CHANGE_ME_STRONG@localhost:5432/scriptproof

# App URLs (your real domain)
NEXT_PUBLIC_APP_URL=https://pci.flexypdf.com
BETTER_AUTH_URL=https://pci.flexypdf.com
BETTER_AUTH_SECRET=PASTE_OUTPUT_OF( openssl rand -base64 32 )

# Node
NODE_ENV=production
# Port the web app listens on locally (pick one that is free on this box)
PORT=3200

# Email — REQUIRED for real signups (email verification). Get a free Resend key
# at resend.com, verify your sending domain, then:
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_xxxxxxxx
EMAIL_FROM=ScriptProof <notify@pci.flexypdf.com>

# Crawler identity
BOT_INFO_URL=https://pci.flexypdf.com/bot

# Where Evidence Pack / free-scan PDFs are written
STORAGE_DIR=/home/flexyuser/pci/storage

# Billing — leave as-is to run in MOCK mode (no real charges) until you add Dodo keys.
BILLING_PROVIDER=dodo

# IMPORTANT: do NOT set SCRIPTPROOF_TEST_MODE in production (leave it blank/removed).
```

Generate the secret:

```bash
openssl rand -base64 32
```

## 5. Migrate the database + build

```bash
pnpm db:migrate
# Optional: seed a demo account (skip on a real public site if you don't want the demo user)
# pnpm db:seed
pnpm --filter web build
```

## 6. Start web + worker with PM2

```bash
# Web (reads PORT from .env; here 3200)
pm2 start "pnpm --filter web start" --name pci-web --cwd /home/flexyuser/pci
# Worker (queue + crawler + PDFs)
pm2 start "pnpm --filter worker start" --name pci-worker --cwd /home/flexyuser/pci

pm2 save
pm2 startup   # run the command it prints, so PM2 restarts on reboot
pm2 status
```

Check logs if needed: `pm2 logs pci-web` / `pm2 logs pci-worker`.

## 7. nginx reverse proxy

```bash
sudo nano /etc/nginx/sites-available/pci.flexypdf.com
```

Paste (match the `PORT` you chose):

```nginx
server {
    server_name pci.flexypdf.com;

    client_max_body_size 10m;

    location / {
        proxy_pass http://127.0.0.1:3200;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    listen 80;
}
```

Enable + reload:

```bash
sudo ln -s /etc/nginx/sites-available/pci.flexypdf.com /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

## 8. HTTPS certificate

```bash
sudo certbot --nginx -d pci.flexypdf.com
```

Certbot rewrites the nginx file to add the SSL (443) server block and an HTTP→HTTPS redirect.

## 9. You are live

Open `https://pci.flexypdf.com`. Sign up, verify via the email that Resend sends, add a site,
verify domain ownership, and the monitoring loop runs.

## Updating later (after you push new code)

```bash
cd ~/pci
git pull
pnpm install --frozen-lockfile
pnpm db:migrate
pnpm --filter web build
pm2 restart pci-web pci-worker
```

## Notes / gotchas

- **Email is mandatory** for real signups (Better Auth requires email verification). Without a
  working `RESEND_API_KEY` + verified sender domain, new users can't confirm their account.
- **Real payments** need Dodo keys (`DODO_API_KEY`, `DODO_WEBHOOK_SECRET`, product ids) and a
  webhook pointing at `https://pci.flexypdf.com/api/webhooks/billing`. Until then billing runs
  in mock mode (good for demoing the flow, not for charging).
- **Port conflicts:** pick a `PORT` that no other app on the box uses; keep nginx's
  `proxy_pass` port in sync.
- The worker does not expose an HTTP port in production (the fixture test server only starts
  when `NODE_ENV` is not `production`).

---

## Go-live checklist: real email (Resend) — REQUIRED for public signups

Signups require email verification, and the app now **rejects fake/disposable
addresses** (live MX checks + blocklists) before an account is created. For the
verification mail to actually arrive you need a real provider:

1. Create a free account at https://resend.com (100 emails/day free).
2. Resend dashboard → Domains → Add `pci.flexypdf.com` → it shows 3 DNS records
   (SPF/DKIM). Add them at your DNS panel → wait for "Verified".
3. API Keys → Create → copy the `re_...` key.
4. On the server edit `~/pci/.env`:
   ```ini
   EMAIL_PROVIDER=resend
   RESEND_API_KEY=re_xxxxxxxxxxxx
   EMAIL_FROM=ScriptProof <notify@pci.flexypdf.com>
   ```
5. `pm2 restart pci-web pci-worker`

## Go-live checklist: real payments (Dodo Payments)

Billing runs in safe **mock mode** until keys exist — the moment they do, real
checkout activates automatically (no code change).

1. Create a Dodo Payments account (https://dodopayments.com), complete
   merchant verification.
2. Create three subscription products (Starter / Pro / Agency) with your
   monthly prices → copy each product id.
3. Dashboard → API keys → copy the live API key. Webhooks → add endpoint
   `https://pci.flexypdf.com/api/webhooks/billing`, subscribe to subscription
   created/active/renewed/updated/cancelled events → copy the webhook secret.
4. On the server edit `~/pci/.env`:
   ```ini
   BILLING_PROVIDER=dodo
   DODO_API_KEY=...
   DODO_WEBHOOK_SECRET=...
   DODO_PRODUCT_STARTER=...
   DODO_PRODUCT_PRO=...
   DODO_PRODUCT_AGENCY=...
   ```
5. `pm2 restart pci-web pci-worker`, then buy a plan with Dodo's test card to
   confirm the org's plan flips after the webhook fires.

## After every deploy of this release

`pnpm db:migrate` is required (new `rate_limits` table backs the
database-stored auth rate limiter).
