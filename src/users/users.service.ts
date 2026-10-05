import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        role: true,
        student: true,
        teacher: true,
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        role: true,
        student: true,
        teacher: true,
      },
    });
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      include: {
        role: true,
        student: true,
        teacher: true,
      },
      orderBy: {
        id: 'asc',
      },
    });

    return users.map(({ password, ...user }) => user);
  }

  async findSafeById(id: number) {
    const user = await this.findById(id);

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const { password, ...safeUser } = user;

    return safeUser;
  }

  async create(dto: CreateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (existingUser) {
      throw new ConflictException('El correo ya está registrado');
    }

    const role = await this.prisma.role.findUnique({
      where: {
        id: dto.roleId,
      },
    });

    if (!role) {
      throw new NotFoundException('El rol no existe');
    }

    // Los estudiantes deben registrarse únicamente
    // mediante POST /auth/register.
    if (role.name === 'ESTUDIANTE') {
      throw new ConflictException(
        'Los estudiantes deben registrarse mediante /auth/register',
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: passwordHash,
        roleId: dto.roleId,
        status: 'ACTIVE',
      },
      include: {
        role: true,
      },
    });

    const { password, ...safeUser } = user;

    return safeUser;
  }

  async createStudent(dto: {
    email: string;
    password: string;
    guardianName: string;
    guardianPhone: string;
    paymentMethod: 'CASH' | 'TRANSFER' | 'GATEWAY';
  }) {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (existingUser) {
      throw new ConflictException('El correo ya está registrado');
    }

    const studentRole = await this.prisma.role.findUnique({
      where: {
        name: 'ESTUDIANTE',
      },
    });

    if (!studentRole) {
      throw new NotFoundException(
        'El rol ESTUDIANTE no existe',
      );
    }

    const activePeriod = await this.prisma.academicPeriod.findFirst({
      where: {
        status: 'ACTIVE',
      },
      orderBy: {
        startDate: 'desc',
      },
    });

    if (!activePeriod) {
      throw new ConflictException(
        'No existe un período académico activo para registrar la matrícula',
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const enrollmentCode = `EST-${Date.now()}`;

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);

    const user = await this.prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          email: dto.email,
          password: passwordHash,
          roleId: studentRole.id,
          status: 'PENDING',
          student: {
            create: {
              enrollmentCode,
              guardianName: dto.guardianName,
              guardianPhone: dto.guardianPhone,
            },
          },
        },
        include: {
          role: true,
          student: true,
        },
      });

      await tx.financialObligation.create({
        data: {
          studentId: createdUser.student!.id,
          academicPeriodId: activePeriod.id,
          type: 'SEMESTER',
          description: `Matrícula - ${activePeriod.name}`,
          amount: activePeriod.regularFee,
          dueDate,
          status: 'PENDING',
          payments: {
            create: {
              amount: activePeriod.regularFee,
              method: dto.paymentMethod,
              status: 'PENDING',
            },
          },
        },
      });

      return createdUser;
    });

    const { password, ...safeUser } = user;

    return {
      ...safeUser,
      message:
        'Solicitud registrada. La matrícula está pendiente de verificación y aprobación.',
      academicPeriod: activePeriod.name,
      enrollmentFee: activePeriod.regularFee,
      paymentStatus: 'PENDING',
    };
  }

  async updateStatus(
    id: number,
    status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE',
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        role: true,
        student: true,
        teacher: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Un estudiante PENDING no puede convertirse directamente
    // en ACTIVE mediante el endpoint genérico.
    // Debe utilizarse /users/:id/approve.
    if (
      user.role.name === 'ESTUDIANTE' &&
      user.status === 'PENDING' &&
      status === 'ACTIVE'
    ) {
      throw new ConflictException(
        'El estudiante debe tener la matrícula pagada y ser aprobado mediante /users/:id/approve',
      );
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        status,
      },
      include: {
        role: true,
        student: true,
        teacher: true,
      },
    });

    const { password, ...safeUser } = updatedUser;

    return safeUser;
  }

  async approveStudent(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        role: true,
        student: true,
        teacher: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (user.role.name !== 'ESTUDIANTE') {
      throw new ConflictException(
        'Solo se pueden aprobar estudiantes',
      );
    }

    if (user.status !== 'PENDING') {
      throw new ConflictException(
        'El estudiante no se encuentra pendiente de aprobación',
      );
    }

    if (!user.student) {
      throw new ConflictException(
        'El usuario no tiene un registro de estudiante',
      );
    }

    const paidEnrollment = await this.prisma.financialObligation.findFirst({
      where: {
        studentId: user.student.id,
        type: 'SEMESTER',
        status: 'PAID',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!paidEnrollment) {
      throw new ConflictException(
        'No se puede aprobar al estudiante porque la matrícula todavía no está pagada',
      );
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        status: 'ACTIVE',
      },
      include: {
        role: true,
        student: true,
        teacher: true,
      },
    });

    const { password, ...safeUser } = updatedUser;

    return {
      ...safeUser,
      message: 'Estudiante aprobado correctamente',
    };
  }
}
