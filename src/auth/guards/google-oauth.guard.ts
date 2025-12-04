import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Guard that initiates Google OAuth authentication flow
@Injectable()
export class GoogleOAuthGuard extends AuthGuard('google') {}
