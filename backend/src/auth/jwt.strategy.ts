
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
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
        Logger.log("JwtStrategy.validate")
        Logger.log("payload", payload)
        const user = await this.userService.findOneById(payload.userId);
        if (user === null)
            throw new NotFoundException()
        return user // hay que devolver algo que no sea null para que el guard passe ok
    }
}
