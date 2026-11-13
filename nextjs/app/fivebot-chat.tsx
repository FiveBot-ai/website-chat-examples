'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';

export interface FiveBotUser {
  readonly externalUserId: string;
  readonly signature: string;
  readonly name?: string;
  readonly email?: string;
}

declare global {
  interface Window {
    FiveBot?: {
      identify(user: FiveBotUser): void;
      reset(): void;
    };
  }
}

const SIGNED_IN = 'fivebot:signed-in';

function remember(signedIn: boolean): boolean {
  try {
    const was = localStorage.getItem(SIGNED_IN) === '1';
    if (signedIn) localStorage.setItem(SIGNED_IN, '1');
    else localStorage.removeItem(SIGNED_IN);
    return was;
  } catch {
    return false;
  }
}

export function FiveBotChat({ siteKey, user }: { siteKey: string; user: FiveBotUser | null }) {
  const [ready, setReady] = useState(false);
  const id = user?.externalUserId;
  const signature = user?.signature;
  const name = user?.name;
  const email = user?.email;

  useEffect(() => {
    const chat = window.FiveBot;
    if (!ready || !chat) return;
    if (id && signature) {
      chat.identify({ externalUserId: id, signature, name, email });
      remember(true);
    } else if (remember(false)) {
      chat.reset();
    }
  }, [ready, id, signature, name, email]);

  return (
    <Script
      src="https://fivebot.ai/widget.js"
      data-key={siteKey}
      strategy="afterInteractive"
      onReady={() => setReady(true)}
    />
  );
}
