import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectPortfolioOfferService, InjectPortfolioRepository } from '@portfolio/decorators';
import { PortfolioRepository } from '@portfolio/repositories';
import { PortfolioEntity, PortfolioOfferEntity } from '@portfolio/entities';
import { PortfolioOfferService } from '@portfolio/services';
import { InjectUserService, UserService } from '@app/user';
import { getCurrentDayInUtc } from '@common/utils';

export interface ListPortfoliosParams {
  userId?: string;
  offerIds?: string[];
}

export interface CreatePortfolioParams {
  userId: string;
  selectedTokens: string[];
  offerId: string;
}

export interface PortfolioService {
  list(params: ListPortfoliosParams): Promise<PortfolioEntity[]>;
  listForUserAndOffers(userId: string, offerIds: string[]): Promise<PortfolioEntity[]>;
  create(params: CreatePortfolioParams): Promise<PortfolioEntity>;
}

@Injectable()
export class PortfolioServiceImpl implements PortfolioService {
  constructor(
    @InjectPortfolioRepository() private readonly portfolioRepository: PortfolioRepository,
    @InjectPortfolioOfferService() private readonly portfolioOfferService: PortfolioOfferService,
    @InjectUserService() private readonly userService: UserService,
  ) {}

  public list(params: ListPortfoliosParams) {
    return this.portfolioRepository.find({
      userId: params.userId,
      offerIds: params.offerIds,
    });
  }

  public listForUserAndOffers(userId: string, offerIds: string[]) {
    if (!offerIds.length) {
      throw new BadRequestException('At least one offer should be provided.');
    }

    return this.portfolioRepository.find({
      userId,
      offerIds,
    });
  }

  public async create(params: CreatePortfolioParams) {
    const offer = await this.portfolioOfferService.getById(params.offerId);

    if (!offer) {
      throw new BadRequestException('Provided offer is not found');
    }

    const user = await this.userService.getById(params.userId);

    if (!user) {
      throw new BadRequestException('Provided user is not found');
    }

    if (offer.getDay() !== getCurrentDayInUtc() + 1) {
      throw new BadRequestException('Provided offer is not available.');
    }

    this.validateSelectedTokens(params.selectedTokens, offer);

    const portfolioForProvidedOfferExists = await this.portfolioRepository.existsByUserIdAndOfferId(
      params.userId,
      params.offerId,
    );

    if (portfolioForProvidedOfferExists) {
      throw new BadRequestException('Portfolio for this day already submitted.');
    }

    return this.portfolioRepository.create({
      user: params.userId,
      selectedTokens: params.selectedTokens,
      offer: params.offerId,
    });
  }

  private validateSelectedTokens(selectedTokens: string[], offer: PortfolioOfferEntity) {
    const tokenOffers = offer.getTokenOffers();

    if (selectedTokens.length !== tokenOffers.length) {
      throw new BadRequestException('Invalid number of selected tokens');
    }

    return selectedTokens.every((token, index) => {
      return tokenOffers[index].firstToken === token || tokenOffers[index].secondToken === token;
    });
  }
}
