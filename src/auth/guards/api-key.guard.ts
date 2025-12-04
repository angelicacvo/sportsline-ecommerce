import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ApiKeyService } from '../../api-key/api-key.service';

/**
 * Metadata key for specifying required permissions on routes
 */
export const API_KEY_PERMISSIONS = 'api_key_permissions';

/**
 * Decorator to specify required API key permissions for a route
 * 
 * @example
 * ```typescript
 * @RequireApiKeyPermission('read:products')
 * @UseGuards(ApiKeyGuard)
 * @Get('products')
 * getProducts() {}
 * 
 * @RequireApiKeyPermission('write:orders', 'admin:users')
 * @UseGuards(ApiKeyGuard)
 * @Post('admin/users')
 * createUser() {}
 * ```
 */
export const RequireApiKeyPermission = (...permissions: string[]) => 
    SetMetadata(API_KEY_PERMISSIONS, permissions);

/**
 * API KEY GUARD (Database-backed)
 * 
 * Protects endpoints using X-API-KEY header authentication with database validation.
 * 
 * Features:
 * - Validates API keys against database
 * - Checks key expiration
 * - Verifies key is active
 * - Enforces permission-based access control
 * - Tracks last usage timestamp
 * 
 * Usage:
 * ```typescript
 * // Simple API key authentication
 * @UseGuards(ApiKeyGuard)
 * @Get('admin/stats')
 * getStats() {}
 * 
 * // With permission check
 * @RequireApiKeyPermission('read:products')
 * @UseGuards(ApiKeyGuard)
 * @Get('products')
 * getProducts() {}
 * ```
 * 
 * Client must send header:
 * X-API-KEY: sk_prod_your_api_key_here
 */
@Injectable()
export class ApiKeyGuard implements CanActivate {
    constructor(
        private readonly apiKeyService: ApiKeyService,
        private readonly reflector: Reflector,
    ) {}
    
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const apiKey = request.headers['x-api-key'] as string;

        if (!apiKey) {
            throw new UnauthorizedException('Missing API key. Please provide X-API-KEY header.');
        }

        // Get required permissions from route metadata (if any)
        const requiredPermissions = this.reflector.get<string[]>(
            API_KEY_PERMISSIONS,
            context.getHandler(),
        );

        // Validate the API key
        if (requiredPermissions && requiredPermissions.length > 0) {
            // Check each required permission
            for (const permission of requiredPermissions) {
                const hasPermission = await this.apiKeyService.hasPermission(apiKey, permission);
                
                if (!hasPermission) {
                    throw new UnauthorizedException(
                        `API key does not have required permission: ${permission}`
                    );
                }
            }
        } else {
            // Just validate the key exists and is active (no specific permission required)
            const validation = await this.apiKeyService.validateKey(apiKey);
            
            if (!validation.isValid) {
                throw new UnauthorizedException('Invalid, expired, or inactive API key');
            }
        }
        
        return true;
    }
}