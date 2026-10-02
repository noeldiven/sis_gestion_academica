import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto.js';
import {
  EnrollmentResult,
  EnrollmentStatus,
} from '../generated/prisma/enums.js';

@Injectable()
export class EnrollmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.enrollment.findMany({
      orderBy: {
        id: 'asc',
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                status: true,
              },
            },
          },
        },
        group: {
          include: {
            courseOffering: {
              include: {
                subject: true,
                academicPeriod: true,
              },
            },
            teacher: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                  },
                },
              },
            },
            schedules: true,
          },
        },
      },
    });
  }

  async findOne(id: number) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id },
      include: {
        student: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                status: true,
              },
            },
          },
        },
        group: {
          include: {
            courseOffering: {
              include: {
                subject: true,
                academicPeriod: true,
              },
            },
            teacher: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                  },
                },
              },
            },
            schedules: true,
          },
        },
      },
    });

    if (!enrollment) {
      throw new NotFoundException('Matrícula no encontrada');
    }

    return enrollment;
  }

  async create(dto: CreateEnrollmentDto) {
    const student = await this.prisma.student.findUnique({
      where: {
        id: dto.studentId,
      },
      include: {
        user: true,
      },
    });

    if (!student) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    if (student.user.status !== 'ACTIVE') {
      throw new BadRequestException(
        'El estudiante debe estar ACTIVE para matricularse',
      );
    }

    const group = await this.prisma.group.findUnique({
      where: {
        id: dto.groupId,
      },
      include: {
        courseOffering: {
          include: {
            subject: true,
            academicPeriod: true,
          },
        },
        schedules: true,
        enrollments: {
          where: {
            status: EnrollmentStatus.IN_PROGRESS,
          },
        },
      },
    });

    if (!group) {
      throw new NotFoundException('Grupo no encontrado');
    }

    if (group.status !== 'OPEN') {
      throw new BadRequestException('El grupo no está abierto');
    }

    if (group.courseOffering.status !== 'OPEN') {
      throw new BadRequestException(
        'La oferta académica no está abierta',
      );
    }

    const academicPeriod = group.courseOffering.academicPeriod;

    if (academicPeriod.status !== 'ACTIVE') {
      throw new BadRequestException(
        'El período académico no está activo',
      );
    }

    const subject = group.courseOffering.subject;

    /*
     * 1. Verificar capacidad
     */
    if (group.enrollments.length >= group.capacity) {
      throw new ConflictException(
        'El grupo no tiene cupos disponibles',
      );
    }

    /*
     * 2. Buscar matrículas anteriores del mismo estudiante
     *    para la misma asignatura.
     */
    const previousEnrollments =
      await this.prisma.enrollment.findMany({
        where: {
          studentId: student.id,
          group: {
            courseOffering: {
              subjectId: subject.id,
            },
          },
        },
        include: {
          group: {
            include: {
              courseOffering: true,
            },
          },
        },
        orderBy: {
          enrolledAt: 'asc',
        },
      });

    /*
     * Si ya tiene una matrícula IN_PROGRESS de la misma
     * asignatura, no puede matricularse nuevamente.
     */
    const activePreviousEnrollment =
      previousEnrollments.find(
        (enrollment) =>
          enrollment.status === EnrollmentStatus.IN_PROGRESS,
      );

    if (activePreviousEnrollment) {
      throw new ConflictException(
        'El estudiante ya tiene una matrícula activa en esta asignatura',
      );
    }

    /*
     * Si ya aprobó la asignatura, no necesita volver a llevarla.
     */
    const passedEnrollment = previousEnrollments.find(
      (enrollment) =>
        enrollment.status === EnrollmentStatus.PASSED ||
        enrollment.result === EnrollmentResult.PASSED,
    );

    if (passedEnrollment) {
      throw new ConflictException(
        'El estudiante ya aprobó esta asignatura',
      );
    }

    /*
     * 3. No permitir dos matrículas de la misma asignatura
     *    dentro del mismo período.
     */
    const samePeriodEnrollment =
      previousEnrollments.find(
        (enrollment) =>
          enrollment.group.courseOffering.academicPeriodId ===
          academicPeriod.id,
      );

    if (samePeriodEnrollment) {
      throw new ConflictException(
        'El estudiante ya tiene una matrícula de esta asignatura en el período académico actual',
      );
    }

    /*
     * 4. Calcular créditos actuales del período.
     */
    const currentEnrollments =
      await this.prisma.enrollment.findMany({
        where: {
          studentId: student.id,
          group: {
            courseOffering: {
              academicPeriodId: academicPeriod.id,
            },
          },
          status: EnrollmentStatus.IN_PROGRESS,
        },
        include: {
          group: {
            include: {
              courseOffering: {
                include: {
                  subject: true,
                },
              },
            },
          },
        },
      });

    const currentCredits = currentEnrollments.reduce(
      (total, enrollment) =>
        total + enrollment.group.courseOffering.subject.credits,
      0,
    );

    const newTotalCredits =
      currentCredits + subject.credits;

    if (newTotalCredits > academicPeriod.maxCredits) {
      throw new BadRequestException(
        `La matrícula excede el máximo de ${academicPeriod.maxCredits} créditos del período`,
      );
    }

    /*
     * 5. Verificar conflictos de horario.
     */
    const currentEnrollmentIds =
      currentEnrollments.map(
        (enrollment) => enrollment.id,
      );

    if (currentEnrollmentIds.length > 0) {
      const currentSchedules =
        await this.prisma.schedule.findMany({
          where: {
            group: {
              enrollments: {
                some: {
                  id: {
                    in: currentEnrollmentIds,
                  },
                },
              },
            },
          },
        });

      for (const newSchedule of group.schedules) {
        const newStart = this.timeToMinutes(
          newSchedule.startTime,
        );

        const newEnd = this.timeToMinutes(
          newSchedule.endTime,
        );

        for (const existingSchedule of currentSchedules) {
          if (
            newSchedule.dayOfWeek ===
              existingSchedule.dayOfWeek &&
            newStart < this.timeToMinutes(
              existingSchedule.endTime,
            ) &&
            newEnd >
              this.timeToMinutes(
                existingSchedule.startTime,
              )
          ) {
            throw new ConflictException(
              `Existe conflicto de horario con otra matrícula: ${existingSchedule.startTime}-${existingSchedule.endTime}`,
            );
          }
        }
      }
    }

    /*
    * 6. Calcular número de intento.
    *
    * Se cuentan solamente las matrículas concluidas.
    */
    const concludedAttempts =
      previousEnrollments.filter((enrollment) => {
        return (
          enrollment.status === EnrollmentStatus.PASSED ||
          enrollment.status === EnrollmentStatus.FAILED ||
          enrollment.status === EnrollmentStatus.WITHDRAWN ||
          enrollment.status === EnrollmentStatus.CANCELLED
        );
      }).length;

    const attemptNumber = concludedAttempts + 1;

    /*
     * 7. Crear/reutilizar la tarifa del intento.
     *
     * regularFee se utiliza como precio por crédito.
     */
    const enrollmentFee =
      await this.prisma.enrollmentFee.upsert({
        where: {
          academicPeriodId_attemptNumber: {
            academicPeriodId: academicPeriod.id,
            attemptNumber,
          },
        },
        update: {},
        create: {
          academicPeriodId: academicPeriod.id,
          attemptNumber,
          pricePerCredit: academicPeriod.regularFee,
        },
      });

    /*
     * 8. Crear matrícula.
     */
    const enrollment =
      await this.prisma.enrollment.create({
        data: {
          studentId: student.id,
          groupId: group.id,
          status: EnrollmentStatus.IN_PROGRESS,
        },
        include: {
          student: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  status: true,
                },
              },
            },
          },
          group: {
            include: {
              courseOffering: {
                include: {
                  subject: true,
                  academicPeriod: true,
                },
              },
              schedules: true,
            },
          },
        },
      });

    return {
      enrollment,
      enrollmentFee,
      attemptNumber,
      credits: subject.credits,
      totalCreditsInPeriod: newTotalCredits,
      estimatedRecoveryCost: Number(
        enrollmentFee.pricePerCredit,
      ) * subject.credits,
    };
  }

  async updateResult(
    id: number,
    grade: number,
    result: EnrollmentResult,
  ) {
    const enrollment =
      await this.prisma.enrollment.findUnique({
        where: { id },
      });

    if (!enrollment) {
      throw new NotFoundException(
        'Matrícula no encontrada',
      );
    }

    if (
      enrollment.status !== EnrollmentStatus.IN_PROGRESS
    ) {
      throw new BadRequestException(
        'Solo se puede calificar una matrícula en progreso',
      );
    }

    const updated =
      await this.prisma.enrollment.update({
        where: { id },
        data: {
          grade,
          result,
          status:
            result === EnrollmentResult.PASSED
              ? EnrollmentStatus.PASSED
              : EnrollmentStatus.FAILED,
          completedAt: new Date(),
        },
      });

    return updated;
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time
      .split(':')
      .map(Number);

    return hours * 60 + minutes;
  }
}