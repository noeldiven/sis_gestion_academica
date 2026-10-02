import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateCourseOfferingDto } from './dto/create-course-offering.dto.js';

@Injectable()
export class CourseOfferingsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.courseOffering.findMany({
      include: {
        subject: true,
        academicPeriod: true,
      },
      orderBy: {
        id: 'asc',
      },
    });
  }

  async findOne(id: number) {
    const offering = await this.prisma.courseOffering.findUnique({
      where: { id },
      include: {
        subject: true,
        academicPeriod: true,
      },
    });

    if (!offering) {
      throw new NotFoundException(
        'Apertura de asignatura no encontrada',
      );
    }

    return offering;
  }

  async create(dto: CreateCourseOfferingDto) {
    const subject = await this.prisma.subject.findUnique({
      where: {
        id: dto.subjectId,
      },
    });

    if (!subject) {
      throw new NotFoundException(
        'La asignatura no existe',
      );
    }

    if (!subject.active) {
      throw new ConflictException(
        'La asignatura está inactiva',
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

    if (academicPeriod.status !== 'ACTIVE') {
      throw new ConflictException(
        'El período académico no está activo',
      );
    }

    if (
      dto.type === 'REGULAR' &&
      subject.semesterType !== academicPeriod.semesterType
    ) {
      throw new ConflictException(
        'La asignatura no corresponde al ciclo del período académico',
      );
    }

    const existingOffering =
      await this.prisma.courseOffering.findFirst({
        where: {
          subjectId: dto.subjectId,
          academicPeriodId: dto.academicPeriodId,
        },
      });

    if (existingOffering) {
      throw new ConflictException(
        'La asignatura ya fue abierta en este período académico',
      );
    }

    return this.prisma.courseOffering.create({
      data: {
        subjectId: dto.subjectId,
        academicPeriodId: dto.academicPeriodId,
        type: dto.type,
        status: 'OPEN',
      },
      include: {
        subject: true,
        academicPeriod: true,
      },
    });
  }

  async close(id: number) {
    await this.findOne(id);

    return this.prisma.courseOffering.update({
      where: {
        id,
      },
      data: {
        status: 'CLOSED',
      },
      include: {
        subject: true,
        academicPeriod: true,
      },
    });
  }
}