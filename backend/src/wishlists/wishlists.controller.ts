import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { AuthUser } from '../common/types/auth-user.type.js';
import { UsersService } from '../users/users.service.js';
import { CreateWishlistDto } from './dto/create-wishlist.dto.js';
import { UpdateWishlistDto } from './dto/update-wishlist.dto.js';
import { WishlistsService } from './wishlists.service.js';

@UseGuards(JwtAuthGuard)
@Controller('wishlistlists')
export class WishlistsController {
  constructor(
    private readonly service: WishlistsService,
    private readonly users: UsersService,
  ) {}

  @Get()
  all() {
    return this.service.findMany();
  }

  @Get(':id')
  one(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne({ id });
  }

  @Post()
  async create(@CurrentUser() auth: AuthUser, @Body() dto: CreateWishlistDto) {
    return this.service.create(dto, await this.users.findOne({ id: auth.id }));
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateWishlistDto,
  ) {
    return this.service.updateOwned(id, user.id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@CurrentUser() user: AuthUser, @Param('id', ParseIntPipe) id: number) {
    return this.service.removeOwned(id, user.id);
  }
}
