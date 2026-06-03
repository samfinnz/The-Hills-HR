import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';

export enum EmploymentTermDto {
  PERMANENT = 'PERMANENT',
  DAILY_WAGES = 'DAILY_WAGES',
  PROBATIONARY = 'PROBATIONARY',
  FIXED_TERM = 'FIXED_TERM',
  CONTRACTOR = 'CONTRACTOR',
}

export enum EmploymentStatusDto {
  ACTIVE = 'ACTIVE',
  PROBATION = 'PROBATION',
  ON_LEAVE = 'ON_LEAVE',
  SUSPENDED = 'SUSPENDED',
  SEPARATED = 'SEPARATED',
}

export class CreateEmployeeDto {
  @IsString() firstName!: string;
  @IsString() lastName!: string;
  @IsOptional() @IsString() firstNameTh?: string;
  @IsOptional() @IsString() lastNameTh?: string;
  @IsOptional() @IsString() nickname?: string;
  @IsOptional() @IsDateString() dateOfBirth?: string;
  @IsOptional() @IsString() nationality?: string;
  @IsOptional() @IsString() religion?: string;
  @IsOptional() @IsString() pronouns?: string;

  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() phone?: string;

  @IsString() facilityId!: string;
  @IsOptional() @IsString() departmentId?: string;
  @IsOptional() @IsString() positionId?: string;
  @IsOptional() @IsBoolean() isHod?: boolean;
  @IsOptional() @IsString() managerId?: string;

  @IsOptional() @IsEnum(EmploymentTermDto) employmentTerm?: EmploymentTermDto;
  @IsOptional() @IsEnum(EmploymentStatusDto)
  employmentStatus?: EmploymentStatusDto;

  @IsOptional() @IsDateString() hireDate?: string;
  @IsOptional() @IsDateString() probationEndDate?: string;
  @IsOptional() @IsDateString() permanentSinceDate?: string;
}
