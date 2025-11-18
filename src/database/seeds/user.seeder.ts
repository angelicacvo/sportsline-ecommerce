import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { User } from '../../user/entities/user.entity';

export default class UserSeeder implements Seeder {
    public async run(
        dataSource: DataSource,
        factoryManager: SeederFactoryManager
    ): Promise<void> {
        await dataSource.query('TRUNCATE TABLE "users" RESTART IDENTITY CASCADE;');

        const userFactory = await factoryManager.get(User);
        await userFactory.saveMany(10);
    }
}
