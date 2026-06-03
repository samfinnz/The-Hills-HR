import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { ComplianceService } from './compliance.service';
import { UpsertComplianceDto } from './dto/upsert-compliance.dto';

@Controller('compliance/foreign')
export class ComplianceController {
  constructor(private readonly svc: ComplianceService) {}

  @Get()
  list() {
    return this.svc.list();
  }

  @Put(':employeeId')
  upsert(@Param('employeeId') employeeId: string, @Body() dto: UpsertComplianceDto) {
    return this.svc.upsert(employeeId, dto);
  }
}
