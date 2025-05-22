import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
    });

    await this.usersService.saveRefreshToken(user.id, refreshToken);
    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, {
        expiresIn: '7d',
      }),
    };
  }

  async verifyRefreshToken(refreshToken: string) {
    const decoded = this.jwtService.verify(refreshToken);
    if (decoded) {
      const user = await this.usersService.verifyRefreshToken(
        refreshToken,
        decoded.sub,
      );
      if (user) {
        return user;
      }
    }
    return false;
  }
}
