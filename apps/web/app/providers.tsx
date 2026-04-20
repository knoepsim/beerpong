'use client';

import React, { useEffect } from 'react';
import { SessionProvider, signOut } from 'next-auth/react';
import { Toaster, toast } from 'sonner';
import { useSearchParams, useRouter } from 'next/navigation';

export default function Providers({
    children,
    session,
}: {
    children: React.ReactNode;
    session?: any;
}) {
    return (
        <SessionProvider session={session}>
            <Toaster position="bottom-center" closeButton duration={5000} />
            <FlashMessage />
            {children}
        </SessionProvider>
    );
}

// Client component: liest ?smsg=... und zeigt Sonner, entfernt dann den Param
function FlashMessage() {
    // 'use client' not required here because file is already client
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        const s = searchParams?.get('s');
        if (!s) return;

        // mappe keys auf Messages (erweiterbar)
        switch (s) {
            case 'signoutSuccess':
                toast.success('Du wurdest abgemeldet.');
                break;
            case 'signoutError':
                toast.error("Fehler beim Abmelden", {
                    description: "möglicherweise erneut versuchen",
                    duration: 10000,
                    classNames: {
                        actionButton: "justify-center !bg-red-500 !text-white",
                    },
                    action: {
                        label: "Abmelden",
                        onClick: () => signOut({ callbackUrl: '/?s=signoutSuccess' }),
                    },
                });
                break;
            case 'signinSuccess':
                toast.success('Erfolgreich angemeldet.');
                break;
            case 'signinError':
                toast.error('Fehler bei der Anmeldung.');
                break;
            case 'profileSaved':
                toast.success('Profil gespeichert.');
                break;
            case "authRequired":
                toast.error("Um auf diese Seite zuzugreifen, ist eine Anmeldung erforderlich", {
                    description: "Bitte melde dich an, um fortzufahren.",
                    position: "top-center",
                });
                break;
            default:
            // toast(s);

        }

        // URL bereinigen (Param entfernen), ohne Seite neu zu laden
        const params = new URLSearchParams(
            Array.from(searchParams?.entries() ?? []).filter(([k]) => k !== 's')
        );
        const newPath = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''
            }`;
        // replace so the toast is only shown once and URL wird sauber
        router.replace(newPath, { scroll: false });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams?.toString()]); // re-run only when search changes

    return null;
}