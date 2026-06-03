import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { DocumentChecklistService } from './document-checklist.service';
import {
  CreateDocumentChecklistItemDto,
  UpdateDocumentChecklistItemDto,
} from './dto/create-document-checklist-item.dto';

@Controller('document-checklist')
export class DocumentChecklistController {
  constructor(private readonly svc: DocumentChecklistService) {}

  @Get()
  list(
    @Query('employeeId') employeeId?: string,
    @Query('status') status?: string,
  ) {
    return this.svc.list(employeeId, status);
  }

  @Get('employees/:employeeId/completion')
  completion(@Param('employeeId') employeeId: string) {
    return this.svc.completion(employeeId);
  }

  @Post()
  create(@Body() dto: CreateDocumentChecklistItemDto) {
    return this.svc.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateDocumentChecklistItemDto,
  ) {
    return this.svc.update(id, dto);
  }
}
