import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { MatchStatus, Role } from '@beerpong/db';

@Injectable()
export class MatchService {
  constructor(private readonly prisma: PrismaService) {}

  async reportScore(user: any, matchId: string, data: { scoreRed: number; scoreBlue: number; winnerTeamId: string }) {
    const match = await this.prisma.client.match.findUnique({
      where: { id: matchId },
      include: { tournament: true },
    });
    if (!match) throw new NotFoundException('Match not found');

    const isHelper = await this.prisma.client.tournamentHelper.findFirst({
        where: { userId: user.id, tournamentId: match.tournamentId }
    });
    const isCreator = match.tournament.creatorId === user.id;
    const isAdmin = user.role === Role.ADMIN;

    if (!isAdmin && !isCreator && !isHelper) {
      throw new ForbiddenException('You are not authorized to report scores for this tournament');
    }

    return this.prisma.client.$transaction(async (tx) => {
        const updatedMatch = await tx.match.update({
            where: { id: matchId },
            data: {
                scoreRed: data.scoreRed,
                scoreBlue: data.scoreBlue,
                winnerTeamId: data.winnerTeamId,
                status: MatchStatus.FINISHED,
            },
        });

        await tx.tournamentLog.create({
            data: {
                tournamentId: match.tournamentId,
                action: 'SCORE_REPORTED',
                actorId: user.id,
                data: {
                    matchId: match.id,
                    scoreRed: data.scoreRed,
                    scoreBlue: data.scoreBlue,
                    winnerTeamId: data.winnerTeamId,
                },
            },
        });

        return updatedMatch;
    });
  }

  async findByTournament(tournamentId: string) {
    return this.prisma.client.match.findMany({
      where: { tournamentId },
      include: { teamRed: true, teamBlue: true, table: true },
    });
  }
}
