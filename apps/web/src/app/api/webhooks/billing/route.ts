import { type NextRequest, NextResponse } from 'next/server';
import { applySubscription, getBillingProvider } from '@/lib/billing';

/** Provider webhook → verify signature → map event → sync subscription + org plan. */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const rawBody = await req.text();
  const provider = getBillingProvider();

  if (!provider.verifyWebhook(rawBody, req.headers)) {
    return new NextResponse('invalid signature', { status: 401 });
  }

  const event = provider.mapEvent(rawBody);
  if (!event) return new NextResponse('ignored', { status: 200 });

  await applySubscription(event);
  return new NextResponse('ok', { status: 200 });
}
