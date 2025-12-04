import { IsString, IsArray, IsBoolean, IsOptional, IsDate, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Data Transfer Object for creating a new API Key.
 * 
 * This DTO validates the input data when creating an API key through the API.
 * 
 * @example
 * ```json
 * {
 *   "name": "Mobile App",
 *   "key": "sk_prod_abc123xyz456",
 *   "permissions": ["read:products", "write:orders"],
 *   "description": "API key for mobile application",
 *   "expiresAt": "2026-12-31T23:59:59Z"
 * }
 * ```
 */
export class CreateApiKeyDto {
    @ApiProperty({
        description: 'Friendly name for the API key',
        example: 'Mobile App',
        minLength: 3,
        maxLength: 100
    })
    @IsString()
    @MinLength(3)
    @MaxLength(100)
    name: string;

    @ApiProperty({
        description: 'The actual API key value (preferably hashed)',
        example: 'sk_prod_abc123xyz456def789',
        minLength: 20
    })
    @IsString()
    @MinLength(20)
    key: string;

    @ApiProperty({
        description: 'Array of permission strings',
        example: ['read:products', 'write:orders', 'read:users'],
        type: [String],
        required: false
    })
    @IsArray()
    @IsOptional()
    permissions?: string[];

    @ApiProperty({
        description: 'Optional description of the API key purpose',
        example: 'API key for mobile application access',
        required: false
    })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({
        description: 'Optional expiration date for the API key',
        example: '2026-12-31T23:59:59Z',
        required: false
    })
    @IsDate()
    @IsOptional()
    expiresAt?: Date;
}
