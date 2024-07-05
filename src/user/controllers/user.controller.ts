import { Controller, Session, Get, Post, Body, UseGuards } from '@nestjs/common';
import * as secureSession from '@fastify/secure-session';
import { UserService } from '@user/services';
import { InjectUserService } from '@user/decorators';
import { CreateUserDto, GetUserByFidDto } from '@user/dto';
import { PrivateApiAuthorizationTokenGuard } from '@common/guards';
import { UserEntity } from '@app/user';

@Controller()
export default class UserController {
  constructor(@InjectUserService() private readonly userService: UserService) {}

  @Get('/users/current-user')
  public async getCurrentUser(@Session() session: secureSession.Session) {
    const fid = session.get('fid');

    if (!fid) {
      return { user: null };
    }

    const user = await this.userService.getByFid(fid);

    return {
      user: user && this.mapUserEntityToViewModel(user),
    };
  }

  // GRPC Style
  @Post('/users/getByFid')
  @UseGuards(PrivateApiAuthorizationTokenGuard)
  public async getByFid(@Body() body: GetUserByFidDto) {
    const user = await this.userService.getByFid(body.fid);

    return {
      user: user && this.mapUserEntityToViewModel(user),
    };
  }

  // GRPC Style
  @Post('/users/createUser')
  @UseGuards(PrivateApiAuthorizationTokenGuard)
  public async createUser(@Body() body: CreateUserDto) {
    const user = await this.userService.create({
      fid: body.fid,
      balance: 0,
    });

    return {
      user: user && this.mapUserEntityToViewModel(user),
    };
  }

  private mapUserEntityToViewModel(user: UserEntity) {
    return {
      id: user.getId(),
      fid: user.getFid(),
      name: user.getName(),
      imageUrl: user.getImageUrl(),
      coinsBalance: user.getCoinsBalance(),
      energy: user.getEnergy(),
    };
  }
}
