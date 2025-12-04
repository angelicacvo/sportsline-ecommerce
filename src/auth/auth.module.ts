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

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthGuard,
    RolesGuard,
    ApiKeyGuard,
    GoogleStrategy,
  ],
  imports: [
    forwardRef(() => UserModule),
    ApiKeyModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  exports: [AuthGuard, RolesGuard, ApiKeyGuard],
})
export class AuthModule { }
