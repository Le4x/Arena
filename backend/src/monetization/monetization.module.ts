import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Game,
  MarketplaceAsset,
  Plan,
  Purchase,
  Subscription,
} from '../database/entities';
import { MonetizationService } from './monetization.service';
import { MonetizationController } from './monetization.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Plan, Subscription, Game, MarketplaceAsset, Purchase]),
  ],
  providers: [MonetizationService],
  controllers: [MonetizationController],
  exports: [MonetizationService],
})
export class MonetizationModule {}
