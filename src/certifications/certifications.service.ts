import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCertificationDto, UpdateCertificationDto } from './dto/create-certification.dto';

@Injectable()
export class CertificationsService {
  constructor(private readonly prisma: PrismaService) {}

  list(employeeId?: string) {
    return this.prisma.certification.findMany({
      where: employeeId ? { employeeId } : undefined,
      include: { employee: { include: { department: true } } },
      orderBy: { expiryDate: 'asc' },
    });
  }

  create(dto: CreateCertificationDto) {
    return this.prisma.certification.create({
      data: {
        employeeId: dto.employeeId,
        name: dto.name,
        nameTh: dto.nameTh,
        issuingAuthority: dto.issuingAuthority,
        certificateNumber: dto.certificateNumber,
        issueDate: dto.issueDate ? new Date(dto.issueDate) : null,
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
        isRequiredForRole: dto.isRequiredForRole ?? false,
      },
    });
  }

  async update(id: string, dto: UpdateCertificationDto) {
    const cert = await this.prisma.certification.findUnique({ where: { id } });
    if (!cert) throw new NotFoundException(`Certification ${id} not found`);
    return this.prisma.certification.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.nameTh !== undefined && { nameTh: dto.nameTh }),
        ...(dto.issuingAuthority !== undefined && { issuingAuthority: dto.issuingAuthority }),
        ...(dto.certificateNumber !== undefined && { certificateNumber: dto.certificateNumber }),
        ...(dto.issueDate !== undefined && { issueDate: dto.issueDate ? new Date(dto.issueDate) : null }),
        ...(dto.expiryDate !== undefined && { expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null }),
        ...(dto.isRequiredForRole !== undefined && { isRequiredForRole: dto.isRequiredForRole }),
      },
    });
  }

  async remove(id: string) {
    const cert = await this.prisma.certification.findUnique({ where: { id } });
    if (!cert) throw new NotFoundException(`Certification ${id} not found`);
    await this.prisma.certification.delete({ where: { id } });
    return { deleted: id };
  }
}
