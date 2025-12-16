import {
  IsMongoId,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsArray,
  ArrayNotEmpty,
  ValidateNested,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateReservationDto {
  // Organizer ID
  @IsOptional()
  @IsMongoId()
  organizer: string;

  // Stadium ID
  @IsMongoId()
  stadium: string;

  // Session ID
  @IsArray()
  @ArrayNotEmpty()
  @IsMongoId({ each: true })
  sessions: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  emails?: string[];

  // Players involved
  @IsArray()
  @IsOptional()
  @IsMongoId({ each: true })
  players: string[];

  // Total price
  @IsOptional()
  @IsNumber()
  totalPrice: number;

  // Split payment flag
  @IsOptional()
  @IsBoolean()
  isSplitPayment?: boolean;

  // Reservation status (optional)
  @IsOptional()
  status?: 'pending' | 'confirmed' | 'cancelled';

  @IsOptional()
  @IsString()
  bookingReference?: string;
}
