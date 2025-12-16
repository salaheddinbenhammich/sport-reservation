import {
  IsDateString,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  IsEnum,
  IsInt,
  Min,
  IsNumber,
} from 'class-validator';
import { SessionStatus } from '../entities/session.entity';

export class CreateSessionDto {
  @IsMongoId({ message: 'Invalid stadium ID format' })
  @IsNotEmpty({ message: 'Stadium ID is required' })
  stadium: string;

  @IsDateString({}, { message: 'Date must be a valid ISO string (YYYY-MM-DD)' })
  date: string;

  @IsString()
  @Matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/, { message: 'startTime must be in HH:mm format' })
  startTime: string;

  @IsString()
  @Matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/, { message: 'endTime must be in HH:mm format' })
  endTime: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  price: number;

  // @IsOptional()
  // @IsInt({ message: 'maxPlayers must be an integer' })
  // @Min(1, { message: 'maxPlayers must be at least 1' })
  // maxPlayers?: number;

  @IsOptional()
  @IsEnum(SessionStatus, { message: 'Invalid session status' })
  status?: SessionStatus;
}
