import { Injectable, BadRequestException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import {
  Game,
  MarketplaceAsset,
  Plan,
  Subscription,
  SubscriptionStatus,
} from '../database/entities';
import { startOfDay, endOfDay } from '../utils/date-range';

export interface EntitlementSnapshot {
  plan: Plan;
  isFreemium: boolean;
  canUseCustomAudio: boolean;
  canUseFinale: boolean;
  maxTeams: number;
  maxPlayers: number;
  gamesPerDay: number;
  cloudStorageMb: number;
}

@Injectable()
export class MonetizationService implements OnModuleInit {
  constructor(
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    @InjectRepository(Game)
    private readonly gameRepository: Repository<Game>,
    @InjectRepository(MarketplaceAsset)
    private readonly assetRepository: Repository<MarketplaceAsset>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.ensureDefaultPlans();
  }

  async ensureDefaultPlans(): Promise<void> {
    const freemiumCode = 'FREEMIUM';
    const premiumCode = 'PREMIUM';

    const existingPlans = await this.planRepository.find();

    if (!existingPlans.find((plan) => plan.code === freemiumCode)) {
      await this.planRepository.save(
        this.planRepository.create({
          code: freemiumCode,
          name: 'Freemium',
          description: "10 joueurs max, 1 partie/jour, pas d'audio custom",
          priceCents: 0,
          currency: 'EUR',
          limits: {
            maxTeams: 10,
            maxPlayers: 10,
            gamesPerDay: 1,
            allowCustomAudio: false,
            allowMarketplaceSell: false,
            allowFinale: false,
            cloudStorageMb: 0,
          },
          features: [
            "Jusqu'à 10 joueurs",
            '1 partie/jour',
            'Publicités possibles',
          ],
          isDefault: true,
        }),
      );
    }

    if (!existingPlans.find((plan) => plan.code === premiumCode)) {
      await this.planRepository.save(
        this.planRepository.create({
          code: premiumCode,
          name: 'Premium Arena',
          description: '60 équipes, parties illimitées, médias personnalisés',
          priceCents: 9900,
          currency: 'EUR',
          limits: {
            maxTeams: 60,
            maxPlayers: 250,
            gamesPerDay: 0,
            allowCustomAudio: true,
            allowMarketplaceSell: true,
            allowFinale: true,
            cloudStorageMb: 10240,
          },
          features: [
            'Parties illimitées',
            'Audio & médias personnalisés',
            'Mode Finale',
            'Sauvegarde Cloud',
            'Support prioritaire',
          ],
        }),
      );
    }
  }

  async listPlans(): Promise<Plan[]> {
    return this.planRepository.find({ where: { isActive: true } });
  }

  async getEffectivePlan(userId?: string): Promise<Plan> {
    const plans = await this.listPlans();
    const defaultPlan = plans.find((plan) => plan.isDefault) ?? plans[0];

    if (!userId) return defaultPlan;

    const subscription = await this.subscriptionRepository.findOne({
      where: {
        userId,
        status: SubscriptionStatus.ACTIVE,
      },
      relations: ['plan'],
    });

    return subscription?.plan ?? defaultPlan;
  }

  async buildEntitlements(userId: string): Promise<EntitlementSnapshot> {
    const plan = await this.getEffectivePlan(userId);
    const limits = plan.limits;
    return {
      plan,
      isFreemium: plan.code === 'FREEMIUM',
      canUseCustomAudio: !!limits.allowCustomAudio,
      canUseFinale: !!limits.allowFinale,
      maxTeams: limits.maxTeams,
      maxPlayers: limits.maxPlayers,
      gamesPerDay: limits.gamesPerDay,
      cloudStorageMb: limits.cloudStorageMb,
    };
  }

  async assertGameCreationAllowed(userId: string): Promise<EntitlementSnapshot> {
    const entitlements = await this.buildEntitlements(userId);

    if (entitlements.gamesPerDay > 0) {
      const todayStart = startOfDay(new Date());
      const todayEnd = endOfDay(new Date());
      const gamesToday = await this.gameRepository.count({
        where: {
          hostId: userId,
          createdAt: Between(todayStart, todayEnd),
        },
      });

      if (gamesToday >= entitlements.gamesPerDay) {
        throw new BadRequestException(
          `Limite journalière atteinte : ${entitlements.gamesPerDay} partie(s)`,
        );
      }
    }

    return entitlements;
  }

  async assertPlayerCapacity(game: Game): Promise<void> {
    const entitlements = await this.buildEntitlements(game.hostId ?? '');
    const totalPlayers = await this.gameRepository.manager
      .createQueryBuilder()
      .from('players', 'player')
      .leftJoin('teams', 'team', 'team.id = player."teamId"')
      .where('team."gameId" = :gameId', { gameId: game.id })
      .getCount();

    if (
      entitlements.maxPlayers > 0 &&
      totalPlayers >= entitlements.maxPlayers
    ) {
      throw new BadRequestException(
        `Capacité maximale atteinte pour ce plan (${entitlements.maxPlayers} joueurs). Passez en Premium pour lever la limite.`,
      );
    }
  }

  async listMarketplaceAssets(): Promise<MarketplaceAsset[]> {
    return this.assetRepository.find({ where: { isPublished: true } });
  }

  async createAssetDraft(
    sellerId: string,
    payload: Partial<MarketplaceAsset>,
  ): Promise<MarketplaceAsset> {
    const plan = await this.getEffectivePlan(sellerId);
    if (!plan.limits.allowMarketplaceSell) {
      throw new BadRequestException(
        'Le plan actuel ne permet pas de publier sur le marketplace. Passez en Premium.',
      );
    }

    const asset = this.assetRepository.create({
      ...payload,
      sellerId,
      isPublished: false,
    });
    return this.assetRepository.save(asset);
  }

  async saveAsset(asset: MarketplaceAsset): Promise<MarketplaceAsset> {
    return this.assetRepository.save(asset);
  }
}
