import { IsString, IsEmail, IsOptional, IsIn, MinLength, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password: string;

  @IsOptional()
  @IsIn(['admin', 'staff', 'member', 'user'])
  role?: string = 'member';
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  firstName?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  lastName?: string;

  @IsOptional()
  @IsEmail()
  @Transform(({ value }) => value?.trim().toLowerCase())
  email?: string;

  @IsOptional()
  @IsIn(['admin', 'staff', 'member', 'user'])
  role?: string;

  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  newPassword?: string;
}

export class ToggleUserStatusDto {
  @IsNotEmpty()
  @IsIn(['active', 'inactive'])
  @ApiProperty({ description: 'User status', enum: ['active', 'inactive'] })
  status: string;
}

export class ListUsersQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(['admin', 'staff', 'member', 'all'])
  role?: string;

  @IsOptional()
  @IsIn(['active', 'inactive', 'all'])
  status?: string;

  @IsOptional()
  limit?: number = 100;

  @IsOptional()
  offset?: number = 0;
}

