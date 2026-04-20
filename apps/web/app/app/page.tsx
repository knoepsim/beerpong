import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../server/auth/config';
import { prisma } from '@/server/db';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Users, UserCircle, Settings, Plus, ArrowRight, Activity } from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  // Statistiken oder aktuelle Turniere laden
  const tournamentCount = await prisma.tournament.count();
  const activeTournaments = await prisma.tournament.findMany({
    where: {
      status: {
        in: ['CHECKIN', 'GROUP_PHASE', 'KO_PHASE']
      }
    },
    take: 3,
    orderBy: { startDate: 'asc' }
  });

  return (
    <div className="container mx-auto py-10 px-4 space-y-8">
      {/* Header Bereich */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-8">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Hallo, {user?.username || user?.name || 'Spieler'}!</h1>
          <p className="text-muted-foreground text-lg">Willkommen zurück am Tisch. Bereit für die nächste Runde?</p>
        </div>
        <div className="flex gap-3">
           {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
             <Button asChild>
                <Link href="/app/tournaments/create">
                    <Plus className="mr-2 h-4 w-4" /> Turnier erstellen
                </Link>
             </Button>
           )}
           <Button variant="outline" asChild>
              <Link href="/app/tournaments">Alle Turniere</Link>
           </Button>
        </div>
      </div>

      {/* Quick Stats / Overview */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktive Turniere</CardTitle>
            <Activity className="h-4 w-4 text-primary ml-auto" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeTournaments.length}</div>
            <p className="text-xs text-muted-foreground">Spiele laufen aktuell</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Turniere gesamt</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground ml-auto" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tournamentCount}</div>
            <p className="text-xs text-muted-foreground">In der Datenbank</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dein Status</CardTitle>
            <UserCircle className="h-4 w-4 text-muted-foreground ml-auto" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{user?.role?.toLowerCase() || 'User'}</div>
            <p className="text-xs text-muted-foreground">Berechtigungsstufe</p>
          </CardContent>
        </Card>
      </div>

      {/* Hauptbereich */}
      <div className="grid gap-8 md:grid-cols-2">
        
        {/* Laufende Turniere */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" /> Live dabei
            </h2>
            <Button variant="link" asChild className="px-0">
               <Link href="/app/tournaments">Alle ansehen <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>
          
          {activeTournaments.length === 0 ? (
            <Card className="border-dashed py-12 flex flex-col items-center justify-center text-center">
               <Trophy className="h-10 w-10 text-muted-foreground/30 mb-4" />
               <p className="text-muted-foreground">Aktuell finden keine Turniere statt.</p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {activeTournaments.map(t => (
                <Link key={t.id} href={`/app/tournaments/${t.id}`}>
                  <Card className="hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer border-l-4 border-l-primary">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <div className="font-bold">{t.title}</div>
                        <div className="text-xs text-muted-foreground uppercase font-black tracking-widest">{t.status}</div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Schnellzugriff-Menü */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Schnellzugriff</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Link href="/app/account">
              <Card className="h-full hover:border-primary transition-all">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-primary">
                    <Settings className="h-5 w-5" /> Profil
                  </CardTitle>
                  <CardDescription>Verwalte deine Daten und Telefonnummer.</CardDescription>
                </CardHeader>
              </Card>
            </Link>
            <Link href="/app/tournaments">
              <Card className="h-full hover:border-primary transition-all">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-primary">
                    <Users className="h-5 w-5" /> Teams
                  </CardTitle>
                  <CardDescription>Finde ein Team oder schau dir deine Gruppe an.</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
