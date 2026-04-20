import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Role, TournamentStatus } from '@beerpong/db';

@Injectable()
export class TournamentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: any, data: any) {
    if (user.role !== Role.ADMIN && user.role !== Role.MANAGER) {
      throw new ForbiddenException('Only admins or managers can create tournaments');
    }

    const { numTables, ...tournamentData } = data;

    return this.prisma.client.tournament.create({
      data: {
        ...tournamentData,
        startDate: new Date(tournamentData.startDate),
        creatorId: user.id,
        status: TournamentStatus.PLANNING,
        tables: {
          create: Array.from({ length: numTables || 0 }).map((_, i) => ({
            name: `Tisch ${i + 1}`,
          })),
        },
      },
    });
  }

  async findAll() {
    return this.prisma.client.tournament.findMany({
      include: { creator: true },
    });
  }

  async findOne(id: string) {
    const tournament = await this.prisma.client.tournament.findUnique({
      where: { id },
      include: {
        creator: true,
        tables: true,
        teams: {
          include: {
            participants: {
              include: { user: true },
            },
          },
        },
      },
    });
    if (!tournament) throw new NotFoundException('Tournament not found');
    return tournament;
  }

  // --- Team Logik ---

  async createTeam(user: any, tournamentId: string, teamName: string) {
    const tournament = await this.prisma.client.tournament.findUnique({ where: { id: tournamentId } });
    if (!tournament) throw new NotFoundException('Tournament not found');
    
    if (tournament.status !== TournamentStatus.PLANNING && tournament.status !== TournamentStatus.CHECKIN) {
      throw new BadRequestException('Teams can only be created during planning or check-in phase');
    }

    const teamCount = await this.prisma.client.team.count({ where: { tournamentId } });
    if (teamCount >= tournament.maxParticipants) {
      throw new BadRequestException('Tournament is already full');
    }

    return this.prisma.client.team.create({
      data: {
        name: teamName,
        tournamentId,
        participants: {
          create: {
            userId: user.id,
          },
        },
      },
    });
  }

  async joinTeam(user: any, teamId: string) {
    const team = await this.prisma.client.team.findUnique({
      where: { id: teamId },
      include: { tournament: true, participants: true },
    });
    if (!team) throw new NotFoundException('Team not found');

    if (team.tournament.status !== TournamentStatus.PLANNING && team.tournament.status !== TournamentStatus.CHECKIN) {
        throw new BadRequestException('Cannot join team at this stage');
    }

    if (team.participants.length >= team.tournament.teamSize) {
      throw new BadRequestException('Team is already full');
    }

    const alreadyParticipating = await this.prisma.client.participant.findFirst({
        where: { 
            userId: user.id, 
            team: { tournamentId: team.tournamentId } 
        }
    });
    
    if (alreadyParticipating) {
      throw new BadRequestException('You are already in a team for this tournament');
    }

    return this.prisma.client.participant.create({
      data: {
        userId: user.id,
        teamId,
      },
    });
  }

  async checkInTeam(user: any, teamId: string) {
    const team = await this.prisma.client.team.findUnique({
      where: { id: teamId },
      include: { tournament: true },
    });
    if (!team) throw new NotFoundException('Team not found');

    const isHelper = await this.prisma.client.tournamentHelper.findFirst({
        where: { userId: user.id, tournamentId: team.tournamentId }
    });
    const isCreator = team.tournament.creatorId === user.id;
    const isAdmin = user.role === Role.ADMIN;

    if (!isAdmin && !isCreator && !isHelper) {
      throw new ForbiddenException('Not authorized to check-in teams');
    }

    return this.prisma.client.team.update({
      where: { id: teamId },
      data: { isCheckedIn: true },
    });
  }

  // --- Turnierverlauf Logik ---

  async startTournament(user: any, tournamentId: string) {
    const tournament = await this.prisma.client.tournament.findUnique({
      where: { id: tournamentId },
      include: { teams: true, tables: true },
    });
    if (!tournament) throw new NotFoundException('Tournament not found');

    if (tournament.creatorId !== user.id && user.role !== Role.ADMIN) {
        throw new ForbiddenException('Only the creator or an admin can start the tournament');
    }

    const checkedInTeams = tournament.teams.filter(t => t.isCheckedIn);
    if (checkedInTeams.length < 2) {
      throw new BadRequestException('At least 2 checked-in teams are required to start');
    }

    const teamsPerGroup = 4;
    const shuffledTeams = [...checkedInTeams].sort(() => Math.random() - 0.5);
    
    const teamUpdates = shuffledTeams.map((team, i) => {
        const groupIndex = Math.floor(i / teamsPerGroup);
        const groupName = String.fromCharCode(65 + groupIndex);
        return this.prisma.client.team.update({
            where: { id: team.id },
            data: { groupName }
        });
    });

    await Promise.all(teamUpdates);

    // Matches generieren
    const groups: Record<string, any[]> = {};
    const updatedTeams = await this.prisma.client.team.findMany({ where: { tournamentId } });
    updatedTeams.filter(t => t.groupName).forEach(t => {
        if (!groups[t.groupName!]) groups[t.groupName!] = [];
        groups[t.groupName!].push(t);
    });

    const matchesData: any[] = [];
    let tableIndex = 0;

    for (const groupName in groups) {
        const groupTeams = groups[groupName];
        for (let i = 0; i < groupTeams.length; i++) {
            for (let j = i + 1; j < groupTeams.length; j++) {
                const table = tournament.tables[tableIndex % tournament.tables.length];
                matchesData.push({
                    tournamentId,
                    teamRedId: groupTeams[i].id,
                    teamBlueId: groupTeams[j].id,
                    tableId: table.id,
                    phase: 'GROUP',
                });
                tableIndex++;
            }
        }
    }

    await this.prisma.client.match.createMany({ data: matchesData });

    return this.prisma.client.tournament.update({
      where: { id: tournamentId },
      data: {
        status: TournamentStatus.GROUP_PHASE,
        logs: {
          create: {
            action: 'TOURNAMENT_STARTED',
            actorId: user.id,
            data: { teamsCount: checkedInTeams.length },
          },
        },
      },
    });
  }

  async getStandings(tournamentId: string) {
    const tournament = await this.prisma.client.tournament.findUnique({
      where: { id: tournamentId },
      include: { teams: true },
    });
    if (!tournament) throw new NotFoundException('Tournament not found');

    const matches = await this.prisma.client.match.findMany({
      where: { tournamentId, phase: 'GROUP', status: 'FINISHED' },
    });
    
    const standings: Record<string, any> = {};

    tournament.teams.forEach(team => {
      if (team.groupName) {
        standings[team.id] = {
          id: team.id,
          name: team.name,
          group: team.groupName,
          played: 0,
          won: 0,
          lost: 0,
          cupsScored: 0,
          cupsReceived: 0,
          points: 0,
        };
      }
    });

    matches.forEach(match => {
      const red = standings[match.teamRedId];
      const blue = standings[match.teamBlueId];

      if (red && blue) {
        red.played++;
        blue.played++;
        
        red.cupsScored += match.scoreRed;
        red.cupsReceived += match.scoreBlue;
        blue.cupsScored += match.scoreBlue;
        blue.cupsReceived += match.scoreRed;

        if (match.winnerTeamId === match.teamRedId) {
          red.won++;
          red.points += 3;
          blue.lost++;
        } else if (match.winnerTeamId === match.teamBlueId) {
          blue.won++;
          blue.points += 3;
          red.lost++;
        }
      }
    });

    const result: Record<string, any[]> = {};
    Object.values(standings).forEach(s => {
      if (!result[s.group]) result[s.group] = [];
      result[s.group].push(s);
    });

    for (const group in result) {
      result[group].sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        const diffA = a.cupsScored - a.cupsReceived;
        const diffB = b.cupsScored - b.cupsReceived;
        if (diffB !== diffA) return diffB - diffA;
        return b.cupsScored - a.cupsScored;
      });
    }

    return result;
  }

  async startKoPhase(user: any, tournamentId: string) {
    const tournament = await this.prisma.client.tournament.findUnique({
      where: { id: tournamentId },
      include: { tables: true },
    });
    if (!tournament) throw new NotFoundException('Tournament not found');

    if (tournament.creatorId !== user.id && user.role !== Role.ADMIN) {
        throw new ForbiddenException('Only the creator or an admin can start the KO phase');
    }

    const standings = await this.getStandings(tournamentId);
    const advancingTeams: any[] = [];
    
    Object.values(standings).forEach(groupStandings => {
      advancingTeams.push(...groupStandings.slice(0, tournament.numTeamsAdvancing));
    });

    if (advancingTeams.length < 2) {
      throw new BadRequestException('Not enough teams qualified for KO phase');
    }

    const shuffledAdvancing = [...advancingTeams].sort(() => Math.random() - 0.5);
    const matchesData: any[] = [];
    let tableIndex = 0;

    for (let i = 0; i < shuffledAdvancing.length; i += 2) {
      if (shuffledAdvancing[i+1]) {
        const table = tournament.tables[tableIndex % tournament.tables.length];
        matchesData.push({
            tournamentId,
            teamRedId: shuffledAdvancing[i].id,
            teamBlueId: shuffledAdvancing[i+1].id,
            tableId: table.id,
            phase: 'KO',
        });
        tableIndex++;
      }
    }

    await this.prisma.client.match.createMany({ data: matchesData });

    return this.prisma.client.tournament.update({
      where: { id: tournamentId },
      data: {
        status: TournamentStatus.KO_PHASE,
        logs: {
          create: {
            action: 'KO_PHASE_STARTED',
            actorId: user.id,
            data: { advancingTeamsCount: advancingTeams.length },
          },
        },
      },
    });
  }
}
