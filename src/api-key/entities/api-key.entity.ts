import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * API Key Entity - Week 6
 * TypeORM entity (Week 2 concepts)
 * Stores API keys for external service authentication
 * Each key has permissions array for granular access control
 */
@Entity('api_keys')
export class ApiKey {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 100 })
    name: string;

    @Column({ unique: true, length: 255 })
    key: string;

    @Column('simple-array', { default: '' })
    permissions: string[];

    @Column({ default: true })
    isActive: boolean;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'timestamp', nullable: true })
    expiresAt: Date;

    @Column({ type: 'timestamp', nullable: true })
    lastUsedAt: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
