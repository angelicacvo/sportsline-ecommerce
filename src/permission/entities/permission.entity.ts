import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Role } from '../../role/entities/role.entity';

/**
 * ENTIDAD PERMISSION
 * 
 * Esta tabla almacena PERMISOS individuales.
 * Ejemplos: 'create:product', 'delete:user', 'read:orders'
 * 
 * RELACIÓN: ManyToMany con Role
 * - Un permiso puede pertenecer a muchos roles
 * - Un rol puede tener muchos permisos
 */
@Entity('permissions')
export class Permission {
    @PrimaryGeneratedColumn()
    id: number;

    /**
     * Nombre único del permiso
     * Ejemplos: 'create:product', 'update:user', 'delete:order'
     * Usamos formato "acción:recurso" para claridad
     */
    @Column({ unique: true })
    name: string;

    /**
     * Descripción legible del permiso
     * Ejemplo: 'Permite crear nuevos productos'
     */
    @Column({ nullable: true })
    description: string;

    /**
     * RELACIÓN INVERSA
     * Un permiso puede estar asociado a muchos roles
     * El decorador está en Role, aquí solo referenciamos
     */
    @ManyToMany(() => Role, role => role.permissions)
    roles: Role[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
