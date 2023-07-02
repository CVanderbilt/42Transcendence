import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersService } from 'src/users/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/users/user.entity';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { Jwt2faStrategy } from './jwt-2fa-strategy';
import { Chats2Service } from 'src/chats2/chats2.service';
import { Chats2Module } from 'src/chats2/chats2.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    JwtModule.register({
      secret: process.env.JWT_KEY,
      signOptions: { expiresIn: "24h"},
    }),
    Chats2Module,
    
  ],
  controllers: [AuthController],
  providers: [
    AuthService, 
    UsersService,
    Chats2Service,
    JwtService,
    JwtStrategy,
    Jwt2faStrategy,
  ],
  exports: [AuthService],
})
export class AuthModule {}
