import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

export interface ListEmployeesOptions {
  departmentId?: string;
  status?: string;
  search?: string;
}

@Injectable()
export class EmployeesService {
  constructor(private readonly prisma: PrismaService) {}

  list(opts: ListEmployeesOptions = {}) {
    const where: Prisma.EmployeeWhereInput = {};
    if (opts.departmentId) where.departmentId = opts.departmentId;
    if (opts.status) where.employmentStatus = opts.status as any;
    if (opts.search) {
      where.OR = [
        { firstName: { contains: opts.search, mode: 'insensitive' } },
        { lastName: { contains: opts.search, mode: 'insensitive' } },
        { nickname: { contains: opts.search, mode: 'insensitive' } },
        { firstNameTh: { contains: opts.search } },
        { lastNameTh: { contains: opts.search } },
        { email: { contains: opts.search, mode: 'insensitive' } },
      ];
    }
    return this.prisma.employee.findMany({
      where,
      include: {
        department: true,
        position: true,
        foreignCompliance: true,
        certifications: { orderBy: { expiryDate: 'asc' } },
      },
      orderBy: [{ isHod: 'desc' }, { lastName: 'asc' }, { firstName: 'asc' }],
    });
  }

  async get(id: string) {
    const e = await this.prisma.employee.findUnique({
      where: { id },
      include: {
        department: true,
        position: true,
        manager: true,
        reports: true,
        foreignCompliance: true,
        certifications: { orderBy: { expiryDate: 'asc' } },
      },
    });
    if (!e) throw new NotFoundException(`Employee ${id} not found`);
    return e;
  }

  async operationalView(opts: ListEmployeesOptions = {}) {
    const rows = await this.list(opts);
    return rows.map((e) => ({
      employeeId: e.id,
      displayName: this.displayName(e),
      role: e.position?.title ?? null,
      department: e.department
        ? { id: e.department.id, code: e.department.code, name: e.department.name }
        : null,
      status: e.employmentStatus,
      active: e.employmentStatus !== 'SEPARATED',
    }));
  }

  async hodTeamView(hodId: string) {
    await this.get(hodId);
    const rows = await this.prisma.employee.findMany({
      where: { managerId: hodId },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    });
    return rows.map((e) => ({
      employeeId: e.id,
      displayName: this.displayName(e),
      telephone: e.phone,
    }));
  }

  create(dto: CreateEmployeeDto) {
    return this.prisma.employee.create({
      data: {
        facilityId: dto.facilityId,
        firstName: dto.firstName,
        lastName: dto.lastName,
        firstNameTh: dto.firstNameTh,
        lastNameTh: dto.lastNameTh,
        nickname: dto.nickname,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
        nationality: dto.nationality,
        religion: dto.religion,
        pronouns: dto.pronouns,
        email: dto.email,
        phone: dto.phone,
        departmentId: dto.departmentId,
        positionId: dto.positionId,
        isHod: dto.isHod ?? false,
        managerId: dto.managerId,
        employmentTerm: dto.employmentTerm as any,
        employmentStatus: dto.employmentStatus as any,
        hireDate: dto.hireDate ? new Date(dto.hireDate) : null,
        probationEndDate: dto.probationEndDate
          ? new Date(dto.probationEndDate)
          : null,
        permanentSinceDate: dto.permanentSinceDate
          ? new Date(dto.permanentSinceDate)
          : null,
      },
    });
  }

  async update(id: string, dto: UpdateEmployeeDto) {
    await this.get(id);
    return this.prisma.employee.update({
      where: { id },
      data: {
        ...(dto.firstName !== undefined && { firstName: dto.firstName }),
        ...(dto.lastName !== undefined && { lastName: dto.lastName }),
        ...(dto.firstNameTh !== undefined && { firstNameTh: dto.firstNameTh }),
        ...(dto.lastNameTh !== undefined && { lastNameTh: dto.lastNameTh }),
        ...(dto.nickname !== undefined && { nickname: dto.nickname }),
        ...(dto.dateOfBirth !== undefined && { dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null }),
        ...(dto.nationality !== undefined && { nationality: dto.nationality }),
        ...(dto.religion !== undefined && { religion: dto.religion }),
        ...(dto.pronouns !== undefined && { pronouns: dto.pronouns }),
        ...(dto.email !== undefined && { email: dto.email }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.departmentId !== undefined && { departmentId: dto.departmentId }),
        ...(dto.positionId !== undefined && { positionId: dto.positionId }),
        ...(dto.isHod !== undefined && { isHod: dto.isHod }),
        ...(dto.managerId !== undefined && { managerId: dto.managerId }),
        ...(dto.employmentTerm !== undefined && { employmentTerm: dto.employmentTerm as any }),
        ...(dto.employmentStatus !== undefined && { employmentStatus: dto.employmentStatus as any }),
        ...(dto.hireDate !== undefined && { hireDate: dto.hireDate ? new Date(dto.hireDate) : null }),
        ...(dto.probationEndDate !== undefined && { probationEndDate: dto.probationEndDate ? new Date(dto.probationEndDate) : null }),
        ...(dto.permanentSinceDate !== undefined && { permanentSinceDate: dto.permanentSinceDate ? new Date(dto.permanentSinceDate) : null }),
        ...(dto.separationDate !== undefined && { separationDate: dto.separationDate ? new Date(dto.separationDate) : null }),
      },
      include: { department: true, position: true, foreignCompliance: true, certifications: true },
    });
  }

  /** All renewal-relevant docs expiring within `days` */
  async expiring(days = 60) {
    const now = new Date();
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() + days);

    const [certifications, compliance] = await Promise.all([
      this.prisma.certification.findMany({
        where: {
          expiryDate: { not: null, gte: now, lte: cutoff },
        },
        include: { employee: { include: { department: true } } },
        orderBy: { expiryDate: 'asc' },
      }),
      this.prisma.foreignEmployeeCompliance.findMany({
        where: {
          OR: [
            { passportExpiry: { not: null, gte: now, lte: cutoff } },
            { visaExpiry: { not: null, gte: now, lte: cutoff } },
            { workPermitExpiry: { not: null, gte: now, lte: cutoff } },
          ],
        },
        include: { employee: { include: { department: true } } },
      }),
    ]);

    return { withinDays: days, certifications, compliance };
  }

  stats() {
    return this.prisma.$transaction(async (tx) => {
      const total = await tx.employee.count();
      const byStatus = await tx.employee.groupBy({
        by: ['employmentStatus'],
        _count: true,
      });
      const byTerm = await tx.employee.groupBy({
        by: ['employmentTerm'],
        _count: true,
      });
      const byDept = await tx.employee.groupBy({
        by: ['departmentId'],
        _count: true,
      });
      return { total, byStatus, byTerm, byDept };
    });
  }

  private displayName(e: {
    firstName: string;
    lastName: string;
    nickname?: string | null;
  }) {
    const legalName = `${e.firstName} ${e.lastName}`.trim();
    return e.nickname ? `${legalName} (${e.nickname})` : legalName;
  }
}
