import { Injectable } from '@nestjs/common';
import { DigitalAssetsPricesSnapshotEntity } from '@digital-assets/entities';
import { DigitalAssetsPricesSnapshotDto } from '@digital-assets/dto';

export interface DigitalAssetsPricesSnapshotEntityMapper {
  mapOne(entity: DigitalAssetsPricesSnapshotEntity): DigitalAssetsPricesSnapshotDto;
  mapMany(entities: DigitalAssetsPricesSnapshotEntity[]): DigitalAssetsPricesSnapshotDto[];
}

@Injectable()
export class DefaultDigitalAssetsPricesSnapshotEntityMapper implements DigitalAssetsPricesSnapshotEntityMapper {
  public mapOne(entity: DigitalAssetsPricesSnapshotEntity): DigitalAssetsPricesSnapshotDto {
    return {
      id: entity.getId(),
      prices: entity.getPrices(),
      timestamp: entity.getTimestamp(),
    };
  }

  public mapMany(entities: DigitalAssetsPricesSnapshotEntity[]): DigitalAssetsPricesSnapshotDto[] {
    return entities.map((entity) => this.mapOne(entity));
  }
}
