/* eslint-disable prettier/prettier */
import {
  IsInt,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class QueryStadiumDto {
  // ---------- pagination ----------
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 12;

  // ---------- search / basic filters ----------
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  location?: string;

  // ---------- capacity filters ----------
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minCapacity?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxCapacity?: number;

  // ---------- price filters ----------
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  // ---------- amenities----------
  @IsOptional()
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      // supports ?amenities=lights,parking or multiple ?amenities=lights&amenities=parking
      return value.split(',').map((s) => s.trim()).filter(Boolean);
    }
    return undefined;
  })
  @IsString({ each: true })
  amenities?: string[];

  // ---------- Sorting ----------
  @IsOptional()
  @IsString()
  @IsIn(['createdAt', 'name', 'price', 'capacity', 'location'])
  sortBy: 'createdAt' | 'name' | 'price' | 'capacity' | 'location' = 'createdAt';

  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  sortOrder: 'asc' | 'desc' = 'desc';
}
