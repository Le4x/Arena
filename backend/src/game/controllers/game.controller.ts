import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import { GameService } from '../services/game.service';
import { BuzzerService } from '../services/buzzer.service';
import { ScoringService } from '../services/scoring.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ValidationStatus } from '../../database/entities/answer.entity';

@Controller('games')
export class GameController {
  constructor(
    private readonly gameService: GameService,
    private readonly buzzerService: BuzzerService,
    private readonly scoringService: ScoringService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createGame(@Body('showId') showId: string) {
    return this.gameService.createGame(showId);
  }

  @Get('pin/:pinCode')
  async getGameByPin(@Param('pinCode') pinCode: string) {
    const game = await this.gameService.findByPinCode(pinCode);
    return { game };
  }

  @Get(':id')
  async getGame(@Param('id') id: string) {
    return this.gameService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/start')
  async startGame(@Param('id') id: string) {
    return this.gameService.startGame(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/pause')
  async pauseGame(@Param('id') id: string) {
    return this.gameService.pauseGame(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/finish')
  async finishGame(@Param('id') id: string) {
    return this.gameService.finishGame(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/question')
  async setCurrentQuestion(
    @Param('id') id: string,
    @Body('roundId') roundId: string,
    @Body('questionId') questionId: string,
  ) {
    return this.gameService.setCurrentQuestion(id, roundId, questionId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/buzzer/unlock')
  async unlockBuzzer(@Param('id') id: string) {
    await this.buzzerService.unlockBuzzer(id);
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/buzzer/lock')
  async lockBuzzer(@Param('id') id: string) {
    await this.buzzerService.lockBuzzer(id);
    return { success: true };
  }

  @Get('question/:questionId/buzzer-order')
  async getBuzzerOrder(@Param('questionId') questionId: string) {
    return this.buzzerService.getBuzzerOrder(questionId);
  }

  @Get('question/:questionId/answers')
  async getAnswers(@Param('questionId') questionId: string) {
    return this.scoringService.getAnswersForQuestion(questionId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('answer/:answerId/validate')
  async validateAnswer(
    @Param('answerId') answerId: string,
    @Body('status') status: ValidationStatus,
    @Body('customPoints') customPoints?: number,
  ) {
    return this.scoringService.validateAnswer(answerId, status, customPoints);
  }

  @UseGuards(JwtAuthGuard)
  @Post('question/:questionId/auto-validate')
  async autoValidateQCM(@Param('questionId') questionId: string) {
    return this.scoringService.autoValidateQCM(questionId);
  }
}
