import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PositionsService {
  constructor(private readonly prisma: PrismaService) {}

  list(departmentId?: string) {
    return this.prisma.position.findMany({
      where: departmentId ? { departmentId } : undefined,
      include: { department: true, _count: { select: { employees: true } } },
      orderBy: [{ department: { code: 'asc' } }, { code: 'asc' }],
    });
  }
}
