import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryDto } from './createCategory.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
	@ApiPropertyOptional({ example: 'Balones', description: 'Nombre de la categoría' })
	name?: string;

	@ApiPropertyOptional({ example: 'Categoría para balones deportivos', description: 'Descripción de la categoría' })
	description?: string;

	@ApiPropertyOptional({ example: 1, description: 'ID del producto relacionado' })
	product?: number;
}
