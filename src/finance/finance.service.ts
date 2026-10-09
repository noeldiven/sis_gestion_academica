import {
  BadGatewayException,
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { ConfigService } from '@nestjs/config';
import {
  FinancialObligationStatus,
  FinancialObligationType,
  PaymentMethod,
  PaymentStatus,
} from '../generated/prisma/enums.js';

@Injectable()
export class FinanceService implements OnModuleInit, OnModuleDestroy {
  private overdueInterval?: NodeJS.Timeout;

  constructor(private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

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

async createGatewayCheckout(dto: {
  financialObligationId: number;
  amount: number;
}) {
    const apiUrl = this.configService
      .get<string>('MOCKPAY_API_URL');

    const secretKey = this.configService
      .get<string>('MOCKPAY_SECRET_KEY');

    const currency = this.configService
      .get<string>('MOCKPAY_CURRENCY') ?? 'USD';

    if (!apiUrl || !secretKey) {
      throw new BadGatewayException(
        'MockPay no está configurado en el servidor',
      );
    }

    const payment = await this.createPayment({
      financialObligationId: dto.financialObligationId,
      amount: dto.amount,
      method: PaymentMethod.GATEWAY,
    });

    try {
      const response = await fetch(
        `${apiUrl.replace(/\/$/, '')}/api/v1/payments`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${secretKey}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            amount: dto.amount,
            currency,
            metadata: {
              order_id: String(payment.id),
            },
          }),
        },
      );

      if (!response.ok) {
        throw new Error(
          `MockPay respondió con HTTP ${response.status}`,
        );
      }

      const result: unknown = await response.json();

      if (
        typeof result !== 'object' ||
        result === null ||
        !('id_transaccion' in result) ||
        !('checkout_url' in result) ||
        typeof result.id_transaccion !== 'string' ||
        typeof result.checkout_url !== 'string'
      ) {
        throw new Error(
          'La respuesta de MockPay no tiene el formato esperado',
        );
      }

      const checkoutUrl = new URL(result.checkout_url);

      if (checkoutUrl.protocol !== 'https:' &&
          checkoutUrl.protocol !== 'http:') {
        throw new Error('La URL de checkout no es válida');
      }

      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          mockPayTransactionId: result.id_transaccion,
        },
      });

      return {
        paymentId: payment.id,
        status: payment.status,
        transactionId: result.id_transaccion,
        checkoutUrl: result.checkout_url,
        currency,
        amount: dto.amount,
        message: 'Checkout creado correctamente',
      };
    } catch {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.REJECTED,
          verifiedAt: new Date(),
        },
      });

      throw new BadGatewayException(
        'No se pudo iniciar el checkout con MockPay. Intenta nuevamente.',
      );
    }
  }
  
async processMockPayWebhook(body: {
  event: 'payment.succeeded' | 'payment.failed';
  id: string;
  amount: number;
  currency: string;
  status: 'SUCCEEDED' | 'FAILED';
  failure_reason?: string | null;
  metadata: {
    order_id: string;
  };
}) {
  const apiUrl = this.configService.get<string>(
    'MOCKPAY_API_URL',
  );
  const secretKey = this.configService.get<string>(
    'MOCKPAY_SECRET_KEY',
  );
  const currency = this.configService.get<string>(
    'MOCKPAY_CURRENCY',
  ) ?? 'USD';

  if (!apiUrl || !secretKey) {
    throw new BadGatewayException(
      'MockPay no está configurado',
    );
  }

  // Consultar la transacción directamente a MockPay.
  const response = await fetch(
    `${apiUrl.replace(/\/$/, '')}/api/v1/payments/${encodeURIComponent(body.id)}`,
    {
      headers: {
        Authorization: `Bearer ${secretKey}`,
        Accept: 'application/json',
      },
    },
  );

  if (!response.ok) {
    throw new BadGatewayException(
      'No se pudo verificar la transacción en MockPay',
    );
  }

  const result: unknown = await response.json();

  if (
    typeof result !== 'object' ||
    result === null ||
    !('id' in result) ||
    !('status' in result) ||
    !('amount' in result) ||
    !('currency' in result) ||
    !('metadata' in result)
  ) {
    throw new BadGatewayException(
      'Respuesta de verificación de MockPay inválida',
    );
  }

  const transaction = result as {
    id: string;
    status: string;
    amount: number;
    currency: string;
    metadata: { order_id?: string };
  };

  // Comprobar que la notificación coincide con la transacción real.
  if (
    transaction.id !== body.id ||
    transaction.metadata?.order_id !== body.metadata.order_id ||
    String(transaction.amount) !== String(body.amount) ||
    transaction.currency !== body.currency ||
    transaction.currency !== currency ||
    transaction.status !== body.status
  ) {
    throw new BadRequestException(
      'Los datos de la notificación no coinciden con MockPay',
    );
  }

  const succeeded =
    body.event === 'payment.succeeded' &&
    body.status === 'SUCCEEDED';

  const failed =
    body.event === 'payment.failed' &&
    body.status === 'FAILED';

  if (!succeeded && !failed) {
    throw new BadRequestException(
      'El evento y el estado del pago no coinciden',
    );
  }

  const paymentId = Number(body.metadata.order_id);

  if (!Number.isSafeInteger(paymentId) || paymentId <= 0) {
    throw new BadRequestException(
      'El ID del pago de SGAF no es válido',
    );
  }

  return this.prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({
      where: { id: paymentId },
      include: {
        financialObligation: {
          include: { payments: true },
        },
      },
    });

    if (
      !payment ||
      payment.mockPayTransactionId !== body.id ||
      payment.method !== PaymentMethod.GATEWAY ||
      Number(payment.amount) !== Number(body.amount)
    ) {
      throw new BadRequestException(
        'La transacción no corresponde al pago de SGAF',
      );
    }

    const targetStatus = succeeded
      ? PaymentStatus.APPROVED
      : PaymentStatus.REJECTED;

    // Los reintentos de un webhook no deben duplicar el procesamiento.
    if (payment.status === targetStatus) {
      return {
        received: true,
        alreadyProcessed: true,
        paymentId,
        status: payment.status,
      };
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException(
        'El pago ya fue procesado con otro resultado',
      );
    }

    await tx.payment.update({
      where: { id: paymentId },
      data: {
        status: targetStatus,
        verifiedAt: new Date(),
      },
    });

    if (succeeded) {
      const approvedTotal = payment.financialObligation.payments
        .filter((item) => item.status === PaymentStatus.APPROVED)
        .reduce(
          (total, item) => total + Number(item.amount),
          0,
        ) + Number(payment.amount);

      if (
        approvedTotal >=
        Number(payment.financialObligation.amount)
      ) {
        await tx.financialObligation.update({
          where: {
            id: payment.financialObligationId,
          },
          data: {
            status: FinancialObligationStatus.PAID,
          },
        });
      }
    }

    return {
      received: true,
      alreadyProcessed: false,
      paymentId,
      status: targetStatus,
    };
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