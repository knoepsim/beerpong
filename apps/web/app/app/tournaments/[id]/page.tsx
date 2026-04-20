import { prisma } from "@/server/db";
import { notFound } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Calendar, Users } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth/config";
import { StandingsTable } from "@/components/tournament/StandingsTable";
import { TournamentActions } from "@/components/tournament/TournamentActions";
import Link from "next/link";

async function getStandings(id: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/tournaments/${id}/standings`, {
        cache: 'no-store'
    });
    if (!response.ok) return {};
    return await response.json();
  } catch {
    return {};
  }
}

export default async function TournamentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  const tournament = await prisma.tournament.findUnique({
    where: { id },
    include: {
      creator: true,
      tables: true,
      teams: {
        include: {
          participants: {
            include: { user: true }
          }
        }
      }
    }
  });

  if (!tournament) {
    notFound();
  }

  const matches = await prisma.match.findMany({
    where: { tournamentId: id },
    include: { teamRed: true, teamBlue: true, table: true }
  });
  
  const standings = await getStandings(id);

  const userId = (session?.user as any)?.id;
  const isAdminOrManager = userId === tournament.creatorId || (session?.user as any)?.role === 'ADMIN';

  // Prüfen ob User schon in einem Team ist
  const userParticipant = await prisma.participant.findFirst({
    where: { 
      userId, 
      team: { tournamentId: id } 
    }
  });
  
  const canJoin = !userParticipant && tournament.teams.length < tournament.maxParticipants;

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground font-medium">
             <Link href="/app/tournaments" className="hover:underline">Turniere</Link>
             <span>/</span>
             <span className="text-foreground">{tournament.title}</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">{tournament.title}</h1>
          <div className="flex flex-wrap gap-4 text-muted-foreground text-sm">
            <div className="flex items-center">
              <Calendar className="mr-1.5 h-4 w-4" />
              {new Date(tournament.startDate).toLocaleDateString('de-DE', {
                day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
              })}
            </div>
            <div className="flex items-center">
              <Users className="mr-1.5 h-4 w-4" />
              {tournament.teams.length} / {tournament.maxParticipants} Teams
            </div>
          </div>
        </div>
        <TournamentActions 
            tournamentId={id} 
            status={tournament.status} 
            isAdminOrManager={isAdminOrManager}
            canJoin={canJoin}
            teams={tournament.teams}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-8">
          
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Tabellen</h2>
            <StandingsTable standings={standings} />
          </div>

          <Separator />

          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Spielplan</h2>
            {matches.length === 0 ? (
                <div className="text-center py-10 border rounded-lg border-dashed text-muted-foreground">
                    Der Spielplan wird generiert, sobald das Turnier startet.
                </div>
            ) : (
                <div className="grid gap-4">
                    {matches.map((match: any) => (
                        <Card key={match.id} className="overflow-hidden hover:border-primary/50 transition-colors">
                            <Link href={`/app/tournaments/${id}/matches/${match.id}`} className="block">
                                <div className="flex items-center justify-between p-4">
                                    <div className="flex-1 text-right font-bold pr-4 truncate">{match.teamRed.name}</div>
                                    <div className="flex flex-col items-center justify-center px-4 py-2 bg-zinc-100 dark:bg-zinc-800 rounded min-w-[100px] border">
                                        {match.status === 'FINISHED' ? (
                                            <span className="text-lg font-black">{match.scoreRed} : {match.scoreBlue}</span>
                                        ) : (
                                            <span className="text-sm font-bold text-muted-foreground uppercase">VS</span>
                                        )}
                                        <span className="text-[10px] uppercase font-bold text-muted-foreground mt-0.5">{match.table?.name || "TBA"}</span>
                                    </div>
                                    <div className="flex-1 text-left font-bold pl-4 truncate">{match.teamBlue.name}</div>
                                </div>
                            </Link>
                        </Card>
                    ))}
                </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Turnier-Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4 p-3 rounded-md bg-zinc-100 dark:bg-zinc-900 border">
                <div className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />
                <span className="font-bold uppercase tracking-wider text-xs">
                  {tournament.status}
                </span>
              </div>
              <div className="space-y-4 text-sm mt-6">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Teamgröße</span>
                  <span className="font-medium">{tournament.teamSize} Personen</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Modus</span>
                  <span className="font-medium capitalize">{tournament.mode.toLowerCase()}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Weiterkommen</span>
                    <span className="font-medium">{tournament.numTeamsAdvancing} pro Gruppe</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-md font-bold">Teams</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-0">
               <div className="divide-y border-t">
                  {tournament.teams.length === 0 && (
                      <div className="p-4 text-center text-sm text-muted-foreground italic">
                          Bisher keine Teams
                      </div>
                  )}
                  {tournament.teams.map((team: any) => (
                    <div key={team.id} className="p-4 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="font-bold truncate text-sm">{team.name}</div>
                        <div className="text-[10px] text-muted-foreground truncate">
                            {team.participants.map((p: any) => p.user.username || p.user.name).join(", ")}
                        </div>
                      </div>
                      <div className="ml-2">
                        {team.isCheckedIn ? (
                            <div className="px-2 py-0.5 rounded bg-green-100 text-green-700 text-[9px] font-black uppercase">Checked-In</div>
                        ) : (
                            <div className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-500 text-[9px] font-black uppercase italic">Pending</div>
                        )}
                      </div>
                    </div>
                  ))}
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
