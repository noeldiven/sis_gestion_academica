import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  FinancialObligationStatus,
  FinancialObligationType,
  PaymentMethod,
  PaymentStatus,
} from '../generated/prisma/enums.js';

@Injectable()
export class FinanceService implements OnModuleInit, OnModuleDestroy {
  private overdueInterval?: NodeJS.Timeout;

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.processOverdueObligations();

    this.overdueInterval = setInterval(
      () => {
        void this.processOverdueObligations();
      },
      60 * 60 * 1000,
    );
  }

  onModuleDestroy() {
    if (this.overdueInterval) {
      clearInterval(this.overdueInterval);
    }
  }

  async createObligation(dto: {
    studentId: number;
    academicPeriodId: number;
    type: FinancialObligationType;
    description: string;
    amount: number;
    dueDate: string;
  }) {
    const student = await this.prisma.student.findUnique({
      where: {
        id: dto.studentId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            status: true,
            roleId: true,
          },
        },
      },
    });

    if (!student) {
      throw new NotFoundException(
        'El estudiante no existe',
      );
    }

    const academicPeriod =
      await this.prisma.academicPeriod.findUnique({
        where: {
          id: dto.academicPeriodId,
        },
      });

    if (!academicPeriod) {
      throw new NotFoundException(
        'El período académico no existe',
      );
    }

    if (dto.amount <= 0) {
      throw new BadRequestException(
        'El monto debe ser mayor que cero',
      );
    }

    return this.prisma.financialObligation.create({
      data: {
        studentId: dto.studentId,
        academicPeriodId: dto.academicPeriodId,
        type: dto.type,
        description: dto.description,
        amount: dto.amount,
        dueDate: new Date(dto.dueDate),
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                status: true,
                roleId: true,
              },
            },
          },
        },
        academicPeriod: true,
        payments: true,
      },
    });
  }

  async findAllObligations() {
    return this.prisma.financialObligation.findMany({
      include: {
        student: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                status: true,
                roleId: true,
                role: true,
              },
            },
          },
        },
        academicPeriod: true,
        payments: true,
      },
      orderBy: {
        dueDate: 'asc',
      },
    });
  }

  async findObligation(id: number) {
    const obligation =
      await this.prisma.financialObligation.findUnique({
        where: {
          id,
        },
        include: {
          student: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  status: true,
                  roleId: true,
                  role: true,
                },
              },
            },
          },
          academicPeriod: true,
          payments: {
            orderBy: {
              createdAt: 'asc',
            },
          },
        },
      });

    if (!obligation) {
      throw new NotFoundException(
        'La obligación financiera no existe',
      );
    }

    return obligation;
  }

  async createPayment(dto: {
    financialObligationId: number;
    amount: number;
    method: PaymentMethod;
  }) {
    const obligation =
      await this.prisma.financialObligation.findUnique({
        where: {
          id: dto.financialObligationId,
        },
        include: {
          payments: true,
        },
      });

    if (!obligation) {
      throw new NotFoundException(
        'La obligación financiera no existe',
      );
    }

    if (
      obligation.status ===
      FinancialObligationStatus.PAID
    ) {
      throw new ConflictException(
        'La obligación ya está completamente pagada',
      );
    }

    if (
      obligation.status ===
      FinancialObligationStatus.CANCELLED
    ) {
      throw new ConflictException(
        'La obligación está cancelada',
      );
    }

    const approvedPayments = obligation.payments
      .filter(
        (payment) =>
          payment.status === PaymentStatus.APPROVED,
      )
      .reduce(
        (total, payment) =>
          total + Number(payment.amount),
        0,
      );

    const pendingPayments = obligation.payments
      .filter(
        (payment) =>
          payment.status === PaymentStatus.PENDING,
      )
      .reduce(
        (total, payment) =>
          total + Number(payment.amount),
        0,
      );

    const remainingAmount =
      Number(obligation.amount) -
      approvedPayments -
      pendingPayments;

    if (dto.amount > remainingAmount) {
      throw new BadRequestException(
        `El monto máximo pendiente es ${remainingAmount.toFixed(2)}`,
      );
    }

    return this.prisma.payment.create({
      data: {
        financialObligationId:
          dto.financialObligationId,
        amount: dto.amount,
        method: dto.method,
        status: PaymentStatus.PENDING,
      },
      include: {
        financialObligation: {
          include: {
            student: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    status: true,
                    roleId: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async findAllPayments() {
    return this.prisma.payment.findMany({
      include: {
        financialObligation: {
          include: {
            student: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    status: true,
                    roleId: true,
                    role: true,
                  },
                },
              },
            },
            academicPeriod: true,
          },
        },
        verifiedBy: {
          select: {
            id: true,
            email: true,
            status: true,
            roleId: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async approvePayment(
    paymentId: number,
    verifierId: number,
  ) {
    const payment = await this.prisma.payment.findUnique({
      where: {
        id: paymentId,
      },
      include: {
        financialObligation: {
          include: {
            payments: true,
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException(
        'El pago no existe',
      );
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new ConflictException(
        'El pago ya fue procesado',
      );
    }

    const updatedPayment =
      await this.prisma.payment.update({
        where: {
          id: paymentId,
        },
        data: {
          status: PaymentStatus.APPROVED,
          verifiedById: verifierId,
          verifiedAt: new Date(),
        },
        include: {
          financialObligation: {
            include: {
              payments: true,
              student: {
                include: {
                  user: {
                    select: {
                      id: true,
                      email: true,
                      status: true,
                      roleId: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

    const approvedTotal =
      updatedPayment.financialObligation.payments
        .filter(
          (item) =>
            item.status === PaymentStatus.APPROVED,
        )
        .reduce(
          (total, item) =>
            total + Number(item.amount),
          0,
        );

    if (
      approvedTotal >=
      Number(
        updatedPayment.financialObligation.amount,
      )
    ) {
      await this.prisma.financialObligation.update({
        where: {
          id:
            updatedPayment.financialObligationId,
        },
        data: {
          status: FinancialObligationStatus.PAID,
        },
      });
    }

    return this.prisma.payment.findUnique({
      where: {
        id: paymentId,
      },
      include: {
        financialObligation: {
          include: {
            student: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    status: true,
                    roleId: true,
                  },
                },
              },
            },
            payments: true,
          },
        },
        verifiedBy: {
          select: {
            id: true,
            email: true,
            status: true,
            roleId: true,
            role: true,
          },
        },
      },
    });
  }

  async rejectPayment(
    paymentId: number,
    verifierId: number,
  ) {
    const payment = await this.prisma.payment.findUnique({
      where: {
        id: paymentId,
      },
    });

    if (!payment) {
      throw new NotFoundException(
        'El pago no existe',
      );
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new ConflictException(
        'El pago ya fue procesado',
      );
    }

    return this.prisma.payment.update({
      where: {
        id: paymentId,
      },
      data: {
        status: PaymentStatus.REJECTED,
        verifiedById: verifierId,
        verifiedAt: new Date(),
      },
      include: {
        financialObligation: true,
        verifiedBy: {
          select: {
            id: true,
            email: true,
            status: true,
            roleId: true,
            role: true,
          },
        },
      },
    });
  }

  async processOverdueObligations() {
    const now = new Date();

    const overdueObligations =
      await this.prisma.financialObligation.findMany({
        where: {
          status: FinancialObligationStatus.PENDING,
          dueDate: {
            lt: now,
          },
        },
        include: {
          student: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  status: true,
                  roleId: true,
                },
              },
            },
          },
        },
      });

    let processed = 0;

    for (const obligation of overdueObligations) {
      await this.prisma.financialObligation.update({
        where: {
          id: obligation.id,
        },
        data: {
          status: FinancialObligationStatus.OVERDUE,
        },
      });

      if (
        obligation.student.user.status !==
        'SUSPENDED'
      ) {
        await this.prisma.user.update({
          where: {
            id: obligation.student.user.id,
          },
          data: {
            status: 'SUSPENDED',
          },
        });
      }

      processed++;
    }

    return {
      processed,
      message:
        processed > 0
          ? `${processed} obligación(es) vencida(s) procesada(s)`
          : 'No hay obligaciones vencidas pendientes',
    };
  }

  async checkStudentFinancialStatus(
    studentId: number,
  ) {
    const student = await this.prisma.student.findUnique({
      where: {
        id: studentId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            status: true,
            roleId: true,
            role: true,
          },
        },
      },
    });

    if (!student) {
      throw new NotFoundException(
        'El estudiante no existe',
      );
    }

    const obligations =
      await this.prisma.financialObligation.findMany({
        where: {
          studentId,
        },
        include: {
          payments: true,
        },
        orderBy: {
          dueDate: 'asc',
        },
      });

    const pending = obligations.filter(
      (obligation) =>
        obligation.status ===
        FinancialObligationStatus.PENDING,
    );

    const overdue = obligations.filter(
      (obligation) =>
        obligation.status ===
        FinancialObligationStatus.OVERDUE,
    );

    const paid = obligations.filter(
      (obligation) =>
        obligation.status ===
        FinancialObligationStatus.PAID,
    );

    return {
      studentId,
      userStatus: student.user.status,
      hasDebt:
        pending.length > 0 ||
        overdue.length > 0,
      suspended:
        student.user.status === 'SUSPENDED',
      pendingObligations: pending,
      overdueObligations: overdue,
      paidObligations: paid,
    };
  }
}