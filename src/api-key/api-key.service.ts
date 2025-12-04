import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiKey } from './entities/api-key.entity';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { UpdateApiKeyDto } from './dto/update-api-key.dto';

/**
 * Service for managing API Keys and their permissions.
 * 
 * Provides methods to:
 * - Create, read, update, and delete API keys
 * - Validate API keys against the database
 * - Check permissions for a given API key
 * - Track API key usage
 * 
 * @example
 * ```typescript
 * const apiKey = await apiKeyService.create({
 *   name: 'Mobile App',
 *   key: 'sk_prod_abc123',
 *   permissions: ['read:products']
 * });
 * 
 * const isValid = await apiKeyService.validateKey('sk_prod_abc123', 'read:products');
 * ```
 */
@Injectable()
export class ApiKeyService {
    constructor(
        @InjectRepository(ApiKey)
        private readonly apiKeyRepository: Repository<ApiKey>,
    ) {}

    /**
     * Creates a new API key in the database.
     * 
     * @param createApiKeyDto - Data for creating the API key
     * @returns The created API key
     * @throws ConflictException if the key already exists
     */
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

    /**
     * Retrieves all API keys from the database.
     * 
     * @returns Array of all API keys
     */
    async findAll(): Promise<ApiKey[]> {
        return await this.apiKeyRepository.find({
            order: { createdAt: 'DESC' }
        });
    }

    /**
     * Finds an API key by its ID.
     * 
     * @param id - UUID of the API key
     * @returns The found API key
     * @throws NotFoundException if the key doesn't exist
     */
    async findOne(id: string): Promise<ApiKey> {
        const apiKey = await this.apiKeyRepository.findOne({ where: { id } });
        
        if (!apiKey) {
            throw new NotFoundException(`API key with ID ${id} not found`);
        }
        
        return apiKey;
    }

    /**
     * Finds an API key by its key value.
     * 
     * @param key - The API key string
     * @returns The found API key or null
     */
    async findByKey(key: string): Promise<ApiKey | null> {
        return await this.apiKeyRepository.findOne({
            where: { key, isActive: true }
        });
    }

    /**
     * Updates an existing API key.
     * 
     * @param id - UUID of the API key to update
     * @param updateApiKeyDto - Data to update
     * @returns The updated API key
     * @throws NotFoundException if the key doesn't exist
     */
    async update(id: string, updateApiKeyDto: UpdateApiKeyDto): Promise<ApiKey> {
        const apiKey = await this.findOne(id);
        
        Object.assign(apiKey, updateApiKeyDto);
        
        return await this.apiKeyRepository.save(apiKey);
    }

    /**
     * Deletes an API key from the database.
     * 
     * @param id - UUID of the API key to delete
     * @throws NotFoundException if the key doesn't exist
     */
    async remove(id: string): Promise<void> {
        const apiKey = await this.findOne(id);
        await this.apiKeyRepository.remove(apiKey);
    }

    /**
     * Validates an API key and checks if it has a specific permission.
     * 
     * @param key - The API key to validate
     * @param requiredPermission - Optional permission to check
     * @returns Object with validation result and API key details
     * 
     * @example
     * ```typescript
     * const result = await validateKey('sk_prod_abc', 'read:products');
     * if (result.isValid) {
     *   // Allow access
     * }
     * ```
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

        // Check if key is expired
        if (apiKey.expiresAt && new Date() > apiKey.expiresAt) {
            return { isValid: false };
        }

        // Update last used timestamp
        apiKey.lastUsedAt = new Date();
        await this.apiKeyRepository.save(apiKey);

        // If no specific permission required, just validate the key exists
        if (!requiredPermission) {
            return { isValid: true, apiKey };
        }

        // Check if the API key has the required permission
        const hasPermission = apiKey.permissions.includes(requiredPermission) ||
                            apiKey.permissions.includes('*'); // Wildcard permission

        return {
            isValid: true,
            apiKey,
            hasPermission
        };
    }

    /**
     * Checks if an API key has a specific permission.
     * 
     * @param key - The API key to check
     * @param permission - The permission to verify
     * @returns True if the key has the permission, false otherwise
     */
    async hasPermission(key: string, permission: string): Promise<boolean> {
        const result = await this.validateKey(key, permission);
        return result.isValid && result.hasPermission === true;
    }
}
