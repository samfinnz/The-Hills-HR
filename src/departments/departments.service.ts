import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DepartmentsService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.department.findMany({
      orderBy: { code: 'asc' },
      include: { _count: { select: { employees: true, positions: true } } },
    });
  }

  async get(id: string) {
    const dept = await this.prisma.department.findUnique({
      where: { id },
      include: { positions: true, employees: true },
    });
    if (!dept) throw new NotFoundException(`Department ${id} not found`);
    return dept;
  }
}
