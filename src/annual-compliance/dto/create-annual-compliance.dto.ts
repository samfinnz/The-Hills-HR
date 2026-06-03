import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';

export enum AnnualComplianceTypeDto {
  SOCIAL_SECURITY = 'SOCIAL_SECURITY',
  GROUP_INSURANCE = 'GROUP_INSURANCE',
  HEALTH_CHECKUP = 'HEALTH_CHECKUP',
}

export enum AnnualComplianceStatusDto {
  NOT_STARTED = 'NOT_STARTED',
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  OVERDUE = 'OVERDUE',
  RENEWAL_DUE = 'RENEWAL_DUE',
}

export class CreateAnnualComplianceDto {
  @IsString() employeeId!: string;
  @IsEnum(AnnualComplianceTypeDto) type!: AnnualComplianceTypeDto;
  @IsOptional() @IsString() provider?: string;
  @IsOptional() @IsString() policyNumber?: string;
  @IsOptional() @IsDateString() coverageStart?: string;
  @IsOptional() @IsDateString() coverageEnd?: string;
  @IsOptional() @IsDateString() scheduledAt?: string;
  @IsOptional() @IsDateString() completedAt?: string;
  @IsOptional() @IsString() latestDocumentId?: string;
  @IsOptional() @IsEnum(AnnualComplianceStatusDto)
  status?: AnnualComplianceStatusDto;
  @IsOptional() @IsString() responsibleAdminId?: string;
  @IsOptional() @IsString() notes?: string;
}

export class UpdateAnnualComplianceDto {
  @IsOptional() @IsString() employeeId?: string;
  @IsOptional() @IsEnum(AnnualComplianceTypeDto) type?: AnnualComplianceTypeDto;
  @IsOptional() @IsString() provider?: string;
  @IsOptional() @IsString() policyNumber?: string;
  @IsOptional() @IsDateString() coverageStart?: string;
  @IsOptional() @IsDateString() coverageEnd?: string;
  @IsOptional() @IsDateString() scheduledAt?: string;
  @IsOptional() @IsDateString() completedAt?: string;
  @IsOptional() @IsString() latestDocumentId?: string;
  @IsOptional() @IsEnum(AnnualComplianceStatusDto)
  status?: AnnualComplianceStatusDto;
  @IsOptional() @IsString() responsibleAdminId?: string;
  @IsOptional() @IsString() notes?: string;
}
