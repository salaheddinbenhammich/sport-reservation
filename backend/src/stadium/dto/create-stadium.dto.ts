import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  IsArray,
  IsObject,
  IsString as IsStringValidator,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateStadiumDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Type(() => Number)
  @Min(1)
  capacity: number;

  @IsOptional()
  @IsArray()
  @IsStringValidator({ each: true })
  images?: string[];

  @IsOptional()
  @IsObject()
  amenities?: Record<string, string>;
  /* optional Map of amenities (parking, wifi, lights, etc.)
     Example: { parking: "yes", wifi: "no", lights: "yes" } */
}
