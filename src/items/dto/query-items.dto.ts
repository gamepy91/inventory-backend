import { IsInt, IsOptional, IsString, Min, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryItemsDto {
  @IsOptional() @IsString() search?: string;
  @IsOptional() @Type(() => Number) @IsInt() warehouseId?: number;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page: number = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) pageSize: number = 20;

  @IsOptional()
  @IsIn(['updatedAt', 'name', 'qty', 'reserveQty'])
  orderBy: 'updatedAt' | 'name' | 'qty' | 'reserveQty' = 'updatedAt';

  @IsOptional() @IsIn(['asc', 'desc']) order: 'asc' | 'desc' = 'desc';
}
