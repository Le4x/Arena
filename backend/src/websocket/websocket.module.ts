import { Module } from '@nestjs/common';
import { GameModule } from '../game/game.module';
import { ArenaGateway } from './arena.gateway';

@Module({
  imports: [GameModule],
  providers: [ArenaGateway],
  exports: [ArenaGateway],
})
export class WebsocketModule {}
