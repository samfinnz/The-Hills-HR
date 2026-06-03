import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { EvaluationsController } from './evaluations.controller';
import { EvaluationsPageController } from './evaluations-page.controller';
import { EvaluationsService } from './evaluations.service';

@Module({
  imports: [PrismaModule],
  controllers: [EvaluationsController, EvaluationsPageController],
  providers: [EvaluationsService],
  exports: [EvaluationsService],
})
export class EvaluationsModule {}
