import { ForbiddenException, Injectable } from '@nestjs/common';
import { createAppClient, viemConnector } from '@farcaster/auth-client';
import { InjectUserService, UserEntity, UserService } from '@app/user';
import { ConfigService } from '@nestjs/config';

interface VerifySignInMessageParams {
  message: string;
  username: string;
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
        username: params.username,
        imageUrl: params.pfp,
      });

      return { fid, user };
    }

    if (user.getUsername() !== params.username || user.getImageUrl() !== params.pfp) {
      await this.userService.update(user.getId(), {
        username: params.username,
        imageUrl: params.pfp,
      });
    }

    return { fid, user };
  }
}
