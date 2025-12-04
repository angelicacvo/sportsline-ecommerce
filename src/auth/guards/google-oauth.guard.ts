import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Guard que inicia el flujo de autenticación con Google OAuth
@Injectable()
export class GoogleOAuthGuard extends AuthGuard('google') {}
