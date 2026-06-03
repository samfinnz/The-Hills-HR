import {
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateCertificationDto {
  @IsString() employeeId!: string;
  @IsString() name!: string;
  @IsOptional() @IsString() nameTh?: string;
  @IsOptional() @IsString() issuingAuthority?: string;
  @IsOptional() @IsString() certificateNumber?: string;
  @IsOptional() @IsDateString() issueDate?: string;
  @IsOptional() @IsDateString() expiryDate?: string;
  @IsOptional() @IsBoolean() isRequiredForRole?: boolean;
}

export class UpdateCertificationDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() nameTh?: string;
  @IsOptional() @IsString() issuingAuthority?: string;
  @IsOptional() @IsString() certificateNumber?: string;
  @IsOptional() @IsDateString() issueDate?: string;
  @IsOptional() @IsDateString() expiryDate?: string;
  @IsOptional() @IsBoolean() isRequiredForRole?: boolean;
}
