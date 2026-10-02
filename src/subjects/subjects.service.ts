import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateSubjectDto } from './dto/create-subject.dto.js';

@Injectable()
export class SubjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.subject.findMany({
      orderBy: {
        id: 'asc',
      },
    });
  }

  async findOne(id: number) {
    const subject = await this.prisma.subject.findUnique({
      where: { id },
    });

    if (!subject) {
      throw new NotFoundException(
        'Asignatura no encontrada',
      );
    }

    return subject;
  }

  async create(dto: CreateSubjectDto) {
    const existingSubject = await this.prisma.subject.findUnique({
      where: {
        code: dto.code,
      },
    });

    if (existingSubject) {
      throw new ConflictException(
        'Ya existe una asignatura con ese código',
      );
    }

    return this.prisma.subject.create({
      data: {
        code: dto.code,
        name: dto.name,
        credits: dto.credits,
        semesterType: dto.semesterType,
        enrollmentCost: dto.enrollmentCost,
        monthlyCost: dto.monthlyCost,
      },
    });
  }

  async updateStatus(id: number, active: boolean) {
    await this.findOne(id);

    return this.prisma.subject.update({
      where: { id },
      data: {
        active,
      },
    });
  }
}