import { IsNotEmpty, IsString, IsEmail, MinLength, MaxLength } from 'class-validator';

export class CreateClientDto {
    @IsNotEmpty({ message: 'Full name is required' })
    @IsString({ message: 'Full name must be a string' })
    @MinLength(2, { message: 'Full name must have at least 2 characters' })
    name: string;

    @IsNotEmpty({ message: 'Email is required' })
    @IsEmail({}, { message: 'Must be a valid email' })
    @MinLength(5, { message: 'Email must have at least 5 characters' })
    email: string;

    @IsNotEmpty({ message: 'Phone number is required' })
    @IsString({ message: 'Phone number must be a string' })
    @MinLength(10, { message: 'Phone number must have at least 10 characters' })
    phone: string;

    @IsNotEmpty({ message: 'Address is required' })
    @IsString({ message: 'Address must be a string' })
    @MinLength(5, { message: 'Address must have at least 5 characters' })
    @MaxLength(255, { message: 'Address must have at most 255 characters' })
    address: string;
}
