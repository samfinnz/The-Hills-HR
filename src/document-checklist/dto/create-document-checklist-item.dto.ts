import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';

export enum DocumentChecklistStatusDto {
  MISSING = 'MISSING',
  ON_FILE = 'ON_FILE',
  STALE = 'STALE',
  WAIVED = 'WAIVED',
}

export class CreateDocumentChecklistItemDto {
  @IsString() employeeId!: string;
  @IsString() documentName!: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsString() requiredFor?: string;
  @IsOptional() @IsString() documentId?: string;
  @IsOptional() @IsEnum(DocumentChecklistStatusDto)
  status?: DocumentChecklistStatusDto;
  @IsOptional() @IsDateString() dueDate?: string;
  @IsOptional() @IsDateString() expiryDate?: string;
  @IsOptional() @IsString() notes?: string;
}

export class UpdateDocumentChecklistItemDto {
  @IsOptional() @IsString() documentName?: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsString() requiredFor?: string;
  @IsOptional() @IsString() documentId?: string;
  @IsOptional() @IsEnum(DocumentChecklistStatusDto)
  status?: DocumentChecklistStatusDto;
  @IsOptional() @IsDateString() dueDate?: string;
  @IsOptional() @IsDateString() expiryDate?: string;
  @IsOptional() @IsString() notes?: string;
}
