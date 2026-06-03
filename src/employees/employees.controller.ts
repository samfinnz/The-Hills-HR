import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Controller('employees')
export class EmployeesController {
  constructor(private readonly svc: EmployeesService) {}

  @Get()
  list(
    @Query('departmentId') departmentId?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.svc.list({ departmentId, status, search });
  }

  @Get('stats')
  stats() {
    return this.svc.stats();
  }

  @Get('expiring')
  expiring(@Query('days') days?: string) {
    return this.svc.expiring(days ? Number(days) : 60);
  }

  @Get('operational')
  operational(
    @Query('departmentId') departmentId?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.svc.operationalView({ departmentId, status, search });
  }

  @Get('hod-team/:hodId')
  hodTeam(@Param('hodId') hodId: string) {
    return this.svc.hodTeamView(hodId);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.svc.get(id);
  }

  @Post()
  create(@Body() dto: CreateEmployeeDto) {
    return this.svc.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEmployeeDto) {
    return this.svc.update(id, dto);
  }
}
