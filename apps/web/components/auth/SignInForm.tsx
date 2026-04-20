'use client';

import React, { useEffect, useState, useRef } from 'react';
import { signIn } from 'next-auth/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { SiGoogle, SiGithub, SiDiscord } from 'react-icons/si';
import { emailProviderMap } from '@/lib/emailProviders';

const COOLDOWN_SECONDS = 60;
const STORAGE_KEY = 'signin:lastSent';

export default function SignInForm({ callbackUrl = '/app' }: { callbackUrl?: string }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState<Record<string, any> | null>(null);

  const [remaining, setRemaining] = useState(0);
  const [sentForEmail, setSentForEmail] = useState<string | null>(null);
  const tickRef = useRef<number | null>(null);

  // Load providers (client)
  useEffect(() => {
    let mounted = true;
    fetch('/api/auth/providers')
      .then((r) => r.json())
      .then((data) => {
        if (mounted) setProviders(data);
      })
      .catch(() => {
        if (mounted) setProviders(null);
      });
    return () => { mounted = false; };
  }, []);

  // When email changes, compute cooldown for that specific email
  useEffect(() => {
    updateRemainingForEmail(email);
    // cleanup on unmount
    return () => { if (tickRef.current) window.clearInterval(tickRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  function readStorage(): Record<string, number> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      return JSON.parse(raw) as Record<string, number>;
    } catch {
      return {};
    }
  }

  function writeStorage(map: Record<string, number>) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(map)); } catch { /* ignore */ }
  }

  function updateRemainingForEmail(targetEmail: string) {
    if (tickRef.current) { window.clearInterval(tickRef.current); tickRef.current = null; }
    if (!targetEmail) { setRemaining(0); return; }
    const map = readStorage();
    const last = map[targetEmail];
    if (!last) { setRemaining(0); return; }
    const elapsed = Math.floor((Date.now() - last) / 1000);
    const rem = Math.max(0, COOLDOWN_SECONDS - elapsed);
    setRemaining(rem);
    if (rem > 0) {
      tickRef.current = window.setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            if (tickRef.current) { window.clearInterval(tickRef.current); tickRef.current = null; }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }

  function getProviderUrlFor(emailAddress: string): string | null {
    const domain = emailAddress.split('@')[1]?.toLowerCase();
    if (!domain) return null;
    return emailProviderMap[domain] ?? null;
  }

  async function handleProviderSignIn(id: string) {
    setLoading(true);
    await signIn(id, { callbackUrl });
    setLoading(false);
  }

  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    if (remaining > 0) {
      toast.error(`Bitte warte ${remaining}s bevor du erneut an ${email} sendest.`);
      return;
    }

    setLoading(true);
    const res = await signIn('email', { email, redirect: false, callbackUrl });
    setLoading(false);

    if (res && (res as any).ok) {
      const map = readStorage();
      map[email] = Date.now();
      writeStorage(map);
      updateRemainingForEmail(email);
      setSentForEmail(email);
      toast.success(`Link an ${email} gesendet. Prüfe dein Postfach.`);
    } else {
      toast.error(`Konnte Link nicht an ${email} senden.`);
    }
  }

  const oauthProviders = providers
    ? Object.values(providers).filter((p: any) => p.type === 'oauth')
    : [{ id: 'google', name: 'Google' }, { id: 'github', name: 'GitHub' }, { id: 'discord', name: 'Discord' }];

  function ProviderIcon({ id }: { id: string }) {
    switch (id) {
      case 'google': return <SiGoogle className="mr-2 h-4 w-4" />;
      case 'github': return <SiGithub className="mr-2 h-4 w-4" />;
      case 'discord': return <SiDiscord className="mr-2 h-4 w-4" />;
      default: return <SiGithub className="mr-2 h-4 w-4" />;
    }
  }

  const providerUrl = sentForEmail ? getProviderUrlFor(sentForEmail) : null;
  const mailtoLink = 'mailto:'; // opens native mail app to compose (not inbox)

  return (
    <div className="w-full max-w-md bg-white dark:bg-zinc-900 p-6 rounded shadow">
      <h1 className="text-lg font-semibold mb-2">Anmelden / Registrieren</h1>
      <p className="text-sm text-zinc-500 mb-4">mit Social‑Account oder E‑Mail</p>

      <div className="space-y-2 mb-4">
        {oauthProviders.map((p: any) => (
          <Button key={p.id} onClick={() => handleProviderSignIn(p.id)} className="w-full flex items-center justify-center" disabled={loading}>
            <ProviderIcon id={p.id} />
            <span>Mit {p.name} anmelden</span>
          </Button>
        ))}
      </div>

      <Separator className="my-4" />

      <form onSubmit={handleEmailSignIn} className="space-y-3">
        <Input type="email" placeholder="deine@email.de" value={email} onChange={(e) => setEmail(e.target.value.trim())} autoComplete="email" required />
        <div className="flex items-center justify-between">
          <Button type="submit" disabled={loading || !email || remaining > 0}>
            {remaining > 0 ? `Warte ${remaining}s` : 'Link zum Anmelden senden'}
          </Button>
        </div>

        {remaining > 0 && (
          <p className="text-xs text-zinc-500 mt-2">Tippfehler? Ändere die E‑Mail‑Adresse — dann kannst du sofort erneut senden.</p>
        )}
      </form>

      {sentForEmail && (
        <div className="mt-3 flex flex-col gap-2">
          {providerUrl && (
            <Button
              type="button"
              className="w-full"
              onClick={() => window.open(providerUrl, '_blank', 'noopener')}
            >
              Postfach öffnen ({new URL(providerUrl).hostname.replace('www.', '')})
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => (window.location.href = `mailto:${sentForEmail}`)}
          >
            Mail‑App öffnen
          </Button>
        </div>
      )}
    </div>
  );
}