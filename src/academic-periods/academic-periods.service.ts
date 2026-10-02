import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateAcademicPeriodDto } from './dto/create-academic-period.dto.js';

@Injectable()
export class AcademicPeriodsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.academicPeriod.findMany({
      orderBy: {
        startDate: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const period = await this.prisma.academicPeriod.findUnique({
      where: { id },
    });

    if (!period) {
      throw new NotFoundException(
        'Período académico no encontrado',
      );
    }

    return period;
  }

  async findActive() {
    return this.prisma.academicPeriod.findFirst({
      where: {
        status: 'ACTIVE',
      },
    });
  }

  async create(dto: CreateAcademicPeriodDto) {
    const existingPeriod = await this.prisma.academicPeriod.findUnique({
      where: {
        name: dto.name,
      },
    });

    if (existingPeriod) {
      throw new ConflictException(
        'Ya existe un período académico con ese nombre',
      );
    }

    if (new Date(dto.startDate) >= new Date(dto.endDate)) {
      throw new ConflictException(
        'La fecha de inicio debe ser anterior a la fecha de fin',
      );
    }

    return this.prisma.academicPeriod.create({
      data: {
        name: dto.name,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        semesterType: dto.semesterType,
        maxCredits: dto.maxCredits,
        regularFee: dto.regularFee,
      },
    });
  }

  async activate(id: number) {
    const period = await this.findOne(id);

    const activePeriod = await this.findActive();

    if (activePeriod && activePeriod.id !== id) {
      throw new ConflictException(
        'Ya existe otro período académico activo',
      );
    }

    if (period.status === 'CLOSED') {
      throw new ConflictException(
        'No se puede activar un período cerrado',
      );
    }

    return this.prisma.academicPeriod.update({
      where: { id },
      data: {
        status: 'ACTIVE',
      },
    });
  }

  async close(id: number) {
    const period = await this.findOne(id);

    if (period.status !== 'ACTIVE') {
      throw new ConflictException(
        'Solo se puede cerrar un período activo',
      );
    }

    return this.prisma.academicPeriod.update({
      where: { id },
      data: {
        status: 'CLOSED',
      },
    });
  }
}