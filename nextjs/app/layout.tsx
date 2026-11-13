import type { ReactNode } from 'react';
import { auth } from '@/auth';
import { FiveBotChat, type FiveBotUser } from './fivebot-chat';
import { signFiveBotIdentity } from './fivebot-identity';

export default async function RootLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  const account = session?.user;
  const user: FiveBotUser | null = account?.id
    ? {
        externalUserId: account.id,
        name: account.name ?? undefined,
        email: account.email ?? undefined,
        signature: signFiveBotIdentity(account.id, account.email),
      }
    : null;

  return (
    <html lang="en">
      <body>
        {children}
        <FiveBotChat siteKey={process.env.NEXT_PUBLIC_FIVEBOT_SITE_KEY ?? ''} user={user} />
      </body>
    </html>
  );
}
