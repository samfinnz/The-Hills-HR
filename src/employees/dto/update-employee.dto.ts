import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { EmploymentTermDto, EmploymentStatusDto } from './create-employee.dto';

export class UpdateEmployeeDto {
  @IsOptional() @IsString() firstName?: string;
  @IsOptional() @IsString() lastName?: string;
  @IsOptional() @IsString() firstNameTh?: string;
  @IsOptional() @IsString() lastNameTh?: string;
  @IsOptional() @IsString() nickname?: string;
  @IsOptional() @IsDateString() dateOfBirth?: string;
  @IsOptional() @IsString() nationality?: string;
  @IsOptional() @IsString() religion?: string;
  @IsOptional() @IsString() pronouns?: string;

  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() phone?: string;

  @IsOptional() @IsString() departmentId?: string;
  @IsOptional() @IsString() positionId?: string;
  @IsOptional() @IsBoolean() isHod?: boolean;
  @IsOptional() @IsString() managerId?: string;

  @IsOptional() @IsEnum(EmploymentTermDto) employmentTerm?: EmploymentTermDto;
  @IsOptional() @IsEnum(EmploymentStatusDto) employmentStatus?: EmploymentStatusDto;

  @IsOptional() @IsDateString() hireDate?: string;
  @IsOptional() @IsDateString() probationEndDate?: string;
  @IsOptional() @IsDateString() permanentSinceDate?: string;
  @IsOptional() @IsDateString() separationDate?: string;
}
