import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiKeyService } from './api-key.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { UpdateApiKeyDto } from './dto/update-api-key.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

/**
 * API Key Controller - Week 6
 * Standard REST controller (Week 3 pattern)
 * Protected by AuthGuard + RolesGuard (Week 5) - only admins can manage API keys
 * Swagger documented (Week 7 requirement)
 */
@ApiTags('API Keys')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles('admin')
@Controller('api-keys')
export class ApiKeyController {
    constructor(private readonly apiKeyService: ApiKeyService) {}

    @ApiOperation({
        summary: 'Create a new API key',
        description: 'Creates a new API key with specified permissions. Only accessible by admins.'
    })
    @ApiResponse({
        status: 201,
        description: 'API key created successfully',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
                name: { type: 'string', example: 'Mobile App' },
                key: { type: 'string', example: 'sk_prod_abc123xyz456' },
                permissions: { type: 'array', items: { type: 'string' }, example: ['read:products', 'write:orders'] },
                isActive: { type: 'boolean', example: true },
                createdAt: { type: 'string', example: '2025-12-04T10:30:00Z' }
            }
        }
    })
    @ApiResponse({ status: 409, description: 'API key already exists' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
    @Post()
    create(@Body() createApiKeyDto: CreateApiKeyDto) {
        return this.apiKeyService.create(createApiKeyDto);
    }

    @ApiOperation({
        summary: 'Get all API keys',
        description: 'Retrieves a list of all API keys in the system. Only accessible by admins.'
    })
    @ApiResponse({
        status: 200,
        description: 'List of API keys retrieved successfully',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    key: { type: 'string' },
                    permissions: { type: 'array', items: { type: 'string' } },
                    isActive: { type: 'boolean' },
                    lastUsedAt: { type: 'string' },
                    createdAt: { type: 'string' }
                }
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
    @Get()
    findAll() {
        return this.apiKeyService.findAll();
    }

    @ApiOperation({
        summary: 'Get an API key by ID',
        description: 'Retrieves details of a specific API key. Only accessible by admins.'
    })
    @ApiParam({
        name: 'id',
        description: 'UUID of the API key',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @ApiResponse({
        status: 200,
        description: 'API key found',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                key: { type: 'string' },
                permissions: { type: 'array', items: { type: 'string' } },
                isActive: { type: 'boolean' },
                description: { type: 'string' },
                expiresAt: { type: 'string' },
                lastUsedAt: { type: 'string' },
                createdAt: { type: 'string' }
            }
        }
    })
    @ApiResponse({ status: 404, description: 'API key not found' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.apiKeyService.findOne(id);
    }

    @ApiOperation({
        summary: 'Update an API key',
        description: 'Updates an existing API key. Can modify permissions, active status, and other fields. Only accessible by admins.'
    })
    @ApiParam({
        name: 'id',
        description: 'UUID of the API key to update',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @ApiResponse({
        status: 200,
        description: 'API key updated successfully',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                permissions: { type: 'array', items: { type: 'string' } },
                isActive: { type: 'boolean' },
                updatedAt: { type: 'string' }
            }
        }
    })
    @ApiResponse({ status: 404, description: 'API key not found' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateApiKeyDto: UpdateApiKeyDto) {
        return this.apiKeyService.update(id, updateApiKeyDto);
    }

    @ApiOperation({
        summary: 'Delete an API key',
        description: 'Permanently deletes an API key from the system. Only accessible by admins.'
    })
    @ApiParam({
        name: 'id',
        description: 'UUID of the API key to delete',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @ApiResponse({ status: 204, description: 'API key deleted successfully' })
    @ApiResponse({ status: 404, description: 'API key not found' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.apiKeyService.remove(id);
    }
}
