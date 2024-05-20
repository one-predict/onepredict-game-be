import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { AxiosHeaders } from 'axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { Coin } from '@portfolio/enums';
import { convertMsToDay } from '@common/utils';

interface CoinGeckoMarketChartResponse {
  prices: [number, number][];
}

export interface PricingInformation {
  startDayPrice: number;
  endDayPrice: number;
}

export interface CoinsApi {
  getCoinPriceForDay(coin: Coin, day: number): Promise<PricingInformation | null>;
}

@Injectable()
export class CoinGeckoApi implements CoinsApi {
  private readonly API_KEY_HEADER = 'x-cg-demo-api-key';

  private readonly coinGeckoApiKey: string;
  private readonly coinGeckoApiUrl: string;

  private COIN_TO_GEKO_ID_MAP: Record<Coin, string> = {
    [Coin.Aptos]: 'aptos',
    [Coin.Arbitrum]: 'arbitrum',
    [Coin.Avalance]: 'avalanche-2',
    [Coin.Axie]: 'axie-infinity',
    [Coin.Bitcoin]: 'bitcoin',
    [Coin.Bnb]: 'binancecoin',
    [Coin.Celestia]: 'celestia',
    [Coin.Chia]: 'chia',
    [Coin.Cosmos]: 'cosmos',
    [Coin.Dogecoin]: 'dogecoin',
    [Coin.Ethereum]: 'ethereum',
    [Coin.Fantom]: 'fantom',
    [Coin.Jupiter]: 'jupiter-exchange-solana',
    [Coin.Litecoin]: 'litecoin',
    [Coin.Mantle]: 'mantle',
    [Coin.Near]: 'near',
    [Coin.Optimism]: 'optimism',
    [Coin.Polkadot]: 'polkadot',
    [Coin.Polygon]: 'matic-network',
    [Coin.ShibaInu]: 'shiba-inu',
    [Coin.Solana]: 'solana',
    [Coin.Starknet]: 'starknet',
    [Coin.Toncoin]: 'the-open-network',
    [Coin.Wormhole]: 'wormhole',
    [Coin.Xrp]: 'ripple',
  };

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.coinGeckoApiKey = this.configService.getOrThrow<string>('COIN_GECKO_API_KEY');
    this.coinGeckoApiUrl = this.configService.getOrThrow<string>('COIN_GECKO_API_URL');
  }

  public async getCoinPriceForDay(coin: Coin, day: number) {
    const searchParams = new URLSearchParams();

    searchParams.set('interval', 'daily');
    searchParams.set('days', '30');
    searchParams.set('vs_currency', 'usd');

    const coinId = this.COIN_TO_GEKO_ID_MAP[coin];

    const observable = await this.httpService.get<CoinGeckoMarketChartResponse>(
      `${this.coinGeckoApiUrl}/coins/${coinId}/market_chart?${searchParams}`,
      {
        headers: new AxiosHeaders({
          [this.API_KEY_HEADER]: this.coinGeckoApiKey,
        }),
      },
    );

    const { data } = await firstValueFrom(observable.pipe());

    const { startDayPrice, endDayPrice } = data.prices.reduce(
      (pricingInformation, pricing) => {
        const [timestamp, price] = pricing;

        const pricingDay = convertMsToDay(timestamp);

        if (pricingDay === day && !pricingInformation.startDayPrice) {
          pricingInformation.startDayPrice = price;
        }

        if (pricingDay === day + 1 && !pricingInformation.endDayPrice) {
          pricingInformation.endDayPrice = price;
        }

        return pricingInformation;
      },
      { startDayPrice: null as number | null, endDayPrice: null as number | null },
    );

    return (
      startDayPrice &&
      endDayPrice && {
        startDayPrice,
        endDayPrice,
      }
    );
  }
}
