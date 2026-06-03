import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { EvaluationsService } from './evaluations.service';
import {
  CreateEvaluationDto,
  UpdateEvaluationDto,
} from './dto/create-evaluation.dto';

@Controller('evaluations')
export class EvaluationsController {
  constructor(private readonly svc: EvaluationsService) {}

  @Get()
  list(
    @Query('employeeId') employeeId?: string,
    @Query('status') status?: string,
    @Query('dueBefore') dueBefore?: string,
  ) {
    return this.svc.list({ employeeId, status, dueBefore });
  }

  @Get('due')
  due(@Query('days') days?: string) {
    return this.svc.due(days ? Number(days) : 30);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.svc.get(id);
  }

  @Post()
  create(@Body() dto: CreateEvaluationDto) {
    return this.svc.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEvaluationDto) {
    return this.svc.update(id, dto);
  }
}
