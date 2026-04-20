import { prisma } from "@/server/db";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trophy, Calendar, Users } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth/config";

export default async function TournamentsPage() {
  const session = await getServerSession(authOptions);
  
  const tournaments = await prisma.tournament.findMany({
    include: { creator: true },
    orderBy: { startDate: 'desc' }
  });

  const isAdminOrManager = (session?.user as any)?.role === 'ADMIN' || (session?.user as any)?.role === 'MANAGER';

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Turniere</h1>
          <p className="text-muted-foreground">Verwalte deine Turniere oder nimm an neuen teil.</p>
        </div>
        {isAdminOrManager && (
          <Button asChild>
            <Link href="/app/tournaments/create">
              <Plus className="mr-2 h-4 w-4" /> Turnier erstellen
            </Link>
          </Button>
        )}
      </div>

      {tournaments.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
          <div className="rounded-full bg-zinc-100 p-3 mb-4 dark:bg-zinc-800">
            <Trophy className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold">Keine Turniere gefunden</h3>
          <p className="text-muted-foreground mb-6">Es wurden noch keine Turniere angelegt.</p>
          {isAdminOrManager && (
            <Button asChild variant="outline">
              <Link href="/app/tournaments/create">Das erste Turnier erstellen</Link>
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tournaments.map((tournament) => (
            <Link key={tournament.id} href={`/app/tournaments/${tournament.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{tournament.title}</CardTitle>
                    <div className="px-2 py-1 text-xs rounded bg-zinc-100 dark:bg-zinc-800 font-medium capitalize">
                      {tournament.status.toLowerCase()}
                    </div>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {tournament.description || "Keine Beschreibung vorhanden."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4" />
                      {new Date(tournament.startDate).toLocaleDateString('de-DE', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                    <div className="flex items-center">
                      <Users className="mr-2 h-4 w-4" />
                      Teamgröße: {tournament.teamSize} Personen
                    </div>
                    <div className="flex items-center">
                      <Trophy className="mr-2 h-4 w-4" />
                      {tournament.maxParticipants} Teams max.
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
