import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from 'src/entities/User';
import { UsersService } from '../users/users.service';
import { LocalAuthGuard } from 'src/guards/local-auth.guard';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
  ) {}

  @Post('/register')
  register(@Body() userData: any) {
    return this.userService.createUser(userData);
  }

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  async login(@Request() req: any) {
    return this.authService.login(req.user);
  }

  @Post('/refresh-token')
  async refreshToken(@Body() body: any) {
    if (!body.refreshToken) {
      throw new BadRequestException('Refresh token is required');
    }
    const user = await this.authService.verifyRefreshToken(body.refreshToken);

    if (!user) {
      throw new BadRequestException('Invalid User');
    }
    return this.authService.login(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/profile')
  getProfile(@Request() req: any): User {
    return req.user;
  }
}
