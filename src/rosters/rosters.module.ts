import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RostersController } from './rosters.controller';
import { RostersService } from './rosters.service';

@Module({
  imports: [PrismaModule],
  controllers: [RostersController],
  providers: [RostersService],
  exports: [RostersService],
})
export class RostersModule {}
