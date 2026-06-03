import {
  IsArray,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum RosterStatusDto {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  EXPORTED_TO_HUMANSOFT = 'EXPORTED_TO_HUMANSOFT',
  ARCHIVED = 'ARCHIVED',
}

export enum ShiftTypeDto {
  DAY = 'DAY',
  EVENING = 'EVENING',
  NIGHT = 'NIGHT',
  ON_CALL = 'ON_CALL',
  OFF = 'OFF',
}

export class CreateRosterEntryDto {
  @IsString() employeeId!: string;
  @IsDateString() shiftDate!: string;
  @IsOptional() @IsDateString() shiftStart?: string;
  @IsOptional() @IsDateString() shiftEnd?: string;
  @IsOptional() @IsEnum(ShiftTypeDto) shiftType?: ShiftTypeDto;
  @IsOptional() @IsString() areaAssignment?: string;
  @IsOptional() @IsString() notes?: string;
}

export class CreateRosterDto {
  @IsString() facilityId!: string;
  @IsString() departmentId!: string;
  @IsDateString() periodStart!: string;
  @IsDateString() periodEnd!: string;
  @IsString() authoredByHodId!: string;
  @IsOptional() @IsEnum(RosterStatusDto) status?: RosterStatusDto;
  @IsOptional() @IsString() notes?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRosterEntryDto)
  entries?: CreateRosterEntryDto[];
}

export class UpdateRosterStatusDto {
  @IsEnum(RosterStatusDto) status!: RosterStatusDto;
  @IsOptional() @IsDateString() publishedAt?: string;
  @IsOptional() @IsDateString() exportedToHumanSoftAt?: string;
}
