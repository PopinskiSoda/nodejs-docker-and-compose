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
import { CreateWishDto } from './dto/create-wish.dto.js';
import { UpdateWishDto } from './dto/update-wish.dto.js';
import { WishesService } from './wishes.service.js';

@Controller('wishes')
export class WishesController {
  constructor(
    private readonly wishesService: WishesService,
    private readonly usersService: UsersService,
  ) {}

  @Get('last')
  last() {
    return this.wishesService.findLast();
  }

  @Get('top')
  top() {
    return this.wishesService.findTop();
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@CurrentUser() auth: AuthUser, @Body() dto: CreateWishDto) {
    return this.wishesService.create(
      dto,
      await this.usersService.findOne({ id: auth.id }),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/copy')
  async copy(
    @CurrentUser() auth: AuthUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.wishesService.copy(
      id,
      await this.usersService.findOne({ id: auth.id }),
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  get(@Param('id', ParseIntPipe) id: number) {
    return this.wishesService.findOne({ id });
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateWishDto,
  ) {
    return this.wishesService.updateOwned(id, user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(204)
  remove(@CurrentUser() user: AuthUser, @Param('id', ParseIntPipe) id: number) {
    return this.wishesService.removeOwned(id, user.id);
  }
}
