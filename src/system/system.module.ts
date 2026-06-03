import { Module } from '@nestjs/common';
import { SystemController } from './system.controller';
import { SystemPageController } from './system-page.controller';
import { SystemService } from './system.service';
import { SystemWebappController } from './system-webapp.controller';

@Module({
  controllers: [SystemController, SystemPageController, SystemWebappController],
  providers: [SystemService],
  exports: [SystemService],
})
export class SystemModule {}
