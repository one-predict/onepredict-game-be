import { Controller, Get, Session, UseGuards } from '@nestjs/common';
import * as secureSession from '@fastify/secure-session';
import { AuthGuard } from '@common/guards';
import { InjectUserInventoryService } from '@inventory/decorators';
import { UserInventoryService } from '@inventory/services';
import { UserInventoryEntity } from '@inventory/entities';

@Controller()
export default class UserInventoryController {
  constructor(@InjectUserInventoryService() private readonly userInventoryService: UserInventoryService) {}

  @Get('/inventories/my')
  @UseGuards(AuthGuard)
  public async getMyInventory(@Session() session: secureSession.Session) {
    const inventory = await this.userInventoryService.getForUserIfExists(session.get('userId'));

    return this.mapUserInventoryEntityToViewModel(inventory);
  }

  private mapUserInventoryEntityToViewModel(userInventory: UserInventoryEntity) {
    return {
      id: userInventory.getId(),
      userId: userInventory.getUserId(),
      purchasedCardIds: userInventory.getPurchasedCardIds(),
      purchasedPerkIds: userInventory.getPurchasedPerkIds(),
      availableCardSlots: userInventory.getAvailableCardSlots(),
      availablePortfolioCardSlots: userInventory.getAvailablePortfolioCardSlots(),
    };
  }
}
