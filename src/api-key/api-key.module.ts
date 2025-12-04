import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiKeyService } from './api-key.service';
import { ApiKeyController } from './api-key.controller';
import { ApiKey } from './entities/api-key.entity';

/**
 * Module for API Key management.
 * 
 * Provides:
 * - CRUD operations for API keys
 * - API key validation and permission checking
 * - Integration with TypeORM for database operations
 * 
 * @exports ApiKeyService - For use in guards and other modules
 */
@Module({
    imports: [TypeOrmModule.forFeature([ApiKey])],
    controllers: [ApiKeyController],
    providers: [ApiKeyService],
    exports: [ApiKeyService], // Export for use in ApiKeyGuard
})
export class ApiKeyModule {}
