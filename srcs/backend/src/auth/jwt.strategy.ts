
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
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
        const user = await this.userService.findOneById(payload.userId);
        if (payload.isTwoFactorAuthenticationEnabled && !payload.isTwoFactorAuthenticated)
            throw new UnauthorizedException("Two factor authentication is enabled but not authenticated")
        if (user === null)
            throw new NotFoundException()
        return user 
    }
}
