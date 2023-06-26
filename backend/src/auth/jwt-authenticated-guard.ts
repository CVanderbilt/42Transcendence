import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { getAuthToken } from 'src/utils/utils';

@Injectable()
export class JwtAuthenticatedGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    let token;

    try {
      token = getAuthToken(request);
    } catch (error) {
      throw error
    }

    return super.canActivate(context);
  }
  
  handleRequest(err, userInToken, info) {
    if (err || !userInToken) {
      throw err || new UnauthorizedException();
    }
    return userInToken;
  }
}
