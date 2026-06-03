import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CertificationsService } from './certifications.service';
import { CreateCertificationDto, UpdateCertificationDto } from './dto/create-certification.dto';

@Controller('certifications')
export class CertificationsController {
  constructor(private readonly svc: CertificationsService) {}

  @Get()
  list(@Query('employeeId') employeeId?: string) {
    return this.svc.list(employeeId);
  }

  @Post()
  create(@Body() dto: CreateCertificationDto) {
    return this.svc.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCertificationDto) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }
}
