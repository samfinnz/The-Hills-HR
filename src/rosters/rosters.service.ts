import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateRosterDto,
  CreateRosterEntryDto,
  UpdateRosterStatusDto,
} from './dto/create-roster.dto';

export interface ListRostersOptions {
  departmentId?: string;
  from?: string;
  to?: string;
  status?: string;
}

@Injectable()
export class RostersService {
  constructor(private readonly prisma: PrismaService) {}

  list(opts: ListRostersOptions = {}) {
    const where: Prisma.RosterWhereInput = {};
    if (opts.departmentId) where.departmentId = opts.departmentId;
    if (opts.status) where.status = opts.status as any;
    if (opts.from || opts.to) {
      where.periodEnd = opts.from ? { gte: new Date(opts.from) } : undefined;
      where.periodStart = opts.to ? { lte: new Date(opts.to) } : undefined;
    }

    return this.prisma.roster.findMany({
      where,
      include: {
        department: true,
        authoredByHod: { include: { position: true } },
        entries: { include: { employee: { include: { position: true } } } },
      },
      orderBy: [{ periodStart: 'desc' }, { department: { code: 'asc' } }],
    });
  }

  async get(id: string) {
    const roster = await this.prisma.roster.findUnique({
      where: { id },
      include: {
        department: true,
        authoredByHod: true,
        entries: {
          include: {
            employee: { include: { department: true, position: true } },
          },
          orderBy: [{ shiftDate: 'asc' }, { shiftStart: 'asc' }],
        },
      },
    });
    if (!roster) throw new NotFoundException(`Roster ${id} not found`);
    return roster;
  }

  create(dto: CreateRosterDto) {
    return this.prisma.roster.create({
      data: {
        facilityId: dto.facilityId,
        departmentId: dto.departmentId,
        periodStart: new Date(dto.periodStart),
        periodEnd: new Date(dto.periodEnd),
        authoredByHodId: dto.authoredByHodId,
        status: (dto.status as any) ?? 'DRAFT',
        notes: dto.notes,
        entries: dto.entries?.length
          ? { create: dto.entries.map((entry) => this.entryData(entry)) }
          : undefined,
      },
      include: { entries: true, department: true, authoredByHod: true },
    });
  }

  async updateStatus(id: string, dto: UpdateRosterStatusDto) {
    await this.get(id);
    return this.prisma.roster.update({
      where: { id },
      data: {
        status: dto.status as any,
        ...(dto.publishedAt !== undefined && {
          publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : null,
        }),
        ...(dto.exportedToHumanSoftAt !== undefined && {
          exportedToHumanSoftAt: dto.exportedToHumanSoftAt
            ? new Date(dto.exportedToHumanSoftAt)
            : null,
        }),
      },
      include: { entries: true, department: true },
    });
  }

  async addEntry(rosterId: string, dto: CreateRosterEntryDto) {
    await this.get(rosterId);
    return this.prisma.rosterEntry.create({
      data: { rosterId, ...this.entryData(dto) },
      include: { employee: { include: { department: true, position: true } } },
    });
  }

  async humanSoftCsv(id: string) {
    const roster = await this.get(id);
    const lines = [
      [
        'department_code',
        'employee_id',
        'employee_name',
        'shift_date',
        'shift_start',
        'shift_end',
        'shift_type',
        'area_assignment',
        'notes',
      ],
    ];

    for (const entry of roster.entries) {
      lines.push([
        roster.department.code,
        entry.employeeId,
        `${entry.employee.firstName} ${entry.employee.lastName}`,
        entry.shiftDate.toISOString().slice(0, 10),
        entry.shiftStart?.toISOString() ?? '',
        entry.shiftEnd?.toISOString() ?? '',
        entry.shiftType,
        entry.areaAssignment ?? '',
        entry.notes ?? '',
      ]);
    }

    await this.prisma.roster.update({
      where: { id },
      data: {
        status: 'EXPORTED_TO_HUMANSOFT',
        exportedToHumanSoftAt: new Date(),
      },
    });

    return lines.map((row) => row.map(csvCell).join(',')).join('\n');
  }

  private entryData(dto: CreateRosterEntryDto) {
    return {
      employeeId: dto.employeeId,
      shiftDate: new Date(dto.shiftDate),
      shiftStart: dto.shiftStart ? new Date(dto.shiftStart) : null,
      shiftEnd: dto.shiftEnd ? new Date(dto.shiftEnd) : null,
      shiftType: (dto.shiftType as any) ?? 'DAY',
      areaAssignment: dto.areaAssignment,
      notes: dto.notes,
    };
  }
}

function csvCell(value: string) {
  const escaped = value.replace(/"/g, '""');
  return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
}
