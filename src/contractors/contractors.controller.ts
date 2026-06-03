import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ContractorsService } from './contractors.service';
import {
  CreateContractorDto,
  CreateContractorSessionDto,
  UpdateContractorDto,
  UpdateContractorSessionDto,
} from './dto/create-contractor.dto';

@Controller('contractors')
export class ContractorsController {
  constructor(private readonly svc: ContractorsService) {}

  @Get()
  list(@Query('status') status?: string) {
    return this.svc.list(status);
  }

  @Get('sessions')
  sessions(@Query('paymentStatus') paymentStatus?: string) {
    return this.svc.listSessions(paymentStatus);
  }

  @Get('payments/pending')
  pendingPayments() {
    return this.svc.pendingPayments();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.svc.get(id);
  }

  @Post()
  create(@Body() dto: CreateContractorDto) {
    return this.svc.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateContractorDto) {
    return this.svc.update(id, dto);
  }

  @Post(':id/sessions')
  addSession(
    @Param('id') id: string,
    @Body() dto: CreateContractorSessionDto,
  ) {
    return this.svc.addSession(id, dto);
  }

  @Patch('sessions/:id')
  updateSession(
    @Param('id') id: string,
    @Body() dto: UpdateContractorSessionDto,
  ) {
    return this.svc.updateSession(id, dto);
  }
}
