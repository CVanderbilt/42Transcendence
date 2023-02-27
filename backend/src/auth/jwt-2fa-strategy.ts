import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class Jwt2faStrategy extends PassportStrategy(Strategy, 'jwt-2fa') {
  constructor(private readonly userService: UsersService) {
    super(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_KEY,
        ignoreExpiration: false,
      }
    );
  }

  async validate(payload: any) {
    Logger.log("inside validate 2fa strategy")
    const user = await this.userService.findOneById(payload.userId);
    Logger.log({user})
    if (user === null)
      throw new NotFoundException()

    if (!user.is2fa) {
      return user;
    }

    if (payload.isTwoFactorAuthenticated) {
      return user;
    }

    // si no devuelve nada entonces no pasa la validacion
  }
}