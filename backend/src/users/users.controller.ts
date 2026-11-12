import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { AuthUser } from '../common/types/auth-user.type.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { WishesService } from '../wishes/wishes.service.js';
import { FindUsersDto } from './dto/find-users.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import type { User } from './entities/user.entity.js';
import { UsersService } from './users.service.js';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly wishesService: WishesService,
  ) {}

  @Get('me')
  async me(@CurrentUser() user: AuthUser) {
    return this.ownProfile(await this.usersService.findOne({ id: user.id }));
  }

  @Patch('me')
  async update(@CurrentUser() user: AuthUser, @Body() dto: UpdateUserDto) {
    return this.ownProfile(
      await this.usersService.updateOne({ id: user.id }, dto),
    );
  }

  @Post('find')
  find(@Body() dto: FindUsersDto) {
    return this.usersService.findMany(dto.query);
  }

  @Get('me/wishes')
  myWishes(@CurrentUser() user: AuthUser) {
    return this.wishesService.findMany({ owner: { id: user.id } });
  }

  @Get(':username/wishes')
  async wishes(@Param('username') username: string) {
    const owner = await this.usersService.findOne({ username });
    return this.wishesService.findMany({ owner: { id: owner.id } });
  }

  @Get(':username')
  byUsername(@Param('username') username: string) {
    return this.usersService.findOne({ username });
  }

  private ownProfile(user: User) {
    return {
      id: user.id,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      username: user.username,
      about: user.about,
      avatar: user.avatar,
      email: user.email,
    };
  }
}
