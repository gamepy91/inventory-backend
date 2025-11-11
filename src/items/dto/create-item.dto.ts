import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateItemDto {
  @IsString() @IsNotEmpty() name: string;
  @IsOptional() @IsString() imageUrl?: string;
  @Type(() => Number) @IsInt() warehouseId: number;
}
