import { ForbiddenException, Injectable } from '@nestjs/common';
import { createAppClient, viemConnector } from '@farcaster/auth-client';
import { InjectUserService, UserEntity, UserService } from '@app/user';

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

  constructor(@InjectUserService() private readonly userService: UserService) {}

  public async verifySignInMessage(params: VerifySignInMessageParams) {
    const verifyResponse = await this.appClient.verifySignInMessage({
      nonce: params.nonce,
      message: params.message,
      signature: params.signature,
      domain: 'example.com',
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

    return { fid, user };
  }
}
