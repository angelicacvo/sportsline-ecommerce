import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { UsersService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@UseGuards(RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ⚠️ Ruta protegida para ADMIN: debe ir antes que las dinámicas
  @Get('admin')
  @Roles('admin')
  getAdminUsers() {
    console.log('✅ Entrando a /users/admin');
    return { message: 'Solo los administradores pueden ver esto' };
  }

  // 📦 Crear usuario
  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  // 📜 Obtener todos los usuarios
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // 🔍 Buscar usuario por ID
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  // 🛠️ Actualizar usuario
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  // 🗑️ Eliminar usuario
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}
