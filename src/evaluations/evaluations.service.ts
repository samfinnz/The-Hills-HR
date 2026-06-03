import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateEvaluationDto,
  UpdateEvaluationDto,
} from './dto/create-evaluation.dto';

export interface ListEvaluationsOptions {
  employeeId?: string;
  status?: string;
  dueBefore?: string;
}

@Injectable()
export class EvaluationsService {
  constructor(private readonly prisma: PrismaService) {}

  list(opts: ListEvaluationsOptions = {}) {
    const where: Prisma.PerformanceEvaluationWhereInput = {};
    if (opts.employeeId) where.employeeId = opts.employeeId;
    if (opts.status) where.status = opts.status as any;
    if (opts.dueBefore) {
      where.periodEnd = { lte: new Date(opts.dueBefore) };
      where.NOT = { status: { in: ['SIGNED_OFF', 'ARCHIVED'] as any } };
    }

    return this.prisma.performanceEvaluation.findMany({
      where,
      include: {
        employee: { include: { department: true, position: true } },
        evaluator: true,
        hrOwner: true,
      },
      orderBy: [{ periodEnd: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async get(id: string) {
    const evaluation = await this.prisma.performanceEvaluation.findUnique({
      where: { id },
      include: {
        employee: { include: { department: true, position: true } },
        evaluator: true,
        hrOwner: true,
      },
    });
    if (!evaluation) throw new NotFoundException(`Evaluation ${id} not found`);
    return evaluation;
  }

  create(dto: CreateEvaluationDto) {
    this.assertScoreSet(dto);
    return this.prisma.performanceEvaluation.create({
      data: this.data(dto) as Prisma.PerformanceEvaluationUncheckedCreateInput,
      include: {
        employee: { include: { department: true, position: true } },
        evaluator: true,
        hrOwner: true,
      },
    });
  }

  async update(id: string, dto: UpdateEvaluationDto) {
    await this.get(id);
    this.assertScoreSet(dto, true);
    return this.prisma.performanceEvaluation.update({
      where: { id },
      data: this.data(dto, true),
      include: {
        employee: { include: { department: true, position: true } },
        evaluator: true,
        hrOwner: true,
      },
    });
  }

  due(days = 30) {
    const dueBefore = new Date();
    dueBefore.setDate(dueBefore.getDate() + days);
    return this.list({ dueBefore: dueBefore.toISOString() });
  }

  private data(dto: CreateEvaluationDto | UpdateEvaluationDto, partial = false) {
    const weightingSet = dto.weightingSet ?? 'STAFF';
    const weightedTotal = this.weightedTotal(dto, weightingSet);
    const data = {
      ...(!partial && { employeeId: dto.employeeId }),
      ...(dto.periodStart !== undefined && { periodStart: new Date(dto.periodStart) }),
      ...(dto.periodEnd !== undefined && { periodEnd: new Date(dto.periodEnd) }),
      ...(dto.evaluatorId !== undefined && { evaluatorId: dto.evaluatorId }),
      ...(dto.hrOwnerId !== undefined && { hrOwnerId: dto.hrOwnerId }),
      ...(dto.scheduledMeetingAt !== undefined && {
        scheduledMeetingAt: dto.scheduledMeetingAt
          ? new Date(dto.scheduledMeetingAt)
          : null,
      }),
      ...(dto.actualMeetingAt !== undefined && {
        actualMeetingAt: dto.actualMeetingAt ? new Date(dto.actualMeetingAt) : null,
      }),
      ...(dto.status !== undefined && { status: dto.status as any }),
      ...(dto.overallRating !== undefined && { overallRating: dto.overallRating as any }),
      ...(dto.weightingSet !== undefined && { weightingSet: dto.weightingSet as any }),
      ...(dto.kpiScore !== undefined && { kpiScore: dto.kpiScore }),
      ...(dto.coreCompetencyScore !== undefined && {
        coreCompetencyScore: dto.coreCompetencyScore,
      }),
      ...(dto.functionalCompetencyScore !== undefined && {
        functionalCompetencyScore: dto.functionalCompetencyScore,
      }),
      ...(weightedTotal !== undefined && { weightedTotal }),
      ...(dto.strengths !== undefined && { strengths: dto.strengths }),
      ...(dto.areasForDevelopment !== undefined && {
        areasForDevelopment: dto.areasForDevelopment,
      }),
      ...(dto.goalsNextPeriod !== undefined && {
        goalsNextPeriod: dto.goalsNextPeriod as Prisma.InputJsonValue,
      }),
      ...(dto.employeeComments !== undefined && {
        employeeComments: dto.employeeComments,
      }),
      ...(dto.signedEvaluationDocumentId !== undefined && {
        signedEvaluationDocumentId: dto.signedEvaluationDocumentId,
      }),
      ...(dto.linkedActions !== undefined && {
        linkedActions: dto.linkedActions as Prisma.InputJsonValue,
      }),
    };
    return data;
  }

  private assertScoreSet(dto: CreateEvaluationDto | UpdateEvaluationDto, partial = false) {
    const hasAnyScore =
      dto.kpiScore !== undefined ||
      dto.coreCompetencyScore !== undefined ||
      dto.functionalCompetencyScore !== undefined;
    if (!hasAnyScore || partial) return;
    if (
      dto.kpiScore === undefined ||
      dto.coreCompetencyScore === undefined ||
      dto.functionalCompetencyScore === undefined
    ) {
      throw new BadRequestException(
        'KPI, core competency, and functional competency scores must be submitted together',
      );
    }
  }

  private weightedTotal(
    dto: CreateEvaluationDto | UpdateEvaluationDto,
    weightingSet: string,
  ) {
    if (
      dto.kpiScore === undefined ||
      dto.coreCompetencyScore === undefined ||
      dto.functionalCompetencyScore === undefined
    ) {
      return undefined;
    }
    const weights =
      weightingSet === 'MANAGER'
        ? { kpi: 0.5, core: 0.3, functional: 0.2 }
        : { kpi: 0.5, core: 0.2, functional: 0.3 };
    return (
      dto.kpiScore * weights.kpi +
      dto.coreCompetencyScore * weights.core +
      dto.functionalCompetencyScore * weights.functional
    );
  }
}
