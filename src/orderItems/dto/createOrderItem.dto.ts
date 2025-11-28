import { IsInt, IsNotEmpty, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderItemDto {
    @ApiProperty({ example: 2, description: 'Cantidad de productos en el item de la orden' })
    @IsInt({ message: 'The quantity must be an integer' })
    @IsNotEmpty({ message: 'The quantity is required' })
    quantity: number;

    @ApiProperty({ example: '99000.00', description: 'Precio del producto en este item' })
    @IsString({ message: 'The price must be a string' })
    @IsNotEmpty({ message: 'The price is required' })
    price: string;

    @ApiProperty({ example: 1, description: 'ID del item de la orden' })
    @Type(() => Number)
    @IsInt({ message: 'The orderItem ID must be an integer' })
    @IsNotEmpty({ message: 'The orderItem ID is required' })
    orderItemId: number;

    @ApiProperty({ example: 1, description: 'ID del producto' })
    @Type(() => Number)
    @IsInt({ message: 'The product ID must be an integer' })
    @IsNotEmpty({ message: 'The product ID is required' })
    productId: number;

    @ApiProperty({ example: 1, description: 'ID de la orden' })
    @Type(() => Number)
    @IsInt({ message: 'The order ID must be an integer' })
    @IsNotEmpty({ message: 'The order ID is required' })
    orderId: number;
}
