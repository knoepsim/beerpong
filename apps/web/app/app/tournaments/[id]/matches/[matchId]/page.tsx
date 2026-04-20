import { prisma } from "@/server/db";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth/config";
import { MatchScoreReport } from "@/components/tournament/MatchScoreReport";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function MatchDetailPage({ params }: { params: Promise<{ id: string, matchId: string }> }) {
  const { id, matchId } = await params;
  const session = await getServerSession(authOptions);

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      teamRed: true,
      teamBlue: true,
      tournament: true,
    },
  });

  if (!match || match.tournamentId !== id) {
    notFound();
  }

  const userId = (session?.user as any)?.id;
  
  const isHelper = await prisma.tournamentHelper.findFirst({
    where: { userId, tournamentId: id }
  });
  
  const isCreator = match.tournament.creatorId === userId;
  const isAdmin = (session?.user as any)?.role === 'ADMIN';

  const canReport = isAdmin || isCreator || !!isHelper;

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-8">
        <Button variant="ghost" asChild className="-ml-4 mb-4">
          <Link href={`/app/tournaments/${id}`}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Zurück zum Turnier
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Spielbericht</h1>
        <p className="text-muted-foreground">Melde das Ergebnis für dieses Match.</p>
      </div>

      {!canReport && match.status !== 'FINISHED' ? (
          <div className="bg-amber-50 border-amber-200 border p-6 rounded-lg text-amber-800 text-center">
              Nur Turnier-Manager oder Helfer können Ergebnisse melden.
          </div>
      ) : match.status === 'FINISHED' ? (
          <div className="space-y-8">
              <div className="bg-green-50 border-green-200 border p-6 rounded-lg text-green-800 text-center font-bold text-xl">
                  Spiel Beendet: {match.scoreRed} : {match.scoreBlue}
              </div>
              <div className="opacity-50 pointer-events-none">
                <MatchScoreReport 
                    matchId={matchId}
                    teamRedName={match.teamRed.name}
                    teamBlueName={match.teamBlue.name}
                    teamRedId={match.teamRed.id}
                    teamBlueId={match.teamBlue.id}
                />
              </div>
          </div>
      ) : (
        <MatchScoreReport 
            matchId={matchId}
            teamRedName={match.teamRed.name}
            teamBlueName={match.teamBlue.name}
            teamRedId={match.teamRed.id}
            teamBlueId={match.teamBlue.id}
        />
      )}
    </div>
  );
}
