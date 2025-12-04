import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { ConfigService } from '@nestjs/config';

/**
 * API KEY GUARD
 * 
 * Protects endpoints using X-API-KEY header authentication.
 * Useful for:
 * - External service integrations
 * - Webhooks
 * - Administrative operations
 * - Partner APIs
 * 
 * Usage:
 * @UseGuards(ApiKeyGuard)
 * @Get('admin/stats')
 * getStats() {}
 * 
 * Client must send header:
 * X-API-KEY: your_api_key_here
 */
@Injectable()
export class ApiKeyGuard implements CanActivate {
    constructor(private configService: ConfigService) { }
    
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const apiKey = request.headers['x-api-key'] as string;

        // Support multiple API keys separated by comma
        const validApiKeys = this.configService.get('API_KEY')?.split(',') || []; 

        if (!apiKey || !validApiKeys.includes(apiKey)) {
            throw new UnauthorizedException('Invalid or missing API key');
        }
        
        return true;
    }
}