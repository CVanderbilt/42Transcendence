import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import * as jwt from 'jsonwebtoken';
import { getAuthToken } from 'src/utils/utils';

@Injectable()
export class JwtAdminGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    let token;

    try {
      token = getAuthToken(request);
    } catch (error) {
      throw error
    }
    
    if ((token.role === 'ADMIN' || token.role === 'OWNER')) {
      return super.canActivate(context);
    }
    throw new UnauthorizedException(`${token.role} not allowed`)
  }
  
  handleRequest(err, userInToken, info) {
    if (err || !userInToken) {
      throw err || new UnauthorizedException();
    }
    return userInToken;
  }

  private validateToken(token: string) {
    try {
      const decodedToken = jwt.verify(token, process.env.JWT_KEY) as { [key: string]: any, role: string };
      const role = decodedToken.role;
      return role;
    } catch (err) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
