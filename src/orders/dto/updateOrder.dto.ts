import { PartialType } from '@nestjs/mapped-types';
import { CreateOrderDto } from './createOrder.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
    @ApiPropertyOptional({ example: '1', description: 'ID del usuario que realiza la orden' })
    userId?: string;

    @ApiPropertyOptional({ example: 2, description: 'Cantidad de productos en la orden' })
    quantity?: number;

    @ApiPropertyOptional({ example: 99000, description: 'Precio total de la orden' })
    totalPrice?: number;
}
