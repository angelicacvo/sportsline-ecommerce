import { PartialType } from '@nestjs/swagger';
import { CreateApiKeyDto } from './create-api-key.dto';
import { IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Data Transfer Object for updating an existing API Key.
 * 
 * Extends CreateApiKeyDto with all fields optional, plus the ability to toggle isActive.
 * 
 * @example
 * ```json
 * {
 *   "name": "Updated Mobile App",
 *   "isActive": false,
 *   "permissions": ["read:products"]
 * }
 * ```
 */
export class UpdateApiKeyDto extends PartialType(CreateApiKeyDto) {
    @ApiProperty({
        description: 'Whether the API key is active',
        example: true,
        required: false
    })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
