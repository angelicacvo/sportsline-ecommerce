import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Permission } from '../../permission/entities/permission.entity';
import { User } from '../../user/entities/user.entity';

/**
 * ENTIDAD ROLE
 * 
 * Esta tabla almacena los ROLES del sistema.
 * Ejemplos: 'admin', 'customer', 'seller'
 * 
 * RELACIONES:
 * - ManyToMany con Permission (un rol tiene muchos permisos)
 * - OneToMany con User (un rol puede tener muchos usuarios)
 */
@Entity('roles')
export class Role {
    @PrimaryGeneratedColumn()
    id: number;

    /**
     * Nombre único del rol
     * Ejemplos: 'admin', 'customer', 'seller'
     */
    @Column({ unique: true })
    name: string;

    /**
     * Descripción del rol
     * Ejemplo: 'Administrador con acceso total'
     */
    @Column({ nullable: true })
    description: string;

    /**
     * RELACIÓN MANY TO MANY con Permission
     * @JoinTable() indica que esta entidad es la "dueña" de la relación
     * TypeORM creará una tabla intermedia: role_permissions
     */
    @ManyToMany(() => Permission, permission => permission.roles, { eager: true })
    @JoinTable({
        name: 'role_permissions',           // Nombre de tabla intermedia
        joinColumn: { name: 'role_id' },    // Columna que apunta a Role
        inverseJoinColumn: { name: 'permission_id' } // Columna que apunta a Permission
    })
    permissions: Permission[];

    /**
     * RELACIÓN ONE TO MANY con User
     * Un rol puede tener muchos usuarios
     */
    @OneToMany(() => User, user => user.role)
    users: User[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
