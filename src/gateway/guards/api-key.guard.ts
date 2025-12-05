import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

@Injectable()
export class ApiKeyGuard extends AuthGuard('api-key') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isApiKey = this.reflector.getAllAndOverride<boolean>('isApiKey', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!isApiKey) {
      return true;
    }

    return super.canActivate(context);
  }
}
