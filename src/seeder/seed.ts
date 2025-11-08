import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsersService } from '../users/users.service';
import { OrdersService } from '../orders/orders.service';
import { ProductsService } from '../products/products.service';
import { CategoriesService } from '../categories/categories.service';
import { OrderItemsService } from '../orderItems/orderItems.service';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);

    const usersService = app.get(UsersService);
    const ordersService = app.get(OrdersService);
    const productsService = app.get(ProductsService);
    const categoriesService = app.get(CategoriesService);
    const orderItemsService = app.get(OrderItemsService);

    // Seed categories
        // Seed categories (idempotent)
        const categories = await categoriesService.findAll();
        let category = categories.find(c => c.name === 'Deportes');
        if (!category) {
            // Ajusta el payload si CreateCategoryDto requiere 'product'
            category = await categoriesService.create({
                name: 'Deportes',
                description: 'Artículos y equipos deportivos',
                product: 0,
            });
        }

    // Seed products
        // Seed products (idempotent)
        const products = await productsService.findAll();
        let product = products.find(p => p.title === 'Balón de fútbol');
        if (!product) {
            product = await productsService.create({
                title: 'Balón de fútbol',
                description: 'Balón profesional para partidos oficiales',
                stock: 50,
                value: '49900.00',
                category_id: Number(category.id),
            });
        }

    // Seed user
        // Seed user (idempotent)
        const users = await usersService.findAll();
        let user = users.find(u => u.email === 'admin@example.com');
        if (!user) {
            user = await usersService.create({
                username: 'admin',
                email: 'admin@example.com',
                password: 'admin123',
                role: 'admin',
            });
        }

    // Seed order
        // Seed order (idempotent by user and status)
        const orders = await ordersService.findAll();
        // Filtrar solo órdenes con user definido antes de acceder a user.id
        let order = orders.filter(o => o.user && o.user.id)
            .find(o => o.user.id === user.id && o.status === 'pending');
        if (!order) {
            order = await ordersService.create({
                status: 'pending',
                total: '49900.00',
                userId: user.id,
            });
        }

    // Seed order item
        // Seed order item (idempotent by order and product)
        const orderItems = await orderItemsService.findAll();
        let orderItem = orderItems
            .filter(oi => oi.order && oi.product && oi.order.id && oi.product.id)
            .find(oi => oi.order.id === order.id && oi.product.id === product.id);
        if (!orderItem) {
            await orderItemsService.create({
                quantity: 1,
                price: '49900.00',
                orderItemId: 1,
                productId: Number(product.id),
                orderId: Number(order.id),
            });
        }

    await app.close();
}

bootstrap();
