import { IsOptional, IsEnum, IsBooleanString, IsString } from 'class-validator';
import { UserRole } from 'src/auth/enums/roles.enum';

export class QueryUserDto {
  @IsOptional()
  @IsEnum(UserRole, { message: 'role must be a valid UserRole' })
  role?: UserRole;

  @IsOptional()
  @IsBooleanString({ message: 'isActive must be true or false' })
  isActive?: string; // Note: query params are strings, convert to boolean in service

  @IsOptional()
  @IsString({ message: 'username must be a string' })
  username?: string;

  @IsOptional()
  @IsString({ message: 'email must be a string' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'phoneNumber must be a string' })
  phoneNumber?: string;
}
