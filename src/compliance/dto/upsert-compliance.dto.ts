import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpsertComplianceDto {
  @IsOptional() @IsString() passportNumber?: string;
  @IsOptional() @IsString() passportIssuingCountry?: string;
  @IsOptional() @IsDateString() passportExpiry?: string;
  @IsOptional() @IsString() visaType?: string;
  @IsOptional() @IsString() visaNumber?: string;
  @IsOptional() @IsDateString() visaExpiry?: string;
  @IsOptional() @IsString() workPermitNumber?: string;
  @IsOptional() @IsDateString() workPermitExpiry?: string;
}
