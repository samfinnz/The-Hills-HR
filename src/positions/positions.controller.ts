import { Controller, Get, Query } from '@nestjs/common';
import { PositionsService } from './positions.service';

@Controller('positions')
export class PositionsController {
  constructor(private readonly svc: PositionsService) {}

  @Get()
  list(@Query('departmentId') departmentId?: string) {
    return this.svc.list(departmentId);
  }
}
