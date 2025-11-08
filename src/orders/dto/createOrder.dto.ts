import { Type } from 'class-transformer';
import { 
  IsString, 
  IsOptional, 
  IsNumberString,
  IsNotEmpty
} from 'class-validator';

export class CreateOrderDto {
  @IsOptional()
  @IsString()
  status: string;

  @IsNumberString()
  @IsNotEmpty()
  total: string;

  @IsNumberString()
  @IsNotEmpty()
  userId: string;

}
