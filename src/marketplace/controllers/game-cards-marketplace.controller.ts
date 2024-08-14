import { Body, Controller, Session, UseGuards, Post } from '@nestjs/common';
import * as secureSession from '@fastify/secure-session';
import { AuthGuard } from '@common/guards';
import { PurchaseGameCardDto } from '@marketplace/dto';
import { GameCardsMarketplaceService, InjectGameCardsMarketplaceService } from '@marketplace';

@Controller()
export default class GameCardsMarketplaceController {
  constructor(
    @InjectGameCardsMarketplaceService() private readonly gameCardsMarketplaceService: GameCardsMarketplaceService,
  ) {}

  @Post('/game-cards-marketplace/purchase')
  @UseGuards(AuthGuard)
  public async purchaseGameCard(@Session() session: secureSession.Session, @Body() body: PurchaseGameCardDto) {
    await this.gameCardsMarketplaceService.purchaseGameCard({
      userId: session.get('userId'),
      cardId: body.cardId,
    });

    return { success: true };
  }
}
