import { IsString, IsNumber, IsOptional, IsInt, Min, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
    @ApiProperty({ example: 'Balón de fútbol', description: 'Nombre del producto' })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiPropertyOptional({ example: 'Balón profesional para partidos oficiales', description: 'Descripción del producto' })
    @IsString()
    @IsOptional()
    description: string;

    @ApiProperty({ example: 50, description: 'Cantidad en stock' })
    @IsNumber()
    @Min(0)
    @IsNotEmpty()
    stock: number;
    
    @ApiProperty({ example: '49900.00', description: 'Valor del producto en COP' })
    @IsString()
    @IsNotEmpty()
    value: string;

    @ApiProperty({ example: 1, description: 'ID de la categoría' })
    @Type(() => Number)
    @IsInt()
    @IsNotEmpty()
    categoryId: number;

}
