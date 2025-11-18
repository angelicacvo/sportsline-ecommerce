import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { Product } from '../../product/entities/product.entity';
import { User } from '../../user/entities/user.entity';

export default class ProductSeeder implements Seeder {
    public async run(
        dataSource: DataSource,
        factoryManager: SeederFactoryManager
    ): Promise<void> {
        await dataSource.query('TRUNCATE TABLE "products" RESTART IDENTITY CASCADE;');

        const productFactory = await factoryManager.get(Product);
        const userRepository = dataSource.getRepository(User);
        const users = await userRepository.find();

        if (users.length > 0) {
            await productFactory.saveMany(20, {
                seller: users[Math.floor(Math.random() * users.length)],
            });
        } else {
            await productFactory.saveMany(20);
        }
    }
}
