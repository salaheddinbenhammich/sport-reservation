import { IsDateString, IsEnum, IsMongoId, IsOptional } from 'class-validator';
import { SessionStatus } from '../entities/session.entity';

export class QuerySessionDto {
  @IsOptional()
  @IsMongoId({ message: 'Invalid stadium ID' })
  stadiumId?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Date must be in valid ISO format (YYYY-MM-DD)'})
  date?: string;

  @IsOptional()
  @IsEnum(SessionStatus, { message: 'Invalid session status' })
  status?: SessionStatus;
}
