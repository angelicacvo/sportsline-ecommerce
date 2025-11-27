import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ApiKeyService } from '../../api-key/api-key.service';
import { API_SCOPES } from '../decorators/api-scope.decorator';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private readonly apiKeyService: ApiKeyService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    const key = request.headers['x-api-key'];
    if (!key) throw new UnauthorizedException('API Key requerida');

    const apiKey = await this.apiKeyService.findByKey(key);
    if (!apiKey) throw new UnauthorizedException('API Key inválida');

    // Validar scopes de la ruta
    const requiredScopes =
      this.reflector.get<string[]>(API_SCOPES, context.getHandler()) || [];

    if (requiredScopes.length > 0) {
      const hasScope = requiredScopes.every((scope) =>
        apiKey.scopes.includes(scope),
      );

      if (!hasScope) throw new ForbiddenException('No tienes permisos');
    }

    request.apiKeyOwner = apiKey.owner;
    return true;
  }
}
