import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum ContractorServiceCategoryDto {
  YOGA_MOVEMENT = 'YOGA_MOVEMENT',
  ART_THERAPY = 'ART_THERAPY',
  RELIGIOUS_SPIRITUAL = 'RELIGIOUS_SPIRITUAL',
  SOUND_HEALING = 'SOUND_HEALING',
  MUSIC_ARTS_PERFORMANCE = 'MUSIC_ARTS_PERFORMANCE',
  SPECIALIST_THERAPY = 'SPECIALIST_THERAPY',
  OTHER = 'OTHER',
}

export enum ContractorPaymentMethodDto {
  BANK_TRANSFER = 'BANK_TRANSFER',
  CASH = 'CASH',
  CHEQUE = 'CHEQUE',
}

export enum ContractorPaymentTermsDto {
  PER_SESSION = 'PER_SESSION',
  PER_HOUR = 'PER_HOUR',
  PER_MONTH = 'PER_MONTH',
  PER_VISIT = 'PER_VISIT',
  OTHER = 'OTHER',
}

export enum ContractorStatusDto {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  TERMINATED = 'TERMINATED',
}

export enum ContractorPaymentStatusDto {
  PENDING = 'PENDING',
  SUBMITTED_TO_WORK_FLOW = 'SUBMITTED_TO_WORK_FLOW',
  PAID = 'PAID',
}

export class CreateContractorDto {
  @IsString() facilityId!: string;
  @IsString() name!: string;
  @IsEnum(ContractorServiceCategoryDto)
  serviceCategory!: ContractorServiceCategoryDto;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() taxId?: string;
  @IsOptional() @IsEnum(ContractorPaymentMethodDto)
  paymentMethod?: ContractorPaymentMethodDto;
  @IsOptional() @IsEnum(ContractorPaymentTermsDto)
  paymentTerms?: ContractorPaymentTermsDto;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0)
  standardRate?: number;
  @IsOptional() linkedDocuments?: unknown;
  @IsOptional() @IsEnum(ContractorStatusDto) status?: ContractorStatusDto;
  @IsOptional() @IsString() notes?: string;
}

export class CreateContractorSessionDto {
  @IsDateString() sessionDate!: string;
  @IsEnum(ContractorServiceCategoryDto)
  serviceType!: ContractorServiceCategoryDto;
  @IsOptional() clientAttendance?: unknown;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0)
  durationHours?: number;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0)
  agreedRate?: number;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0)
  totalAmount?: number;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsString() linkedPvId?: string;
  @IsOptional() @IsString() linkedReceiptId?: string;
  @IsOptional() @IsEnum(ContractorPaymentStatusDto)
  paymentStatus?: ContractorPaymentStatusDto;
  @IsOptional() @IsDateString() paidDate?: string;
}

export class UpdateContractorDto {
  @IsOptional() @IsString() facilityId?: string;
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsEnum(ContractorServiceCategoryDto)
  serviceCategory?: ContractorServiceCategoryDto;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() taxId?: string;
  @IsOptional() @IsEnum(ContractorPaymentMethodDto)
  paymentMethod?: ContractorPaymentMethodDto;
  @IsOptional() @IsEnum(ContractorPaymentTermsDto)
  paymentTerms?: ContractorPaymentTermsDto;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0)
  standardRate?: number;
  @IsOptional() linkedDocuments?: unknown;
  @IsOptional() @IsEnum(ContractorStatusDto) status?: ContractorStatusDto;
  @IsOptional() @IsString() notes?: string;
}

export class UpdateContractorSessionDto {
  @IsOptional() @IsDateString() sessionDate?: string;
  @IsOptional() @IsEnum(ContractorServiceCategoryDto)
  serviceType?: ContractorServiceCategoryDto;
  @IsOptional() clientAttendance?: unknown;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0)
  durationHours?: number;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0)
  agreedRate?: number;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0)
  totalAmount?: number;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsString() linkedPvId?: string;
  @IsOptional() @IsString() linkedReceiptId?: string;
  @IsOptional() @IsEnum(ContractorPaymentStatusDto)
  paymentStatus?: ContractorPaymentStatusDto;
  @IsOptional() @IsDateString() paidDate?: string;
}
