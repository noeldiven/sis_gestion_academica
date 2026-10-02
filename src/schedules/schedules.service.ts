import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateScheduleDto } from './dto/create-schedule.dto.js';

@Injectable()
export class SchedulesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.schedule.findMany({
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
      },
      orderBy: [
        {
          dayOfWeek: 'asc',
        },
        {
          startTime: 'asc',
        },
      ],
    });
  }

  async findOne(id: number) {
    const schedule = await this.prisma.schedule.findUnique({
      where: {
        id,
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
      },
    });

    if (!schedule) {
      throw new NotFoundException(
        'Horario no encontrado',
      );
    }

    return schedule;
  }

  async create(dto: CreateScheduleDto) {
    const group = await this.prisma.group.findUnique({
      where: {
        id: dto.groupId,
      },
    });

    if (!group) {
      throw new NotFoundException(
        'El grupo no existe',
      );
    }

    if (group.status !== 'OPEN') {
      throw new ConflictException(
        'El grupo está cerrado',
      );
    }

    if (dto.startTime >= dto.endTime) {
      throw new ConflictException(
        'La hora de inicio debe ser anterior a la hora de fin',
      );
    }

    const existingSchedules =
      await this.prisma.schedule.findMany({
        where: {
          groupId: dto.groupId,
          dayOfWeek: dto.dayOfWeek,
        },
      });

    const newStart = this.toMinutes(dto.startTime);
    const newEnd = this.toMinutes(dto.endTime);

    const overlaps = existingSchedules.some((schedule) => {
      const existingStart = this.toMinutes(schedule.startTime);
      const existingEnd = this.toMinutes(schedule.endTime);

      return (
        newStart < existingEnd &&
        newEnd > existingStart
      );
    });

    if (overlaps) {
      throw new ConflictException(
        'El nuevo horario se cruza con otro horario del grupo',
      );
    }

    return this.prisma.schedule.create({
      data: {
        groupId: dto.groupId,
        dayOfWeek: dto.dayOfWeek,
        startTime: dto.startTime,
        endTime: dto.endTime,
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
          },
        },
      },
    });
  }

  private toMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);

    return hours * 60 + minutes;
  }
}