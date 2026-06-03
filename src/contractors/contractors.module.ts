import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ContractorsController } from './contractors.controller';
import { ContractorsPageController } from './contractors-page.controller';
import { ContractorsService } from './contractors.service';

@Module({
  imports: [PrismaModule],
  controllers: [ContractorsController, ContractorsPageController],
  providers: [ContractorsService],
  exports: [ContractorsService],
})
export class ContractorsModule {}
