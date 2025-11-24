import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for creating a new user
 * CAMBIO: Ya no usamos enum, usamos strings que se validan contra BD
 */
export class CreateUserDto {
	@ApiProperty({
		description: 'Username for the account',
		example: 'johndoe',
		minLength: 3,
		type: String,
	})
	@IsNotEmpty({ message: 'Username is required' })
	@IsString({ message: 'Username must be a string' })
	@MinLength(3, { message: 'Username must have at least 3 characters' })
	username: string;

	@ApiProperty({
		description: 'User email address',
		example: 'john.doe@example.com',
		format: 'email',
	})
	@IsNotEmpty({ message: 'Email is required' })
	@IsEmail({}, { message: 'Must be a valid email' })
	email: string;

	@ApiProperty({
		description: 'User password (will be hashed)',
		example: 'SecurePass123!',
		minLength: 6,
		format: 'password',
	})
	@IsNotEmpty({ message: 'Password is required' })
	@IsString({ message: 'Password must be a string' })
	@MinLength(6, { message: 'Password must have at least 6 characters' })
	password: string;

	@ApiProperty({ 
		description: 'User role in the system',
		enum: ['admin', 'customer', 'seller'],
		default: 'customer',
		example: 'customer',
		required: false,
	})
	@IsOptional()
	@IsIn(['admin', 'customer', 'seller'], { message: 'Role must be admin, customer or seller' })
	role?: string;
}
