import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './createProduct.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProductDto extends PartialType(CreateProductDto) {
    @ApiPropertyOptional({ example: 'Balón de fútbol', description: 'Nombre del producto' })
    title?: string;

    @ApiPropertyOptional({ example: 'Balón profesional para partidos oficiales', description: 'Descripción del producto' })
    description?: string;

    @ApiPropertyOptional({ example: 50, description: 'Cantidad en stock' })
    stock?: number;

    @ApiPropertyOptional({ example: '49900.00', description: 'Valor del producto en COP' })
    value?: string;

    @ApiPropertyOptional({ example: 1, description: 'ID de la categoría' })
    category_id?: number;
}
