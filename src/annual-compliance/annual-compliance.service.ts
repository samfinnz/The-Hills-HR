import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateAnnualComplianceDto,
  UpdateAnnualComplianceDto,
} from './dto/create-annual-compliance.dto';

@Injectable()
export class AnnualComplianceService {
  constructor(private readonly prisma: PrismaService) {}

  list(employeeId?: string, type?: string, status?: string) {
    return this.prisma.annualComplianceItem.findMany({
      where: {
        ...(employeeId && { employeeId }),
        ...(type && { type: type as any }),
        ...(status && { status: status as any }),
      },
      include: { employee: { include: { department: true, position: true } } },
      orderBy: [{ type: 'asc' }, { coverageEnd: 'asc' }, { scheduledAt: 'asc' }],
    });
  }

  due(days = 60) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + days);
    const where: Prisma.AnnualComplianceItemWhereInput = {
      OR: [
        { coverageEnd: { not: null, lte: cutoff } },
        { scheduledAt: { not: null, lte: cutoff } },
      ],
      NOT: { status: 'COMPLETED' },
    };
    return this.prisma.annualComplianceItem.findMany({
      where,
      include: { employee: { include: { department: true, position: true } } },
      orderBy: [{ coverageEnd: 'asc' }, { scheduledAt: 'asc' }],
    });
  }

  create(dto: CreateAnnualComplianceDto) {
    return this.prisma.annualComplianceItem.create({
      data: this.data(dto) as Prisma.AnnualComplianceItemUncheckedCreateInput,
      include: { employee: true },
    });
  }

  async update(id: string, dto: UpdateAnnualComplianceDto) {
    const item = await this.prisma.annualComplianceItem.findUnique({
      where: { id },
    });
    if (!item) throw new NotFoundException(`Annual compliance item ${id} not found`);
    return this.prisma.annualComplianceItem.update({
      where: { id },
      data: this.data(dto, true),
      include: { employee: true },
    });
  }

  private data(
    dto: CreateAnnualComplianceDto | UpdateAnnualComplianceDto,
    partial = false,
  ) {
    return {
      ...(!partial && { employeeId: (dto as CreateAnnualComplianceDto).employeeId }),
      ...(dto.employeeId !== undefined && partial && { employeeId: dto.employeeId }),
      ...(dto.type !== undefined && { type: dto.type as any }),
      ...(dto.provider !== undefined && { provider: dto.provider }),
      ...(dto.policyNumber !== undefined && { policyNumber: dto.policyNumber }),
      ...(dto.coverageStart !== undefined && {
        coverageStart: dto.coverageStart ? new Date(dto.coverageStart) : null,
      }),
      ...(dto.coverageEnd !== undefined && {
        coverageEnd: dto.coverageEnd ? new Date(dto.coverageEnd) : null,
      }),
      ...(dto.scheduledAt !== undefined && {
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
      }),
      ...(dto.completedAt !== undefined && {
        completedAt: dto.completedAt ? new Date(dto.completedAt) : null,
      }),
      ...(dto.latestDocumentId !== undefined && {
        latestDocumentId: dto.latestDocumentId,
      }),
      ...(dto.status !== undefined && { status: dto.status as any }),
      ...(dto.responsibleAdminId !== undefined && {
        responsibleAdminId: dto.responsibleAdminId,
      }),
      ...(dto.notes !== undefined && { notes: dto.notes }),
    };
  }
}
