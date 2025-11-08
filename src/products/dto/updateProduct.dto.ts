import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './createProduct.dto';
import { IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdateProductDto extends PartialType(CreateProductDto) {
    // it could be redundant if PartialType already covers these fields,
    // but adding them here for explicitness and validation purposes
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsNumber()
    price?: number;
}
