import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
	@ApiProperty({
		description: 'Unique product code/SKU',
		example: 'NIKE-AIR-001',
		minLength: 2,
		maxLength: 50,
	})
	@IsNotEmpty({ message: 'Code is required' })
	@IsString({ message: 'Code must be a string' })
	@MinLength(2)
	@MaxLength(50)
	code: string; 

	@ApiProperty({
		description: 'Product name',
		example: 'Nike Air Max 2024',
		minLength: 2,
		maxLength: 150,
	})
	@IsNotEmpty({ message: 'Name is required' })
	@IsString({ message: 'Name must be a string' })
	@MinLength(2)
	@MaxLength(150)
	name: string;

	@ApiProperty({
		description: 'Detailed product description',
		example: 'High-performance running shoes with advanced cushioning technology',
		minLength: 5,
		maxLength: 500,
	})
	@IsNotEmpty({ message: 'Description is required' })
	@IsString({ message: 'Description must be a string' })
	@MinLength(5)
	@MaxLength(500)
	description: string;

	@ApiProperty({
		description: 'Product price in USD',
		example: 129.99,
		minimum: 0.01,
		type: Number,
	})
	@IsNotEmpty({ message: 'Price is required' })
	@IsNumber({}, { message: 'Price must be a number' })
	@IsPositive({ message: 'Price must be positive' })
	price: number;

	@ApiProperty({
		description: 'Available stock quantity',
		example: 50,
		minimum: 0,
		type: Number,
	})
	@IsNotEmpty({ message: 'Stock is required' })
	@IsInt({ message: 'Stock must be an integer' })
	stock: number;

	@ApiProperty({
		description: 'ID of the seller (optional)',
		example: 1,
		required: false,
		type: Number,
	})
	@IsOptional()
	@IsInt({ message: 'userId must be an integer' })
	userId?: number;
}