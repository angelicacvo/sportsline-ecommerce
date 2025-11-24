import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, OneToMany, ManyToOne } from "typeorm";
import { Product } from "../../product/entities/product.entity";
import { Role } from "../../role/entities/role.entity";

/**
 * ENUM DEPRECADO - Mantenido solo para compatibilidad temporal
 * Los roles ahora vienen de la tabla 'roles'
 */
export enum UserRole {
    ADMIN = 'admin',
    CUSTOMER = 'customer',
    SELLER = 'seller'
} 

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    username: string;

    @Column()
    email: string;

    @Column()
    password: string;

    /**
     * RELACIÓN MANY TO ONE con Role
     * - Un usuario tiene UN rol
     * - Un rol puede estar en MUCHOS usuarios
     * - eager: true → Carga automáticamente el rol (con permisos) al consultar user
     */
    @ManyToOne(() => Role, role => role.users, { eager: true })
    role: Role;
    
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => Product, product => product.seller)
    products: Product[];
}
