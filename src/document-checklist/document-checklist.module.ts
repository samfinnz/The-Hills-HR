import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { DocumentChecklistController } from './document-checklist.controller';
import { DocumentChecklistService } from './document-checklist.service';

@Module({
  imports: [PrismaModule],
  controllers: [DocumentChecklistController],
  providers: [DocumentChecklistService],
  exports: [DocumentChecklistService],
})
export class DocumentChecklistModule {}
