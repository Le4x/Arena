import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Show,
  Round,
  Question,
  Game,
  Team,
  Player,
  Answer,
  BuzzerAttempt,
  Theme,
} from '../database/entities';
import { GameService } from './services/game.service';
import { TeamService } from './services/team.service';
import { QuestionService } from './services/question.service';
import { BuzzerService } from './services/buzzer.service';
import { ScoringService } from './services/scoring.service';
import { ShowController } from './controllers/show.controller';
import { GameController } from './controllers/game.controller';
import { TeamController } from './controllers/team.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Show,
      Round,
      Question,
      Game,
      Team,
      Player,
      Answer,
      BuzzerAttempt,
      Theme,
    ]),
  ],
  controllers: [ShowController, GameController, TeamController],
  providers: [
    GameService,
    TeamService,
    QuestionService,
    BuzzerService,
    ScoringService,
  ],
  exports: [
    GameService,
    TeamService,
    QuestionService,
    BuzzerService,
    ScoringService,
  ],
})
export class GameModule {}
