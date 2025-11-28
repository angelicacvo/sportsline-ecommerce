import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './createUser.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto extends PartialType(CreateUserDto) {
    @ApiPropertyOptional({ example: 'johndoe', description: 'Nombre de usuario' })
    username?: string;

    @ApiPropertyOptional({ example: 'johndoe@email.com', description: 'Correo electrónico' })
    email?: string;

    @ApiPropertyOptional({ example: 'password123', description: 'Contraseña del usuario' })
    password?: string;
}
