import 'server-only';
import { createHmac } from 'node:crypto';

export function signFiveBotIdentity(externalUserId: string, email?: string | null): string {
  const secret = process.env.FIVEBOT_IDENTITY_SECRET;
  if (!secret) throw new Error('FIVEBOT_IDENTITY_SECRET is not set');
  const message = email ? `${externalUserId}\n${email}` : externalUserId;
  return createHmac('sha256', secret).update(message).digest('hex');
}
