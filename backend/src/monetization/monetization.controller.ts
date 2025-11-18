import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { MonetizationService } from './monetization.service';
import { CreateAssetDto } from './dto/create-asset.dto';

@Controller('monetization')
export class MonetizationController {
  constructor(private readonly monetizationService: MonetizationService) {}

  @Get('plans')
  async listPlans() {
    return this.monetizationService.listPlans();
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMyPlan(@Req() req: any) {
    const entitlements = await this.monetizationService.buildEntitlements(
      req.user.id,
    );

    return {
      plan: entitlements.plan,
      entitlements,
    };
  }

  @Get('marketplace')
  async marketplace() {
    return this.monetizationService.listMarketplaceAssets();
  }

  @UseGuards(JwtAuthGuard)
  @Post('marketplace')
  async createAsset(@Req() req: any, @Body() payload: CreateAssetDto) {
    const asset = await this.monetizationService.createAssetDraft(
      req.user.id,
      payload,
    );

    if (payload.publish) {
      asset.isPublished = true;
      return this.monetizationService.saveAsset(asset);
    }

    return asset;
  }
}
