import { PartialType } from '@nestjs/mapped-types';
import { CreateOrderItemDto } from './createOrderItem.dto';

export class UpdateOrderItemDto extends PartialType(CreateOrderItemDto) {}
