import { Controller, Get, Param } from '@nestjs/common';
import { SystemService } from './system.service';

@Controller('api/system')
export class SystemController {
  constructor(private readonly system: SystemService) {}

  @Get()
  overview() {
    return this.system.overview();
  }

  @Get('modules')
  modules() {
    return this.system.modules();
  }

  @Get('modules/:id')
  module(@Param('id') id: string) {
    return this.system.module(id);
  }

  @Get('apps')
  apps() {
    return this.system.apps();
  }

  @Get('apps/:slug')
  app(@Param('slug') slug: string) {
    return this.system.app(slug);
  }

  @Get('documents')
  documents() {
    return this.system.documents();
  }

  @Get('roadmap')
  roadmap() {
    return this.system.roadmap();
  }

  @Get('workflows')
  workflows() {
    return this.system.workflows();
  }

  @Get('integrations')
  integrations() {
    return this.system.integrations();
  }
}
