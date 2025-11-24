import { IsNotEmpty, IsString, IsEmail, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateClientDto {
    @ApiProperty({
        description: 'Client full name',
        example: 'Maria Garcia',
        minLength: 2,
    })
    @IsNotEmpty({ message: 'Full name is required' })
    @IsString({ message: 'Full name must be a string' })
    @MinLength(2, { message: 'Full name must have at least 2 characters' })
    name: string; 

    @ApiProperty({
        description: 'Client email address',
        example: 'maria.garcia@example.com',
        format: 'email',
    })
    @IsNotEmpty({ message: 'Email is required' })
    @IsEmail({}, { message: 'Must be a valid email' })
    @MinLength(5, { message: 'Email must have at least 5 characters' })
    email: string;

    @ApiProperty({
        description: 'Client phone number',
        example: '+1-555-0123',
        minLength: 10,
    })
    @IsNotEmpty({ message: 'Phone number is required' })
    @IsString({ message: 'Phone number must be a string' })
    @MinLength(10, { message: 'Phone number must have at least 10 characters' })
    phone: string;

    @ApiProperty({
        description: 'Client shipping address',
        example: '123 Main St, New York, NY 10001',
        minLength: 5,
        maxLength: 255,
    })
    @IsNotEmpty({ message: 'Address is required' })
    @IsString({ message: 'Address must be a string' })
    @MinLength(5, { message: 'Address must have at least 5 characters' })
    @MaxLength(255, { message: 'Address must have at most 255 characters' })
    address: string;
}
