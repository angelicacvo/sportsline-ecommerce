import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * GOOGLE OAUTH GUARD
 * 
 * Protects routes that initiate Google OAuth flow.
 * When applied to a route, it automatically redirects to Google login.
 * 
 * Usage:
 * @UseGuards(GoogleOAuthGuard)
 * @Get('auth/google')
 * googleLogin() {}
 */
@Injectable()
export class GoogleOAuthGuard extends AuthGuard('google') {}
