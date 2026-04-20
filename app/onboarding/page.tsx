'use client';

import * as z from 'zod';
import React, { useEffect, useState } from 'react';
import { Loader2, Check, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';

import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const profileSchema = z.object({
  username: z
    .string()
    .min(4, 'Der Nutzername muss mindestens 4 Zeichen lang sein')
    .max(30, 'Der Nutzername darf maximal 30 Zeichen haben')
    .regex(/^[a-zA-Z0-9_]+$/, 'Nur Buchstaben, Zahlen und Unterstrich erlaubt'),
  firstName: z.string().min(2, 'Bitte mindestens 2 Zeichen').max(50, 'Maximal 50 Zeichen'),
  lastName: z.string().min(2, 'Bitte mindestens 2 Zeichen').max(50, 'Maximal 50 Zeichen'),
  phone: z.string().regex(/^\+?[\d]{7,15}$/, 'Bitte gültige Handynummer (z.B. +491701234567)'),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function Onboarding() {
  const [profileComplete, setProfileComplete] = useState(false);
  const [originalUsername, setOriginalUsername] = useState<string | null>(null);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get('callbackUrl') ?? '/app';

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    mode: 'onChange',
    defaultValues: {
      username: '',
      firstName: '',
      lastName: '',
      phone: '',
    },
  });

  // fetch existing profile and prefill form if available
  useEffect(() => {
    let mounted = true;
    async function loadProfile() {
      try {
        const res = await fetch('/api/profile', { credentials: 'include', cache: 'no-store' });
        if (!mounted) return;
        if (res.ok) {
          const data = await res.json();
          const user = data?.user;
          if (user) {
            form.reset({
              username: user.username ?? user.name ?? '',
              firstName: user.firstName ?? '',
              lastName: user.lastName ?? '',
              phone: user.phone ?? '',
            });
            setUserEmail(user.email ?? '');
            setOriginalUsername(user.username ?? null);
            if (user.profileComplete) {
              setProfileComplete(true);
            }
          }
        }
      } catch (e) {
        // ignore - leave defaults
      }
    }
    loadProfile();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // availability check (debounced)
  const username = form.watch('username');
  useEffect(() => {
    setUsernameAvailable(null);

    // kein Check wenn leer
    if (!username || username.trim() === '') {
      setChecking(false);
      return;
    }

    // unverändert = verfügbar
    if (originalUsername && username === originalUsername) {
      setUsernameAvailable(true);
      setChecking(false);
      return;
    }

    const t = setTimeout(async () => {
      setChecking(true);
      try {
        const res = await fetch(`/api/profile/check-username?username=${encodeURIComponent(username)}`, { cache: 'no-store' });
        const data = await res.json();
        setUsernameAvailable(!!data.available);
      } catch {
        setUsernameAvailable(null);
      } finally {
        setChecking(false);
      }
    }, 400);

    return () => {
      clearTimeout(t);
      setChecking(false);
    };
  }, [username, originalUsername]);

  function sanitizePhone(input?: string) {
    if (!input) return '';
    // keep leading + if present, remove spaces and hyphens
    const hasPlus = input.trim().startsWith('+');
    const cleaned = input.replace(/[\s-]/g, '');
    return hasPlus ? (cleaned.startsWith('+') ? cleaned : '+' + cleaned.replace(/^\+/, '')) : cleaned.replace(/^\+/, '');
  }

  async function onSubmit(values: ProfileForm) {
    const payload = {
      ...values,
      phone: sanitizePhone(values.phone),
    };

    const res = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setProfileComplete(true);
      router.push(callbackUrl);
    } else {
      const data = await res.json().catch(() => null);
      console.error('Profile save failed', data);
    }
  }

  // disable submit if username not available (remember to coerce boolean)
  const submitDisabled = !form.formState.isValid || (!!username && usernameAvailable === false);
  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center font-sans  p-6">
      <div className="w-full max-w-lg rounded bg-white p-6 shadow dark:bg-zinc-900">
        <h1 className="mb-2 text-xl font-semibold">Account unvollständig</h1>
        <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-300">Verfollständige dein Profil, um zu starten.</p>

        {profileComplete ? (
          <div className="space-y-3">
            <div className="rounded border border-green-300 bg-green-50 p-4 text-green-800">
              Dein Profil ist vollständig.
            </div>

            <div>
              <Button className="w-full" onClick={() => router.push(callbackUrl)}>
                → Weiter zur App
              </Button>
            </div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormItem>
                <FormLabel>E‑Mail</FormLabel>
                <FormControl>
                  <Input value={userEmail} disabled />
                </FormControl>
              </FormItem>

              <FormField
                control={form.control}
                name="username"
                render={({ field }) => {


                  return (
                    <FormItem>
                      <FormLabel className="mb-0">Nutzername</FormLabel>

                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            autoComplete="username"
                            className="pr-10"
                            aria-invalid={!!form.formState.errors.username || usernameAvailable === false}
                            maxLength={30}
                          />

                          {/* Icon innerhalb des Inputs, rechts */}
                          <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                            {checking ? (
                              <Loader2 className="h-4 w-4 text-zinc-500 animate-spin" />
                            ) : usernameAvailable === true ? (
                              <Check className="h-4 w-4 text-green-600" aria-hidden />
                            ) : usernameAvailable === false ? (
                              <X className="h-4 w-4 text-red-600" aria-hidden />
                            ) : null}
                          </div>
                        </div>
                      </FormControl>

                      <FormMessage />

                      {/* Availability-Fehler unter dem Input, an gleicher Position wie FormMessage */}
                      {!form.formState.errors.username && usernameAvailable === false && !checking && (
                        <div className="text-sm text-red-600 mt-1">Nutzername nicht mehr verfügbar. Versuche einen anderen.</div>
                      )}
                    </FormItem>
                  );
                }}
              />

              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vorname</FormLabel>
                    <FormControl>
                      <Input {...field} autoComplete="given-name" maxLength={50} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nachname</FormLabel>
                    <FormControl>
                      <Input {...field} autoComplete="family-name" maxLength={50} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Handynummer</FormLabel>
                    <FormControl>
                      <Input {...field} autoComplete="tel" placeholder="+491701234567" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-between">
                <Button type="submit" disabled={submitDisabled}>
                  Speichern
                </Button>

                <div className="text-sm">
                  {checking ? <span className="flex items-center gap-2 text-zinc-500">
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  </span> : form.formState.isValid && usernameAvailable ? (
                    <span className="flex items-center gap-2 text-green-600">
                      <Check className="h-4 w-4" aria-hidden />
                      <span>bereit zum Speichern</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 text-red-600">
                      <X className="h-4 w-4" aria-hidden />
                      <span>{!form.formState.isValid ? "alle Felder ausfüllen" : "Nutzername nicht verfügbar"}</span>
                    </span>
                  )}
                </div>
              </div>
            </form>
          </Form>
        )}
      </div>
    </div>
  );
}
