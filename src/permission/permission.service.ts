import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';

/**
 * PERMISSION SERVICE
 * 
 * Gestiona operaciones CRUD sobre permisos
 */
@Injectable()
export class PermissionService {
    constructor(
        @InjectRepository(Permission)
        private readonly permissionRepo: Repository<Permission>,
    ) {}

    /**
     * Obtener todos los permisos
     */
    async findAll(): Promise<Permission[]> {
        return this.permissionRepo.find();
    }

    /**
     * Buscar permiso por nombre
     * @param name - Nombre del permiso (ej: 'create:product')
     */
    async findByName(name: string): Promise<Permission | null> {
        return this.permissionRepo.findOne({ where: { name } });
    }
}
