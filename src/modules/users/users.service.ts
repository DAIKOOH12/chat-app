import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/User';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { stat } from 'fs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createUser(userData: Partial<User>): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    userData.password = hashedPassword;
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  async findUserByEmail(email: string) {
    const user = this.userRepository.findOneBy({ email });
    return user;
  }

  async validateUser(email: string, password: string) {
    const user = await this.userRepository.findOneBy({ email });

    if (!user) {
      return null;
    }
    const isPasswordValid = await bcrypt.compareSync(password, user.password);

    if (!isPasswordValid) {
      throw new HttpException('Invalid User', HttpStatus.NOT_FOUND);
    }
    return user;
  }

  async saveRefreshToken(userId: number, refreshToken: string) {
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    user.refreshToken = bcrypt.hashSync(refreshToken, 10);
    return this.userRepository.save(user);
  }

  async verifyRefreshToken(refreshToken: string, userId: number) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (user) {
      const status = await bcrypt.compareSync(refreshToken, user.refreshToken);
      if (status) {
        return user;
      }
    }
    return false;
  }
}
