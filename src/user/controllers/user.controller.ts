import { Controller, Session, Get, Post, Body, UseGuards } from '@nestjs/common';
import * as secureSession from '@fastify/secure-session';
import { UserService } from '@user/services';
import { InjectUserService } from '@user/decorators';
import { CreateUserDto, GetUserByFidDto, GetUserRankByIdDto } from '@user/dto';
import { AuthGuard, PrivateApiAuthorizationTokenGuard } from '@common/guards';

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
      user: user && {
        id: user.getId(),
        fid: user.getFid(),
        name: user.getName(),
        imageUrl: user.getImageUrl(),
        balance: user.getBalance(),
        points: user.getPoints(),
      },
    };
  }

  @Get('/users/current-user/rank')
  @UseGuards(AuthGuard)
  public async getCurrentUserRank(@Session() session: secureSession.Session) {
    const rank = await this.userService.getUserRank(session.get('userId'));

    return { rank };
  }

  // GRPC Style
  @Post('/users/getByFid')
  @UseGuards(PrivateApiAuthorizationTokenGuard)
  public async getByFid(@Body() body: GetUserByFidDto) {
    const user = await this.userService.getByFid(body.fid);

    return {
      user: user && {
        id: user.getId(),
        fid: user.getFid(),
        name: user.getName(),
        points: user.getPoints(),
        imageUrl: user.getImageUrl(),
        balance: user.getBalance(),
      },
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
      user: user && {
        id: user.getId(),
        fid: user.getFid(),
        name: user.getName(),
        imageUrl: user.getImageUrl(),
        points: user.getPoints(),
        balance: user.getBalance(),
      },
    };
  }

  // GRPC Style
  @Post('/users/getUserRankById')
  @UseGuards(PrivateApiAuthorizationTokenGuard)
  public async getUserRankById(@Body() body: GetUserRankByIdDto) {
    const rank = await this.userService.getUserRank(body.userId);

    return { rank };
  }
}
