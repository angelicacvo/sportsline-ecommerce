import { IsInt, IsNotEmpty, IsString } from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
    @ApiProperty({ example: 'Balones', description: 'Nombre de la categoría' })
    @IsString({ message: 'The name must be a string' })
    @IsNotEmpty({ message: 'The name is required' })
    name: string;

    @ApiPropertyOptional({ example: 'Categoría para balones deportivos', description: 'Descripción de la categoría' })
    @IsString({ message: 'The description must be a string' })
    description: string;

    @ApiProperty({ example: 1, description: 'ID del producto relacionado' })
    @Type(() => Number)
    @IsInt({ message: 'The product ID must be an integer' })
    @IsNotEmpty({ message: 'The product ID is required' })
    product: number;
}
