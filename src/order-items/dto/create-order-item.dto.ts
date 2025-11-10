import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive } from 'class-validator';

export class CreateOrderItemDto {
	@IsNotEmpty({ message: 'Order id is required' })
	@IsInt({ message: 'orderId must be an integer' })
	orderId: number;
	@IsNotEmpty({ message: 'Product id is required' })
	@IsInt({ message: 'productId must be an integer' })
	productId: number;

	@IsNotEmpty({ message: 'Quantity is required' })
	@IsInt({ message: 'Quantity must be an integer' })
	@IsPositive({ message: 'Quantity must be > 0' })
	quantity: number;

	// Optional override; usually derived from product price
	@IsOptional()
	@IsNumber({}, { message: 'Price must be a number' })
	@IsPositive({ message: 'Price must be positive' })
	price?: number;
}
