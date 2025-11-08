import { IsInt, IsNotEmpty, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderItemDto {
    @IsInt({ message: 'The quantity must be an integer' })
    @IsNotEmpty({ message: 'The quantity is required' })
    quantity: number;

    @IsString({ message: 'The price must be a string' })
    @IsNotEmpty({ message: 'The price is required' })
    price: string;

    @Type(() => Number)
    @IsInt({ message: 'The orderItem ID must be an integer' })
    @IsNotEmpty({ message: 'The orderItem ID is required' })
    orderItemId: number;

    @Type(() => Number)
    @IsInt({ message: 'The product ID must be an integer' })
    @IsNotEmpty({ message: 'The product ID is required' })
    productId: number;

    @Type(() => Number)
    @IsInt({ message: 'The order ID must be an integer' })
    @IsNotEmpty({ message: 'The order ID is required' })
    orderId: number;
}
