import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiKey } from './entities/api-key.entity';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { UpdateApiKeyDto } from './dto/update-api-key.dto';

/**
 * API Key Service - Week 6
 * Standard CRUD service pattern (Week 3)
 * Uses TypeORM Repository (Week 2) for database operations
 * Validates permissions for external service authentication
 */
@Injectable()
export class ApiKeyService {
    constructor(
        @InjectRepository(ApiKey)
        private readonly apiKeyRepository: Repository<ApiKey>,
    ) {}

    async create(createApiKeyDto: CreateApiKeyDto): Promise<ApiKey> {
        const existingKey = await this.apiKeyRepository.findOne({
            where: { key: createApiKeyDto.key }
        });

        if (existingKey) {
            throw new ConflictException('API key already exists');
        }

        const apiKey = this.apiKeyRepository.create(createApiKeyDto);
        return await this.apiKeyRepository.save(apiKey);
    }

    async findAll(): Promise<ApiKey[]> {
        return await this.apiKeyRepository.find({
            order: { createdAt: 'DESC' }
        });
    }

    async findOne(id: string): Promise<ApiKey> {
        const apiKey = await this.apiKeyRepository.findOne({ where: { id } });
        
        if (!apiKey) {
            throw new NotFoundException(`API key with ID ${id} not found`);
        }
        
        return apiKey;
    }

    async findByKey(key: string): Promise<ApiKey | null> {
        return await this.apiKeyRepository.findOne({
            where: { key, isActive: true }
        });
    }

    async update(id: string, updateApiKeyDto: UpdateApiKeyDto): Promise<ApiKey> {
        const apiKey = await this.findOne(id);
        Object.assign(apiKey, updateApiKeyDto);
        return await this.apiKeyRepository.save(apiKey);
    }

    async remove(id: string): Promise<void> {
        const apiKey = await this.findOne(id);
        await this.apiKeyRepository.remove(apiKey);
    }

    /**
     * Validates API key and checks optional permissions
     * Used by ApiKeyGuard (Week 6) to authorize requests
     * Returns: isValid, apiKey entity, hasPermission boolean
     */
    async validateKey(key: string, requiredPermission?: string): Promise<{
        isValid: boolean;
        apiKey?: ApiKey;
        hasPermission?: boolean;
    }> {
        const apiKey = await this.findByKey(key);

        if (!apiKey) {
            return { isValid: false };
        }

        if (apiKey.expiresAt && new Date() > apiKey.expiresAt) {
            return { isValid: false };
        }

        apiKey.lastUsedAt = new Date();
        await this.apiKeyRepository.save(apiKey);

        if (!requiredPermission) {
            return { isValid: true, apiKey };
        }

        const hasPermission = apiKey.permissions.includes(requiredPermission) ||
                            apiKey.permissions.includes('*');

        return {
            isValid: true,
            apiKey,
            hasPermission
        };
    }

    async hasPermission(key: string, permission: string): Promise<boolean> {
        const result = await this.validateKey(key, permission);
        return result.isValid && result.hasPermission === true;
    }
}
