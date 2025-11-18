import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Buscar por ID
  async findOne(id: number) {
    return this.userRepository.findOne({ where: { id } });
  }

  // Buscar por email (NECESARIO para AuthService)
  async findByEmail(email: string) {
    return this.userRepository.findOne({ where: { email } });
  }

  // Crear usuario
async create(data: any) {
  const user = this.userRepository.create(data);
  return this.userRepository.save(user); // <-- devuelve un ÚNICO usuario
}


  // Obtener todos
  async findAll() {
    return this.userRepository.find();
  }

  // Actualizar
  async update(id: number, data: any) {
    await this.userRepository.update(id, data);
    return this.findOne(id);
  }

  // Eliminar
  async remove(id: number) {
    return this.userRepository.delete(id);
  }
}
