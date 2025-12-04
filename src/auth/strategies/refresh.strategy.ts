import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'JWT_REFRESH_SECRET',
      passReqToCallback: true,
    });
  }

  async validate(req, payload: any) {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      throw new UnauthorizedException('Refresh token not provided');
    }

    const user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };

    return this.authService.refreshToken(user);
  }
}
