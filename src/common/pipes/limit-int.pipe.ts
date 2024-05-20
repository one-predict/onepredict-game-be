import { PipeTransform, Injectable, BadRequestException, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export default class LimitIntPipe implements PipeTransform {
  constructor(private maxValue: number) {}

  public transform(value: unknown, metadata: ArgumentMetadata): number {
    if (value === undefined || value === null) {
      throw new BadRequestException(`The ${metadata.type} parameter '${metadata.data}' is required`);
    }

    if (typeof value !== 'number') {
      throw new BadRequestException(
        `Invalid integer value for parameter '${metadata.data}' of ${metadata.type}`,
      );
    }

    if (value > this.maxValue) {
      throw new BadRequestException(
        `The value of '${metadata.data}' of ${metadata.type} cannot be greater than ${this.maxValue}`,
      );
    }

    return value;
  }
}
