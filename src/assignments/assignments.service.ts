import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateAssignmentDto } from './dto/create-assignment.dto.js';

@Injectable()
export class AssignmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.assignment.findMany({
      orderBy: {
        dueDate: 'asc',
      },
      include: {
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
          },
        },
        submissions: true,
      },
    });
  }

  async findOne(id: number) {
    const assignment =
      await this.prisma.assignment.findUnique({
        where: { id },
        include: {
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
            },
          },
          submissions: {
            include: {
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
          },
        },
      });

    if (!assignment) {
      throw new NotFoundException(
        'Tarea no encontrada',
      );
    }

    return assignment;
  }

  async create(
    dto: CreateAssignmentDto,
    userId: number,
  ) {
    const teacher = await this.prisma.teacher.findUnique({
      where: {
        userId,
      },
    });

    if (!teacher) {
      throw new ForbiddenException(
        'El usuario no tiene perfil de profesor',
      );
    }

    const group = await this.prisma.group.findUnique({
      where: {
        id: dto.groupId,
      },
      include: {
        teacher: true,
      },
    });

    if (!group) {
      throw new NotFoundException(
        'Grupo no encontrado',
      );
    }

    if (group.teacherId !== teacher.id) {
      throw new ForbiddenException(
        'El profesor no pertenece a este grupo',
      );
    }

    if (group.status !== 'OPEN') {
      throw new BadRequestException(
        'El grupo no está abierto',
      );
    }

    const dueDate = new Date(dto.dueDate);

    if (dueDate <= new Date()) {
      throw new BadRequestException(
        'La fecha de entrega debe ser futura',
      );
    }

    return this.prisma.assignment.create({
      data: {
        groupId: dto.groupId,
        title: dto.title,
        description: dto.description,
        dueDate,
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
  }
}