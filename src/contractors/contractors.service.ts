import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateContractorDto,
  CreateContractorSessionDto,
  UpdateContractorDto,
  UpdateContractorSessionDto,
} from './dto/create-contractor.dto';

@Injectable()
export class ContractorsService {
  constructor(private readonly prisma: PrismaService) {}

  list(status?: string) {
    return this.prisma.contractor.findMany({
      where: status ? { status: status as any } : undefined,
      include: { sessions: { orderBy: { sessionDate: 'desc' } } },
      orderBy: [{ status: 'asc' }, { name: 'asc' }],
    });
  }

  async get(id: string) {
    const contractor = await this.prisma.contractor.findUnique({
      where: { id },
      include: { sessions: { orderBy: { sessionDate: 'desc' } } },
    });
    if (!contractor) throw new NotFoundException(`Contractor ${id} not found`);
    return contractor;
  }

  create(dto: CreateContractorDto) {
    return this.prisma.contractor.create({
      data: this.contractorData(dto) as Prisma.ContractorUncheckedCreateInput,
      include: { sessions: true },
    });
  }

  async update(id: string, dto: UpdateContractorDto) {
    await this.get(id);
    return this.prisma.contractor.update({
      where: { id },
      data: this.contractorData(dto, true),
      include: { sessions: true },
    });
  }

  listSessions(paymentStatus?: string) {
    return this.prisma.contractorSession.findMany({
      where: paymentStatus ? { paymentStatus: paymentStatus as any } : undefined,
      include: { contractor: true },
      orderBy: { sessionDate: 'desc' },
    });
  }

  async addSession(contractorId: string, dto: CreateContractorSessionDto) {
    await this.get(contractorId);
    return this.prisma.contractorSession.create({
      data: {
        contractorId,
        ...this.sessionData(dto),
      } as Prisma.ContractorSessionUncheckedCreateInput,
      include: { contractor: true },
    });
  }

  async updateSession(id: string, dto: UpdateContractorSessionDto) {
    const existing = await this.prisma.contractorSession.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException(`Contractor session ${id} not found`);
    return this.prisma.contractorSession.update({
      where: { id },
      data: this.sessionData(dto, true),
      include: { contractor: true },
    });
  }

  pendingPayments() {
    return this.listSessions('PENDING');
  }

  private contractorData(dto: CreateContractorDto | UpdateContractorDto, partial = false) {
    return {
      ...(!partial && { facilityId: dto.facilityId }),
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.serviceCategory !== undefined && {
        serviceCategory: dto.serviceCategory as any,
      }),
      ...(dto.phone !== undefined && { phone: dto.phone }),
      ...(dto.email !== undefined && { email: dto.email }),
      ...(dto.taxId !== undefined && { taxId: dto.taxId }),
      ...(dto.paymentMethod !== undefined && { paymentMethod: dto.paymentMethod as any }),
      ...(dto.paymentTerms !== undefined && { paymentTerms: dto.paymentTerms as any }),
      ...(dto.standardRate !== undefined && { standardRate: dto.standardRate }),
      ...(dto.linkedDocuments !== undefined && {
        linkedDocuments: dto.linkedDocuments as Prisma.InputJsonValue,
      }),
      ...(dto.status !== undefined && { status: dto.status as any }),
      ...(dto.notes !== undefined && { notes: dto.notes }),
    };
  }

  private sessionData(
    dto: CreateContractorSessionDto | UpdateContractorSessionDto,
    _partial = false,
  ) {
    const totalAmount =
      dto.totalAmount ??
      (dto.durationHours !== undefined && dto.agreedRate !== undefined
        ? dto.durationHours * dto.agreedRate
        : undefined);
    return {
      ...(dto.sessionDate !== undefined && { sessionDate: new Date(dto.sessionDate) }),
      ...(dto.serviceType !== undefined && { serviceType: dto.serviceType as any }),
      ...(dto.clientAttendance !== undefined && {
        clientAttendance: dto.clientAttendance as Prisma.InputJsonValue,
      }),
      ...(dto.durationHours !== undefined && { durationHours: dto.durationHours }),
      ...(dto.agreedRate !== undefined && { agreedRate: dto.agreedRate }),
      ...(totalAmount !== undefined && { totalAmount }),
      ...(dto.notes !== undefined && { notes: dto.notes }),
      ...(dto.linkedPvId !== undefined && { linkedPvId: dto.linkedPvId }),
      ...(dto.linkedReceiptId !== undefined && {
        linkedReceiptId: dto.linkedReceiptId,
      }),
      ...(dto.paymentStatus !== undefined && {
        paymentStatus: dto.paymentStatus as any,
      }),
      ...(dto.paidDate !== undefined && {
        paidDate: dto.paidDate ? new Date(dto.paidDate) : null,
      }),
    };
  }
}
