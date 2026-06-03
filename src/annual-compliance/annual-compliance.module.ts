import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AnnualComplianceController } from './annual-compliance.controller';
import { AnnualComplianceService } from './annual-compliance.service';

@Module({
  imports: [PrismaModule],
  controllers: [AnnualComplianceController],
  providers: [AnnualComplianceService],
  exports: [AnnualComplianceService],
})
export class AnnualComplianceModule {}
