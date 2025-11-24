import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleService } from './role.service';
import { Role } from './entities/role.entity';

/**
 * ROLE MODULE
 * 
 * Encapsula la funcionalidad de roles
 * Exports: RoleService para que otros módulos lo usen (ej: UserModule)
 */
@Module({
    imports: [TypeOrmModule.forFeature([Role])],
    providers: [RoleService],
    exports: [RoleService], // ← Exportamos para que UserModule pueda usarlo
})
export class RoleModule {}
