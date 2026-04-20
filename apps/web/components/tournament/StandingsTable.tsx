"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Standing {
  id: string;
  name: string;
  played: number;
  won: number;
  lost: number;
  cupsScored: number;
  cupsReceived: number;
  points: number;
}

interface StandingsTableProps {
  standings: Record<string, Standing[]>;
}

export function StandingsTable({ standings }: StandingsTableProps) {
  const groups = Object.keys(standings).sort();

  if (groups.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        Noch keine Tabellen verfügbar. Starten Sie das Turnier, um Gruppen zu generieren.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {groups.map((group) => (
        <Card key={group}>
          <CardHeader className="bg-zinc-50 dark:bg-zinc-900/50 py-3">
            <CardTitle className="text-lg">Gruppe {group}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Pos</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead className="text-center">Sp</TableHead>
                  <TableHead className="text-center">S</TableHead>
                  <TableHead className="text-center">N</TableHead>
                  <TableHead className="text-center">Becher</TableHead>
                  <TableHead className="text-right font-bold">Pkt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {standings[group].map((team, index) => (
                  <TableRow key={team.id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell className="font-bold">{team.name}</TableCell>
                    <TableCell className="text-center">{team.played}</TableCell>
                    <TableCell className="text-center">{team.won}</TableCell>
                    <TableCell className="text-center">{team.lost}</TableCell>
                    <TableCell className="text-center text-xs">
                      {team.cupsScored}:{team.cupsReceived}
                    </TableCell>
                    <TableCell className="text-right font-bold text-primary">
                      {team.points}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
