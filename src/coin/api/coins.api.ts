import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { AxiosHeaders } from 'axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { Coin } from '@coin/enums';

interface CryptoCompareHistohourResponse {
  Data: Array<{
    time: number;
    open: number;
    close: number;
  }>;
  TimeFrom: number;
  TimeTo: number;
}

interface CryptoCompareLatestPriceMultiFullResponse {
  RAW: Record<string, {
    USD: {
      PRICE: number;
      CHANGEPCT24HOUR: number;
      CHANGEPCTHOUR: number;
      LASTUPDATE: number;
    };
  }>;
}

export interface CoinHistoryItem {
  time: number;
  open: number;
  close: number;
}

export interface CoinsApi {
  getCoinHourlyHistory(coin: Coin): Promise<CoinHistoryItem[]>;
  getCoinsLatestPrices(coins: Coin[]): Promise<Partial<Record<Coin, {
    price: number;
    percentChange24h: number;
    percentChange1h: number;
    lastUpdateTimestamp: number;
  }>>>;
}

@Injectable()
export class CryptoCompareCoinsApi implements CoinsApi {
  private HISTOUR_LIMIT = 48;

  private readonly cryptoCompareApiKey: string;
  private readonly cryptoCompareApiUrl: string;

  private COIN_TO_FSYM_MAP: Record<Coin, string> = {
    [Coin.Aptos]: 'APT',
    [Coin.Arbitrum]: 'ARB',
    [Coin.Avalanche]: 'AVAX',
    [Coin.Axie]: 'AXS',
    [Coin.Bitcoin]: 'BTC',
    [Coin.Bnb]: 'BNB',
    [Coin.Celestia]: 'TIA',
    [Coin.Chia]: 'XCH',
    [Coin.Cosmos]: 'ATOM',
    [Coin.Dogecoin]: 'DOGE',
    [Coin.Ethereum]: 'ETH',
    [Coin.Fantom]: 'FTM',
    [Coin.Jupiter]: 'JUP',
    [Coin.Litecoin]: 'LTC',
    [Coin.Mantle]: 'MANTLE',
    [Coin.Near]: 'NEAR',
    [Coin.Optimism]: 'OP',
    [Coin.Polkadot]: 'DOT',
    [Coin.Polygon]: 'MATIC',
    [Coin.ShibaInu]: 'SHIB',
    [Coin.Solana]: 'SOL',
    [Coin.Starknet]: 'STRK',
    [Coin.Toncoin]: 'TONCOIN',
    [Coin.Wormhole]: 'W',
    [Coin.Xrp]: 'XRP',
  };

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.cryptoCompareApiKey = this.configService.getOrThrow<string>('CRYPTO_COMPARE_API_KEY');
    this.cryptoCompareApiUrl = this.configService.getOrThrow<string>('CRYPTO_COMPARE_API_URL');
  }

  public async getCoinHourlyHistory(coin: Coin) {
    const searchParams = new URLSearchParams();

    searchParams.set('limit', this.HISTOUR_LIMIT.toString());
    searchParams.set('fsym', this.COIN_TO_FSYM_MAP[coin]);
    searchParams.set('tsym', 'USD');

    const observable = await this.httpService.get<CryptoCompareHistohourResponse>(
      `${this.cryptoCompareApiUrl}/histohour?${searchParams}`,
      {
        headers: new AxiosHeaders({
          Authorization: `ApiKey ${this.cryptoCompareApiKey}`,
        }),
      },
    );

    const { data: responseData } = await firstValueFrom(observable.pipe());

    return responseData.Data.map((item) => {
      return {
        time: item.time,
        open: item.open,
        close: item.close,
      };
    });
  }

  public async getCoinsLatestPrices(coins: Coin[]) {
    const searchParams = new URLSearchParams();

    const fsymToCoinsMap: Record<string, string> = {};

    coins.forEach((coin) => {
      searchParams.append('fsyms', this.COIN_TO_FSYM_MAP[coin]);

      fsymToCoinsMap[this.COIN_TO_FSYM_MAP[coin]] = coin;
    });

    searchParams.append('tsyms', 'USD');

    const observable = await this.httpService.get<CryptoCompareLatestPriceMultiFullResponse>(
      `${this.cryptoCompareApiUrl}/pricemultifull?${searchParams}`,
      {
        headers: new AxiosHeaders({
          Authorization: `ApiKey ${this.cryptoCompareApiKey}`,
        }),
      },
    );

    const { data: responseData } = await firstValueFrom(observable.pipe());

    return Object.keys(responseData.RAW).reduce((pricingInformation, key) => {
      pricingInformation[fsymToCoinsMap[key]] = {
        price: responseData.RAW[key].USD.PRICE,
        percentChange24h: responseData.RAW[key].USD.CHANGEPCT24HOUR,
        percentChange1h: responseData.RAW[key].USD.CHANGEPCTHOUR,
        lastUpdateTimestamp: responseData.RAW[key].USD.LASTUPDATE,
      };

      return pricingInformation;
    }, {});
  }
}
