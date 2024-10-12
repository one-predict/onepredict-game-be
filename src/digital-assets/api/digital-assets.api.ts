import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { AxiosHeaders } from 'axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { DigitalAssetId } from '@digital-assets/enums';
import { DigitalAssetLatestTick } from '@digital-assets/types';

interface CryptoCompareHistohourResponse {
  Data: {
    Data: Array<{
      time: number;
      open: number;
      close: number;
    }>;
  };
  TimeFrom: number;
  TimeTo: number;
}

interface CryptoCompareLatestTickResponse {
  Data: Record<
    string,
    {
      VALUE: number;
      VALUE_LAST_UPDATE_TS: number;
      CURRENT_HOUR_OPEN: number;
      CURRENT_HOUR_CHANGE: number;
      CURRENT_HOUR_CHANGE_PERCENTAGE: number;
    }
  >;
}

export interface DigitalAssetHistoryItem {
  time: number;
  open: number;
  close: number;
}

export type DigitalAssetsTicksData = Record<DigitalAssetId, DigitalAssetLatestTick>;

export interface DigitalAssetsApi {
  getAssetHourlyHistory(assetId: DigitalAssetId): Promise<DigitalAssetHistoryItem[]>;
  getAssetLatestTick(assetId: DigitalAssetId[]): Promise<DigitalAssetsTicksData>;
}

@Injectable()
export class CryptoCompareDigitalAssetsApi implements DigitalAssetsApi {
  private HISTOUR_LIMIT = 48;

  private readonly cryptoCompareApiKey: string;
  private readonly cryptoCompareApiUrl: string;
  private readonly cryptoCompareMinApiUrl: string;

  private ASSET_ID_TO_FSYM_MAP: Record<DigitalAssetId, string> = {
    [DigitalAssetId.Aptos]: 'APT',
    [DigitalAssetId.Arbitrum]: 'ARB',
    [DigitalAssetId.Avalanche]: 'AVAX',
    [DigitalAssetId.Axie]: 'AXS',
    [DigitalAssetId.Bitcoin]: 'BTC',
    [DigitalAssetId.Bnb]: 'BNB',
    [DigitalAssetId.Celestia]: 'TIA',
    [DigitalAssetId.Chia]: 'XCH',
    [DigitalAssetId.Cosmos]: 'ATOM',
    [DigitalAssetId.Dogecoin]: 'DOGE',
    [DigitalAssetId.Ethereum]: 'ETH',
    [DigitalAssetId.Fantom]: 'FTM',
    [DigitalAssetId.Jupiter]: 'JUP',
    [DigitalAssetId.Litecoin]: 'LTC',
    [DigitalAssetId.Mantle]: 'MANTLE',
    [DigitalAssetId.Near]: 'NEAR',
    [DigitalAssetId.Optimism]: 'OP',
    [DigitalAssetId.Polkadot]: 'DOT',
    [DigitalAssetId.Polygon]: 'MATIC',
    [DigitalAssetId.ShibaInu]: 'SHIB',
    [DigitalAssetId.Solana]: 'SOL',
    [DigitalAssetId.Starknet]: 'STRK',
    [DigitalAssetId.Toncoin]: 'TON',
    [DigitalAssetId.Wormhole]: 'W',
    [DigitalAssetId.Xrp]: 'XRP',
  };

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.cryptoCompareApiKey = this.configService.getOrThrow<string>('CRYPTO_COMPARE_API_KEY');
    this.cryptoCompareApiUrl = this.configService.getOrThrow<string>('CRYPTO_COMPARE_API_URL');
    this.cryptoCompareMinApiUrl = this.configService.getOrThrow<string>('CRYPTO_COMPARE_MIN_API_URL');
  }

  public async getAssetHourlyHistory(assetId: DigitalAssetId) {
    const searchParams = new URLSearchParams();

    searchParams.set('limit', this.HISTOUR_LIMIT.toString());
    searchParams.set('fsym', this.ASSET_ID_TO_FSYM_MAP[assetId]);
    searchParams.set('tsym', 'USD');

    const observable = await this.httpService.get<CryptoCompareHistohourResponse>(
      `${this.cryptoCompareMinApiUrl}/data/v2/histohour?${searchParams}`,
      {
        headers: new AxiosHeaders({
          Authorization: `ApiKey ${this.cryptoCompareApiKey}`,
        }),
      },
    );

    const { data: responseData } = await firstValueFrom(observable.pipe());

    return responseData.Data.Data.map((item) => {
      return {
        time: item.time,
        open: item.open,
        close: item.close,
      };
    });
  }

  public async getAssetLatestTick(assets: DigitalAssetId[]) {
    const searchParams = new URLSearchParams();

    const groups = 'VALUE,CURRENT_HOUR,ID';

    const instruments = assets
      .map((assetId) => {
        return `${this.ASSET_ID_TO_FSYM_MAP[assetId]}-USD`;
      })
      .join(',');

    searchParams.append('market', 'ccix');
    searchParams.append('instruments', instruments);
    searchParams.append('groups', groups);

    const fsymToAssetIdMap = Object.entries(this.ASSET_ID_TO_FSYM_MAP).reduce((map, [assetId, fsym]) => {
      map[fsym] = assetId;

      return map;
    });

    const observable = await this.httpService.get<CryptoCompareLatestTickResponse>(
      `${this.cryptoCompareApiUrl}/index/cc/v1/latest/tick?${searchParams}`,
      {
        headers: new AxiosHeaders({
          Authorization: `ApiKey ${this.cryptoCompareApiKey}`,
        }),
      },
    );

    const { data: responseData } = await firstValueFrom(observable.pipe());

    return Object.keys(responseData.Data).reduce((ticksData, key) => {
      const [fsym] = key.split('-');

      const assetId = fsymToAssetIdMap[fsym as string] as DigitalAssetId;
      const instrumentData = responseData.Data[key];

      if (assetId) {
        ticksData[assetId] = {
          timestamp: instrumentData.VALUE_LAST_UPDATE_TS,
          price: instrumentData.VALUE,
          currentHourOpenPrice: instrumentData.CURRENT_HOUR_OPEN,
          currentHourPriceChange: instrumentData.CURRENT_HOUR_CHANGE,
          currentHourPriceChangePercentage: instrumentData.CURRENT_HOUR_CHANGE_PERCENTAGE,
        };
      }

      return ticksData;
    }, {} as DigitalAssetsTicksData);
  }
}
