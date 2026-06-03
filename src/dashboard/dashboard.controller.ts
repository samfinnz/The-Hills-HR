import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('hr-dashboard')
export class DashboardController {
  constructor(private readonly svc: DashboardService) {}

  @Get()
  dashboard() {
    return this.svc.hrDashboard();
  }
}
