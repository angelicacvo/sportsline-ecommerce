import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ApiKeyService } from '../../api-key/api-key.service';

// Metadata key for API key permissions (similar to roles metadata from Week 5)
export const API_KEY_PERMISSIONS = 'api_key_permissions';

// Custom decorator (learned in Week 4) to specify required permissions for a route
export const RequireApiKeyPermission = (...permissions: string[]) => 
    SetMetadata(API_KEY_PERMISSIONS, permissions);

/**
 * API Key Guard - Week 6: Advanced Authentication
 * Similar to AuthGuard from Week 5, but validates X-API-KEY header instead of JWT
 * Uses Reflector (Week 4) to read route metadata and check permissions
 * Implements CanActivate interface (Week 4 Guards concept)
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