import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum EvaluationStatusDto {
  DRAFT = 'DRAFT',
  SENT_TO_EMPLOYEE = 'SENT_TO_EMPLOYEE',
  DISCUSSION_HELD = 'DISCUSSION_HELD',
  SIGNED_OFF = 'SIGNED_OFF',
  ARCHIVED = 'ARCHIVED',
}

export enum OverallRatingDto {
  OUTSTANDING = 'OUTSTANDING',
  EXCEEDS_EXPECTATIONS = 'EXCEEDS_EXPECTATIONS',
  MEETS_EXPECTATIONS = 'MEETS_EXPECTATIONS',
  NEEDS_IMPROVEMENT = 'NEEDS_IMPROVEMENT',
  UNSATISFACTORY = 'UNSATISFACTORY',
}

export enum EvaluationWeightingSetDto {
  STAFF = 'STAFF',
  MANAGER = 'MANAGER',
}

export class CreateEvaluationDto {
  @IsString() employeeId!: string;
  @IsDateString() periodStart!: string;
  @IsDateString() periodEnd!: string;
  @IsOptional() @IsString() evaluatorId?: string;
  @IsOptional() @IsString() hrOwnerId?: string;
  @IsOptional() @IsDateString() scheduledMeetingAt?: string;
  @IsOptional() @IsDateString() actualMeetingAt?: string;
  @IsOptional() @IsEnum(EvaluationStatusDto) status?: EvaluationStatusDto;
  @IsOptional() @IsEnum(OverallRatingDto) overallRating?: OverallRatingDto;
  @IsOptional() @IsEnum(EvaluationWeightingSetDto)
  weightingSet?: EvaluationWeightingSetDto;

  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) @Max(100)
  kpiScore?: number;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) @Max(100)
  coreCompetencyScore?: number;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) @Max(100)
  functionalCompetencyScore?: number;

  @IsOptional() @IsString() strengths?: string;
  @IsOptional() @IsString() areasForDevelopment?: string;
  @IsOptional() goalsNextPeriod?: unknown;
  @IsOptional() @IsString() employeeComments?: string;
  @IsOptional() @IsString() signedEvaluationDocumentId?: string;
  @IsOptional() linkedActions?: unknown;
}

export class UpdateEvaluationDto {
  @IsOptional() @IsString() employeeId?: string;
  @IsOptional() @IsDateString() periodStart?: string;
  @IsOptional() @IsDateString() periodEnd?: string;
  @IsOptional() @IsString() evaluatorId?: string;
  @IsOptional() @IsString() hrOwnerId?: string;
  @IsOptional() @IsDateString() scheduledMeetingAt?: string;
  @IsOptional() @IsDateString() actualMeetingAt?: string;
  @IsOptional() @IsEnum(EvaluationStatusDto) status?: EvaluationStatusDto;
  @IsOptional() @IsEnum(OverallRatingDto) overallRating?: OverallRatingDto;
  @IsOptional() @IsEnum(EvaluationWeightingSetDto)
  weightingSet?: EvaluationWeightingSetDto;

  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) @Max(100)
  kpiScore?: number;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) @Max(100)
  coreCompetencyScore?: number;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) @Max(100)
  functionalCompetencyScore?: number;

  @IsOptional() @IsString() strengths?: string;
  @IsOptional() @IsString() areasForDevelopment?: string;
  @IsOptional() goalsNextPeriod?: unknown;
  @IsOptional() @IsString() employeeComments?: string;
  @IsOptional() @IsString() signedEvaluationDocumentId?: string;
  @IsOptional() linkedActions?: unknown;
}
