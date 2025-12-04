import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * Entity representing an API Key with associated permissions.
 * 
 * API Keys are used for service-to-service authentication and authorization.
 * Each key can have specific permissions and can be enabled/disabled.
 * 
 * @example
 * ```typescript
 * const apiKey = new ApiKey();
 * apiKey.name = 'External Service';
 * apiKey.key = 'sk_prod_abc123...';
 * apiKey.permissions = ['read:products', 'write:orders'];
 * apiKey.isActive = true;
 * ```
 */
@Entity('api_keys')
export class ApiKey {
    /**
     * Unique identifier for the API key
     */
    @PrimaryGeneratedColumn('uuid')
    id: string;

    /**
     * Friendly name for the API key (e.g., "Mobile App", "Partner Service")
     */
    @Column({ length: 100 })
    name: string;

    /**
     * The actual API key value (should be hashed in production)
     * Format: sk_prod_xxxxxxxxxxxxx or similar
     */
    @Column({ unique: true, length: 255 })
    key: string;

    /**
     * Array of permission strings defining what this API key can access
     * @example ['read:products', 'write:orders', 'admin:users']
     */
    @Column('simple-array', { default: '' })
    permissions: string[];

    /**
     * Whether this API key is currently active and can be used
     */
    @Column({ default: true })
    isActive: boolean;

    /**
     * Optional description of the API key's purpose
     */
    @Column({ type: 'text', nullable: true })
    description: string;

    /**
     * Optional expiration date for the API key
     */
    @Column({ type: 'timestamp', nullable: true })
    expiresAt: Date;

    /**
     * Last time this API key was used
     */
    @Column({ type: 'timestamp', nullable: true })
    lastUsedAt: Date;

    /**
     * Creation timestamp
     */
    @CreateDateColumn()
    createdAt: Date;

    /**
     * Last update timestamp
     */
    @UpdateDateColumn()
    updatedAt: Date;
}
