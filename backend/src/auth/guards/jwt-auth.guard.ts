import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super(); // Call parent constructor
  }

  // This method runs before any protected route : checks if route is public,
  // if not, applies JWT strategy (Passport) to validate token
  canActivate(context: ExecutionContext) {
    // Check if the route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_KEY,
      [
        context.getHandler(), // method-level
        context.getClass(),   // controller-level
      ],
    );

    if (isPublic) {
      return true; // skip JWT validation
    }

    // call the default AuthGuard('jwt') logic
    return super.canActivate(context);
  }

  // This method runs after JWT strategy is executed
  handleRequest(err, user, info) {
    if (err || !user) {
      // If JWT is invalid or missing, throw 401 automatically
      throw err || new UnauthorizedException('Unauthorized access');
    }
    return user; // user object will be available in req.user
  }
}
