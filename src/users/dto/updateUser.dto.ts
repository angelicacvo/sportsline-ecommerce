import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './createUser.dto';
import { IsNotEmpty, IsString, IsEmail } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
    @IsString()
    @IsNotEmpty()
    username: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}
