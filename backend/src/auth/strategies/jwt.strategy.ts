import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../services/auth.service';
import { ConfigService } from '@nestjs/config';
import { User } from '../../users/entities/users.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    // get the secret first and validate it exists
    const secret = configService.get<string>('JWT_SECRET');

    // throw error if JWT_SECRET is not configured
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    super({
      // this extracts JWT from Authorization header (Bearer token)
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // reject if expired tokens
      secretOrKey: secret,
    });
  }

  // called automatically by Passport to validate the JWT payload and User object to attach to req.user
  async validate(payload: any): Promise<Partial<User>> {
    // fetch full user info from DB
    const user = await this.authService.findUserByEmail(payload.email);
    if (!user) {
      throw new UnauthorizedException('Invalid token or user does not exist');
    }

    const { password, ...result } = (user as any).toObject();

    return {
      ...result,
      id: payload.sub,
      role: payload.role, // attach role from token payload
    };
  }
}
