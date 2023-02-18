import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersService } from 'src/users/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/users/user.entity';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
// import { Jwt2faStrategy } from './jwt-2fa-strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    JwtModule.register({
      secret: process.env.JWT_KEY,
      signOptions: { expiresIn: "1h"},
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService, 
    UsersService,
    JwtService,
    JwtStrategy,
    // Jwt2faStrategy,
  ]
})
export class AuthModule {}
