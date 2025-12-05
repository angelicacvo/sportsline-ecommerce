import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID', ''),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET', ''),
      callbackURL:
        configService.get<string>(
          'GOOGLE_CALLBACK_URL',
          'http://localhost:3000/auth/google/callback',
        ),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails, photos } = profile;
    
    const fullName = [name.givenName, name.familyName]
      .filter(Boolean)
      .join(' ') || profile.displayName || emails[0].value.split('@')[0];
    
    const user = {
      email: emails[0].value,
      name: fullName,
      picture: photos?.[0]?.value || null,
      accessToken,
    };

    done(null, user);
  }
}
