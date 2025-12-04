import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { RoleService } from '../role/role.service';
import * as bcrypt from 'bcrypt';

/**
 * USER SERVICE
 * 
 * CAMBIO IMPORTANTE:
 * Ahora inyecta RoleService para buscar roles desde BD
 */
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly roleService: RoleService,  // ← Nuevo: inyectamos RoleService
  ) {}

  async create(createUserDto: CreateUserDto) {
    const existing = await this.userRepo.findOne({ where: { email: createUserDto.email } });
    if (existing) throw new BadRequestException('Email already in use');
    
    // Buscar el rol desde BD (por defecto 'customer')
    const roleName = createUserDto.role || 'customer';
    const role = await this.roleService.findByName(roleName);
    if (!role) throw new BadRequestException(`Role '${roleName}' not found`);
    
    const user = this.userRepo.create({
      username: createUserDto.username,
      email: createUserDto.email,
      password: await bcrypt.hash(createUserDto.password, 10),
      role: role,  // ← Asignamos el objeto Role de BD
    });
    
    return this.userRepo.save(user);
  }

  async findByEmail(email: string) {
    return this.userRepo.findOne({ 
      where: { email },
      relations: ['role', 'role.permissions']  // ← Cargar rol con permisos
    });
  }

  async findAll() {
    return this.userRepo.find({ relations: ['role'] });
  }

  async findOne(id: number) {
    const user = await this.userRepo.findOne({ 
      where: { id },
      relations: ['role', 'role.permissions']
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.userRepo.findOne({ where: { id }, relations: ['role'] });
    if (!user) throw new NotFoundException('User not found');
    
    if (updateUserDto['email']) {
      const existing = await this.userRepo.findOne({ where: { email: updateUserDto['email'] } });
      if (existing && existing.id !== id) {
        throw new BadRequestException('Email already in use');
      }
    }
    
    // Si se actualiza el rol, buscarlo en BD
    if (updateUserDto['role']) {
      const roleName = updateUserDto['role'] as string;
      const role = await this.roleService.findByName(roleName);
      if (!role) throw new BadRequestException(`Role '${roleName}' not found`);
      user.role = role;
      delete (updateUserDto as any)['role'];
    }
    
    Object.assign(user, updateUserDto);
    return this.userRepo.save(user);
  }

  async remove(id: number) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    await this.userRepo.remove(user);
    return { message: 'User removed successfully' };
  }

  /**
   * GOOGLE OAUTH METHODS
   */
  
  async createGoogleUser(googleData: { email: string; username: string; googleId: string; provider: string }) {
    // Get default customer role
    const customerRole = await this.roleService.findByName('customer');
    if (!customerRole) throw new BadRequestException('Customer role not found');

    const user = this.userRepo.create({
      ...googleData,
      password: null,  // No password for OAuth users
      role: customerRole,
    });

    return this.userRepo.save(user);
  }

  async updateGoogleId(userId: number, googleId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    
    user.googleId = googleId;
    user.provider = 'google';
    
    return this.userRepo.save(user);
  }
}
