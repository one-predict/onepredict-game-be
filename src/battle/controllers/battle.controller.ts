import { Controller, UseGuards, Post, Body } from '@nestjs/common';
import { PrivateApiAuthorizationTokenGuard } from '@common/guards';
import { InjectPortfolioOfferService, PortfolioOfferService } from '@app/portfolio';
import { BattleService } from '@app/battle/services/battle.service';
import { InjectBattleService } from '@app/battle/decorators';
import { GetBattleDto, CreateBattlePayloadDto, GetByBattleIdDto, AddPlayersDto } from '../dto';
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

  @Post('/battles/getByBattleId')
  @UseGuards(PrivateApiAuthorizationTokenGuard)
  public async getBattleByBattleId(@Body() params: GetByBattleIdDto): Promise<BattleEntity> {
    return await this.battleService.getByBattleId(params.battleId);
  }

  @Post('/battles')
  @UseGuards(PrivateApiAuthorizationTokenGuard)
  public async createBattleForCurrentUser(@Body() params: CreateBattlePayloadDto) {
    return await this.battleService.create(params);
  }

  @Post('/battles/addPlayers')
  @UseGuards(PrivateApiAuthorizationTokenGuard)
  public async addPlayers(@Body() params: AddPlayersDto) {
    return await this.battleService.addPlayers(params.battleId, params.userIds);
  }
}
