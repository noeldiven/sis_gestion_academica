import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateGroupDto } from './dto/create-group.dto.js';

@Injectable()
export class GroupsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.group.findMany({
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
      orderBy: {
        id: 'asc',
      },
    });
  }

  async findOne(id: number) {
    const group = await this.prisma.group.findUnique({
      where: { id },
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
    });

    if (!group) {
      throw new NotFoundException(
        'Grupo académico no encontrado',
      );
    }

    return group;
  }

  async create(dto: CreateGroupDto) {
    const courseOffering =
      await this.prisma.courseOffering.findUnique({
        where: {
          id: dto.courseOfferingId,
        },
        include: {
          subject: true,
          academicPeriod: true,
        },
      });

    if (!courseOffering) {
      throw new NotFoundException(
        'La apertura de curso no existe',
      );
    }

    if (courseOffering.status !== 'OPEN') {
      throw new ConflictException(
        'La apertura de curso está cerrada',
      );
    }

    const teacher = await this.prisma.teacher.findUnique({
        where: {
            id: dto.teacherId,
        },
        include: {
            user: {
                include: {
                    role: true,
                },
           },
        },
    });

    if (!teacher) {
      throw new NotFoundException(
        'El profesor no existe',
      );
    }

    if (teacher.user.role.name !== 'PROFESOR') {
      throw new ConflictException(
        'El usuario asignado no tiene el rol PROFESOR',
      );
    }

    if (teacher.user.status !== 'ACTIVE') {
      throw new ConflictException(
        'El profesor no está activo',
      );
    }

    const existingGroup =
      await this.prisma.group.findUnique({
        where: {
          courseOfferingId_name: {
            courseOfferingId: dto.courseOfferingId,
            name: dto.name,
          },
        },
      });

    if (existingGroup) {
      throw new ConflictException(
        'Ya existe un grupo con ese nombre para esta asignatura',
      );
    }

    return this.prisma.group.create({
      data: {
        courseOfferingId: dto.courseOfferingId,
        teacherId: dto.teacherId,
        name: dto.name,
        classroom: dto.classroom,
        capacity: dto.capacity,
        status: 'OPEN',
      },
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
    });
  }

  async close(id: number) {
    await this.findOne(id);

    return this.prisma.group.update({
      where: {
        id,
      },
      data: {
        status: 'CLOSED',
      },
    });
  }
}