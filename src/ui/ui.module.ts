import { Module } from '@nestjs/common';
import { UiController } from './ui.controller';
import { EmployeesModule } from '../employees/employees.module';
import { DepartmentsModule } from '../departments/departments.module';
import { EvaluationsModule } from '../evaluations/evaluations.module';
import { DocumentChecklistModule } from '../document-checklist/document-checklist.module';
import { AnnualComplianceModule } from '../annual-compliance/annual-compliance.module';
import { RostersModule } from '../rosters/rosters.module';

@Module({
  imports: [
    EmployeesModule,
    DepartmentsModule,
    EvaluationsModule,
    DocumentChecklistModule,
    AnnualComplianceModule,
    RostersModule,
  ],
  controllers: [UiController],
})
export class UiModule {}
