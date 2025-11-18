import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum UserRoleDto {
	ADMIN = 'admin',
	CUSTOMER = 'customer',
	SELLER = 'seller',
}

/**
 * DTO for creating a new user
 * Uses class-validator for validation and Swagger decorators for documentation
 */
export class CreateUserDto {
	// @ApiProperty() tells Swagger about this field
	@ApiProperty({
		description: 'Username for the account',  // Field description
		example: 'johndoe',                       // Example value shown in Swagger UI
		minLength: 3,                             // Minimum length constraint
		type: String,                             // Data type
	})
	@IsNotEmpty({ message: 'Username is required' })
	@IsString({ message: 'Username must be a string' })
	@MinLength(3, { message: 'Username must have at least 3 characters' })
	username: string;

	@ApiProperty({
		description: 'User email address',
		example: 'john.doe@example.com',
		format: 'email',  // Special format hint for Swagger
	})
	@IsNotEmpty({ message: 'Email is required' })
	@IsEmail({}, { message: 'Must be a valid email' })
	email: string;

	@ApiProperty({
		description: 'User password (will be hashed)',
		example: 'SecurePass123!',
		minLength: 6,
		format: 'password',  // Hides input in Swagger UI
	})
	@IsNotEmpty({ message: 'Password is required' })
	@IsString({ message: 'Password must be a string' })
	@MinLength(6, { message: 'Password must have at least 6 characters' })
	password: string;

	@ApiProperty({ 
		description: 'User role in the system',
		enum: UserRoleDto,     // Shows dropdown with enum values
		default: UserRoleDto.CUSTOMER,  // Default value
		example: UserRoleDto.CUSTOMER,
		required: false,       // Optional field
	})
	@IsOptional()
	@IsEnum(UserRoleDto, { message: 'Role must be admin, customer or seller' })
	role?: UserRoleDto;
}
