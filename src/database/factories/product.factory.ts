import { setSeederFactory } from 'typeorm-extension';
import { Product } from '../../product/entities/product.entity';

export const ProductFactory = setSeederFactory(Product, (faker) => {
    const product = new Product();
    product.code = faker.string.alphanumeric(10);
    product.name = faker.commerce.productName();
    product.description = faker.commerce.productDescription();
    product.price = parseFloat(faker.commerce.price());
    product.stock = faker.number.int({ min: 0, max: 100 });
    // La relación con User (seller) se manejará en el seeder
    return product;
});
