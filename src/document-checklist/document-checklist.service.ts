import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateDocumentChecklistItemDto,
  UpdateDocumentChecklistItemDto,
} from './dto/create-document-checklist-item.dto';

@Injectable()
export class DocumentChecklistService {
  constructor(private readonly prisma: PrismaService) {}

  list(employeeId?: string, status?: string) {
    return this.prisma.documentChecklistItem.findMany({
      where: {
        ...(employeeId && { employeeId }),
        ...(status && { status: status as any }),
      },
      include: { employee: { include: { department: true, position: true } } },
      orderBy: [{ status: 'asc' }, { documentName: 'asc' }],
    });
  }

  create(dto: CreateDocumentChecklistItemDto) {
    return this.prisma.documentChecklistItem.create({
      data: this.data(dto) as Prisma.DocumentChecklistItemUncheckedCreateInput,
      include: { employee: true },
    });
  }

  async update(id: string, dto: UpdateDocumentChecklistItemDto) {
    const item = await this.prisma.documentChecklistItem.findUnique({
      where: { id },
    });
    if (!item) throw new NotFoundException(`Document checklist item ${id} not found`);
    return this.prisma.documentChecklistItem.update({
      where: { id },
      data: this.data(dto, true),
      include: { employee: true },
    });
  }

  completion(employeeId: string) {
    return this.prisma.documentChecklistItem
      .groupBy({
        by: ['status'],
        where: { employeeId },
        _count: true,
      })
      .then((rows) => {
        const total = rows.reduce((sum, row) => sum + row._count, 0);
        const complete = rows
          .filter((row) => row.status === 'ON_FILE' || row.status === 'WAIVED')
          .reduce((sum, row) => sum + row._count, 0);
        return { employeeId, total, complete, byStatus: rows };
      });
  }

  private data(
    dto: CreateDocumentChecklistItemDto | UpdateDocumentChecklistItemDto,
    partial = false,
  ) {
    return {
      ...(!partial && { employeeId: (dto as CreateDocumentChecklistItemDto).employeeId }),
      ...(dto.documentName !== undefined && { documentName: dto.documentName }),
      ...(dto.category !== undefined && { category: dto.category }),
      ...(dto.requiredFor !== undefined && { requiredFor: dto.requiredFor }),
      ...(dto.documentId !== undefined && { documentId: dto.documentId }),
      ...(dto.status !== undefined && { status: dto.status as any }),
      ...(dto.dueDate !== undefined && {
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      }),
      ...(dto.expiryDate !== undefined && {
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
      }),
      ...(dto.notes !== undefined && { notes: dto.notes }),
    };
  }
}
