import { ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class Jwt2faAuthGuard extends AuthGuard('jwt-2fa') {
    canActivate(context: ExecutionContext) {
        return super.canActivate(context);
      }
    
      handleRequest(err, userInToken, info) { // nota, esto es lo que devuelve la estrategia
        if (err || !userInToken) {
          throw err || new UnauthorizedException();
        }

        return userInToken;
      }
}