import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export enum UserRoleDto {
	ADMIN = 'admin',
	CUSTOMER = 'customer',
	SELLER = 'seller',
}

export class CreateUserDto {
	@IsNotEmpty({ message: 'Username is required' })
	@IsString({ message: 'Username must be a string' })
	@MinLength(3, { message: 'Username must have at least 3 characters' })
	username: string;

	@IsNotEmpty({ message: 'Email is required' })
	@IsEmail({}, { message: 'Must be a valid email' })
	email: string;

	@IsNotEmpty({ message: 'Password is required' })
	@IsString({ message: 'Password must be a string' })
	@MinLength(6, { message: 'Password must have at least 6 characters' })
	password: string;

	@IsOptional()
	@IsEnum(UserRoleDto, { message: 'Role must be admin, customer or seller' })
	role?: UserRoleDto;
}
