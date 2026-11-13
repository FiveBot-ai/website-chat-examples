import { useEffect } from 'react';

export interface FiveBotUser {
  readonly externalUserId: string;
  readonly signature: string;
  readonly name?: string;
  readonly email?: string;
}

interface FiveBotApi {
  identify(user: FiveBotUser): void;
  reset(): void;
  open(options?: { topic?: string }): void;
}

declare global {
  interface Window {
    FiveBot?: FiveBotApi;
  }
}

const SIGNED_IN = 'fivebot:signed-in';
let loading: Promise<FiveBotApi> | undefined;

function loadChat(siteKey: string): Promise<FiveBotApi> {
  loading ??= new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://fivebot.ai/widget.js';
    script.async = true;
    script.dataset.key = siteKey;
    script.onload = () => (window.FiveBot ? resolve(window.FiveBot) : reject(new Error('FiveBot chat did not start')));
    script.onerror = () => reject(new Error('FiveBot chat did not load'));
    document.body.appendChild(script);
  });
  return loading;
}

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

export function FiveBotChat({ siteKey, user }: { siteKey: string; user?: FiveBotUser | null }) {
  const id = user?.externalUserId;
  const signature = user?.signature;
  const name = user?.name;
  const email = user?.email;

  useEffect(() => {
    let active = true;
    loadChat(siteKey)
      .then((chat) => {
        if (!active) return;
        if (id && signature) {
          chat.identify({ externalUserId: id, signature, name, email });
          remember(true);
        } else if (remember(false)) {
          chat.reset();
        }
      })
      .catch((error: unknown) => console.warn(error));
    return () => {
      active = false;
    };
  }, [siteKey, id, signature, name, email]);

  return null;
}
