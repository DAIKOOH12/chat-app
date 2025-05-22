import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatModule } from './chat/chat.module';
import { UsersModule } from './modules/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/User';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ChatModule,
    UsersModule,
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'sql202.infinityfree.com',
      port: 3306,
      username: 'if0_38269056',
      password: '2auGRfj2G3S',
      database: 'if0_38269056_chatapp',
      entities: [User],
      synchronize: true,
    }),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
