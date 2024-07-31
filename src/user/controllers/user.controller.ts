import { Controller, Session, Get, Post, Body, UseGuards } from '@nestjs/common';
import * as secureSession from '@fastify/secure-session';
import { UserService } from '@user/services';
import { InjectUserService } from '@user/decorators';
import { CreateUserDto, GetUserByExternalIdDto } from '@user/dto';
import { PrivateApiAuthorizationTokenGuard } from '@common/guards';
import { UserEntity } from '@app/user';

@Controller()
export default class UserController {
  constructor(@InjectUserService() private readonly userService: UserService) {}

  @Get('/users/current-user')
  public async getCurrentUser(@Session() session: secureSession.Session) {
    const userId = session.get('userId');

    if (!userId) {
      return { user: null };
    }

    const user = await this.userService.getById(userId);

    return {
      user: user && this.mapUserEntityToViewModel(user),
    };
  }

  // GRPC Style
  @Post('/users/getByExternalId')
  @UseGuards(PrivateApiAuthorizationTokenGuard)
  public async getByFid(@Body() body: GetUserByExternalIdDto) {
    const user = await this.userService.getByExternalId(body.externalId);

    return {
      user: user && this.mapUserEntityToViewModel(user),
    };
  }

  // GRPC Style
  @Post('/users/createUser')
  @UseGuards(PrivateApiAuthorizationTokenGuard)
  public async createUser(@Body() body: CreateUserDto) {
    const user = await this.userService.create({
      externalId: body.externalId,
      externalType: body.externalType,
      username: body.username,
      firstName: body.firstName,
      lastName: body.lastName,
      avatarUrl: body.avatarUrl,
    });

    return {
      user: user && this.mapUserEntityToViewModel(user),
    };
  }

  private mapUserEntityToViewModel(user: UserEntity) {
    return {
      id: user.getId(),
      externalId: user.getExternalId(),
      externalType: user.getExternalType(),
      username: user.getUsername(),
      firstName: user.getFirstName(),
      lastName: user.getLastName(),
      avatarUrl: user.getAvatarUrl(),
      coinsBalance: user.getCoinsBalance(),
    };
  }
}
