import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, MinLength, ValidateNested, ArrayMinSize, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateOrderItemDto } from '../../order-items/dto/create-order-item.dto';

export enum OrderStatusDto {
    PENDING = 'pending',
    DELIVERED = 'delivered',
    CANCELLED = 'cancelled',
}

export class CreateOrderDto {
    @IsNotEmpty({ message: 'clientId is required' })
    @IsInt({ message: 'clientId must be an integer' })
    clientId: number;

    @IsOptional()
    @IsEnum(OrderStatusDto, { message: 'Status must be pending, completed or cancelled' })
    status?: OrderStatusDto;

    @IsArray({ message: 'Items must be an array' })
    @ArrayMinSize(1, { message: 'At least one item is required' })
    @ValidateNested({ each: true })
    @Type(() => CreateOrderItemDto)
    items: CreateOrderItemDto[];
}
