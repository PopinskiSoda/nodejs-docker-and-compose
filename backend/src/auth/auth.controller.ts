import { Body, Controller, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { CreateUserDto } from '../users/dto/create-user.dto.js';
import type { User } from '../users/entities/user.entity.js';
import { UsersService } from '../users/users.service.js';
import { AuthService } from './auth.service.js';
import { SigninDto } from './dto/signin.dto.js';
import { LocalAuthGuard } from './guards/local-auth.guard.js';

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('signup')
  signup(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('signin')
  @HttpCode(200)
  signin(
    @Body() _credentials: SigninDto,
    @Req() request: Request & { user: User },
  ) {
    return this.authService.login(request.user);
  }
}
