import { AppDataSource } from '../data-source';
import { User } from '../users/user.entity';
import { Product } from '../products/product.entity';

async function seed() {
  await AppDataSource.initialize();

  const userRepo = AppDataSource.getRepository(User);
  const productRepo = AppDataSource.getRepository(Product);

  const user = userRepo.create({ name: 'Admin', email: 'admin@shop.com', password: '1234' });
 const product = productRepo.create({ name: 'Laptop', price: 1200 });


  await userRepo.save(user);
  await productRepo.save(product);

  console.log('Seed completed ✅');
  await AppDataSource.destroy();
}

seed();
