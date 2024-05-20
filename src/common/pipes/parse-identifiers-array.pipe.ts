import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { ParseArrayPipe, ParseArrayOptions } from '@nestjs/common';
import { isIdentifier } from '@common/utils';

export interface ParseIdentifierArrayPipe extends ParseArrayOptions {
  maxCount?: number;
}

@Injectable()
class ParseIdentifiersArrayPipe implements PipeTransform<string> {
  private readonly parseArrayPipe: ParseArrayPipe;

  constructor(private options?: ParseIdentifierArrayPipe) {
    this.parseArrayPipe = new ParseArrayPipe(options);
  }

  public async transform(value: string, metadata: ArgumentMetadata): Promise<string[]> {
    const array = await this.parseArrayPipe.transform(value, metadata);

    if (!array.every((item) => isIdentifier(item))) {
      throw new BadRequestException(
        `Each item in the ${metadata.type} '${metadata.data}' should be a valid identifier`,
      );
    }

    if (this.options?.maxCount !== undefined && array.length > this.options?.maxCount) {
      throw new BadRequestException(
        `The ${metadata.type} '${metadata.data}' should not contain more than ${this.options?.maxCount} items`,
      );
    }

    return array;
  }
}

export default ParseIdentifiersArrayPipe;
