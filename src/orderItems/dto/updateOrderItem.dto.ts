import { PartialType } from '@nestjs/mapped-types';
import { CreateOrderItemDto } from './createOrderItem.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateOrderItemDto extends PartialType(CreateOrderItemDto) {
	@ApiPropertyOptional({ example: 2, description: 'Cantidad de productos en el item de la orden' })
	quantity?: number;

	@ApiPropertyOptional({ example: '99000.00', description: 'Precio del producto en este item' })
	price?: string;

	@ApiPropertyOptional({ example: 1, description: 'ID del item de la orden' })
	orderItemId?: number;

	@ApiPropertyOptional({ example: 1, description: 'ID del producto' })
	productId?: number;

	@ApiPropertyOptional({ example: 1, description: 'ID de la orden' })
	orderId?: number;
}
