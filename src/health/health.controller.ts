import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check() {
    const checks: Record<string, string> = {};
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      checks.postgres = 'up';
    } catch {
      checks.postgres = 'down';
    }
    const ok = Object.values(checks).every((v) => v === 'up');
    return {
      app: 'HR Project',
      status: ok ? 'ok' : 'degraded',
      checks,
      time: new Date().toISOString(),
    };
  }
}
