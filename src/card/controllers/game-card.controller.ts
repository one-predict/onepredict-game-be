import { Controller, Get, Post, UseGuards, Body } from '@nestjs/common';
import { AuthGuard } from '@common/guards';
import { GameCardEntity } from '@card/entities';
import { GameCardService } from '@card/services';
import { InjectGameCardService } from '@card/decorators';
import { ListGameCardsByIdsDto } from '@card/dto';

@Controller()
export default class GameCardController {
  constructor(@InjectGameCardService() private readonly gameCardService: GameCardService) {}

  @Get('/game-cards')
  @UseGuards(AuthGuard)
  public async listCards() {
    const cards = await this.gameCardService.list();

    return cards.map((card) => this.mapPortfolioCardEntityToViewModel(card));
  }

  @Post('/game-cards/by-ids-list')
  @UseGuards(AuthGuard)
  public async listCardsByIds(@Body() body: ListGameCardsByIdsDto) {
    const cards = await this.gameCardService.listForIds(body.ids);

    return cards.map((card) => this.mapPortfolioCardEntityToViewModel(card));
  }

  private mapPortfolioCardEntityToViewModel(gameCardEntity: GameCardEntity) {
    return {
      id: gameCardEntity.getId(),
      name: gameCardEntity.getName(),
      description: gameCardEntity.getDescription(),
      rarity: gameCardEntity.getRarity(),
      price: gameCardEntity.getPrice(),
    };
  }
}
