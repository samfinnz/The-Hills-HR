import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RostersController } from './rosters.controller';
import { RostersPageController } from './rosters-page.controller';
import { RostersService } from './rosters.service';

@Module({
  imports: [PrismaModule],
  controllers: [RostersController, RostersPageController],
  providers: [RostersService],
  exports: [RostersService],
})
export class RostersModule {}
