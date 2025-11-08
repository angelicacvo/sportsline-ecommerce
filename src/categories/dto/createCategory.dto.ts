import { IsInt, IsNotEmpty, IsString } from 'class-validator'
import { Type } from 'class-transformer'

export class CreateCategoryDto {
    @IsString({ message: 'The name must be a string' })
    @IsNotEmpty({ message: 'The name is required' })
    name: string;

    @IsString({ message: 'The description must be a string' })
    description: string;

    @Type(() => Number)
    @IsInt({ message: 'The product ID must be an integer' })
    @IsNotEmpty({ message: 'The product ID is required' })
    product: number;
}
