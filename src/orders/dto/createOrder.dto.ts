import { Type } from 'class-transformer';
import { 
  IsString, 
  IsOptional, 
  IsNumberString,
  IsNotEmpty
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiPropertyOptional({ example: 'pending', description: 'Estado de la orden' })
  @IsOptional()
  @IsString()
  status: string;

  @ApiProperty({ example: '49900.00', description: 'Total de la orden en COP' })
  @IsNumberString()
  @IsNotEmpty()
  total: string;

  @ApiProperty({ example: '1', description: 'ID del usuario que realiza la orden' })
  @IsNumberString()
  @IsNotEmpty()
  userId: string;

}
