import { Module, forwardRef } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from './guards/auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { ApiKeyGuard } from './guards/api-key.guard';
import { GoogleStrategy } from './strategies/google.strategy';
import { ApiKeyModule } from 'src/api-key/api-key.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthGuard,
    RolesGuard,
    ApiKeyGuard,
    // GoogleStrategy is optional - only loads if Google OAuth is configured
    {
      provide: GoogleStrategy,
      useFactory: (configService: ConfigService) => {
        const googleClientId = configService.get('GOOGLE_CLIENT_ID');
        if (googleClientId) {
          return new GoogleStrategy(configService);
        }
        return null;  // Skip if not configured
      },
      inject: [ConfigService],
    },
  ],
  imports: [
    forwardRef(() => UserModule),
    ApiKeyModule,
    ConfigModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  exports: [AuthGuard, RolesGuard, ApiKeyGuard],
})
export class AuthModule { }
