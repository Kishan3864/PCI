import { createMailerFromEnv, type Mailer } from '@scriptproof/email';

const globalForMailer = globalThis as unknown as { __scriptproofMailer?: Mailer };

export const mailer: Mailer = globalForMailer.__scriptproofMailer ?? createMailerFromEnv();
globalForMailer.__scriptproofMailer = mailer;
