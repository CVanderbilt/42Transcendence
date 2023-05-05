import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtAdminGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const role = this.validateToken(token);
        console.log("validating role: " + role)
        if ((role === 'ADMIN' || role === 'OWNER')) {
          return super.canActivate(context);
        }
      } catch (err) {
        throw new UnauthorizedException('Invalid token');
      }
    }
    throw new UnauthorizedException('Token not found');
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
