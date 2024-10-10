import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { AxiosHeaders } from 'axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { DigitalAssetId } from '@digital-assets/enums';

interface CryptoCompareHistohourResponse {
  Data: Array<{
    time: number;
    open: number;
    close: number;
  }>;
  TimeFrom: number;
  TimeTo: number;
}

export interface DigitalAssetHistoryItem {
  time: number;
  open: number;
  close: number;
}

export interface DigitalAssetsApi {
  getAssetHourlyHistory(assetId: DigitalAssetId): Promise<DigitalAssetHistoryItem[]>;
}

@Injectable()
export class CryptoCompareDigitalAssetsApi implements DigitalAssetsApi {
  private HISTOUR_LIMIT = 48;

  private readonly cryptoCompareApiKey: string;
  private readonly cryptoCompareApiUrl: string;

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
  }

  public async getAssetHourlyHistory(assetId: DigitalAssetId) {
    const searchParams = new URLSearchParams();

    searchParams.set('limit', this.HISTOUR_LIMIT.toString());
    searchParams.set('fsym', this.ASSET_ID_TO_FSYM_MAP[assetId]);
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
}
