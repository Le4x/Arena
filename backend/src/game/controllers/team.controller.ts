import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { TeamService } from '../services/team.service';
import { ScoringService } from '../services/scoring.service';
import { BuzzerService } from '../services/buzzer.service';

@Controller('teams')
export class TeamController {
  constructor(
    private readonly teamService: TeamService,
    private readonly scoringService: ScoringService,
    private readonly buzzerService: BuzzerService,
  ) {}

  @Post()
  async createTeam(
    @Body('gameId') gameId: string,
    @Body('name') name: string,
    @Body('color') color?: string,
    @Body('emoji') emoji?: string,
  ) {
    return this.teamService.createTeam(gameId, name, color, emoji);
  }

  @Get('game/:gameId')
  async getTeamsByGame(@Param('gameId') gameId: string) {
    return this.teamService.findByGameId(gameId);
  }

  @Get('game/:gameId/leaderboard')
  async getLeaderboard(
    @Param('gameId') gameId: string,
    @Query('limit') limit?: string,
  ) {
    return this.teamService.getLeaderboard(
      gameId,
      limit ? parseInt(limit) : undefined,
    );
  }

  @Get(':id')
  async getTeam(@Param('id') id: string) {
    return this.teamService.findById(id);
  }

  @Post(':id/player')
  async addPlayer(
    @Param('id') id: string,
    @Body('nickname') nickname: string,
    @Body('deviceId') deviceId?: string,
  ) {
    return this.teamService.addPlayerToTeam(id, nickname, deviceId);
  }

  @Patch(':id/score')
  async updateScore(@Param('id') id: string, @Body('points') points: number) {
    return this.teamService.updateTeamScore(id, points);
  }

  @Patch(':id/score/set')
  async setScore(@Param('id') id: string, @Body('score') score: number) {
    return this.teamService.setTeamScore(id, score);
  }

  @Post(':teamId/buzz/:questionId')
  async buzz(
    @Param('teamId') teamId: string,
    @Param('questionId') questionId: string,
    @Body('gameId') gameId: string,
  ) {
    return this.buzzerService.buzz(questionId, teamId, gameId);
  }

  @Post(':teamId/answer/:questionId')
  async submitAnswer(
    @Param('teamId') teamId: string,
    @Param('questionId') questionId: string,
    @Body('payload') payload: any,
    @Body('wasFirstToAnswer') wasFirstToAnswer: boolean = false,
  ) {
    return this.scoringService.submitAnswer(
      teamId,
      questionId,
      payload,
      wasFirstToAnswer,
    );
  }
}
