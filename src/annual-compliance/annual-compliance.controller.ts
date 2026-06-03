import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { AnnualComplianceService } from './annual-compliance.service';
import {
  CreateAnnualComplianceDto,
  UpdateAnnualComplianceDto,
} from './dto/create-annual-compliance.dto';

@Controller('compliance/annual')
export class AnnualComplianceController {
  constructor(private readonly svc: AnnualComplianceService) {}

  @Get()
  list(
    @Query('employeeId') employeeId?: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
  ) {
    return this.svc.list(employeeId, type, status);
  }

  @Get('due')
  due(@Query('days') days?: string) {
    return this.svc.due(days ? Number(days) : 60);
  }

  @Post()
  create(@Body() dto: CreateAnnualComplianceDto) {
    return this.svc.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAnnualComplianceDto) {
    return this.svc.update(id, dto);
  }
}
