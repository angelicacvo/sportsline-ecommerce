import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';

/**
 * ROLE SERVICE
 * 
 * Gestiona operaciones CRUD sobre roles
 * Métodos principales:
 * - findByName(): Buscar rol por nombre (ej: 'admin')
 * - findAll(): Listar todos los roles
 */
@Injectable()
export class RoleService {
    constructor(
        @InjectRepository(Role)
        private readonly roleRepo: Repository<Role>,
    ) {}

    /**
     * Buscar un rol por su nombre
     * IMPORTANTE: Este método es usado por UserService al crear usuarios
     * @param name - Nombre del rol (ej: 'admin', 'customer')
     * @returns Role con sus permisos cargados (eager: true)
     */
    async findByName(name: string): Promise<Role | null> {
        return this.roleRepo.findOne({ 
            where: { name },
            relations: ['permissions'] // Carga los permisos del rol
        });
    }

    /**
     * Obtener todos los roles
     * @returns Array de roles con sus permisos
     */
    async findAll(): Promise<Role[]> {
        return this.roleRepo.find({ relations: ['permissions'] });
    }

    /**
     * Obtener un rol por ID
     * @param id - ID del rol
     */
    async findOne(id: number): Promise<Role> {
        const role = await this.roleRepo.findOne({ 
            where: { id },
            relations: ['permissions'] 
        });
        if (!role) throw new NotFoundException('Role not found');
        return role;
    }
}
