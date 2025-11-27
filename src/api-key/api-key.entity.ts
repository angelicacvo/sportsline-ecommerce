import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('api_keys')
export class ApiKey {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  key: string;

  @Column()
  owner: string;

  @Column('simple-array')
  scopes: string[];

  @Column({ default: true })
  enabled: boolean;
}
