import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { DepartmentsModule } from './departments/departments.module';
import { PositionsModule } from './positions/positions.module';
import { EmployeesModule } from './employees/employees.module';
import { CertificationsModule } from './certifications/certifications.module';
import { ComplianceModule } from './compliance/compliance.module';
import { RostersModule } from './rosters/rosters.module';
import { EvaluationsModule } from './evaluations/evaluations.module';
import { ContractorsModule } from './contractors/contractors.module';
import { DocumentChecklistModule } from './document-checklist/document-checklist.module';
import { AnnualComplianceModule } from './annual-compliance/annual-compliance.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { SystemModule } from './system/system.module';
import { UiModule } from './ui/ui.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    HealthModule,
    DepartmentsModule,
    PositionsModule,
    EmployeesModule,
    CertificationsModule,
    ComplianceModule,
    RostersModule,
    EvaluationsModule,
    ContractorsModule,
    DocumentChecklistModule,
    AnnualComplianceModule,
    DashboardModule,
    SystemModule,
    UiModule,
  ],
})
export class AppModule {}
