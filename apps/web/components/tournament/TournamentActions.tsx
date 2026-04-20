"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Play, Forward, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TournamentActionsProps {
  tournamentId: string;
  status: string;
  isAdminOrManager: boolean;
  canJoin: boolean;
  teams?: any[];
}

export function TournamentActions({
  tournamentId,
  status,
  isAdminOrManager,
  canJoin,
  teams = [],
}: TournamentActionsProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  const handleStartTournament = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`${apiUrl}/tournaments/${tournamentId}/start`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Fehler");
      }
      toast.success("Turnier wurde gestartet!");
      router.refresh();
    } catch (e: any) {
      toast.error(e.message || "Fehler beim Starten des Turniers.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateTeam = async () => {
    if (!newTeamName) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`${apiUrl}/tournaments/${tournamentId}/teams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: newTeamName }),
      });
      if (!response.ok) {
          const err = await response.json();
          throw new Error(err.message || "Fehler");
      }
      toast.success("Team wurde erstellt!");
      setIsCreateTeamOpen(false);
      setNewTeamName("");
      router.refresh();
    } catch (e: any) {
      toast.error(e.message || "Fehler beim Erstellen des Teams.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckIn = async (teamId: string) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`${apiUrl}/tournaments/teams/${teamId}/checkin`, {
        method: "PUT",
        credentials: "include",
      });
      if (!response.ok) throw new Error();
      toast.success("Team eingecheckt!");
      router.refresh();
    } catch {
      toast.error("Check-in fehlgeschlagen.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartKo = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`${apiUrl}/tournaments/${tournamentId}/start-ko`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) throw new Error();
      toast.success("KO-Phase wurde gestartet!");
      router.refresh();
    } catch {
      toast.error("Fehler beim Starten der KO-Phase.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
        <div className="flex gap-2 justify-end">
            {isAdminOrManager && status === "PLANNING" && (
                <Button onClick={handleStartTournament} disabled={isSubmitting}>
                <Play className="mr-2 h-4 w-4" /> Turnier starten
                </Button>
            )}

            {isAdminOrManager && status === "GROUP_PHASE" && (
                <Button onClick={handleStartKo} disabled={isSubmitting} variant="secondary">
                <Forward className="mr-2 h-4 w-4" /> KO-Phase starten
                </Button>
            )}

            {status === "PLANNING" && canJoin && (
                <Dialog open={isCreateTeamOpen} onOpenChange={setIsCreateTeamOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline">
                    <Plus className="mr-2 h-4 w-4" /> Team erstellen
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                    <DialogTitle>Neues Team registrieren</DialogTitle>
                    <DialogDescription>
                        Gib deinem Team einen Namen. Du wirst automatisch als erstes Mitglied hinzugefügt.
                    </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Teamname</Label>
                        <Input
                        id="name"
                        value={newTeamName}
                        onChange={(e) => setNewTeamName(e.target.value)}
                        placeholder="z.B. Die Spritis"
                        />
                    </div>
                    </div>
                    <DialogFooter>
                    <Button onClick={handleCreateTeam} disabled={isSubmitting || !newTeamName}>
                        {isSubmitting ? "Wird erstellt..." : "Team beitreten"}
                    </Button>
                    </DialogFooter>
                </DialogContent>
                </Dialog>
            )}
        </div>

        {isAdminOrManager && status === "PLANNING" && teams.some(t => !t.isCheckedIn) && (
            <div className="bg-zinc-100 dark:bg-zinc-900 p-4 rounded-lg border space-y-3">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Check-in benötigt:</p>
                {teams.filter(t => !t.isCheckedIn).map(team => (
                    <div key={team.id} className="flex items-center justify-between bg-background p-2 rounded border shadow-sm">
                        <span className="text-sm font-bold">{team.name}</span>
                        <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => handleCheckIn(team.id)} disabled={isSubmitting}>
                            <CheckCircle className="mr-1 h-3 w-3 text-green-600" /> Einchecken
                        </Button>
                    </div>
                ))}
            </div>
        )}
    </div>
  );
}
