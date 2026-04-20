import { Controller, Get, Post, Body, Param, UseGuards, Req, Query } from '@nestjs/common';
import { MatchService } from './match.service';
import { AuthGuard } from '../auth.guard';

@Controller('matches')
@UseGuards(AuthGuard)
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  @Post(':id/report')
  reportScore(
    @Req() req: any,
    @Param('id') id: string,
    @Body() data: { scoreRed: number; scoreBlue: number; winnerTeamId: string },
  ) {
    return this.matchService.reportScore(req.user, id, data);
  }

  @Get()
  findByTournament(@Query('tournamentId') tournamentId: string) {
    return this.matchService.findByTournament(tournamentId);
  }
}
