import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertComplianceDto } from './dto/upsert-compliance.dto';

@Injectable()
export class ComplianceService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.foreignEmployeeCompliance.findMany({
      include: { employee: { include: { department: true } } },
    });
  }

  /** Create or update the compliance record for a given employee. */
  upsert(employeeId: string, dto: UpsertComplianceDto) {
    const data = {
      passportNumber: dto.passportNumber,
      passportIssuingCountry: dto.passportIssuingCountry,
      passportExpiry: dto.passportExpiry ? new Date(dto.passportExpiry) : undefined,
      visaType: dto.visaType,
      visaNumber: dto.visaNumber,
      visaExpiry: dto.visaExpiry ? new Date(dto.visaExpiry) : undefined,
      workPermitNumber: dto.workPermitNumber,
      workPermitExpiry: dto.workPermitExpiry ? new Date(dto.workPermitExpiry) : undefined,
    };
    return this.prisma.foreignEmployeeCompliance.upsert({
      where: { employeeId },
      create: { employeeId, ...data },
      update: data,
    });
  }
}
