import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async hrDashboard() {
    const now = new Date();
    const renewalCutoff = addDays(now, 60);
    const probationCutoff = addDays(now, 30);
    const evaluationCutoff = addDays(now, 30);
    const weekStart = startOfWeek(now);
    const weekEnd = addDays(weekStart, 7);

    const [
      certifications,
      foreignCompliance,
      annualCompliance,
      evaluationsDue,
      probationaryEndings,
      contractorPaymentsPending,
      rostersThisWeek,
      missingDocuments,
    ] = await Promise.all([
      this.prisma.certification.findMany({
        where: { expiryDate: { not: null, gte: now, lte: renewalCutoff } },
        include: { employee: { include: { department: true, position: true } } },
        orderBy: { expiryDate: 'asc' },
      }),
      this.prisma.foreignEmployeeCompliance.findMany({
        where: {
          OR: [
            { passportExpiry: { not: null, gte: now, lte: renewalCutoff } },
            { visaExpiry: { not: null, gte: now, lte: renewalCutoff } },
            { workPermitExpiry: { not: null, gte: now, lte: renewalCutoff } },
          ],
        },
        include: { employee: { include: { department: true, position: true } } },
      }),
      this.prisma.annualComplianceItem.findMany({
        where: {
          OR: [
            { coverageEnd: { not: null, gte: now, lte: renewalCutoff } },
            { scheduledAt: { not: null, gte: now, lte: renewalCutoff } },
          ],
          NOT: { status: 'COMPLETED' },
        },
        include: { employee: { include: { department: true, position: true } } },
      }),
      this.prisma.performanceEvaluation.findMany({
        where: {
          periodEnd: { lte: evaluationCutoff },
          NOT: { status: { in: ['SIGNED_OFF', 'ARCHIVED'] as any } },
        },
        include: { employee: { include: { department: true, position: true } } },
        orderBy: { periodEnd: 'asc' },
      }),
      this.prisma.employee.findMany({
        where: {
          probationEndDate: { not: null, gte: now, lte: probationCutoff },
          employmentStatus: { in: ['PROBATION', 'ACTIVE'] as any },
        },
        include: { department: true, position: true },
        orderBy: { probationEndDate: 'asc' },
      }),
      this.prisma.contractorSession.findMany({
        where: { paymentStatus: 'PENDING' },
        include: { contractor: true },
        orderBy: { sessionDate: 'asc' },
      }),
      this.prisma.roster.findMany({
        where: {
          periodStart: { lte: weekEnd },
          periodEnd: { gte: weekStart },
        },
        include: { department: true, authoredByHod: true, _count: { select: { entries: true } } },
        orderBy: { department: { code: 'asc' } },
      }),
      this.prisma.documentChecklistItem.findMany({
        where: { status: { in: ['MISSING', 'STALE'] as any } },
        include: { employee: { include: { department: true, position: true } } },
        orderBy: [{ status: 'asc' }, { documentName: 'asc' }],
      }),
    ]);

    return {
      generatedAt: now.toISOString(),
      renewalsQueue: {
        withinDays: 60,
        certifications,
        foreignCompliance,
        annualCompliance,
      },
      evaluationsDue,
      probationaryEndings,
      contractorPaymentsPending,
      rosterStatusByDepartment: rostersThisWeek,
      openOnboardingOffboarding: {
        missingDocuments,
      },
      counts: {
        renewals:
          certifications.length + foreignCompliance.length + annualCompliance.length,
        evaluationsDue: evaluationsDue.length,
        probationaryEndings: probationaryEndings.length,
        contractorPaymentsPending: contractorPaymentsPending.length,
        rostersThisWeek: rostersThisWeek.length,
        missingDocuments: missingDocuments.length,
      },
    };
  }
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function startOfWeek(date: Date) {
  const start = new Date(date);
  const day = start.getDay();
  const diff = start.getDate() - day + (day === 0 ? -6 : 1);
  start.setDate(diff);
  start.setHours(0, 0, 0, 0);
  return start;
}
