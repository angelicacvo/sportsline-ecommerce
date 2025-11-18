import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { Client } from '../../client/entities/client.entity';

export default class ClientSeeder implements Seeder {
    public async run(
        dataSource: DataSource,
        factoryManager: SeederFactoryManager
    ): Promise<void> {
    await dataSource.query('TRUNCATE TABLE "clients" RESTART IDENTITY CASCADE;');

        const clientFactory = await factoryManager.get(Client);
        await clientFactory.saveMany(5);
    }
}