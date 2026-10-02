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

  const passwordHash = await bcrypt.hash(dto.password, 10);

  const enrollmentCode = `EST-${Date.now()}`;

  const user = await this.prisma.user.create({
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

  const { password, ...safeUser } = user;

  return safeUser;
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
}