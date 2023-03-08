import { ExecutionContext, Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    canActivate(context: ExecutionContext) {
        return super.canActivate(context);
      }
    
      handleRequest(err, userInToken, info) {
        if (err || !userInToken) {
          throw err || new UnauthorizedException();
        }
        return userInToken;
      }
 }