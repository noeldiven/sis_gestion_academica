import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTeacherDto } from './dto/create-teacher.dto.js';

@Injectable()
export class TeachersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.teacher.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            status: true,
            role: true,
          },
        },
      },
      orderBy: {
        id: 'asc',
      },
    });
  }

  async findOne(id: number) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            status: true,
            role: true,
          },
        },
        groups: true,
      },
    });

    if (!teacher) {
      throw new NotFoundException(
        'Profesor no encontrado',
      );
    }

    return teacher;
  }

  async create(dto: CreateTeacherDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: dto.userId,
      },
      include: {
        role: true,
        teacher: true,
      },
    });

    if (!user) {
      throw new NotFoundException(
        'El usuario no existe',
      );
    }

    if (user.role.name !== 'PROFESOR') {
      throw new ConflictException(
        'El usuario no tiene el rol PROFESOR',
      );
    }

    if (user.status !== 'ACTIVE') {
      throw new ConflictException(
        'El usuario profesor no está activo',
      );
    }

    if (user.teacher) {
      throw new ConflictException(
        'El usuario ya tiene un perfil de profesor',
      );
    }

    return this.prisma.teacher.create({
      data: {
        userId: dto.userId,
        specialty: dto.specialty,
        hireDate: new Date(dto.hireDate),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            status: true,
            role: true,
          },
        },
      },
    });
  }
}