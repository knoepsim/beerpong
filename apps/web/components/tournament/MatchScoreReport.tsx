"use client";

import React, { useState } from "react";
import { CupGrid } from "./CupGrid";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface MatchScoreReportProps {
  matchId: string;
  teamRedName: string;
  teamBlueName: string;
  teamRedId: string;
  teamBlueId: string;
  onSuccess?: () => void;
}

export function MatchScoreReport({
  matchId,
  teamRedName,
  teamBlueName,
  teamRedId,
  teamBlueId,
  onSuccess,
}: MatchScoreReportProps) {
  const router = useRouter();
  const [scoreRed, setScoreRed] = useState(10);
  const [scoreBlue, setScoreBlue] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    // Validierung: Einer muss gewonnen haben (0 Becher übrig beim Gegner)
    if (scoreRed > 0 && scoreBlue > 0) {
      toast.error("Ein Spiel kann erst beendet werden, wenn ein Team alle Becher getroffen hat.");
      return;
    }

    if (scoreRed === 0 && scoreBlue === 0) {
        toast.error("Unentschieden ist beim Beerpong nicht vorgesehen.");
        return;
    }

    setIsSubmitting(true);
    try {
      const winnerTeamId = scoreRed > 0 ? teamRedId : teamBlueId;
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/matches/${matchId}/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          scoreRed,
          scoreBlue,
          winnerTeamId,
        }),
      });

      if (!response.ok) {
        throw new Error("Fehler beim Senden des Ergebnisses");
      }

      toast.success("Ergebnis erfolgreich gemeldet!");
      onSuccess?.();
      router.refresh();
    } catch (error) {
      toast.error("Das Ergebnis konnte nicht gespeichert werden.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Ergebnis melden</CardTitle>
      </CardHeader>
      <CardContent className="grid md:grid-cols-2 gap-12 py-8">
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-center text-red-600">{teamRedName}</h3>
          <CupGrid 
            color="red" 
            onChange={(count) => setScoreRed(count)} 
            initialCount={10}
          />
        </div>
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-center text-blue-600">{teamBlueName}</h3>
          <CupGrid 
            color="blue" 
            onChange={(count) => setScoreBlue(count)} 
            initialCount={10}
          />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-center gap-4 bg-zinc-50 dark:bg-zinc-900 p-6 rounded-b-lg">
        <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Gewinner:</p>
            <p className="text-2xl font-black uppercase tracking-tight">
                {scoreRed > scoreBlue ? teamRedName : scoreBlue > scoreRed ? teamBlueName : "Noch kein Gewinner"}
            </p>
        </div>
        <Button 
            size="lg" 
            className="w-full md:w-auto px-12"
            onClick={handleSubmit}
            disabled={isSubmitting || (scoreRed > 0 && scoreBlue > 0)}
        >
          {isSubmitting ? "Wird gespeichert..." : "Ergebnis bestätigen"}
        </Button>
      </CardFooter>
    </Card>
  );
}
