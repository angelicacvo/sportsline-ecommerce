import { setSeederFactory } from 'typeorm-extension';
import { OrderItem } from '../../order-items/entities/order-item.entity';

export const OrderItemFactory = setSeederFactory(OrderItem, (faker) => {
    const item = new OrderItem();
    item.quantity = faker.number.int({ min: 1, max: 10 });
    item.price = parseFloat(faker.commerce.price());
    // Las relaciones con Order y Product se manejarán en el seeder
    return item;
});
