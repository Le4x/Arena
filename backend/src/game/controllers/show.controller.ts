import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Show } from '../../database/entities/show.entity';
import { Round } from '../../database/entities/round.entity';
import { Question } from '../../database/entities/question.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../database/entities/user.entity';

@Controller('shows')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ShowController {
  constructor(
    @InjectRepository(Show)
    private readonly showRepository: Repository<Show>,
    @InjectRepository(Round)
    private readonly roundRepository: Repository<Round>,
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
  ) {}

  @Get()
  async getAllShows() {
    return this.showRepository.find({
      relations: ['theme'],
      order: { createdAt: 'DESC' },
    });
  }

  @Get(':id')
  async getShow(@Param('id') id: string) {
    return this.showRepository.findOne({
      where: { id },
      relations: ['theme', 'rounds', 'rounds.questions'],
    });
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.HOST)
  async createShow(@Body() showData: Partial<Show>) {
    const show = this.showRepository.create(showData);
    return this.showRepository.save(show);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.HOST)
  async updateShow(@Param('id') id: string, @Body() showData: Partial<Show>) {
    await this.showRepository.update(id, showData);
    return this.showRepository.findOne({ where: { id } });
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async deleteShow(@Param('id') id: string) {
    await this.showRepository.delete(id);
    return { success: true };
  }

  @Post(':id/rounds')
  @Roles(UserRole.ADMIN, UserRole.HOST)
  async createRound(
    @Param('id') showId: string,
    @Body() roundData: Partial<Round>,
  ) {
    const round = this.roundRepository.create({ ...roundData, showId });
    return this.roundRepository.save(round);
  }

  @Post('rounds/:roundId/questions')
  @Roles(UserRole.ADMIN, UserRole.HOST)
  async createQuestion(
    @Param('roundId') roundId: string,
    @Body() questionData: Partial<Question>,
  ) {
    const question = this.questionRepository.create({
      ...questionData,
      roundId,
    });
    return this.questionRepository.save(question);
  }
}
