import { expect, test } from '@playwright/test';

const MAILHOG_API = 'http://localhost:8025/api/v2';
const FIXTURE = 'http://localhost:4820';
const FIXTURE_DOMAIN = 'localhost:4820';

/** Decodes just enough quoted-printable to extract URLs from MIME bodies. */
function decodeQuotedPrintable(body: string): string {
  return body
    .replace(/=\r?\n/g, '')
    .replace(/=([0-9A-F]{2})/gi, (_, hex: string) => String.fromCharCode(parseInt(hex, 16)));
}

async function findVerificationLink(email: string): Promise<string> {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const res = await fetch(`${MAILHOG_API}/search?kind=to&query=${encodeURIComponent(email)}`);
    const data = (await res.json()) as {
      items: Array<{ Content: { Body: string } }>;
    };
    for (const item of data.items) {
      const body = decodeQuotedPrintable(item.Content.Body);
      const match = body.match(/https?:\/\/[^\s"'<>\])]+verify-email[^\s"'<>\])]*/);
      if (match) return match[0];
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error(`no verification email for ${email} within 30s`);
}

test('signup → verify email → add site → verify domain → scan fixture → review inventory', async ({
  page,
}) => {
  const stamp = Date.now();
  const email = `e2e-${stamp}@scriptproof.local`;

  // Fixture starts from the baseline variant.
  await fetch(`${FIXTURE}/__fixture/variant`, {
    method: 'POST',
    body: JSON.stringify({ variant: 'baseline' }),
  });

  // ── Sign up ────────────────────────────────────────────────────────────────
  await page.goto('/signup');
  await page.getByLabel('Your name or business name').fill(`E2E Merchant ${stamp}`);
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill('e2e-password-123');
  await page.getByRole('button', { name: 'Create account' }).click();
  await page.waitForURL('**/check-email');

  // ── Email verification via Mailhog ─────────────────────────────────────────
  const verifyUrl = await findVerificationLink(email);
  await page.goto(verifyUrl);
  await page.waitForURL('**/app');
  await expect(page.getByRole('heading', { name: 'Sites' })).toBeVisible();

  // ── Add the fixture site ───────────────────────────────────────────────────
  await page.getByRole('link', { name: 'Add site' }).click();
  await page.getByLabel('Domain').fill(FIXTURE_DOMAIN);
  await page.getByRole('button', { name: 'Add site' }).click();
  await page.waitForURL('**/verify');

  // ── Verify ownership via the (real) meta-tag flow ──────────────────────────
  const metaTag = await page
    .locator('code', { hasText: 'scriptproof-verify' })
    .last()
    .textContent();
  const token = metaTag?.match(/content="([a-f0-9]+)"/)?.[1];
  expect(token, 'verify token visible on the verify page').toBeTruthy();

  await fetch(`${FIXTURE}/__fixture/verify-token`, {
    method: 'POST',
    body: JSON.stringify({ token }),
  });

  await page.getByRole('button', { name: 'Check meta tag' }).click();
  await page.waitForURL('**/settings?verified=1');
  await expect(page.getByText('Domain verified')).toBeVisible();

  // ── Add the checkout page (queues the baseline scan) ───────────────────────
  await page.getByLabel('Page URL').fill(`${FIXTURE}/checkout`);
  await page.getByLabel('Label').fill('Checkout');
  await page.getByRole('button', { name: 'Add page' }).click();
  await expect(page.getByText('Page added.')).toBeVisible();

  // ── Inventory appears after the worker scans the fixture ───────────────────
  const inventoryUrl = page.url().replace(/\/settings.*$/, '/inventory');
  await expect
    .poll(
      async () => {
        await page.goto(inventoryUrl);
        return page.locator('table tbody tr').count();
      },
      { timeout: 90_000, intervals: [3000] },
    )
    .toBeGreaterThanOrEqual(3);

  await expect(page.getByText('/js/checkout.js')).toBeVisible();
  await expect(page.getByText('awaiting review')).toBeVisible();

  // ── 6.4.3 workflow: authorize a script with written justification ──────────
  const checkoutRow = page.locator('tr', { hasText: 'checkout.js' });
  await checkoutRow.getByRole('button', { name: 'Authorize' }).click();
  await page
    .getByLabel(/Written justification/)
    .fill('Checkout tokenizer script — required to process card payments.');
  await page.getByRole('dialog').getByRole('button', { name: 'Authorize' }).click();
  await expect(checkoutRow.getByText('authorized')).toBeVisible();
});
