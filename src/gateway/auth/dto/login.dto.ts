import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'User email address',
    example: 'admin@sportsline.com',
    examples: {
      admin: {
        value: 'admin@sportsline.com',
        summary: 'Admin user',
      },
      user: {
        value: 'user@sportsline.com',
        summary: 'Regular user',
      },
    },
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'admin123',
    minLength: 6,
    examples: {
      admin: {
        value: 'admin123',
        summary: 'Admin password',
      },
      user: {
        value: 'user123',
        summary: 'User password',
      },
    },
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
