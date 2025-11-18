import { setSeederFactory } from 'typeorm-extension';
import { Client } from '../../client/entities/client.entity';

export const ClientFactory = setSeederFactory(Client, (faker) => {
    const client = new Client();
    client.name = faker.company.name();
    client.email = faker.internet.email();
    client.phone = faker.phone.number();
    client.address = faker.location.streetAddress();
    return client;
});