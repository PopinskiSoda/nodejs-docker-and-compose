import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { AuthUser } from '../common/types/auth-user.type.js';
import { UsersService } from '../users/users.service.js';
import { CreateOfferDto } from './dto/create-offer.dto.js';
import { OffersService } from './offers.service.js';

@UseGuards(JwtAuthGuard)
@Controller('offers')
export class OffersController {
  constructor(
    private readonly offersService: OffersService,
    private readonly usersService: UsersService,
  ) {}

  @Post()
  async create(@CurrentUser() auth: AuthUser, @Body() dto: CreateOfferDto) {
    return this.offersService.create(
      dto,
      await this.usersService.findOne({ id: auth.id }),
    );
  }

  @Get()
  findAll() {
    return this.offersService.findMany();
  }
}
