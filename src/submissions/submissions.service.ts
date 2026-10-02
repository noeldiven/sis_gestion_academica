import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateSubmissionDto } from './dto/create-submission.dto.js';

@Injectable()
export class SubmissionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.submission.findMany({
      orderBy: {
        submittedAt: 'desc',
      },
      include: {
        assignment: {
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
        },
        student: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  async create(
    dto: CreateSubmissionDto,
    userId: number,
  ) {
    const student = await this.prisma.student.findUnique({
      where: { userId },
      include: {
        user: true,
      },
    });

    if (!student) {
      throw new NotFoundException(
        'El estudiante no existe',
      );
    }

    if (student.user.status !== 'ACTIVE') {
      throw new ForbiddenException(
        'El estudiante no puede entregar tareas porque su cuenta está suspendida o inactiva',
      );
    }

    const assignment =
      await this.prisma.assignment.findUnique({
        where: {
          id: dto.assignmentId,
        },
        include: {
          group: true,
        },
      });

    if (!assignment) {
      throw new NotFoundException(
        'Tarea no encontrada',
      );
    }

    const enrollment =
      await this.prisma.enrollment.findFirst({
        where: {
          studentId: student.id,
          groupId: assignment.groupId,
          status: 'IN_PROGRESS',
        },
    });

    if (!enrollment) {
      throw new ForbiddenException(
        'El estudiante no está matriculado en este grupo',
      );
    }

    if (new Date() > assignment.dueDate) {
      throw new BadRequestException(
        'La fecha límite de entrega ha pasado',
      );
    }

    if (!dto.content && !dto.fileUrl) {
      throw new BadRequestException(
        'Debe proporcionar contenido o un archivo',
      );
    }

    const existing =
      await this.prisma.submission.findUnique({
        where: {
          assignmentId_studentId: {
            assignmentId: dto.assignmentId,
            studentId: student.id,
          },
        },
      });

    if (existing) {
      throw new ConflictException(
        'El estudiante ya entregó esta tarea',
      );
    }

    return this.prisma.submission.create({
      data: {
        assignmentId: dto.assignmentId,
        studentId: student.id,
        content: dto.content,
        fileUrl: dto.fileUrl,
      },
      include: {
        assignment: true,
        student: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }


  async grade(
    id: number,
    grade: number,
  ) {
    const submission =
      await this.prisma.submission.findUnique({
        where: { id },
      });

    if (!submission) {
      throw new NotFoundException(
        'Entrega no encontrada',
      );
    }

    if (grade < 0 || grade > 20) {
      throw new BadRequestException(
        'La nota debe estar entre 0 y 20',
      );
    }

    return this.prisma.submission.update({
      where: { id },
      data: {
        grade,
      },
    });
  }
}