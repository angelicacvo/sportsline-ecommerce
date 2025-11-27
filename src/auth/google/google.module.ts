import { Module, forwardRef } from '@nestjs/common';
import { GoogleStrategy } from './google.strategy';
import { GoogleController } from './google.controller';
import { AuthModule } from '../auth.module';
import { GoogleAuthGuard } from './google.guard';

@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [GoogleController],
  providers: [GoogleStrategy, GoogleAuthGuard],
  exports: [GoogleStrategy],
})
export class GoogleAuthModule {}
