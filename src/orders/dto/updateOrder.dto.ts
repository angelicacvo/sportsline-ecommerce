import { PartialType } from '@nestjs/mapped-types';
import { CreateOrderDto } from './createOrder.dto';
import { IsNumber, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer'

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
    @IsString()
    userId: string;
    
    @IsNumber()
    @Min(0)
    quantity: number;
    
    @Type(() => Number) 
    @IsNumber()
    @Min(0)
    totalPrice: number;

}
