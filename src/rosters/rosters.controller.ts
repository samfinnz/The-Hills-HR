import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { RostersService } from './rosters.service';
import {
  CreateRosterDto,
  CreateRosterEntryDto,
  UpdateRosterStatusDto,
} from './dto/create-roster.dto';

@Controller('rosters')
export class RostersController {
  constructor(private readonly svc: RostersService) {}

  @Get()
  list(
    @Query('departmentId') departmentId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('status') status?: string,
  ) {
    return this.svc.list({ departmentId, from, to, status });
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.svc.get(id);
  }

  @Get(':id/humansoft-export')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @Header('Content-Disposition', 'attachment; filename="humansoft-roster.csv"')
  humanSoftExport(@Param('id') id: string) {
    return this.svc.humanSoftCsv(id);
  }

  @Post()
  create(@Body() dto: CreateRosterDto) {
    return this.svc.create(dto);
  }

  @Post(':id/entries')
  addEntry(@Param('id') id: string, @Body() dto: CreateRosterEntryDto) {
    return this.svc.addEntry(id, dto);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateRosterStatusDto) {
    return this.svc.updateStatus(id, dto);
  }
}
