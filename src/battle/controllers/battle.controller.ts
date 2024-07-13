import { Controller, UseGuards, Post, Body } from '@nestjs/common';
import { PrivateApiAuthorizationTokenGuard } from '@common/guards';
import { InjectPortfolioOfferService, PortfolioOfferService } from '@app/portfolio';
import { BattleService } from '@app/battle/services/battle.service';
import { InjectBattleService } from '@app/battle/decorators';
import { GetBattleDto, CreateBattlePayloadDto, GetByDisplayIdDto, AddPlayerDto } from '../dto';
import { BattleEntity } from '@app/battle/entities/battle.entity';

@Controller()
export default class BattleController {
  constructor(
    @InjectBattleService() private readonly battleService: BattleService,
    @InjectPortfolioOfferService() private readonly portfolioOfferService: PortfolioOfferService,
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
    return await this.battleService.create(params);
  }

  @Post('/battles/addPlayers')
  @UseGuards(PrivateApiAuthorizationTokenGuard)
  public async addPlayers(@Body() params: AddPlayerDto) {
    return await this.battleService.addPlayer(params.displayId, params.userId);
  }
}
