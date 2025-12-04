import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, StrategyOptions } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

/**
 * GOOGLE OAUTH2 STRATEGY
 * 
 * Handles authentication with Google using OAuth2 protocol.
 * 
 * Flow:
 * 1. User clicks "Login with Google"
 * 2. Redirects to Google login page
 * 3. User authenticates and grants permissions
 * 4. Google redirects back with authorization code
 * 5. This strategy exchanges code for access token
 * 6. Retrieves user profile from Google
 * 7. validate() method processes the user data
 * 
 * Required environment variables:
 * - GOOGLE_CLIENT_ID: From Google Cloud Console
 * - GOOGLE_CLIENT_SECRET: From Google Cloud Console
 * - GOOGLE_CALLBACK_URL: Where Google redirects after authentication
 */
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID') || '',
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET') || '',
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL') || '',
      scope: ['email', 'profile'],  // Permissions we request from user
    } as StrategyOptions);
  }

  /**
   * Validate method is called after successful Google authentication
   * 
   * @param accessToken - Token to access Google APIs
   * @param refreshToken - Token to refresh the access token
   * @param profile - User profile data from Google
   * @param done - Callback to pass user data to Passport
   */
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    // Extract useful information from Google profile
    const { id, name, emails, photos } = profile;
    
    const user = {
      googleId: id,
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      picture: photos[0].value,
      accessToken,
    };

    // Pass user data to the next step (controller)
    done(null, user);
  }
}
