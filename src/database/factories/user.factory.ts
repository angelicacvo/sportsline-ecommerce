import { setSeederFactory } from 'typeorm-extension';
import { User } from '../../user/entities/user.entity';

enum UserRole {
    ADMIN = 'admin',
    CUSTOMER = 'customer',
    SELLER = 'seller'
}

export const UserFactory = setSeederFactory(User, (faker) => {
    const user = new User();
    user.username = faker.internet.userName();
    user.email = faker.internet.email();
    user.password = faker.internet.password();
    user.role = faker.helpers.arrayElement([UserRole.ADMIN, UserRole.CUSTOMER, UserRole.SELLER]);
    return user;
});
