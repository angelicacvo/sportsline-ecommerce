import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateProductDto {
	@IsNotEmpty({ message: 'Code is required' })
	@IsString({ message: 'Code must be a string' })
	@MinLength(2)
	@MaxLength(50)
	code: string;

	@IsNotEmpty({ message: 'Name is required' })
	@IsString({ message: 'Name must be a string' })
	@MinLength(2)
	@MaxLength(150)
	name: string;

	@IsNotEmpty({ message: 'Description is required' })
	@IsString({ message: 'Description must be a string' })
	@MinLength(5)
	@MaxLength(500)
	description: string;

	@IsNotEmpty({ message: 'Price is required' })
	@IsNumber({}, { message: 'Price must be a number' })
	@IsPositive({ message: 'Price must be positive' })
	price: number;

  @IsNotEmpty({ message: 'Stock is required' })
  @IsInt({ message: 'Stock must be an integer' })
  stock: number;

  @IsOptional()
  @IsInt({ message: 'userId must be an integer' })
  userId?: number;
}