import { Product } from "../../products/entities/product.entity";
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  // relations
  @OneToMany(() => Product, product => product.category)
  products: Product[];
}
