import { setSeederFactory } from 'typeorm-extension';
import { User } from '../../user/entities/user.entity';
import { Role } from '../../role/entities/role.entity';
import * as bcrypt from 'bcrypt';

/**
 * USER FACTORY
 * 
 * IMPORTANTE: Ahora los usuarios se vinculan a roles de BD
 * El seeder debe pasar el array de roles disponibles
 */
export const UserFactory = setSeederFactory(User, async (faker) => {
    const user = new User();
    user.username = faker.internet.userName();
    user.email = faker.internet.email();
    // Password hasheada para que funcione el login
    user.password = await bcrypt.hash('password123', 10);
    // El rol se asignará en el seeder desde BD
    return user;
});
