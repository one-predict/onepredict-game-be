import {ForbiddenException, Injectable} from '@nestjs/common';
import {InjectUserService, UserEntity, UserService} from '@app/user';
import {ConfigService} from '@nestjs/config';
import {getTelegramInitDataFromSignInMessage, verifyTelegramSignInMessage} from "@auth/utils";
import {ExternalUserType} from "@auth/enums";

export interface AuthService {
  signTelegramUser(signInMessage: string): Promise<UserEntity>;
}

@Injectable()
export class AuthServiceImpl implements AuthService {
  constructor(
    @InjectUserService() private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  public async signTelegramUser(signInMessage: string) {
    const initData = getTelegramInitDataFromSignInMessage(signInMessage);

    const isMessageValid = verifyTelegramSignInMessage(
      signInMessage,
      this.configService.get('TELEGRAM_BOT_TOKEN'),
    );

    if (!isMessageValid || !initData.user) {
      throw new ForbiddenException('Authorization failed.');
    }

    const user = await this.userService.getByExternalId(initData.user.id);

    if (!user) {
      return this.userService.create({
        externalId: initData.user.id,
        externalType: ExternalUserType.Telegram,
        username: initData.user.username,
        firstName: initData.user.first_name,
        lastName: initData.user.last_name,
        avatarUrl: initData.user.photo_url,
      });
    }

    if (
      (user.getUsername() !== initData.user.username && initData.user.username) ||
      (user.getFirstName() !== initData.user.first_name && initData.user.first_name)||
      (user.getLastName() !== initData.user.last_name && initData.user.last_name) ||
      (user.getAvatarUrl() !== initData.user.photo_url && initData.user.photo_url)
    ) {
      return this.userService.update(user.getId(), {
        username: initData.user.username,
        firstName: initData.user.first_name,
        lastName: initData.user.last_name,
        avatarUrl: initData.user.photo_url,
      });
    }

    return user;
  }
}
