import { Controller, UseGuards, Post, Body, BadRequestException } from '@nestjs/common';
import { PrivateApiAuthorizationTokenGuard } from '@common/guards';
import { BattleService } from '@app/battle/services/battle.service';
import { InjectBattleService } from '@app/battle/decorators';
import {
  GetBattleDto,
  CreateBattlePayloadDto,
  GetByDisplayIdDto,
  AddPlayerDto,
  GetUsersBattlesByOfferDto,
} from '../dto';
import { BattleEntity } from '@app/battle/entities/battle.entity';
import { InjectUserService, UserService } from '@app/user';
import { InjectTransactionsManagerDecorator } from '@core/decorators';
import { TransactionsManager } from '@core/managers';

@Controller()
export default class BattleController {
  constructor(
    @InjectBattleService() private readonly battleService: BattleService,
    @InjectUserService() private readonly userService: UserService,
    @InjectTransactionsManagerDecorator() private readonly transactionsManager: TransactionsManager,
  ) {}

  @Post('/battles/getByUserOffer')
  @UseGuards(PrivateApiAuthorizationTokenGuard)
  public async getBattle(@Body() params: GetBattleDto) {
    return this.battleService.getBattleForOwner({ ownerId: params.ownerId, offerId: params.offerId });
  }

  @Post('/battles/getByDisplayId')
  @UseGuards(PrivateApiAuthorizationTokenGuard)
  public async getBattleByBattleId(@Body() params: GetByDisplayIdDto): Promise<BattleEntity> {
    return await this.battleService.getByDisplayId(params.displayId);
  }

  @Post('/battles')
  @UseGuards(PrivateApiAuthorizationTokenGuard)
  public async createBattleForCurrentUser(@Body() params: CreateBattlePayloadDto) {
    let createdBattle: BattleEntity | null = null;

    await this.transactionsManager.useTransaction(async () => {
      await this.userService.withdrawCoins(params.ownerId, params.entryPrice);

      createdBattle = await this.battleService.create(params);
    });

    return createdBattle;
  }

  @Post('/battles/addPlayers')
  @UseGuards(PrivateApiAuthorizationTokenGuard)
  public async addPlayer(@Body() { displayId, userId }: AddPlayerDto) {
    const battle = await this.battleService.getByDisplayId(displayId);

    if (!battle) {
      throw new BadRequestException('Provided battle is not found');
    }

    if (battle.players.some((player) => player.userId === userId)) {
      throw new BadRequestException('User is already in the battle');
    }

    let updatedBattle: BattleEntity | null = null;

    await this.transactionsManager.useTransaction(async () => {
      await this.userService.withdrawCoins(userId, battle.entryPrice);
      updatedBattle = await this.battleService.addPlayer(battle, userId);
    });

    return updatedBattle;
  }

  @Post('/battles/getUsersBattlesByOffer')
  @UseGuards(PrivateApiAuthorizationTokenGuard)
  public async getUsersBattlesByOffer(@Body() params: GetUsersBattlesByOfferDto): Promise<BattleEntity[]> {
    const offers = await this.battleService.findAllByOfferId(params.offerId);

    return offers.filter((offer) => {
      return offer.ownerId === params.userId || offer.players.some((player) => player.userId === params.userId);
    });
  }
}
