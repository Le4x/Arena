import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { dataSourceOptions } from './config/typeorm.config';
import { AuthModule } from './auth/auth.module';
import { GameModule } from './game/game.module';
import { WebsocketModule } from './websocket/websocket.module';
import { MonetizationModule } from './monetization/monetization.module';

@Module({
  imports: [
    // Configuration globale
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Base de données
    TypeOrmModule.forRoot({
      ...dataSourceOptions,
      entities: [__dirname + '/database/entities/**/*.entity{.ts,.js}'],
      autoLoadEntities: true,
    }),

    // Servir les fichiers uploadés (audio, images)
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),

    // Modules métier
    AuthModule,
    GameModule,
    WebsocketModule,
    MonetizationModule,
  ],
})
export class AppModule {}
