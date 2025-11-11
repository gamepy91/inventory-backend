import { IsIn, IsInt, IsOptional, IsPositive, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateActivityDto {
  @IsIn(['IN', 'OUT'])
  type: 'IN' | 'OUT';

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  qtyChange: number;

  @IsOptional()
  @IsString()
  note?: string;
}
