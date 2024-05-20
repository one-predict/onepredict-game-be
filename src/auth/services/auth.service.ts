import { ForbiddenException, Injectable } from '@nestjs/common';
import { createAppClient, viemConnector } from '@farcaster/auth-client';
import { InjectUserService, UserEntity, UserService } from '@app/user';
import { ConfigService } from '@nestjs/config';

interface VerifySignInMessageParams {
  message: string;
  name: string;
  pfp: string;
  signature: `0x${string}`;
  nonce: string;
}

export interface AuthService {
  verifySignInMessage(params: VerifySignInMessageParams): Promise<{ fid: number; user: UserEntity }>;
}

@Injectable()
export class AuthServiceImpl implements AuthService {
  private readonly appClient = createAppClient({
    ethereum: viemConnector(),
  });

  constructor(
    @InjectUserService() private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  public async verifySignInMessage(params: VerifySignInMessageParams) {
    const verifyResponse = await this.appClient.verifySignInMessage({
      nonce: params.nonce,
      message: params.message,
      signature: params.signature,
      domain: this.configService.getOrThrow('AUTH_DOMAIN'),
    });

    const { success, fid } = verifyResponse;

    if (!success) {
      throw new ForbiddenException('Authorization failed.');
    }

    const user = await this.userService.getByFid(fid);

    if (!user) {
      const user = await this.userService.create({
        fid,
        name: params.name,
        imageUrl: params.pfp,
        balance: 0,
      });

      return { fid, user };
    }

    if (user.getName() !== params.name || user.getImageUrl() !== params.pfp) {
      await this.userService.update(user.getId(), {
        name: params.name,
        imageUrl: params.pfp,
      });
    }

    return { fid, user };
  }
}
