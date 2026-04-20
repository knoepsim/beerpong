import { Controller, Get, Post, Body, Param, UseGuards, Req, Put, Query } from '@nestjs/common';
import { TournamentService } from './tournament.service';
import { AuthGuard } from '../auth.guard';

@Controller('tournaments')
@UseGuards(AuthGuard)
export class TournamentController {
  constructor(private readonly tournamentService: TournamentService) {}

  @Post()
  create(@Req() req: any, @Body() data: any) {
    return this.tournamentService.create(req.user, data);
  }

  @Get()
  findAll() {
    return this.tournamentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tournamentService.findOne(id);
  }

  @Post(':id/teams')
  createTeam(@Req() req: any, @Param('id') id: string, @Body('name') name: string) {
    return this.tournamentService.createTeam(req.user, id, name);
  }

  @Post('teams/:teamId/join')
  joinTeam(@Req() req: any, @Param('teamId') teamId: string) {
    return this.tournamentService.joinTeam(req.user, teamId);
  }

  @Put('teams/:teamId/checkin')
  checkInTeam(@Req() req: any, @Param('teamId') teamId: string) {
    return this.tournamentService.checkInTeam(req.user, teamId);
  }

  @Post(':id/start')
  startTournament(@Req() req: any, @Param('id') id: string) {
    return this.tournamentService.startTournament(req.user, id);
  }

  @Get(':id/standings')
  getStandings(@Param('id') id: string) {
    return this.tournamentService.getStandings(id);
  }

  @Post(':id/start-ko')
  startKoPhase(@Req() req: any, @Param('id') id: string) {
    return this.tournamentService.startKoPhase(req.user, id);
  }
}
