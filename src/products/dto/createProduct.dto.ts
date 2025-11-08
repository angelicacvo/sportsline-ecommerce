import { IsString, IsNumber, IsOptional, IsInt, Min, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsOptional()
    description: string;

    @IsNumber()
    @Min(0)
    @IsNotEmpty()
    stock: number;
    
    @IsString()
    @IsNotEmpty()
    value: string;

    @Type(() => Number)
    @IsInt()
    @IsNotEmpty()
    category_id: number;

}
