import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Google OAuth Guard - Week 6
 * Similar to AuthGuard('jwt') from Week 5
 * Triggers Google OAuth flow when applied to a route with @UseGuards(GoogleOAuthGuard)
 */
@Injectable()
export class GoogleOAuthGuard extends AuthGuard('google') {}
